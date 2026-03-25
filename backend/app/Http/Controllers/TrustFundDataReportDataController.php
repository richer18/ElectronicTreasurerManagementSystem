<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrustFundDataReportDataController extends Controller
{
    public function index(Request $request)
    {
        $month = (int) $request->query('month');
        $year = (int) $request->query('year');

        if (!$month || !$year) {
            return response()->json(['error' => 'Valid month and year are required'], 400);
        }

        try {
            $result = DB::selectOne(
                <<<'SQL'
SELECT
    ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'PFB' THEN pd.AMOUNTPAID * 0.80 ELSE 0 END), 0), 2) AS LOCAL_80_PERCENT,
    ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'PFB' THEN pd.AMOUNTPAID * 0.15 ELSE 0 END), 0), 2) AS TRUST_FUND_15_PERCENT,
    ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'PFB' THEN pd.AMOUNTPAID * 0.05 ELSE 0 END), 0), 2) AS NATIONAL_5_PERCENT,
    ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'EP' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS ELECTRICAL_FEE,
    ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'ZLC' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS ZONING_FEE,
    ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFL' THEN pd.AMOUNTPAID * 0.80 ELSE 0 END), 0), 2) AS LOCAL_80_PERCENT_LIVESTOCK,
    ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFL' THEN pd.AMOUNTPAID * 0.20 ELSE 0 END), 0), 2) AS NATIONAL_20_PERCENT,
    ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFD' THEN pd.AMOUNTPAID * 0.40 ELSE 0 END), 0), 2) AS LOCAL_40_PERCENT_DIVE_FEE,
    ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFD' THEN pd.AMOUNTPAID * 0.30 ELSE 0 END), 0), 2) AS BRGY_30_PERCENT,
    ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFD' THEN pd.AMOUNTPAID * 0.30 ELSE 0 END), 0), 2) AS FISHERS_30_PERCENT
FROM PAYMENT p
INNER JOIN PAYMENTDETAIL pd
    ON p.PAYMENT_ID = pd.PAYMENT_ID
INNER JOIN T_OTHERPAYMENTRATE opr
    ON pd.SOURCEID = opr.OPRATE_ID
WHERE pd.FUNDTYPE_CT = 'TF'
  AND COALESCE(p.VOID_BV, 0) = 0
  AND MONTH(p.PAYMENTDATE) = ?
  AND YEAR(p.PAYMENTDATE) = ?
  AND opr.ITAXTYPE_CT IN ('PFB', 'EP', 'ZLC', 'IFL', 'IFD')
SQL,
                [$month, $year]
            );

            return response()->json([$result]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Database query failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
