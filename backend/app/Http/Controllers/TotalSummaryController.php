<?php

namespace App\Http\Controllers;

use App\Helpers\BploStatusQueryHelper;

class TotalSummaryController extends Controller
{
    public function index()
    {
        $totalRegistered = BploStatusQueryHelper::table()->count('MCH_NO');
        $totalRenew = BploStatusQueryHelper::queryForStatus('ACTIVE')->count();
        $totalExpiry = BploStatusQueryHelper::queryForStatus('EXPIRY')->count();
        $totalExpired = BploStatusQueryHelper::queryForStatus('EXPIRED')->count();

        return response()->json([
            'total_registered' => (int) $totalRegistered,
            'total_renew' => (int) $totalRenew,
            'total_expiry' => (int) $totalExpiry,
            'total_expired' => (int) $totalExpired,
        ]);
    }
}
