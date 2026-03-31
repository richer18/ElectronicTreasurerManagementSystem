<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RealPropertyTaxDeleteDataController extends Controller
{
    public function destroy($id)
    {
        try {
            $deleted = DB::table('real_property_tax_payment')->where('ID', $id)->delete();

            if ($deleted === 0) {
                return response()->json(['message' => 'Record not found'], 404);
            }

            return response()->json(['message' => 'Record deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage() ?: 'Error deleting record'
            ], 500);
        }
    }
}
