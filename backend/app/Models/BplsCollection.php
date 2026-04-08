<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BplsCollection extends Model
{
    protected $connection = 'bplo';

    protected $table = 'bpls_collections';

    protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'imported_at' => 'datetime',
        'or_date' => 'date',
        'date_paid' => 'datetime',
        'business_tax' => 'decimal:2',
        'mayors_permit_fee' => 'decimal:2',
        'fixed_tax' => 'decimal:2',
        'garbage_fee' => 'decimal:2',
        'occupational_tax' => 'decimal:2',
        'deleted_mayors_permit_fee' => 'decimal:2',
        'deleted_fixed_tax' => 'decimal:2',
        'deleted_sticker_business_plate' => 'decimal:2',
        'clearance_fee' => 'decimal:2',
        'fixed_tax_current' => 'decimal:2',
        'mayors_permit_fee_current' => 'decimal:2',
        'signboard_billboard_fee' => 'decimal:2',
        'weight_measures_fee' => 'decimal:2',
        'deleted_zoning_fee' => 'decimal:2',
        'deleted_mpdo_fee' => 'decimal:2',
        'building_inspection_fee' => 'decimal:2',
        'electrical_inspection_fee' => 'decimal:2',
        'sanitary_inspection_fee' => 'decimal:2',
        'mechanical_inspection_fee' => 'decimal:2',
        'zoning_inspection_fee' => 'decimal:2',
        'real_property_tax' => 'decimal:2',
        'garbage_fee_current' => 'decimal:2',
        'sticker_business_plate' => 'decimal:2',
        'mooring_fee' => 'decimal:2',
        'signage_fee' => 'decimal:2',
        'certification_fee' => 'decimal:2',
        'gross_amount_essential' => 'decimal:2',
        'gross_amount_non_essential' => 'decimal:2',
        'gross_total' => 'decimal:2',
        'capital' => 'decimal:2',
        'tax_credit' => 'decimal:2',
        'discount' => 'decimal:2',
        'interest' => 'decimal:2',
        'surcharge' => 'decimal:2',
        'amount_paid' => 'decimal:2',
    ];
}
