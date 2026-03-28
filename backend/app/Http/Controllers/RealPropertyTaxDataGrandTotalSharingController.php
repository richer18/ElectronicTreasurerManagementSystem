<?php

namespace App\Http\Controllers;

use App\Helpers\QueryHelpers;
use App\Helpers\RealPropertyTaxQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RealPropertyTaxDataGrandTotalSharingController extends Controller
{
    public function index(Request $request)
    {
        try {
            $landQuery = DB::table(RealPropertyTaxQueryHelper::table())
                ->selectRaw('
                    SUM(IFNULL(BASIC_CURRENT_YEAR, 0) - IFNULL(BASIC_DISCOUNTS, 0)) AS current,
                    SUM(IFNULL(BASIC_PRECEDING_YEAR, 0) + IFNULL(BASIC_PRIOR_YEARS, 0)) AS prior,
                    SUM(IFNULL(BASIC_CURRENT_PENALTIES, 0) + IFNULL(BASIC_PRECEDING_PENALTIES, 0) + IFNULL(BASIC_PRIOR_PENALTIES, 0)) AS penalties
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::landStatuses()
                );

            $buildingQuery = DB::table(RealPropertyTaxQueryHelper::table())
                ->selectRaw('
                    SUM(IFNULL(BASIC_CURRENT_YEAR, 0) - IFNULL(BASIC_DISCOUNTS, 0)) AS current,
                    SUM(IFNULL(BASIC_PRECEDING_YEAR, 0) + IFNULL(BASIC_PRIOR_YEARS, 0)) AS prior,
                    SUM(IFNULL(BASIC_CURRENT_PENALTIES, 0) + IFNULL(BASIC_PRECEDING_PENALTIES, 0) + IFNULL(BASIC_PRIOR_PENALTIES, 0)) AS penalties
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
            $bldgData = (array) $buildingQuery->first();

            $land = [
                'current' => $landData['current'] ?? 0,
                'prior' => $landData['prior'] ?? 0,
                'penalties' => $landData['penalties'] ?? 0,
            ];

            $bldg = [
                'current' => $bldgData['current'] ?? 0,
                'prior' => $bldgData['prior'] ?? 0,
                'penalties' => $bldgData['penalties'] ?? 0,
            ];

            $grandTotal =
                $land['current'] + $land['prior'] + $land['penalties'] +
                $bldg['current'] + $bldg['prior'] + $bldg['penalties'];

            $result = [
                'category' => 'TOTAL',
                'Grand Total' => round($grandTotal, 2),
                '35% Prov’l Share' => round($grandTotal * 0.35, 2),
                '40% Mun. Share' => round($grandTotal * 0.40, 2),
                '25% Brgy. Share' => round($grandTotal * 0.25, 2),
            ];

            Log::info('Grand Total Sharing: ' . number_format($grandTotal, 2));

            return response()->json([$result]);
        } catch (\Exception $e) {
            Log::error('Error fetching grand total sharing: ' . $e->getMessage());

            return response()->json(['error' => 'Error fetching grand total sharing data'], 500);
        }
    }
}
