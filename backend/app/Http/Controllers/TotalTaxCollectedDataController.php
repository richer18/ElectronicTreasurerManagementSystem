<?php

namespace App\Http\Controllers;

use App\Helpers\CommunityTaxCertificateQueryHelper;
use App\Helpers\RealPropertyTaxQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TotalTaxCollectedDataController extends Controller
{
    public function monthlyData(Request $request)
    {
        $months = range(1, 12);
        $year = (int) $request->query('year', now()->year);

        $result = collect($months)->map(function ($month) use ($year) {
            $cedula = DB::table('community_tax_certificate_payment');
            CommunityTaxCertificateQueryHelper::applyActiveFilter($cedula);
            $cedula = $cedula
                ->whereYear('DATEISSUED', $year)
                ->whereMonth('DATEISSUED', $month)
                ->sum('TOTALAMOUNTPAID');

            $general = DB::table('general_fund_payment')
                ->whereYear('PAYMENTDATE', $year)
                ->whereMonth('PAYMENTDATE', $month)
                ->where(function ($query) {
                    $query->whereNull('VOID_BV')->orWhere('VOID_BV', 0);
                })
                ->sum('AMOUNTPAID');

            $real = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table('real_property_tax_payment'))
                ->whereYear('DATE', $year)
                ->whereMonth('DATE', $month)
                ->sum('BASIC_AND_SEF');

            $trust = DB::table('trust_fund_payment')
                ->whereYear('DATE', $year)
                ->whereMonth('DATE', $month)
                ->sum('TOTAL');

            return [
                'month' => date('M', mktime(0, 0, 0, $month, 1)),
                'value' => (float) round($cedula + $general + $real + $trust, 2),
            ];
        });

        return response()->json($result);
    }

    public function yearlyBreakdown(Request $request)
    {
        $year = (int) $request->query('year', now()->year);

        $cedula = DB::table('community_tax_certificate_payment');
        CommunityTaxCertificateQueryHelper::applyActiveFilter($cedula);
        $cedulaTotal = (float) $cedula
            ->whereYear('DATEISSUED', $year)
            ->sum('TOTALAMOUNTPAID');

        $generalTotal = (float) DB::table('general_fund_payment')
            ->whereYear('PAYMENTDATE', $year)
            ->where(function ($query) {
                $query->whereNull('VOID_BV')->orWhere('VOID_BV', 0);
            })
            ->sum('AMOUNTPAID');

        $realTotal = (float) RealPropertyTaxQueryHelper::applyActiveFilter(DB::table('real_property_tax_payment'))
            ->whereYear('DATE', $year)
            ->sum('BASIC_AND_SEF');

        $trustTotal = (float) DB::table('trust_fund_payment')
            ->whereYear('DATE', $year)
            ->sum('TOTAL');

        return response()->json([
            ['label' => 'RPT', 'value' => round($realTotal, 2)],
            ['label' => 'Cedula', 'value' => round($cedulaTotal, 2)],
            ['label' => 'GF', 'value' => round($generalTotal, 2)],
            ['label' => 'TF', 'value' => round($trustTotal, 2)],
        ]);
    }

    public function topTaxpayers(Request $request)
    {
        $year = (int) $request->query('year', now()->year);

        $general = DB::table('general_fund_payment_main_view')
            ->whereYear('date', $year)
            ->selectRaw("COALESCE(NULLIF(TRIM(name), ''), 'Unknown') AS taxpayer, COALESCE(total, 0) AS amount");

        $trust = DB::table('trust_fund_payment')
            ->whereYear('DATE', $year)
            ->selectRaw("COALESCE(NULLIF(TRIM(NAME), ''), 'Unknown') AS taxpayer, COALESCE(TOTAL, 0) AS amount");

        $cedula = DB::table('community_tax_certificate_payment');
        CommunityTaxCertificateQueryHelper::applyActiveFilter($cedula);
        $cedula = $cedula
            ->whereYear('DATEISSUED', $year)
            ->selectRaw("COALESCE(NULLIF(TRIM(OWNERNAME), ''), 'Unknown') AS taxpayer, COALESCE(TOTALAMOUNTPAID, 0) AS amount");

        $rpt = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table('real_property_tax_payment'))
            ->whereYear('DATE', $year)
            ->selectRaw("COALESCE(NULLIF(TRIM(NAME_OF_TAXPAYER), ''), 'Unknown') AS taxpayer, COALESCE(BASIC_AND_SEF, 0) AS amount");

        $union = $general
            ->unionAll($trust)
            ->unionAll($cedula)
            ->unionAll($rpt);

        $rows = DB::query()
            ->fromSub($union, 'tax_collections')
            ->selectRaw('taxpayer, ROUND(SUM(amount), 2) AS amount')
            ->groupBy('taxpayer')
            ->orderByDesc('amount')
            ->limit(10)
            ->get();

        return response()->json($rows);
    }
}
