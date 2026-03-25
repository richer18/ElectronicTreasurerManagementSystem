<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityTaxCertificateSummaryCollectionDataReportController extends Controller
{
    public function index(Request $request)
    {
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);

        $totalAmountPaid = DB::table('communitytaxcertificate')
            ->whereYear('DATEISSUED', $year)
            ->whereMonth('DATEISSUED', $month)
            ->sum('TOTALAMOUNTPAID');

        return response()->json([
            'month' => $month,
            'year' => $year,
            'Totalamountpaid' => (float) $totalAmountPaid,
        ]);
    }
}
