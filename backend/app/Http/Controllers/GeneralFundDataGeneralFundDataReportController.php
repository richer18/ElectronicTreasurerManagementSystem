<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundQueryCache;
use App\Helpers\GeneralFundPaymentSummaryHelper;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GeneralFundDataGeneralFundDataReportController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:1900|max:2100',
        ]);

        try {
            $result = GeneralFundQueryCache::remember(
                'financial_report',
                ['month' => $validated['month'], 'year' => $validated['year']],
                function () use ($validated) {
                    $startOfMonth = Carbon::create($validated['year'], $validated['month'], 1)->startOfMonth();
                    $startOfNextMonth = (clone $startOfMonth)->addMonth();

                    $query = DB::table('general_fund_payment as gfp')
                        ->where('gfp.FUNDTYPE_CT', 'GF')
                        ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56'])
                        ->where('gfp.PAYMENTDATE', '>=', $startOfMonth->toDateTimeString())
                        ->where('gfp.PAYMENTDATE', '<', $startOfNextMonth->toDateTimeString());

                    GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');

                    $row = $query
                        ->selectRaw(GeneralFundPaymentSummaryHelper::detailSelectRaw('gfp', 'gfp'))
                        ->first();

                    return [(array) ($row ?: (object) [])];
                }
            );

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error fetching general fund data: ' . $e->getMessage());

            return response()->json([
                'error' => 'Database query failed',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
