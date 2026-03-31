<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataReceiptsFromEconomicEnterprisesTotalController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('general_fund_payment as gfp')
                ->where('gfp.FUNDTYPE_CT', 'GF')
                ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56']);

            GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');
            GeneralFundPaymentSummaryHelper::applyDateFilters($query, $request, 'gfp.PAYMENTDATE');

            $result = $query
                ->selectRaw(GeneralFundPaymentSummaryHelper::mainBucketSelectRaw('gfp'))
                ->first();

            return response()->json([
                'receipts_from_economic_enterprises' => $result->receipts_from_economic_enterprises ?? 0
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching Receipts from Economic Enterprises total: ' . $e->getMessage());
            return response()->json(['error' => 'Error fetching data'], 500);
        }
    }
}
