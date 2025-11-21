import React, { useState } from "react";
import emailjs from "@emailjs/browser";
// import html2canvas from "html2canvas-pro";
import { X, Send } from "lucide-react";

export default function FeedbackOverlay({ show, setShowFeedbackOverlay, onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  const validEmail = (e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).toLowerCase());

  // Capture the screenshot of the whole app
  // async function captureScreenshot() {
  //   const screenshotTarget = document.querySelector("#root") || document.body;

  //   const canvas = await html2canvas(screenshotTarget, {
  //     useCORS: true,
  //     backgroundColor: null,
  //     scale: 1,
  //   });

  //   return canvas.toDataURL("image/png");
  // }

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!validEmail(email)) {
      setStatus({ type: "error", text: "Please enter a valid email." });
      return;
    }

    if (!message.trim()) {
      setStatus({ type: "error", text: "Feedback cannot be empty." });
      return;
    }

    try {
      emailjs.init(publicKey);
    } catch (error){
      console.error("EmailJS init error:", error);
      setStatus({
        type: "error",
        text: "There was a problem initializing the email service."
      });
      return;
    }

    setSending(true);

    try {
      // Screenshot in background
      // const screenshotDataURL = await captureScreenshot();

      const templateParams = {
        email: email,
        message,
        // screenshot: screenshotDataURL, // base64 image
      };

      await emailjs.send(serviceId, templateId, templateParams);

      setStatus({
        type: "success",
        text: "Thank you! Your feedback has been sent.",
      });

      setEmail("");
      setMessage("");

    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        text: "There was a problem sending your feedback.",
      });
    } finally {
      setSending(false);
      setShowFeedbackOverlay(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-lg bg-white dark:bg-[#111] shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-neutral-800">
          <h2 className="text-lg font-semibold dark:text-neutral-100">Send Feedback</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSend} className="px-4 py-4 space-y-3">

          <label className="block text-sm dark:text-neutral-300">
            Email
            <input
              name="from_email"
              type="email"
              className="mt-1 w-full rounded-md border dark:border-neutral-700 px-3 py-2 dark:bg-[#0b0b0b]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block text-sm dark:text-neutral-300">
            Feedback
            <textarea
              name="message"
              rows={6}
              className="mt-1 w-full rounded-md border dark:border-neutral-700 px-3 py-2 dark:bg-[#0b0b0b]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          {status && (
            <div
              className={`text-sm rounded px-3 py-2 ${
                status.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {status.text}
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-white bg-[#1f1f1f] hover:bg-[#2a2a2a]"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
