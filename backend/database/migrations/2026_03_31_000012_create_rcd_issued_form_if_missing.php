<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('rcd_issued_form')) {
            return;
        }

        Schema::create('rcd_issued_form', function (Blueprint $table) {
            $table->id();
            $table->date('issued_date');
            $table->string('fund', 100)->nullable();
            $table->string('collector', 100);
            $table->string('type_of_receipt', 50);
            $table->string('serial_no', 100)->nullable();
            $table->string('receipt_no_from', 30);
            $table->string('receipt_no_to', 30);
            $table->decimal('total', 14, 2)->default(0);
            $table->string('status', 30)->default('Not Remit');
            $table->timestamps();

            $table->index(['issued_date']);
            $table->index(['collector', 'type_of_receipt']);
            $table->index(['serial_no']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rcd_issued_form');
    }
};
