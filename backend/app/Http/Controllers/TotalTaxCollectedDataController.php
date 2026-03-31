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

            $general = DB::table('payment as p')
                ->join('paymentdetail as pd', 'pd.PAYMENT_ID', '=', 'p.PAYMENT_ID')
                ->whereYear('p.PAYMENTDATE', $year)
                ->whereMonth('p.PAYMENTDATE', $month)
                ->where('pd.FUNDTYPE_CT', 'GF')
                ->where(function ($query) {
                    $query->whereNull('p.VOID_BV')->orWhere('p.VOID_BV', 0);
                })
                ->whereNotIn('p.AFTYPE', ['CTC', 'AF56'])
                ->where(function ($query) {
                    $query->whereNull('p.STATUS_CT')->orWhere('p.STATUS_CT', '<>', 'CNL');
                })
                ->where(function ($query) {
                    $query->whereNull('pd.STATUS_CT')->orWhere('pd.STATUS_CT', '<>', 'CNL');
                })
                ->sum('pd.AMOUNTPAID');

            $real = RealPropertyTaxQueryHelper::applyActiveFilter(DB::table('real_property_tax_payment'))
                ->whereYear('DATE', $year)
                ->whereMonth('DATE', $month)
                ->sum('BASIC_AND_SEF');

            $trust = DB::table('payment as p')
                ->join('paymentdetail as pd', 'pd.PAYMENT_ID', '=', 'p.PAYMENT_ID')
                ->whereYear('p.PAYMENTDATE', $year)
                ->whereMonth('p.PAYMENTDATE', $month)
                ->where('pd.FUNDTYPE_CT', 'TF')
                ->where(function ($query) {
                    $query->whereNull('p.VOID_BV')->orWhere('p.VOID_BV', 0);
                })
                ->whereNotIn('p.AFTYPE', ['CTC', 'AF56'])
                ->where(function ($query) {
                    $query->whereNull('p.STATUS_CT')->orWhere('p.STATUS_CT', '<>', 'CNL');
                })
                ->where(function ($query) {
                    $query->whereNull('pd.STATUS_CT')->orWhere('pd.STATUS_CT', '<>', 'CNL');
                })
                ->sum('pd.AMOUNTPAID');

            return [
                'month' => date('M', mktime(0, 0, 0, $month, 1)),
                'value' => (float) round($cedula + $general + $real + $trust, 2),
            ];
        });

        return response()->json($result);
    }
}
