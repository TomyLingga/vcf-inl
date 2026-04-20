<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DriverController extends Controller
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
            $data = Driver::orderBy('nama_supir', 'asc')
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
                'nama_supir'      => 'required|string|max:255',
                'no_sim'          => 'required|string|max:50|unique:drivers,no_sim',
                'jenis_sim'       => 'required|string|max:10',
                'tgl_berlaku_sim' => 'required|date',
                'is_active'       => 'boolean',
            ]);

            $driver = Driver::create($validated);
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

    public function show(Driver $driver)
    {
        return response()->json($driver);
    }

    public function update(Request $request, Driver $driver)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'nama_supir'      => 'sometimes|required|string|max:255',
                'no_sim'          => 'sometimes|required|string|max:50|unique:drivers,no_sim,' . $driver->id,
                'jenis_sim'       => 'sometimes|required|string|max:10',
                'tgl_berlaku_sim' => 'sometimes|required|date',
                'is_active'       => 'boolean',
            ]);

            $driver->update($validated);
            DB::commit();
            return response()->json([
                'message' => 'Driver berhasil diperbarui.',
                'data'    => $driver,
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

    public function destroy(Driver $driver)
    {
        if ($driver->vcfs()->exists()) {
            return response()->json([
                'message' => 'Driver tidak dapat dihapus karena masih memiliki data VCF terkait.',
            ], 422);
        }

        $driver->delete();

        return response()->json(['message' => 'Driver berhasil dihapus.']);
    }
}
