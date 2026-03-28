<?php

namespace App\Http\Controllers;

use App\Helpers\QueryHelpers;
use App\Helpers\RealPropertyTaxQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RealPropertyTaxDataSefLandDataController extends Controller
{
    public function index(Request $request)
    {
        try {
            $results = [];

            foreach (RealPropertyTaxQueryHelper::landCategoryMap() as $label => $statuses) {
                $query = DB::table(RealPropertyTaxQueryHelper::table())
                    ->selectRaw("'{$label}' AS category")
                    ->selectRaw('IFNULL(SUM(SEF_CURRENT_YEAR), 0) AS current')
                    ->selectRaw('IFNULL(SUM(SEF_DISCOUNTS), 0) AS discount')
                    ->selectRaw('IFNULL(SUM(SEF_PRECEDING_YEAR + SEF_PRIOR_YEARS), 0) AS prior')
                    ->selectRaw('IFNULL(SUM(SEF_CURRENT_PENALTIES), 0) AS penaltiesCurrent')
                    ->selectRaw('IFNULL(SUM(SEF_PRECEDING_PENALTIES + SEF_PRIOR_PENALTIES), 0) AS penaltiesPrior')
                    ->whereIn(RealPropertyTaxQueryHelper::classificationColumn(), $statuses);

                $query = QueryHelpers::addDateFilters(
                    $query,
                    $request,
                    RealPropertyTaxQueryHelper::dateColumn()
                );

                $results[] = (array) $query->first();
            }

            $totals = [
                'category' => 'TOTAL',
                'current' => 0,
                'discount' => 0,
                'prior' => 0,
                'penaltiesCurrent' => 0,
                'penaltiesPrior' => 0,
            ];

            foreach ($results as $row) {
                $totals['current'] += (float) $row['current'];
                $totals['discount'] += (float) $row['discount'];
                $totals['prior'] += (float) $row['prior'];
                $totals['penaltiesCurrent'] += (float) $row['penaltiesCurrent'];
                $totals['penaltiesPrior'] += (float) $row['penaltiesPrior'];
            }

            $totals['totalSum'] =
                $totals['current'] -
                $totals['discount'] +
                $totals['prior'] +
                $totals['penaltiesCurrent'] +
                $totals['penaltiesPrior'];

            Log::info('SEF Land Total = ' . number_format($totals['totalSum'], 2));

            return response()->json([...$results, $totals]);
        } catch (\Exception $e) {
            Log::error('Error fetching SEF land data: ' . $e->getMessage());

            return response()->json(['error' => 'Error fetching SEF land data'], 500);
        }
    }
}
