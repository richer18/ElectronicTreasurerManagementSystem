<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityTaxCertificateSaveCedulaDataController extends Controller
{
    public function store(Request $request)
    {
        // Extract request data
        $DATEISSUED = $request->input('DATEISSUED');
        $TRANSDATE = $request->input('TRANSDATE');
        $CTCNO = $request->input('CTCNO');
        $CTCTYPE = $request->input('CTCTYPE');
        $OWNERNAME = $request->input('OWNERNAME');
        $LOCAL_TIN = $request->input('LOCAL_TIN');
        $BASICTAXDUE = $request->input('BASICTAXDUE');
        $BUSTAXDUE = $request->input('BUSTAXDUE');
        $SALTAXDUE = $request->input('SALTAXDUE');
        $RPTAXDUE = $request->input('RPTAXDUE');
        $INTEREST = $request->input('INTEREST');
        $TOTALAMOUNTPAID = $request->input('TOTALAMOUNTPAID');
        $USERID = $request->input('USERID');
        $CTCYEAR = $request->input('CTCYEAR');

        // Check if CTCNO already exists
        $exists = DB::selectOne("SELECT 1 FROM communitytaxcertificate WHERE CTCNO = ? LIMIT 1", [$CTCNO]);

        if ($exists) {
            return response()->json([
                'error' => 'CTCNO already exists. Cannot save duplicate.'
            ], 400);
        }

        try {
            // Insert new record
            $sql = "
                INSERT INTO communitytaxcertificate (
                    DATEISSUED,
                    TRANSDATE,
                    CTCNO,
                    CTCTYPE,
                    OWNERNAME,
                    LOCAL_TIN,
                    BASICTAXDUE,
                    BUSTAXDUE,
                    SALTAXDUE,
                    RPTAXDUE,
                    INTEREST,
                    TOTALAMOUNTPAID,
                    USERID,
                    CTCYEAR
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";

            DB::insert($sql, [
                $DATEISSUED,
                date('Y-m-d H:i:s', strtotime($TRANSDATE)), // ensure MySQL-compatible format
                $CTCNO,
                $CTCTYPE,
                $OWNERNAME,
                $LOCAL_TIN,
                $BASICTAXDUE,
                $BUSTAXDUE,
                $SALTAXDUE,
                $RPTAXDUE,
                $INTEREST,
                $TOTALAMOUNTPAID,
                $USERID,
                $CTCYEAR
            ]);

            $id = DB::getPdo()->lastInsertId();

            return response()->json([
                'message' => 'Data saved successfully',
                'id' => $id
            ]);
        } catch (\Exception $e) {
            \Log::error("Error saving data: " . $e->getMessage());
            return response()->json(['error' => 'Failed to save data'], 500);
        }
    }
}
