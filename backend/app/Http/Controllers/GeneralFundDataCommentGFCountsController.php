<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataCommentGFCountsController extends Controller
{
    public function index()
    {
        try {
            if (!DB::getSchemaBuilder()->hasTable('gf_comment')) {
                return response()->json([]);
            }

            $results = DB::select("
                SELECT DATE_FORMAT(date, '%Y-%m-%d') AS formatted_date, COUNT(*) AS count
                FROM gf_comment
                GROUP BY formatted_date
            ");

            // Transform to associative array like { "2025-06-19": 3 }
            $counts = [];
            foreach ($results as $row) {
                $counts[$row->formatted_date] = $row->count;
            }

            return response()->json($counts);
        } catch (\Exception $e) {
            Log::error('Error fetching comment counts: ' . $e->getMessage());
            return response()->json([]);
        }
    }
}
