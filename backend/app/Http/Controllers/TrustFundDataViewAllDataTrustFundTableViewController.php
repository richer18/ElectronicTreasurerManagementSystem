<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataViewAllDataTrustFundTableViewController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date');

        if (!$date) {
            return response()->json(['error' => 'Date parameter is required'], 400);
        }

        try {
            $results = DB::table('trust_fund_payment')
                ->select(
                    'ID',
                    'DATE',
                    'RECEIPT_NO',
                    'NAME',
                    DB::raw('COALESCE(BUILDING_PERMIT_FEE, 0) AS BUILDING_PERMIT_FEE'),
                    DB::raw('COALESCE(LOCAL_80_PERCENT, 0) AS LOCAL_80_PERCENT'),
                    DB::raw('COALESCE(TRUST_FUND_15_PERCENT, 0) AS TRUST_FUND_15_PERCENT'),
                    DB::raw('COALESCE(NATIONAL_5_PERCENT, 0) AS NATIONAL_5_PERCENT'),
                    DB::raw('COALESCE(ELECTRICAL_FEE, 0) AS ELECTRICAL_FEE'),
                    DB::raw('COALESCE(ZONING_FEE, 0) AS ZONING_FEE'),
                    DB::raw('COALESCE(LIVESTOCK_DEV_FUND, 0) AS LIVESTOCK_DEV_FUND'),
                    DB::raw('COALESCE(LOCAL_80_PERCENT_LIVESTOCK, 0) AS LOCAL_80_PERCENT_LIVESTOCK'),
                    DB::raw('COALESCE(NATIONAL_20_PERCENT, 0) AS NATIONAL_20_PERCENT'),
                    DB::raw('COALESCE(DIVING_FEE, 0) AS DIVING_FEE'),
                    DB::raw('COALESCE(LOCAL_40_PERCENT_DIVE_FEE, 0) AS LOCAL_40_PERCENT_DIVE_FEE'),
                    DB::raw('COALESCE(BRGY_30_PERCENT, 0) AS BRGY_30_PERCENT'),
                    DB::raw('COALESCE(FISHERS_30_PERCENT, 0) AS FISHERS_30_PERCENT'),
                    DB::raw('COALESCE(TOTAL, 0) AS TOTAL'),
                    'CASHIER',
                    DB::raw("COALESCE(COMMENTS, '') AS COMMENTS")
                );

            $results = TrustFundPaymentSummaryHelper::applyActiveFilter($results)
                ->whereDate('DATE', $date)
                ->orderBy('ID', 'ASC')
                ->get();

            if ($results->isEmpty()) {
                return response()->json(['message' => 'No data found for the given date'], 404);
            }

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Error fetching trust fund data table view: ' . $e->getMessage());
            return response()->json(['error' => 'Database query error'], 500);
        }
    }
}
