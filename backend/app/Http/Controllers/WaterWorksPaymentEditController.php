<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundQueryCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WaterWorksPaymentEditController extends Controller
{
    private const WATER_SOURCE_IDS = ['815', '817', '819', '821', '827'];

    public function show(string $paymentId)
    {
        try {
            $payment = DB::table('general_fund_payment')
                ->where('PAYMENT_ID', $paymentId)
                ->whereIn('SOURCEID', self::WATER_SOURCE_IDS)
                ->first([
                    'PAYMENT_ID',
                    'PAYMENTDATE',
                    'PAIDBY',
                    'RECEIPTNO',
                    'AFTYPE',
                    'COLLECTOR',
                    'USERID',
                    'PAYMENT_AMOUNT',
                ]);

            if (! $payment) {
                return response()->json(['message' => 'Water payment not found'], 404);
            }

            $details = DB::table('general_fund_payment')
                ->where('PAYMENT_ID', $paymentId)
                ->whereIn('SOURCEID', self::WATER_SOURCE_IDS)
                ->select([
                    'PAYMENTDETAIL_ID',
                    'SOURCEID',
                    DB::raw("COALESCE(RATE_DESCRIPTION, '') as DESCRIPTION"),
                    DB::raw('COALESCE(AMOUNTPAID, 0) as AMOUNTPAID'),
                ])
                ->orderByRaw('COALESCE(RECEIPTITEMORDER, 999999)')
                ->orderBy('PAYMENTDETAIL_ID')
                ->get();

            return response()->json([
                'payment' => $payment,
                'details' => $details,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching water payment edit data: ' . $e->getMessage());

            return response()->json(['message' => 'Failed to fetch water payment data'], 500);
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
                $exists = DB::table('general_fund_payment')
                    ->where('PAYMENT_ID', $paymentId)
                    ->whereIn('SOURCEID', self::WATER_SOURCE_IDS)
                    ->exists();

                if (! $exists) {
                    throw new \RuntimeException('Water payment not found');
                }

                DB::table('general_fund_payment')
                    ->where('PAYMENT_ID', $paymentId)
                    ->whereIn('SOURCEID', self::WATER_SOURCE_IDS)
                    ->update([
                        'PAYMENTDATE' => $validated['date'],
                        'PAIDBY' => $validated['name'],
                        'RECEIPTNO' => $validated['receipt_no'],
                        'AFTYPE' => $validated['type_receipt'],
                        'COLLECTOR' => $validated['cashier'],
                        'USERID' => $validated['cashier'],
                    ]);

                $total = 0;

                foreach ($validated['details'] ?? [] as $detail) {
                    $amount = (float) $detail['amount'];
                    $total += $amount;

                    DB::table('general_fund_payment')
                        ->where('PAYMENT_ID', $paymentId)
                        ->where('PAYMENTDETAIL_ID', $detail['paymentdetail_id'])
                        ->whereIn('SOURCEID', self::WATER_SOURCE_IDS)
                        ->update([
                            'AMOUNTPAID' => $amount,
                        ]);
                }

                DB::table('general_fund_payment')
                    ->where('PAYMENT_ID', $paymentId)
                    ->whereIn('SOURCEID', self::WATER_SOURCE_IDS)
                    ->update([
                        'PAYMENT_AMOUNT' => $total,
                    ]);
            });

            GeneralFundQueryCache::invalidate();

            return response()->json(['message' => 'Water payment updated successfully']);
        } catch (\Exception $e) {
            \Log::error('Error updating water payment: ' . $e->getMessage());

            return response()->json([
                'message' => $e instanceof \RuntimeException ? $e->getMessage() : 'Failed to update water payment',
            ], $e instanceof \RuntimeException ? 404 : 500);
        }
    }

    public function destroy(string $paymentId)
    {
        try {
            $deleted = DB::transaction(function () use ($paymentId) {
                $query = DB::table('general_fund_payment')
                    ->where('PAYMENT_ID', $paymentId)
                    ->whereIn('SOURCEID', self::WATER_SOURCE_IDS);

                $exists = (clone $query)->exists();

                if (! $exists) {
                    return 0;
                }

                return $query->delete();
            });

            if (! $deleted) {
                return response()->json(['message' => 'Water payment not found'], 404);
            }

            GeneralFundQueryCache::invalidate();

            return response()->json(['message' => 'Water payment deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Error deleting water payment: ' . $e->getMessage());

            return response()->json(['message' => 'Failed to delete water payment'], 500);
        }
    }
}
