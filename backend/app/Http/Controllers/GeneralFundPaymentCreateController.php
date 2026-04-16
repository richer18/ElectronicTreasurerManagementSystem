<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentMirrorHelper;
use App\Helpers\GeneralFundPaymentSummaryHelper;
use App\Helpers\GeneralFundQueryCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class GeneralFundPaymentCreateController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'name' => ['required', 'string', 'max:100'],
            'receipt_no' => ['required', 'string', 'max:50'],
            'type_receipt' => ['required', 'string', 'max:20'],
            'cashier' => ['required', 'string', 'max:50'],
            'local_tin' => ['nullable', 'string', 'max:50'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.source_id' => ['required', 'string', 'max:50'],
            'details.*.amount' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            $hasLegacyPaymentTables = Schema::hasTable('payment') && Schema::hasTable('paymentdetail');

            if ($hasLegacyPaymentTables) {
                $receiptExists = DB::table('payment')
                    ->where('RECEIPTNO', $validated['receipt_no'])
                    ->where('AFTYPE', $validated['type_receipt'])
                    ->where('VOID_BV', 0)
                    ->exists();
            } else {
                $receiptExistsQuery = DB::table('general_fund_payment')
                    ->where('RECEIPTNO', $validated['receipt_no'])
                    ->where('AFTYPE', $validated['type_receipt']);

                GeneralFundPaymentSummaryHelper::applyActiveFilter($receiptExistsQuery, '');

                $receiptExists = $receiptExistsQuery->exists();
            }

            if ($receiptExists) {
                return response()->json(['message' => 'Receipt number already exists'], 400);
            }

            $rateRows = DB::table('t_otherpaymentrate as opr')
                ->leftJoin('t_itaxtype as tax', 'opr.ITAXTYPE_CT', '=', 'tax.CODE')
                ->whereIn('opr.OPRATE_ID', collect($validated['details'])->pluck('source_id')->all())
                ->get([
                    'opr.OPRATE_ID',
                    'opr.DESCRIPTION',
                    'opr.ITAXTYPE_CT',
                    'opr.OPGROUP',
                    'opr.OPSUBGROUP',
                    'opr.RATE',
                    'tax.CODE as TAX_CODE',
                    'tax.DESCRIPTION as TAX_DESCRIPTION',
                    'tax.IGROUP as TAX_GROUP',
                    'tax.SUBGROUP as TAX_SUBGROUP',
                    'tax.MAINGROUP as TAX_MAIN_GROUP',
                    'tax.FUNDTYPE_CT as TAX_FUNDTYPE_CT',
                ])
                ->keyBy('OPRATE_ID');

            $validSourceIds = $rateRows->keys()->all();

            $invalidSourceIds = array_values(array_diff(
                collect($validated['details'])->pluck('source_id')->unique()->all(),
                $validSourceIds
            ));

            if (count($invalidSourceIds) > 0) {
                return response()->json([
                    'message' => 'Invalid payment rate option(s).',
                    'invalid_source_ids' => $invalidSourceIds,
                ], 422);
            }

            $paymentId = (string) Str::uuid();
            $now = now();

            DB::transaction(function () use ($validated, $paymentId, $now, $hasLegacyPaymentTables, $rateRows) {
                $total = 0;
                foreach ($validated['details'] as $detail) {
                    $total += (float) $detail['amount'];
                }

                if ($hasLegacyPaymentTables) {
                    DB::table('payment')->insert([
                        'PAYMENT_ID' => $paymentId,
                        'LOCAL_TIN' => $validated['local_tin'] ?? null,
                        'PAIDBY' => $validated['name'],
                        'PAYMENTDATE' => $validated['date'],
                        'VALUEDATE' => $validated['date'],
                        'AMOUNT' => $total,
                        'RECEIPTNO' => $validated['receipt_no'],
                        'PRINT_BV' => 1,
                        'STATUS_CT' => null,
                        'REMARK' => null,
                        'USERID' => $validated['cashier'],
                        'TRANSDATE' => $now,
                        'PAYGROUP_CT' => 'GF',
                        'AFTYPE' => $validated['type_receipt'],
                        'LOCATIONSRC' => null,
                        'VOID_BV' => 0,
                        'PROV_BV' => 0,
                        'COLLECTOR' => $validated['cashier'],
                    ]);

                    foreach (array_values($validated['details']) as $index => $detail) {
                        DB::table('paymentdetail')->insert([
                            'PAYMENTDETAIL_ID' => (string) Str::uuid(),
                            'PAYMENT_ID' => $paymentId,
                            'AMOUNTPAID' => (float) $detail['amount'],
                            'USERID' => $validated['cashier'],
                            'TRANSDATE' => $now,
                            'SOURCEID' => $detail['source_id'],
                            'SOURCE_CT' => null,
                            'EXPORTTOESRE_BV' => 0,
                            'FUNDTYPE_CT' => 'GF',
                            'RECEIPTITEMORDER' => $index + 1,
                            'UNIT' => null,
                            'DATALASTEDITED' => $now,
                        ]);
                    }

                    GeneralFundPaymentMirrorHelper::syncPayment($paymentId);
                    return;
                }

                $directRows = [];

                foreach (array_values($validated['details']) as $index => $detail) {
                    $rate = $rateRows->get($detail['source_id']);

                    $directRows[] = [
                        'PAYMENT_ID' => $paymentId,
                        'PAYMENTDETAIL_ID' => (string) Str::uuid(),
                        'PAYMENTDATE' => $validated['date'],
                        'VALUEDATE' => $now,
                        'PAIDBY' => $validated['name'],
                        'RECEIPTNO' => $validated['receipt_no'],
                        'PAYMENT_AMOUNT' => $total,
                        'PAYMODE_CT' => 'CSH',
                        'AFTYPE' => $validated['type_receipt'],
                        'PAYGROUP_CT' => 'OTH',
                        'LOCAL_TIN' => $validated['local_tin'] ?? null,
                        'USERID' => $validated['cashier'],
                        'COLLECTOR' => $validated['cashier'],
                        'VOID_BV' => 0,
                        'PROV_BV' => 0,
                        'AMOUNTPAID' => (float) $detail['amount'],
                        'PAYMENTDETAIL_ITAXTYPE_CT' => $rate?->ITAXTYPE_CT,
                        'CASETYPE_CT' => 'REG',
                        'PAYMENTDETAIL_STATUS_CT' => 'SAV',
                        'SOURCEID' => $detail['source_id'],
                        'SOURCE_CT' => 'PAY',
                        'FUNDTYPE_CT' => 'GF',
                        'RECEIPTITEMORDER' => $index + 1,
                        'UNIT' => '1',
                        'RATE_ITAXTYPE_CT' => $rate?->ITAXTYPE_CT,
                        'OPGROUP' => $rate?->OPGROUP,
                        'OPSUBGROUP' => $rate?->OPSUBGROUP,
                        'RATE_DESCRIPTION' => $rate?->DESCRIPTION,
                        'RATE' => $rate?->RATE,
                        'TAX_CODE' => $rate?->TAX_CODE,
                        'TAX_DESCRIPTION' => $rate?->TAX_DESCRIPTION,
                        'TAX_GROUP' => $rate?->TAX_GROUP,
                        'TAX_SUBGROUP' => $rate?->TAX_SUBGROUP,
                        'TAX_MAIN_GROUP' => $rate?->TAX_MAIN_GROUP,
                        'TAX_FUNDTYPE_CT' => $rate?->TAX_FUNDTYPE_CT,
                    ];
                }

                DB::table('general_fund_payment')->insert($directRows);
            });

            GeneralFundQueryCache::invalidate();

            return response()->json([
                'message' => 'Payment saved successfully.',
                'payment_id' => $paymentId,
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error saving General Fund payment: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to save payment'], 500);
        }
    }
}
