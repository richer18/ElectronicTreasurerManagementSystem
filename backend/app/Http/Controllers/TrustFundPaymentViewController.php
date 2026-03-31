<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class TrustFundPaymentViewController extends Controller
{
    public function show(string $paymentId)
    {
        try {
            $payment = DB::table('trust_fund_payment')
                ->where('ID', $paymentId)
                ->first();

            if (!$payment) {
                return response()->json(['error' => 'Payment not found'], 404);
            }

            $rows = collect([
                ['DESCRIPTION' => 'BUILDING PERMIT FEE', 'AMOUNT' => $payment->BUILDING_PERMIT_FEE],
                ['DESCRIPTION' => 'ELECTRICAL FEE', 'AMOUNT' => $payment->ELECTRICAL_FEE],
                ['DESCRIPTION' => 'ZONING FEE', 'AMOUNT' => $payment->ZONING_FEE],
                ['DESCRIPTION' => 'LIVESTOCK DEVELOPMENT FUND', 'AMOUNT' => $payment->LIVESTOCK_DEV_FUND],
                ['DESCRIPTION' => 'DIVING FEE', 'AMOUNT' => $payment->DIVING_FEE],
            ])
                ->filter(fn ($row) => (float) ($row['AMOUNT'] ?? 0) !== 0.0)
                ->map(fn ($row) => [
                    'DATE' => $payment->DATE,
                    'NAME' => $payment->NAME,
                    'DESCRIPTION' => $row['DESCRIPTION'],
                    'AMOUNT' => (float) $row['AMOUNT'],
                ])
                ->values();

            return response()->json($rows);
        } catch (\Exception $e) {
            \Log::error('Error fetching trust fund payment view: ' . $e->getMessage());
            return response()->json(['error' => 'Database query failed'], 500);
        }
    }
}
