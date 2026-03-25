<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDashboardSummaryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('PAYMENT as p')
                ->join('PAYMENTDETAIL as pd', 'p.PAYMENT_ID', '=', 'pd.PAYMENT_ID')
                ->join('T_OTHERPAYMENTRATE as opr', 'pd.SOURCEID', '=', 'opr.OPRATE_ID')
                ->where('pd.FUNDTYPE_CT', 'TF')
                ->whereRaw('COALESCE(p.VOID_BV, 0) = 0')
                ->whereIn('opr.ITAXTYPE_CT', ['PFB', 'EP', 'ZLC', 'IFL', 'IFD']);

            if ($request->filled('month')) {
                $query->whereMonth('p.PAYMENTDATE', $request->month);
            }

            if ($request->filled('year')) {
                $query->whereYear('p.PAYMENTDATE', $request->year);
            }

            $summary = $query->selectRaw("
                ROUND(COALESCE(SUM(pd.AMOUNTPAID), 0), 2) AS total,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'PFB' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS building_permit_fee,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'EP' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS electrical_fee,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'ZLC' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS zoning_fee,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFL' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS livestock_dev_fund,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFD' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS diving_fee
            ")->first();

            return response()->json($summary);
        } catch (\Exception $e) {
            Log::error('Error fetching trust fund dashboard summary: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch summary'], 500);
        }
    }
}
