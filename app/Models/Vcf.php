<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vcf extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $table = 'item_pemeriksaan_keluars';

    protected $fillable = [
        'nomor_urut',
        'tanggal',
        'logistik_id',
        'produk_id',
        'tipe_kegiatan',
        'asal_tujuan',
        'jenis_kendaraan_id',
        'no_polisi',
        'transporter_id',
        'driver_id',
        'jam_masuk',
        'status',
        'created_by'
    ];

     public function logistik()
    {
        return $this->belongsTo(Logistik::class,'logistik_id');
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }

    public function jenisKendaraan()
    {
        return $this->belongsTo(JenisKendaraan::class, 'jenis_kendaraan_id');
    }

    public function transporter()
    {
        return $this->belongsTo(Transporter::class,'transporter_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class,'driver_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
