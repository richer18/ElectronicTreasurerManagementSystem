<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundPaymentDeleteController extends Controller
{
    public function destroy($id)
    {
        try {
            $deleted = 0;

            DB::transaction(function () use ($id, &$deleted) {
                $detailsDeleted = DB::table('paymentdetail')
                    ->where('PAYMENT_ID', $id)
                    ->where('FUNDTYPE_CT', 'TF')
                    ->delete();

                $paymentDeleted = DB::table('payment')
                    ->where('PAYMENT_ID', $id)
                    ->delete();

                $deleted = ($detailsDeleted > 0 || $paymentDeleted > 0) ? 1 : 0;
            });

            if (!$deleted) {
                return response()->json(['message' => 'Record not found'], 404);
            }

            return response()->json(['message' => 'Record deleted successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting trust fund payment: ' . $e->getMessage());
            return response()->json(['error' => 'Error deleting record'], 500);
        }
    }
}
