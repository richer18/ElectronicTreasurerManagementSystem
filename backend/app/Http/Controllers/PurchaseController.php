<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchaseAccountableForm;
use App\Support\CollectorLogger;

class PurchaseController extends Controller
{
    private function normalizeDigitsString($value): ?string
    {
        if ($value === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $value);
        return $digits === '' ? null : $digits;
    }

    private function toInt($value): int
    {
        return (int) ltrim((string) $value, '0');
    }

    public function store(Request $request)
    {
        $payload = [
            'purchase_date' => $request->input('purchase_date'),
            'form_type' => $request->input('form_type'),
            'serial_no' => $request->input('serial_no'),
            'receipt_range_from' => $this->normalizeDigitsString($request->input('receipt_range_from')),
            'receipt_range_to' => $this->normalizeDigitsString($request->input('receipt_range_to')),
            'stock' => (int) $request->input('stock'),
            'status' => $request->input('status'),
        ];

        $validated = validator($payload, [
            'purchase_date' => 'required|date',
            'form_type' => 'required|string|exists:t_ortype,DESCRIPTION',
            'serial_no' => 'required|string',
            'receipt_range_from' => 'required|string|regex:/^\d+$/',
            'receipt_range_to' => 'required|string|regex:/^\d+$/',
            'stock' => 'required|integer',
            'status' => 'required|in:AVAILABLE,USED,CANCELLED',
        ])->validate();

        if ($this->toInt($validated['receipt_range_to']) < $this->toInt($validated['receipt_range_from'])) {
            return response()->json([
                'message' => 'The receipt range to field must be greater than or equal to receipt range from.',
            ], 422);
        }

        $purchase = PurchaseAccountableForm::create([
            'purchase_date' => $validated['purchase_date'],
            'Form_Type' => $validated['form_type'],
            'Serial_No' => $validated['serial_no'],
            'Receipt_Range_From' => $validated['receipt_range_from'],
            'Receipt_Range_To' => $validated['receipt_range_to'],
            'Stock' => $validated['stock'],
            'Status' => $validated['status'],
        ]);

        CollectorLogger::write('Custodian', 'purchase_accountable_form', [
            'purchase_id' => $purchase->id ?? null,
            'purchase_date' => $purchase->purchase_date,
            'form_type' => $purchase->Form_Type ?? null,
            'serial_no' => $purchase->Serial_No ?? null,
            'range_from' => $purchase->Receipt_Range_From ?? null,
            'range_to' => $purchase->Receipt_Range_To ?? null,
            'stock' => (int) ($purchase->Stock ?? 0),
            'status' => $purchase->Status ?? null,
        ]);

        return response()->json([
            'message' => 'Purchase saved successfully',
            'purchase' => $purchase
        ], 201);
    }

    public function index()
{
    // Fetch all purchases ordered by date descending
    $query = \App\Models\PurchaseAccountableForm::query();

    if (request()->filled('month')) {
        $query->whereMonth('purchase_date', (int) request()->month);
    }

    if (request()->filled('year')) {
        $query->whereYear('purchase_date', (int) request()->year);
    }

    $purchases = $query->orderBy('purchase_date', 'desc')->get();

    return response()->json($purchases);
}

public function availableForms()
{
    $forms = \App\Models\PurchaseAccountableForm::where('status', 'AVAILABLE')->get();
    return response()->json($forms);
}

public function updateStatus($serial, Request $request)
{
    $form = \App\Models\PurchaseAccountableForm::where('Serial_No', $serial)->first();
    if ($form) {
        $form->Status = $request->Status;
        $form->save();
        return response()->json(['success' => true]);
    }
    return response()->json(['success' => false], 404);
}
}
