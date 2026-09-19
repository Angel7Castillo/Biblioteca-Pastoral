<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TheologicalTerm extends Model
{
    use HasFactory;

    protected $table = 'theological_terms';

    protected $fillable = [
        'term',
        'category',
        'definition',
        'cross_references',
    ];
}
