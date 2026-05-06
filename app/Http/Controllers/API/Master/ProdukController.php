<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ProdukController extends Controller
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
            $data = Produk::orderBy('nama', 'asc')
                    ->get();

            if ($data->isEmpty()) {
                return response()->json(['message' => $this->messageMissing], 401);
            }

            return response()->json(['data' => $data, 'message' => $this->messageAll], 200);
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
                'nama'                   => 'required|string|max:100',
                'kode'                   => 'required|string|max:20|unique:produks,kode',
                'warna_nomor_urut'       => 'required|string|max:20',
                'is_active'              => 'boolean',
            ]);

            $driver = Produk::create($validated);
            DB::commit();
            return response()->json([
                'message' => 'Produk berhasil ditambahkan.',
                'data'    => $driver,
            ], 201);
        } catch (\Exception $e) { if ($e instanceof \Illuminate\Validation\ValidationException) { DB::rollback(); throw $e; }
            DB::rollback();
            return response()->json([
                'message' => $this->messageFail,
                'err' => $e->getTrace()[0],
                'errMsg' => $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

    public function show(Produk $produk)
    {
        return response()->json($produk);
    }

  public function update(Request $request, Produk $produk)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'nama'      => 'sometimes|required|string|max:100',
                'kode'      => 'sometimes|required|string|max:20|unique:produks,kode,' . $produk->id,
                'is_active' => 'boolean',
            ]);

            $produk->update($validated);
            DB::commit();
            return response()->json([
                'message' => 'Produk berhasil diperbarui.',
                'data'    => $produk,
            ]);
        } catch (\Exception $e) { if ($e instanceof \Illuminate\Validation\ValidationException) { DB::rollback(); throw $e; }
            DB::rollback();
            return response()->json([
                'message' => $this->messageFail,
                'err' => $e->getTrace()[0],
                'errMsg' => $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

   public function destroy(produk $produk)
    {
        if ($produk->vcfs()->exists()) {
            return response()->json([
                'message' => 'Produk tidak dapat dihapus karena masih digunakan.',
            ], 422);
        }

        $produk->delete();

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }
}
