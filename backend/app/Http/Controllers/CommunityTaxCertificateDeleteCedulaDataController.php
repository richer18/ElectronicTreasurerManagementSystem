<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // for raw queries
use Exception;

class CommunityTaxCertificateDeleteCedulaDataController extends Controller
{
    /**
     * Delete cedula record by ID
     */
    public function delete($id)
    {
        try {
            $deleted = DB::table('community_tax_certificate_payment')
                ->where(function ($query) use ($id) {
                    $query->where('id', $id)
                        ->orWhere('CTC_ID', $id)
                        ->orWhere('CTCNO', $id);
                })
                ->delete();

            if ($deleted === 0) {
                return response()->json([
                    'message' => 'Record not found'
                ], 404);
            }

            return response()->json([
                'message' => 'Record deleted successfully'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage() ?? 'Error deleting record'
            ], 500);
        }
    }
}
