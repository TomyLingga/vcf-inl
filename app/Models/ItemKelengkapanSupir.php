<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemKelengkapanSupir extends Model
{
    use HasFactory;
    protected $primaryKey = 'id';
    protected $table = 'item_kelengkapan_supirs';

    protected $fillable = [
        'nama_item',
        'keterangan',
        'urutan',
        'is_active'
    ];
}
