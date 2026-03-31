<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralFundDataRegulatoryFeesController extends Controller
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
                ['Taxes' => 'Mayors Permit', 'Total' => (float) ($row->Mayors_Permit ?? 0)],
                ['Taxes' => 'Weighs and Measure', 'Total' => (float) ($row->Weighs_Measure ?? 0)],
                ['Taxes' => 'Tricycle Operators', 'Total' => (float) ($row->Tricycle_Operators ?? 0)],
                ['Taxes' => 'Occupation Tax', 'Total' => (float) ($row->Occupation_Tax ?? 0)],
                ['Taxes' => 'Certificate of Ownership', 'Total' => (float) ($row->Cert_of_Ownership ?? 0)],
                ['Taxes' => 'Certificate of Transfer', 'Total' => (float) ($row->Cert_of_Transfer ?? 0)],
                ['Taxes' => 'Cockpit Prov Share', 'Total' => (float) ($row->Cockpit_Prov_Share ?? 0)],
                ['Taxes' => 'Cockpit Local Share', 'Total' => (float) ($row->Cockpit_Local_Share ?? 0)],
                ['Taxes' => 'Docking and Mooring Fee', 'Total' => (float) ($row->Docking_Mooring_Fee ?? 0)],
                ['Taxes' => 'Sultadas', 'Total' => (float) ($row->Sultadas ?? 0)],
                ['Taxes' => 'Miscellaneous Fees', 'Total' => (float) ($row->Miscellaneous_Fee ?? 0)],
                ['Taxes' => 'Registration of Birth', 'Total' => (float) ($row->Reg_of_Birth ?? 0)],
                ['Taxes' => 'Marriage Fees', 'Total' => (float) ($row->Marriage_Fees ?? 0)],
                ['Taxes' => 'Burial Fee', 'Total' => (float) ($row->Burial_Fees ?? 0)],
                ['Taxes' => 'Correction of Entry', 'Total' => (float) ($row->Correction_of_Entry ?? 0)],
                ['Taxes' => 'Fishing Permit Fee', 'Total' => (float) ($row->Fishing_Permit_Fee ?? 0)],
                ['Taxes' => 'Sale of Agri. Prod', 'Total' => (float) ($row->Sale_of_Agri_Prod ?? 0)],
                ['Taxes' => 'Sale of Acct Form', 'Total' => (float) ($row->Sale_of_Acct_Form ?? 0)],
            ];

            $overall = array_reduce($items, fn ($sum, $item) => $sum + $item['Total'], 0.0);
            $items[] = ['Taxes' => 'Overall Total', 'Total' => $overall];

            return response()->json($items);
        } catch (\Exception $e) {
            Log::error('Error fetching General Fund Regulatory Fees Report: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
