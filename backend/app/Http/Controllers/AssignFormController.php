<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IssuedAccountableForm;
use App\Models\PurchaseAccountableForm;
use App\Support\CollectorLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AssignFormController extends Controller
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
            'Date' => $request->input('Date'),
            'Fund' => $request->input('Fund', '100 General Fund'),
            'Collector' => $request->input('Collector'),
            'Form_Type' => $request->input('Form_Type'),
            'Serial_No' => $request->input('Serial_No'),
            'Receipt_Range_From' => $this->normalizeDigitsString($request->input('Receipt_Range_From')),
            'Receipt_Range_To' => $this->normalizeDigitsString($request->input('Receipt_Range_To')),
            'Stock' => (int) $request->input('Stock'),
            'assigned_by' => $request->input('assigned_by'),
            'collector_received_by' => $request->input('collector_received_by'),
            'collector_signature_reference' => $request->input('collector_signature_reference'),
            'logbook_reference_no' => $request->input('logbook_reference_no'),
        ];

        $validated = validator($payload, [
            'Date' => 'required|date',
            'Fund' => 'required|string|max:100',
            'Collector' => 'required|string',
            'Form_Type' => 'required|string',
            'Serial_No' => 'required|string',
            'Receipt_Range_From' => 'required|string|regex:/^\d+$/',
            'Receipt_Range_To' => 'required|string|regex:/^\d+$/',
            'Stock' => 'required|integer|min:1',
            'assigned_by' => 'nullable|string|max:255',
            'collector_received_by' => 'nullable|string|max:255',
            'collector_signature_reference' => 'nullable|string|max:255',
            'logbook_reference_no' => 'nullable|string|max:255',
        ])->validate();

        if ($this->toInt($validated['Receipt_Range_To']) < $this->toInt($validated['Receipt_Range_From'])) {
            return response()->json([
                'success' => false,
                'message' => 'Receipt range to must be greater than or equal to receipt range from.',
            ], 422);
        }

        try {
            $issuedForm = DB::transaction(function () use ($validated) {
                $alreadyAssigned = IssuedAccountableForm::query()
                    ->whereDate('Date', $validated['Date'])
                    ->where('Collector', $validated['Collector'])
                    ->where('Form_Type', $validated['Form_Type'])
                    ->where('Serial_No', $validated['Serial_No'])
                    ->exists();

                if ($alreadyAssigned) {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'This accountable form is already assigned for the same date.',
                    ], 422));
                }

                $issuedFormPayload = [
                    'Date' => $validated['Date'],
                    'Fund' => $validated['Fund'],
                    'Collector' => $validated['Collector'],
                    'Form_Type' => $validated['Form_Type'],
                    'Serial_No' => $validated['Serial_No'],
                    'Receipt_Range_qty' => (int) $validated['Stock'],
                    'Receipt_Range_From' => $validated['Receipt_Range_From'],
                    'Receipt_Range_To' => $validated['Receipt_Range_To'],
                    // Assignment day defaults requested by user.
                    'Begginning_Balance_receipt_qty' => 0,
                    'Begginning_Balance_receipt_from' => 0,
                    'Begginning_Balance_receipt_to' => 0,
                    'Ending_Balance_receipt_qty' => 0,
                    'Ending_Balance_receipt_from' => 0,
                    'Ending_Balance_receipt_to' => 0,
                    'Issued_receipt_qty' => 0,
                    'Issued_receipt_from' => 0,
                    'Issued_receipt_to' => 0,
                    'Stock' => (int) $validated['Stock'],
                    'Date_Issued' => now(),
                    'Status' => 'ISSUED',
                ];

                if (Schema::hasColumn('issued_accountable_forms', 'assigned_by')) {
                    $issuedFormPayload['assigned_by'] = $validated['assigned_by'] ?? null;
                }
                if (Schema::hasColumn('issued_accountable_forms', 'collector_received_by')) {
                    $issuedFormPayload['collector_received_by'] = $validated['collector_received_by'] ?? null;
                }
                if (Schema::hasColumn('issued_accountable_forms', 'collector_signature_reference')) {
                    $issuedFormPayload['collector_signature_reference'] = $validated['collector_signature_reference'] ?? null;
                }
                if (Schema::hasColumn('issued_accountable_forms', 'logbook_reference_no')) {
                    $issuedFormPayload['logbook_reference_no'] = $validated['logbook_reference_no'] ?? null;
                }

                $issuedForm = IssuedAccountableForm::create($issuedFormPayload);

                $inventory = PurchaseAccountableForm::where('Serial_No', $validated['Serial_No'])->first();
                if ($inventory) {
                    $inventory->Status = 'USED';
                    $inventory->save();
                }

                return $issuedForm;
            });

            CollectorLogger::write((string) $validated['Collector'], 'assign_accountable_form', [
                'issued_form_id' => $issuedForm->ID ?? null,
                'date' => $issuedForm->Date ?? $validated['Date'],
                'form_type' => $issuedForm->Form_Type ?? $validated['Form_Type'],
                'serial_no' => $issuedForm->Serial_No ?? $validated['Serial_No'],
                'range_from' => (string) ($issuedForm->Receipt_Range_From ?? $validated['Receipt_Range_From']),
                'range_to' => (string) ($issuedForm->Receipt_Range_To ?? $validated['Receipt_Range_To']),
                'stock' => (int) ($issuedForm->Stock ?? $validated['Stock']),
                'status' => $issuedForm->Status ?? 'ISSUED',
                'assigned_by' => $validated['assigned_by'] ?? null,
                'collector_received_by' => $validated['collector_received_by'] ?? null,
                'collector_signature_reference' => $validated['collector_signature_reference'] ?? null,
                'logbook_reference_no' => $validated['logbook_reference_no'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'issued_form' => $issuedForm,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign form',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
