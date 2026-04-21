<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;

class WaterWorksAccountsJSONDataController extends Controller
{
    private string $dataDir;

    public function __construct()
    {
        $this->dataDir = storage_path('waterworks');
    }

    public function index(): JsonResponse
    {
        $accounts = [];

        if (! File::exists($this->dataDir)) {
            File::makeDirectory($this->dataDir, 0755, true);
        }

        $files = File::files($this->dataDir);

        foreach ($files as $file) {
            $fileName = $file->getFilename();

            if (! str_starts_with($fileName, 'ZAM_') || $file->getExtension() !== 'json') {
                continue;
            }

            $content = json_decode(File::get($file->getPathname()), true);

            if (! is_array($content)) {
                continue;
            }

            $fullName = trim((string) ($content['fullName'] ?? ''));

            if ($fullName === '') {
                $fullName = trim(
                    ($content['lastName'] ?? '') . ', ' .
                    ($content['firstName'] ?? '') . ' ' .
                    ($content['middleName'] ?? '')
                );
            }

            $accounts[] = [
                'accountNumber' => $content['accountNumber'] ?? null,
                'fullName' => preg_replace('/\s+/', ' ', $fullName),
                'firstName' => $content['firstName'] ?? null,
                'middleName' => $content['middleName'] ?? null,
                'lastName' => $content['lastName'] ?? null,
                'waterMeter' => $content['waterMeter'] ?? null,
                'waterConnectionType' => $content['waterConnectionType'] ?? null,
                'barangay' => $content['barangay'] ?? null,
                'street' => $content['street'] ?? null,
                'purok' => $content['purok'] ?? null,
                'municipality' => $content['municipality'] ?? null,
                'province' => $content['province'] ?? null,
                'address' => $content['address'] ?? collect([
                    $content['purok'] ?? null,
                    $content['street'] ?? null,
                    $content['barangay'] ?? null,
                    $content['municipality'] ?? null,
                    $content['province'] ?? null,
                ])->filter()->implode(', '),
            ];
        }

        return response()->json($accounts);
    }
}
