<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddQrSignatureToVcfTables extends Migration
{
    public function up()
    {
        // Add QR signature to VCF main table
        Schema::table('vcfs', function (Blueprint $table) {
            $table->text('qr_signature_main_gate')->nullable()->after('status');
            $table->timestamp('signed_at_main_gate')->nullable()->after('qr_signature_main_gate');
        });

        // Add QR signature to bagian2 (Weighbridge Masuk)
        Schema::table('vcf_pemeriksaan_masuks', function (Blueprint $table) {
            $table->text('qr_signature')->nullable()->after('petugas_id');
            $table->timestamp('signed_at')->nullable()->after('qr_signature');
        });

        // Add QR signature to bagian3 (Weighbridge Keluar)
        Schema::table('vcf_pemeriksaan_keluars', function (Blueprint $table) {
            $table->text('qr_signature')->nullable()->after('petugas_id');
            $table->timestamp('signed_at')->nullable()->after('qr_signature');
        });

        // Add QR signature to bagian4 (Main Gate Keluar)
        Schema::table('vcf_keluars', function (Blueprint $table) {
            $table->text('qr_signature')->nullable()->after('petugas_id');
            $table->timestamp('signed_at')->nullable()->after('qr_signature');
        });
    }

    public function down()
    {
        Schema::table('vcfs', function (Blueprint $table) {
            $table->dropColumn(['qr_signature_main_gate', 'signed_at_main_gate']);
        });

        Schema::table('vcf_pemeriksaan_masuks', function (Blueprint $table) {
            $table->dropColumn(['qr_signature', 'signed_at']);
        });

        Schema::table('vcf_pemeriksaan_keluars', function (Blueprint $table) {
            $table->dropColumn(['qr_signature', 'signed_at']);
        });

        Schema::table('vcf_keluars', function (Blueprint $table) {
            $table->dropColumn(['qr_signature', 'signed_at']);
        });
    }
}
