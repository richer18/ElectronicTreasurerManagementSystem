<?php

namespace App\Http\Controllers;

use App\Models\BplsApplication;
use App\Models\BplsCollection;
use Illuminate\Http\JsonResponse;

class BplsDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $applications = BplsApplication::query()
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->limit(500)
            ->get()
            ->map(fn (BplsApplication $record) => [
                'id' => $record->transaction_id ?: $record->record_key,
                'recordKey' => $record->record_key,
                'businessName' => $record->business_name,
                'owner' => trim(implode(' ', array_filter([
                    $record->incharge_first_name,
                    $record->incharge_middle_name,
                    $record->incharge_last_name,
                    $record->incharge_extension_name,
                ]))),
                'barangay' => $record->office_barangay,
                'permitType' => $record->transaction_type ?: 'N/A',
                'lineOfBusiness' => $record->business_line ?: $record->business_nature,
                'status' => $this->mapUiStatus($record->site_transaction_status, $record->core_transaction_status),
                'step' => $this->stepLabel($record->site_transaction_status, $record->core_transaction_status),
                'completeness' => $this->completeness($record),
                'submittedAt' => optional($record->transaction_date)->format('d M Y'),
                'dueNote' => $this->dueNote($record),
                'amount' => $this->formatCurrency($record->annual_amount ?: $record->amount_paid),
                'initials' => $this->initials($record->business_name),
            ])
            ->values();

        return response()->json($applications);
    }

    public function summary(): JsonResponse
    {
        $applications = BplsApplication::query();
        $collections = BplsCollection::query();

        $payload = [
            'applicationsToday' => (clone $applications)->whereDate('transaction_date', now()->toDateString())->count(),
            'pendingEvaluation' => (clone $applications)
                ->whereNotIn('site_transaction_status', ['ISSUED', 'FOR PICK-UP'])
                ->count(),
            'assessedFees' => (float) (clone $applications)->sum('annual_amount'),
            'releasedPermits' => (clone $applications)
                ->whereIn('site_transaction_status', ['ISSUED', 'FOR PICK-UP'])
                ->count(),
            'needsAssessment' => (clone $applications)
                ->where(function ($query) {
                    $query->whereNull('soa_no')
                        ->orWhere('annual_amount', '<=', 0);
                })
                ->count(),
            'forCompliance' => (clone $applications)
                ->whereNotNull('reject_remarks')
                ->where('reject_remarks', '!=', '')
                ->count(),
            'readyToRelease' => (clone $applications)
                ->whereIn('site_transaction_status', ['FOR PICK-UP'])
                ->count(),
            'collectionsTotal' => (float) (clone $collections)->sum('amount_paid'),
            'paidTransactions' => (clone $collections)->count(),
        ];

        return response()->json($payload);
    }

    private function mapUiStatus(?string $siteStatus, ?string $coreStatus): string
    {
        $site = strtoupper(trim((string) $siteStatus));
        $core = strtoupper(trim((string) $coreStatus));

        if (in_array($site, ['FOR PICK-UP', 'ISSUED'], true) || in_array($core, ['FOR PICK-UP', 'ISSUED'], true)) {
            return 'released';
        }

        if (str_contains($site, 'CANCEL') || str_contains($core, 'CANCEL')) {
            return 'returned';
        }

        if ($this->hasPayment($site, $core)) {
            return 'payment';
        }

        if ($this->hasAssessment($site, $core)) {
            return 'assessment';
        }

        return 'verification';
    }

    private function stepLabel(?string $siteStatus, ?string $coreStatus): string
    {
        return match ($this->mapUiStatus($siteStatus, $coreStatus)) {
            'released' => 'Permit Ready for Release',
            'returned' => 'Returned for Compliance',
            'payment' => 'Payment Posted',
            'assessment' => 'Tax and Fee Assessment',
            default => 'Document Verification',
        };
    }

    private function completeness(BplsApplication $record): int
    {
        $score = 25;

        if (! empty($record->soa_no) || (float) $record->annual_amount > 0) {
            $score += 25;
        }

        if ((float) $record->amount_paid > 0 || ! empty($record->or_no)) {
            $score += 25;
        }

        if (in_array($record->site_transaction_status, ['FOR PICK-UP', 'ISSUED'], true) || ! empty($record->permit_no)) {
            $score += 25;
        }

        return min(100, $score);
    }

    private function dueNote(BplsApplication $record): string
    {
        if (! empty($record->reject_remarks)) {
            return $record->reject_remarks;
        }

        if (! empty($record->permit_no) && in_array($record->site_transaction_status, ['FOR PICK-UP', 'ISSUED'], true)) {
            return 'Permit encoded and ready for release';
        }

        if ((float) $record->amount_paid > 0) {
            return 'Payment found in collection abstract';
        }

        if (! empty($record->soa_no)) {
            return 'Assessed and awaiting payment or release processing';
        }

        return 'Pending online validation and office review';
    }

    private function initials(?string $name): string
    {
        $parts = preg_split('/\s+/', trim((string) $name)) ?: [];
        $letters = '';

        foreach (array_slice($parts, 0, 2) as $part) {
            $letters .= strtoupper(substr($part, 0, 1));
        }

        return $letters ?: 'BP';
    }

    private function formatCurrency($value): string
    {
        return 'PHP ' . number_format((float) $value, 2);
    }

    private function hasAssessment(?string $siteStatus, ?string $coreStatus): bool
    {
        $value = strtoupper(trim((string) ($siteStatus ?: $coreStatus)));
        return str_contains($value, 'ASSESS') || str_contains($value, 'APPROV');
    }

    private function hasPayment(?string $siteStatus, ?string $coreStatus): bool
    {
        $site = strtoupper(trim((string) $siteStatus));
        $core = strtoupper(trim((string) $coreStatus));

        return str_contains($site, 'PAY') || str_contains($core, 'PAY');
    }
}
