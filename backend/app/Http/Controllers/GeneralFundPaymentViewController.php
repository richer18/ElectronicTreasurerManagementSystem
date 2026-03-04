<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class GeneralFundPaymentViewController extends Controller
{
    public function show(string $paymentId)
    {
        try {
            $rows = DB::table('payment as p')
                ->leftJoin('paymentdetail as pd', 'p.PAYMENT_ID', '=', 'pd.PAYMENT_ID')
                ->leftJoin('t_otherpaymentrate as opr', 'pd.SOURCEID', '=', 'opr.OPRATE_ID')
                ->where('p.PAYMENT_ID', $paymentId)
                ->select([
                    'p.PAYMENTDATE as DATE',
                    'p.PAIDBY as NAME',
                    DB::raw("COALESCE(opr.DESCRIPTION, '') as DESCRIPTION"),
                    DB::raw('COALESCE(pd.AMOUNTPAID, 0) as AMOUNT'),
                ])
                ->get();

            return response()->json($rows);
        } catch (\Exception $e) {
            \Log::error('Error fetching general fund payment view: ' . $e->getMessage());
            return response()->json(['error' => 'Database query failed'], 500);
        }
    }
}
