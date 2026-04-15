<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VcfNomorSegelMasuk extends Model
{
    use HasFactory;
    protected $primaryKey = 'id';
    protected $table = 'vcf_nomor_segel_masuks';

    protected $fillable = [
        'segel_masuk_id',
        'urutan',
        'nomor_segel'
    ];

    public function segelMasuk(){
        return $this->belongsTo(SegelMasuk::class, 'segel_masuk_id');
    }
}
