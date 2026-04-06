<?php

namespace App\Http\Controllers;

use App\Helpers\CommunityTaxCertificateQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityTaxCertificateSummaryCollectionDataReportController extends Controller
{
    public function index(Request $request)
    {
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);

        $totalAmountPaid = DB::table('community_tax_certificate_payment');
        CommunityTaxCertificateQueryHelper::applyActiveFilter($totalAmountPaid);
        $totalAmountPaid = $totalAmountPaid
            ->whereYear('DATEISSUED', $year)
            ->whereMonth('DATEISSUED', $month)
            ->sum('TOTALAMOUNTPAID');

        return response()->json([
            'month' => $month,
            'year' => $year,
            'Totalamountpaid' => (float) $totalAmountPaid,
        ]);
    }

    public function monthlyTrend(Request $request)
    {
        $year = (int) $request->query('year', now()->year);

        $rows = collect(range(1, 12))->map(function ($month) use ($year) {
            $collected = DB::table('community_tax_certificate_payment');
            CommunityTaxCertificateQueryHelper::applyActiveFilter($collected);
            $collected = $collected
                ->whereYear('DATEISSUED', $year)
                ->whereMonth('DATEISSUED', $month)
                ->sum('TOTALAMOUNTPAID');

            return [
                'month' => date('M', mktime(0, 0, 0, $month, 1)),
                'collected' => (float) round($collected, 2),
            ];
        });

        return response()->json($rows);
    }

    public function topTaxpayers(Request $request)
    {
        $year = (int) $request->query('year', now()->year);

        $query = DB::table('community_tax_certificate_payment');
        CommunityTaxCertificateQueryHelper::applyActiveFilter($query);

        $rows = $query
            ->whereYear('DATEISSUED', $year)
            ->selectRaw("
                COALESCE(NULLIF(TRIM(OWNERNAME), ''), 'Unknown') AS taxpayer,
                ROUND(COALESCE(SUM(TOTALAMOUNTPAID), 0), 2) AS amount
            ")
            ->groupByRaw("COALESCE(NULLIF(TRIM(OWNERNAME), ''), 'Unknown')")
            ->orderByDesc('amount')
            ->limit(10)
            ->get();

        return response()->json($rows);
    }
}
