          
          let fullText = ''
          
          // First pass: count font sizes to find the most common one (default size)
          const sizeCounts: Record<string, number> = { '': 0 }
          for (let r = 0; r < allRuns.length; r++) {
            const run = allRuns[r]
            const rPr = run.getElementsByTagName('w:rPr')[0]
            let fontSize = ''
            
            if (rPr) {
              const szEl = rPr.getElementsByTagName('w:sz')[0]
              if (szEl) {
                const szVal = szEl.getAttribute('w:val')
                if (szVal) {
                  // Word stores font size in half-points, convert to points
                  fontSize = String(Math.round(parseInt(szVal) / 2))
                }
              }
            }
            
            sizeCounts[fontSize] = (sizeCounts[fontSize] || 0) + 1
          }
          
          // Find the most common font size - this becomes the default (no tag needed)
          let defaultSize = ''
          let maxSizeCount = 0
          for (const [size, count] of Object.entries(sizeCounts)) {
            if (count > maxSizeCount) {
              maxSizeCount = count
              defaultSize = size
            }
          }
          
          // Track current formatting state for grouping
          let currentText = ''
          let currentStyle = { bold: false, italic: false, underline: false, color: '', fontSize: '' }
          
          // Helper to flush accumulated text with its formatting
          const flushText = () => {
            
            let formatted = currentText
            
            // Only add font tag if color or size is DIFFERENT from defaults
            const hasColor = currentStyle.color && currentStyle.color !== defaultColor
            const hasSize = currentStyle.fontSize && currentStyle.fontSize !== defaultSize
            
            if (hasColor || hasSize) {
              let fontAttrs = ''
              if (hasColor) fontAttrs += ` color="${currentStyle.color}"`
              if (hasSize) fontAttrs += ` size="${currentStyle.fontSize}"`
              formatted = `<font${fontAttrs}>${formatted}</font>`
            }
            if (currentStyle.underline) {
              formatted = `<u>${formatted}</u>`
              let isItalic = false
              let isUnderline = false
              let color = ''
              let fontSize = ''
              
              if (rPr) {
                isBold = rPr.getElementsByTagName('w:b').length > 0 || 
                    color = '#' + colorVal
                  }
                }
                
                // Get font size (stored in half-points)
                const szEl = rPr.getElementsByTagName('w:sz')[0]
                if (szEl) {
                  const szVal = szEl.getAttribute('w:val')
                  if (szVal) {
                    fontSize = String(Math.round(parseInt(szVal) / 2))
                  }
                }
              }
              
              // Check if formatting changed
                currentStyle.bold !== isBold ||
                currentStyle.italic !== isItalic ||
                currentStyle.underline !== isUnderline ||
                currentStyle.color !== color ||
                currentStyle.fontSize !== fontSize
              
              if (styleChanged) {
                // Flush previous text with old formatting
                flushText()
                // Update to new formatting
                currentStyle = { bold: isBold, italic: isItalic, underline: isUnderline, color, fontSize }
              }
