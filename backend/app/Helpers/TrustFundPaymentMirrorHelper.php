<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;

class TrustFundPaymentMirrorHelper
{
    public static function syncAllPayments(): int
    {
        $paymentIds = DB::table('payment as p')
            ->whereRaw('COALESCE(p.VOID_BV, 0) = 0')
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('paymentdetail as pd')
                    ->whereColumn('pd.PAYMENT_ID', 'p.PAYMENT_ID')
                    ->where('pd.FUNDTYPE_CT', 'TF');
            })
            ->pluck('p.PAYMENT_ID');

        DB::table('trust_fund_payment')->truncate();

        foreach ($paymentIds as $paymentId) {
            self::syncPayment((string) $paymentId);
        }

        return count($paymentIds);
    }

    public static function syncPayment(string $paymentId, ?array $oldIdentity = null): void
    {
        if ($oldIdentity) {
            self::deleteByIdentity(
                $oldIdentity['receipt_no'] ?? null,
                $oldIdentity['type_of_receipt'] ?? null,
                $oldIdentity['date'] ?? null
            );
        }

        $payment = DB::table('payment')
            ->where('PAYMENT_ID', $paymentId)
            ->first([
                'PAYMENT_ID',
                'PAYMENTDATE',
                'PAIDBY',
                'RECEIPTNO',
                'COLLECTOR',
                'USERID',
                'AFTYPE',
                'VOID_BV',
            ]);

        if (!$payment || (int) ($payment->VOID_BV ?? 0) !== 0) {
            self::deletePayment($paymentId);
            return;
        }

        $comments = DB::table('trust_fund_payment')
            ->whereDate('DATE', $payment->PAYMENTDATE)
            ->where('RECEIPT_NO', $payment->RECEIPTNO)
            ->where('TYPE_OF_RECEIPT', $payment->AFTYPE)
            ->value('COMMENTS');

        self::deleteByIdentity($payment->RECEIPTNO, $payment->AFTYPE, $payment->PAYMENTDATE);

        $amounts = DB::table('paymentdetail as pd')
            ->leftJoin('t_otherpaymentrate as opr', 'pd.SOURCEID', '=', 'opr.OPRATE_ID')
            ->where('pd.PAYMENT_ID', $paymentId)
            ->where('pd.FUNDTYPE_CT', 'TF')
            ->selectRaw("
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'PFB' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS BUILDING_PERMIT_FEE,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'PFB' THEN pd.AMOUNTPAID * 0.80 ELSE 0 END), 0), 2) AS LOCAL_80_PERCENT,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'PFB' THEN pd.AMOUNTPAID * 0.15 ELSE 0 END), 0), 2) AS TRUST_FUND_15_PERCENT,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'PFB' THEN pd.AMOUNTPAID * 0.05 ELSE 0 END), 0), 2) AS NATIONAL_5_PERCENT,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFL' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS LIVESTOCK_DEV_FUND,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFL' THEN pd.AMOUNTPAID * 0.80 ELSE 0 END), 0), 2) AS LOCAL_80_PERCENT_LIVESTOCK,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFL' THEN pd.AMOUNTPAID * 0.20 ELSE 0 END), 0), 2) AS NATIONAL_20_PERCENT,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFD' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS DIVING_FEE,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFD' THEN pd.AMOUNTPAID * 0.40 ELSE 0 END), 0), 2) AS LOCAL_40_PERCENT_DIVE_FEE,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFD' THEN pd.AMOUNTPAID * 0.30 ELSE 0 END), 0), 2) AS FISHERS_30_PERCENT,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'IFD' THEN pd.AMOUNTPAID * 0.30 ELSE 0 END), 0), 2) AS BRGY_30_PERCENT,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'EP' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS ELECTRICAL_FEE,
                ROUND(COALESCE(SUM(CASE WHEN opr.ITAXTYPE_CT = 'ZLC' THEN pd.AMOUNTPAID ELSE 0 END), 0), 2) AS ZONING_FEE
            ")
            ->first();

        if (!$amounts) {
            return;
        }

        DB::table('trust_fund_payment')->insert([
            'DATE' => substr((string) $payment->PAYMENTDATE, 0, 10),
            'NAME' => $payment->PAIDBY,
            'RECEIPT_NO' => $payment->RECEIPTNO,
            'CASHIER' => $payment->COLLECTOR ?: $payment->USERID,
            'TYPE_OF_RECEIPT' => $payment->AFTYPE,
            'BUILDING_PERMIT_FEE' => $amounts->BUILDING_PERMIT_FEE ?? 0,
            'LOCAL_80_PERCENT' => $amounts->LOCAL_80_PERCENT ?? 0,
            'TRUST_FUND_15_PERCENT' => $amounts->TRUST_FUND_15_PERCENT ?? 0,
            'NATIONAL_5_PERCENT' => $amounts->NATIONAL_5_PERCENT ?? 0,
            'LIVESTOCK_DEV_FUND' => $amounts->LIVESTOCK_DEV_FUND ?? 0,
            'LOCAL_80_PERCENT_LIVESTOCK' => $amounts->LOCAL_80_PERCENT_LIVESTOCK ?? 0,
            'NATIONAL_20_PERCENT' => $amounts->NATIONAL_20_PERCENT ?? 0,
            'DIVING_FEE' => $amounts->DIVING_FEE ?? 0,
            'LOCAL_40_PERCENT_DIVE_FEE' => $amounts->LOCAL_40_PERCENT_DIVE_FEE ?? 0,
            'FISHERS_30_PERCENT' => $amounts->FISHERS_30_PERCENT ?? 0,
            'BRGY_30_PERCENT' => $amounts->BRGY_30_PERCENT ?? 0,
            'ELECTRICAL_FEE' => $amounts->ELECTRICAL_FEE ?? 0,
            'ZONING_FEE' => $amounts->ZONING_FEE ?? 0,
            'COMMENTS' => $comments,
        ]);
    }

    public static function deletePayment(string $paymentId): void
    {
        $payment = DB::table('payment')
            ->where('PAYMENT_ID', $paymentId)
            ->first(['PAYMENTDATE', 'RECEIPTNO', 'AFTYPE']);

        if (!$payment) {
            return;
        }

        self::deleteByIdentity($payment->RECEIPTNO, $payment->AFTYPE, $payment->PAYMENTDATE);
    }

    private static function deleteByIdentity(?string $receiptNo, ?string $typeOfReceipt, ?string $date): void
    {
        if (!$receiptNo || !$typeOfReceipt || !$date) {
            return;
        }

        DB::table('trust_fund_payment')
            ->whereDate('DATE', $date)
            ->where('RECEIPT_NO', $receiptNo)
            ->where('TYPE_OF_RECEIPT', $typeOfReceipt)
            ->delete();
    }
}
