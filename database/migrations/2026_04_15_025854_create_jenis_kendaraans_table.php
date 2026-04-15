<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJenisKendaraansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('jenis_kendaraans', function (Blueprint $table) {
            // id (Primary Key)
            $table->id();

            // nama (string)
            $table->string('nama');

            // kode (string)
            $table->string('kode');

            // is_active (boolean)
            $table->boolean('is_active')->default(true);

            // timestamps (created_at & updated_at)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('jenis_kendaraans');
    }
}