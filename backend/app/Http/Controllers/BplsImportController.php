<?php

namespace App\Http\Controllers;

use App\Models\BplsApplication;
use App\Models\BplsCollection;
use App\Support\SimpleXlsxReader;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BplsImportController extends Controller
{
    public function importApplications(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx|max:20480',
        ])->validate();

        $file = $validated['file'];
        $rows = (new SimpleXlsxReader())->readRows($file->getRealPath());
        $headerIndex = $this->findHeaderRowIndex($rows, ['Business Identification Number', 'Business Name', 'Transaction Type']);

        if ($headerIndex === null) {
            return response()->json(['message' => 'Could not find the master list header row.'], 422);
        }

        $headers = $this->normalizeHeaders($rows[$headerIndex]);
        $imported = 0;

        DB::connection('bplo')->transaction(function () use ($rows, $headerIndex, $headers, $file, &$imported) {
            foreach (array_slice($rows, $headerIndex + 1) as $offset => $row) {
                $assoc = $this->rowToAssoc($headers, $row);

                if ($this->isEmptyRow($assoc) || empty($assoc['business_identification_number']) || empty($assoc['business_name'])) {
                    continue;
                }

                $payload = [
                    'source_file_name' => $file->getClientOriginalName(),
                    'source_row_number' => $headerIndex + $offset + 2,
                    'imported_at' => now(),
                    'business_identification_number' => $assoc['business_identification_number'],
                    'business_name' => $assoc['business_name'],
                    'trade_name' => $assoc['trade_name'],
                    'business_nature' => $assoc['business_nature'],
                    'business_line' => $assoc['business_line'],
                    'business_type' => $assoc['business_type'],
                    'registration_no' => $assoc['registration_no'],
                    'transmittal_no' => $assoc['transmittal_no'],
                    'incharge_first_name' => $assoc['incharge_first_name'],
                    'incharge_middle_name' => $assoc['incharge_middle_name'],
                    'incharge_last_name' => $assoc['incharge_last_name'],
                    'incharge_extension_name' => $assoc['incharge_extension_name'],
                    'incharge_sex' => $assoc['incharge_sex'],
                    'citizenship' => $assoc['citizenship'],
                    'office_street' => $assoc['office_street'],
                    'office_region' => $assoc['office_region'],
                    'office_province' => $assoc['office_province'],
                    'office_municipality' => $assoc['office_municipality'],
                    'office_barangay' => $assoc['office_barangay'],
                    'office_zipcode' => $assoc['office_zipcode'],
                    'total_no_of_employees' => $this->toInteger($assoc['total_no_of_employees']),
                    'year' => $this->toInteger($assoc['year']),
                    'capital' => $this->toDecimal($assoc['capital']),
                    'gross_amount' => $this->toDecimal($assoc['gross_amount']),
                    'gross_amount_essential' => $this->toDecimal($assoc['gross_amount_essential']),
                    'gross_amount_non_essential' => $this->toDecimal($assoc['gross_amount_non_essential']),
                    'reject_remarks' => $assoc['reject_remarks'],
                    'module_type' => $assoc['module_type'],
                    'transaction_type' => $assoc['transaction_type'],
                    'requestor_first_name' => $assoc['requestor_first_name'],
                    'requestor_middle_name' => $assoc['requestor_middle_name'],
                    'requestor_last_name' => $assoc['requestor_last_name'],
                    'requestor_extension_name' => $assoc['requestor_extension_name'],
                    'requestor_email' => $assoc['requestor_email'],
                    'requestor_mobile_no' => $this->toPlainString($assoc['requestor_mobile_no']),
                    'birth_date' => $this->toDate($assoc['birth_date']),
                    'requestor_sex' => $assoc['requestor_sex'],
                    'civil_status' => $assoc['civil_status'],
                    'requestor_street' => $assoc['requestor_street'],
                    'requestor_province' => $assoc['requestor_province'],
                    'requestor_municipality' => $assoc['requestor_municipality'],
                    'requestor_barangay' => $assoc['requestor_barangay'],
                    'requestor_zipcode' => $assoc['requestor_zipcode'],
                    'transaction_id' => $assoc['transaction_id'],
                    'reference_no' => $assoc['reference_no'],
                    'brgy_clearance_status' => $assoc['brgy_clearance_status'],
                    'site_transaction_status' => $assoc['site_transaction_status'],
                    'core_transaction_status' => $assoc['core_transaction_status'],
                    'transaction_date' => $this->toDate($assoc['transaction_date']),
                    'soa_no' => $assoc['soa_no'],
                    'annual_amount' => $this->toDecimal($assoc['annual_amount']),
                    'term' => $assoc['term'],
                    'amount_paid' => $this->toDecimal($assoc['amount_paid']),
                    'balance' => $this->toDecimal($assoc['balance']),
                    'payment_type' => $assoc['payment_type'],
                    'payment_date' => $this->toDate($assoc['payment_date']),
                    'or_no' => $assoc['o_r_no'],
                    'brgy_clearance_no' => $assoc['brgy_clearance_no'],
                    'or_date' => $this->toDate($assoc['o_r_date']),
                    'permit_no' => $assoc['permit_no'],
                    'business_plate_no' => $assoc['business_plate_no'],
                    'actual_closure_date' => $this->toDate($assoc['actual_closure_date']),
                    'retirement_reason' => $assoc['retirement_reason'],
                    'source_type' => $assoc['source_type'],
                ];

                BplsApplication::updateOrCreate(
                    ['record_key' => $this->applicationRecordKey($assoc)],
                    $payload
                );

                $imported++;
            }
        });

        return response()->json([
            'message' => 'BPLS master list imported successfully.',
            'imported' => $imported,
        ]);
    }

    public function importCollections(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx|max:20480',
        ])->validate();

        $file = $validated['file'];
        $rows = (new SimpleXlsxReader())->readRows($file->getRealPath());
        $headerIndex = $this->findHeaderRowIndex($rows, ['O.R. Date', 'O.R. Number', 'Business Identification Number']);

        if ($headerIndex === null) {
            return response()->json(['message' => 'Could not find the general collection header row.'], 422);
        }

        $headers = $this->normalizeHeaders($rows[$headerIndex]);
        $imported = 0;

        DB::connection('bplo')->transaction(function () use ($rows, $headerIndex, $headers, $file, &$imported) {
            foreach (array_slice($rows, $headerIndex + 1) as $offset => $row) {
                $assoc = $this->rowToAssoc($headers, $row);

                if ($this->isEmptyRow($assoc) || empty($assoc['o_r_number']) || empty($assoc['business_identification_number'])) {
                    continue;
                }

                $payload = [
                    'source_file_name' => $file->getClientOriginalName(),
                    'source_row_number' => $headerIndex + $offset + 2,
                    'imported_at' => now(),
                    'or_date' => $this->toDate($assoc['o_r_date']),
                    'date_paid' => $this->toDateTime($assoc['date_paid']),
                    'or_number' => $assoc['o_r_number'],
                    'transaction_type' => $assoc['transaction_type'],
                    'business_identification_number' => $assoc['business_identification_number'],
                    'incharge_name' => $assoc['incharge_name'],
                    'business_name' => $assoc['business_name'],
                    'barangay_name' => $assoc['barangay_name'],
                    'business_tax' => $this->toDecimal($assoc['business_tax']),
                    'mayors_permit_fee' => $this->toDecimal($assoc['mayor_s_permit_fee']),
                    'fixed_tax' => $this->toDecimal($assoc['fixed_tax']),
                    'garbage_fee' => $this->toDecimal($assoc['garbage_fee']),
                    'occupational_tax' => $this->toDecimal($assoc['oct_occupational_tax']),
                    'deleted_mayors_permit_fee' => $this->toDecimal($assoc['mpf_mayor_s_permit_fee_deleted']),
                    'deleted_fixed_tax' => $this->toDecimal($assoc['fix_tx_fixed_tax_deleted']),
                    'deleted_sticker_business_plate' => $this->toDecimal($assoc['stckr_bus_plte_sticker_business_plate_deleted']),
                    'clearance_fee' => $this->toDecimal($assoc['clr_fee_clearance_fee']),
                    'fixed_tax_current' => $this->toDecimal($assoc['fix_tx_fixed_tax']),
                    'mayors_permit_fee_current' => $this->toDecimal($assoc['mpf_mayor_s_permit_fee']),
                    'signboard_billboard_fee' => $this->toDecimal($assoc['sign_billbrd_signboard_and_billboard_fee']),
                    'weight_measures_fee' => $this->toDecimal($assoc['w_m_fee_weight_measures_fee']),
                    'deleted_zoning_fee' => $this->toDecimal($assoc['zon_fee_zoning_inspection_fee_deleted']),
                    'deleted_mpdo_fee' => $this->toDecimal($assoc['mpdo_mpdo_deleted']),
                    'building_inspection_fee' => $this->toDecimal($assoc['obo_building_inspection_fee']),
                    'electrical_inspection_fee' => $this->toDecimal($assoc['oboe_electrical_inspection_fee']),
                    'sanitary_inspection_fee' => $this->toDecimal($assoc['rhu_s_fee_sanitary_inspection_fee']),
                    'mechanical_inspection_fee' => $this->toDecimal($assoc['obom_mechanical_inspection_fee']),
                    'zoning_inspection_fee' => $this->toDecimal($assoc['mpdo_zon_zoning_inspection_fee']),
                    'real_property_tax' => $this->toDecimal($assoc['ass_rpt_real_property_tax']),
                    'garbage_fee_current' => $this->toDecimal($assoc['gar_garbage_fee']),
                    'sticker_business_plate' => $this->toDecimal($assoc['stckr_bus_plte_sticker_business_plate']),
                    'mooring_fee' => $this->toDecimal($assoc['mor_mooring_fee']),
                    'signage_fee' => $this->toDecimal($assoc['sign_nage_fee_signage_fee']),
                    'certification_fee' => $this->toDecimal($assoc['other_cert_fee_certification_fee']),
                    'gross_amount_essential' => $this->toDecimal($assoc['gross_amount_essential']),
                    'gross_amount_non_essential' => $this->toDecimal($assoc['gross_amount_non_essential']),
                    'gross_total' => $this->toDecimal($assoc['gross_total']),
                    'capital' => $this->toDecimal($assoc['capital']),
                    'tax_credit' => $this->toDecimal($assoc['tax_credit']),
                    'discount' => $this->toDecimal($assoc['discount']),
                    'interest' => $this->toDecimal($assoc['interest']),
                    'surcharge' => $this->toDecimal($assoc['surcharge']),
                    'amount_paid' => $this->toDecimal($assoc['amount_paid']),
                ];

                BplsCollection::updateOrCreate(
                    ['record_key' => $this->collectionRecordKey($assoc)],
                    $payload
                );

                $imported++;
            }
        });

        return response()->json([
            'message' => 'BPLS general collection imported successfully.',
            'imported' => $imported,
        ]);
    }

    private function findHeaderRowIndex(array $rows, array $requiredHeaders): ?int
    {
        $normalizedRequired = array_map([$this, 'normalizeHeader'], $requiredHeaders);

        foreach (array_slice($rows, 0, 20, true) as $index => $row) {
            $normalizedRow = array_map([$this, 'normalizeHeader'], $row);
            $matched = array_intersect($normalizedRequired, $normalizedRow);

            if (count($matched) === count($normalizedRequired)) {
                return $index;
            }
        }

        return null;
    }

    private function normalizeHeaders(array $headers): array
    {
        return array_map([$this, 'normalizeHeader'], $headers);
    }

    private function normalizeHeader(?string $header): string
    {
        $header = Str::of((string) $header)
            ->replace('&', ' and ')
            ->replace('.', ' ')
            ->replace('/', ' ')
            ->replace('-', ' ')
            ->replace('(', ' ')
            ->replace(')', ' ')
            ->replace("'", ' ')
            ->replace(',', ' ')
            ->replace(':', ' ')
            ->lower()
            ->squish()
            ->replaceMatches('/[^a-z0-9 ]+/', '')
            ->replace(' ', '_')
            ->toString();

        return $header;
    }

    private function rowToAssoc(array $headers, array $row): array
    {
        $assoc = [];

        foreach ($headers as $index => $header) {
            if ($header === '') {
                continue;
            }

            $assoc[$header] = isset($row[$index]) ? trim((string) $row[$index]) : null;
        }

        return $assoc;
    }

    private function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if ($value !== null && $value !== '') {
                return false;
            }
        }

        return true;
    }

    private function applicationRecordKey(array $row): string
    {
        $parts = [
            $row['transaction_id'] ?? null,
            $row['reference_no'] ?? null,
            $row['permit_no'] ?? null,
            $row['o_r_no'] ?? null,
            $row['business_identification_number'] ?? null,
            $row['transaction_date'] ?? null,
            $row['transaction_type'] ?? null,
        ];

        return sha1(implode('|', array_map(fn ($value) => (string) $value, $parts)));
    }

    private function collectionRecordKey(array $row): string
    {
        $parts = [
            $row['o_r_number'] ?? null,
            $row['business_identification_number'] ?? null,
            $row['date_paid'] ?? null,
            $row['amount_paid'] ?? null,
        ];

        return sha1(implode('|', array_map(fn ($value) => (string) $value, $parts)));
    }

    private function toDecimal(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $normalized = str_replace([',', ' '], '', $value);

        if (! is_numeric($normalized)) {
            return null;
        }

        return number_format((float) $normalized, 2, '.', '');
    }

    private function toInteger(?string $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }

    private function toPlainString(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $trimmed = trim($value);

        if (str_contains(strtolower($trimmed), 'e+')) {
            return sprintf('%.0f', (float) $trimmed);
        }

        return $trimmed;
    }

    private function toDate(?string $value): ?string
    {
        if ($value === null || $value === '' || strtoupper($value) === 'N/A') {
            return null;
        }

        if (is_numeric($value) && (float) $value > 20000) {
            return Carbon::createFromDate(1899, 12, 30)->addDays((int) floor((float) $value))->format('Y-m-d');
        }

        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    private function toDateTime(?string $value): ?string
    {
        if ($value === null || $value === '' || strtoupper($value) === 'N/A') {
            return null;
        }

        try {
            return Carbon::parse($value)->format('Y-m-d H:i:s');
        } catch (\Throwable) {
            return null;
        }
    }
}
