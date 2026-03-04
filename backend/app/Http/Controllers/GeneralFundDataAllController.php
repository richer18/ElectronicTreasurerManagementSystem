<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GeneralFundDataAllController extends Controller
{
    public function index()
    {
        try {
            $gfPaymentIds = DB::table('paymentdetail')
                ->where('FUNDTYPE_CT', 'GF')
                ->distinct()
                ->pluck('PAYMENT_ID');

            $results = DB::table('payment as p')
                ->whereIn('p.PAYMENT_ID', $gfPaymentIds)
                ->whereNotIn('p.AFTYPE', ['CTC', 'AF56'])
                ->orderBy('p.PAYMENTDATE')
                ->orderBy('p.RECEIPTNO')
                ->get([
                    'p.PAYMENT_ID as id',
                    'p.PAYMENTDATE as date',
                    'p.PAIDBY as name',
                    'p.RECEIPTNO as receipt_no',
                    DB::raw("COALESCE(NULLIF(p.COLLECTOR, ''), p.USERID) as cashier"),
                    'p.AFTYPE as type_receipt',
                    'p.AMOUNT as total',
                    'p.LOCAL_TIN as local_tin',
                    'p.USERID as user_id',
                    'p.PAYGROUP_CT as paygroup',
                ]);

            return response()->json($results);
        } catch (\Exception $e) {
            \Log::error("Error fetching data: " . $e->getMessage());
            return response()->json(['error' => 'Database query failed'], 500);
        }
    }
}
