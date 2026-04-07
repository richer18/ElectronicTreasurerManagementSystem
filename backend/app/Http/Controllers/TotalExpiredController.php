<?php

namespace App\Http\Controllers;

use App\Helpers\BploStatusQueryHelper;

class TotalExpiredController extends Controller
{
    public function index()
    {
        $expiredCount = BploStatusQueryHelper::queryForStatus('EXPIRED')->count();

        return response()->json([
            'overall_expired' => (int) $expiredCount,
        ]);
    }
}
