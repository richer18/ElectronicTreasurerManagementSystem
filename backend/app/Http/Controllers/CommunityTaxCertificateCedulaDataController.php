<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class CommunityTaxCertificateCedulaDataController extends Controller
{
    public function index()
    {
        try {
            $rows = DB::table('communitytaxcertificate as c')
                ->select([
                    'c.CTC_ID',
                    'c.DATEISSUED as DATE',
                    'c.CTCNO',
                    'c.LOCAL_TIN',
                    'c.BASICTAXDUE',
                    'c.BUSTAXDUE',
                    'c.SALTAXDUE',
                    'c.RPTAXDUE',
                    'c.INTEREST',
                    'c.TOTALAMOUNTPAID',
                    'c.USERID',
                ])
                ->orderByDesc('c.DATEISSUED')
                ->orderByDesc('c.CTC_ID')
                ->get();

            $tinMap = DB::table('taxpayer')
                ->whereIn('LOCAL_TIN', $rows->pluck('LOCAL_TIN')->filter()->unique()->values())
                ->pluck('OWNERNAME', 'LOCAL_TIN');

            $results = $rows->map(function ($row) use ($tinMap) {
                $taxDue = (float) ($row->BUSTAXDUE ?? 0)
                    + (float) ($row->SALTAXDUE ?? 0)
                    + (float) ($row->RPTAXDUE ?? 0);

                return [
                    'CTC_ID' => $row->CTC_ID,
                    'DATE' => $row->DATE,
                    'CTC NO' => $row->CTCNO,
                    'CTCNO' => $row->CTCNO,
                    'LOCAL TIN' => $row->LOCAL_TIN,
                    'LOCAL_TIN' => $row->LOCAL_TIN,
                    'NAME' => $tinMap[$row->LOCAL_TIN] ?? null,
                    'BASIC' => (float) ($row->BASICTAXDUE ?? 0),
                    'TAX DUE' => $taxDue,
                    'TAX_DUE' => $taxDue,
                    'INTEREST' => (float) ($row->INTEREST ?? 0),
                    'TOTALAMOUNTPAID' => (float) ($row->TOTALAMOUNTPAID ?? 0),
                    'TOTAL' => (float) ($row->TOTALAMOUNTPAID ?? 0),
                    'CASHIER' => $row->USERID,
                ];
            })->values();

            return response()->json($results);
        } catch (\Exception $e) {
            \Log::error('Error executing query: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }
}
