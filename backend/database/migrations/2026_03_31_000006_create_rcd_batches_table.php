<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rcd_batches', function (Blueprint $table) {
            $table->id();
            $table->date('report_date');
            $table->string('collector', 100);
            $table->string('status', 20)->default('Draft');
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->unsignedInteger('entry_count')->default(0);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('deposited_at')->nullable();
            $table->string('reviewed_by', 100)->nullable();
            $table->string('deposit_reference', 100)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['report_date', 'collector'], 'uq_rcd_batches_report_date_collector');
            $table->index(['status', 'report_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rcd_batches');
    }
};
