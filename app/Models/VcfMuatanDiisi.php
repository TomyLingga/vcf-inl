<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VcfMuatanDiisi extends Model
{
    use HasFactory;
    protected $primaryKey = 'id';
    protected $table = 'vcf_muatan_diisis';

    protected $fillable = [
        'vcf_id',
        'item_muatan_id',
        'nilai',
        'keterangan'
    ];

    public function vcf(){
        return $this->belongsTo(Vcf::class, 'vcf_id');
    }

    public function Petugas(){
        return $this->belongsTo(User::class, 'petugas_id');
    }
}
