<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WaterworksPayment extends Model
{
    protected $table = 'waterworks_payments';

    protected $guarded = [];

    protected $casts = [
        'payment_date' => 'datetime',
        'billing_year' => 'integer',
        'total_usage' => 'decimal:2',
        'subtotal_amount' => 'decimal:2',
        'surcharge_amount' => 'decimal:2',
        'interest_amount' => 'decimal:2',
        'total_amount_due' => 'decimal:2',
        'total_amount_paid' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(WaterworksPaymentItem::class);
    }
}
