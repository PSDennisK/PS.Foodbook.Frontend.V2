import { sheetService } from '@/lib/api/sheet.service';
import { Culture } from '@/types/enums';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; locale: string }> }
) {
  try {
    const { id, locale } = await params;

    // Map locale string to Culture enum
    const cultureMap: Record<string, Culture> = {
      nl: Culture.NL,
      en: Culture.EN,
      de: Culture.DE,
      fr: Culture.FR,
    };

    const culture = cultureMap[locale] || Culture.NL;

    // Generate PDF
    const pdfBlob = await sheetService.generatePdf(id, culture);

    if (!pdfBlob) {
      return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
    }

    // Return PDF with appropriate headers
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="productsheet-${id}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
