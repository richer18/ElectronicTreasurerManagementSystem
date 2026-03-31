<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TrustFundDataUpdateDataController extends Controller
{
    public function update(Request $request, $id)
    {
        return response()->json([
            'message' => 'Legacy trust_fund_data updates are disabled. Use /trustFundPaymentEdit/{paymentId} instead.',
        ], 410);
    }
}
