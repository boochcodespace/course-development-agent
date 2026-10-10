import { NextRequest, NextResponse } from 'next/server';

interface ExtractionResult {
  text: string;
  pageCount?: number;
  metadata?: Record<string, string>;
  warnings: string[];
}

async function extractPdf(buffer: Buffer): Promise<ExtractionResult> {
  const warnings: string[] = [];
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    if (!data.text || data.text.trim().length < 50) {
      warnings.push(
        'PDF contains very little extractable text. It might be image-based (scanned). ' +
        'OCR is not supported in this version. Consider providing a text-based version.'
      );
    }
    return {
      text: data.text || '',
      pageCount: data.numpages,
      metadata: data.info ? { title: data.info.Title, author: data.info.Author } : undefined,
      warnings,
    };
  } catch (err) {
    warnings.push(`PDF extraction failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    return { text: '', warnings };
  }
}

async function extractDocx(buffer: Buffer): Promise<ExtractionResult> {
  const warnings: string[] = [];
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    if (result.messages.length > 0) {
      warnings.push(...result.messages.map((m: { message: string }) => m.message));
    }
    return { text: result.value || '', warnings };
  } catch (err) {
    warnings.push(`DOCX extraction failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    return { text: '', warnings };
  }
}

async function extractXlsx(buffer: Buffer): Promise<ExtractionResult> {
  const warnings: string[] = [];
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheets: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      if (csv.trim()) {
        sheets.push(`--- Sheet: ${sheetName} ---\n${csv}`);
      }
    }
    if (sheets.length === 0) {
      warnings.push('Spreadsheet contains no readable data.');
    }
    return { text: sheets.join('\n\n'), warnings };
  } catch (err) {
    warnings.push(`XLSX extraction failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    return { text: '', warnings };
  }
}

async function extractPptx(buffer: Buffer): Promise<ExtractionResult> {
  const warnings: string[] = [];
  try {
    const officeparser = await import('officeparser');
    const text = await officeparser.parseOfficeAsync(buffer);
    if (!text || text.trim().length < 20) {
      warnings.push(
        'PPTX contains very little extractable text. Slide content might be primarily images or shapes.'
      );
    }
    return { text: text || '', warnings };
  } catch (err) {
    warnings.push(`PPTX extraction failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    return { text: '', warnings };
  }
}

async function extractText(buffer: Buffer): Promise<ExtractionResult> {
  return {
    text: buffer.toString('utf-8'),
    warnings: [],
  };
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_TEXT_LENGTH = 500_000; // ~500K chars

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type || '';

    let result: ExtractionResult;

    if (ext === 'pdf' || mimeType === 'application/pdf') {
      result = await extractPdf(buffer);
    } else if (ext === 'docx' || mimeType.includes('wordprocessingml')) {
      result = await extractDocx(buffer);
    } else if (ext === 'xlsx' || mimeType.includes('spreadsheetml')) {
      result = await extractXlsx(buffer);
    } else if (ext === 'pptx' || mimeType.includes('presentationml')) {
      result = await extractPptx(buffer);
    } else if (['txt', 'md', 'rtf'].includes(ext) || mimeType.startsWith('text/')) {
      result = await extractText(buffer);
    } else if (mimeType.startsWith('image/')) {
      result = {
        text: '',
        warnings: ['Image files cannot be text-extracted. OCR is not supported in this version.'],
      };
    } else {
      result = {
        text: '',
        warnings: [`Unsupported file type: ${ext || mimeType}. No text could be extracted.`],
      };
    }

    if (result.text.length > MAX_TEXT_LENGTH) {
      result.text = result.text.slice(0, MAX_TEXT_LENGTH);
      result.warnings.push(
        `Text was truncated to ${MAX_TEXT_LENGTH.toLocaleString()} characters. The full document is longer.`
      );
    }

    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      extractedText: result.text,
      pageCount: result.pageCount,
      metadata: result.metadata,
      warnings: result.warnings,
      charCount: result.text.length,
    });
  } catch (err) {
    console.error('Material upload error:', err);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
