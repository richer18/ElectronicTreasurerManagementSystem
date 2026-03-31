<?php

namespace App\Http\Controllers;

use App\Models\AccountableFormReturn;
use App\Models\IssuedAccountableForm;
use App\Models\PurchaseAccountableForm;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class AccountabilityLogController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->filled('month') ? (int) $request->month : null;
        $year = $request->filled('year') ? (int) $request->year : null;

        $purchases = PurchaseAccountableForm::query()
            ->when($month, fn ($query) => $query->whereMonth('purchase_date', $month))
            ->when($year, fn ($query) => $query->whereYear('purchase_date', $year))
            ->get()
            ->map(function ($row) {
                return [
                    'event_type' => 'PURCHASE',
                    'event_date' => $row->purchase_date,
                    'collector' => null,
                    'fund' => null,
                    'form_type' => $row->Form_Type ?? null,
                    'serial_no' => $row->Serial_No ?? null,
                    'range_from' => $row->Receipt_Range_From ?? null,
                    'range_to' => $row->Receipt_Range_To ?? null,
                    'quantity' => (int) ($row->Stock ?? 0),
                    'status' => $row->Status ?? null,
                    'processed_by' => null,
                    'reference_no' => null,
                    'signature_reference' => null,
                    'remarks' => null,
                ];
            });

        $assignments = IssuedAccountableForm::query()
            ->when($month, fn ($query) => $query->whereMonth('Date', $month))
            ->when($year, fn ($query) => $query->whereYear('Date', $year))
            ->get()
            ->map(function ($row) {
                return [
                    'event_type' => 'ASSIGN',
                    'event_date' => $row->Date ?? $row->Date_Issued,
                    'collector' => $row->Collector ?? null,
                    'fund' => $row->Fund ?? null,
                    'form_type' => $row->Form_Type ?? null,
                    'serial_no' => $row->Serial_No ?? null,
                    'range_from' => $row->Receipt_Range_From ?? null,
                    'range_to' => $row->Receipt_Range_To ?? null,
                    'quantity' => (int) ($row->Receipt_Range_qty ?? $row->Stock ?? 0),
                    'status' => $row->Status ?? null,
                    'processed_by' => $row->assigned_by ?? null,
                    'reference_no' => $row->logbook_reference_no ?? null,
                    'signature_reference' => $row->collector_signature_reference ?? null,
                    'remarks' => null,
                ];
            });

        $returns = AccountableFormReturn::query()
            ->when($month, fn ($query) => $query->whereMonth('return_date', $month))
            ->when($year, fn ($query) => $query->whereYear('return_date', $year))
            ->get()
            ->map(function ($row) {
                return [
                    'event_type' => 'RETURN',
                    'event_date' => $row->return_date,
                    'collector' => $row->collector,
                    'fund' => $row->fund,
                    'form_type' => $row->form_type,
                    'serial_no' => $row->serial_no,
                    'range_from' => $row->returned_receipt_from,
                    'range_to' => $row->returned_receipt_to,
                    'quantity' => (int) $row->returned_receipt_qty,
                    'status' => $row->status,
                    'processed_by' => $row->custodian_received_by ?: $row->processed_by,
                    'reference_no' => $row->logbook_reference_no,
                    'signature_reference' => $row->return_signature_reference,
                    'remarks' => $row->remarks,
                ];
            });

        $logs = (new Collection())
            ->concat($purchases)
            ->concat($assignments)
            ->concat($returns)
            ->sortByDesc(function ($row) {
                return sprintf(
                    '%s-%s',
                    (string) ($row['event_date'] ?? ''),
                    (string) ($row['serial_no'] ?? '')
                );
            })
            ->values();

        return response()->json($logs);
    }
}
