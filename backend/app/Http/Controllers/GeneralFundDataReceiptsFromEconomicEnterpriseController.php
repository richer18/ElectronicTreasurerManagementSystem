<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataReceiptsFromEconomicEnterpriseController extends Controller
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

            $items = [
                ['Taxes' => 'Water Fees', 'Total' => (float) ($row->Water_Fees ?? 0)],
                ['Taxes' => 'Stall Fees', 'Total' => (float) ($row->Stall_Fees ?? 0)],
                ['Taxes' => 'Cash Tickets', 'Total' => (float) ($row->Cash_Tickets ?? 0)],
                ['Taxes' => 'Slaughter House Fee', 'Total' => (float) ($row->Slaughter_House_Fee ?? 0)],
                ['Taxes' => 'Rental of Equipment', 'Total' => (float) ($row->Rental_of_Equipment ?? 0)],
            ];

            $overall = array_reduce($items, fn ($sum, $item) => $sum + $item['Total'], 0.0);
            $items[] = ['Taxes' => 'Overall Total', 'Total' => $overall];

            return response()->json($items);
        } catch (\Exception $e) {
            Log::error('Error fetching economic enterprise receipts report: ' . $e->getMessage());
            return response()->json(['error' => 'Database query failed'], 500);
        }
    }
}
