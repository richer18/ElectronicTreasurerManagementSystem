<?php

namespace App\Http\Controllers;

use App\Models\RcdBatch;
use App\Models\RcdEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class RcdBatchController extends Controller
{
    public function index(Request $request)
    {
        $query = RcdBatch::query();

        if ($request->filled('month')) {
            $query->whereMonth('report_date', (int) $request->month);
        }

        if ($request->filled('year')) {
            $query->whereYear('report_date', (int) $request->year);
        }

        if ($request->filled('collector')) {
            $collector = trim((string) $request->collector);
            $query->where('collector', 'like', "%{$collector}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(
            $query->orderByDesc('report_date')->orderByDesc('id')->get()
        );
    }

    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Draft,Submitted,Approved,Deposited',
            'reviewed_by' => 'nullable|string|max:100',
            'deposit_reference' => 'nullable|string|max:100',
            'remarks' => 'nullable|string|max:1000',
        ]);

        if ($validated['status'] === 'Approved' && blank($validated['reviewed_by'] ?? null)) {
            return response()->json([
                'message' => 'Reviewed by is required before approving the batch.',
            ], 422);
        }

        if ($validated['status'] === 'Deposited' && blank($validated['deposit_reference'] ?? null)) {
            return response()->json([
                'message' => 'Deposit reference / slip no. is required before marking the batch as deposited.',
            ], 422);
        }

        $batch = RcdBatch::findOrFail($id);

        $entryStatus = match ($validated['status']) {
            'Deposited' => 'Deposit',
            'Approved' => 'Approve',
            'Submitted' => 'Remit',
            default => 'Not Remit',
        };

        DB::transaction(function () use ($batch, $validated, $entryStatus) {
            RcdEntry::query()
                ->whereDate('issued_date', $batch->report_date)
                ->where('collector', $batch->collector)
                ->update(['status' => $entryStatus]);

            $batch->status = $validated['status'];
            $batch->reviewed_by = $validated['reviewed_by'] ?? $batch->reviewed_by;
            $batch->deposit_reference = $validated['deposit_reference'] ?? $batch->deposit_reference;
            $batch->remarks = $validated['remarks'] ?? $batch->remarks;

            if ($validated['status'] === 'Submitted' && !$batch->submitted_at) {
                $batch->submitted_at = Carbon::now();
            }

            if ($validated['status'] === 'Approved') {
                if (!$batch->submitted_at) {
                    $batch->submitted_at = Carbon::now();
                }
                $batch->reviewed_at = Carbon::now();
            }

            if ($validated['status'] === 'Deposited') {
                if (!$batch->submitted_at) {
                    $batch->submitted_at = Carbon::now();
                }
                if (!$batch->reviewed_at) {
                    $batch->reviewed_at = Carbon::now();
                }
                $batch->deposited_at = Carbon::now();
            }

            if ($validated['status'] === 'Draft') {
                $batch->submitted_at = null;
                $batch->reviewed_at = null;
                $batch->deposited_at = null;
                $batch->reviewed_by = null;
                $batch->deposit_reference = null;
            }

            $batch->save();
        });

        return response()->json([
            'message' => 'RCD batch status updated successfully.',
            'batch' => $batch->fresh(),
        ]);
    }
}
