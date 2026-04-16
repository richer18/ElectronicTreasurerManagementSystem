<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('waterworks_payments')) {
            Schema::create('waterworks_payments', function (Blueprint $table) {
                $table->id();
                $table->string('payment_reference', 100)->nullable()->unique();
                $table->string('source_origin', 50)->nullable()->index();
                $table->dateTime('payment_date')->nullable()->index();
                $table->string('receipt_no', 50)->nullable()->index();
                $table->string('permittee_name', 150)->nullable()->index();
                $table->text('address')->nullable();
                $table->string('account_number', 50)->nullable()->index();
                $table->string('meter_number', 50)->nullable()->index();
                $table->string('local_tin', 50)->nullable()->index();
                $table->string('connection_type', 50)->nullable();
                $table->string('collector', 100)->nullable()->index();
                $table->string('cashier_user_id', 100)->nullable();
                $table->string('payment_mode', 30)->nullable();
                $table->string('billing_month', 30)->nullable();
                $table->unsignedSmallInteger('billing_year')->nullable()->index();
                $table->decimal('total_usage', 12, 2)->default(0);
                $table->decimal('subtotal_amount', 15, 2)->default(0);
                $table->decimal('surcharge_amount', 15, 2)->default(0);
                $table->decimal('interest_amount', 15, 2)->default(0);
                $table->decimal('total_amount_due', 15, 2)->default(0);
                $table->decimal('total_amount_paid', 15, 2)->default(0);
                $table->string('status', 30)->default('PAID')->index();
                $table->text('remarks')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('waterworks_payment_items')) {
            Schema::create('waterworks_payment_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('waterworks_payment_id')
                    ->constrained('waterworks_payments')
                    ->cascadeOnDelete();
                $table->string('payment_detail_reference', 100)->nullable()->index();
                $table->string('source_id', 20)->nullable()->index();
                $table->string('charge_code', 50)->nullable();
                $table->string('description', 150)->nullable();
                $table->string('billing_month', 30)->nullable();
                $table->unsignedSmallInteger('billing_year')->nullable()->index();
                $table->decimal('cubic_meter_used', 12, 2)->nullable();
                $table->decimal('amount', 15, 2)->default(0);
                $table->decimal('surcharge_amount', 15, 2)->default(0);
                $table->decimal('interest_amount', 15, 2)->default(0);
                $table->decimal('total_amount_due', 15, 2)->default(0);
                $table->decimal('amount_paid', 15, 2)->default(0);
                $table->dateTime('date_paid')->nullable()->index();
                $table->string('receipt_no', 50)->nullable()->index();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('waterworks_payment_items');
        Schema::dropIfExists('waterworks_payments');
    }
};
