<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('waterworks_tickets')) {
            return;
        }

        Schema::create('waterworks_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_no', 40)->unique();
            $table->string('taxpayer_name', 150)->nullable()->index();
            $table->string('local_tin', 50)->nullable()->index();
            $table->string('account_number', 50)->nullable()->index();
            $table->string('meter_number', 50)->nullable()->index();
            $table->string('concern_type', 50)->index();
            $table->string('priority', 20)->default('NORMAL')->index();
            $table->string('status', 20)->default('OPEN')->index();
            $table->string('assigned_to', 100)->nullable()->index();
            $table->text('description')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('opened_at')->nullable()->index();
            $table->timestamp('resolved_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waterworks_tickets');
    }
};
