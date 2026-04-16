<?php

namespace App\Http\Controllers;

use App\Models\WaterworksTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WaterWorksTicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WaterworksTicket::query();

        if ($request->filled('status')) {
            $query->where('status', strtoupper((string) $request->input('status')));
        }

        $search = trim((string) $request->input('search', ''));

        if ($search !== '') {
            $query->where(function ($searchQuery) use ($search) {
                $searchQuery
                    ->where('ticket_no', 'like', "%{$search}%")
                    ->orWhere('taxpayer_name', 'like', "%{$search}%")
                    ->orWhere('local_tin', 'like', "%{$search}%")
                    ->orWhere('account_number', 'like', "%{$search}%")
                    ->orWhere('meter_number', 'like', "%{$search}%")
                    ->orWhere('concern_type', 'like', "%{$search}%")
                    ->orWhere('assigned_to', 'like', "%{$search}%");
            });
        }

        $tickets = $query
            ->orderByDesc('opened_at')
            ->orderByDesc('id')
            ->get();

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'taxpayer_name' => ['nullable', 'string', 'max:150'],
            'local_tin' => ['nullable', 'string', 'max:50'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'meter_number' => ['nullable', 'string', 'max:50'],
            'concern_type' => ['required', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'string', 'max:100'],
        ]);

        $ticket = WaterworksTicket::create([
            'ticket_no' => $this->generateTicketNumber(),
            'taxpayer_name' => $validated['taxpayer_name'] ?? null,
            'local_tin' => $validated['local_tin'] ?? null,
            'account_number' => $validated['account_number'] ?? null,
            'meter_number' => $validated['meter_number'] ?? null,
            'concern_type' => strtoupper($validated['concern_type']),
            'priority' => strtoupper((string) ($validated['priority'] ?? 'NORMAL')),
            'status' => 'OPEN',
            'assigned_to' => $validated['assigned_to'] ?? null,
            'description' => $validated['description'] ?? null,
            'opened_at' => now(),
        ]);

        return response()->json([
            'message' => 'Waterworks ticket created successfully.',
            'ticket' => $ticket,
        ], 201);
    }

    public function update(Request $request, WaterworksTicket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'max:20'],
            'priority' => ['nullable', 'string', 'max:20'],
            'assigned_to' => ['nullable', 'string', 'max:100'],
            'remarks' => ['nullable', 'string'],
        ]);

        if (array_key_exists('status', $validated)) {
            $ticket->status = strtoupper((string) $validated['status']);
            $ticket->resolved_at = in_array($ticket->status, ['RESOLVED', 'CLOSED'], true)
                ? ($ticket->resolved_at ?? now())
                : null;
        }

        if (array_key_exists('priority', $validated)) {
            $ticket->priority = strtoupper((string) $validated['priority']);
        }

        if (array_key_exists('assigned_to', $validated)) {
            $ticket->assigned_to = $validated['assigned_to'];
        }

        if (array_key_exists('remarks', $validated)) {
            $ticket->remarks = $validated['remarks'];
        }

        $ticket->save();

        return response()->json([
            'message' => 'Waterworks ticket updated successfully.',
            'ticket' => $ticket,
        ]);
    }

    public function summary(): JsonResponse
    {
        $tickets = WaterworksTicket::query();

        return response()->json([
            'open' => (clone $tickets)->where('status', 'OPEN')->count(),
            'in_progress' => (clone $tickets)->where('status', 'IN_PROGRESS')->count(),
            'resolved' => (clone $tickets)->where('status', 'RESOLVED')->count(),
            'closed' => (clone $tickets)->where('status', 'CLOSED')->count(),
            'high_priority' => (clone $tickets)->where('priority', 'HIGH')->count(),
            'total' => (clone $tickets)->count(),
        ]);
    }

    private function generateTicketNumber(): string
    {
        $datePrefix = now()->format('Ymd');
        $sequence = WaterworksTicket::query()
            ->whereDate('created_at', now()->toDateString())
            ->count() + 1;

        return sprintf('WW-%s-%04d', $datePrefix, $sequence);
    }
}
