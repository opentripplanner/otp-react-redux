/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-empty-function */
import PDFDocument from 'pdfkit/js/pdfkit.standalone'

/**
 * This class extends the pdfkit functionality to provide a tables method, which
 * will write tableData (2-d array) to the pdf doc.
 *
 * This was copied with minimal changes
 * from https://www.andronio.me/2017/09/02/pdfkit-tables/
 */
class PDFDocumentWithTables extends PDFDocument {
  /**
   * Construct table in the document.
   * @param  {{headers: Array<string>, rows: Array}} table table data
   * @param  {(number|Options)} arg0  if provided with arg1, the start x
   *                                  location. If the only arg provided, the
   *                                  options object.
   * @param  {number} arg1  the start y location
   * @param  {Options} arg2  options object (if not provided in arg0)
   */
  table(table, arg0, arg1, arg2) {
    let startX = this.page.margins.left
    let startY = this.y
    let options = {}

    if (typeof arg0 === 'number' && typeof arg1 === 'number') {
      startX = arg0
      startY = arg1

      if (typeof arg2 === 'object') {
        options = arg2
      }
    } else if (typeof arg0 === 'object') {
      options = arg0
    }

    const columnCount = table.headers.length
    const columnSpacing = options.columnSpacing || 15
    const rowSpacing = options.rowSpacing || 5
    const usableWidth =
      options.width ||
      this.page.width - this.page.margins.left - this.page.margins.right

    const prepareHeader = options.prepareHeader || (() => {})
    const prepareRow = options.prepareRow || (() => {})
    const computeRowHeight = (row) => {
      let result = 0

      row.forEach((cell) => {
        const cellHeight = this.heightOfString(cell, {
          align: 'left',
          width: columnWidth
        })
        result = Math.max(result, cellHeight)
      })

      return result + rowSpacing
    }

    const columnContainerWidth = usableWidth / columnCount
    const columnWidth = columnContainerWidth - columnSpacing
    const maxY = this.page.height - this.page.margins.bottom

    let rowBottomY = 0

    this.on('pageAdded', () => {
      startY = this.page.margins.top
      rowBottomY = 0
    })

    // Allow the user to override style for headers
    prepareHeader()

    // Check to have enough room for header and first rows
    if (startY + 3 * computeRowHeight(table.headers) > maxY) {
      this.addPage()
    }

    // Print all headers
    table.headers.forEach((header, i) => {
      this.text(header, startX + i * columnContainerWidth, startY, {
        align: 'left',
        width: columnWidth
      })
    })

    // Refresh the y coordinate of the bottom of the headers row
    rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY)

    // Separation line between headers and rows
    this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
      .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
      .lineWidth(2)
      .stroke()

    table.rows.forEach((row, i) => {
      const rowHeight = computeRowHeight(row)

      // Switch to next page if we cannot go any further because the space is over.
      // For safety, consider 3 rows margin instead of just one
      if (startY + 3 * rowHeight < maxY) {
        startY = rowBottomY + rowSpacing
      } else {
        this.addPage()
      }

      // Allow the user to override style for rows
      prepareRow(row, i)

      // Print all cells of the current row
      row.forEach((cell, i) => {
        this.text(cell, startX + i * columnContainerWidth, startY, {
          align: 'left',
          width: columnWidth
        })
      })

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY)

      // Separation line between rows
      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(1)
        .opacity(0.7)
        .stroke()
        .opacity(1) // Reset opacity after drawing the line
    })

    this.x = startX
    this.moveDown()

    return this
  }
}

export default PDFDocumentWithTables
