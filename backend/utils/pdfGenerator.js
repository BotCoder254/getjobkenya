const PDFDocument = require('pdfkit');

/**
 * Generates an order invoice PDF
 * @param {Object} order - The order object containing order details
 * @param {Stream} stream - The stream to write the PDF to
 */
exports.generateInvoice = (order, stream) => {
  const doc = new PDFDocument();
  doc.pipe(stream);

  // Add company header
  doc.fontSize(20).text(process.env.COMPANY_NAME || 'E-Commerce Store', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('INVOICE', { align: 'center' });
  doc.moveDown();

  // Add order details
  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
  doc.moveDown();

  // Add customer details
  doc.text(`Customer: ${order.user.name}`);
  doc.text(`Email: ${order.user.email}`);
  doc.moveDown();

  // Add shipping address
  doc.text('Shipping Address:');
  doc.text(order.shippingAddress.street);
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`);
  doc.text(order.shippingAddress.country);
  doc.moveDown();

  // Add items table header
  doc.text('Items:', { underline: true });
  doc.moveDown(0.5);

  // Add items
  order.items.forEach(item => {
    doc.text(`${item.product.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`);
  });
  doc.moveDown();

  // Add totals
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  doc.text(`Subtotal: $${subtotal.toFixed(2)}`);
  doc.text(`Shipping: $${order.shippingCost.toFixed(2)}`);
  doc.text(`Tax: $${order.taxAmount.toFixed(2)}`);
  doc.fontSize(14).text(`Total: $${order.totalAmount.toFixed(2)}`, { bold: true });

  // Add footer
  doc.moveDown(2);
  doc.fontSize(10).text('Thank you for your business!', { align: 'center' });
  doc.text(process.env.COMPANY_WEBSITE || 'www.example.com', { align: 'center' });

  // Finalize the PDF
  doc.end();
};

/**
 * Generates a shipping label PDF
 * @param {Object} order - The order object containing shipping details
 * @param {Stream} stream - The stream to write the PDF to
 */
exports.generateShippingLabel = (order, stream) => {
  const doc = new PDFDocument();
  doc.pipe(stream);

  // Add company header
  doc.fontSize(16).text(process.env.COMPANY_NAME || 'E-Commerce Store', { align: 'center' });
  doc.moveDown();

  // Add shipping label title
  doc.fontSize(14).text('SHIPPING LABEL', { align: 'center' });
  doc.moveDown();

  // Add tracking number if available
  if (order.trackingNumber) {
    doc.text(`Tracking #: ${order.trackingNumber}`);
    doc.moveDown();
  }

  // Add shipping address
  doc.fontSize(12).text('Ship To:', { underline: true });
  doc.text(order.user.name);
  doc.text(order.shippingAddress.street);
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`);
  doc.text(order.shippingAddress.country);
  doc.moveDown();

  // Add order details
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Order Date: ${order.createdAt.toLocaleDateString()}`);
  
  // Add package details
  doc.moveDown();
  doc.text('Package Contents:', { underline: true });
  doc.text(`Total Items: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}`);

  // Add barcode placeholder (in real implementation, you'd generate an actual barcode)
  doc.moveDown();
  doc.rect(50, doc.y, 200, 50).stroke();
  doc.text('*Barcode Placeholder*', 50, doc.y - 45, { align: 'center' });

  // Finalize the PDF
  doc.end();
};

/**
 * Generates a return label PDF
 * @param {Object} order - The order object containing return details
 * @param {Stream} stream - The stream to write the PDF to
 */
exports.generateReturnLabel = (order, stream) => {
  const doc = new PDFDocument();
  doc.pipe(stream);

  // Add return label header
  doc.fontSize(16).text('RETURN SHIPPING LABEL', { align: 'center' });
  doc.moveDown();

  // Add return instructions
  doc.fontSize(12).text('Return Instructions:', { underline: true });
  doc.text('1. Pack items securely in original packaging if possible');
  doc.text('2. Attach this label to the outside of the package');
  doc.text('3. Drop off at any authorized shipping location');
  doc.moveDown();

  // Add return address (company address)
  doc.text('Return To:', { underline: true });
  doc.text(process.env.COMPANY_NAME || 'E-Commerce Store');
  doc.text(process.env.COMPANY_ADDRESS || 'Returns Department');
  doc.moveDown();

  // Add order information
  doc.text(`Order ID: ${order._id}`);
  doc.text(`RMA Number: RMA-${order._id.slice(-6)}`);
  doc.text(`Customer: ${order.user.name}`);
  
  // Add barcode placeholder
  doc.moveDown();
  doc.rect(50, doc.y, 200, 50).stroke();
  doc.text('*Return Barcode*', 50, doc.y - 45, { align: 'center' });

  // Finalize the PDF
  doc.end();
}; 