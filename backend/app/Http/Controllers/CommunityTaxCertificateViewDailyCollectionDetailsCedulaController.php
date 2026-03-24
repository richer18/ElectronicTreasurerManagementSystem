<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityTaxCertificateViewDailyCollectionDetailsCedulaController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date');

        if (!$date) {
            return response()->json(['error' => 'Date is required'], 400);
        }

        try {
            $rows = DB::table('communitytaxcertificate')
                ->select([
                    'DATEISSUED',
                    'CTCNO',
                    'LOCAL_TIN',
                    'BASICTAXDUE',
                    'BUSTAXDUE',
                    'SALTAXDUE',
                    'RPTAXDUE',
                    'INTEREST',
                    'TOTALAMOUNTPAID',
                    'USERID',
                ])
                ->whereDate('DATEISSUED', $date)
                ->orderBy('CTCNO')
                ->get();

            $tinMap = DB::table('taxpayer')
                ->whereIn('LOCAL_TIN', $rows->pluck('LOCAL_TIN')->filter()->unique()->values())
                ->pluck('OWNERNAME', 'LOCAL_TIN');

            $results = $rows->map(function ($row) use ($tinMap) {
                $taxDue = (float) ($row->BUSTAXDUE ?? 0)
                    + (float) ($row->SALTAXDUE ?? 0)
                    + (float) ($row->RPTAXDUE ?? 0);

                return [
                    'DATE' => $row->DATEISSUED,
                    'CTC NO' => $row->CTCNO,
                    'LOCAL' => $row->LOCAL_TIN,
                    'NAME' => $tinMap[$row->LOCAL_TIN] ?? null,
                    'BASIC' => (float) ($row->BASICTAXDUE ?? 0),
                    'TAX_DUE' => $taxDue,
                    'INTEREST' => (float) ($row->INTEREST ?? 0),
                    'TOTAL' => (float) ($row->TOTALAMOUNTPAID ?? 0),
                    'CASHIER' => $row->USERID,
                    'COMMENT' => '',
                  ];
            })->values();

            return response()->json($results);
        } catch (\Exception $e) {
            \Log::error("Database error: " . $e->getMessage());
            return response()->json(['error' => 'Database error'], 500);
        }
    }
}
