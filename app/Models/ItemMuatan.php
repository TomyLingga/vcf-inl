<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemMuatan extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $table = 'item_muatans';

    protected $fillable = [
        'nama_item',
        'jenis',
        'keterangan',
        'urutan',
        'is_active'
    ];
}
