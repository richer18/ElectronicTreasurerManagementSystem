<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RegulatoryFeesAndChargesBreakdownDataController extends Controller
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
            $generalFund = DB::table('general_fund_payment as gfp')
                ->where('gfp.FUNDTYPE_CT', 'GF')
                ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56'])
                ->whereYear('gfp.PAYMENTDATE', $year);

            GeneralFundPaymentSummaryHelper::applyActiveFilter($generalFund, 'gfp');
            if (!empty($monthList)) {
                $generalFund->whereIn(DB::raw('MONTH(gfp.PAYMENTDATE)'), $monthList);
            }

            $gfRow = $generalFund
                ->selectRaw(GeneralFundPaymentSummaryHelper::detailSelectRaw('gfp', 'gfp'))
                ->first();

            $trustFund = DB::table('trust_fund_payment')
                ->whereYear('DATE', $year);

            \App\Helpers\TrustFundPaymentSummaryHelper::applyActiveFilter($trustFund);
            if (!empty($monthList)) {
                $trustFund->whereIn(DB::raw('MONTH(DATE)'), $monthList);
            }

            $tfRow = $trustFund
                ->selectRaw('
                    COALESCE(SUM(BUILDING_PERMIT_FEE), 0) AS BUILDING_PERMIT_FEE,
                    COALESCE(SUM(ELECTRICAL_FEE), 0) AS ELECTRICAL_FEE,
                    COALESCE(SUM(LIVESTOCK_DEV_FUND), 0) AS LIVESTOCK_DEV_FUND,
                    COALESCE(SUM(DIVING_FEE), 0) AS DIVING_FEE,
                    COALESCE(SUM(ZONING_FEE), 0) AS ZONING_FEE
                ')
                ->first();

            $breakdown = [
                ['category' => 'WEIGHS AND MEASURE', 'total_amount' => (float) ($gfRow->Weighs_Measure ?? 0)],
                ['category' => 'TRICYCLE PERMIT FEE', 'total_amount' => (float) ($gfRow->Tricycle_Operators ?? 0)],
                ['category' => 'OCCUPATION TAX', 'total_amount' => (float) ($gfRow->Occupation_Tax ?? 0)],
                [
                    'category' => 'OTHER PERMITS AND LICENSE',
                    'total_amount' => (float) (
                        ($gfRow->Docking_Mooring_Fee ?? 0) +
                        ($gfRow->Cockpit_Prov_Share ?? 0) +
                        ($gfRow->Cockpit_Local_Share ?? 0) +
                        ($gfRow->Sultadas ?? 0) +
                        ($gfRow->Miscellaneous_Fee ?? 0) +
                        ($gfRow->Fishing_Permit_Fee ?? 0) +
                        ($gfRow->Sale_of_Agri_Prod ?? 0) +
                        ($gfRow->Sale_of_Acct_Form ?? 0) +
                        ($tfRow->LIVESTOCK_DEV_FUND ?? 0) +
                        ($tfRow->DIVING_FEE ?? 0)
                    ),
                ],
                [
                    'category' => 'CIVIL REGISTRATION',
                    'total_amount' => (float) (
                        ($gfRow->Reg_of_Birth ?? 0) +
                        ($gfRow->Marriage_Fees ?? 0) +
                        ($gfRow->Burial_Fees ?? 0) +
                        ($gfRow->Correction_of_Entry ?? 0)
                    ),
                ],
                [
                    'category' => 'CATTLE/ANIMAL REGISTRATION FEES',
                    'total_amount' => (float) (
                        ($gfRow->Cert_of_Ownership ?? 0) +
                        ($gfRow->Cert_of_Transfer ?? 0)
                    ),
                ],
                [
                    'category' => 'BUILDING PERMITS',
                    'total_amount' => (float) (
                        ($tfRow->BUILDING_PERMIT_FEE ?? 0) +
                        ($tfRow->ELECTRICAL_FEE ?? 0)
                    ),
                ],
                ['category' => 'BUSINESS PERMITS', 'total_amount' => (float) ($gfRow->Mayors_Permit ?? 0)],
                ['category' => 'ZONING/LOCATION PERMIT FEES', 'total_amount' => (float) ($tfRow->ZONING_FEE ?? 0)],
            ];

            return response()->json([
                'year' => $year,
                'months' => $monthList,
                'currency' => 'PHP',
                'breakdown' => $breakdown,
            ]);
        } catch (\Exception $e) {
            Log::error('Regulatory Fees DB error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Database error',
                'code' => 'DB_ERROR'
            ], 500);
        }
    }
}
