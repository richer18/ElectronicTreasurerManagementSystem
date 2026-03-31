<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataDivingFeesController extends Controller
{
    public function __invoke(Request $request)
    {
        try {
            $query = DB::table('trust_fund_payment');
            $query = TrustFundPaymentSummaryHelper::applyActiveFilter($query);
            $query = TrustFundPaymentSummaryHelper::applyDateFilters($query, $request);

            $totals = $query->selectRaw("
                ROUND(COALESCE(SUM(LOCAL_40_PERCENT_DIVE_FEE), 0), 2) AS local_total,
                ROUND(COALESCE(SUM(FISHERS_30_PERCENT), 0), 2) AS fishers_total,
                ROUND(COALESCE(SUM(BRGY_30_PERCENT), 0), 2) AS brgy_total
            ")->first();

            return response()->json([
                ['Taxes' => 'Diving Fee Local 40%', 'Total' => $totals->local_total ?? 0],
                ['Taxes' => 'Diving Fee Fishers 30%', 'Total' => $totals->fishers_total ?? 0],
                ['Taxes' => 'Diving Fee Brgy 30%', 'Total' => $totals->brgy_total ?? 0],
                ['Taxes' => 'Overall Total', 'Total' => ($totals->local_total ?? 0) + ($totals->fishers_total ?? 0) + ($totals->brgy_total ?? 0)],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching diving fee report: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch data'], 500);
        }
    }
}
