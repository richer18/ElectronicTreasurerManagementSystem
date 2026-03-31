<?php

namespace App\Http\Controllers;

use App\Helpers\QueryHelpers;
use App\Helpers\RealPropertyTaxQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RealPropertyTaxDataSefGrandTotalSharingController extends Controller
{
    public function index(Request $request)
    {
        try {
            $landQuery = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table(RealPropertyTaxQueryHelper::table()))
                ->selectRaw('
                    SUM(IFNULL(SEF_CURRENT_YEAR, 0) - IFNULL(SEF_DISCOUNTS, 0)) AS current,
                    SUM(IFNULL(SEF_PRECEDING_YEAR, 0) + IFNULL(SEF_PRIOR_YEARS, 0)) AS prior,
                    SUM(IFNULL(SEF_CURRENT_PENALTIES, 0) + IFNULL(SEF_PRECEDING_PENALTIES, 0) + IFNULL(SEF_PRIOR_PENALTIES, 0)) AS penalties
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::landStatuses()
                );

            $buildingQuery = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table(RealPropertyTaxQueryHelper::table()))
                ->selectRaw('
                    SUM(IFNULL(SEF_CURRENT_YEAR, 0) - IFNULL(SEF_DISCOUNTS, 0)) AS current,
                    SUM(IFNULL(SEF_PRECEDING_YEAR, 0) + IFNULL(SEF_PRIOR_YEARS, 0)) AS prior,
                    SUM(IFNULL(SEF_CURRENT_PENALTIES, 0) + IFNULL(SEF_PRECEDING_PENALTIES, 0) + IFNULL(SEF_PRIOR_PENALTIES, 0)) AS penalties
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::buildingStatuses()
                );

            $landQuery = QueryHelpers::addDateFilters(
                $landQuery,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );
            $buildingQuery = QueryHelpers::addDateFilters(
                $buildingQuery,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );

            $landData = (array) $landQuery->first();
            $buildingData = (array) $buildingQuery->first();

            $land = [
                'current' => $landData['current'] ?? 0,
                'prior' => $landData['prior'] ?? 0,
                'penalties' => $landData['penalties'] ?? 0,
            ];

            $building = [
                'current' => $buildingData['current'] ?? 0,
                'prior' => $buildingData['prior'] ?? 0,
                'penalties' => $buildingData['penalties'] ?? 0,
            ];

            $grandTotal =
                $land['current'] + $land['prior'] + $land['penalties'] +
                $building['current'] + $building['prior'] + $building['penalties'];

            $result = [
                'category' => 'TOTAL',
                'Grand Total' => round($grandTotal, 2),
                '50% Prov’l Share' => round($grandTotal * 0.50, 2),
                '50% Mun. Share' => round($grandTotal * 0.50, 2),
            ];

            Log::info('SEF Grand Total: ' . number_format($grandTotal, 2));

            return response()->json([$result]);
        } catch (\Exception $e) {
            Log::error('Error fetching SEF grand total sharing: ' . $e->getMessage());

            return response()->json(['error' => 'Error fetching SEF grand total sharing data'], 500);
        }
    }
}
