<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('issued_accountable_forms')) {
            Schema::table('issued_accountable_forms', function (Blueprint $table) {
                if (!Schema::hasColumn('issued_accountable_forms', 'assigned_by')) {
                    $table->string('assigned_by')->nullable()->after('Collector');
                }
                if (!Schema::hasColumn('issued_accountable_forms', 'collector_received_by')) {
                    $table->string('collector_received_by')->nullable()->after('assigned_by');
                }
                if (!Schema::hasColumn('issued_accountable_forms', 'collector_signature_reference')) {
                    $table->string('collector_signature_reference')->nullable()->after('collector_received_by');
                }
                if (!Schema::hasColumn('issued_accountable_forms', 'logbook_reference_no')) {
                    $table->string('logbook_reference_no')->nullable()->after('collector_signature_reference');
                }
            });
        }

        if (Schema::hasTable('accountable_form_returns')) {
            Schema::table('accountable_form_returns', function (Blueprint $table) {
                if (!Schema::hasColumn('accountable_form_returns', 'returned_to')) {
                    $table->string('returned_to')->nullable()->after('processed_by');
                }
                if (!Schema::hasColumn('accountable_form_returns', 'custodian_received_by')) {
                    $table->string('custodian_received_by')->nullable()->after('returned_to');
                }
                if (!Schema::hasColumn('accountable_form_returns', 'return_signature_reference')) {
                    $table->string('return_signature_reference')->nullable()->after('custodian_received_by');
                }
                if (!Schema::hasColumn('accountable_form_returns', 'logbook_reference_no')) {
                    $table->string('logbook_reference_no')->nullable()->after('return_signature_reference');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('issued_accountable_forms')) {
            Schema::table('issued_accountable_forms', function (Blueprint $table) {
                foreach ([
                    'assigned_by',
                    'collector_received_by',
                    'collector_signature_reference',
                    'logbook_reference_no',
                ] as $column) {
                    if (Schema::hasColumn('issued_accountable_forms', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('accountable_form_returns')) {
            Schema::table('accountable_form_returns', function (Blueprint $table) {
                foreach ([
                    'returned_to',
                    'custodian_received_by',
                    'return_signature_reference',
                    'logbook_reference_no',
                ] as $column) {
                    if (Schema::hasColumn('accountable_form_returns', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
