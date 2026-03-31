<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TrustFundDataSaveDataController extends Controller
{
    public function store(Request $request)
    {
        return response()->json([
            'message' => 'Legacy trust_fund_data writes are disabled. Use /trustFundPayment instead.',
        ], 410);
    }
}
