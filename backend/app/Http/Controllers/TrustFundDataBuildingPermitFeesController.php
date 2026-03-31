<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataBuildingPermitFeesController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('trust_fund_payment');
            $query = TrustFundPaymentSummaryHelper::applyActiveFilter($query);
            $query = TrustFundPaymentSummaryHelper::applyDateFilters($query, $request);

            $totals = $query->selectRaw("
                ROUND(COALESCE(SUM(LOCAL_80_PERCENT), 0), 2) AS local_total,
                ROUND(COALESCE(SUM(TRUST_FUND_15_PERCENT), 0), 2) AS trust_total,
                ROUND(COALESCE(SUM(NATIONAL_5_PERCENT), 0), 2) AS national_total
            ")->first();

            return response()->json([
                ['Taxes' => 'Building Local Fund 80%', 'Total' => $totals->local_total ?? 0],
                ['Taxes' => 'Building Trust Fund 15%', 'Total' => $totals->trust_total ?? 0],
                ['Taxes' => 'Building National Fund 5%', 'Total' => $totals->national_total ?? 0],
                ['Taxes' => 'Overall Total', 'Total' => ($totals->local_total ?? 0) + ($totals->trust_total ?? 0) + ($totals->national_total ?? 0)],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching building permit fees: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch data'], 500);
        }
    }
}
