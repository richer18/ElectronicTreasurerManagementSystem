<?php

namespace App\Helpers;

use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class GeneralFundPaymentSummaryHelper
{
    public static function applyActiveFilter(Builder $query, string $alias = 'p'): Builder
    {
        $qualifiedAlias = trim($alias) === '' ? 'general_fund_payment' : $alias;

        $query->where(function ($statusQuery) use ($qualifiedAlias) {
            if (Schema::hasColumn('general_fund_payment', 'PAYMENT_STATUS_CT')) {
                $statusQuery
                    ->whereNull("{$qualifiedAlias}.PAYMENT_STATUS_CT")
                    ->orWhere("{$qualifiedAlias}.PAYMENT_STATUS_CT", '<>', 'CNL');
            } else {
                $statusQuery
                    ->whereNull("{$qualifiedAlias}.PAYMENTDETAIL_STATUS_CT")
                    ->orWhere("{$qualifiedAlias}.PAYMENTDETAIL_STATUS_CT", '<>', 'CNL');
            }
        });

        return $query->where(function ($voidQuery) use ($qualifiedAlias) {
            $voidQuery
                ->whereNull("{$qualifiedAlias}.VOID_BV")
                ->orWhere("{$qualifiedAlias}.VOID_BV", 0);
        });
    }

    public static function applyDateFilters(Builder $query, Request $request, string $column = 'p.PAYMENTDATE'): Builder
    {
        if ($request->filled('year')) {
            $year = (int) $request->year;

            if ($request->filled('month')) {
                $month = (int) $request->month;

                if ($request->filled('day')) {
                    $start = Carbon::create($year, $month, (int) $request->day)->startOfDay();
                    $end = (clone $start)->addDay();
                } else {
                    $start = Carbon::create($year, $month, 1)->startOfMonth();
                    $end = (clone $start)->addMonth();
                }
            } else {
                $start = Carbon::create($year, 1, 1)->startOfYear();
                $end = (clone $start)->addYear();
            }

            return $query
                ->where($column, '>=', $start->toDateTimeString())
                ->where($column, '<', $end->toDateTimeString());
        }

        if ($request->filled('month')) {
            $query->whereMonth($column, $request->month);
        }

        if ($request->filled('day')) {
            $query->whereDay($column, $request->day);
        }

        return $query;
    }

    public static function applySearch(Builder $query, ?string $search, string $paymentAlias = 'p'): Builder
    {
        $search = trim((string) $search);

        if ($search === '') {
            return $query;
        }

        $query->where(function ($searchQuery) use ($search, $paymentAlias) {
            $searchQuery
                ->where("{$paymentAlias}.PAIDBY", 'like', "%{$search}%")
                ->orWhere("{$paymentAlias}.RECEIPTNO", 'like', "%{$search}%")
                ->orWhere("{$paymentAlias}.COLLECTOR", 'like', "%{$search}%")
                ->orWhere("{$paymentAlias}.USERID", 'like', "%{$search}%")
                ->orWhere("{$paymentAlias}.LOCAL_TIN", 'like', "%{$search}%")
                ->orWhere("{$paymentAlias}.PAYGROUP_CT", 'like', "%{$search}%")
                ->orWhere("{$paymentAlias}.AFTYPE", 'like', "%{$search}%");
        });

        return $query;
    }

    public static function mainBucketSelectRaw(string $detailAlias = 'pd'): string
    {
        return "
            ROUND(COALESCE(SUM({$detailAlias}.AMOUNTPAID), 0), 2) AS total,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('524', '528', '518', '520', '807', '808', '781', '844', '989', '987') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS tax_on_business,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('681', '764', '767', '940', '941', '943', '944', '956', '365', '348', '346', '358', '636', '344', '350', '693', '960', '958', '1020', '580', '639', '561', '993', '1008', '1006', '811', '823', '785', '786', '899', '900', '901', '898', '803', '804', '802', '834', '826', '488', '761', '1010', '963', '878', '857', '855', '896', '872', '897', '853', '894', '892', '880', '1000', '876', '882', '948', '890', '885', '946', '863', '874', '998', '999', '724', '722', '575', '440', '578', '615', '723', '637', '613', '1009', '1007', '1004', '945') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS regulatory_fees,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('819', '817', '821', '815', '827', '606', '961', '1017', '839', '558', '992', '560', '505', '476', '478', '805', '507') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS receipts_from_economic_enterprises,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('810', '543', '790', '1003', '788', '833', '789', '796', '787', '793', '545', '947', '918', '913', '915', '907', '912', '908', '909', '465', '911', '906', '795', '914', '904', '976', '917', '916', '799', '801', '1005', '800') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS service_user_charges
        ";
    }

    public static function detailSelectRaw(string $detailAlias = 'pd', string $paymentAlias = 'p'): string
    {
        return "
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '524' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Manufacturing,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '528' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Distributor,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '518' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Retailing,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '520' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Financial,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('807', '808', '781', '844') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Other_Business_Tax,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '989' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Sand_Gravel,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '987' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Fines_Penalties,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '681' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Mayors_Permit,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('764', '767') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Weighs_Measure,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('940', '941', '943', '944', '956', '365', '348', '346', '358', '636', '344', '350') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Tricycle_Operators,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '693' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Occupation_Tax,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '960' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Cert_of_Ownership,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '958' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Cert_of_Transfer,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '1020' AND COALESCE({$paymentAlias}.PROV_BV, 0) = 1 THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Cockpit_Prov_Share,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '1020' AND COALESCE({$paymentAlias}.PROV_BV, 0) = 0 THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Cockpit_Local_Share,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('580', '639') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Docking_Mooring_Fee,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '561' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Sultadas,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('993', '1008', '1006', '811', '823', '785', '786', '899', '900', '901', '898', '803', '804', '802', '834', '826', '488', '761', '1010') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Miscellaneous_Fee,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('963', '878', '857', '855', '896', '872', '897', '853') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Reg_of_Birth,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('894', '892', '880', '1000', '876', '882') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Marriage_Fees,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('948', '890', '885', '946', '863', '874') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Burial_Fees,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('998', '999') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Correction_of_Entry,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('724', '722', '575', '440', '578', '615', '723', '637', '613') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Fishing_Permit_Fee,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('1009', '1007') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Sale_of_Agri_Prod,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('1004', '945') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Sale_of_Acct_Form,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('819', '817', '821', '815', '827') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Water_Fees,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '606' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Stall_Fees,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '961' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Cash_Tickets,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '1017' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Slaughter_House_Fee,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('839', '558', '992', '560', '505', '476', '478', '805', '507') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Rental_of_Equipment,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '810' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Doc_Stamp,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID = '543' THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Police_Report_Clearance,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('790', '1003', '788', '833', '789', '796', '787', '793', '545', '947') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Secretaries_Fee,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('918', '913', '915', '907', '912', '908', '909', '465', '911', '906', '795', '914', '904', '976', '917', '916') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Med_Dent_Lab_Fees,
            ROUND(COALESCE(SUM(CASE WHEN {$detailAlias}.SOURCEID IN ('799', '801', '1005', '800') THEN {$detailAlias}.AMOUNTPAID ELSE 0 END), 0), 2) AS Garbage_Fees,
            0.00 AS Cutting_Tree,
            ROUND(COALESCE(SUM({$detailAlias}.AMOUNTPAID), 0), 2) AS total
        ";
    }
}
