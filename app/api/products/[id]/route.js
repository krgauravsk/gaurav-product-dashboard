import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const config = {
  api: {
    bodyParser: false,
  },
};

// GET /api/products/[id]
export async function GET(_, { params }) {
  try {
    await dbConnect();
    const product = await Product.findById(params.id);
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(_, { params }) {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/products/[id]
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const formData = await req.formData();

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
      const base64 = buffer.toString('base64');
      const dataURI = `data:${image.type};base64,${base64}`;

      const uploadRes = await cloudinary.uploader.upload(dataURI, {
        folder: 'products',
      });

      updatedFields.imageUrl = uploadRes.secure_url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(params.id, updatedFields, { new: true });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
