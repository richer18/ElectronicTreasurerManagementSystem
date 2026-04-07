<?php

namespace App\Http\Controllers;

use App\Helpers\BploStatusQueryHelper;
use Illuminate\Support\Facades\DB;

class TotalRenewController extends Controller
{
    public function index()
    {
        $today = BploStatusQueryHelper::today();
        $totalRenew = BploStatusQueryHelper::queryForStatus('ACTIVE')->count();

        return response()->json([
            'overall_renew' => (int) $totalRenew,
            'as_of' => $today->format('Y-m-d'),
        ]);
    }

    public function list()
    {
        $bploConnection = DB::connection('bplo');
        $hasPaymentDate = $bploConnection->getSchemaBuilder()->hasColumn('bplo_records', 'PAYMENT_DATE');
        $dateColumn = $hasPaymentDate ? 'PAYMENT_DATE' : 'created_at';

        $renewedApplicants = BploStatusQueryHelper::applyStatusFilter(
            BploStatusQueryHelper::table()->select(
                "$dateColumn as PAYMENT_DATE",
                DB::raw("
                    CONCAT(
                        FNAME,
                        CASE
                            WHEN MNAME IS NOT NULL AND MNAME != '' THEN CONCAT(' ', MNAME, ' ')
                            ELSE ' '
                        END,
                        LNAME
                    ) AS NAME
                "),
                'MCH_NO',
                'FRANCHISE_NO',
                'RENEW_FROM',
                'RENEW_TO'
            ),
            'ACTIVE'
        )
            ->orderBy('RENEW_TO', 'asc')
            ->get();

        return response()->json($renewedApplicants);
    }
}
