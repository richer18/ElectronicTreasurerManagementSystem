<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityTaxCertificateSummaryCollectionDataReportController extends Controller
{
    public function index()
    {
        $months = range(1, 12);
        $year = 2025;

        $result = collect($months)->map(function ($month) use ($year) {
            $cedula = DB::table('communitytaxcertificate')
                ->whereYear('DATEISSUED', $year)
                ->whereMonth('DATEISSUED', $month)
                ->sum('TOTALAMOUNTPAID');

            return [
                'month' => date('M', mktime(0, 0, 0, $month, 1)),
                'value' => $cedula + $general + $real + $trust,
            ];
        });

        return response()->json($result);
    }
}
