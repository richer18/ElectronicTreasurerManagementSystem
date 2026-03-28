<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RealPropertyTaxUpdateDataController extends Controller
{
    public function update(Request $request, $id)
    {
        if (!is_numeric($id)) {
            return response()->json(['message' => 'Invalid ID'], 400);
        }

        $data = $request->all();

        try {
            $query = DB::table('real_property_tax_payment')->where('ID', $id);

            if (!$query->exists()) {
                return response()->json(['message' => 'Record not found'], 404);
            }

            $query->update([
                'DATE' => $data['date'] ?? null,
                'NAME_OF_TAXPAYER' => $data['name'] ?? null,
                'OR_NO' => $data['receipt_no'] ?? null,
                'NAME_OF_BARANGAY' => $data['barangay'] ?? null,
                'PERIOD_COVERED' => $data['advanced_payment'] ?? null,
                'BASIC_CURRENT_YEAR' => $data['current_year'] ?? 0,
                'BASIC_CURRENT_PENALTIES' => $data['current_penalties'] ?? 0,
                'BASIC_DISCOUNTS' => abs((float) ($data['current_discounts'] ?? 0)),
                'BASIC_PRECEDING_YEAR' => $data['prev_year'] ?? 0,
                'BASIC_PRECEDING_PENALTIES' => $data['prev_penalties'] ?? 0,
                'BASIC_PRIOR_YEARS' => $data['prior_years'] ?? 0,
                'BASIC_PRIOR_PENALTIES' => $data['prior_penalties'] ?? 0,
                'BASIC_TOTAL' => $data['total'] ?? 0,
                'BASIC_25_SHARE' => $data['share'] ?? 0,
                'SEF_CURRENT_YEAR' => $data['additional_current_year'] ?? 0,
                'SEF_CURRENT_PENALTIES' => $data['additional_penalties'] ?? 0,
                'SEF_DISCOUNTS' => abs((float) ($data['additional_discounts'] ?? 0)),
                'SEF_PRECEDING_YEAR' => $data['additional_prev_year'] ?? 0,
                'SEF_PRECEDING_PENALTIES' => $data['additional_prev_penalties'] ?? 0,
                'SEF_PRIOR_YEARS' => $data['additional_prior_years'] ?? 0,
                'SEF_PRIOR_PENALTIES' => $data['additional_prior_penalties'] ?? 0,
                'SEF_TOTAL' => $data['additional_total'] ?? 0,
                'BASIC_AND_SEF' => $data['gf_total'] ?? 0,
                'PROPERTY_CLASSIFICATION' => $data['status'] ?? null,
                'CASHIER' => $data['cashier'] ?? null,
            ]);

            return response()->json(['message' => 'Record updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
