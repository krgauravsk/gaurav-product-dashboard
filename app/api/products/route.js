import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
// import multer from 'multer';
// import path from 'path';
import { writeFile } from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();

    const title = formData.get('title');
    const description = formData.get('description');
    const status = formData.get('status');
    const date = formData.get('date');
    const image = formData.get('image');

    let imageUrl = '';
    if (image && typeof image === 'object') {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${image.name}`;
      const filepath = `./public/uploads/${filename}`;
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    await dbConnect();

    const product = await Product.create({
      title,
      description,
      status,
      date,
      imageUrl,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filter = {};
    if (status) filter.status = status;
    if (startDate && endDate)
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };

    const products = await Product.find(filter).sort({ date: -1 });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
