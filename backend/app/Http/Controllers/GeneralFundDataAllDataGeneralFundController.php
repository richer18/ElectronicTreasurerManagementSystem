<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataAllDataGeneralFundController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('general_fund_payment as gfp')
                ->where('gfp.FUNDTYPE_CT', 'GF')
                ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56']);

            GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');
            GeneralFundPaymentSummaryHelper::applyDateFilters($query, $request, 'gfp.PAYMENTDATE');

            $results = $query
                ->groupBy(DB::raw('DATE(gfp.PAYMENTDATE)'))
                ->orderBy(DB::raw('DATE(gfp.PAYMENTDATE)'))
                ->selectRaw("
                    DATE(gfp.PAYMENTDATE) AS raw_date,
                    " . GeneralFundPaymentSummaryHelper::mainBucketSelectRaw('gfp') . ",
                    '' AS REMARKS,
                    'VIEW COMMENT' AS ACTION
                ")
                ->get()
                ->map(function ($row) {
                    return [
                        'raw_date' => $row->raw_date,
                        'DATE' => Carbon::parse($row->raw_date)->format('F j, Y'),
                        'Tax on Business' => number_format((float) $row->tax_on_business, 2, '.', ''),
                        'Regulatory Fees' => number_format((float) $row->regulatory_fees, 2, '.', ''),
                        'Receipts From Economic Enterprise' => number_format((float) $row->receipts_from_economic_enterprises, 2, '.', ''),
                        'Service/User Charges' => number_format((float) $row->service_user_charges, 2, '.', ''),
                        'Overall Total' => number_format((float) $row->total, 2, '.', ''),
                        'REMARKS' => $row->REMARKS,
                        'ACTION' => $row->ACTION,
                    ];
                })
                ->values();

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error("Failed to fetch general fund summary: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch data'], 500);
        }
    }
}
