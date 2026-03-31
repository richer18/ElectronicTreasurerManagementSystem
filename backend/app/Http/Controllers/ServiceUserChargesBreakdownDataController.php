<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ServiceUserChargesBreakdownDataController extends Controller
{
    public function index(Request $request)
    {
        $year = (int) $request->query('year');
        $months = $request->query('months');

        if (!$year || !is_numeric($year)) {
            return response()->json([
                'error' => 'Invalid or missing "year" parameter',
                'code' => 'INVALID_YEAR',
            ], 400);
        }

        $monthList = collect(explode(',', $months))
            ->map(fn ($m) => (int) $m)
            ->filter(fn ($m) => $m >= 1 && $m <= 12)
            ->values()
            ->toArray();

        try {
            $query = DB::table('general_fund_payment as gfp')
                ->where('gfp.FUNDTYPE_CT', 'GF')
                ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56'])
                ->whereYear('gfp.PAYMENTDATE', $year);

            GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');
            if (!empty($monthList)) {
                $query->whereIn(DB::raw('MONTH(gfp.PAYMENTDATE)'), $monthList);
            }

            $row = $query
                ->selectRaw(GeneralFundPaymentSummaryHelper::detailSelectRaw('gfp', 'gfp'))
                ->first();

            $breakdown = [
                ['category' => 'Secretaries Fee', 'total_amount' => (float) (($row->Secretaries_Fee ?? 0) + ($row->Police_Report_Clearance ?? 0))],
                ['category' => 'Garbage Fees', 'total_amount' => (float) ($row->Garbage_Fees ?? 0)],
                ['category' => 'Med./Lab Fees', 'total_amount' => (float) ($row->Med_Dent_Lab_Fees ?? 0)],
            ];

            return response()->json([
                'year' => $year,
                'months' => $monthList,
                'currency' => 'PHP',
                'breakdown' => $breakdown,
            ]);
        } catch (\Exception $e) {
            Log::error("ServiceUserCharges DB error: " . $e->getMessage());
            return response()->json([
                'error' => 'Database error',
                'code' => 'DB_ERROR',
            ], 500);
        }
    }
}
