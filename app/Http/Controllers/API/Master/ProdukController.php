<?php

namespace App\Http\Controllers\API\Master;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use Illuminate\Http\Request;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
        $query = Produk::query();

        if ($request->has('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%')
                  ->orWhere('kode', 'like', '%' . $request->search . '%');
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $data = $request->boolean('all')
            ? $query->orderBy('nama')->get()
            : $query->orderBy('nama')->paginate($request->get('per_page', 15));

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama'              => 'required|string|max:100',
            'kode'              => 'required|string|max:20|unique:produks,kode',
            'warna_nomor_urut'  => 'nullable|string|max:50',
            'is_active'         => 'boolean',
        ]);

        $data = Produk::create($validated);

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'data'    => $data,
        ], 201);
    }

    public function show(Produk $produk)
    {
        return response()->json($produk);
    }

    public function update(Request $request, Produk $produk)
    {
        $validated = $request->validate([
            'nama'             => 'sometimes|required|string|max:100',
            'kode'             => 'sometimes|required|string|max:20|unique:produks,kode,' . $produk->id,
            'warna_nomor_urut' => 'nullable|string|max:50',
            'is_active'        => 'boolean',
        ]);

        $produk->update($validated);

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'data'    => $produk,
        ]);
    }

    public function destroy(Produk $produk)
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
