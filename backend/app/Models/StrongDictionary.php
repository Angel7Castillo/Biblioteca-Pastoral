<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StrongDictionary extends Model
{
    use HasFactory;

    protected $table = 'strong_dictionary';

    protected $fillable = [
        'code',
        'original_word',
        'transliteration',
        'pronunciation',
        'definition',
        'type',
    ];
}
