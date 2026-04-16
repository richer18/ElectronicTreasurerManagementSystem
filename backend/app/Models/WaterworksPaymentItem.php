<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaterworksPaymentItem extends Model
{
    protected $table = 'waterworks_payment_items';

    protected $guarded = [];

    protected $casts = [
        'billing_year' => 'integer',
        'cubic_meter_used' => 'decimal:2',
        'amount' => 'decimal:2',
        'surcharge_amount' => 'decimal:2',
        'interest_amount' => 'decimal:2',
        'total_amount_due' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'date_paid' => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(WaterworksPayment::class, 'waterworks_payment_id');
    }
}
