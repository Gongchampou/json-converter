"use server"

import { generateText, Output } from 'ai'
import { z } from 'zod'

const documentSchema = z.object({
  content: z.string().describe('All extracted text from the PDF with HTML styling preserved'),
})

export async function convertPdfToJson(base64Data: string, filename: string) {
  try {
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
              text: `Extract ALL text content from this PDF document and return it in a single "content" field with HTML styling.

IMPORTANT RULES:
1. Extract ALL text exactly as it appears - do not skip or summarize anything
2. Preserve ALL styling using HTML tags:
   - Bold text: <b>text</b>
   - Italic text: <i>text</i>
   - Colored text: <span style="color:red;">text</span> or <b style="color:red;">text</b>
   - Large/heading text: <span style="font-size:18px;font-weight:bold;">text</span>
   - Small text: <span style="font-size:12px;">text</span>
3. Use \\n for line breaks between lines
4. Use \\n\\n for paragraph breaks (double space)
5. Return everything in ONE single "content" string field
6. Do NOT create multiple JSON keys - ONLY use "content"
7. Detect font sizes and convert to approximate px values
8. Detect font weights (bold, normal) and apply <b> tags
9. Detect colors and apply inline styles

Example output format:
{"content": "<b style=\\"color:red;font-size:24px;\\">Title</b>\\n\\nRegular paragraph text here.\\n<b>Bold text</b> and <i>italic text</i>."}`,
            },
            {
              type: 'file',
              data: base64Data,
              mediaType: 'application/pdf',
              filename: filename || 'document.pdf',
            },
          ],
        },
      ],
    })

    return { success: true, data: output }
  } catch (error) {
    console.error('PDF conversion error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to convert PDF' 
    }
  }
}
