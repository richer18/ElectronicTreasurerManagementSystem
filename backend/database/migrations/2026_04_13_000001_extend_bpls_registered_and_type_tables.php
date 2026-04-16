<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $schema = Schema::connection('bplo');

        if ($schema->hasTable('bpls_applications')) {
            $schema->table('bpls_applications', function (Blueprint $table) {
                if (! Schema::connection('bplo')->hasColumn('bpls_applications', 'date_issued')) {
                    $table->date('date_issued')->nullable()->after('registration_no');
                }
                if (! Schema::connection('bplo')->hasColumn('bpls_applications', 'status_of_application')) {
                    $table->string('status_of_application')->nullable()->after('date_issued');
                }
                if (! Schema::connection('bplo')->hasColumn('bpls_applications', 'status_of_registration')) {
                    $table->string('status_of_registration')->nullable()->after('status_of_application');
                }
                if (! Schema::connection('bplo')->hasColumn('bpls_applications', 'business_address')) {
                    $table->text('business_address')->nullable()->after('status_of_registration');
                }
                if (! Schema::connection('bplo')->hasColumn('bpls_applications', 'size_of_business')) {
                    $table->string('size_of_business')->nullable()->after('business_address');
                }
                if (! Schema::connection('bplo')->hasColumn('bpls_applications', 'owner_name')) {
                    $table->string('owner_name')->nullable()->after('size_of_business');
                }
                if (! Schema::connection('bplo')->hasColumn('bpls_applications', 'contact_no')) {
                    $table->string('contact_no')->nullable()->after('owner_name');
                }
                if (! Schema::connection('bplo')->hasColumn('bpls_applications', 'email_address')) {
                    $table->string('email_address')->nullable()->after('contact_no');
                }
                if (! Schema::connection('bplo')->hasColumn('bpls_applications', 'male_employees')) {
                    $table->unsignedInteger('male_employees')->nullable()->after('total_no_of_employees');
                }
                if (! Schema::connection('bplo')->hasColumn('bpls_applications', 'female_employees')) {
                    $table->unsignedInteger('female_employees')->nullable()->after('male_employees');
                }
            });
        }

        if (! $schema->hasTable('bpls_type_applications')) {
            $schema->create('bpls_type_applications', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('record_key')->unique();
                $table->string('source_file_name')->nullable();
                $table->unsignedInteger('source_row_number')->nullable();
                $table->timestamp('imported_at')->nullable();
                $table->string('business_identification_number')->nullable()->index();
                $table->string('business_name')->nullable()->index();
                $table->string('owner_name')->nullable();
                $table->string('type_of_application')->nullable();
                $table->string('type_of_business')->nullable();
                $table->decimal('capital_investment', 15, 2)->nullable();
                $table->decimal('gross_sales_essential', 15, 2)->nullable();
                $table->decimal('gross_sales_non_essential', 15, 2)->nullable();
                $table->string('status_of_application')->nullable()->index();
                $table->decimal('total_amount_paid', 15, 2)->nullable();
                $table->string('source_type')->nullable();
            });
        }
    }

    public function down(): void
    {
        $schema = Schema::connection('bplo');

        if ($schema->hasTable('bpls_type_applications')) {
            $schema->drop('bpls_type_applications');
        }
    }
};
