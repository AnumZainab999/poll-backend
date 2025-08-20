const functions = require("firebase-functions");
const app = require("../app");

// Export firebase function
exports.api = functions.https.onRequest(app);
