<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;
    protected $primaryKey = 'id';
    protected $table = 'drivers';

    protected $fillable = [
        'transporter_id',
        'nama_supir',
        'no_sim',
        'jenis_sim',
        'tgl_berlaku_sim',
        'is_active'
    ];

    public function transporter(){
        return $this->belongsTo(Transporter::class, 'transporter_id');
    }
}
