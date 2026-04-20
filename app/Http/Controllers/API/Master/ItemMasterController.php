<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\ItemKelengkapanSupir;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

// ─────────────────────────────────────────────────────────────────────────────
// ItemKelengkapanSupirController
// ─────────────────────────────────────────────────────────────────────────────
class ItemKelengkapanSupirController extends Controller
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
            $data = ItemKelengkapanSupir::orderBy('nama_item', 'asc')->get();

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
                'nama_item'      => 'required|string|max:255',
                'keterangan'          => 'required|string|max:50|unique:drivers,no_sim',
                'urutan'       => 'required|string|max:10',
                'is_active'       => 'boolean',
            ]);

            $driver = ItemKelengkapanSupir::create($validated);
            DB::commit();
            return response()->json([
                'message' => 'Driver berhasil ditambahkan.',
                'data'    => $driver,
            ], 201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => $this->messageFail,
                'err' => $e->getTrace()[0],
                'errMsg' => $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

    public function show(ItemKelengkapanSupir $itemKelengkapanSupir)
    {
        return response()->json($itemKelengkapanSupir);
    }

     public function update(Request $request, ItemKelengkapanSupir $itemKelengkapanSupir)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'nama_item'      => 'sometimes|required|string|max:255',
                'keterangan'          => 'sometimes|required|string|max:50|unique:item_kelengkapan_supirs,keterangan,' . $itemKelengkapanSupir->id,
                'urutan'       => 'sometimes|required|string|max:10',
                'is_active'       => 'boolean',
            ]);

            $itemKelengkapanSupir->update($validated);
            DB::commit();
            return response()->json([
                'message' => 'Item berhasil diperbarui.',
                'data'    => $itemKelengkapanSupir,
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => $this->messageFail,
                'err' => $e->getTrace()[0],
                'errMsg' => $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

    public function destroy(ItemKelengkapanSupir $itemKelengkapanSupir)
    {
        if ($itemKelengkapanSupir->vcfs()->exists()) {
            return response()->json([
                'message' => 'Item tidak dapat dihapus karena masih memiliki data VCF terkait.',
            ], 422);
        }

        $itemKelengkapanSupir->delete();

        return response()->json(['message' => 'Item berhasil dihapus.']);
    }
}

