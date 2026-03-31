<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataViewalldataGeneralFundTableViewController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date');

        if (!$date) {
            return response()->json(['error' => 'Date parameter is required'], 400);
        }

        try {
            $results = DB::table('general_fund_payment as gfp')
                ->where('gfp.FUNDTYPE_CT', 'GF')
                ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56'])
                ->whereDate('gfp.PAYMENTDATE', '=', $date);

            GeneralFundPaymentSummaryHelper::applyActiveFilter($results, 'gfp');

            $results = $results
                ->groupBy('gfp.PAYMENT_ID', DB::raw('DATE(gfp.PAYMENTDATE)'))
                ->select(
                    DB::raw('gfp.PAYMENT_ID as id'),
                    DB::raw('DATE(gfp.PAYMENTDATE) as date'),
                    DB::raw('MAX(gfp.PAIDBY) as name'),
                    DB::raw('MAX(gfp.RECEIPTNO) as receipt_no'),
                    DB::raw("MAX(COALESCE(NULLIF(gfp.COLLECTOR, ''), gfp.USERID)) as cashier"),
                    DB::raw('MAX(gfp.AFTYPE) as type_receipt'),
                    DB::raw("NULL as comments")
                )
                ->selectRaw(\App\Helpers\GeneralFundPaymentSummaryHelper::detailSelectRaw('gfp', 'gfp'))
                ->orderBy('gfp.PAYMENT_ID', 'asc')
                ->get();

            if ($results->isEmpty()) {
                return response()->json(['message' => 'No data found for the given date'], 404);
            }

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error("Error fetching general fund rows for table view: " . $e->getMessage());
            return response()->json(['error' => 'Database query error'], 500);
        }
    }
}
