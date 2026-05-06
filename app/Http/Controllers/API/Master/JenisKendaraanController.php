<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\JenisKendaraan;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class JenisKendaraanController extends Controller
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
            $data = JenisKendaraan::orderBy('nama', 'asc')
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
                'nama'      => 'required|string|max:100',
                'kode'      => 'required|string|max:20|unique:jenis_kendaraans,kode',
                'is_active' => 'boolean',
            ]);

            $driver = JenisKendaraan::create($validated);
            DB::commit();
            return response()->json([
                'message' => 'Jenis kendaraan berhasil ditambahkan.',
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

    public function show(JenisKendaraan $jenisKendaraan)
    {
        return response()->json($jenisKendaraan);
    }
    public function update(Request $request, JenisKendaraan $jenisKendaraan)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'nama'      => 'sometimes|required|string|max:100',
                'kode'      => 'sometimes|required|string|max:20|unique:jenis_kendaraans,kode,' . $jenisKendaraan->id,
                'is_active' => 'boolean',
            ]);

            $jenisKendaraan->update($validated);
            DB::commit();
            return response()->json([
                'message' => 'Jenis kendaraan berhasil diperbarui.',
                'data'    => $jenisKendaraan,
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

    public function destroy(JenisKendaraan $jenisKendaraan)
    {
        if ($jenisKendaraan->vcfs()->exists()) {
            return response()->json([
                'message' => 'Jenis kendaraan tidak dapat dihapus karena masih digunakan.',
            ], 422);
        }

        $jenisKendaraan->delete();

        return response()->json(['message' => 'Jenis kendaraan berhasil dihapus.']);
    }
}
