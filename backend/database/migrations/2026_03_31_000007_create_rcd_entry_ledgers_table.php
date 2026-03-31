<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rcd_entry_ledgers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rcd_entry_id');
            $table->unsignedBigInteger('issued_accountable_form_id')->nullable();
            $table->unsignedBigInteger('batch_id')->nullable();
            $table->string('flow_mode', 50)->nullable();
            $table->date('issued_date');
            $table->string('collector', 100);
            $table->string('fund', 100)->nullable();
            $table->string('type_of_receipt', 50);
            $table->string('serial_no', 100)->nullable();
            $table->string('receipt_no_from', 30);
            $table->string('receipt_no_to', 30);
            $table->unsignedInteger('issued_qty')->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->string('status', 20)->default('Not Remit');
            $table->unsignedInteger('balance_after_qty')->default(0);
            $table->string('balance_after_from', 30)->default('0');
            $table->string('balance_after_to', 30)->default('0');
            $table->timestamps();

            $table->unique('rcd_entry_id');
            $table->index(['issued_date', 'collector']);
            $table->index(['issued_accountable_form_id']);
            $table->index(['batch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rcd_entry_ledgers');
    }
};
