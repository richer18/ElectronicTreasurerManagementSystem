<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataServiceUserChargesController extends Controller
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

            $secretaryFees = (float) (($row->Secretaries_Fee ?? 0) + ($row->Police_Report_Clearance ?? 0));
            $items = [
                ['Taxes' => 'Police Report/Clearance', 'Total' => 0.0],
                ['Taxes' => 'Secretary Fee', 'Total' => $secretaryFees],
                ['Taxes' => 'Med./Dent. & Lab. Fees', 'Total' => (float) ($row->Med_Dent_Lab_Fees ?? 0)],
                ['Taxes' => 'Garbage Fees', 'Total' => (float) ($row->Garbage_Fees ?? 0)],
                ['Taxes' => 'Cutting Tree', 'Total' => (float) ($row->Cutting_Tree ?? 0)],
                ['Taxes' => 'Documentary Stamp', 'Total' => (float) ($row->Doc_Stamp ?? 0)],
            ];

            $overall = array_reduce($items, fn ($sum, $item) => $sum + $item['Total'], 0.0);
            $items[] = ['Taxes' => 'Overall Total', 'Total' => $overall];

            return response()->json($items);
        } catch (\Exception $e) {
            Log::error('Error fetching service/user charges: ' . $e->getMessage());
            return response()->json(['error' => 'Server error fetching service/user charges'], 500);
        }
    }
}
