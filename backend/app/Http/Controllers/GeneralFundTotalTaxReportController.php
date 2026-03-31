<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundTotalTaxReportController extends Controller
{
    public function index(Request $request)
    {
        try {
            $summary = DB::table('general_fund_payment as gfp')
                ->where('gfp.FUNDTYPE_CT', 'GF')
                ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56']);

            GeneralFundPaymentSummaryHelper::applyActiveFilter($summary, 'gfp');
            GeneralFundPaymentSummaryHelper::applyDateFilters($summary, $request, 'gfp.PAYMENTDATE');

            $summary = $summary
                ->selectRaw(GeneralFundPaymentSummaryHelper::mainBucketSelectRaw('gfp'))
                ->first();

            return response()->json([
                ['Taxes' => 'Tax on Business', 'Total' => (float) ($summary->tax_on_business ?? 0)],
                ['Taxes' => 'Regulatory Fees', 'Total' => (float) ($summary->regulatory_fees ?? 0)],
                ['Taxes' => 'Receipts From Economic Enterprise', 'Total' => (float) ($summary->receipts_from_economic_enterprises ?? 0)],
                ['Taxes' => 'Service/User Charges', 'Total' => (float) ($summary->service_user_charges ?? 0)],
                ['Taxes' => 'Overall Total', 'Total' => (float) ($summary->total ?? 0)],
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating total tax report: ' . $e->getMessage());
            return response()->json(['error' => 'Server error generating report'], 500);
        }
    }
}
