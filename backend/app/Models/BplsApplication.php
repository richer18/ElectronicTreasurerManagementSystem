<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BplsApplication extends Model
{
    protected $connection = 'bplo';

    protected $table = 'bpls_applications';

    protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'imported_at' => 'datetime',
        'birth_date' => 'date',
        'date_issued' => 'date',
        'transaction_date' => 'date',
        'payment_date' => 'date',
        'or_date' => 'date',
        'actual_closure_date' => 'date',
        'capital' => 'decimal:2',
        'gross_amount' => 'decimal:2',
        'gross_amount_essential' => 'decimal:2',
        'gross_amount_non_essential' => 'decimal:2',
        'annual_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
        'male_employees' => 'integer',
        'female_employees' => 'integer',
    ];
}
