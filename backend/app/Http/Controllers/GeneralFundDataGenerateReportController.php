<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataGenerateReportController extends Controller
{
    public function generate(Request $request)
    {
        $dateType   = $request->input('dateType');
        $dateFrom   = $request->input('dateFrom');
        $dateTo     = $request->input('dateTo');
        $reportType = $request->input('reportType');
        $cashier    = $request->input('cashier');
        $ctcnFrom   = $request->input('ctcnFrom') ?? $request->input('orFrom');
        $ctcnTo     = $request->input('ctcnTo') ?? $request->input('orTo');
        $orFrom     = $request->input('orFrom');
        $orTo       = $request->input('orTo');

        // Validate required fields
        if (!$dateFrom || !$dateTo || !$cashier || !$reportType) {
            return response()->json(['error' => 'Missing required fields'], 400);
        }

        // Format date range
        if ($dateType === 'monthYear') {
            [$year, $month] = explode('-', $dateFrom);
            $startDate = "{$year}-{$month}-01";
            $endDate = date('Y-m-t', strtotime($startDate));
        } else {
            $startDate = $dateFrom;
            $endDate = $dateTo;
        }

        $query      = '';
        $queryParams = [];

        try {
            if ($reportType === 'real_property_tax_data') {
                $query = "
                    SELECT
                        DATE_FORMAT(DATE, '%Y-%m-%d') AS date,
                        CASHIER AS cashier,
                        'RPT' AS report_type,
                        OR_NO AS or_number,
                        CAST(BASIC_AND_SEF AS DECIMAL(10,2)) AS total
                    FROM real_property_tax_payment
                    WHERE DATE BETWEEN ? AND ? AND CASHIER = ?
                ";
                $queryParams = [$startDate, $endDate, $cashier];

                if ($orFrom && $orTo) {
                    $query .= " AND OR_NO BETWEEN ? AND ?";
                    array_push($queryParams, $orFrom, $orTo);
                }

            } elseif ($reportType === 'CTCI') {
                $query = "
                    SELECT
                        DATE_FORMAT(DATEISSUED, '%Y-%m-%d') AS date,
                        USERID AS cashier,
                        CTCTYPE AS report_type,
                        CTCNO AS or_number,
                        CAST(TOTALAMOUNTPAID AS DECIMAL(10,2)) AS total
                    FROM cedula
                    WHERE DATEISSUED BETWEEN ? AND ? AND USERID = ? AND CTCTYPE = ?
                ";
                $queryParams = [$startDate, $endDate, $cashier, $reportType];

                if ($ctcnFrom && $ctcnTo) {
                    $query .= " AND CTCNO BETWEEN ? AND ?";
                    array_push($queryParams, $ctcnFrom, $ctcnTo);
                }

            } elseif ($reportType === 'GF') {
                if (strtoupper($cashier) === 'AMABELLA') {
                    $query = "
                        SELECT
                            DATE_FORMAT(date, '%Y-%m-%d') AS date,
                            cashier,
                            'GF' AS report_type,
                            receipt_no AS or_number,
                            CAST(Cash_Tickets AS DECIMAL(10,2)) AS total
                        FROM general_fund_data
                        WHERE date BETWEEN ? AND ? AND cashier = ? AND type_receipt = '51' AND Cash_Tickets > 0
                    ";
                    $queryParams = [$startDate, $endDate, $cashier];

                    if ($orFrom && $orTo) {
                        $query .= " AND receipt_no BETWEEN ? AND ?";
                        array_push($queryParams, $orFrom, $orTo);
                    }

                } else {
                    $query = "
                        SELECT
                            DATE_FORMAT(date, '%Y-%m-%d') AS date,
                            cashier,
                            'GF' AS report_type,
                            receipt_no AS or_number,
                            CAST(total AS DECIMAL(10,2)) AS total
                        FROM general_fund_data
                        WHERE date BETWEEN ? AND ? AND cashier = ? AND type_receipt = '51'
                    ";
                    $queryParams = [$startDate, $endDate, $cashier];

                    if ($orFrom && $orTo) {
                        $query .= " AND receipt_no BETWEEN ? AND ?";
                        array_push($queryParams, $orFrom, $orTo);
                    }
                }
            } elseif ($reportType === 'TF') {
                $query = "
                    SELECT
                        DATE_FORMAT(date, '%Y-%m-%d') AS date,
                        cashier,
                        'TF' AS report_type,
                        receipt_no AS or_number,
                        CAST(total AS DECIMAL(10,2)) AS total
                    FROM trust_fund_data
                    WHERE date BETWEEN ? AND ? AND cashier = ? AND TYPE_OF_RECEIPT = '51'
                ";
                $queryParams = [$startDate, $endDate, $cashier];

                if ($orFrom && $orTo) {
                    $query .= " AND receipt_no BETWEEN ? AND ?";
                    array_push($queryParams, $orFrom, $orTo);
                }
            } elseif ($reportType === '51') {
                if (strtoupper($cashier) === 'AMABELLA') {
                    $query = "
                        SELECT
                            DATE_FORMAT(date, '%Y-%m-%d') AS date,
                            cashier,
                            'GF' AS report_type,
                            receipt_no AS or_number,
                            CAST(Cash_Tickets AS DECIMAL(10,2)) AS total
                        FROM general_fund_data
                        WHERE date BETWEEN ? AND ? AND cashier = ? AND type_receipt = '51' AND Cash_Tickets > 0
                    ";
                    $queryParams = [$startDate, $endDate, $cashier];

                    if ($orFrom && $orTo) {
                        $query .= " AND receipt_no BETWEEN ? AND ?";
                        array_push($queryParams, $orFrom, $orTo);
                    }

                } else {
                    $query = "
                        (
                            SELECT
                                DATE_FORMAT(date, '%Y-%m-%d') AS date,
                                cashier,
                                'GF' AS report_type,
                                receipt_no AS or_number,
                                CAST(total AS DECIMAL(10,2)) AS total
                            FROM general_fund_data
                            WHERE date BETWEEN ? AND ? AND cashier = ? AND type_receipt = '51'
                    ";
                    $queryParams = [$startDate, $endDate, $cashier];

                    if ($orFrom && $orTo) {
                        $query .= " AND receipt_no BETWEEN ? AND ?";
                        array_push($queryParams, $orFrom, $orTo);
                    }

                    $query .= ")
                        UNION ALL
                        (
                            SELECT
                                DATE_FORMAT(date, '%Y-%m-%d') AS date,
                                cashier,
                                'TF' AS report_type,
                                receipt_no AS or_number,
                                CAST(total AS DECIMAL(10,2)) AS total
                            FROM trust_fund_data
                            WHERE date BETWEEN ? AND ? AND cashier = ? AND TYPE_OF_RECEIPT = '51'
                    ";
                    array_push($queryParams, $startDate, $endDate, $cashier);

                    if ($orFrom && $orTo) {
                        $query .= " AND receipt_no BETWEEN ? AND ?";
                        array_push($queryParams, $orFrom, $orTo);
                    }

                    $query .= ") ORDER BY date";
                }
            } else {
                return response()->json(['error' => 'Unsupported report type'], 400);
            }

            $results = DB::select($query, $queryParams);

            $processedData = array_map(function ($row) {
                return [
                    'date'        => $row->date ?? null,
                    'cashier'     => $row->cashier,
                    'report_type' => $row->report_type,
                    'or_number'   => $row->or_number,
                    'total'       => (float) $row->total,
                ];
            }, $results);

            return response()->json(['data' => $processedData]);

        } catch (\Exception $e) {
            Log::error('Error generating report: ' . $e->getMessage());
            return response()->json(['error' => 'Error generating report'], 500);
        }
    }
}
