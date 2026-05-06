<?php

namespace App\Http\Controllers\API\VCF;

use App\Http\Controllers\Controller;
use App\Models\Vcf;
use App\Models\VcfPemeriksaanMasuk;
use App\Models\VcfBebanTambahanMasuk;
use App\Models\VcfSegelMasuk;
use App\Models\VcfNomorSegelMasuk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VcfBagian2Controller extends Controller
{
    /**
     * Simpan Bagian 2 — Pemeriksaan Weighbridge Masuk.
     * VCF harus berstatus 'bagian1_selesai'.
     */
    public function store(Request $request, int $vcfId)
    {
        $vcf = Vcf::findOrFail($vcfId);

        if ($vcf->status !== 'bagian1_selesai') {
            return response()->json([
                'message' => 'Bagian 2 hanya dapat diisi setelah Bagian 1 selesai.',
                'status_saat_ini' => $vcf->status,
            ], 422);
        }

        $validated = $request->validate([
            // Item pemeriksaan (from master)
            'pemeriksaan'                       => 'required|array',
            'pemeriksaan.*.item_id'             => 'required|exists:item_pemeriksaan_masuks,id',
            'pemeriksaan.*.nilai'               => 'required|string|max:100',
            'pemeriksaan.*.keterangan'          => 'nullable|string',

            // Beban tambahan (jika ada)
            'beban_tambahan_ada'                => 'required|boolean',
            'jenis_beban'                       => 'required_if:beban_tambahan_ada,true|nullable|string|max:255',

            // Segel
            'segel_terpasang'                   => 'required|boolean',
            'jumlah_segel'                      => 'required_if:segel_terpasang,true|nullable|integer|min:1|max:100',
            'nomor_segel'                       => 'required_if:segel_terpasang,true|nullable|array',
            'nomor_segel.*'                     => 'required|string|max:100',
        ]);

        // Pastikan jumlah elemen nomor_segel sesuai jumlah_segel
        if ($validated['segel_terpasang'] && !empty($validated['nomor_segel'])) {
            if (count($validated['nomor_segel']) !== (int) $validated['jumlah_segel']) {
                return response()->json([
                    'message' => 'Jumlah nomor segel harus sama dengan jumlah segel yang diinput.',
                ], 422);
            }
        }

        DB::beginTransaction();
        try {
            // Simpan hasil pemeriksaan
            foreach ($validated['pemeriksaan'] as $item) {
                VcfPemeriksaanMasuk::create([
                    'vcf_id'      => $vcf->id,
                    'item_id'     => $item['item_id'],
                    'nilai'       => $item['nilai'],
                    'keterangan'  => $item['keterangan'] ?? null,
                    'petugas_id'  => $request->user()->id,
                    'waktu_input' => now(),
                ]);
            }


            // Simpan beban tambahan jika ada
            if ($validated['beban_tambahan_ada']) {
                VcfBebanTambahanMasuk::create([
                    'vcf_id'      => $vcf->id,
                    'jenis_beban' => $validated['jenis_beban'],
                ]);
            }

            // Simpan segel
            if ($validated['segel_terpasang']) {
                $segel = VcfSegelMasuk::create([
                    'vcf_id'        => $vcf->id,
                    'jumlah_segel'  => $validated['jumlah_segel'],
                    'petugas_id'    => $request->user()->id,
                ]);

                foreach ($validated['nomor_segel'] as $urutan => $nomor) {
                    VcfNomorSegelMasuk::create([
                        'segel_masuk_id' => $segel->id,
                        'urutan'         => $urutan + 1,
                        'nomor_segel'    => $nomor,
                    ]);
                }
            }

            // Update status VCF
            $vcf->update(['status' => 'bagian2_selesai']);

            DB::commit();

            return response()->json([
                'message' => 'VCF Bagian 2 berhasil disimpan.',
                'data'    => $this->loadBagian2($vcf->id),
            ]);
        } catch (\Throwable $e) { if ($e instanceof \Illuminate\Validation\ValidationException) { DB::rollBack(); throw $e; }
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menyimpan Bagian 2.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update Bagian 2 — hanya jika status 'bagian2_selesai'.
     */
    public function update(Request $request, int $vcfId)
    {
        $vcf = Vcf::findOrFail($vcfId);

        if ($vcf->status !== 'bagian2_selesai') {
            return response()->json([
                'message' => 'Bagian 2 tidak dapat diedit. Status VCF: ' . $vcf->status,
            ], 422);
        }

        $validated = $request->validate([
            'pemeriksaan'                       => 'sometimes|array',
            'pemeriksaan.*.item_id'             => 'required|exists:item_pemeriksaan_masuks,id',
            'pemeriksaan.*.nilai'               => 'required|string|max:100',
            'pemeriksaan.*.keterangan'          => 'nullable|string',

            'beban_tambahan_ada'                => 'sometimes|boolean',
            'jenis_beban'                       => 'nullable|string|max:255',

            'segel_terpasang'                   => 'sometimes|boolean',
            'jumlah_segel'                      => 'nullable|integer|min:1|max:100',
            'nomor_segel'                       => 'nullable|array',
            'nomor_segel.*'                     => 'required|string|max:100',
        ]);

        DB::beginTransaction();
        try {
            if (isset($validated['pemeriksaan'])) {
                $vcf->pemeriksaanMasuk()->delete();
                foreach ($validated['pemeriksaan'] as $item) {
                    VcfPemeriksaanMasuk::create([
                        'vcf_id'      => $vcf->id,
                        'item_id'     => $item['item_id'],
                        'nilai'       => $item['nilai'],
                        'keterangan'  => $item['keterangan'] ?? null,
                        'petugas_id'  => $request->user()->id,
                        'waktu_input' => now(),
                    ]);
                }
            }

            if (isset($validated['beban_tambahan_ada'])) {
                $vcf->bebanTambahanMasuk()->delete();
                if ($validated['beban_tambahan_ada']) {
                    VcfBebanTambahanMasuk::create([
                        'vcf_id'      => $vcf->id,
                        'jenis_beban' => $validated['jenis_beban'],
                    ]);
                }
            }

            if (isset($validated['segel_terpasang'])) {
                // Hapus segel lama beserta nomor-nomornya (cascade)
                $vcf->segelMasuk()->each(fn($s) => $s->nomorSegel()->delete());
                $vcf->segelMasuk()->delete();

                if ($validated['segel_terpasang']) {
                    if (count($validated['nomor_segel'] ?? []) !== (int) $validated['jumlah_segel']) {
                        DB::rollBack();
                        return response()->json([
                            'message' => 'Jumlah nomor segel tidak sesuai.',
                        ], 422);
                    }

                    $segel = VcfSegelMasuk::create([
                        'vcf_id'       => $vcf->id,
                        'jumlah_segel' => $validated['jumlah_segel'],
                        'petugas_id'   => $request->user()->id,
                    ]);

                    foreach ($validated['nomor_segel'] as $urutan => $nomor) {
                        VcfNomorSegelMasuk::create([
                            'segel_masuk_id' => $segel->id,
                            'urutan'         => $urutan + 1,
                            'nomor_segel'    => $nomor,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'VCF Bagian 2 berhasil diperbarui.',
                'data'    => $this->loadBagian2($vcf->id),
            ]);
        } catch (\Throwable $e) { if ($e instanceof \Illuminate\Validation\ValidationException) { DB::rollBack(); throw $e; }
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui Bagian 2.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Tampilkan data Bagian 2 saja.
     */
    public function show(int $vcfId)
    {
        Vcf::findOrFail($vcfId);
        return response()->json($this->loadBagian2($vcfId));
    }

    private function loadBagian2(int $vcfId): array
    {
        $vcf = Vcf::with([
            'pemeriksaanMasuk.item',
            'pemeriksaanMasuk.petugas:id,nama',
            'bebanTambahanMasuk',
            'segelMasuk.nomorSegel',
            'segelMasuk.petugas:id,nama',
        ])->findOrFail($vcfId);

        return [
            'vcf_id'            => $vcf->id,
            'status'            => $vcf->status,
            'pemeriksaan'       => $vcf->pemeriksaanMasuk,
            'beban_tambahan'    => $vcf->bebanTambahanMasuk,
            'segel'             => $vcf->segelMasuk,
        ];
    }
}
