<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundQueryCache;
use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDashboardSummaryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $summary = GeneralFundQueryCache::remember(
                'dashboard_summary',
                GeneralFundQueryCache::requestParams($request, ['month', 'year', 'day']),
                function () use ($request) {
                    $query = DB::table('general_fund_payment as gfp')
                        ->where('gfp.FUNDTYPE_CT', 'GF')
                        ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56']);

                    GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');
                    GeneralFundPaymentSummaryHelper::applyDateFilters($query, $request, 'gfp.PAYMENTDATE');

                    $summary = $query
                        ->selectRaw(GeneralFundPaymentSummaryHelper::mainBucketSelectRaw('gfp'))
                        ->first();

                    return [
                        'overall_total' => (float) ($summary->total ?? 0),
                        'tax_on_business' => (float) ($summary->tax_on_business ?? 0),
                        'regulatory_fees' => (float) ($summary->regulatory_fees ?? 0),
                        'service_user_charges' => (float) ($summary->service_user_charges ?? 0),
                        'receipts_from_economic_enterprises' => (float) ($summary->receipts_from_economic_enterprises ?? 0),
                    ];
                }
            );

            return response()->json($summary);
        } catch (\Exception $e) {
            Log::error('Error fetching general fund dashboard summary: ' . $e->getMessage());

            return response()->json(['error' => 'Error fetching data'], 500);
        }
    }
}
