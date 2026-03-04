<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GeneralFundPaymentEditController extends Controller
{
    public function show(string $paymentId)
    {
        try {
            $payment = DB::table('payment')
                ->where('PAYMENT_ID', $paymentId)
                ->first([
                    'PAYMENT_ID',
                    'PAYMENTDATE',
                    'PAIDBY',
                    'RECEIPTNO',
                    'AFTYPE',
                    'COLLECTOR',
                    'USERID',
                    'AMOUNT',
                ]);

            if (!$payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            $details = DB::table('paymentdetail as pd')
                ->leftJoin('t_otherpaymentrate as opr', 'pd.SOURCEID', '=', 'opr.OPRATE_ID')
                ->where('pd.PAYMENT_ID', $paymentId)
                ->select([
                    'pd.PAYMENTDETAIL_ID',
                    'pd.SOURCEID',
                    DB::raw("COALESCE(opr.DESCRIPTION, '') as DESCRIPTION"),
                    DB::raw('COALESCE(pd.AMOUNTPAID, 0) as AMOUNTPAID'),
                ])
                ->orderBy('pd.PAYMENTDETAIL_ID')
                ->get();

            return response()->json([
                'payment' => $payment,
                'details' => $details,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching general fund payment edit data: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch payment data'], 500);
        }
    }

    public function update(Request $request, string $paymentId)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'name' => ['required', 'string', 'max:100'],
            'receipt_no' => ['required', 'string', 'max:50'],
            'type_receipt' => ['required', 'string', 'max:20'],
            'cashier' => ['required', 'string', 'max:50'],
            'details' => ['array'],
            'details.*.paymentdetail_id' => ['required', 'string', 'max:50'],
            'details.*.amount' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            DB::transaction(function () use ($validated, $paymentId) {
                DB::table('payment')
                    ->where('PAYMENT_ID', $paymentId)
                    ->update([
                        'PAYMENTDATE' => $validated['date'],
                        'PAIDBY' => $validated['name'],
                        'RECEIPTNO' => $validated['receipt_no'],
                        'AFTYPE' => $validated['type_receipt'],
                        'COLLECTOR' => $validated['cashier'],
                    ]);

                $total = 0;
                foreach ($validated['details'] ?? [] as $detail) {
                    $amount = (float) $detail['amount'];
                    $total += $amount;

                    DB::table('paymentdetail')
                        ->where('PAYMENT_ID', $paymentId)
                        ->where('PAYMENTDETAIL_ID', $detail['paymentdetail_id'])
                        ->update([
                            'AMOUNTPAID' => $amount,
                        ]);
                }

                DB::table('payment')
                    ->where('PAYMENT_ID', $paymentId)
                    ->update(['AMOUNT' => $total]);
            });

            return response()->json(['message' => 'Payment updated successfully']);
        } catch (\Exception $e) {
            \Log::error('Error updating general fund payment: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update payment'], 500);
        }
    }
}
