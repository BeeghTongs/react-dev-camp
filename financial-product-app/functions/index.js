/* eslint-disable max-len */
const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const PDFDocument = require("pdfkit");

admin.initializeApp();

setGlobalOptions({maxInstances: 10});

exports.generateContract = onCall(async (request) => {
  const order = request.data.order;

  logger.info("Generating contract for order:", order.id);

  // Create PDF
  const doc = new PDFDocument();
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  await new Promise((resolve) => {
    doc.on("end", resolve);

    doc.fontSize(20).text("Device Contract Agreement", {align: "center"});
    doc.moveDown();
    doc.fontSize(12).text(`Reference: ${order.id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Customer: ${order.customerName}`);
    doc.text(`Email: ${order.customerEmail}`);
    doc.moveDown();
    doc.text(`Device: ${order.deviceName}`);
    doc.text(`Contract Duration: ${order.contractMonths} months`);
    doc.text(`Monthly Instalment: R${order.monthlyPrice}`);
    doc.text(`Deposit Paid: R${order.deposit}`);
    doc.moveDown();
    doc.fontSize(10).fillColor("grey").text(
        "By proceeding with this order, the customer agrees to the terms and conditions.",
    );

    doc.end();
  });

  const pdfBuffer = Buffer.concat(chunks);

  // Upload to Firebase Storage
  const bucket = admin.storage().bucket();
  const file = bucket.file(`contracts/${order.id}.pdf`);

  await file.save(pdfBuffer, {contentType: "application/pdf"});

  await file.makePublic();
  const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

  // Save contract URL back to Firestore
  await admin.firestore()
      .collection("orders")
      .doc(order.id)
      .update({contractUrl: downloadUrl});

  return {success: true, contractUrl: downloadUrl};
});

// Optional: auto-trigger when order is written to Firestore
exports.onOrderCreated = onDocumentCreated("orders/{orderId}", async (event) => {
  const orderId = event.params.orderId;

  logger.info("New order created:", orderId);

  // you can trigger contract generation here too if needed
});
