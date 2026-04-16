<?php

namespace App\Http\Controllers;

use App\Helpers\GeneralFundPaymentSummaryHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WaterWorksPaymentsJSONDataController extends Controller
{
    private const WATER_SOURCE_IDS = ['815', '817', '819', '821', '827'];

    public function index(Request $request): JsonResponse
    {
        $perPage = max(5, min((int) $request->integer('per_page', 10), 100));

        $baseQuery = $this->baseWaterPaymentsQuery($request);

        $rows = (clone $baseQuery)
            ->selectRaw('
                MIN(gfp.id) as id,
                gfp.PAYMENT_ID as paymentId,
                MAX(gfp.PAYMENTDATE) as paymentDate,
                COALESCE(NULLIF(TRIM(gfp.PAIDBY), \'\'), \'-\') as taxpayer,
                COALESCE(NULLIF(TRIM(gfp.RECEIPTNO), \'\'), \'-\') as receiptNo,
                COALESCE(NULLIF(TRIM(gfp.COLLECTOR), \'\'), NULLIF(TRIM(gfp.USERID), \'\'), \'-\') as collector,
                COALESCE(NULLIF(TRIM(gfp.USERID), \'\'), \'-\') as userId,
                COALESCE(NULLIF(TRIM(gfp.LOCAL_TIN), \'\'), \'\') as localTin,
                ROUND(COALESCE(SUM(gfp.AMOUNTPAID), 0), 2) as amount,
                COUNT(*) as lineItemCount
            ')
            ->groupBy([
                'gfp.PAYMENT_ID',
                'gfp.PAIDBY',
                'gfp.RECEIPTNO',
                'gfp.COLLECTOR',
                'gfp.USERID',
                'gfp.LOCAL_TIN',
            ])
            ->orderByDesc('paymentDate')
            ->orderByDesc('id')
            ->paginate($perPage);

        $summaryBaseQuery = $this->baseWaterPaymentsQuery($request);
        $summary = [
            'totalCollections' => (float) ((clone $summaryBaseQuery)->sum('gfp.AMOUNTPAID') ?? 0),
            'allPayments' => (int) ((clone $summaryBaseQuery)->count()),
            'receipts' => (int) ((clone $summaryBaseQuery)->distinct('gfp.PAYMENT_ID')->count('gfp.PAYMENT_ID')),
            'meterPayments' => (int) ((clone $summaryBaseQuery)->where('gfp.SOURCEID', '821')->count()),
            'penaltyPayments' => (int) ((clone $summaryBaseQuery)->where('gfp.SOURCEID', '827')->count()),
            'taxpayers' => (int) ((clone $summaryBaseQuery)
                ->selectRaw('COALESCE(NULLIF(TRIM(gfp.LOCAL_TIN), \'\'), UPPER(TRIM(gfp.PAIDBY))) as taxpayer_key')
                ->distinct()
                ->get()
                ->count()),
        ];

        return response()->json([
            'data' => $rows->items(),
            'meta' => [
                'current_page' => $rows->currentPage(),
                'per_page' => $rows->perPage(),
                'total' => $rows->total(),
                'last_page' => $rows->lastPage(),
            ],
            'summary' => $summary,
        ]);
    }

    public function taxpayers(Request $request): JsonResponse
    {
        $limit = max(10, min((int) $request->integer('limit', 100), 250));
        $search = trim((string) $request->input('search', ''));

        $query = DB::table('general_fund_payment as gfp')
            ->whereIn('gfp.SOURCEID', self::WATER_SOURCE_IDS);

        GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');

        if ($search !== '') {
            $query->where(function ($searchQuery) use ($search) {
                $searchQuery
                    ->where('gfp.PAIDBY', 'like', "%{$search}%")
                    ->orWhere('gfp.LOCAL_TIN', 'like', "%{$search}%");
            });
        }

        $taxpayers = $query
            ->selectRaw("
                MIN(COALESCE(NULLIF(TRIM(gfp.PAIDBY), ''), '-')) as taxpayer,
                MIN(COALESCE(NULLIF(TRIM(gfp.LOCAL_TIN), ''), '')) as localTin,
                MAX(gfp.PAYMENTDATE) as latestPaymentDate,
                MAX(gfp.PAYMENT_ID) as paymentId
            ")
            ->groupBy('gfp.PAIDBY', 'gfp.LOCAL_TIN')
            ->orderByDesc('latestPaymentDate')
            ->limit($limit)
            ->get()
            ->values();

        return response()->json($taxpayers);
    }

    public function taxpayerPayments(Request $request): JsonResponse
    {
        $taxpayer = trim((string) $request->input('taxpayer', ''));
        $localTin = trim((string) $request->input('local_tin', ''));

        if ($taxpayer === '' && $localTin === '') {
            return response()->json(['message' => 'Taxpayer or local tin is required.'], 422);
        }

        $query = DB::table('general_fund_payment as gfp')
            ->select([
                'gfp.id',
                'gfp.PAYMENT_ID as paymentId',
                'gfp.PAYMENTDETAIL_ID as paymentDetailId',
                'gfp.PAYMENTDATE as paymentDate',
                'gfp.PAIDBY as taxpayer',
                'gfp.RECEIPTNO as receiptNo',
                'gfp.COLLECTOR as collector',
                'gfp.USERID as userId',
                'gfp.LOCAL_TIN as localTin',
                'gfp.AFTYPE as afType',
                'gfp.PAYMODE_CT as paymentMode',
                'gfp.SOURCEID as sourceId',
                'gfp.RATE_DESCRIPTION as rateDescription',
                'gfp.TAX_DESCRIPTION as taxDescription',
                'gfp.AMOUNTPAID as amount',
            ])
            ->whereIn('gfp.SOURCEID', self::WATER_SOURCE_IDS);

        GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');

        if ($localTin !== '') {
            $query->where('gfp.LOCAL_TIN', $localTin);
        } else {
            $query->whereRaw('UPPER(TRIM(COALESCE(gfp.PAIDBY, ""))) = ?', [mb_strtoupper($taxpayer)]);
        }

        $payments = $query
            ->orderByDesc('gfp.PAYMENTDATE')
            ->orderByDesc('gfp.id')
            ->get()
            ->values();

        $matchedAccount = $this->findMatchingAccount($taxpayer !== '' ? $taxpayer : (string) optional($payments->first())->taxpayer);

        return response()->json([
            'payments' => $payments,
            'account' => $matchedAccount,
        ]);
    }

    public function dailyReport(Request $request): JsonResponse
    {
        $date = $request->input('date', now()->toDateString());

        $query = DB::table('general_fund_payment as gfp')
            ->whereIn('gfp.SOURCEID', self::WATER_SOURCE_IDS)
            ->whereDate('gfp.PAYMENTDATE', $date);

        GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');

        $rows = $query
            ->selectRaw("
                MIN(gfp.id) as id,
                gfp.PAYMENT_ID as paymentId,
                MAX(gfp.PAYMENTDATE) as paymentDate,
                MIN(COALESCE(NULLIF(TRIM(gfp.PAIDBY), ''), '-')) as taxpayer,
                MIN(COALESCE(NULLIF(TRIM(gfp.RECEIPTNO), ''), '-')) as receiptNo,
                MIN(COALESCE(NULLIF(TRIM(gfp.COLLECTOR), ''), NULLIF(TRIM(gfp.USERID), ''), '-')) as collector,
                MIN(COALESCE(NULLIF(TRIM(gfp.LOCAL_TIN), ''), '')) as localTin,
                ROUND(COALESCE(SUM(gfp.AMOUNTPAID), 0), 2) as amount,
                COUNT(*) as lineItemCount
            ")
            ->groupBy('gfp.PAYMENT_ID')
            ->orderBy('receiptNo')
            ->get()
            ->values();

        return response()->json([
            'date' => $date,
            'rows' => $rows,
            'summary' => [
                'receipts' => $rows->count(),
                'collectors' => $rows->pluck('collector')->filter()->unique()->count(),
                'taxpayers' => $rows->map(fn ($row) => trim(($row->localTin ?: '') . '|' . ($row->taxpayer ?: '')))->unique()->count(),
                'totalAmount' => round((float) $rows->sum('amount'), 2),
            ],
        ]);
    }

    public function billingReport(Request $request): JsonResponse
    {
        $query = $this->baseWaterPaymentsQuery($request);

        $rows = $query
            ->selectRaw("
                gfp.SOURCEID as sourceId,
                MIN(COALESCE(NULLIF(TRIM(gfp.RATE_DESCRIPTION), ''), NULLIF(TRIM(gfp.TAX_DESCRIPTION), ''), CONCAT('SOURCE ', gfp.SOURCEID))) as description,
                ROUND(COALESCE(SUM(gfp.AMOUNTPAID), 0), 2) as amount,
                COUNT(*) as paymentCount,
                COUNT(DISTINCT gfp.PAYMENT_ID) as receiptCount
            ")
            ->groupBy('gfp.SOURCEID')
            ->orderByDesc('amount')
            ->get()
            ->values();

        return response()->json([
            'rows' => $rows,
            'summary' => [
                'categories' => $rows->count(),
                'paymentCount' => (int) $rows->sum('paymentCount'),
                'receiptCount' => (int) $rows->sum('receiptCount'),
                'totalAmount' => round((float) $rows->sum('amount'), 2),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $rows = (clone $this->baseWaterPaymentsQuery($request))
            ->selectRaw("
                MIN(gfp.id) as id,
                gfp.PAYMENT_ID as paymentId,
                MAX(gfp.PAYMENTDATE) as paymentDate,
                MIN(COALESCE(NULLIF(TRIM(gfp.PAIDBY), ''), '-')) as taxpayer,
                MIN(COALESCE(NULLIF(TRIM(gfp.RECEIPTNO), ''), '-')) as receiptNo,
                MIN(COALESCE(NULLIF(TRIM(gfp.COLLECTOR), ''), NULLIF(TRIM(gfp.USERID), ''), '-')) as collector,
                MIN(COALESCE(NULLIF(TRIM(gfp.LOCAL_TIN), ''), '')) as localTin,
                ROUND(COALESCE(SUM(gfp.AMOUNTPAID), 0), 2) as amount
            ")
            ->groupBy('gfp.PAYMENT_ID')
            ->orderByDesc('paymentDate')
            ->get();

        $fileName = 'waterworks-payments-' . Carbon::now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Date Paid', 'Taxpayer', 'Receipt No', 'Collector', 'Local TIN', 'Amount']);

            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->paymentDate,
                    $row->taxpayer,
                    $row->receiptNo,
                    $row->collector,
                    $row->localTin,
                    number_format((float) $row->amount, 2, '.', ''),
                ]);
            }

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function baseWaterPaymentsQuery(Request $request)
    {
        $query = DB::table('general_fund_payment as gfp')
            ->whereIn('gfp.SOURCEID', self::WATER_SOURCE_IDS);

        GeneralFundPaymentSummaryHelper::applyActiveFilter($query, 'gfp');
        GeneralFundPaymentSummaryHelper::applyDateFilters($query, $request, 'gfp.PAYMENTDATE');

        $search = trim((string) $request->input('search', ''));

        if ($search !== '') {
            $query->where(function ($searchQuery) use ($search) {
                $searchQuery
                    ->where('gfp.PAIDBY', 'like', "%{$search}%")
                    ->orWhere('gfp.RECEIPTNO', 'like', "%{$search}%")
                    ->orWhere('gfp.COLLECTOR', 'like', "%{$search}%")
                    ->orWhere('gfp.USERID', 'like', "%{$search}%")
                    ->orWhere('gfp.LOCAL_TIN', 'like', "%{$search}%")
                    ->orWhere('gfp.RATE_DESCRIPTION', 'like', "%{$search}%")
                    ->orWhere('gfp.TAX_DESCRIPTION', 'like', "%{$search}%")
                    ->orWhere('gfp.SOURCEID', 'like', "%{$search}%")
                    ->orWhere('gfp.AFTYPE', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    private function findMatchingAccount(?string $taxpayer): ?array
    {
        $normalizedTaxpayer = $this->normalizeWaterName($taxpayer);

        if ($normalizedTaxpayer === '') {
            return null;
        }

        $dataDir = storage_path('waterworks');

        if (! File::exists($dataDir)) {
            return null;
        }

        foreach (File::files($dataDir) as $file) {
            $fileName = $file->getFilename();

            if (! str_starts_with($fileName, 'ZAM_') || $file->getExtension() !== 'json') {
                continue;
            }

            $content = json_decode(File::get($file->getPathname()), true);

            if (! is_array($content)) {
                continue;
            }

            $fullName = trim(
                ($content['lastName'] ?? '') . ', ' .
                ($content['firstName'] ?? '') . ' ' .
                ($content['middleName'] ?? '')
            );

            $normalizedAccountName = $this->normalizeWaterName($fullName);

            if (
                $normalizedAccountName === $normalizedTaxpayer ||
                str_starts_with($normalizedAccountName, $normalizedTaxpayer) ||
                str_starts_with($normalizedTaxpayer, $normalizedAccountName)
            ) {
                return [
                    'accountNumber' => $content['accountNumber'] ?? null,
                    'fullName' => preg_replace('/\s+/', ' ', $fullName),
                    'waterMeter' => $content['waterMeter'] ?? null,
                    'waterConnectionType' => $content['waterConnectionType'] ?? null,
                    'address' => collect([
                        $content['purok'] ?? null,
                        $content['street'] ?? null,
                        $content['barangay'] ?? null,
                        $content['municipality'] ?? null,
                        $content['province'] ?? null,
                    ])->filter()->implode(', '),
                ];
            }
        }

        return null;
    }

    private function normalizeWaterName(?string $value): string
    {
        return preg_replace('/\s+/', ' ', str_replace('.', '', mb_strtoupper(trim((string) $value)))) ?: '';
    }
}
