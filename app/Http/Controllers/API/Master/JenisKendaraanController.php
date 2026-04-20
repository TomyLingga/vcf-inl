<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\JenisKendaraan;
use Illuminate\Http\Request;

class JenisKendaraanController extends Controller
{
    public function index(Request $request)
    {

    }

    public function store(Request $request)
    {

    }

    public function show(JenisKendaraan $jenisKendaraan)
    {
        return response()->json($jenisKendaraan);
    }

    public function update(Request $request, JenisKendaraan $jenisKendaraan)
    {
        $validated = $request->validate([
            'nama'      => 'sometimes|required|string|max:100',
            'kode'      => 'sometimes|required|string|max:20|unique:jenis_kendaraans,kode,' . $jenisKendaraan->id,
            'is_active' => 'boolean',
        ]);

        $jenisKendaraan->update($validated);

        return response()->json([
            'message' => 'Jenis kendaraan berhasil diperbarui.',
            'data'    => $jenisKendaraan,
        ]);
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
