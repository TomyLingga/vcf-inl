<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDriversTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('drivers', function (Blueprint $table) {
            // id (Primary Key)
            $table->id();

            // transporter_id (Foreign Key)
            // Menggunakan foreignId agar otomatis sinkron dengan id di tabel transporters
            $table->foreignId('transporter_id')->constrained('transporters')->onDelete('cascade');

            // nama_supir (string)
            $table->string('nama_supir');

            // no_sim (string)
            $table->string('no_sim');

            // jenis_sim (string)
            $table->string('jenis_sim');

            // tgl_berlaku_sim (date)
            $table->date('tgl_berlaku_sim');

            // is_active (boolean)
            $table->boolean('is_active')->default(true);

            // created_at & updated_at
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
        Schema::dropIfExists('drivers');
    }
}