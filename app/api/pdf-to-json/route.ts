import { generateText, Output } from 'ai'
import { z } from 'zod'

// Flexible schema for any document type
const documentSchema = z.record(z.string(), z.unknown()).describe('Extracted document data as key-value pairs')

export async function POST(req: Request) {
  try {
    const { file, filename } = await req.json()

    const { output } = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      output: Output.object({
        schema: documentSchema,
      }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract ALL text content from this PDF document and convert it to a well-structured JSON format. 
              
Rules:
- Preserve the document structure (headings, paragraphs, lists, tables)
- If there are sections, use section names as keys
- If there are lists, use arrays
- If there are tables, convert to arrays of objects
- Keep all text content, don't summarize
- Use descriptive key names based on the content
- For styled text (bold, italic), preserve using HTML tags like <b>, <i>
- For line breaks in content, use \\n
- Return a clean, well-organized JSON structure`,
            },
            {
              type: 'file',
              data: file,
              mediaType: 'application/pdf',
              filename: filename || 'document.pdf',
            },
          ],
        },
      ],
    })

    return Response.json({ success: true, data: output })
  } catch (error) {
    console.error('PDF conversion error:', error)
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to convert PDF' 
      },
      { status: 500 }
    )
  }
}
