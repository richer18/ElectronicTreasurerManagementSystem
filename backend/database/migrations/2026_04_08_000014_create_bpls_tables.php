<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $schema = Schema::connection('bplo');

        if (! $schema->hasTable('bpls_applications')) {
            $schema->create('bpls_applications', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('record_key')->unique();
                $table->string('source_file_name')->nullable();
                $table->unsignedInteger('source_row_number')->nullable();
                $table->timestamp('imported_at')->nullable();

                $table->string('business_identification_number')->nullable()->index();
                $table->string('business_name')->nullable()->index();
                $table->string('trade_name')->nullable();
                $table->text('business_nature')->nullable();
                $table->text('business_line')->nullable();
                $table->string('business_type')->nullable();
                $table->string('registration_no')->nullable();
                $table->string('transmittal_no')->nullable();

                $table->string('incharge_first_name')->nullable();
                $table->string('incharge_middle_name')->nullable();
                $table->string('incharge_last_name')->nullable();
                $table->string('incharge_extension_name')->nullable();
                $table->string('incharge_sex')->nullable();
                $table->string('citizenship')->nullable();

                $table->string('office_street')->nullable();
                $table->string('office_region')->nullable();
                $table->string('office_province')->nullable();
                $table->string('office_municipality')->nullable();
                $table->string('office_barangay')->nullable()->index();
                $table->string('office_zipcode')->nullable();

                $table->unsignedInteger('total_no_of_employees')->nullable();
                $table->unsignedInteger('year')->nullable();
                $table->decimal('capital', 15, 2)->nullable();
                $table->decimal('gross_amount', 15, 2)->nullable();
                $table->decimal('gross_amount_essential', 15, 2)->nullable();
                $table->decimal('gross_amount_non_essential', 15, 2)->nullable();

                $table->text('reject_remarks')->nullable();
                $table->string('module_type')->nullable();
                $table->string('transaction_type')->nullable()->index();

                $table->string('requestor_first_name')->nullable();
                $table->string('requestor_middle_name')->nullable();
                $table->string('requestor_last_name')->nullable();
                $table->string('requestor_extension_name')->nullable();
                $table->string('requestor_email')->nullable();
                $table->string('requestor_mobile_no')->nullable();
                $table->date('birth_date')->nullable();
                $table->string('requestor_sex')->nullable();
                $table->string('civil_status')->nullable();
                $table->string('requestor_street')->nullable();
                $table->string('requestor_province')->nullable();
                $table->string('requestor_municipality')->nullable();
                $table->string('requestor_barangay')->nullable();
                $table->string('requestor_zipcode')->nullable();

                $table->string('transaction_id')->nullable()->index();
                $table->string('reference_no')->nullable();
                $table->string('brgy_clearance_status')->nullable();
                $table->string('site_transaction_status')->nullable()->index();
                $table->string('core_transaction_status')->nullable()->index();
                $table->date('transaction_date')->nullable()->index();
                $table->string('soa_no')->nullable();
                $table->decimal('annual_amount', 15, 2)->nullable();
                $table->string('term')->nullable();
                $table->decimal('amount_paid', 15, 2)->nullable();
                $table->decimal('balance', 15, 2)->nullable();
                $table->string('payment_type')->nullable();
                $table->date('payment_date')->nullable();
                $table->string('or_no')->nullable()->index();
                $table->string('brgy_clearance_no')->nullable();
                $table->date('or_date')->nullable();
                $table->string('permit_no')->nullable();
                $table->string('business_plate_no')->nullable();
                $table->date('actual_closure_date')->nullable();
                $table->text('retirement_reason')->nullable();
                $table->string('source_type')->nullable();
            });
        }

        if (! $schema->hasTable('bpls_collections')) {
            $schema->create('bpls_collections', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('record_key')->unique();
                $table->string('source_file_name')->nullable();
                $table->unsignedInteger('source_row_number')->nullable();
                $table->timestamp('imported_at')->nullable();

                $table->date('or_date')->nullable()->index();
                $table->dateTime('date_paid')->nullable()->index();
                $table->string('or_number')->nullable()->index();
                $table->string('transaction_type')->nullable()->index();
                $table->string('business_identification_number')->nullable()->index();
                $table->string('incharge_name')->nullable();
                $table->string('business_name')->nullable()->index();
                $table->string('barangay_name')->nullable()->index();

                $table->decimal('business_tax', 15, 2)->nullable();
                $table->decimal('mayors_permit_fee', 15, 2)->nullable();
                $table->decimal('fixed_tax', 15, 2)->nullable();
                $table->decimal('garbage_fee', 15, 2)->nullable();
                $table->decimal('occupational_tax', 15, 2)->nullable();
                $table->decimal('deleted_mayors_permit_fee', 15, 2)->nullable();
                $table->decimal('deleted_fixed_tax', 15, 2)->nullable();
                $table->decimal('deleted_sticker_business_plate', 15, 2)->nullable();
                $table->decimal('clearance_fee', 15, 2)->nullable();
                $table->decimal('fixed_tax_current', 15, 2)->nullable();
                $table->decimal('mayors_permit_fee_current', 15, 2)->nullable();
                $table->decimal('signboard_billboard_fee', 15, 2)->nullable();
                $table->decimal('weight_measures_fee', 15, 2)->nullable();
                $table->decimal('deleted_zoning_fee', 15, 2)->nullable();
                $table->decimal('deleted_mpdo_fee', 15, 2)->nullable();
                $table->decimal('building_inspection_fee', 15, 2)->nullable();
                $table->decimal('electrical_inspection_fee', 15, 2)->nullable();
                $table->decimal('sanitary_inspection_fee', 15, 2)->nullable();
                $table->decimal('mechanical_inspection_fee', 15, 2)->nullable();
                $table->decimal('zoning_inspection_fee', 15, 2)->nullable();
                $table->decimal('real_property_tax', 15, 2)->nullable();
                $table->decimal('garbage_fee_current', 15, 2)->nullable();
                $table->decimal('sticker_business_plate', 15, 2)->nullable();
                $table->decimal('mooring_fee', 15, 2)->nullable();
                $table->decimal('signage_fee', 15, 2)->nullable();
                $table->decimal('certification_fee', 15, 2)->nullable();

                $table->decimal('gross_amount_essential', 15, 2)->nullable();
                $table->decimal('gross_amount_non_essential', 15, 2)->nullable();
                $table->decimal('gross_total', 15, 2)->nullable();
                $table->decimal('capital', 15, 2)->nullable();
                $table->decimal('tax_credit', 15, 2)->nullable();
                $table->decimal('discount', 15, 2)->nullable();
                $table->decimal('interest', 15, 2)->nullable();
                $table->decimal('surcharge', 15, 2)->nullable();
                $table->decimal('amount_paid', 15, 2)->nullable();
            });
        }
    }

    public function down(): void
    {
        $schema = Schema::connection('bplo');
        $schema->dropIfExists('bpls_collections');
        $schema->dropIfExists('bpls_applications');
    }
};
