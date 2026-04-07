<?php

namespace App\Http\Controllers;

use App\Helpers\QueryHelpers;
use App\Helpers\RealPropertyTaxQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RealPropertyTaxDataOverAllTotalBasicAndSEFController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table(RealPropertyTaxQueryHelper::table()))
                ->selectRaw('SUM(IFNULL(BASIC_AND_SEF, 0)) AS grand_total');

            $query = QueryHelpers::addDateFilters(
                $query,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );

            $data = (array) $query->first();
            $grandTotal = (float) ($data['grand_total'] ?? 0);

            $result = [
                'category' => 'TOTAL',
                'Grand Total' => round($grandTotal, 2),
            ];

            Log::info('Overall RPT + SEF Grand Total = ' . number_format($grandTotal, 2));

            return response()->json([$result]);
        } catch (\Exception $e) {
            Log::error('Error computing overall total: ' . $e->getMessage());

            return response()->json(['error' => 'Error computing overall total'], 500);
        }
    }
}
