<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = [
        'disbursement_vouchers',
        'obligation_requests',
        'requisition_issue_slips',
        'purchase_requests',
        'purchase_orders',
        'job_orders',
        'job_order_requests',
        'abstract_of_canvasses',
        'pr_recommendations',
    ];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                continue;
            }

            Schema::create($tableName, function (Blueprint $table) {
                $table->id();
                $table->string('document_no')->nullable()->index();
                $table->string('reference_no')->nullable()->index();
                $table->date('transaction_date')->nullable()->index();
                $table->string('party_name')->nullable()->index();
                $table->string('office_unit')->nullable()->index();
                $table->string('responsibility_center')->nullable();
                $table->decimal('amount', 15, 2)->default(0);
                $table->string('status')->default('DRAFT')->index();
                $table->string('mode_of_payment')->nullable();
                $table->text('particulars')->nullable();
                $table->text('remarks')->nullable();
                $table->string('prepared_by')->nullable();
                $table->string('reviewed_by')->nullable();
                $table->string('approved_by')->nullable();
                $table->string('received_by')->nullable();
                $table->json('line_items')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        foreach (array_reverse($this->tables) as $tableName) {
            Schema::dropIfExists($tableName);
        }
    }
};
