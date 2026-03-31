<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataZoningPermitFeesController extends Controller
{
    public function __invoke(Request $request)
    {
        try {
            $query = DB::table('trust_fund_payment');
            $query = TrustFundPaymentSummaryHelper::applyDateFilters($query, $request);

            $total = (float) ($query->sum('ZONING_FEE') ?? 0);

            return response()->json([
                ['Taxes' => 'Zoning Fee', 'Total' => round($total, 2)],
                ['Taxes' => 'Overall Total', 'Total' => round($total, 2)],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching zoning permit fees: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch data'], 500);
        }
    }
}
