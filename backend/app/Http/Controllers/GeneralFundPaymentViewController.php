<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class GeneralFundPaymentViewController extends Controller
{
    public function show(string $paymentId)
    {
        try {
            $rows = DB::table('general_fund_payment')
                ->where('PAYMENT_ID', $paymentId)
                ->select([
                    'PAYMENTDATE as DATE',
                    'PAIDBY as NAME',
                    DB::raw("COALESCE(RATE_DESCRIPTION, '') as DESCRIPTION"),
                    DB::raw('COALESCE(AMOUNTPAID, 0) as AMOUNT'),
                ])
                ->orderByRaw('COALESCE(RECEIPTITEMORDER, 999999)')
                ->orderBy('PAYMENTDETAIL_ID')
                ->get();

            return response()->json($rows);
        } catch (\Exception $e) {
            \Log::error('Error fetching general fund payment view: ' . $e->getMessage());
            return response()->json(['error' => 'Database query failed'], 500);
        }
    }
}
