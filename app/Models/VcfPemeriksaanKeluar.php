<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VcfPemeriksaanKeluar extends Model
{
    use HasFactory;
    protected $primaryKey = 'id';
    protected $table = 'vcf_pemeriksaan_keluars';

    protected $fillable = [
        'vcf_id',
        'item_id',
        'nilai',
        'keterangan',
        'petugas_id',
        'waktu_input'

    ];

    public function vcf(){
        return $this->belongsTo(Vcf::class, 'vcf_id');
    }

    public function itemPemeriksaanKeluar(){
        return $this->belongsTo(itemPemeriksaanKeluar::class, 'item_id');
    }

    public function petugas(){
        return $this->belongsTo(User::class, 'petugas_id');
    }
}
