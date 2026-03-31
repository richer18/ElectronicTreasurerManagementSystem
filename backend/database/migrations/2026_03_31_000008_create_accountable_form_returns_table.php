<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accountable_form_returns', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('issued_accountable_form_id');
            $table->date('return_date');
            $table->string('collector');
            $table->string('fund')->nullable();
            $table->string('form_type');
            $table->string('serial_no');
            $table->string('returned_receipt_from');
            $table->string('returned_receipt_to');
            $table->unsignedInteger('returned_receipt_qty');
            $table->string('processed_by')->nullable();
            $table->text('remarks')->nullable();
            $table->string('status')->default('RETURNED');
            $table->timestamps();

            $table->index(['return_date', 'collector']);
            $table->index(['serial_no', 'form_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accountable_form_returns');
    }
};
