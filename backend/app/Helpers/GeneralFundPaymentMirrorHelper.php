<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;

class GeneralFundPaymentMirrorHelper
{
    private const TARGET_COLUMNS = [
        'PAYMENT_ID',
        'PAYMENTDETAIL_ID',
        'PAYMENTDATE',
        'VALUEDATE',
        'PAIDBY',
        'RECEIPTNO',
        'PAYMENT_AMOUNT',
        'PAYMODE_CT',
        'AFTYPE',
        'PAYGROUP_CT',
        'LOCAL_TIN',
        'USERID',
        'COLLECTOR',
        'VOID_BV',
        'PROV_BV',
        'AMOUNTPAID',
        'PAYMENTDETAIL_ITAXTYPE_CT',
        'CASETYPE_CT',
        'PAYMENTDETAIL_STATUS_CT',
        'SOURCEID',
        'SOURCE_CT',
        'FUNDTYPE_CT',
        'RECEIPTITEMORDER',
        'UNIT',
        'RATE_ITAXTYPE_CT',
        'OPGROUP',
        'OPSUBGROUP',
        'RATE_DESCRIPTION',
        'RATE',
        'TAX_CODE',
        'TAX_DESCRIPTION',
        'TAX_GROUP',
        'TAX_SUBGROUP',
        'TAX_MAIN_GROUP',
        'TAX_FUNDTYPE_CT',
    ];

    public static function syncPayment(string $paymentId): void
    {
        DB::table('general_fund_payment')
            ->where('PAYMENT_ID', $paymentId)
            ->delete();

        $selectQuery = DB::table('payment as p')
            ->join('paymentdetail as pd', function ($join) {
                $join->on('pd.PAYMENT_ID', '=', 'p.PAYMENT_ID')
                    ->where('pd.FUNDTYPE_CT', 'GF');
            })
            ->leftJoin('t_otherpaymentrate as opr', 'pd.SOURCEID', '=', 'opr.OPRATE_ID')
            ->leftJoin('t_itaxtype as tax', 'opr.ITAXTYPE_CT', '=', 'tax.CODE')
            ->where('p.PAYMENT_ID', $paymentId)
            ->whereRaw('COALESCE(p.VOID_BV, 0) = 0')
            ->selectRaw("
                p.PAYMENT_ID,
                pd.PAYMENTDETAIL_ID,
                p.PAYMENTDATE,
                p.VALUEDATE,
                p.PAIDBY,
                p.RECEIPTNO,
                p.AMOUNT AS PAYMENT_AMOUNT,
                p.PAYMODE_CT,
                p.AFTYPE,
                p.PAYGROUP_CT,
                p.LOCAL_TIN,
                p.USERID,
                p.COLLECTOR,
                COALESCE(p.VOID_BV, 0) AS VOID_BV,
                COALESCE(p.PROV_BV, 0) AS PROV_BV,
                pd.AMOUNTPAID,
                pd.ITAXTYPE_CT AS PAYMENTDETAIL_ITAXTYPE_CT,
                pd.CASETYPE_CT,
                pd.STATUS_CT AS PAYMENTDETAIL_STATUS_CT,
                pd.SOURCEID,
                pd.SOURCE_CT,
                pd.FUNDTYPE_CT,
                pd.RECEIPTITEMORDER,
                pd.UNIT,
                opr.ITAXTYPE_CT AS RATE_ITAXTYPE_CT,
                opr.OPGROUP,
                opr.OPSUBGROUP,
                opr.DESCRIPTION AS RATE_DESCRIPTION,
                opr.RATE,
                tax.CODE AS TAX_CODE,
                tax.DESCRIPTION AS TAX_DESCRIPTION,
                tax.IGROUP AS TAX_GROUP,
                tax.SUBGROUP AS TAX_SUBGROUP,
                tax.MAINGROUP AS TAX_MAIN_GROUP,
                tax.FUNDTYPE_CT AS TAX_FUNDTYPE_CT
            ");

        DB::table('general_fund_payment')->insertUsing(self::TARGET_COLUMNS, $selectQuery);
    }

    public static function deletePayment(string $paymentId): void
    {
        DB::table('general_fund_payment')
            ->where('PAYMENT_ID', $paymentId)
            ->delete();
    }
}
