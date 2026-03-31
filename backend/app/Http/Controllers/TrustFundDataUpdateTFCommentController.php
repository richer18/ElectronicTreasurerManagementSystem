<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataUpdateTFCommentController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate([
            'RECEIPT_NO' => 'required|string|max:255',
            'COMMENTS' => 'nullable|string',
        ]);

        try {
            DB::table('trust_fund_payment')
                ->where('RECEIPT_NO', $request->input('RECEIPT_NO'))
                ->update([
                    'COMMENTS' => $request->input('COMMENTS')
                ]);

            return response()->json(['message' => 'Comment updated successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error updating comment: ' . $e->getMessage());

            return response()->json(['error' => 'Database update failed'], 500);
        }
    }
}
