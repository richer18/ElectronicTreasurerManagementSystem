<?php

namespace App\Http\Controllers;

use App\Helpers\BploStatusQueryHelper;
use Illuminate\Http\Request;
use App\Models\BploRecord;
use Carbon\Carbon;

class BploRecordController extends Controller
{
    // ✅ CREATE (POST)
    public function store(Request $request)
    {
        // 🔹 Validate input
        $validated = $request->validate([
            'FNAME' => 'required|string|max:100',
            'LNAME' => 'required|string|max:100',
            'MNAME' => 'nullable|string|max:100',
            'EXTNAME' => 'nullable|string|max:10',
            'GENDER' => 'required|string',
            'STREET' => 'nullable|string|max:255',
            'BARANGAY' => 'required|string|max:100',
            'CELLPHONE' => 'nullable|string|max:20',
            'CEDULA_NO' => 'nullable|string|max:50',
            'CEDULA_DATE' => 'nullable|date',

            'MCH_NO' => 'nullable|string|max:50',
            'FRANCHISE_NO' => 'nullable|string|max:50',
            'MAKE' => 'nullable|string|max:50',
            'MOTOR_NO' => 'nullable|string|max:100',
            'CHASSIS_NO' => 'nullable|string|max:100',
            'PLATE' => 'nullable|string|max:20',
            'COLOR' => 'nullable|string|max:50',

            'LTO_ORIGINAL_RECEIPT' => 'nullable|string|max:100',
            'LTO_CERTIFICATE_REGISTRATION' => 'nullable|string|max:100',
            'LTO_MV_FILE_NO' => 'nullable|string|max:100',

            'ORIGINAL_RECEIPT_PAYMENT' => 'nullable|string|max:100',
            'PAYMENT_DATE' => 'nullable|date',
            'AMOUNT' => 'nullable|numeric',

            'RENEW_FROM' => 'nullable|date',
            'RENEW_TO' => 'nullable|date',
            'MAYORS_PERMIT_NO' => 'nullable|string|max:50',

            'LICENSE_NO' => 'nullable|string|max:50',
            'LICENSE_VALID_DATE' => 'nullable|date',

            'COMMENT' => 'nullable|string',
        ]);

        // 🔹 Auto-generate transaction code
        $count = BploRecord::count() + 1;
        $validated['TRANSACTION_CODE'] = 'TRX-' . date('Ymd') . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

        // 🔹 Default values
        $validated['DATE'] = $request->input('DATE', now()->format('Y-m-d'));
        $validated['MUNICIPALITY'] = 'Zamboanguita';
        $validated['PROVINCE'] = 'Negros Oriental';

        // 🔹 Auto compute RENEW_TO (+1 year from RENEW_FROM)
        if (!empty($validated['RENEW_FROM'])) {
            $validated['RENEW_TO'] = Carbon::parse($validated['RENEW_FROM'])->addYear()->format('Y-m-d');
        }

        // 🔹 Auto compute STATUS
        $validated['STATUS'] = BploStatusQueryHelper::resolveStatus($validated['RENEW_TO'] ?? null);

        // 🔹 Save to database
        $record = BploRecord::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Record created successfully!',
            'record' => $record
        ]);
    }

    // ✅ READ ALL (GET)
    public function index()
    {
        return BploRecord::orderBy('ID', 'DESC')->get();
    }

    // ✅ READ SINGLE (GET)
    public function show($id)
    {
        $record = BploRecord::find($id);
        return $record ?: response()->json(['success' => false, 'message' => 'Record not found'], 404);
    }

    // ✅ UPDATE (PUT)
    public function update(Request $request, $id)
    {
        $record = BploRecord::find($id);
        if (!$record) {
            return response()->json(['success' => false, 'message' => 'Record not found'], 404);
        }

        $data = $request->all();

        // 🔹 Recalculate renew date & status if renew_from changes
        if (!empty($data['RENEW_FROM'])) {
            $data['RENEW_TO'] = Carbon::parse($data['RENEW_FROM'])->addYear()->format('Y-m-d');
        }

        $data['STATUS'] = BploStatusQueryHelper::resolveStatus($data['RENEW_TO'] ?? null);

        $record->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully!',
            'record' => $record
        ]);
    }

    // ✅ DELETE (DELETE)
    public function destroy($id)
    {
        $record = BploRecord::find($id);
        if (!$record) {
            return response()->json(['success' => false, 'message' => 'Record not found'], 404);
        }

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Record deleted successfully!'
        ]);
    }

   public function registeredMch()
{
    // ✅ Fetch all existing MCH numbers
    $takenMch = \App\Models\BploRecord::whereNotNull('MCH_NO')
        ->where('MCH_NO', '!=', '')
        ->pluck('MCH_NO')
        ->map(fn($mch) => str_pad(ltrim($mch, '0'), 3, '0', STR_PAD_LEFT))
        ->toArray();

    // ✅ Always return an array — even if no record exists
    return response()->json($takenMch);
}

}
