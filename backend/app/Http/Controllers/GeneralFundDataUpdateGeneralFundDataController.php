<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GeneralFundDataUpdateGeneralFundDataController extends Controller
{
    public function update(Request $request, $id)
    {
        try {
            return response()->json([
                'message' => 'Legacy General Fund aggregate update is no longer supported. Use /generalFundPaymentEdit/{paymentId} instead.',
            ], 410);
        } catch (\Exception $e) {
            Log::error('Failed to handle legacy General Fund update endpoint: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to process request'], 500);
        }
    }
}
