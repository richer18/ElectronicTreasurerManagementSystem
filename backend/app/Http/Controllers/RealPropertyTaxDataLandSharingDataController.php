<?php

namespace App\Http\Controllers;

use App\Helpers\QueryHelpers;
use App\Helpers\RealPropertyTaxQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RealPropertyTaxDataLandSharingDataController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table(RealPropertyTaxQueryHelper::table()))
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::landStatuses()
                );

            $query = QueryHelpers::addDateFilters(
                $query,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );

            $breakdowns = [
                'Current' => "SUM(IFNULL(BASIC_CURRENT_YEAR, 0) - IFNULL(BASIC_DISCOUNTS, 0))",
                'Prior' => "SUM(IFNULL(BASIC_PRECEDING_YEAR, 0) + IFNULL(BASIC_PRIOR_YEARS, 0))",
                'Penalties' => "SUM(IFNULL(BASIC_CURRENT_PENALTIES, 0) + IFNULL(BASIC_PRECEDING_PENALTIES, 0) + IFNULL(BASIC_PRIOR_PENALTIES, 0))",
            ];

            $results = [];

            foreach ($breakdowns as $label => $expression) {
                $results[] = (clone $query)
                    ->selectRaw("'{$label}' AS category")
                    ->selectRaw("ROUND({$expression}, 2) AS LAND")
                    ->selectRaw("ROUND({$expression} * 0.35, 2) AS `35% Prov’l Share`")
                    ->selectRaw("ROUND({$expression} * 0.40, 2) AS `40% Mun. Share`")
                    ->selectRaw("ROUND({$expression} * 0.25, 2) AS `25% Brgy. Share`")
                    ->first();
            }

            $totalExpression = "SUM(
                (IFNULL(BASIC_CURRENT_YEAR, 0) - IFNULL(BASIC_DISCOUNTS, 0)) +
                (IFNULL(BASIC_PRECEDING_YEAR, 0) + IFNULL(BASIC_PRIOR_YEARS, 0)) +
                (IFNULL(BASIC_CURRENT_PENALTIES, 0) + IFNULL(BASIC_PRECEDING_PENALTIES, 0) + IFNULL(BASIC_PRIOR_PENALTIES, 0))
            )";

            $results[] = (clone $query)
                ->selectRaw("'TOTAL' AS category")
                ->selectRaw("ROUND({$totalExpression}, 2) AS LAND")
                ->selectRaw("ROUND({$totalExpression} * 0.35, 2) AS `35% Prov’l Share`")
                ->selectRaw("ROUND({$totalExpression} * 0.40, 2) AS `40% Mun. Share`")
                ->selectRaw("ROUND({$totalExpression} * 0.25, 2) AS `25% Brgy. Share`")
                ->first();

            Log::info('Land Sharing Data fetched successfully');

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Error fetching land sharing data: ' . $e->getMessage());

            return response()->json(['error' => 'Error fetching land sharing data'], 500);
        }
    }
}
