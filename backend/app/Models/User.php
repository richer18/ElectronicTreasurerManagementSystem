<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $primaryKey = 'USER_ID';

    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'USERNAME',
        'PASSWORD_HASH',
        'EMAIL',
        'PHONE',
        'ROLE',
        'ACCOUNT_STATUS',
        'CREATED_AT',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'PASSWORD_HASH',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'CREATED_AT' => 'datetime',
        ];
    }

    public function getAuthPassword(): string
    {
        return (string) $this->PASSWORD_HASH;
    }
}
