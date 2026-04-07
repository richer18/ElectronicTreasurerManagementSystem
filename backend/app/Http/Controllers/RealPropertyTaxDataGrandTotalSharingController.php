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
            $landQuery = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table(RealPropertyTaxQueryHelper::table()))
                ->selectRaw('
                    SUM(IFNULL(BASIC_TOTAL, 0)) AS total_amount
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::landStatuses()
                );

            $buildingQuery = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table(RealPropertyTaxQueryHelper::table()))
                ->selectRaw('
                    SUM(IFNULL(BASIC_TOTAL, 0)) AS total_amount
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
                'total_amount' => $landData['total_amount'] ?? 0,
            ];

            $bldg = [
                'total_amount' => $bldgData['total_amount'] ?? 0,
            ];

            $grandTotal =
                $land['total_amount'] + $bldg['total_amount'];

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
