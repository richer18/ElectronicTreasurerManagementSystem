<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundQueryCache;
use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataAllController extends Controller
{
    public function index(Request $request)
    {
        try {
            $results = GeneralFundQueryCache::remember(
                'main_table',
                GeneralFundQueryCache::requestParams($request, ['month', 'year', 'day', 'search', 'include_cancelled']),
                function () use ($request) {
                    $query = DB::table('general_fund_payment as gfp')
                        ->where('gfp.FUNDTYPE_CT', 'GF')
                        ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56']);

                    if (! $request->boolean('include_cancelled')) {
                        GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');
                    }
                    GeneralFundPaymentSummaryHelper::applyDateFilters($query, $request, 'gfp.PAYMENTDATE');
                    GeneralFundPaymentSummaryHelper::applySearch($query, $request->query('search'), 'gfp');

                    return $query
                        ->groupBy('gfp.PAYMENT_ID', DB::raw('DATE(gfp.PAYMENTDATE)'))
                        ->orderByRaw('DATE(gfp.PAYMENTDATE) DESC')
                        ->orderByDesc('gfp.PAYMENT_ID')
                        ->get([
                            DB::raw('gfp.PAYMENT_ID as id'),
                            DB::raw('gfp.PAYMENT_ID as payment_id'),
                            DB::raw('DATE(gfp.PAYMENTDATE) as date'),
                            DB::raw('MAX(gfp.PAIDBY) as name'),
                            DB::raw('MAX(gfp.RECEIPTNO) as receipt_no'),
                            DB::raw("MAX(COALESCE(NULLIF(gfp.COLLECTOR, ''), gfp.USERID)) as cashier"),
                            DB::raw('MAX(gfp.AFTYPE) as type_receipt'),
                            DB::raw('ROUND(SUM(COALESCE(gfp.AMOUNTPAID, 0)), 2) as total'),
                            DB::raw('MAX(gfp.LOCAL_TIN) as local_tin'),
                            DB::raw('MAX(gfp.USERID) as user_id'),
                            DB::raw('MAX(gfp.PAYGROUP_CT) as paygroup'),
                        ])
                        ->map(fn ($row) => (array) $row)
                        ->all();
                }
            );

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error("Error fetching data: " . $e->getMessage());
            return response()->json(['error' => 'Database query failed'], 500);
        }
    }
}
