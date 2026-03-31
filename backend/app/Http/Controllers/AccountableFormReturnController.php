<?php

namespace App\Http\Controllers;

use App\Models\AccountableFormReturn;
use App\Models\IssuedAccountableForm;
use App\Support\CollectorLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AccountableFormReturnController extends Controller
{
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

    private function resolveAvailableRange(IssuedAccountableForm $issuedForm): array
    {
        $endingFromRaw = (string) ($issuedForm->Ending_Balance_receipt_from ?? '0');
        $endingToRaw = (string) ($issuedForm->Ending_Balance_receipt_to ?? '0');
        $endingQty = (int) ($issuedForm->Ending_Balance_receipt_qty ?? 0);
        $endingFrom = $this->toInt($endingFromRaw);
        $endingTo = $this->toInt($endingToRaw);

        if ($endingQty > 0 && $endingFrom > 0 && $endingTo >= $endingFrom) {
            return [
                'qty' => $endingQty,
                'from' => $endingFrom,
                'to' => $endingTo,
                'from_raw' => $endingFromRaw,
                'to_raw' => $endingToRaw,
            ];
        }

        $beginFromRaw = (string) ($issuedForm->Begginning_Balance_receipt_from ?? '0');
        $beginToRaw = (string) ($issuedForm->Begginning_Balance_receipt_to ?? '0');
        $beginQty = (int) ($issuedForm->Begginning_Balance_receipt_qty ?? 0);
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

        $rangeFromRaw = (string) ($issuedForm->Receipt_Range_From ?? '0');
        $rangeToRaw = (string) ($issuedForm->Receipt_Range_To ?? '0');
        $rangeQty = (int) ($issuedForm->Receipt_Range_qty ?? 0);
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

    public function index(Request $request)
    {
        $query = AccountableFormReturn::query();

        if ($request->filled('month')) {
            $query->whereMonth('return_date', (int) $request->month);
        }

        if ($request->filled('year')) {
            $query->whereYear('return_date', (int) $request->year);
        }

        return response()->json(
            $query->orderByDesc('return_date')->orderByDesc('id')->get()
        );
    }

    public function store(Request $request)
    {
        $payload = [
            'issued_accountable_form_id' => $request->input('issued_accountable_form_id'),
            'return_date' => $request->input('return_date'),
            'returned_receipt_from' => $this->normalizeDigitsString($request->input('returned_receipt_from')),
            'returned_receipt_to' => $this->normalizeDigitsString($request->input('returned_receipt_to')),
            'processed_by' => $request->input('processed_by'),
            'returned_to' => $request->input('returned_to'),
            'custodian_received_by' => $request->input('custodian_received_by'),
            'return_signature_reference' => $request->input('return_signature_reference'),
            'logbook_reference_no' => $request->input('logbook_reference_no'),
            'remarks' => $request->input('remarks'),
        ];

        $validated = validator($payload, [
            'issued_accountable_form_id' => 'required|integer',
            'return_date' => 'required|date',
            'returned_receipt_from' => 'required|string|regex:/^\d+$/',
            'returned_receipt_to' => 'required|string|regex:/^\d+$/',
            'processed_by' => 'nullable|string|max:255',
            'returned_to' => 'nullable|string|max:255',
            'custodian_received_by' => 'nullable|string|max:255',
            'return_signature_reference' => 'nullable|string|max:255',
            'logbook_reference_no' => 'nullable|string|max:255',
            'remarks' => 'nullable|string|max:2000',
        ])->validate();

        if ($this->toInt($validated['returned_receipt_to']) < $this->toInt($validated['returned_receipt_from'])) {
            return response()->json([
                'message' => 'Returned receipt to must be greater than or equal to returned receipt from.',
            ], 422);
        }

        try {
            $returnRecord = DB::transaction(function () use ($validated) {
                /** @var IssuedAccountableForm $issuedForm */
                $issuedForm = IssuedAccountableForm::query()->lockForUpdate()->findOrFail($validated['issued_accountable_form_id']);
                $available = $this->resolveAvailableRange($issuedForm);

                if (($available['qty'] ?? 0) <= 0 || ($available['from'] ?? 0) <= 0) {
                    throw ValidationException::withMessages([
                        'returned_receipt_from' => 'This accountable form has no remaining balance to return.',
                    ]);
                }

                $returnFrom = $this->toInt($validated['returned_receipt_from']);
                $returnTo = $this->toInt($validated['returned_receipt_to']);
                $availableFrom = (int) $available['from'];
                $availableTo = (int) $available['to'];

                if ($returnFrom < $availableFrom || $returnTo > $availableTo) {
                    throw ValidationException::withMessages([
                        'returned_receipt_from' => "Allowed return range is {$available['from_raw']} to {$available['to_raw']}.",
                    ]);
                }

                $returnedQty = ($returnTo - $returnFrom) + 1;
                $stockBefore = (int) ($issuedForm->Stock ?? $available['qty']);
                if ($returnedQty > $stockBefore) {
                    throw ValidationException::withMessages([
                        'returned_receipt_from' => 'Returned quantity cannot be greater than current stock.',
                    ]);
                }

                $seriesWidth = max(
                    strlen((string) $available['from_raw']),
                    strlen((string) $available['to_raw'])
                );
                $remainingQty = max(0, $stockBefore - $returnedQty);
                $newEndingFrom = $remainingQty > 0 ? $this->padReceipt($returnTo + 1, $seriesWidth) : '0';
                $newEndingTo = $remainingQty > 0 ? (string) $available['to_raw'] : '0';
                $newStatus = $remainingQty > 0 ? 'PARTIALLY_RETURNED' : 'RETURNED';

                $returnRecord = AccountableFormReturn::create([
                    'issued_accountable_form_id' => (int) $issuedForm->ID,
                    'return_date' => $validated['return_date'],
                    'collector' => (string) ($issuedForm->Collector ?? ''),
                    'fund' => $issuedForm->Fund ?? null,
                    'form_type' => (string) ($issuedForm->Form_Type ?? ''),
                    'serial_no' => (string) ($issuedForm->Serial_No ?? ''),
                    'returned_receipt_from' => $validated['returned_receipt_from'],
                    'returned_receipt_to' => $validated['returned_receipt_to'],
                    'returned_receipt_qty' => $returnedQty,
                    'processed_by' => $validated['processed_by'] ?? null,
                    'returned_to' => $validated['returned_to'] ?? null,
                    'custodian_received_by' => $validated['custodian_received_by'] ?? null,
                    'return_signature_reference' => $validated['return_signature_reference'] ?? null,
                    'logbook_reference_no' => $validated['logbook_reference_no'] ?? null,
                    'remarks' => $validated['remarks'] ?? null,
                    'status' => $newStatus,
                ]);

                $issuedForm->Ending_Balance_receipt_qty = $remainingQty;
                $issuedForm->Ending_Balance_receipt_from = $newEndingFrom;
                $issuedForm->Ending_Balance_receipt_to = $newEndingTo;
                $issuedForm->Stock = $remainingQty;
                $issuedForm->Status = $newStatus;
                $issuedForm->save();

                CollectorLogger::write((string) ($issuedForm->Collector ?? 'Unknown'), 'return_accountable_form', [
                    'issued_form_id' => $issuedForm->ID ?? null,
                    'return_id' => $returnRecord->id,
                    'return_date' => $validated['return_date'],
                    'form_type' => $issuedForm->Form_Type ?? null,
                    'serial_no' => $issuedForm->Serial_No ?? null,
                    'returned_receipt_from' => $validated['returned_receipt_from'],
                    'returned_receipt_to' => $validated['returned_receipt_to'],
                    'returned_receipt_qty' => $returnedQty,
                    'remaining_qty' => $remainingQty,
                    'status' => $newStatus,
                    'processed_by' => $validated['processed_by'] ?? null,
                    'returned_to' => $validated['returned_to'] ?? null,
                    'custodian_received_by' => $validated['custodian_received_by'] ?? null,
                    'return_signature_reference' => $validated['return_signature_reference'] ?? null,
                    'logbook_reference_no' => $validated['logbook_reference_no'] ?? null,
                ]);

                return $returnRecord;
            });

            return response()->json([
                'message' => 'Accountable form returned successfully.',
                'return' => $returnRecord,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => collect($e->errors())->flatten()->first() ?: 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to return accountable form.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
