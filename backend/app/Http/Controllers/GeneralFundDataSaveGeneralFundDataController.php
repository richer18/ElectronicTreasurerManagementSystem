<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GeneralFundDataSaveGeneralFundDataController extends Controller
{
    public function store(Request $request)
    {
        try {
            return response()->json([
                'message' => 'Legacy General Fund aggregate save is no longer supported. Use /generalFundPayment instead.',
            ], 410);
        } catch (\Exception $e) {
            Log::error('Failed to handle legacy General Fund save endpoint: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to process request'], 500);
        }
    }
}
