<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransportersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transporters', function (Blueprint $table) {
            // id (Primary Key)
            $table->id();

            // nama_transporter (string)
            $table->string('nama_transporter');

            // kode (string)
            $table->string('kode');

            // is_active (boolean) - default true/1 biasanya digunakan agar data aktif otomatis
            $table->boolean('is_active')->default(true);

            // created_at & updated_at (timestamp)
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
        Schema::dropIfExists('transporters');
    }
}