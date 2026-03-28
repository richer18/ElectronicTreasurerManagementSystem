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
            $landBasic = DB::table(RealPropertyTaxQueryHelper::table())
                ->selectRaw('
                    SUM(IFNULL(BASIC_CURRENT_YEAR, 0)) AS current,
                    SUM(IFNULL(BASIC_DISCOUNTS, 0)) AS discount,
                    SUM(IFNULL(BASIC_PRECEDING_YEAR, 0) + IFNULL(BASIC_PRIOR_YEARS, 0)) AS prior,
                    SUM(IFNULL(BASIC_CURRENT_PENALTIES, 0)) AS penaltiesCurrent,
                    SUM(IFNULL(BASIC_PRECEDING_PENALTIES, 0) + IFNULL(BASIC_PRIOR_PENALTIES, 0)) AS penaltiesPrior
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::landStatuses()
                );
            $landBasic = QueryHelpers::addDateFilters(
                $landBasic,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );
            $landBasic = (array) $landBasic->first();

            $bldgBasic = DB::table(RealPropertyTaxQueryHelper::table())
                ->selectRaw('
                    SUM(IFNULL(BASIC_CURRENT_YEAR, 0)) AS current,
                    SUM(IFNULL(BASIC_DISCOUNTS, 0)) AS discount,
                    SUM(IFNULL(BASIC_PRECEDING_YEAR, 0) + IFNULL(BASIC_PRIOR_YEARS, 0)) AS prior,
                    SUM(IFNULL(BASIC_CURRENT_PENALTIES, 0)) AS penaltiesCurrent,
                    SUM(IFNULL(BASIC_PRECEDING_PENALTIES, 0) + IFNULL(BASIC_PRIOR_PENALTIES, 0)) AS penaltiesPrior
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::buildingStatuses()
                );
            $bldgBasic = QueryHelpers::addDateFilters(
                $bldgBasic,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );
            $bldgBasic = (array) $bldgBasic->first();

            $landSEF = DB::table(RealPropertyTaxQueryHelper::table())
                ->selectRaw('
                    SUM(IFNULL(SEF_CURRENT_YEAR, 0)) - SUM(IFNULL(SEF_DISCOUNTS, 0)) AS current,
                    SUM(IFNULL(SEF_PRECEDING_YEAR, 0) + IFNULL(SEF_PRIOR_YEARS, 0)) AS prior,
                    SUM(IFNULL(SEF_CURRENT_PENALTIES, 0) + IFNULL(SEF_PRECEDING_PENALTIES, 0) + IFNULL(SEF_PRIOR_PENALTIES, 0)) AS penalties
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::landStatuses()
                );
            $landSEF = QueryHelpers::addDateFilters(
                $landSEF,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );
            $landSEF = (array) $landSEF->first();

            $bldgSEF = DB::table(RealPropertyTaxQueryHelper::table())
                ->selectRaw('
                    SUM(IFNULL(SEF_CURRENT_YEAR, 0)) - SUM(IFNULL(SEF_DISCOUNTS, 0)) AS current,
                    SUM(IFNULL(SEF_PRECEDING_YEAR, 0) + IFNULL(SEF_PRIOR_YEARS, 0)) AS prior,
                    SUM(IFNULL(SEF_CURRENT_PENALTIES, 0) + IFNULL(SEF_PRECEDING_PENALTIES, 0) + IFNULL(SEF_PRIOR_PENALTIES, 0)) AS penalties
                ')
                ->whereIn(
                    RealPropertyTaxQueryHelper::classificationColumn(),
                    RealPropertyTaxQueryHelper::buildingStatuses()
                );
            $bldgSEF = QueryHelpers::addDateFilters(
                $bldgSEF,
                $request,
                RealPropertyTaxQueryHelper::dateColumn()
            );
            $bldgSEF = (array) $bldgSEF->first();

            $grandTotal =
                ($landBasic['current'] ?? 0) - ($landBasic['discount'] ?? 0) +
                ($bldgBasic['current'] ?? 0) - ($bldgBasic['discount'] ?? 0) +
                ($landBasic['prior'] ?? 0) +
                ($bldgBasic['prior'] ?? 0) +
                ($landBasic['penaltiesCurrent'] ?? 0) +
                ($bldgBasic['penaltiesCurrent'] ?? 0) +
                ($landBasic['penaltiesPrior'] ?? 0) +
                ($bldgBasic['penaltiesPrior'] ?? 0) +
                ($landSEF['current'] ?? 0) +
                ($bldgSEF['current'] ?? 0) +
                ($landSEF['prior'] ?? 0) +
                ($bldgSEF['prior'] ?? 0) +
                ($landSEF['penalties'] ?? 0) +
                ($bldgSEF['penalties'] ?? 0);

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
