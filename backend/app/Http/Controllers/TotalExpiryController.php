<?php

namespace App\Http\Controllers;

use App\Helpers\BploStatusQueryHelper;

class TotalExpiryController extends Controller
{
    public function index()
    {
        $expiringCount = BploStatusQueryHelper::queryForStatus('EXPIRY')->count();

        return response()->json([
            'overall_expiry' => (int) $expiringCount,
        ]);
    }
}
