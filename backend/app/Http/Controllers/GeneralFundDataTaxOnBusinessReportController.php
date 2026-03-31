<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataTaxOnBusinessReportController extends Controller
{
    public function index(Request $request)
    {
        try {
            $row = DB::table('general_fund_payment as gfp')
                ->where('gfp.FUNDTYPE_CT', 'GF')
                ->whereNotIn('gfp.AFTYPE', ['CTC', 'AF56']);

            GeneralFundPaymentSummaryHelper::applyActiveFilter($row, 'gfp');
            GeneralFundPaymentSummaryHelper::applyDateFilters($row, $request, 'gfp.PAYMENTDATE');

            $row = $row
                ->selectRaw(GeneralFundPaymentSummaryHelper::detailSelectRaw('gfp', 'gfp'))
                ->first();

            return response()->json([
                ['Taxes' => 'Manufacturing', 'Total' => (float) ($row->Manufacturing ?? 0)],
                ['Taxes' => 'Distributor', 'Total' => (float) ($row->Distributor ?? 0)],
                ['Taxes' => 'Retailing', 'Total' => (float) ($row->Retailing ?? 0)],
                ['Taxes' => 'Financial', 'Total' => (float) ($row->Financial ?? 0)],
                ['Taxes' => 'Other Business Tax', 'Total' => (float) ($row->Other_Business_Tax ?? 0)],
                ['Taxes' => 'Fines Penalties', 'Total' => (float) ($row->Fines_Penalties ?? 0)],
                ['Taxes' => 'Sand Gravel', 'Total' => (float) ($row->Sand_Gravel ?? 0)],
                [
                    'Taxes' => 'Overall Total',
                    'Total' => (float) (
                        ($row->Manufacturing ?? 0) +
                        ($row->Distributor ?? 0) +
                        ($row->Retailing ?? 0) +
                        ($row->Financial ?? 0) +
                        ($row->Other_Business_Tax ?? 0) +
                        ($row->Fines_Penalties ?? 0) +
                        ($row->Sand_Gravel ?? 0)
                    ),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching tax-on-business report: ' . $e->getMessage());
            return response()->json(['error' => 'Database query failed'], 500);
        }
    }
}
