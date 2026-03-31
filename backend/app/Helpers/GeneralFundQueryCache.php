<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class GeneralFundQueryCache
{
    private const VERSION_KEY = 'general_fund_query_cache_version';
    private const DEFAULT_TTL_MINUTES = 10;

    public static function remember(string $prefix, array $params, callable $callback, int $ttlMinutes = self::DEFAULT_TTL_MINUTES)
    {
        return Cache::remember(
            self::makeKey($prefix, $params),
            now()->addMinutes($ttlMinutes),
            $callback
        );
    }

    public static function requestParams(Request $request, array $keys): array
    {
        $params = [];

        foreach ($keys as $key) {
            $value = $request->query($key);

            if (is_string($value)) {
                $value = trim($value);
            }

            $params[$key] = $value === '' ? null : $value;
        }

        return $params;
    }

    public static function invalidate(): void
    {
        if (!Cache::has(self::VERSION_KEY)) {
            Cache::forever(self::VERSION_KEY, 1);
            return;
        }

        Cache::increment(self::VERSION_KEY);
    }

    private static function makeKey(string $prefix, array $params): string
    {
        ksort($params);

        return sprintf(
            'general_fund:%s:v%s:%s',
            $prefix,
            self::version(),
            md5(json_encode($params))
        );
    }

    private static function version(): int
    {
        return (int) Cache::get(self::VERSION_KEY, 1);
    }
}
