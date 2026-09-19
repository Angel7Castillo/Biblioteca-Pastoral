<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BibleNote extends Model
{
    use HasFactory;

    protected $table = 'bible_notes';

    protected $fillable = [
        'book_number',
        'chapter',
        'verse',
        'version',
        'content',
        'tags',
    ];

    protected $casts = [
        'book_number' => 'integer',
        'chapter' => 'integer',
        'verse' => 'integer',
    ];
}
