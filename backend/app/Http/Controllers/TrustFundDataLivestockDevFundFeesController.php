<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataLivestockDevFundFeesController extends Controller
{
    public function __invoke(Request $request)
    {
        try {
            $query = DB::table('trust_fund_payment');
            $query = TrustFundPaymentSummaryHelper::applyActiveFilter($query);
            $query = TrustFundPaymentSummaryHelper::applyDateFilters($query, $request);

            $totals = $query->selectRaw("
                ROUND(COALESCE(SUM(LOCAL_80_PERCENT_LIVESTOCK), 0), 2) AS local_total,
                ROUND(COALESCE(SUM(NATIONAL_20_PERCENT), 0), 2) AS national_total
            ")->first();

            return response()->json([
                ['Taxes' => 'Livestock Dev Fund Local 80%', 'Total' => $totals->local_total ?? 0],
                ['Taxes' => 'Livestock Dev Fund National 20%', 'Total' => $totals->national_total ?? 0],
                ['Taxes' => 'Overall Total', 'Total' => ($totals->local_total ?? 0) + ($totals->national_total ?? 0)],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching Livestock Dev Fund fees: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch data'], 500);
        }
    }
}
