<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentMirrorHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TrustFundPaymentCreateController extends Controller
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
            $receiptExists = DB::table('payment')
                ->where('RECEIPTNO', $validated['receipt_no'])
                ->where('AFTYPE', $validated['type_receipt'])
                ->where('VOID_BV', 0)
                ->exists();

            if ($receiptExists) {
                return response()->json(['message' => 'Receipt number already exists'], 400);
            }

            $validSourceIds = DB::table('paymentdetail as pd')
                ->join('t_otherpaymentrate as opr', 'pd.SOURCEID', '=', 'opr.OPRATE_ID')
                ->where('pd.FUNDTYPE_CT', 'TF')
                ->whereIn('opr.OPRATE_ID', collect($validated['details'])->pluck('source_id')->all())
                ->distinct()
                ->pluck('opr.OPRATE_ID')
                ->all();

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

            DB::transaction(function () use ($validated, $paymentId, $now) {
                $total = 0;
                foreach ($validated['details'] as $detail) {
                    $total += (float) $detail['amount'];
                }

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
                    'PAYGROUP_CT' => 'TF',
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
                        'FUNDTYPE_CT' => 'TF',
                        'RECEIPTITEMORDER' => $index + 1,
                        'UNIT' => null,
                        'DATALASTEDITED' => $now,
                    ]);
                }

                TrustFundPaymentMirrorHelper::syncPayment($paymentId);
            });

            return response()->json([
                'message' => 'Payment saved successfully.',
                'payment_id' => $paymentId,
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error saving Trust Fund payment: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to save payment'], 500);
        }
    }
}
