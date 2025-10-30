import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// your Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exechttps://script.google.com/macros/s/AKfycbx_PymlzQSbX94MST6Pil1GvIJy9zW8Ml9RJUTpfEJCZeVyNrJjmj5G9An19LOQRwI/exec";

// Receive webhook from Monday.com
app.post("/api/webhook", async (req, res) => {
  try {
    const event = req.body?.event;
    if (!event) {
      return res.status(400).send("No event data");
    }

    // Only process call summaries from 'Emails & Activities'
    const updateText = event.update?.body?.toLowerCase() || "";
    if (!updateText.includes("call")) {
      return res.status(200).send("Ignored non-call update");
    }

    const payload = {
      leadName: event.pulseName,
      contactName: event.columnValues?.contact?.text || "",
      salesRep: event.userName,
      callSummary: event.update.body,
      createdAt: new Date().toISOString()
    };

    // Send to Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Forwarded to Google Script", await response.text());
    res.status(200).send("OK");
  } catch (err) {
    console.error("Error handling webhook:", err);
    res.status(500).send("Server error");
  }
});

export default app;
