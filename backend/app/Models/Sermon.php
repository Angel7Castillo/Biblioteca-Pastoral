<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Sermon extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'content_markdown',
        'content_html',
        'status',
        'preach_date',
        'location',
        'main_passage',
        'target_audience',
        'series_name',
        'tags',
        'user_id',
    ];

    protected $casts = [
        'tags' => 'array',
        'preach_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sermon) {
            if (empty($sermon->slug)) {
                $sermon->slug = Str::slug($sermon->title) . '-' . Str::random(5);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
