<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class TrustFundPaymentRateOptionsController extends Controller
{
    public function index()
    {
        try {
            $rates = DB::table('paymentdetail as pd')
                ->join('t_otherpaymentrate as opr', 'pd.SOURCEID', '=', 'opr.OPRATE_ID')
                ->where('pd.FUNDTYPE_CT', 'TF')
                ->select([
                    'opr.OPRATE_ID as oprate_id',
                    'opr.DESCRIPTION as description',
                ])
                ->distinct()
                ->orderBy('opr.DESCRIPTION')
                ->get();

            return response()->json($rates);
        } catch (\Exception $e) {
            \Log::error('Error fetching Trust Fund payment rate options: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch payment rate options'], 500);
        }
    }
}
