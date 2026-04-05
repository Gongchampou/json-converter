import { generateText, Output } from 'ai'
import { z } from 'zod'

// Simple schema with just a content field
const documentSchema = z.object({
  content: z.string().describe('All extracted text from the PDF document in a single string'),
})

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
              text: `Extract ALL text content from this PDF document and return it in a single "content" field.

Rules:
- Extract ALL text from the PDF exactly as it appears
- Keep all text content, don't summarize or skip anything
- For styled text (bold, italic, colored), preserve using HTML tags like <b>, <i>, <b style="color:red;">
- For line breaks between lines, use \\n
- For paragraph breaks, use \\n\\n
- Return everything in ONE single "content" string field
- Do NOT create multiple keys - ONLY use "content"
- Output format: {"content": "all the text here..."}`,
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
