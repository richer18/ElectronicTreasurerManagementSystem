<?php

namespace App\Http\Controllers;

use App\Models\BplsApplication;
use App\Models\BplsCollection;
use App\Models\BplsTypeApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class BplsDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $applications = BplsApplication::query()
            ->orderByDesc('transaction_date')
            ->orderByDesc('date_issued')
            ->orderByDesc('id')
            ->limit(500)
            ->get();

        $applicationMap = $applications
            ->groupBy('business_identification_number')
            ->map(fn ($group) => $group->first());

        $typeApplications = BplsTypeApplication::query()
            ->orderByDesc('id')
            ->get()
            ->groupBy('business_identification_number')
            ->map(fn ($group) => $group->first());

        $collections = BplsCollection::query()
            ->get()
            ->groupBy('business_identification_number')
            ->map(function ($group) {
                return [
                    'totalAmountPaid' => (float) $group->sum('amount_paid'),
                    'latestOrNumber' => optional($group->sortByDesc('date_paid')->first())->or_number,
                    'latestPaidAt' => optional(optional($group->sortByDesc('date_paid')->first())->date_paid)?->format('d M Y h:i A'),
                ];
            });

        $bins = $applicationMap->keys()
            ->merge($typeApplications->keys())
            ->merge($collections->keys())
            ->unique()
            ->filter()
            ->values();

        $payload = $bins->map(function ($bin) use ($applicationMap, $typeApplications, $collections) {
            $record = $applicationMap->get($bin);
            $type = $typeApplications->get($bin);
            $collection = $collections->get($bin, []);
            $statusOfApplication = $type->status_of_application
                ?? $record?->status_of_application
                ?? $record?->site_transaction_status
                ?? 'PENDING';
            $baseRegistrationStatus = $record?->status_of_registration
                ?? $type?->type_of_application
                ?? $record?->transaction_type
                ?? 'N/A';
            $expirationDate = $this->resolveExpirationDate($record);
            $registrationStatus = $this->resolveRegistrationStatus($baseRegistrationStatus, $expirationDate);
            $businessName = $record?->business_name ?? $type?->business_name;

            if (! $businessName) {
                return null;
            }

            return [
                'id' => $record?->transaction_id ?: $record?->record_key ?: $bin,
                'recordKey' => $record?->record_key ?: sha1((string) $bin),
                'businessIdentificationNumber' => $bin,
                'businessName' => $businessName,
                'businessType' => $type?->type_of_business ?? $record?->business_type,
                'typeOfApplication' => $type?->type_of_application ?? $record?->status_of_registration ?? $record?->transaction_type,
                'registrationStatus' => $registrationStatus,
                'statusOfApplication' => $statusOfApplication,
                'status' => $this->mapUiStatus($statusOfApplication),
                'amountPaid' => $this->formatCurrency($collection['totalAmountPaid'] ?? $type?->total_amount_paid ?? $record?->amount_paid ?? $record?->annual_amount),
                'owner' => $record?->owner_name ?: ($type?->owner_name ?? null),
                'barangay' => $record?->office_barangay,
                'lineOfBusiness' => $record?->business_line ?: $record?->business_nature,
                'permitNo' => $record?->permit_no,
                'dateIssued' => optional($record?->date_issued)->format('d M Y'),
                'expirationDate' => optional($expirationDate)->format('d M Y'),
                'dateApplied' => optional($record?->transaction_date)->format('d M Y'),
                'orNumber' => $collection['latestOrNumber'] ?? null,
                'latestPaidAt' => $collection['latestPaidAt'] ?? null,
            ];
        })->filter()->values();

        return response()->json($payload);
    }

    public function show(string $bin): JsonResponse
    {
        $application = BplsApplication::query()
            ->where('business_identification_number', $bin)
            ->orderByDesc('transaction_date')
            ->orderByDesc('date_issued')
            ->first();

        $typeApplication = BplsTypeApplication::query()
            ->where('business_identification_number', $bin)
            ->orderByDesc('id')
            ->first();

        $collections = BplsCollection::query()
            ->where('business_identification_number', $bin)
            ->orderByDesc('date_paid')
            ->get();

        if (! $application && ! $typeApplication && $collections->isEmpty()) {
            return response()->json(['message' => 'Business record not found.'], 404);
        }

        $expirationDate = $this->resolveExpirationDate($application);
        $baseRegistrationStatus = $application->status_of_registration ?? $typeApplication->type_of_application ?? $application->transaction_type;
        $registrationStatus = $this->resolveRegistrationStatus($baseRegistrationStatus, $expirationDate);

        return response()->json([
            'businessIdentificationNumber' => $bin,
            'businessName' => $application->business_name ?? $typeApplication->business_name ?? optional($collections->first())->business_name,
            'typeOfBusiness' => $typeApplication->type_of_business ?? $application->business_type,
            'typeOfApplication' => $typeApplication->type_of_application ?? $application->status_of_registration ?? $application->transaction_type,
            'statusOfApplication' => $typeApplication->status_of_application ?? $application->status_of_application,
            'statusOfRegistration' => $registrationStatus,
            'registrationNo' => $application->registration_no,
            'permitNo' => $application->permit_no,
            'ownerName' => $application->owner_name ?? $typeApplication->owner_name,
            'businessAddress' => $application->business_address,
            'barangay' => $application->office_barangay ?? optional($collections->first())->barangay_name,
            'lineOfBusiness' => $application->business_line ?: $application->business_nature,
            'dateApplied' => optional($application?->transaction_date)->format('F d, Y'),
            'dateIssued' => optional($application?->date_issued)->format('F d, Y'),
            'expirationDate' => optional($expirationDate)->format('F d, Y'),
            'contactNo' => $application->contact_no,
            'emailAddress' => $application->email_address,
            'employees' => [
                'total' => $application->total_no_of_employees,
                'male' => $application->male_employees,
                'female' => $application->female_employees,
            ],
            'financials' => [
                'capitalInvestment' => $this->formatCurrency($typeApplication->capital_investment ?? $application->capital),
                'grossSalesEssential' => $this->formatCurrency($typeApplication->gross_sales_essential ?? $application->gross_amount_essential),
                'grossSalesNonEssential' => $this->formatCurrency($typeApplication->gross_sales_non_essential ?? $application->gross_amount_non_essential),
                'totalAmountPaid' => $this->formatCurrency($collections->sum('amount_paid') ?: ($typeApplication->total_amount_paid ?? $application->amount_paid)),
            ],
            'collections' => $collections->take(5)->map(fn ($item) => [
                'orNumber' => $item->or_number,
                'datePaid' => optional($item->date_paid)->format('F d, Y h:i A'),
                'amountPaid' => $this->formatCurrency($item->amount_paid),
                'transactionType' => $item->transaction_type,
                'breakdown' => [
                    'Business Tax' => $this->formatCurrency($item->business_tax),
                    'Mayor\'s Permit Fee' => $this->formatCurrency($item->mayors_permit_fee_current ?: $item->mayors_permit_fee),
                    'Fixed Tax' => $this->formatCurrency($item->fixed_tax_current ?: $item->fixed_tax),
                    'Garbage Fee' => $this->formatCurrency($item->garbage_fee_current ?: $item->garbage_fee),
                    'Occupational Tax' => $this->formatCurrency($item->occupational_tax),
                    'Clearance Fee' => $this->formatCurrency($item->clearance_fee),
                    'Signboard and Billboard Fee' => $this->formatCurrency($item->signboard_billboard_fee),
                    'Weight and Measures Fee' => $this->formatCurrency($item->weight_measures_fee),
                    'Building Inspection Fee' => $this->formatCurrency($item->building_inspection_fee),
                    'Electrical Inspection Fee' => $this->formatCurrency($item->electrical_inspection_fee),
                    'Sanitary Inspection Fee' => $this->formatCurrency($item->sanitary_inspection_fee),
                    'Mechanical Inspection Fee' => $this->formatCurrency($item->mechanical_inspection_fee),
                    'Zoning Inspection Fee' => $this->formatCurrency($item->zoning_inspection_fee),
                    'Sticker Business Plate' => $this->formatCurrency($item->sticker_business_plate),
                    'Mooring Fee' => $this->formatCurrency($item->mooring_fee),
                    'Signage Fee' => $this->formatCurrency($item->signage_fee),
                    'Certification Fee' => $this->formatCurrency($item->certification_fee),
                    'Tax Credit' => $this->formatCurrency($item->tax_credit),
                    'Discount' => $this->formatCurrency($item->discount),
                    'Interest' => $this->formatCurrency($item->interest),
                    'Surcharge' => $this->formatCurrency($item->surcharge),
                    'Gross Total' => $this->formatCurrency($item->gross_total),
                ],
            ])->values(),
        ]);
    }

    public function summary(): JsonResponse
    {
        $applications = BplsApplication::query();
        $typeApplications = BplsTypeApplication::query();
        $collections = BplsCollection::query();

        $masterListCount = (clone $applications)->count();
        $typeApplicationCount = (clone $typeApplications)->count();
        $collectionCount = (clone $collections)->count();
        $linkedBusinesses = collect((clone $applications)->pluck('business_identification_number'))
            ->merge((clone $typeApplications)->pluck('business_identification_number'))
            ->merge((clone $collections)->pluck('business_identification_number'))
            ->filter()
            ->unique()
            ->count();

        $payload = [
            'applicationsToday' => (clone $applications)->whereDate('transaction_date', now()->toDateString())->count(),
            'pendingEvaluation' => (clone $applications)->whereNotIn('status_of_application', ['ISSUED', 'FOR PICK-UP'])->count(),
            'assessedFees' => (float) (clone $collections)->sum('amount_paid'),
            'releasedPermits' => (clone $applications)->where('status_of_application', 'ISSUED')->count(),
            'needsAssessment' => (clone $applications)->whereNull('date_issued')->count(),
            'forCompliance' => (clone $applications)->where('status_of_application', 'CANCELLED')->count(),
            'readyToRelease' => (clone $applications)->where('status_of_application', 'FOR PICK-UP')->count(),
            'collectionsTotal' => (float) (clone $collections)->sum('amount_paid'),
            'paidTransactions' => (clone $collections)->count(),
            'masterListCount' => $masterListCount,
            'typeApplicationCount' => $typeApplicationCount,
            'collectionCount' => $collectionCount,
            'linkedBusinesses' => $linkedBusinesses,
            'bplsDataReady' => $masterListCount > 0 && $typeApplicationCount > 0 && $collectionCount > 0,
        ];

        return response()->json($payload);
    }

    private function mapUiStatus(?string $status): string
    {
        $value = strtoupper(trim((string) $status));

        return match (true) {
            $value === 'ISSUED' => 'released',
            $value === 'FOR PICK-UP' => 'assessment',
            str_contains($value, 'PAY') => 'payment',
            str_contains($value, 'CANCEL') => 'returned',
            default => 'verification',
        };
    }

    private function resolveExpirationDate(?BplsApplication $application): ?Carbon
    {
        if (! $application) {
            return null;
        }

        $year = $application->year;

        if (! $year && $application->date_issued) {
            $year = Carbon::parse($application->date_issued)->year;
        }

        if (! $year && $application->transaction_date) {
            $year = Carbon::parse($application->transaction_date)->year;
        }

        return $year ? Carbon::create((int) $year, 12, 31)->startOfDay() : null;
    }

    private function resolveRegistrationStatus(?string $status, ?Carbon $expirationDate): string
    {
        $value = strtoupper(trim((string) $status));

        if ($value === '') {
            $value = 'ACTIVE';
        }

        if (
            $expirationDate &&
            $expirationDate->lt(now()->startOfDay()) &&
            ! str_contains($value, 'CANCEL') &&
            ! str_contains($value, 'RETIRE') &&
            ! str_contains($value, 'CLOSE')
        ) {
            return 'EXPIRED';
        }

        return $value;
    }

    private function formatCurrency($value): string
    {
        return 'PHP ' . number_format((float) $value, 2);
    }
}
