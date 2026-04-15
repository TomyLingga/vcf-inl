<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VcfSegelKeluar extends Model
{
    use HasFactory;
    protected $primaryKey = 'id';
    protected $table = 'vcf_segel_keluars';

    protected $fillable = [
        'vcf_id',
        'jumlah_segel',
        'petugas_id'

    ];

    public function petugas(){
        return $this->belongsTo(User::class, 'petugas_id');
    }
}
