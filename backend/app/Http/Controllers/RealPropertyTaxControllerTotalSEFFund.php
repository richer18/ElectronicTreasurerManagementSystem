<?php

namespace App\Http\Controllers;

use App\Helpers\RealPropertyTaxQueryHelper;
use App\Helpers\QueryHelpers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RealPropertyTaxControllerTotalSEFFund extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table('real_property_tax_payment'))
                ->selectRaw('SEF_TOTAL as additional_total');

            $query = QueryHelpers::addDateFilters($query, $request, 'DATE');

            return response()->json($query->get());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
