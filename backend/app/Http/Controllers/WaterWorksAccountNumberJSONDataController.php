<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class WaterWorksAccountNumberJSONDataController extends Controller
{
    private string $dataDir;

    public function __construct()
    {
        $this->dataDir = storage_path('waterworks');
    }

    public function show($accountNumber)
    {
        $filePath = $this->dataDir . DIRECTORY_SEPARATOR . 'ZAM_' . $accountNumber . '.json';

        if (! File::exists($filePath)) {
            return response()->json([
                'message' => 'Account not found',
            ], 404);
        }

        $account = json_decode(File::get($filePath), true);

        return response()->json($account);
    }

    public function update(Request $request, $accountNumber)
    {
        $validated = $request->validate([
            'accountNumber' => ['required', 'string', 'max:100'],
            'waterMeter' => ['nullable', 'string', 'max:100'],
            'waterConnectionType' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'fullName' => ['required', 'string', 'max:255'],
        ]);

        $filePath = $this->dataDir . DIRECTORY_SEPARATOR . 'ZAM_' . $accountNumber . '.json';

        if (! File::exists($filePath)) {
            return response()->json([
                'message' => 'Account not found',
            ], 404);
        }

        $account = json_decode(File::get($filePath), true);

        if (! is_array($account)) {
            return response()->json([
                'message' => 'Invalid account file',
            ], 500);
        }

        $newAccountNumber = trim((string) $validated['accountNumber']);
        $newFilePath = $this->dataDir . DIRECTORY_SEPARATOR . 'ZAM_' . $newAccountNumber . '.json';

        if ($newAccountNumber !== (string) $accountNumber && File::exists($newFilePath)) {
            return response()->json([
                'message' => 'Account number already exists',
            ], 422);
        }

        $account['accountNumber'] = $newAccountNumber;
        $account['waterMeter'] = $validated['waterMeter'] ?? null;
        $account['waterConnectionType'] = $validated['waterConnectionType'] ?? null;
        $account['address'] = trim((string) ($validated['address'] ?? ''));
        $account['fullName'] = trim((string) $validated['fullName']);
        $account['updated_at'] = now()->toISOString();

        File::put($filePath, json_encode($account, JSON_PRETTY_PRINT));

        if ($newFilePath !== $filePath) {
            File::move($filePath, $newFilePath);
        }

        return response()->json([
            'message' => 'Water account updated successfully',
            'account' => $account,
        ]);
    }
}
