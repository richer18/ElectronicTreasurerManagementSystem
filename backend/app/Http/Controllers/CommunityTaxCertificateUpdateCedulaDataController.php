<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityTaxCertificateUpdateCedulaDataController extends Controller
{
    public function update(Request $request, $oldCtcno)
    {
        $string255 = 'required|string|max:255';
        $nullableNumeric = 'nullable|numeric';
        $requiredDate = 'required|date';

        $validated = $request->validate([
            'DATEISSUED' => $requiredDate,
            'TRANSDATE' => 'nullable|date', // frontend may send or leave empty
            'CTCNO' => $string255,
            'CTCTYPE' => 'nullable|string|max:50',
            'OWNERNAME' => $string255,
            'LOCAL_TIN' => 'nullable|string|max:255',
            'BASICTAXDUE' => $nullableNumeric,
            'BUSTAXDUE' => $nullableNumeric,
            'SALTAXDUE' => $nullableNumeric,
            'RPTAXDUE' => $nullableNumeric,
            'INTEREST' => $nullableNumeric,
            'TOTALAMOUNTPAID' => 'required|numeric',
            'USERID' => $string255,
            'CTCYEAR' => 'required|integer',
        ]);

        // If TRANSDATE is not sent, set it to current datetime
        if (empty($validated['TRANSDATE'])) {
            $validated['TRANSDATE'] = now();
        }

        // Always set last edited timestamp
        $validated['DATALASTEDITED'] = now();

        $newCtcno = $validated['CTCNO'];

        // Prevent duplicate CTCNO when updating
        if ($newCtcno !== $oldCtcno) {
            $duplicate = DB::table('community_tax_certificate_payment')->where('CTCNO', $newCtcno)->exists();
            if ($duplicate) {
                return response()->json([
                    'error' => 'Duplicate CTCNO exists. Update aborted.'
                ], 400);
            }
        }

        try {
            DB::table('community_tax_certificate_payment')
                ->where('CTCNO', $oldCtcno)
                ->update($validated);

            return response()->json(['message' => 'Data updated successfully']);
        } catch (\Exception $e) {
            \Log::error('Update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update data'], 500);
        }
    }
}
