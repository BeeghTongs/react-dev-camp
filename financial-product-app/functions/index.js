/* eslint-disable max-len */
const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const PDFDocument = require("pdfkit");
const path = require("path");
const crypto = require("crypto");

admin.initializeApp();

setGlobalOptions({maxInstances: 10});

const emailjsServiceId = defineSecret("EMAILJS_SERVICE_ID");
const emailjsOtpTemplateId = defineSecret("EMAILJS_OTP_TEMPLATE_ID");
const emailjsPublicKey = defineSecret("EMAILJS_PUBLIC_KEY");
const emailjsPrivateKey = defineSecret("EMAILJS_PRIVATE_KEY");

const OTP_EXPIRATION_MINUTES = 15;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const hashOtp = (email, code) =>
  crypto.createHash("sha256").update(`${email}:${code}`).digest("hex");

/**
 * Generates and emails a one-time verification code for signup, storing
 * only a hash of the code (with expiry + attempt count) in Firestore so the
 * client never has access to the code or the means to self-verify it.
 */
exports.sendVerificationCode = onCall(
    {secrets: [emailjsServiceId, emailjsOtpTemplateId, emailjsPublicKey, emailjsPrivateKey]},
    async (request) => {
      const email = normalizeEmail(request.data && request.data.email);

      if (!isValidEmail(email)) {
        throw new HttpsError("invalid-argument", "A valid email is required.");
      }

      const docRef = admin.firestore().collection("otpVerifications").doc(email);
      const existing = await docRef.get();

      if (existing.exists) {
        const secondsSinceLastSend = (Date.now() - existing.data().createdAt) / 1000;
        if (secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
          throw new HttpsError("resource-exhausted", "Please wait before requesting another code.");
        }
      }

      const code = crypto.randomInt(100000, 1000000).toString();
      const createdAt = Date.now();
      const expiresAt = createdAt + OTP_EXPIRATION_MINUTES * 60 * 1000;

      await docRef.set({
        codeHash: hashOtp(email, code),
        createdAt,
        expiresAt,
        attempts: 0,
      });

      const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          service_id: emailjsServiceId.value(),
          template_id: emailjsOtpTemplateId.value(),
          user_id: emailjsPublicKey.value(),
          accessToken: emailjsPrivateKey.value(),
          template_params: {
            email: email,
            verification_code: code,
            time: new Date(expiresAt).toLocaleTimeString(),
          },
        }),
      });

      if (!emailResponse.ok) {
        logger.error("EmailJS error:", await emailResponse.text());
        throw new HttpsError("internal", "Failed to send verification email.");
      }

      return {success: true};
    },
);

/**
 * Verifies a submitted signup OTP against the hash stored server-side.
 * Wrong-code attempts are counted and the record is deleted once it
 * expires, is used successfully, or exceeds the attempt limit.
 */
exports.verifyVerificationCode = onCall(async (request) => {
  const email = normalizeEmail(request.data && request.data.email);
  const code = String((request.data && request.data.code) || "").trim();

  if (!isValidEmail(email) || !code) {
    throw new HttpsError("invalid-argument", "Email and code are required.");
  }

  const docRef = admin.firestore().collection("otpVerifications").doc(email);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new HttpsError("failed-precondition", "No verification code found for this email.");
  }

  const {codeHash, expiresAt, attempts} = snap.data();

  if (Date.now() > expiresAt) {
    await docRef.delete();
    throw new HttpsError("deadline-exceeded", "Verification code has expired.");
  }

  if (attempts >= OTP_MAX_ATTEMPTS) {
    await docRef.delete();
    throw new HttpsError("resource-exhausted", "Too many attempts. Request a new code.");
  }

  if (hashOtp(email, code) !== codeHash) {
    await docRef.update({attempts: admin.firestore.FieldValue.increment(1)});
    return {valid: false};
  }

  await docRef.delete();
  return {valid: true};
});

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
