<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardCollectorYearlyController extends Controller
{
    public function index(Request $request)
    {
        $year = (int) $request->input('year', now()->year);

        $normalize = static fn ($value, $fallback = 'Treasury Staff') => trim((string) ($value ?? '')) ?: $fallback;

        $gf = DB::table('general_fund_payment_main_view')
            ->whereYear('date', $year)
            ->select('cashier', 'total')
            ->get()
            ->map(fn ($row) => [
                'collector' => $normalize($row->cashier),
                'amount' => (float) ($row->total ?? 0),
            ]);

        $tf = DB::table('trust_fund_payment')
            ->whereYear('DATE', $year)
            ->select('CASHIER', 'TOTAL')
            ->get()
            ->map(fn ($row) => [
                'collector' => $normalize($row->CASHIER),
                'amount' => (float) ($row->TOTAL ?? 0),
            ]);

        $cedula = DB::table('community_tax_certificate_payment')
            ->whereYear('DATEISSUED', $year)
            ->select('USERID', 'TOTALAMOUNTPAID')
            ->get()
            ->map(fn ($row) => [
                'collector' => $normalize($row->USERID, 'Unassigned'),
                'amount' => (float) ($row->TOTALAMOUNTPAID ?? 0),
            ]);

        $combined = (new Collection())
            ->concat($gf)
            ->concat($tf)
            ->concat($cedula)
            ->groupBy('collector')
            ->map(fn ($rows, $collector) => [
                'collector' => $collector,
                'amount' => round(collect($rows)->sum('amount'), 2),
            ])
            ->sortByDesc('amount')
            ->take(7)
            ->values();

        return response()->json($combined);
    }
}
