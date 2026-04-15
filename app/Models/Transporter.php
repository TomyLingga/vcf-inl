<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transporter extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $table = 'transporters';

    protected $fillable = [
        'nama_transporter',
        'kode',
        'is_active'
    ];

    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }

    public function vcfs()
    {
        return $this->hasMany(Vcf::class);
    }
}
