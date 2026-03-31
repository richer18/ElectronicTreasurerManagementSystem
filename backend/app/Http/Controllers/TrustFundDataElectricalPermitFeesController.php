<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataElectricalPermitFeesController extends Controller
{
    public function __invoke(Request $request)
    {
        try {
            $query = DB::table('trust_fund_payment');
            $query = TrustFundPaymentSummaryHelper::applyActiveFilter($query);
            $query = TrustFundPaymentSummaryHelper::applyDateFilters($query, $request);

            $total = (float) ($query->sum('ELECTRICAL_FEE') ?? 0);

            return response()->json([
                ['Taxes' => 'Electrical Fee', 'Total' => round($total, 2)],
                ['Taxes' => 'Overall Total', 'Total' => round($total, 2)],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch electrical permit fee totals: ' . $e->getMessage());
            return response()->json(['error' => 'Error retrieving electrical permit fee totals'], 500);
        }
    }
}
