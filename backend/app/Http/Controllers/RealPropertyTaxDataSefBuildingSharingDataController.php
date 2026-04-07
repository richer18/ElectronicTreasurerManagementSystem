<?php

namespace App\Http\Controllers;

use App\Helpers\QueryHelpers;
use App\Helpers\RealPropertyTaxQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RealPropertyTaxDataSefBuildingSharingDataController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table(RealPropertyTaxQueryHelper::table()))
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::buildingStatuses()
                );

            $query = QueryHelpers::addDateFilters(
                $query,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );

            $breakdowns = [
                'Current' => "SUM(IFNULL(SEF_CURRENT_YEAR, 0) + (IFNULL(SEF_TOTAL, 0) - IFNULL(SEF_CURRENT_YEAR, 0) - IFNULL(SEF_CURRENT_PENALTIES, 0) - IFNULL(SEF_PRECEDING_YEAR, 0) - IFNULL(SEF_PRECEDING_PENALTIES, 0) - IFNULL(SEF_PRIOR_YEARS, 0) - IFNULL(SEF_PRIOR_PENALTIES, 0)))",
                'Prior' => "SUM(IFNULL(SEF_PRECEDING_YEAR, 0) + IFNULL(SEF_PRIOR_YEARS, 0))",
                'Penalties' => "SUM(IFNULL(SEF_CURRENT_PENALTIES, 0) + IFNULL(SEF_PRECEDING_PENALTIES, 0) + IFNULL(SEF_PRIOR_PENALTIES, 0))",
            ];

            $results = [];

            foreach ($breakdowns as $label => $expression) {
                $results[] = (clone $query)
                    ->selectRaw("'{$label}' AS category")
                    ->selectRaw("ROUND({$expression}, 2) AS BUILDING")
                    ->selectRaw("ROUND({$expression} * 0.50, 2) AS `50% Prov’l Share`")
                    ->selectRaw("ROUND({$expression} * 0.50, 2) AS `50% Mun. Share`")
                    ->first();
            }

            $totalExpression = "SUM(IFNULL(SEF_TOTAL, 0))";

            $results[] = (clone $query)
                ->selectRaw("'TOTAL' AS category")
                ->selectRaw("ROUND({$totalExpression}, 2) AS BUILDING")
                ->selectRaw("ROUND({$totalExpression} * 0.50, 2) AS `50% Prov’l Share`")
                ->selectRaw("ROUND({$totalExpression} * 0.50, 2) AS `50% Mun. Share`")
                ->first();

            Log::info('SEF Building Sharing Data fetched successfully');

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Error fetching SEF building sharing data: ' . $e->getMessage());

            return response()->json(['error' => 'Error fetching SEF building sharing data'], 500);
        }
    }
}
