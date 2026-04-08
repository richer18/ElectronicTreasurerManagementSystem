<?php

namespace App\Http\Controllers;

use App\Models\Procurement\AbstractOfCanvass;
use App\Models\Procurement\BaseProcurementDocument;
use App\Models\Procurement\DisbursementVoucher;
use App\Models\Procurement\JobOrder;
use App\Models\Procurement\JobOrderRequest;
use App\Models\Procurement\ObligationRequest;
use App\Models\Procurement\PrRecommendation;
use App\Models\Procurement\PurchaseOrder;
use App\Models\Procurement\PurchaseRequest;
use App\Models\Procurement\RequisitionIssueSlip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProcurementDocumentController extends Controller
{
    private const TYPE_MODEL_MAP = [
        'disbursement-vouchers' => DisbursementVoucher::class,
        'obligation-requests' => ObligationRequest::class,
        'requisition-issue-slips' => RequisitionIssueSlip::class,
        'purchase-requests' => PurchaseRequest::class,
        'purchase-orders' => PurchaseOrder::class,
        'job-orders' => JobOrder::class,
        'job-order-requests' => JobOrderRequest::class,
        'abstract-of-canvass' => AbstractOfCanvass::class,
        'pr-recommendations' => PrRecommendation::class,
    ];

    public function index(Request $request, string $type): JsonResponse
    {
        $model = $this->resolveModel($type);
        $search = trim((string) $request->query('search', ''));

        $query = $model::query()->orderByDesc('transaction_date')->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('document_no', 'like', "%{$search}%")
                    ->orWhere('reference_no', 'like', "%{$search}%")
                    ->orWhere('party_name', 'like', "%{$search}%")
                    ->orWhere('office_unit', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            });
        }

        return response()->json($query->get());
    }

    public function summary(string $type): JsonResponse
    {
        $model = $this->resolveModel($type);
        $query = $model::query();

        return response()->json([
            'total_records' => (clone $query)->count(),
            'draft_records' => (clone $query)->where('status', 'DRAFT')->count(),
            'approved_records' => (clone $query)->where('status', 'APPROVED')->count(),
            'completed_records' => (clone $query)->where('status', 'COMPLETED')->count(),
            'total_amount' => (float) (clone $query)->sum('amount'),
        ]);
    }

    public function store(Request $request, string $type): JsonResponse
    {
        $model = $this->resolveModel($type);
        $payload = $this->validatedPayload($request);
        /** @var BaseProcurementDocument $record */
        $record = $model::create($payload);

        return response()->json($record, 201);
    }

    public function show(string $type, int $id): JsonResponse
    {
        $model = $this->resolveModel($type);
        return response()->json($model::findOrFail($id));
    }

    public function update(Request $request, string $type, int $id): JsonResponse
    {
        $model = $this->resolveModel($type);
        /** @var BaseProcurementDocument $record */
        $record = $model::findOrFail($id);
        $record->update($this->validatedPayload($request));

        return response()->json($record->fresh());
    }

    public function destroy(string $type, int $id): JsonResponse
    {
        $model = $this->resolveModel($type);
        $record = $model::findOrFail($id);
        $record->delete();

        return response()->json(['message' => 'Record deleted successfully.']);
    }

    private function resolveModel(string $type): string
    {
        abort_unless(isset(self::TYPE_MODEL_MAP[$type]), 404, 'Unknown procurement document type.');

        return self::TYPE_MODEL_MAP[$type];
    }

    private function validatedPayload(Request $request): array
    {
        return $request->validate([
            'document_no' => ['nullable', 'string', 'max:255'],
            'reference_no' => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['nullable', 'date'],
            'party_name' => ['nullable', 'string', 'max:255'],
            'office_unit' => ['nullable', 'string', 'max:255'],
            'responsibility_center' => ['nullable', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric'],
            'status' => ['required', Rule::in(['DRAFT', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'])],
            'mode_of_payment' => ['nullable', 'string', 'max:255'],
            'particulars' => ['nullable', 'string'],
            'remarks' => ['nullable', 'string'],
            'prepared_by' => ['nullable', 'string', 'max:255'],
            'reviewed_by' => ['nullable', 'string', 'max:255'],
            'approved_by' => ['nullable', 'string', 'max:255'],
            'received_by' => ['nullable', 'string', 'max:255'],
            'line_items' => ['nullable', 'array'],
            'line_items.*.description' => ['nullable', 'string'],
            'line_items.*.quantity' => ['nullable', 'numeric'],
            'line_items.*.unit' => ['nullable', 'string', 'max:100'],
            'line_items.*.unit_cost' => ['nullable', 'numeric'],
            'line_items.*.amount' => ['nullable', 'numeric'],
            'metadata' => ['nullable', 'array'],
        ]);
    }
}
