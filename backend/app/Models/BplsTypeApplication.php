<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BplsTypeApplication extends Model
{
    protected $connection = 'bplo';

    protected $table = 'bpls_type_applications';

    protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'imported_at' => 'datetime',
        'capital_investment' => 'decimal:2',
        'gross_sales_essential' => 'decimal:2',
        'gross_sales_non_essential' => 'decimal:2',
        'total_amount_paid' => 'decimal:2',
    ];
}
