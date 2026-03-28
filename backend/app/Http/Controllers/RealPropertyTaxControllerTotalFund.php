<?php

namespace App\Http\Controllers;

use App\Helpers\QueryHelpers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RealPropertyTaxControllerTotalFund extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('real_property_tax_payment')
                ->selectRaw('BASIC_AND_SEF as gf_total');

            $query = QueryHelpers::addDateFilters($query, $request, 'DATE');

            return response()->json($query->get());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
