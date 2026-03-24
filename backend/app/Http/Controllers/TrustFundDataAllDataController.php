<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataAllDataController extends Controller
{
    public function index()
    {
        try {
            $data = DB::table('payment as p')
                ->select([
                    'p.PAYMENT_ID',
                    'p.LOCAL_TIN',
                    'p.PAIDBY as NAME',
                    'p.PAYMENTDATE as DATE',
                    'p.AMOUNT as TOTAL',
                    'p.RECEIPTNO as RECEIPT_NO',
                    'p.USERID',
                    'p.PAYGROUP_CT',
                    'p.AFTYPE as TYPE_OF_RECEIPT',
                    'p.COLLECTOR as CASHIER',
                ])
                ->whereIn('p.PAYMENT_ID', function ($query) {
                    $query->select('pd.PAYMENT_ID')
                        ->from('paymentdetail as pd')
                        ->where('pd.FUNDTYPE_CT', 'TF');
                })
                ->whereNotIn('p.AFTYPE', ['CTC', 'AF56'])
                ->orderByDesc('p.PAYMENTDATE')
                ->get();

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Error fetching trust fund data: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve data'], 500);
        }
    }
}
