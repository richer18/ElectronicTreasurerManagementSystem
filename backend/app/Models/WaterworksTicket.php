<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaterworksTicket extends Model
{
    protected $table = 'waterworks_tickets';

    protected $guarded = [];

    protected $casts = [
        'opened_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];
}
