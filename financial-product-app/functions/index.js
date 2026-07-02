/* eslint-disable max-len */
const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const PDFDocument = require("pdfkit");
const path = require("path");

admin.initializeApp();

setGlobalOptions({maxInstances: 10});

exports.generateContract = onCall(async (request) => {
  const order = request.data.order;

  logger.info("Generating contract for order:", order.id);

  // Create PDF
  const doc = new PDFDocument({margin: 50});
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  await new Promise((resolve) => {
    doc.on("end", resolve);

    const brandBlue = "#1768d6";
    const brandAccent = "#1eb8e3";
    const heading = "#0f172a";
    const body = "#374151";
    const muted = "#64748b";

    doc.image(path.join(__dirname, "assets/logo.png"), 50, 45, {width: 40});
    doc.fillColor(brandBlue).font("Helvetica-Bold").fontSize(22)
        .text("Insure Tech Guard", 100, 48);
    doc.fillColor(heading).font("Helvetica").fontSize(13)
        .text("Device Contract Agreement", 100, 76);

    doc.x = doc.page.margins.left;
    doc.y = 105;

    doc.strokeColor(brandAccent).lineWidth(2)
        .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    doc.font("Helvetica").fontSize(11).fillColor(muted);
    doc.text(`Reference: ${order.id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").fontSize(13).fillColor(heading).text("Customer Details");
    doc.font("Helvetica").fontSize(12).fillColor(body);
    doc.text(`Name: ${order.customerName || order.customerEmail || "N/A"}`);
    doc.text(`Email: ${order.customerEmail}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").fontSize(13).fillColor(heading).text("Device & Plan");
    doc.font("Helvetica").fontSize(12).fillColor(body);
    doc.text(`Device: ${order.deviceName}`);
    doc.text(`Contract Duration: ${order.contractMonths} months`);
    doc.text(`Monthly Instalment: R${order.monthlyPrice}`);
    doc.text(`Deposit Paid: R${order.deposit}`);
    doc.moveDown(2);

    doc.fontSize(9).fillColor(muted).text(
        "By proceeding with this order, the customer agrees to the terms and conditions.",
        {align: "center"},
    );

    doc.end();
  });

  const pdfBuffer = Buffer.concat(chunks);

  // Upload to Firebase Storage
  const bucket = admin.storage().bucket();
  const file = bucket.file(`contracts/${order.customerId}/${order.id}.pdf`);

  await file.save(pdfBuffer, {contentType: "application/pdf"});

  await file.makePublic();
  const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

  // Save the order and contract URL to Firestore (doc may not exist yet)
  await admin.firestore()
      .collection("orders")
      .doc(order.id)
      .set({...order, contractUrl: downloadUrl}, {merge: true});

  return {success: true, contractUrl: downloadUrl};
});

// Optional: auto-trigger when order is written to Firestore
exports.onOrderCreated = onDocumentCreated("orders/{orderId}", async (event) => {
  const orderId = event.params.orderId;

  logger.info("New order created:", orderId);

  // you can trigger contract generation here too if needed
});
