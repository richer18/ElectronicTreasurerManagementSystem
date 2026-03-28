<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('full_report_rcd')) {
            return;
        }

        Schema::create('full_report_rcd', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->decimal('GF', 15, 2)->default(0);
            $table->decimal('TF', 15, 2)->default(0);
            $table->decimal('ctc', 15, 2)->default(0);
            $table->decimal('rpt', 15, 2)->default(0);
            $table->decimal('gfAndTf', 15, 2)->default(0);
            $table->decimal('dueFrom', 15, 2)->default(0);
            $table->string('comment', 255)->default('');
            $table->decimal('CTCunder', 15, 2)->default(0);
            $table->decimal('CTCover', 15, 2)->default(0);
            $table->decimal('RPTunder', 15, 2)->default(0);
            $table->decimal('RPTover', 15, 2)->default(0);
            $table->decimal('GFTFunder', 15, 2)->default(0);
            $table->decimal('GFTFover', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('full_report_rcd');
    }
};
