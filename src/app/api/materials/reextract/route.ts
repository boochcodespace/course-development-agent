import { NextResponse } from 'next/server';

// Files are processed in-memory at upload time and not stored server-side.
// Re-extraction requires re-uploading the file via /api/materials/upload.
export async function POST() {
  return NextResponse.json(
    { error: 'Re-extraction is not supported. Please re-upload the file to extract its text again.' },
    { status: 501 }
  );
}
