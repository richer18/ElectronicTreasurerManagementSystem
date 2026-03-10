<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GeneralFundPaymentRateOptionsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $municipalId = $request->query('municipal_id');

            $query = DB::table('t_otherpaymentrate');

            if ($municipalId !== null && $municipalId !== '') {
                $query->where('MUNICIPAL_ID', $municipalId);
            }

            $rates = $query
                ->orderBy('DESCRIPTION')
                ->get([
                    'OPRATE_ID as oprate_id',
                    'DESCRIPTION as description',
                ]);

            return response()->json($rates);
        } catch (\Exception $e) {
            \Log::error('Error fetching General Fund payment rate options: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch payment rate options'], 500);
        }
    }
}
