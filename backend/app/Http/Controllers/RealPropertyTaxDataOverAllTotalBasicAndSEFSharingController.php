<?php

namespace App\Http\Controllers;

use App\Helpers\QueryHelpers;
use App\Helpers\RealPropertyTaxQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RealPropertyTaxDataOverAllTotalBasicAndSEFSharingController extends Controller
{
    public function index(Request $request)
    {
        try {
            $landBasicQuery = DB::table(RealPropertyTaxQueryHelper::table())
                ->selectRaw('
                    SUM(
                        IFNULL(BASIC_CURRENT_YEAR, 0) - IFNULL(BASIC_DISCOUNTS, 0) +
                        IFNULL(BASIC_PRECEDING_YEAR, 0) + IFNULL(BASIC_PRIOR_YEARS, 0) +
                        IFNULL(BASIC_CURRENT_PENALTIES, 0) + IFNULL(BASIC_PRECEDING_PENALTIES, 0) + IFNULL(BASIC_PRIOR_PENALTIES, 0)
                    ) AS total_amount
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::landStatuses()
                );
            $landBasicQuery = QueryHelpers::addDateFilters(
                $landBasicQuery,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );
            $landBasic = (array) $landBasicQuery->first();

            $bldgBasicQuery = DB::table(RealPropertyTaxQueryHelper::table())
                ->selectRaw('
                    SUM(
                        IFNULL(BASIC_CURRENT_YEAR, 0) - IFNULL(BASIC_DISCOUNTS, 0) +
                        IFNULL(BASIC_PRECEDING_YEAR, 0) + IFNULL(BASIC_PRIOR_YEARS, 0) +
                        IFNULL(BASIC_CURRENT_PENALTIES, 0) + IFNULL(BASIC_PRECEDING_PENALTIES, 0) + IFNULL(BASIC_PRIOR_PENALTIES, 0)
                    ) AS total_amount
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::buildingStatuses()
                );
            $bldgBasicQuery = QueryHelpers::addDateFilters(
                $bldgBasicQuery,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );
            $bldgBasic = (array) $bldgBasicQuery->first();

            $landSEFQuery = DB::table(RealPropertyTaxQueryHelper::table())
                ->selectRaw('
                    SUM(
                        IFNULL(SEF_CURRENT_YEAR, 0) - IFNULL(SEF_DISCOUNTS, 0) +
                        IFNULL(SEF_PRECEDING_YEAR, 0) + IFNULL(SEF_PRIOR_YEARS, 0) +
                        IFNULL(SEF_CURRENT_PENALTIES, 0) + IFNULL(SEF_PRECEDING_PENALTIES, 0) + IFNULL(SEF_PRIOR_PENALTIES, 0)
                    ) AS total_amount
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::landStatuses()
                );
            $landSEFQuery = QueryHelpers::addDateFilters(
                $landSEFQuery,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );
            $landSEF = (array) $landSEFQuery->first();

            $bldgSEFQuery = DB::table(RealPropertyTaxQueryHelper::table())
                ->selectRaw('
                    SUM(
                        IFNULL(SEF_CURRENT_YEAR, 0) - IFNULL(SEF_DISCOUNTS, 0) +
                        IFNULL(SEF_PRECEDING_YEAR, 0) + IFNULL(SEF_PRIOR_YEARS, 0) +
                        IFNULL(SEF_CURRENT_PENALTIES, 0) + IFNULL(SEF_PRECEDING_PENALTIES, 0) + IFNULL(SEF_PRIOR_PENALTIES, 0)
                    ) AS total_amount
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::buildingStatuses()
                );
            $bldgSEFQuery = QueryHelpers::addDateFilters(
                $bldgSEFQuery,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );
            $bldgSEF = (array) $bldgSEFQuery->first();

            $basicTotal = ($landBasic['total_amount'] ?? 0) + ($bldgBasic['total_amount'] ?? 0);
            $sefTotal = ($landSEF['total_amount'] ?? 0) + ($bldgSEF['total_amount'] ?? 0);
            $grandTotal = $basicTotal + $sefTotal;

            $result = [
                'category' => 'TOTAL',
                'Grand Total' => round($grandTotal, 2),
                'Prov’l Share' => round(($basicTotal * 0.35) + ($sefTotal * 0.50), 2),
                'Mun. Share' => round(($basicTotal * 0.40) + ($sefTotal * 0.50), 2),
                'Brgy. Share' => round($basicTotal * 0.25, 2),
            ];

            Log::info('Overall Sharing - RPT + SEF: ' . number_format($grandTotal, 2));

            return response()->json([$result]);
        } catch (\Exception $e) {
            Log::error('Error fetching overall total for Basic and SEF Sharing: ' . $e->getMessage());

            return response()->json(['error' => 'Error fetching overall total sharing data'], 500);
        }
    }
}
