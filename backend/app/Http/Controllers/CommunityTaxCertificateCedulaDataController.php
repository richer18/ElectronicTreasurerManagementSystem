<?php

namespace App\Http\Controllers;

use App\Helpers\CommunityTaxCertificateQueryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityTaxCertificateCedulaDataController extends Controller
{
    public function index(Request $request)
    {
        try {
            $rows = DB::table('community_tax_certificate_payment as c')
                ->select([
                    'c.id',
                    'c.CTC_ID',
                    'c.DATEISSUED as DATE',
                    'c.CTCNO',
                    'c.LOCAL_TIN',
                    'c.OWNERNAME',
                    'c.BASICTAXDUE',
                    'c.BUSTAXDUE',
                    'c.SALTAXDUE',
                    'c.RPTAXDUE',
                    'c.INTEREST',
                    'c.TOTALAMOUNTPAID',
                    'c.USERID',
                ]);

            if (! $request->boolean('include_cancelled')) {
                CommunityTaxCertificateQueryHelper::applyActiveFilter($rows, 'c');
            }

            $rows = $rows
                ->orderByDesc('c.DATEISSUED')
                ->orderByDesc('c.CTC_ID')
                ->get();

            $results = $rows->map(function ($row) {
                $taxDue = (float) ($row->BUSTAXDUE ?? 0)
                    + (float) ($row->SALTAXDUE ?? 0)
                    + (float) ($row->RPTAXDUE ?? 0);

                return [
                    'id' => $row->id,
                    'CTC_ID' => $row->CTC_ID,
                    'DATE' => $row->DATE,
                    'CTC NO' => $row->CTCNO,
                    'CTCNO' => $row->CTCNO,
                    'LOCAL TIN' => $row->LOCAL_TIN,
                    'LOCAL_TIN' => $row->LOCAL_TIN,
                    'NAME' => $row->OWNERNAME,
                    'OWNERNAME' => $row->OWNERNAME,
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
