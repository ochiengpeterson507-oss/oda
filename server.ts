import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let resendClient: Resend | null = null;
  const getResend = () => {
    if (!resendClient) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY environment variable is missing');
      }
      resendClient = new Resend(apiKey);
    }
    return resendClient;
  };

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "B2B Backend is running!" });
  });

  app.post("/api/send-email", async (req, res) => {
    try {
      const resend = getResend();
      const { to, subject, html, text } = req.body;
      
      if (!to || !subject || (!html && !text)) {
        return res.status(400).json({ error: "Missing required fields (to, subject, html or text)" });
      }

      // You should verify a sender domain in Resend to use it here.
      // E.g., 'onboarding@resend.dev' is a testing email from Resend.
      const defaultFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const from = req.body.from || defaultFrom; 

      const data = await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      });

      res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("Email sending error:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Express 4 uses '*', but just in case we are in v4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
