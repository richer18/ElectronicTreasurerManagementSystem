<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentMirrorHelper;
use App\Helpers\GeneralFundQueryCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataDeleteGFController extends Controller
{
    public function destroy($id)
    {
        try {
            $deletedPayment = 0;

            DB::transaction(function () use ($id, &$deletedPayment) {
                $detailsDeleted = DB::table('paymentdetail')
                    ->where('PAYMENT_ID', $id)
                    ->delete();

                $paymentDeleted = DB::table('payment')
                    ->where('PAYMENT_ID', $id)
                    ->delete();

                $deletedPayment = ($detailsDeleted > 0 || $paymentDeleted > 0) ? 1 : 0;
            });

            if ($deletedPayment) {
                GeneralFundPaymentMirrorHelper::deletePayment($id);
                GeneralFundQueryCache::invalidate();
                return response()->json(['message' => 'Record deleted successfully'], 200);
            }

            GeneralFundPaymentMirrorHelper::deletePayment($id);
            return response()->json(['message' => 'Record not found'], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting record: ' . $e->getMessage());
            return response()->json(['error' => 'Error deleting record'], 500);
        }
    }
}
