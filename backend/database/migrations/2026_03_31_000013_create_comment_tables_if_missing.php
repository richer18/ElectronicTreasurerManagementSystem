<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tf_comment')) {
            Schema::create('tf_comment', function (Blueprint $table) {
                $table->id();
                $table->date('date');
                $table->string('receipt_no')->nullable();
                $table->dateTime('date_comment')->nullable();
                $table->string('name_client')->nullable();
                $table->text('description');
                $table->string('user', 100);
                $table->timestamps();

                $table->index(['date']);
            });
        }

        if (!Schema::hasTable('rpt_comment')) {
            Schema::create('rpt_comment', function (Blueprint $table) {
                $table->id();
                $table->date('date');
                $table->string('receipt_no')->nullable();
                $table->dateTime('date_comment')->nullable();
                $table->string('name_client')->nullable();
                $table->text('description');
                $table->string('user', 100);
                $table->timestamps();

                $table->index(['date']);
            });
        }

        if (!Schema::hasTable('rpt_comments')) {
            Schema::create('rpt_comments', function (Blueprint $table) {
                $table->id();
                $table->date('date');
                $table->text('description');
                $table->string('time', 20)->nullable();
                $table->string('user', 100);
                $table->timestamps();

                $table->index(['date']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tf_comment');
        Schema::dropIfExists('rpt_comment');
        Schema::dropIfExists('rpt_comments');
    }
};
