<?php

namespace App\Helpers;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Schema;

class RealPropertyTaxQueryHelper
{
    public static function table(): string
    {
        return 'real_property_tax_payment';
    }

    public static function dateColumn(): string
    {
        return 'DATE';
    }

    public static function classificationColumn(): string
    {
        return 'PROPERTY_CLASSIFICATION';
    }

    public static function applyActiveFilter(Builder $query, string $alias = ''): Builder
    {
        $qualifiedAlias = trim($alias) === '' ? self::table() : $alias;

        if (Schema::hasColumn(self::table(), 'IS_CANCELLED')) {
            return $query->where(function ($statusQuery) use ($qualifiedAlias) {
                $statusQuery
                    ->whereNull("{$qualifiedAlias}.IS_CANCELLED")
                    ->orWhere("{$qualifiedAlias}.IS_CANCELLED", 0);
            });
        }

        if (Schema::hasColumn(self::table(), 'PAYMENT_STATUS_CT')) {
            return $query->where(function ($statusQuery) use ($qualifiedAlias) {
                $statusQuery
                    ->whereNull("{$qualifiedAlias}.PAYMENT_STATUS_CT")
                    ->orWhere("{$qualifiedAlias}.PAYMENT_STATUS_CT", '<>', 'CNL');
            });
        }

        return $query;
    }

    public static function landCategoryMap(): array
    {
        return [
            'AGRI' => ['LAND-AGRI', 'LAND-AGRICULTURAL'],
            'RES' => ['LAND-RES', 'LAND-RESIDENTIAL'],
            'COMML' => ['LAND-COMML', 'LAND-COMMERCIAL'],
            'SPECIAL' => ['SPECIAL', 'BUILDING-SS'],
        ];
    }

    public static function buildingCategoryMap(): array
    {
        return [
            'MACHINERIES' => [
                'MACHINERY',
                'MACHINERIES',
                'MACHINERIES-AGRICULTURAL',
                'MACHINERIES-COMMERCIAL',
                'MACHINERIES-RESIDENTIAL',
            ],
            'BLDG-RES' => ['BLDG-RES', 'BUILDING-RESIDENTIAL'],
            'BLDG-COMML' => ['BLDG-COMML', 'BUILDING-COMMERCIAL'],
            'BLDG-AGRI' => ['BLDG-AGRI', 'BUILDING-AGRICULTURAL'],
            'BLDG-INDUS' => ['BLDG-INDUS', 'BUILDING-INDUSTRIAL'],
        ];
    }

    public static function landStatuses(): array
    {
        return array_values(array_unique(array_merge(...array_values(self::landCategoryMap()))));
    }

    public static function buildingStatuses(): array
    {
        return array_values(array_unique(array_merge(...array_values(self::buildingCategoryMap()))));
    }
}
