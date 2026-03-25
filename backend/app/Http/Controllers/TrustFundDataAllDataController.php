<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataAllDataController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('payment as p')
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
                ->whereRaw('COALESCE(p.VOID_BV, 0) = 0')
                ->whereNotIn('p.AFTYPE', ['CTC', 'AF56'])
                ->whereExists(function ($subquery) {
                    $subquery->select(DB::raw(1))
                        ->from('paymentdetail as pd')
                        ->whereColumn('pd.PAYMENT_ID', 'p.PAYMENT_ID')
                        ->where('pd.FUNDTYPE_CT', 'TF');
                });

            if ($request->filled('month')) {
                $query->whereMonth('p.PAYMENTDATE', $request->month);
            }

            if ($request->filled('year')) {
                $query->whereYear('p.PAYMENTDATE', $request->year);
            }

            if ($request->filled('search')) {
                $search = trim($request->query('search'));
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery->where('p.PAIDBY', 'like', "%{$search}%")
                        ->orWhere('p.RECEIPTNO', 'like', "%{$search}%")
                        ->orWhere('p.LOCAL_TIN', 'like', "%{$search}%")
                        ->orWhere('p.COLLECTOR', 'like', "%{$search}%");
                });
            }

            $data = $query
                ->orderByDesc('p.PAYMENTDATE')
                ->orderByDesc('p.PAYMENT_ID')
                ->get();

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Error fetching trust fund data: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve data'], 500);
        }
    }
}
