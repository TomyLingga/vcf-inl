<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VcfPemeriksaanMasuk extends Model
{
    use HasFactory;
    protected $primaryKey = 'id';
    protected $table = 'vcf_pemeriksaan_masuks';

    protected $fillable = [
        'nama_item',
        'kode',
        'tipe_jawaban',
        'has_detail',
        'keterangan_detail',
        'urutan',
        'is_active'

    ];
}
