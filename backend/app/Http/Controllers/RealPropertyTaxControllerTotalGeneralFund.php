<?php

namespace App\Http\Controllers;

use App\Helpers\QueryHelpers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RealPropertyTaxControllerTotalGeneralFund extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('real_property_tax_payment')
                ->selectRaw('BASIC_TOTAL as total');

            $query = QueryHelpers::addDateFilters($query, $request, 'DATE');

            return response()->json($query->get());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
