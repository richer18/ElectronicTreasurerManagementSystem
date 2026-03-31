<?php

namespace App\Http\Controllers;

use App\Helpers\CommunityTaxCertificateQueryHelper;
use App\Helpers\GeneralFundPaymentSummaryHelper;
use App\Helpers\RealPropertyTaxQueryHelper;
use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataGenerateReportController extends Controller
{
    public function generate(Request $request)
    {
        $dateType = $request->input('dateType');
        $dateFrom = $request->input('dateFrom');
        $dateTo = $request->input('dateTo');
        $reportType = $request->input('reportType');
        $cashier = $request->input('cashier');
        $ctcnFrom = $request->input('ctcnFrom') ?? $request->input('orFrom');
        $ctcnTo = $request->input('ctcnTo') ?? $request->input('orTo');
        $orFrom = $request->input('orFrom');
        $orTo = $request->input('orTo');

        if (!$dateFrom || !$dateTo || !$cashier || !$reportType) {
            return response()->json(['error' => 'Missing required fields'], 400);
        }

        if ($dateType === 'monthYear') {
            [$year, $month] = explode('-', $dateFrom);
            $startDate = "{$year}-{$month}-01";
            $endDate = date('Y-m-t', strtotime($startDate));
        } else {
            $startDate = $dateFrom;
            $endDate = $dateTo;
        }

        try {
            if ($reportType === 'RPT') {
                $query = DB::table('real_property_tax_payment')
                    ->selectRaw("
                        DATE_FORMAT(DATE, '%Y-%m-%d') AS date,
                        CASHIER AS cashier,
                        'RPT' AS report_type,
                        OR_NO AS or_number,
                        CAST(BASIC_AND_SEF AS DECIMAL(10,2)) AS total
                    ")
                    ->whereBetween('DATE', [$startDate, $endDate])
                    ->where('CASHIER', $cashier);

                RealPropertyTaxQueryHelper::applyActiveFilter($query);

                if ($orFrom && $orTo) {
                    $query->whereBetween('OR_NO', [$orFrom, $orTo]);
                }

                return response()->json(['data' => $this->normalizeRows($query->get())]);
            }

            if ($reportType === 'CTCI') {
                $query = DB::table('community_tax_certificate_payment')
                    ->selectRaw("
                        DATE_FORMAT(DATEISSUED, '%Y-%m-%d') AS date,
                        USERID AS cashier,
                        CTCTYPE AS report_type,
                        CTCNO AS or_number,
                        CAST(TOTALAMOUNTPAID AS DECIMAL(10,2)) AS total
                    ")
                    ->whereBetween('DATEISSUED', [$startDate, $endDate])
                    ->where('USERID', $cashier)
                    ->where('CTCTYPE', $reportType);

                CommunityTaxCertificateQueryHelper::applyActiveFilter($query);

                if ($ctcnFrom && $ctcnTo) {
                    $query->whereBetween('CTCNO', [$ctcnFrom, $ctcnTo]);
                }

                return response()->json(['data' => $this->normalizeRows($query->get())]);
            }

            if ($reportType === 'GF') {
                $rows = $this->buildGeneralFundReceiptQuery($startDate, $endDate, $cashier, $orFrom, $orTo);
                return response()->json(['data' => $this->normalizeRows($rows)]);
            }

            if ($reportType === 'TF') {
                $rows = $this->buildTrustFundReceiptQuery($startDate, $endDate, $cashier, $orFrom, $orTo);
                return response()->json(['data' => $this->normalizeRows($rows)]);
            }

            if ($reportType === '51') {
                $generalFundRows = $this->buildGeneralFundReceiptQuery($startDate, $endDate, $cashier, $orFrom, $orTo);

                if (strtoupper($cashier) === 'AMABELLA') {
                    return response()->json(['data' => $this->normalizeRows($generalFundRows)]);
                }

                $trustFundRows = collect($this->buildTrustFundReceiptQuery($startDate, $endDate, $cashier, $orFrom, $orTo));

                $merged = collect($generalFundRows)
                    ->concat($trustFundRows)
                    ->sortBy([
                        ['date', 'asc'],
                        ['or_number', 'asc'],
                    ])
                    ->values();

                return response()->json(['data' => $this->normalizeRows($merged)]);
            }

            return response()->json(['error' => 'Unsupported report type'], 400);
        } catch (\Exception $e) {
            Log::error('Error generating report: ' . $e->getMessage());
            return response()->json(['error' => 'Error generating report'], 500);
        }
    }

    private function buildGeneralFundReceiptQuery(
        string $startDate,
        string $endDate,
        string $cashier,
        ?string $orFrom,
        ?string $orTo
    ) {
        $cashierUpper = strtoupper($cashier);

        $query = DB::table('general_fund_payment as gfp')
            ->where('gfp.FUNDTYPE_CT', 'GF')
            ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56'])
            ->whereIn('gfp.AFTYPE', ['51', 'AF51'])
            ->whereDate('gfp.PAYMENTDATE', '>=', $startDate)
            ->whereDate('gfp.PAYMENTDATE', '<=', $endDate)
            ->whereRaw("UPPER(COALESCE(NULLIF(gfp.COLLECTOR, ''), gfp.USERID)) = ?", [$cashierUpper])
            ->groupBy('gfp.PAYMENT_ID', DB::raw('DATE(gfp.PAYMENTDATE)'))
            ->selectRaw("
                DATE(gfp.PAYMENTDATE) AS date,
                UPPER(MAX(COALESCE(NULLIF(gfp.COLLECTOR, ''), gfp.USERID))) AS cashier,
                'GF' AS report_type,
                MAX(gfp.RECEIPTNO) AS or_number,
                ROUND(SUM(COALESCE(gfp.AMOUNTPAID, 0)), 2) AS total,
                ROUND(SUM(CASE WHEN gfp.SOURCEID = '961' THEN COALESCE(gfp.AMOUNTPAID, 0) ELSE 0 END), 2) AS cash_tickets_total
            ");

        GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');

        if ($orFrom && $orTo) {
            $query->whereBetween('gfp.RECEIPTNO', [$orFrom, $orTo]);
        }

        if ($cashierUpper === 'AMABELLA') {
            $query->havingRaw('cash_tickets_total > 0')
                ->selectRaw('ROUND(SUM(CASE WHEN gfp.SOURCEID = \'961\' THEN COALESCE(gfp.AMOUNTPAID, 0) ELSE 0 END), 2) AS filtered_total');
        }

        $rows = $query
            ->orderBy('date')
            ->orderBy('or_number')
            ->get();

        if ($cashierUpper !== 'AMABELLA') {
            return $rows;
        }

        return $rows->map(function ($row) {
            $row->total = (float) ($row->filtered_total ?? $row->cash_tickets_total ?? 0);
            return $row;
        });
    }

    private function buildTrustFundReceiptQuery(
        string $startDate,
        string $endDate,
        string $cashier,
        ?string $orFrom,
        ?string $orTo
    ) {
        $query = DB::table('trust_fund_payment_main_view')
            ->whereDate('date', '>=', $startDate)
            ->whereDate('date', '<=', $endDate)
            ->whereRaw('UPPER(COALESCE(cashier, \'\')) = ?', [strtoupper($cashier)])
            ->whereIn('type_of_receipt', ['51', 'AF51'])
            ->selectRaw("
                DATE_FORMAT(date, '%Y-%m-%d') AS date,
                UPPER(cashier) AS cashier,
                'TF' AS report_type,
                receipt_no AS or_number,
                CAST(total AS DECIMAL(10,2)) AS total
            ");

        TrustFundPaymentSummaryHelper::applyActiveFilter($query);

        if ($orFrom && $orTo) {
            $query->whereBetween('receipt_no', [$orFrom, $orTo]);
        }

        return $query
            ->orderBy('date')
            ->orderBy('or_number')
            ->get();
    }

    private function normalizeRows(iterable $rows): array
    {
        return collect($rows)->map(function ($row) {
            return [
                'date' => $row->date ?? null,
                'cashier' => $row->cashier ?? null,
                'report_type' => $row->report_type ?? null,
                'or_number' => $row->or_number ?? null,
                'total' => (float) ($row->total ?? 0),
            ];
        })->values()->all();
    }
}
