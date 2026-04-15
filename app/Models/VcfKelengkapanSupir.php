<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VcfKelengkapanSupir extends Model
{
    use HasFactory;
    protected $primaryKey = 'id';
    protected $table = 'vcf_kelengkapan_supirs';

    protected $fillable = [
        'vcf_id',
        'item_id',
        'nilai',
        'keterangan'
    ];

    public function vcf(){
        return $this->belongsTo(Vcf::class, 'vcf_id');
    }

    public function kelengkapanSupir(){
        return $this->belongsTo(ItemKelengkapanSupir::class, 'item_id');
    }
}
