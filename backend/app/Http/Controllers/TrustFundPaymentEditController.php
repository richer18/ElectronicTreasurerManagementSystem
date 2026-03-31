<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrustFundPaymentEditController extends Controller
{
    public function show(string $paymentId)
    {
        try {
            $payment = DB::table('trust_fund_payment')
                ->where('ID', $paymentId)
                ->first([
                    'ID',
                    'DATE',
                    'NAME',
                    'RECEIPT_NO',
                    'TYPE_OF_RECEIPT',
                    'CASHIER',
                    'TOTAL',
                    'BUILDING_PERMIT_FEE',
                    'ELECTRICAL_FEE',
                    'ZONING_FEE',
                    'LIVESTOCK_DEV_FUND',
                    'DIVING_FEE',
                ]);

            if (!$payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            $details = collect([
                [
                    'PAYMENTDETAIL_ID' => 'BUILDING_PERMIT_FEE',
                    'SOURCEID' => 'BUILDING_PERMIT_FEE',
                    'DESCRIPTION' => 'BUILDING PERMIT FEE',
                    'AMOUNTPAID' => $payment->BUILDING_PERMIT_FEE ?? 0,
                ],
                [
                    'PAYMENTDETAIL_ID' => 'ELECTRICAL_FEE',
                    'SOURCEID' => 'ELECTRICAL_FEE',
                    'DESCRIPTION' => 'ELECTRICAL FEE',
                    'AMOUNTPAID' => $payment->ELECTRICAL_FEE ?? 0,
                ],
                [
                    'PAYMENTDETAIL_ID' => 'ZONING_FEE',
                    'SOURCEID' => 'ZONING_FEE',
                    'DESCRIPTION' => 'ZONING FEE',
                    'AMOUNTPAID' => $payment->ZONING_FEE ?? 0,
                ],
                [
                    'PAYMENTDETAIL_ID' => 'LIVESTOCK_DEV_FUND',
                    'SOURCEID' => 'LIVESTOCK_DEV_FUND',
                    'DESCRIPTION' => 'LIVESTOCK DEVELOPMENT FUND',
                    'AMOUNTPAID' => $payment->LIVESTOCK_DEV_FUND ?? 0,
                ],
                [
                    'PAYMENTDETAIL_ID' => 'DIVING_FEE',
                    'SOURCEID' => 'DIVING_FEE',
                    'DESCRIPTION' => 'DIVING FEE',
                    'AMOUNTPAID' => $payment->DIVING_FEE ?? 0,
                ],
            ])->all();

            return response()->json([
                'payment' => $payment,
                'details' => $details,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching trust fund payment edit data: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch payment data'], 500);
        }
    }

    public function update(Request $request, string $paymentId)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'name' => ['required', 'string', 'max:150'],
            'receipt_no' => ['required', 'string', 'max:50'],
            'type_receipt' => ['required', 'string', 'max:20'],
            'cashier' => ['required', 'string', 'max:50'],
            'details' => ['array'],
            'details.*.paymentdetail_id' => ['required', 'string', 'max:50'],
            'details.*.amount' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            DB::transaction(function () use ($validated, $paymentId) {
                $exists = DB::table('trust_fund_payment')
                    ->where('ID', $paymentId)
                    ->exists();

                if (!$exists) {
                    throw new \RuntimeException('Payment not found');
                }

                $columnMap = [
                    'BUILDING_PERMIT_FEE' => 'BUILDING_PERMIT_FEE',
                    'ELECTRICAL_FEE' => 'ELECTRICAL_FEE',
                    'ZONING_FEE' => 'ZONING_FEE',
                    'LIVESTOCK_DEV_FUND' => 'LIVESTOCK_DEV_FUND',
                    'DIVING_FEE' => 'DIVING_FEE',
                ];

                $updates = [
                    'DATE' => $validated['date'],
                    'NAME' => $validated['name'],
                    'RECEIPT_NO' => $validated['receipt_no'],
                    'TYPE_OF_RECEIPT' => $validated['type_receipt'],
                    'CASHIER' => $validated['cashier'],
                ];

                foreach ($validated['details'] ?? [] as $detail) {
                    $column = $columnMap[$detail['paymentdetail_id']] ?? null;
                    if ($column === null) {
                        continue;
                    }
                    $updates[$column] = (float) $detail['amount'];
                }

                DB::table('trust_fund_payment')
                    ->where('ID', $paymentId)
                    ->update($updates);
            });

            return response()->json(['message' => 'Payment updated successfully']);
        } catch (\Exception $e) {
            \Log::error('Error updating trust fund payment: ' . $e->getMessage());
            return response()->json([
                'message' => $e instanceof \RuntimeException ? $e->getMessage() : 'Failed to update payment',
            ], $e instanceof \RuntimeException ? 404 : 500);
        }
    }
}
