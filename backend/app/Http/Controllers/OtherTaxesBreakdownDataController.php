<?php

namespace App\Http\Controllers;

use App\Helpers\CommunityTaxCertificateQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OtherTaxesBreakdownDataController extends Controller
{
    public function index(Request $request)
    {
        try {
            $year = (int) $request->query('year');
            $months = collect(explode(',', (string) $request->query('months', '')))
                ->map(fn ($month) => (int) trim($month))
                ->filter(fn ($month) => $month >= 1 && $month <= 12)
                ->values()
                ->all();

            $query = DB::table('community_tax_certificate_payment');
            CommunityTaxCertificateQueryHelper::applyActiveFilter($query);

            if ($year) {
                $query->whereYear('DATEISSUED', $year);
            }

            if (!empty($months)) {
                $query->whereIn(DB::raw('MONTH(DATEISSUED)'), $months);
            }

            $totalPaid = (float) $query->sum('TOTALAMOUNTPAID');

            return response()->json([
                'COMMUNITY_TAX' => round($totalPaid, 2),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching Other Taxes breakdown: ' . $e->getMessage());

            return response()->json([
                'error' => 'Database query failed',
            ], 500);
        }
    }
}
