<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('issued_accountable_forms')) {
            return;
        }

        Schema::create('issued_accountable_forms', function (Blueprint $table) {
            $table->increments('ID');
            $table->date('Date');
            $table->string('Fund', 100)->default('100 General Fund');
            $table->string('Collector');
            $table->string('assigned_by')->nullable();
            $table->string('collector_received_by')->nullable();
            $table->string('collector_signature_reference')->nullable();
            $table->string('logbook_reference_no')->nullable();
            $table->string('Form_Type');
            $table->string('Serial_No');
            $table->unsignedInteger('Receipt_Range_qty')->default(0);
            $table->string('Receipt_Range_From', 30)->default('0');
            $table->string('Receipt_Range_To', 30)->default('0');
            $table->unsignedInteger('Begginning_Balance_receipt_qty')->default(0);
            $table->string('Begginning_Balance_receipt_from', 30)->default('0');
            $table->string('Begginning_Balance_receipt_to', 30)->default('0');
            $table->unsignedInteger('Ending_Balance_receipt_qty')->default(0);
            $table->string('Ending_Balance_receipt_from', 30)->default('0');
            $table->string('Ending_Balance_receipt_to', 30)->default('0');
            $table->unsignedInteger('Issued_receipt_qty')->default(0);
            $table->string('Issued_receipt_from', 30)->default('0');
            $table->string('Issued_receipt_to', 30)->default('0');
            $table->unsignedInteger('Stock')->default(0);
            $table->dateTime('Date_Issued')->nullable();
            $table->string('Status', 30)->default('ISSUED');

            $table->index(['Date']);
            $table->index(['Collector', 'Form_Type', 'Serial_No']);
            $table->index(['Status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issued_accountable_forms');
    }
};
