<?php

namespace App\Http\Controllers;

use App\Helpers\RealPropertyTaxQueryHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RealPropertyTaxController extends Controller
{
    public function allData(Request $request): JsonResponse
    {
        try {
            $query = DB::table('real_property_tax_payment');

            if (! $request->boolean('include_cancelled')) {
                RealPropertyTaxQueryHelper::applyActiveFilter($query);
            }

            $results = $query
                ->selectRaw("
                    ID as id,
                    DATE as date,
                    NAME_OF_TAXPAYER as name,
                    PAID_BY as paid_by,
                    OR_NO as receipt_no,
                    NAME_OF_BARANGAY as barangay,
                    PERIOD_COVERED as advanced_payment,
                    BASIC_CURRENT_YEAR as current_year,
                    BASIC_CURRENT_PENALTIES as current_penalties,
                    BASIC_DISCOUNTS as current_discounts,
                    BASIC_PRECEDING_YEAR as prev_year,
                    BASIC_PRECEDING_PENALTIES as prev_penalties,
                    BASIC_PRIOR_YEARS as prior_years,
                    BASIC_PRIOR_PENALTIES as prior_penalties,
                    BASIC_TOTAL as total,
                    BASIC_25_SHARE as share,
                    SEF_CURRENT_YEAR as additional_current_year,
                    SEF_CURRENT_PENALTIES as additional_penalties,
                    SEF_DISCOUNTS as additional_discounts,
                    SEF_PRECEDING_YEAR as additional_prev_year,
                    SEF_PRECEDING_PENALTIES as additional_prev_penalties,
                    SEF_PRIOR_YEARS as additional_prior_years,
                    SEF_PRIOR_PENALTIES as additional_prior_penalties,
                    SEF_TOTAL as additional_total,
                    BASIC_AND_SEF as gf_total,
                    COALESCE(PROPERTY_CLASSIFICATION, '') as status,
                    CASHIER as cashier
                ")
                ->orderBy('DATE')
                ->orderBy('ID')
                ->get();

            return response()->json($results);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
