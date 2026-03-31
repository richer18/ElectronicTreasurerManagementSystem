<?php

namespace App\Http\Controllers;

use App\Helpers\CommunityTaxCertificateQueryHelper;
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
            $rows = DB::table('community_tax_certificate_payment')
                ->select([
                    'id',
                    'DATEISSUED',
                    'CTCNO',
                    'LOCAL_TIN',
                    'OWNERNAME',
                    'BASICTAXDUE',
                    'BUSTAXDUE',
                    'SALTAXDUE',
                    'RPTAXDUE',
                    'INTEREST',
                    'TOTALAMOUNTPAID',
                    'USERID',
                ]);

            CommunityTaxCertificateQueryHelper::applyActiveFilter($rows);

            $rows = $rows
                ->whereDate('DATEISSUED', $date)
                ->orderBy('CTCNO')
                ->get();

            $results = $rows->map(function ($row) {
                $taxDue = (float) ($row->BUSTAXDUE ?? 0)
                    + (float) ($row->SALTAXDUE ?? 0)
                    + (float) ($row->RPTAXDUE ?? 0);

                return [
                    'id' => $row->id,
                    'DATE' => $row->DATEISSUED,
                    'CTC NO' => $row->CTCNO,
                    'LOCAL' => $row->LOCAL_TIN,
                    'NAME' => $row->OWNERNAME,
                    'OWNERNAME' => $row->OWNERNAME,
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
