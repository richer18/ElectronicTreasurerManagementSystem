<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReceiptsFromEconomicEntBreakdownDataController extends Controller
{
    public function index(Request $request)
    {
        $year = (int) $request->query('year');
        $months = $request->query('months');

        if (!$year || $year < 1000) {
            return response()->json([
                'error' => 'Invalid or missing "year" parameter',
                'code' => 'INVALID_YEAR'
            ], 400);
        }

        $monthList = [];
        if ($months) {
            $monthList = array_filter(
                array_map('intval', explode(',', $months)),
                fn ($m) => $m >= 1 && $m <= 12
            );
        }

        try {
            $query = DB::table('general_fund_payment as gfp')
                ->where('gfp.FUNDTYPE_CT', 'GF')
                ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56'])
                ->whereYear('gfp.PAYMENTDATE', $year);

            GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');
            if (!empty($monthList)) {
                $query->whereIn(DB::raw('MONTH(gfp.PAYMENTDATE)'), $monthList);
            }

            $result = $query
                ->selectRaw(GeneralFundPaymentSummaryHelper::detailSelectRaw('gfp', 'gfp'))
                ->first();

            $response = [
                'Slaughterhouse Operations' => (float) ($result->Slaughter_House_Fee ?? 0),
                'Market Operations' => (float) (($result->Stall_Fees ?? 0) + ($result->Cash_Tickets ?? 0)),
                'Water Work System Operations' => (float) ($result->Water_Fees ?? 0),
                'Lease/Rental Facilities' => (float) ($result->Rental_of_Equipment ?? 0),
            ];

            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('DB error in ReceiptsFromEconomicEntBreakdownDataController: ' . $e->getMessage());

            return response()->json([
                'error' => 'Internal server error',
                'code' => 'DB_ERROR'
            ], 500);
        }
    }
}
