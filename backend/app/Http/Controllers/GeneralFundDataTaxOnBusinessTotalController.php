<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataTaxOnBusinessTotalController extends Controller
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
                'tax_on_business' => $result->tax_on_business ?? 0
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching Tax on Business total: ' . $e->getMessage());
            return response()->json(['error' => 'Error fetching data'], 500);
        }
    }
}
