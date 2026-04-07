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
                    SUM(IFNULL(SEF_TOTAL, 0)) AS total_amount
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::landStatuses()
                );

            $buildingQuery = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table(RealPropertyTaxQueryHelper::table()))
                ->selectRaw('
                    SUM(IFNULL(SEF_TOTAL, 0)) AS total_amount
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
                'total_amount' => $landData['total_amount'] ?? 0,
            ];

            $building = [
                'total_amount' => $buildingData['total_amount'] ?? 0,
            ];

            $grandTotal =
                $land['total_amount'] + $building['total_amount'];

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
