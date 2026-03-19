import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface PublicFont {
  name: string;
  path: string;
}

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public');
  const fontExtensions = ['.ttf', '.otf', '.woff', '.woff2'];

  try {
    if (!fs.existsSync(publicDir)) {
      return NextResponse.json([]);
    }
    const files = fs.readdirSync(publicDir);
    const fonts: PublicFont[] = files
      .filter((file) => fontExtensions.includes(path.extname(file).toLowerCase()))
      .map((file) => ({
        name: path.basename(file, path.extname(file)),
        path: `/${file}`,
      }));

    return NextResponse.json(fonts);
  } catch (error) {
    console.error('Failed to scan public fonts:', error);
    return NextResponse.json([]);
  }
}
