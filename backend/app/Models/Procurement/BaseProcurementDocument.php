<?php

namespace App\Models\Procurement;

use Illuminate\Database\Eloquent\Model;

abstract class BaseProcurementDocument extends Model
{
    protected $guarded = [];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
        'line_items' => 'array',
        'metadata' => 'array',
    ];
}
