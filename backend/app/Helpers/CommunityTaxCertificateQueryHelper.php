<?php

namespace App\Helpers;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Schema;

class CommunityTaxCertificateQueryHelper
{
    public static function applyActiveFilter(Builder $query, string $alias = 'community_tax_certificate_payment'): Builder
    {
        $qualifiedAlias = trim($alias) === '' ? 'community_tax_certificate_payment' : $alias;

        if (Schema::hasColumn('community_tax_certificate_payment', 'IS_CANCELLED')) {
            return $query->where(function ($statusQuery) use ($qualifiedAlias) {
                $statusQuery
                    ->whereNull("{$qualifiedAlias}.IS_CANCELLED")
                    ->orWhere("{$qualifiedAlias}.IS_CANCELLED", 0);
            });
        }

        if (Schema::hasColumn('community_tax_certificate_payment', 'PAYMENT_STATUS_CT')) {
            return $query->where(function ($statusQuery) use ($qualifiedAlias) {
                $statusQuery
                    ->whereNull("{$qualifiedAlias}.PAYMENT_STATUS_CT")
                    ->orWhere("{$qualifiedAlias}.PAYMENT_STATUS_CT", '<>', 'CNL');
            });
        }

        return $query;
    }
}
