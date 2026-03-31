<?php

namespace App\Http\Controllers;

use App\Helpers\CommunityTaxCertificateQueryHelper;
use App\Helpers\GeneralFundPaymentSummaryHelper;
use App\Helpers\RealPropertyTaxQueryHelper;
use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RcdSuggestedCollectionController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'collector' => 'nullable|string|max:100',
        ]);

        $date = $validated['date'];
        $collector = trim((string) ($validated['collector'] ?? ''));

        $gf = DB::table('general_fund_payment as gf')
            ->selectRaw("
                DATE(gf.PAYMENTDATE) as collection_date,
                COALESCE(NULLIF(gf.COLLECTOR, ''), gf.USERID) as collector,
                'GF' as module,
                COALESCE(gf.FUNDTYPE_CT, 'GF') as fund,
                COALESCE(gf.AFTYPE, 'GF') as type_of_receipt,
                MIN(gf.RECEIPTNO) as receipt_no_from,
                MAX(gf.RECEIPTNO) as receipt_no_to,
                ROUND(SUM(COALESCE(gf.AMOUNTPAID, 0)), 2) as total_amount,
                COUNT(DISTINCT gf.PAYMENT_ID) as receipt_count
            ")
            ->whereDate('gf.PAYMENTDATE', $date)
            ->where('gf.FUNDTYPE_CT', 'GF')
            ->whereNotIn('gf.AFTYPE', ['CTC', 'AF56']);
        GeneralFundPaymentSummaryHelper::applyActiveFilter($gf, 'gf');
        if ($collector !== '') {
            $gf->where(function ($query) use ($collector) {
                $query
                    ->where('gf.COLLECTOR', 'like', "%{$collector}%")
                    ->orWhere('gf.USERID', 'like', "%{$collector}%");
            });
        }
        $gf = $gf
            ->groupBy(DB::raw('DATE(gf.PAYMENTDATE)'), DB::raw("COALESCE(NULLIF(gf.COLLECTOR, ''), gf.USERID)"), 'gf.FUNDTYPE_CT', 'gf.AFTYPE')
            ->get();

        $tf = DB::table('trust_fund_payment_main_view as tf')
            ->selectRaw("
                tf.DATE as collection_date,
                tf.CASHIER as collector,
                'TF' as module,
                'TF' as fund,
                COALESCE(tf.TYPE_OF_RECEIPT, 'TF') as type_of_receipt,
                MIN(tf.RECEIPT_NO) as receipt_no_from,
                MAX(tf.RECEIPT_NO) as receipt_no_to,
                ROUND(SUM(COALESCE(tf.TOTAL, 0)), 2) as total_amount,
                COUNT(DISTINCT tf.PAYMENT_ID) as receipt_count
            ")
            ->whereDate('tf.DATE', $date)
            ->whereNotNull('tf.RECEIPT_NO');
        TrustFundPaymentSummaryHelper::applyActiveFilter($tf, 'tf');
        if ($collector !== '') {
            $tf->where('tf.CASHIER', 'like', "%{$collector}%");
        }
        $tf = $tf
            ->groupBy('tf.DATE', 'tf.CASHIER', 'tf.TYPE_OF_RECEIPT')
            ->get();

        $ctc = DB::table('community_tax_certificate_payment as c')
            ->selectRaw("
                c.DATEISSUED as collection_date,
                c.USERID as collector,
                'CTC' as module,
                'GF' as fund,
                'CTC' as type_of_receipt,
                MIN(c.CTCNO) as receipt_no_from,
                MAX(c.CTCNO) as receipt_no_to,
                ROUND(SUM(COALESCE(c.TOTALAMOUNTPAID, 0)), 2) as total_amount,
                COUNT(DISTINCT c.CTC_ID) as receipt_count
            ")
            ->whereDate('c.DATEISSUED', $date);
        CommunityTaxCertificateQueryHelper::applyActiveFilter($ctc, 'c');
        if ($collector !== '') {
            $ctc->where('c.USERID', 'like', "%{$collector}%");
        }
        $ctc = $ctc
            ->groupBy('c.DATEISSUED', 'c.USERID')
            ->get();

        $rptQuery = DB::table('real_property_tax_payment as rpt')
            ->selectRaw("
                rpt.DATE as collection_date,
                rpt.CASHIER as collector,
                'RPT' as module,
                'RPT' as fund,
                'RPT' as type_of_receipt,
                MIN(rpt.OR_NO) as receipt_no_from,
                MAX(rpt.OR_NO) as receipt_no_to,
                ROUND(SUM(COALESCE(rpt.BASIC_AND_SEF, 0)), 2) as total_amount,
                COUNT(DISTINCT rpt.ID) as receipt_count
            ")
            ->whereDate('rpt.DATE', $date);
        RealPropertyTaxQueryHelper::applyActiveFilter($rptQuery, 'rpt');
        if ($collector !== '') {
            $rptQuery->where('rpt.CASHIER', 'like', "%{$collector}%");
        }
        $rpt = $rptQuery
            ->groupBy('rpt.DATE', 'rpt.CASHIER')
            ->get();

        $results = collect()
            ->concat($gf)
            ->concat($tf)
            ->concat($ctc)
            ->concat($rpt)
            ->map(function ($row) {
                return [
                    'collection_date' => $row->collection_date,
                    'collector' => $row->collector,
                    'module' => $row->module,
                    'fund' => $row->fund,
                    'type_of_receipt' => $row->type_of_receipt,
                    'receipt_no_from' => (string) ($row->receipt_no_from ?? ''),
                    'receipt_no_to' => (string) ($row->receipt_no_to ?? ''),
                    'total_amount' => (float) ($row->total_amount ?? 0),
                    'receipt_count' => (int) ($row->receipt_count ?? 0),
                ];
            })
            ->values();

        return response()->json($results);
    }
}
