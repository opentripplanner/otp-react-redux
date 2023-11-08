import { format } from 'date-fns'
import blobStream from 'blob-stream'

/**
 * Fields use to construct PDF letter. The nested arrays
 * correspond to rows of inputs in the form layout.
 */
export const LETTER_FIELDS = [
  [
    { fieldName: 'firstname', placeholder: 'First name' },
    { fieldName: 'lastname', placeholder: 'Last name' }
  ],
  [
    { fieldName: 'address1', placeholder: 'Address 1' },
    { fieldName: 'address2', placeholder: 'Address 2' }
  ],
  [
    { fieldName: 'city', placeholder: 'City' },
    { fieldName: 'state', placeholder: 'State' },
    { fieldName: 'zip', placeholder: 'Zip' }
  ]
]

/**
 * Handle preparing a new page for the PDF doc, adding a footer, header image,
 * and resetting the currsor to the correct position.
 */
function preparePage(doc, imageData, otpConfig) {
  const { footer, headerGraphic, headerGraphicHeight, headerGraphicWidth } =
    otpConfig
  // Store true bottom of page while bottom is temporarily moved to 0.
  const bottom = doc.page.margins.bottom
  doc.page.margins.bottom = 0
  // Add footer to page.
  if (footer) {
    doc
      .fontSize(9)
      .text(footer, 0.5 * (doc.page.width - 500), doc.page.height - 50, {
        align: 'center',
        lineBreak: false,
        width: 500
      })
  }
  // Add header image.
  if (headerGraphic) {
    const width = headerGraphicWidth || (72 * imageData.width) / 300
    const height = headerGraphicHeight || (72 * imageData.height) / 300
    doc.image(imageData.data, 0.5 * (doc.page.width - 300), 40, {
      align: 'center',
      height,
      width
    })
  }
  // Reset font size, bottom margin, and text writer position.
  doc.fontSize(12).text('', doc.page.margins.left, doc.page.margins.top)
  doc.page.margins.bottom = bottom
}

/**
 * Write the provided formData and imageData (header image) to a PDF file and
 * open as a new tab.
 */
async function writePDF(formData, imageData, otpConfig) {
  const {
    address1 = '',
    address2,
    city = '',
    firstname = '',
    lastname = '',
    mailables,
    state = '',
    zip = ''
  } = formData
  const { horizontalMargin, verticalMargin } = otpConfig
  const margins = {
    bottom: verticalMargin,
    left: horizontalMargin,
    right: horizontalMargin,
    top: verticalMargin
  }
  const { default: PDFDocument } = await import('./PDFDocumentWithTables')
  const doc = new PDFDocument({ margins })
  const stream = doc.pipe(blobStream())
  preparePage(doc, imageData, otpConfig)
  doc.on('pageAdded', () => preparePage(doc, imageData, otpConfig))

  // Current date in the user's time zone (no need to use the config's homeTimezone for this purpose)
  doc.text(format(Date.now(), 'MMMM d, yyyy'))

  // recipient address
  doc
    .moveDown()
    .moveDown()
    .moveDown()
    .text(firstname.toUpperCase() + ' ' + lastname.toUpperCase())
    .text(address1.toUpperCase())
  if (address2 && address2.length > 0) {
    doc.text(address2.toUpperCase())
  }
  doc.text(city.toUpperCase() + ', ' + state.toUpperCase() + ' ' + zip)

  // introduction block
  doc.moveDown().moveDown().text(otpConfig.introduction)

  // table header
  doc
    .font('Helvetica-Bold')
    .moveDown()
    .moveDown()
    .text('SUMMARY BY ITEM', { align: 'center' })
    .moveDown()
    .moveDown()

  const tableData = {
    headers: ['Item', 'Quantity'],
    rows: mailables.map((mailable) => {
      let { largeFormat, largePrint, name, quantity } = mailable
      if (largePrint && largeFormat) {
        name += ' (LARGE PRINT)'
      }
      return [name, quantity]
    })
  }

  doc.table(tableData, {
    prepareHeader: () => doc.font('Helvetica-Bold'),
    prepareRow: (row, i) => doc.font('Helvetica').fontSize(12)
  })

  // conclusion block
  doc.moveDown().moveDown().font('Helvetica').text(otpConfig.conclusion)

  doc.end()
  stream.on('finish', () => {
    const url = stream.toBlobURL('application/pdf')
    window.open(url)
  })
}

/**
 * Generate a PDF letter for the provided form data/config.
 * This depends on the headerGraphic config field being provided and a valid URL
 * to a .png image file.
 */
export function createLetter(formData, mailablesConfig) {
  const imageUrl = mailablesConfig.headerGraphic
  // A valid URL must be provided in the config in order for the create letter
  // approach to function properly.
  if (!imageUrl) {
    return alert(
      'Error constructing letter. Mailables headerGraphic config property is missing.'
    )
  }
  // This is a very goofy approach to convert an image URL to its image data for
  // writing to the PDF, but it seems to be a solid approach.
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const data = canvas.toDataURL('image/png')
    const imageData = { data, height: img.height, width: img.width }
    writePDF(formData, imageData, mailablesConfig)
  }
  img.src = imageUrl
}
