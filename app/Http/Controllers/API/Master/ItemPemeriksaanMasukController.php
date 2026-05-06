<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\ItemPemeriksaanMasuk;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

// ─────────────────────────────────────────────────────────────────────────────
// ItemPemeriksaanMasukController
// ─────────────────────────────────────────────────────────────────────────────
class ItemPemeriksaanMasukController extends Controller
{
     private $messageFail = 'Something went wrong';
    private $messageMissing = 'Data not found in record';
    private $messageAll = 'Success to Fetch All Datas';
    private $messageSuccess = 'Success to Fetch Data';
    private $messageCreate = 'Success to Create Data';
    private $messageUpdate = 'Success to Update Data';

 
 public function index(Request $request)
    {
        try {
            $data = ItemPemeriksaanMasuk::orderBy('nama_item', 'asc')->get();

            if ($data->isEmpty()) {
                return response()->json(['message' => $this->messageMissing], 404); // 401 biasanya untuk Auth, gunakan 404
            }

            return response()->json([
                'data' => $data,
                'message' => $this->messageAll
            ], 200);

        } catch (QueryException $e) {
            return response()->json([
                'message' => $this->messageFail,
                'err' => $e->getTrace()[0],
                'errMsg' => $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'nama_item'          => 'required|string|max:255',
                'kode'               => 'required|string|max:20|unique:item_pemeriksaan_masuks,kode',
                'tipe_jawaban'       => 'required|in:yes_no,input,checklist',
                'has_detail'         => 'required|boolean',
                'keterangan_detail'  => 'nullable|string|max:255',
                'urutan'             => 'required|integer|min:1',
                'is_active'          => 'boolean',
            ]);

            if (!$validated['has_detail']) {
                $validated['keterangan_detail'] = null;
            }

            $item = ItemPemeriksaanMasuk::create([
                'nama_item'         => $validated['nama_item'],
                'kode'              => $validated['kode'],
                'tipe_jawaban'      => $validated['tipe_jawaban'],
                'has_detail'        => $validated['has_detail'],
                'keterangan_detail' => $validated['keterangan_detail'],
                'urutan'            => $validated['urutan'],
                'is_active'         => $validated['is_active'] ?? true,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Item berhasil ditambahkan.',
                'data'    => $item,
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();

            if ($e instanceof \Illuminate\Validation\ValidationException) {
                throw $e;
            }

            return response()->json([
                'message' => $this->messageFail,
                'errMsg'  => $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

    public function show(ItemPemeriksaanMasuk $itemPemeriksaanMasuk)
    {
        return response()->json($itemPemeriksaanMasuk);
    }

    public function update(Request $request, ItemPemeriksaanMasuk $itemPemeriksaanMasuk)
    {
        DB::beginTransaction();

        try {
            $validated = $request->validate([
                'nama_item'         => 'sometimes|required|string|max:255',
                'kode'              => 'sometimes|required|string|max:20|unique:item_pemeriksaan_masuks,kode,' . $itemPemeriksaanMasuk->id,
                'tipe_jawaban'      => 'sometimes|required|in:yes_no,input,checklist',
                'has_detail'        => 'sometimes|required|boolean',
                'keterangan_detail' => 'nullable|string|max:255',
                'urutan'            => 'sometimes|required|integer|min:1',
                'is_active'         => 'boolean',
            ]);

            // jika kosong has_detail
            if (array_key_exists('has_detail', $validated) && !$validated['has_detail']) {
                $validated['keterangan_detail'] = null;
            }

            $itemPemeriksaanMasuk->update($validated);

            DB::commit();

            return response()->json([
                'message' => 'Item berhasil diperbarui.',
                'data'    => $itemPemeriksaanMasuk,
            ]);

        } catch (\Exception $e) {
            DB::rollback();

            if ($e instanceof \Illuminate\Validation\ValidationException) {
                throw $e;
            }

            return response()->json([
                'message' => $this->messageFail,
                'errMsg'  => $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

   public function destroy(ItemPemeriksaanMasuk $itemPemeriksaanMasuk)
    {
        if ($itemPemeriksaanMasuk->vcfs()->exists()) {
            return response()->json([
                'message' => 'Item tidak dapat dihapus karena masih memiliki data VCF terkait.',
            ], 422);
        }

        $itemPemeriksaanMasuk->delete();

        return response()->json(['message' => 'Item berhasil dihapus.']);
    }
}
