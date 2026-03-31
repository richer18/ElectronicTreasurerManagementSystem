<?php

namespace App\Http\Controllers;

use App\Models\IssuedAccountableForm;
use App\Models\RcdBatch;
use App\Models\RcdEntry;
use App\Models\RcdEntryLedger;
use App\Support\CollectorLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class RcdEntryController extends Controller
{
    private array $accountabilitySensitiveFields = [
        'issued_date',
        'fund',
        'collector',
        'type_of_receipt',
        'serial_no',
        'receipt_no_from',
        'receipt_no_to',
    ];

    private function normalizeDigitsString($value): ?string
    {
        if ($value === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $value);
        return $digits === '' ? null : $digits;
    }

    private function toInt($value): int
    {
        return (int) ltrim((string) $value, '0');
    }

    private function padReceipt(int $value, int $width): string
    {
        if ($value <= 0) {
            return '0';
        }

        return str_pad((string) $value, max(1, $width), '0', STR_PAD_LEFT);
    }

    private function normalizedString($value): string
    {
        return trim((string) ($value ?? ''));
    }

    private function applyIdentityScope($query, array $payload, bool $hasRcdSerialColumn)
    {
        $query
            ->whereDate('issued_date', $payload['issued_date'])
            ->where('collector', $payload['collector'])
            ->where('type_of_receipt', $payload['type_of_receipt'])
            ->where('receipt_no_from', $payload['receipt_no_from'])
            ->where('receipt_no_to', $payload['receipt_no_to']);

        if ($hasRcdSerialColumn) {
            $serial = $this->normalizedString($payload['serial_no'] ?? null);

            if ($serial === '') {
                $query->where(function ($serialQuery) {
                    $serialQuery
                        ->whereNull('serial_no')
                        ->orWhere('serial_no', '');
                });
            } else {
                $query->where('serial_no', $serial);
            }
        }

        return $query;
    }

    private function findOverlappingEntry(array $payload, bool $hasRcdSerialColumn, ?int $excludeId = null): ?RcdEntry
    {
        $query = RcdEntry::query()
            ->whereDate('issued_date', $payload['issued_date'])
            ->where('collector', $payload['collector'])
            ->where('type_of_receipt', $payload['type_of_receipt']);

        if ($hasRcdSerialColumn) {
            $serial = $this->normalizedString($payload['serial_no'] ?? null);

            if ($serial === '') {
                $query->where(function ($serialQuery) {
                    $serialQuery
                        ->whereNull('serial_no')
                        ->orWhere('serial_no', '');
                });
            } else {
                $query->where('serial_no', $serial);
            }
        }

        if ($excludeId !== null) {
            $query->where('id', '<>', $excludeId);
        }

        $from = $this->toInt($payload['receipt_no_from']);
        $to = $this->toInt($payload['receipt_no_to']);

        return $query
            ->whereRaw('CAST(receipt_no_from AS UNSIGNED) <= ?', [$to])
            ->whereRaw('CAST(receipt_no_to AS UNSIGNED) >= ?', [$from])
            ->orderByDesc('id')
            ->first();
    }

    private function hasAccountabilityFieldChanges(RcdEntry $entry, array $validated, bool $hasRcdSerialColumn): bool
    {
        $current = [
            'issued_date' => Carbon::parse($entry->issued_date)->toDateString(),
            'fund' => $this->normalizedString($entry->fund ?? null),
            'collector' => $this->normalizedString($entry->collector ?? null),
            'type_of_receipt' => $this->normalizedString($entry->type_of_receipt ?? null),
            'serial_no' => $hasRcdSerialColumn ? $this->normalizedString($entry->serial_no ?? null) : '',
            'receipt_no_from' => $this->normalizedString($entry->receipt_no_from ?? null),
            'receipt_no_to' => $this->normalizedString($entry->receipt_no_to ?? null),
        ];

        $incoming = [
            'issued_date' => Carbon::parse($validated['issued_date'])->toDateString(),
            'fund' => $this->normalizedString($validated['fund'] ?? null),
            'collector' => $this->normalizedString($validated['collector'] ?? null),
            'type_of_receipt' => $this->normalizedString($validated['type_of_receipt'] ?? null),
            'serial_no' => $hasRcdSerialColumn ? $this->normalizedString($validated['serial_no'] ?? null) : '',
            'receipt_no_from' => $this->normalizedString($validated['receipt_no_from'] ?? null),
            'receipt_no_to' => $this->normalizedString($validated['receipt_no_to'] ?? null),
        ];

        foreach ($this->accountabilitySensitiveFields as $field) {
            if (($current[$field] ?? '') !== ($incoming[$field] ?? '')) {
                return true;
            }
        }

        return false;
    }

    private function batchStatusForEntryStatus(string $status): string
    {
        return match (strtolower(trim($status))) {
            'deposit' => 'Deposited',
            'approve' => 'Approved',
            'remit' => 'Submitted',
            default => 'Draft',
        };
    }

    private function syncBatchForCollectorDate(string $collector, string $issuedDate): ?RcdBatch
    {
        $reportDate = Carbon::parse($issuedDate)->toDateString();
        $entries = RcdEntry::query()
            ->whereDate('issued_date', $reportDate)
            ->where('collector', $collector)
            ->orderBy('id')
            ->get();

        if ($entries->isEmpty()) {
            RcdBatch::query()
                ->whereDate('report_date', $reportDate)
                ->where('collector', $collector)
                ->delete();

            return null;
        }

        $batchStatus = 'Draft';
        foreach ($entries as $entry) {
            $candidate = $this->batchStatusForEntryStatus((string) ($entry->status ?? ''));
            if ($candidate === 'Deposited') {
                $batchStatus = 'Deposited';
                break;
            }
            if ($candidate === 'Approved') {
                $batchStatus = 'Approved';
                continue;
            }
            if ($candidate === 'Submitted' && $batchStatus === 'Draft') {
                $batchStatus = 'Submitted';
            }
        }

        $batch = RcdBatch::firstOrNew([
            'report_date' => $reportDate,
            'collector' => $collector,
        ]);

        $batch->status = $batchStatus;
        $batch->total_amount = round((float) $entries->sum('total'), 2);
        $batch->entry_count = (int) $entries->count();

        if ($batchStatus === 'Submitted' && !$batch->submitted_at) {
            $batch->submitted_at = now();
        }
        if (in_array($batchStatus, ['Approved', 'Deposited'], true) && !$batch->submitted_at) {
            $batch->submitted_at = now();
        }
        if ($batchStatus === 'Approved' && !$batch->reviewed_at) {
            $batch->reviewed_at = now();
        }
        if ($batchStatus === 'Deposited') {
            if (!$batch->submitted_at) {
                $batch->submitted_at = now();
            }
            if (!$batch->reviewed_at) {
                $batch->reviewed_at = now();
            }
            if (!$batch->deposited_at) {
                $batch->deposited_at = now();
            }
        }

        $batch->save();

        RcdEntryLedger::query()
            ->whereDate('issued_date', $reportDate)
            ->where('collector', $collector)
            ->update(['batch_id' => $batch->id]);

        return $batch;
    }

    private function syncLedgerForEntry(RcdEntry $entry, array $validated, ?IssuedAccountableForm $issuedForm, string $flowMode = 'same_day'): void
    {
        $reportDate = Carbon::parse($validated['issued_date'])->toDateString();
        $batch = $this->syncBatchForCollectorDate($validated['collector'], $reportDate);
        $issuedQty = ($this->toInt($validated['receipt_no_to']) - $this->toInt($validated['receipt_no_from'])) + 1;
        $existingLedger = RcdEntryLedger::query()->where('rcd_entry_id', $entry->id)->first();

        RcdEntryLedger::updateOrCreate(
            ['rcd_entry_id' => $entry->id],
            [
                'issued_accountable_form_id' => $issuedForm?->ID ?? $existingLedger?->issued_accountable_form_id,
                'batch_id' => $batch?->id,
                'flow_mode' => $flowMode,
                'issued_date' => $reportDate,
                'collector' => $validated['collector'],
                'fund' => $validated['fund'] ?? null,
                'type_of_receipt' => $validated['type_of_receipt'],
                'serial_no' => $validated['serial_no'] ?? null,
                'receipt_no_from' => $validated['receipt_no_from'],
                'receipt_no_to' => $validated['receipt_no_to'],
                'issued_qty' => $issuedQty,
                'total' => (float) $validated['total'],
                'status' => $validated['status'],
                'balance_after_qty' => (int) ($issuedForm?->Stock ?? $existingLedger?->balance_after_qty ?? 0),
                'balance_after_from' => (string) ($issuedForm?->Ending_Balance_receipt_from ?? $existingLedger?->balance_after_from ?? '0'),
                'balance_after_to' => (string) ($issuedForm?->Ending_Balance_receipt_to ?? $existingLedger?->balance_after_to ?? '0'),
            ]
        );
    }

    private function getIssuedFormBaseRange(object $issuedForm): array
    {
        $beginQty = (int) ($issuedForm->Begginning_Balance_receipt_qty ?? 0);
        $beginFromRaw = (string) ($issuedForm->Begginning_Balance_receipt_from ?? '0');
        $beginToRaw = (string) ($issuedForm->Begginning_Balance_receipt_to ?? '0');
        $beginFrom = $this->toInt($beginFromRaw);
        $beginTo = $this->toInt($beginToRaw);

        if ($beginQty > 0 && $beginFrom > 0 && $beginTo >= $beginFrom) {
            return [
                'qty' => $beginQty,
                'from' => $beginFrom,
                'to' => $beginTo,
                'from_raw' => $beginFromRaw,
                'to_raw' => $beginToRaw,
            ];
        }

        $rangeQty = (int) ($issuedForm->Receipt_Range_qty ?? 0);
        $rangeFromRaw = (string) ($issuedForm->Receipt_Range_From ?? '0');
        $rangeToRaw = (string) ($issuedForm->Receipt_Range_To ?? '0');
        $rangeFrom = $this->toInt($rangeFromRaw);
        $rangeTo = $this->toInt($rangeToRaw);

        return [
            'qty' => $rangeQty,
            'from' => $rangeFrom,
            'to' => $rangeTo,
            'from_raw' => $rangeFromRaw,
            'to_raw' => $rangeToRaw,
        ];
    }

    private function recalculateIssuedFormState(int $issuedFormId): void
    {
        $issuedForm = DB::table('issued_accountable_forms')->where('ID', $issuedFormId)->first();
        if (!$issuedForm) {
            return;
        }

        $base = $this->getIssuedFormBaseRange($issuedForm);
        $baseQty = (int) ($base['qty'] ?? 0);
        $baseFrom = (int) ($base['from'] ?? 0);
        $baseTo = (int) ($base['to'] ?? 0);
        $seriesWidth = max(
            strlen((string) ($base['from_raw'] ?? '0')),
            strlen((string) ($base['to_raw'] ?? '0'))
        );

        $ledgers = RcdEntryLedger::query()
            ->where('issued_accountable_form_id', $issuedFormId)
            ->orderByRaw('CAST(receipt_no_from AS UNSIGNED)')
            ->get();

        if ($baseQty <= 0 || $baseFrom <= 0 || $baseTo < $baseFrom || $ledgers->isEmpty()) {
            DB::table('issued_accountable_forms')
                ->where('ID', $issuedFormId)
                ->update([
                    'Ending_Balance_receipt_qty' => $baseQty,
                    'Ending_Balance_receipt_from' => $baseQty > 0 ? $this->padReceipt($baseFrom, $seriesWidth) : '0',
                    'Ending_Balance_receipt_to' => $baseQty > 0 ? $this->padReceipt($baseTo, $seriesWidth) : '0',
                    'Issued_receipt_qty' => 0,
                    'Issued_receipt_from' => '0',
                    'Issued_receipt_to' => '0',
                    'Stock' => $baseQty,
                ]);
            return;
        }

        $maxIssuedTo = $baseFrom - 1;
        $latestLedger = null;
        foreach ($ledgers as $ledger) {
            $ledgerTo = $this->toInt($ledger->receipt_no_to);
            if ($ledgerTo > $maxIssuedTo) {
                $maxIssuedTo = $ledgerTo;
                $latestLedger = $ledger;
            }
        }

        if ($maxIssuedTo < $baseFrom) {
            $newEndingQty = $baseQty;
            $newEndingFrom = $baseFrom;
            $newEndingTo = $baseTo;
        } else {
            $consumedQty = max(0, ($maxIssuedTo - $baseFrom) + 1);
            $newEndingQty = max(0, $baseQty - $consumedQty);
            $newEndingFrom = $newEndingQty > 0 ? $maxIssuedTo + 1 : 0;
            $newEndingTo = $newEndingQty > 0 ? $baseTo : 0;
        }

        DB::table('issued_accountable_forms')
            ->where('ID', $issuedFormId)
            ->update([
                'Ending_Balance_receipt_qty' => $newEndingQty,
                'Ending_Balance_receipt_from' => $newEndingQty > 0 ? $this->padReceipt($newEndingFrom, $seriesWidth) : '0',
                'Ending_Balance_receipt_to' => $newEndingQty > 0 ? $this->padReceipt($newEndingTo, $seriesWidth) : '0',
                'Issued_receipt_qty' => (int) ($latestLedger->issued_qty ?? 0),
                'Issued_receipt_from' => $latestLedger ? (string) $latestLedger->receipt_no_from : '0',
                'Issued_receipt_to' => $latestLedger ? (string) $latestLedger->receipt_no_to : '0',
                'Stock' => $newEndingQty,
            ]);

        $updatedIssuedForm = DB::table('issued_accountable_forms')->where('ID', $issuedFormId)->first();
        if ($updatedIssuedForm) {
            RcdEntryLedger::query()
                ->where('issued_accountable_form_id', $issuedFormId)
                ->update([
                    'balance_after_qty' => (int) ($updatedIssuedForm->Stock ?? 0),
                    'balance_after_from' => (string) ($updatedIssuedForm->Ending_Balance_receipt_from ?? '0'),
                    'balance_after_to' => (string) ($updatedIssuedForm->Ending_Balance_receipt_to ?? '0'),
                ]);
        }
    }

    public function index(Request $request)
    {
        $query = RcdEntry::query();

        if ($request->filled('month')) {
            $query->whereMonth('issued_date', (int) $request->month);
        }

        if ($request->filled('year')) {
            $query->whereYear('issued_date', (int) $request->year);
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->search);
            $query->where(function ($q) use ($search) {
                $q->where('collector', 'like', "%{$search}%")
                  ->orWhere('type_of_receipt', 'like', "%{$search}%")
                  ->orWhere('receipt_no_from', 'like', "%{$search}%")
                  ->orWhere('receipt_no_to', 'like', "%{$search}%")
                  ->orWhere('status', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderByDesc('issued_date')->orderByDesc('id')->get()
        );
    }

    public function store(Request $request)
    {
        $hasRcdSerialColumn = Schema::hasColumn('rcd_issued_form', 'serial_no');

        $payload = [
            'issued_date' => $request->input('issued_date', $request->input('Date')),
            'fund' => $request->input('fund', $request->input('Fund')),
            'collector' => $request->input('collector', $request->input('Collector')),
            'type_of_receipt' => $request->input('type_of_receipt', $request->input('Type_of_Receipt')),
            'serial_no' => $hasRcdSerialColumn ? $request->input('serial_no', $request->input('Serial_No')) : null,
            'receipt_no_from' => $this->normalizeDigitsString($request->input('receipt_no_from', $request->input('Receipt_No_From'))),
            'receipt_no_to' => $this->normalizeDigitsString($request->input('receipt_no_to', $request->input('Receipt_No_To'))),
            'total' => $request->input('total', $request->input('Total')),
            'status' => $request->input('status', $request->input('Status', 'Not Remit')),
        ];

        $validated = Validator::make($payload, [
            'issued_date' => 'required|date',
            'fund' => 'nullable|string|max:100',
            'collector' => 'required|string|max:100',
            'type_of_receipt' => 'required|string|max:50',
            'serial_no' => $hasRcdSerialColumn ? 'nullable|string|max:100' : 'nullable',
            'receipt_no_from' => 'required|string|regex:/^\d+$/',
            'receipt_no_to' => 'required|string|regex:/^\d+$/',
            'total' => 'required|numeric|min:0',
            'status' => 'required|in:Remit,Not Remit,Deposit,Approve,Purchase',
        ])->validate();

        if ($this->toInt($validated['receipt_no_to']) < $this->toInt($validated['receipt_no_from'])) {
            return response()->json([
                'message' => 'Receipt no. to must be greater than or equal to receipt no. from.',
            ], 422);
        }

        $duplicateQuery = RcdEntry::query();
        $this->applyIdentityScope($duplicateQuery, $validated, $hasRcdSerialColumn);
        $hasDuplicate = $duplicateQuery->exists();

        if ($hasDuplicate) {
            return response()->json([
                'message' => 'Entry already exists for this date, collector, serial number, receipt type, and receipt range.',
            ], 409);
        }

        $overlappingEntry = $this->findOverlappingEntry($validated, $hasRcdSerialColumn);

        if ($overlappingEntry) {
            return response()->json([
                'message' => 'Receipt range overlaps an existing entry for this date, collector, serial number, and receipt type.',
            ], 422);
        }

        return DB::transaction(function () use ($validated) {
            $entryData = $validated;
            if (!Schema::hasColumn('rcd_issued_form', 'fund')) {
                unset($entryData['fund']);
            }
            if (!Schema::hasColumn('rcd_issued_form', 'serial_no')) {
                unset($entryData['serial_no']);
            }
            $entry = RcdEntry::create($entryData);
            $entryDate = Carbon::parse($validated['issued_date'])->toDateString();
            $hasUsageBeforeDate = IssuedAccountableForm::query()
                ->where('Collector', $validated['collector'])
                ->where('Form_Type', $validated['type_of_receipt'])
                ->when(!empty($validated['serial_no']), function ($query) use ($validated) {
                    $query->where('Serial_No', $validated['serial_no']);
                })
                ->where('Status', 'ISSUED')
                ->whereDate('Date', '<', $entryDate)
                ->where('Issued_receipt_qty', '>', 0)
                ->exists();

            // Prefer the row for the same date (if exists).
            $issuedForm = IssuedAccountableForm::query()
                ->where('Collector', $validated['collector'])
                ->where('Form_Type', $validated['type_of_receipt'])
                ->when(!empty($validated['serial_no']), function ($query) use ($validated) {
                    $query->where('Serial_No', $validated['serial_no']);
                })
                ->where('Status', 'ISSUED')
                ->whereDate('Date', $entryDate)
                ->orderByDesc('ID')
                ->first();

            $flowMode = 'same_day';

            // If no same-date row exists:
            // - first usage flow: update latest assignment row directly
            // - next-day flow after prior usage: create a carry-over row
            if (!$issuedForm) {
                $previousIssuedForm = IssuedAccountableForm::query()
                    ->where('Collector', $validated['collector'])
                    ->where('Form_Type', $validated['type_of_receipt'])
                    ->when(!empty($validated['serial_no']), function ($query) use ($validated) {
                        $query->where('Serial_No', $validated['serial_no']);
                    })
                    ->where('Status', 'ISSUED')
                    ->whereDate('Date', '<=', $entryDate)
                    ->orderByDesc('Date')
                    ->orderByDesc('ID')
                    ->first();

                if (!$previousIssuedForm) {
                    abort(response()->json([
                        'message' => 'No assigned accountable form found for this collector and receipt type.',
                    ], 404));
                }

                $carryQty = (int) ($previousIssuedForm->Stock ?? 0);
                if ($carryQty <= 0) {
                    abort(response()->json([
                        'message' => 'No available stock to carry over for this collector and receipt type.',
                    ], 422));
                }

                if (!$hasUsageBeforeDate) {
                    // First usage for this collector/type: update the assignment row itself.
                    $flowMode = 'first_use_existing_assignment';
                    $issuedForm = $previousIssuedForm;
                } else {
                    $flowMode = 'carry_over_new_row';
                    $prevEndingFromRaw = (string) ($previousIssuedForm->Ending_Balance_receipt_from ?? '0');
                    $prevEndingToRaw = (string) ($previousIssuedForm->Ending_Balance_receipt_to ?? '0');
                    $prevRangeFromRaw = (string) ($previousIssuedForm->Receipt_Range_From ?? '0');
                    $prevRangeToRaw = (string) ($previousIssuedForm->Receipt_Range_To ?? '0');

                    $prevEndingFrom = $this->toInt($prevEndingFromRaw);
                    $prevEndingTo = $this->toInt($prevEndingToRaw);
                    $prevRangeFrom = $this->toInt($prevRangeFromRaw);
                    $prevRangeTo = $this->toInt($prevRangeToRaw);

                    $carryFromRaw = ($prevEndingFrom > 0 && $prevEndingTo >= $prevEndingFrom)
                        ? $prevEndingFromRaw
                        : $prevRangeFromRaw;
                    $carryToRaw = ($prevEndingTo > 0 && $prevEndingTo >= $this->toInt($carryFromRaw))
                        ? $prevEndingToRaw
                        : $prevRangeToRaw;

                    $issuedForm = IssuedAccountableForm::create([
                        'Date' => $entryDate,
                        'Fund' => $validated['fund'] ?? $previousIssuedForm->Fund ?? '100 General Fund',
                        'Collector' => $previousIssuedForm->Collector,
                        'Form_Type' => $previousIssuedForm->Form_Type,
                        'Serial_No' => $previousIssuedForm->Serial_No,
                        // Next-day row should keep receipt range fields as zero.
                        'Receipt_Range_qty' => 0,
                        'Receipt_Range_From' => 0,
                        'Receipt_Range_To' => 0,
                        'Begginning_Balance_receipt_qty' => $carryQty,
                        'Begginning_Balance_receipt_from' => $carryFromRaw,
                        'Begginning_Balance_receipt_to' => $carryToRaw,
                        'Ending_Balance_receipt_qty' => $carryQty,
                        'Ending_Balance_receipt_from' => $carryFromRaw,
                        'Ending_Balance_receipt_to' => $carryToRaw,
                        'Issued_receipt_qty' => 0,
                        'Issued_receipt_from' => 0,
                        'Issued_receipt_to' => 0,
                        'Stock' => $carryQty,
                        'Date_Issued' => $previousIssuedForm->Date_Issued ?? now(),
                        'Status' => 'ISSUED',
                    ]);
                }
            }


            $fromRaw = (string) $validated['receipt_no_from'];
            $toRaw = (string) $validated['receipt_no_to'];
            $from = $this->toInt($fromRaw);
            $to = $this->toInt($toRaw);
            $issuedQty = ($to - $from) + 1;

            $currentStock = (int) ($issuedForm->Stock ?? 0);

            $endingFromRaw = (string) ($issuedForm->Ending_Balance_receipt_from ?? '0');
            $endingToRaw = (string) ($issuedForm->Ending_Balance_receipt_to ?? '0');
            $endingFrom = $this->toInt($endingFromRaw);
            $endingTo = $this->toInt($endingToRaw);
            $hasValidEndingRange = $endingFrom > 0 && $endingTo >= $endingFrom;
            $beginFromRaw = (string) ($issuedForm->Begginning_Balance_receipt_from ?? '0');
            $beginToRaw = (string) ($issuedForm->Begginning_Balance_receipt_to ?? '0');
            $beginFrom = $this->toInt($beginFromRaw);
            $beginTo = $this->toInt($beginToRaw);
            $hasValidBeginningRange = $beginFrom > 0 && $beginTo >= $beginFrom;
            $rangeFromRaw = (string) ($issuedForm->Receipt_Range_From ?? '0');
            $rangeToRaw = (string) ($issuedForm->Receipt_Range_To ?? '0');
            $rangeFrom = $this->toInt($rangeFromRaw);
            $rangeTo = $this->toInt($rangeToRaw);

            $balanceFrom = $hasValidEndingRange
                ? $endingFrom
                : ($hasValidBeginningRange ? $beginFrom : $rangeFrom);
            $balanceTo = $hasValidEndingRange
                ? $endingTo
                : ($hasValidBeginningRange ? $beginTo : $rangeTo);

            if ($from < $balanceFrom || $to > $balanceTo) {
                abort(response()->json([
                    'message' => 'Receipt range is outside the current assigned balance range.',
                ], 422));
            }

            if ($issuedQty > $currentStock) {
                abort(response()->json([
                    'message' => 'Issued quantity exceeds available stock for this assignment.',
                ], 422));
            }

            $endingQty = $currentStock - $issuedQty;
            $seriesWidth = max(
                strlen($fromRaw),
                strlen($toRaw),
                strlen($rangeFromRaw),
                strlen($rangeToRaw),
                strlen($beginFromRaw),
                strlen($beginToRaw),
                strlen($endingFromRaw),
                strlen($endingToRaw)
            );
            $newEndingFrom = $endingQty > 0 ? $to + 1 : 0;
            $newEndingTo = $endingQty > 0 ? $balanceTo : 0;
            $issuedFromFormatted = $this->padReceipt($from, $seriesWidth);
            $issuedToFormatted = $this->padReceipt($to, $seriesWidth);
            $newEndingFromFormatted = $endingQty > 0 ? $this->padReceipt($newEndingFrom, $seriesWidth) : '0';
            $newEndingToFormatted = $endingQty > 0 ? $this->padReceipt($newEndingTo, $seriesWidth) : '0';

            $issuedFormUpdateData = [
                'Ending_Balance_receipt_qty' => $endingQty,
                'Ending_Balance_receipt_from' => $newEndingFromFormatted,
                'Ending_Balance_receipt_to' => $newEndingToFormatted,
                'Issued_receipt_qty' => $issuedQty,
                'Issued_receipt_from' => $issuedFromFormatted,
                'Issued_receipt_to' => $issuedToFormatted,
                'Stock' => $endingQty,
            ];
            if (Schema::hasColumn('issued_accountable_forms', 'Fund')) {
                $issuedFormUpdateData['Fund'] = $validated['fund'] ?? null;
            }
            DB::table('issued_accountable_forms')
                ->where('ID', $issuedForm->ID)
                ->update($issuedFormUpdateData);

            $updatedIssuedForm = DB::table('issued_accountable_forms')
                ->where('ID', $issuedForm->ID)
                ->first();

            CollectorLogger::write($validated['collector'], 'rcd_entry_saved', [
                'entry_id' => $entry->id,
                'issued_form_id' => $issuedForm->ID,
                'flow_mode' => $flowMode,
                'entry_date' => $entryDate,
                'type_of_receipt' => $validated['type_of_receipt'],
                'issued_from' => $from,
                'issued_to' => $to,
                'issued_qty' => $issuedQty,
                'ending_qty' => $endingQty,
                'ending_from' => $newEndingFrom,
                'ending_to' => $newEndingTo,
                'stock' => $endingQty,
            ]);

            $entry->refresh();
            $this->syncLedgerForEntry($entry, $validated, $issuedForm, $flowMode);

            return response()->json([
                'message' => 'Entry saved successfully.',
                'entry' => $entry,
                'issued_form' => $updatedIssuedForm,
            ], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $entry = RcdEntry::find($id);
        if (!$entry) {
            return response()->json(['message' => 'Entry not found.'], 404);
        }
        $hasRcdSerialColumn = Schema::hasColumn('rcd_issued_form', 'serial_no');

        $payload = [
            'issued_date' => $request->input('issued_date', $request->input('Date', $entry->issued_date)),
            'fund' => $request->input('fund', $request->input('Fund', $entry->fund)),
            'collector' => $request->input('collector', $request->input('Collector', $entry->collector)),
            'type_of_receipt' => $request->input('type_of_receipt', $request->input('Type_of_Receipt', $entry->type_of_receipt)),
            'serial_no' => $hasRcdSerialColumn ? $request->input('serial_no', $request->input('Serial_No', $entry->serial_no)) : null,
            'receipt_no_from' => $this->normalizeDigitsString($request->input('receipt_no_from', $request->input('Receipt_No_From', $entry->receipt_no_from))),
            'receipt_no_to' => $this->normalizeDigitsString($request->input('receipt_no_to', $request->input('Receipt_No_To', $entry->receipt_no_to))),
            'total' => $request->input('total', $request->input('Total', $entry->total)),
            'status' => $request->input('status', $request->input('Status', $entry->status ?? 'Not Remit')),
        ];

        $validated = Validator::make($payload, [
            'issued_date' => 'required|date',
            'fund' => 'nullable|string|max:100',
            'collector' => 'required|string|max:100',
            'type_of_receipt' => 'required|string|max:50',
            'serial_no' => $hasRcdSerialColumn ? 'nullable|string|max:100' : 'nullable',
            'receipt_no_from' => 'required|string|regex:/^\d+$/',
            'receipt_no_to' => 'required|string|regex:/^\d+$/',
            'total' => 'required|numeric|min:0',
            'status' => 'required|in:Remit,Not Remit,Deposit,Approve,Purchase',
        ])->validate();

        if ($this->toInt($validated['receipt_no_to']) < $this->toInt($validated['receipt_no_from'])) {
            return response()->json([
                'message' => 'Receipt no. to must be greater than or equal to receipt no. from.',
            ], 422);
        }

        $duplicateQuery = RcdEntry::query()->where('id', '<>', $entry->id);
        $this->applyIdentityScope($duplicateQuery, $validated, $hasRcdSerialColumn);
        if ($duplicateQuery->exists()) {
            return response()->json([
                'message' => 'Another entry already exists for this date, collector, serial number, receipt type, and receipt range.',
            ], 409);
        }

        $overlappingEntry = $this->findOverlappingEntry($validated, $hasRcdSerialColumn, (int) $entry->id);
        if ($overlappingEntry) {
            return response()->json([
                'message' => 'Receipt range overlaps an existing entry for this date, collector, serial number, and receipt type.',
            ], 422);
        }

        if ($this->hasAccountabilityFieldChanges($entry, $validated, $hasRcdSerialColumn)) {
            return response()->json([
                'message' => 'This edit changes accountability fields. To protect stock balances, create a replacement entry instead of changing date, collector, receipt type, serial number, fund, or receipt range.',
            ], 422);
        }

        $previousDate = Carbon::parse($entry->issued_date)->toDateString();
        $previousCollector = $entry->collector;
        $beforeState = [
            'issued_date' => Carbon::parse($entry->issued_date)->toDateString(),
            'fund' => $entry->fund ?? null,
            'collector' => $entry->collector,
            'type_of_receipt' => $entry->type_of_receipt,
            'serial_no' => $entry->serial_no ?? '',
            'receipt_no_from' => $entry->receipt_no_from,
            'receipt_no_to' => $entry->receipt_no_to,
            'total' => $entry->total,
            'status' => $entry->status,
        ];
        $performedBy = $request->input('performed_by');
        $updateData = $validated;
        if (!Schema::hasColumn('rcd_issued_form', 'fund')) {
            unset($updateData['fund']);
        }
        if (!Schema::hasColumn('rcd_issued_form', 'serial_no')) {
            unset($updateData['serial_no']);
        }
        $entry->update($updateData);

        CollectorLogger::write($validated['collector'], 'rcd_entry_updated', [
            'entry_id' => $entry->id,
            'performed_by' => $performedBy,
            'before' => $beforeState,
            'after' => [
                'issued_date' => $validated['issued_date'],
                'fund' => $validated['fund'] ?? null,
                'collector' => $validated['collector'],
                'type_of_receipt' => $validated['type_of_receipt'],
                'serial_no' => $validated['serial_no'] ?? '',
                'receipt_no_from' => $validated['receipt_no_from'],
                'receipt_no_to' => $validated['receipt_no_to'],
                'total' => $validated['total'],
                'status' => $validated['status'],
            ],
        ]);

        $this->syncBatchForCollectorDate($previousCollector, $previousDate);
        $this->syncLedgerForEntry($entry->fresh(), $validated, null, 'status_update');

        return response()->json([
            'message' => 'Entry updated successfully.',
            'entry' => $entry->fresh(),
        ]);
    }

    public function destroy(int $id)
    {
        $entry = RcdEntry::find($id);
        if (!$entry) {
            return response()->json(['message' => 'Entry not found.'], 404);
        }

        $entryDate = Carbon::parse($entry->issued_date)->toDateString();
        $collector = $entry->collector;
        $deletedState = [
            'issued_date' => $entryDate,
            'fund' => $entry->fund ?? null,
            'collector' => $entry->collector,
            'type_of_receipt' => $entry->type_of_receipt,
            'serial_no' => $entry->serial_no ?? '',
            'receipt_no_from' => $entry->receipt_no_from,
            'receipt_no_to' => $entry->receipt_no_to,
            'total' => $entry->total,
            'status' => $entry->status,
        ];
        $performedBy = request()->input('performed_by');
        $ledger = RcdEntryLedger::query()->where('rcd_entry_id', $entry->id)->first();

        DB::transaction(function () use ($entry, $ledger, $collector, $entryDate) {
            $issuedFormId = $ledger?->issued_accountable_form_id;

            if ($ledger) {
                $ledger->delete();
            }

            $entry->delete();

            if ($issuedFormId) {
                $this->recalculateIssuedFormState((int) $issuedFormId);
            }

            $this->syncBatchForCollectorDate($collector, $entryDate);
        });

        CollectorLogger::write($collector, 'rcd_entry_deleted', [
            'entry_id' => $id,
            'performed_by' => $performedBy,
            'deleted_entry' => $deletedState,
        ]);

        return response()->json([
            'message' => 'Entry deleted successfully.',
        ]);
    }
}
