<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GeneralFundDataTotalFundsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $gfPaymentIds = DB::table('paymentdetail')
                ->where('FUNDTYPE_CT', 'GF')
                ->distinct()
                ->pluck('PAYMENT_ID');

            $query = DB::table('payment')
                ->whereIn('PAYMENT_ID', $gfPaymentIds)
                ->whereNotIn('AFTYPE', ['CTC', 'AF56']);

            if ($request->filled('month')) {
                $query->whereMonth('PAYMENTDATE', $request->month);
            }

            if ($request->filled('year')) {
                $query->whereYear('PAYMENTDATE', $request->year);
            }

            if ($request->filled('day')) {
                $query->whereDay('PAYMENTDATE', $request->day);
            }

            $total = $query->sum('AMOUNT');

            return response()->json([
                'overall_total' => $total,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching total general funds: ' . $e->getMessage());
            return response()->json(['error' => 'Error fetching data'], 500);
        }
    }
}
