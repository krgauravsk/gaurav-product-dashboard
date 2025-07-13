


import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';

// GET /api/products/[id]
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/products/[id]
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const formData = await request.formData();

    const updatedFields = {
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
      date: formData.get('date'),
    };

    const image = formData.get('image');
    if (image && typeof image === 'object') {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${image.name}`;
      const filepath = `./public/uploads/${filename}`;
      await writeFile(filepath, buffer);
      updatedFields.imageUrl = `/uploads/${filename}`;
    }

    const updated = await Product.findByIdAndUpdate(params.id, updatedFields, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
