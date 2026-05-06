<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\Transporter;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class TransporterController extends Controller
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
            $data = Transporter::orderBy('nama_transporter', 'asc')
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
                'nama_transporter'      => 'required|string|max:100',
                'kode'      => 'required|string|max:20|unique:transporters,kode',
                'is_active' => 'boolean',
            ]);

            $driver = Transporter::create($validated);
            DB::commit();
            return response()->json([
                'message' => 'Transporter berhasil ditambahkan.',
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

    public function show(Transporter $transporter)
    {
        return response()->json($transporter->load('drivers'));
    }

   public function update(Request $request, Transporter $transporter)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'nama_transporter'      => 'sometimes|required|string|max:100',
                'kode'      => 'sometimes|required|string|max:20|unique:transporters,kode,' . $transporter->id,
                'is_active' => 'boolean',
            ]);

            $transporter->update($validated);
            DB::commit();
            return response()->json([
                'message' => 'Transporter berhasil diperbarui.',
                'data'    => $transporter,
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

   public function destroy(Transporter $transporter)
    {
        if ($transporter->drivers()->exists() || $transporter->vcfs()->exists()) {
            return response()->json([
                'message' => 'Transporter tidak dapat dihapus karena masih memiliki data terkait.',
            ], 422);
        }

        $transporter->delete();

        return response()->json(['message' => 'Transporter berhasil dihapus.']);
    }
}
