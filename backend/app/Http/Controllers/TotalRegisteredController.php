<?php

namespace App\Http\Controllers;

use App\Helpers\BploStatusQueryHelper;
use Illuminate\Support\Facades\DB;

class TotalRegisteredController extends Controller
{
    public function index()
    {
        $overallTotal = BploStatusQueryHelper::table()->count('MCH_NO');

        return response()->json([
            'overall_registered' => (int) $overallTotal,
        ]);
    }

    public function list()
    {
        $records = BploStatusQueryHelper::table()
            ->select(
                'DATE as DATE_REGISTERED',
                DB::raw("CONCAT(FNAME, ' ', COALESCE(MNAME, ''), ' ', LNAME) as NAME"),
                'MCH_NO',
                'FRANCHISE_NO'
            )
            ->orderBy('DATE', 'DESC')
            ->get();

        return response()->json($records);
    }
}
