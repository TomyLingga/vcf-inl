<?php

namespace App\Http\Controllers\API\VCF;

use App\Http\Controllers\Controller;
use App\Models\Vcf;
use App\Models\VcfKelengkapanSupir;
use App\Models\VcfMuatanDibawa;
use App\Models\VcfMuatanDiisi;
use App\Models\ItemKelengkapanSupir;
use App\Models\ItemMuatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VcfBagian1Controller extends Controller
{
    /**
     * List semua VCF dengan filter dan pagination.
     */
    public function index(Request $request)
    {
        $query = Vcf::with([
            'logistik',
            'produk',
            'jenisKendaraan',
            'transporter',
            'driver',
            'createdBy:id,nama',
        ]);

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nomor_urut', 'like', '%' . $request->search . '%')
                  ->orWhere('no_polisi', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        if ($request->has('tanggal_dari') && $request->has('tanggal_sampai')) {
            $query->whereBetween('tanggal', [$request->tanggal_dari, $request->tanggal_sampai]);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('logistik_id')) {
            $query->where('logistik_id', $request->logistik_id);
        }

        if ($request->has('produk_id')) {
            $query->where('produk_id', $request->produk_id);
        }

        if ($request->has('tipe_kegiatan')) {
            $query->where('tipe_kegiatan', $request->tipe_kegiatan);
        }

        $data = $query->orderByDesc('tanggal')
                      ->orderByDesc('created_at')
                      ->paginate($request->get('per_page', 15));

        return response()->json($data);
    }

    /**
     * Buat VCF baru — Bagian 1 (Security Main Gate).
     * Status awal: 'draft_bagian1_selesai'
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_urut'          => 'required|string|max:50|unique:vcfs,nomor_urut',
            'tanggal'             => 'required|date',
            'logistik_id'         => 'required|exists:logistiks,id',
            'produk_id'           => 'required|exists:produks,id',
            'tipe_kegiatan'       => 'required|in:loading_lokal,loading_export,unloading_lokal,unloading_import',
            'asal_tujuan'         => 'nullable|string|max:255',
            'jenis_kendaraan_id'  => 'required|exists:jenis_kendaraans,id',
            'no_polisi'           => 'required|string|max:20',
            'transporter_id'      => 'required|exists:transporters,id',
            'driver_id'           => 'required|exists:drivers,id',
            'jam_masuk'           => 'required|date_format:H:i',

            // Kelengkapan supir (array of item checks)
            'kelengkapan_supir'   => 'required|array',
            'kelengkapan_supir.*.item_id' => 'required|exists:item_kelengkapan_supirs,id',
            'kelengkapan_supir.*.nilai'   => 'required|boolean',
            'kelengkapan_supir.*.keterangan' => 'nullable|string',

            // Muatan yang dibawa (unloading)
            'muatan_dibawa'       => 'nullable|array',
            'muatan_dibawa.*.item_muatan_id' => 'required|exists:item_muatans,id',
            'muatan_dibawa.*.nilai'          => 'nullable|string|max:255',
            'muatan_dibawa.*.keterangan'     => 'nullable|string',

            // Muatan yang akan diisi (loading)
            'muatan_diisi'        => 'nullable|array',
            'muatan_diisi.*.item_muatan_id' => 'required|exists:item_muatans,id',
            'muatan_diisi.*.nilai'          => 'nullable|string|max:255',
            'muatan_diisi.*.keterangan'     => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $vcf = Vcf::create([
                'nomor_urut'         => $validated['nomor_urut'],
                'tanggal'            => $validated['tanggal'],
                'logistik_id'        => $validated['logistik_id'],
                'produk_id'          => $validated['produk_id'],
                'tipe_kegiatan'      => $validated['tipe_kegiatan'],
                'asal_tujuan'        => $validated['asal_tujuan'] ?? null,
                'jenis_kendaraan_id' => $validated['jenis_kendaraan_id'],
                'no_polisi'          => $validated['no_polisi'],
                'transporter_id'     => $validated['transporter_id'],
                'driver_id'          => $validated['driver_id'],
                'jam_masuk'          => $validated['jam_masuk'],
                'created_by'         => $request->user()->id,
                'status'             => 'bagian1_selesai',
            ]);

            // Simpan kelengkapan supir
            foreach ($validated['kelengkapan_supir'] as $item) {
                VcfKelengkapanSupir::create([
                    'vcf_id'     => $vcf->id,
                    'item_id'    => $item['item_id'],
                    'nilai'      => $item['nilai'],
                    'keterangan' => $item['keterangan'] ?? null,
                ]);
            }

            // Simpan muatan dibawa
            if (!empty($validated['muatan_dibawa'])) {
                foreach ($validated['muatan_dibawa'] as $item) {
                    VcfMuatanDibawa::create([
                        'vcf_id'         => $vcf->id,
                        'item_muatan_id' => $item['item_muatan_id'],
                        'nilai'          => $item['nilai'] ?? null,
                        'keterangan'     => $item['keterangan'] ?? null,
                    ]);
                }
            }

            // Simpan muatan diisi
            if (!empty($validated['muatan_diisi'])) {
                foreach ($validated['muatan_diisi'] as $item) {
                    VcfMuatanDiisi::create([
                        'vcf_id'         => $vcf->id,
                        'item_muatan_id' => $item['item_muatan_id'],
                        'nilai'          => $item['nilai'] ?? null,
                        'keterangan'     => $item['keterangan'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'VCF Bagian 1 berhasil disimpan.',
                'data'    => $this->loadVcfFull($vcf->id),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menyimpan VCF.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Detail lengkap satu VCF.
     */
    public function show(int $id)
    {
        return response()->json($this->loadVcfFull($id));
    }

    /**
     * Update Bagian 1 — hanya jika status masih 'bagian1_selesai'.
     */
    public function update(Request $request, int $id)
    {
        $vcf = Vcf::findOrFail($id);

        if ($vcf->status !== 'bagian1_selesai') {
            return response()->json([
                'message' => 'VCF tidak dapat diedit karena sudah diproses ke tahap berikutnya.',
            ], 422);
        }

        $validated = $request->validate([
            'nomor_urut'          => 'sometimes|required|string|max:50|unique:vcfs,nomor_urut,' . $vcf->id,
            'tanggal'             => 'sometimes|required|date',
            'logistik_id'         => 'sometimes|required|exists:logistiks,id',
            'produk_id'           => 'sometimes|required|exists:produks,id',
            'tipe_kegiatan'       => 'sometimes|required|in:loading_lokal,loading_export,unloading_lokal,unloading_import',
            'asal_tujuan'         => 'nullable|string|max:255',
            'jenis_kendaraan_id'  => 'sometimes|required|exists:jenis_kendaraans,id',
            'no_polisi'           => 'sometimes|required|string|max:20',
            'transporter_id'      => 'sometimes|required|exists:transporters,id',
            'driver_id'           => 'sometimes|required|exists:drivers,id',
            'jam_masuk'           => 'sometimes|required|date_format:H:i',

            'kelengkapan_supir'                  => 'sometimes|array',
            'kelengkapan_supir.*.item_id'        => 'required|exists:item_kelengkapan_supirs,id',
            'kelengkapan_supir.*.nilai'          => 'required|boolean',
            'kelengkapan_supir.*.keterangan'     => 'nullable|string',

            'muatan_dibawa'                      => 'nullable|array',
            'muatan_dibawa.*.item_muatan_id'     => 'required|exists:item_muatans,id',
            'muatan_dibawa.*.nilai'              => 'nullable|string|max:255',
            'muatan_dibawa.*.keterangan'         => 'nullable|string',

            'muatan_diisi'                       => 'nullable|array',
            'muatan_diisi.*.item_muatan_id'      => 'required|exists:item_muatans,id',
            'muatan_diisi.*.nilai'               => 'nullable|string|max:255',
            'muatan_diisi.*.keterangan'          => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $vcf->update(array_filter($validated, fn($v) => $v !== null, ARRAY_FILTER_USE_BOTH));

            if (isset($validated['kelengkapan_supir'])) {
                $vcf->kelengkapanSupir()->delete();
                foreach ($validated['kelengkapan_supir'] as $item) {
                    VcfKelengkapanSupir::create([
                        'vcf_id'     => $vcf->id,
                        'item_id'    => $item['item_id'],
                        'nilai'      => $item['nilai'],
                        'keterangan' => $item['keterangan'] ?? null,
                    ]);
                }
            }

            if (isset($validated['muatan_dibawa'])) {
                $vcf->muatanDibawa()->delete();
                foreach ($validated['muatan_dibawa'] as $item) {
                    VcfMuatanDibawa::create([
                        'vcf_id'         => $vcf->id,
                        'item_muatan_id' => $item['item_muatan_id'],
                        'nilai'          => $item['nilai'] ?? null,
                        'keterangan'     => $item['keterangan'] ?? null,
                    ]);
                }
            }

            if (isset($validated['muatan_diisi'])) {
                $vcf->muatanDiisi()->delete();
                foreach ($validated['muatan_diisi'] as $item) {
                    VcfMuatanDiisi::create([
                        'vcf_id'         => $vcf->id,
                        'item_muatan_id' => $item['item_muatan_id'],
                        'nilai'          => $item['nilai'] ?? null,
                        'keterangan'     => $item['keterangan'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'VCF Bagian 1 berhasil diperbarui.',
                'data'    => $this->loadVcfFull($vcf->id),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui VCF.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper: load VCF dengan semua relasi.
     */
    private function loadVcfFull(int $id): Vcf
    {
        return Vcf::with([
            'logistik',
            'produk',
            'jenisKendaraan',
            'transporter',
            'driver',
            'createdBy:id,nama',
            'kelengkapanSupir.item',
            'muatanDibawa.itemMuatan',
            'muatanDiisi.itemMuatan',
            'pemeriksaanMasuk.item',
            'bebanTambahanMasuk',
            'segelMasuk.nomorSegel',
            'pemeriksaanKeluar.item',
            'bebanTambahanKeluar',
            'segelKeluar.nomorSegel',
            'vcfKeluar',
        ])->findOrFail($id);
    }
}
