<?php

namespace App\Http\Controllers;

use App\Helpers\CommunityTaxCertificateQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\QueryHelpers;

class CommunityTaxCertificateCedulaDailyCollectionController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('community_tax_certificate_payment')
            ->selectRaw("
                DATE(DATEISSUED) AS issued_date,
                DATE_FORMAT(DATEISSUED, '%b %d, %Y') AS DATE,
                SUM(COALESCE(BASICTAXDUE, 0)) AS BASIC,
                SUM(
                    COALESCE(BUSTAXDUE, 0) +
                    COALESCE(SALTAXDUE, 0) +
                    COALESCE(RPTAXDUE, 0)
                ) AS TAX_DUE,
                SUM(COALESCE(INTEREST, 0)) AS INTEREST,
                SUM(COALESCE(TOTALAMOUNTPAID, 0)) AS TOTAL
            ");

        CommunityTaxCertificateQueryHelper::applyActiveFilter($query);
        QueryHelpers::addDateFilters($query, $request, 'DATEISSUED');

        $results = $query
            ->groupBy('issued_date')
            ->groupBy('DATE')
            ->orderBy('issued_date')
            ->get()
            ->map(function ($row) {
                return [
                    'DATE' => $row->DATE,
                    'BASIC' => (float) ($row->BASIC ?? 0),
                    'TAX_DUE' => (float) ($row->TAX_DUE ?? 0),
                    'INTEREST' => (float) ($row->INTEREST ?? 0),
                    'TOTAL' => (float) ($row->TOTAL ?? 0),
                    'COMMENT' => '',
                ];
            })
            ->values();

        return response()->json($results);
    }
}
