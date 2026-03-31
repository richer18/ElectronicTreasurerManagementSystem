<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TaxOnBusinessBreakdownDataController extends Controller
{
    public function index(Request $request)
    {
        try {
            $year = (int) $request->query('year');
            $months = $request->query('months');

            $monthList = $months ? array_map('intval', explode(',', $months)) : [];

            $query = DB::table('general_fund_payment as gfp')
                ->where('gfp.FUNDTYPE_CT', 'GF')
                ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56']);

            GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');

            if ($year) {
                $query->whereYear('gfp.PAYMENTDATE', $year);
            }

            if (!empty($monthList)) {
                $query->whereIn(DB::raw('MONTH(gfp.PAYMENTDATE)'), $monthList);
            }

            $result = $query
                ->selectRaw(GeneralFundPaymentSummaryHelper::detailSelectRaw('gfp', 'gfp'))
                ->first();

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Error in TaxOnBusinessBreakdown: " . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }
}
