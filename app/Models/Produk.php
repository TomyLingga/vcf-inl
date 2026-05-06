<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $table = 'produks';

    protected $fillable = [
        'nama',
        'kode',
        'warna_nomor_urut',
        'is_active'
    ];

    public function vcfs()
    {
        return $this->hasMany(Vcf::class);
    }
}
