<?php

namespace App\Http\Controllers\API\VCF;

use App\Http\Controllers\Controller;
use App\Models\Vcf;
use App\Models\VcfKeluar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VcfBagian4Controller extends Controller
{
    /**
     * Simpan Bagian 4 — Jam Keluar & Emergency Respon Kontak.
     * VCF harus berstatus 'bagian3_selesai'.
     */
    public function store(Request $request, int $vcfId)
    {
        $vcf = Vcf::findOrFail($vcfId);

        if ($vcf->status !== 'bagian3_selesai') {
            return response()->json([
                'message' => 'Bagian 4 hanya dapat diisi setelah Bagian 3 selesai.',
                'status_saat_ini' => $vcf->status,
            ], 422);
        }

        $validated = $request->validate([
            'jam_keluar'               => 'required|date_format:H:i',
            'emergency_respon_kontak'  => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $keluar = VcfKeluar::create([
                'vcf_id'                  => $vcf->id,
                'jam_keluar'              => $validated['jam_keluar'],
                'emergency_respon_kontak' => $validated['emergency_respon_kontak'] ?? null,
                'petugas_id'              => $request->user()->id,
                'waktu_input'             => now(),
            ]);

            $vcf->update(['status' => 'selesai']);

            DB::commit();

            return response()->json([
                'message' => 'VCF Bagian 4 berhasil disimpan. VCF selesai.',
                'data'    => $keluar->load('petugas:id,nama'),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menyimpan Bagian 4.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update Bagian 4 — hanya jika status 'selesai' dan ada kebutuhan koreksi.
     * Hanya admin yang bisa (dikontrol di route level).
     */
    public function update(Request $request, int $vcfId)
    {
        $vcf = Vcf::findOrFail($vcfId);

        $keluar = VcfKeluar::where('vcf_id', $vcfId)->firstOrFail();

        $validated = $request->validate([
            'jam_keluar'              => 'sometimes|required|date_format:H:i',
            'emergency_respon_kontak' => 'nullable|string|max:500',
        ]);

        $keluar->update($validated);

        return response()->json([
            'message' => 'VCF Bagian 4 berhasil diperbarui.',
            'data'    => $keluar->load('petugas:id,nama'),
        ]);
    }

    public function show(int $vcfId)
    {
        Vcf::findOrFail($vcfId);

        $keluar = VcfKeluar::with('petugas:id,nama')
            ->where('vcf_id', $vcfId)
            ->first();

        return response()->json([
            'vcf_id' => $vcfId,
            'data'   => $keluar,
        ]);
    }
}
