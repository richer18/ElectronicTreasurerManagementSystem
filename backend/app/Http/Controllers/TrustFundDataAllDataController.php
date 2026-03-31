<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataAllDataController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('trust_fund_payment_main_view as tf')
                ->select([
                    'tf.ID',
                    'tf.PAYMENT_ID',
                    'tf.NAME',
                    'tf.DATE',
                    'tf.TOTAL',
                    'tf.RECEIPT_NO',
                    'tf.TYPE_OF_RECEIPT',
                    'tf.CASHIER',
                    'tf.COMMENTS',
                ])
                ->whereNotNull('tf.RECEIPT_NO');

            if (! $request->boolean('include_cancelled')) {
                $query = TrustFundPaymentSummaryHelper::applyActiveFilter($query, 'tf');
            }
            $query = TrustFundPaymentSummaryHelper::applyDateFilters($query, $request, 'tf.DATE');
            $query = TrustFundPaymentSummaryHelper::applySearch($query, $request->query('search'), 'tf');

            $data = $query
                ->orderByDesc('tf.DATE')
                ->orderByDesc('tf.RECEIPT_NO')
                ->get();

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Error fetching trust fund data: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve data'], 500);
        }
    }
}
