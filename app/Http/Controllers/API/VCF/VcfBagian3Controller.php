<?php

namespace App\Http\Controllers\API\VCF;

use App\Http\Controllers\Controller;
use App\Models\Vcf;
use App\Models\VcfPemeriksaanKeluar;
use App\Models\VcfBebanTambahanKeluar;
use App\Models\VcfSegelKeluar;
use App\Models\VcfNomorSegelKeluar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VcfBagian3Controller extends Controller
{
    /**
     * Simpan Bagian 3 — Pemeriksaan Weighbridge Keluar.
     * VCF harus berstatus 'bagian2_selesai'.
     */
    public function store(Request $request, int $vcfId)
    {
        $vcf = Vcf::findOrFail($vcfId);

        if ($vcf->status !== 'bagian2_selesai') {
            return response()->json([
                'message' => 'Bagian 3 hanya dapat diisi setelah Bagian 2 selesai.',
                'status_saat_ini' => $vcf->status,
            ], 422);
        }

        $validated = $request->validate([
            'pemeriksaan'                       => 'required|array',
            'pemeriksaan.*.item_id'             => 'required|exists:item_pemeriksaan_keluars,id',
            'pemeriksaan.*.nilai'               => 'required|string|max:100',
            'pemeriksaan.*.keterangan'          => 'nullable|string',

            'beban_tambahan_ada'                => 'required|boolean',
            'jenis_beban'                       => 'required_if:beban_tambahan_ada,true|nullable|string|max:255',

            'segel_terpasang'                   => 'required|boolean',
            'jumlah_segel'                      => 'required_if:segel_terpasang,true|nullable|integer|min:1|max:100',
            'nomor_segel'                       => 'required_if:segel_terpasang,true|nullable|array',
            'nomor_segel.*'                     => 'required|string|max:100',
        ]);

        if ($validated['segel_terpasang'] && !empty($validated['nomor_segel'])) {
            if (count($validated['nomor_segel']) !== (int) $validated['jumlah_segel']) {
                return response()->json([
                    'message' => 'Jumlah nomor segel harus sama dengan jumlah segel yang diinput.',
                ], 422);
            }
        }

        DB::beginTransaction();
        try {
            foreach ($validated['pemeriksaan'] as $item) {
                VcfPemeriksaanKeluar::create([
                    'vcf_id'      => $vcf->id,
                    'item_id'     => $item['item_id'],
                    'nilai'       => $item['nilai'],
                    'keterangan'  => $item['keterangan'] ?? null,
                    'petugas_id'  => $request->user()->id,
                    'waktu_input' => now(),
                ]);
            }

            if ($validated['beban_tambahan_ada']) {
                VcfBebanTambahanKeluar::create([
                    'vcf_id'      => $vcf->id,
                    'jenis_beban' => $validated['jenis_beban'],
                ]);
            }

            if ($validated['segel_terpasang']) {
                $segel = VcfSegelKeluar::create([
                    'vcf_id'       => $vcf->id,
                    'jumlah_segel' => $validated['jumlah_segel'],
                    'petugas_id'   => $request->user()->id,
                ]);

                foreach ($validated['nomor_segel'] as $urutan => $nomor) {
                    VcfNomorSegelKeluar::create([
                        'segel_keluar_id' => $segel->id,
                        'urutan'          => $urutan + 1,
                        'nomor_segel'     => $nomor,
                    ]);
                }
            }

            $vcf->update(['status' => 'bagian3_selesai']);

            DB::commit();

            return response()->json([
                'message' => 'VCF Bagian 3 berhasil disimpan.',
                'data'    => $this->loadBagian3($vcf->id),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menyimpan Bagian 3.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update Bagian 3 — hanya jika status 'bagian3_selesai'.
     */
    public function update(Request $request, int $vcfId)
    {
        $vcf = Vcf::findOrFail($vcfId);

        if ($vcf->status !== 'bagian3_selesai') {
            return response()->json([
                'message' => 'Bagian 3 tidak dapat diedit. Status VCF: ' . $vcf->status,
            ], 422);
        }

        $validated = $request->validate([
            'pemeriksaan'                       => 'sometimes|array',
            'pemeriksaan.*.item_id'             => 'required|exists:item_pemeriksaan_keluars,id',
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
                $vcf->pemeriksaanKeluar()->delete();
                foreach ($validated['pemeriksaan'] as $item) {
                    VcfPemeriksaanKeluar::create([
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
                $vcf->bebanTambahanKeluar()->delete();
                if ($validated['beban_tambahan_ada']) {
                    VcfBebanTambahanKeluar::create([
                        'vcf_id'      => $vcf->id,
                        'jenis_beban' => $validated['jenis_beban'],
                    ]);
                }
            }

            if (isset($validated['segel_terpasang'])) {
                $vcf->segelKeluar()->each(fn($s) => $s->nomorSegel()->delete());
                $vcf->segelKeluar()->delete();

                if ($validated['segel_terpasang']) {
                    if (count($validated['nomor_segel'] ?? []) !== (int) $validated['jumlah_segel']) {
                        DB::rollBack();
                        return response()->json([
                            'message' => 'Jumlah nomor segel tidak sesuai.',
                        ], 422);
                    }

                    $segel = VcfSegelKeluar::create([
                        'vcf_id'       => $vcf->id,
                        'jumlah_segel' => $validated['jumlah_segel'],
                        'petugas_id'   => $request->user()->id,
                    ]);

                    foreach ($validated['nomor_segel'] as $urutan => $nomor) {
                        VcfNomorSegelKeluar::create([
                            'segel_keluar_id' => $segel->id,
                            'urutan'          => $urutan + 1,
                            'nomor_segel'     => $nomor,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'VCF Bagian 3 berhasil diperbarui.',
                'data'    => $this->loadBagian3($vcf->id),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui Bagian 3.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $vcfId)
    {
        Vcf::findOrFail($vcfId);
        return response()->json($this->loadBagian3($vcfId));
    }

    private function loadBagian3(int $vcfId): array
    {
        $vcf = Vcf::with([
            'pemeriksaanKeluar.item',
            'pemeriksaanKeluar.petugas:id,nama',
            'bebanTambahanKeluar',
            'segelKeluar.nomorSegel',
            'segelKeluar.petugas:id,nama',
        ])->findOrFail($vcfId);

        return [
            'vcf_id'         => $vcf->id,
            'status'         => $vcf->status,
            'pemeriksaan'    => $vcf->pemeriksaanKeluar,
            'beban_tambahan' => $vcf->bebanTambahanKeluar,
            'segel'          => $vcf->segelKeluar,
        ];
    }
}
