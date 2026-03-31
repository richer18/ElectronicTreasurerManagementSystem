<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RealPropertyTaxSaveDataController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->all();

        try {
            $basicCurrentYear = (float) ($data['current_year'] ?? 0);
            $basicCurrentPenalties = (float) ($data['current_penalties'] ?? 0);
            $basicDiscounts = abs((float) ($data['current_discounts'] ?? 0));
            $sefCurrentYear = (float) ($data['additional_current_year'] ?? 0);
            $sefCurrentPenalties = (float) ($data['additional_penalties'] ?? 0);
            $sefDiscounts = abs((float) ($data['additional_discounts'] ?? 0));

            $id = DB::table('real_property_tax_payment')->insertGetId([
                'DATE' => $data['date'] ?? null,
                'PAID_BY' => $data['paid_by'] ?? null,
                'NAME_OF_TAXPAYER' => $data['name'] ?? null,
                'PERIOD_COVERED' => $data['advanced_payment'] ?? null,
                'PIN' => $data['pin'] ?? null,
                'OR_NO' => $data['receipt_no'] ?? null,
                'NAME_OF_BARANGAY' => $data['barangay'] ?? null,
                'BASIC_CURRENT_YEAR' => $basicCurrentYear,
                'BASIC_CURRENT_PENALTIES' => $basicCurrentPenalties,
                'BASIC_DISCOUNTS' => $basicDiscounts,
                'BASIC_IMMEDIATE' => $basicCurrentYear + $basicCurrentPenalties - $basicDiscounts,
                'BASIC_PRECEDING_YEAR' => $data['prev_year'] ?? 0,
                'BASIC_PRECEDING_PENALTIES' => $data['prev_penalties'] ?? 0,
                'BASIC_PRIOR_YEARS' => $data['prior_years'] ?? 0,
                'BASIC_PRIOR_PENALTIES' => $data['prior_penalties'] ?? 0,
                'BASIC_TOTAL' => $data['total'] ?? 0,
                'BASIC_25_SHARE' => $data['share'] ?? 0,
                'SEF_CURRENT_YEAR' => $sefCurrentYear,
                'SEF_CURRENT_PENALTIES' => $sefCurrentPenalties,
                'SEF_DISCOUNTS' => $sefDiscounts,
                'SEF_IMMEDIATE' => $sefCurrentYear + $sefCurrentPenalties - $sefDiscounts,
                'SEF_PRECEDING_YEAR' => $data['additional_prev_year'] ?? 0,
                'SEF_PRECEDING_PENALTIES' => $data['additional_prev_penalties'] ?? 0,
                'SEF_PRIOR_YEARS' => $data['additional_prior_years'] ?? 0,
                'SEF_PRIOR_PENALTIES' => $data['additional_prior_penalties'] ?? 0,
                'SEF_TOTAL' => $data['additional_total'] ?? 0,
                'BASIC_AND_SEF' => $data['gf_total'] ?? 0,
                'PROPERTY_CLASSIFICATION' => $data['status'] ?? null,
                'CASHIER' => $data['cashier'] ?? null,
            ]);

            return response()->json([
                'message' => 'Record inserted successfully',
                'id' => $id
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
