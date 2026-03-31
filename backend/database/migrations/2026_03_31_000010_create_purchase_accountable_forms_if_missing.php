<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('purchase_accountable_forms')) {
            return;
        }

        Schema::create('purchase_accountable_forms', function (Blueprint $table) {
            $table->id();
            $table->date('purchase_date');
            $table->string('Form_Type');
            $table->string('Serial_No');
            $table->string('Receipt_Range_From', 30);
            $table->string('Receipt_Range_To', 30);
            $table->unsignedInteger('Stock')->default(0);
            $table->string('Status', 30)->default('AVAILABLE');
            $table->timestamps();

            $table->index(['purchase_date']);
            $table->index(['Form_Type']);
            $table->index(['Serial_No']);
            $table->index(['Status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_accountable_forms');
    }
};
