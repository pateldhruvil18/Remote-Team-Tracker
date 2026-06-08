/**
 * Full-Screen Screenshot Capture Service
 * Uses getDisplayMedia() to capture the ENTIRE SCREEN (including VS Code, desktop, other apps).
 * Requires a one-time user action: select "Entire Screen" in the browser dialog.
 * After that, captures silently every 30 seconds with no further prompts.
 */

class ScreenshotService {
  constructor() {
    this.isCapturing = false;
    this.captureInterval = null;
    this.mediaStream = null;
    this.videoEl = null;
    this.intervalTime = 30 * 1000; // 30 seconds

    // Callbacks wired up by the component
    this.onCaptureSuccess = null; // (timestamp) => void
    this.onStreamEnded = null;    // () => void — called when user stops sharing
    this.onError = null;          // (errorType) => void — 'denied' | 'cancelled' | 'error'
  }

  /** Always supported in modern browsers */
  static isSupported() {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getDisplayMedia
    );
  }

  /**
   * Request full-screen share and start the capture loop.
   * MUST be called from a direct user gesture (button click).
   */
  async startCapture() {
    if (this.isCapturing) {
      console.log("⚠️ Already capturing");
      return;
    }

    try {
      // Ask browser for full screen — hint: prefer the entire monitor
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor", // Hints at full-screen; user can still choose anything
          cursor: "always",
          frameRate: { ideal: 1, max: 2 },
        },
        audio: false,
      });

      // Detect when user clicks "Stop sharing" in the browser's bottom bar
      const track = this.mediaStream.getVideoTracks()[0];
      track.addEventListener("ended", () => {
        console.log("🛑 User stopped screen sharing");
        this._cleanup();
        if (this.onStreamEnded) this.onStreamEnded();
      });

      // Create an off-screen video element to pull frames from
      this.videoEl = document.createElement("video");
      this.videoEl.srcObject = this.mediaStream;
      this.videoEl.muted = true;
      await this.videoEl.play();

      this.isCapturing = true;
      console.log("🚀 Full-screen capture started (every 30s)");

      // First capture after 3 seconds (give video time to stabilise)
      setTimeout(() => {
        if (this.isCapturing) this.captureScreenshot();
      }, 3000);

      // Recurring captures
      this.captureInterval = setInterval(() => {
        if (this.isCapturing) this.captureScreenshot();
      }, this.intervalTime);

    } catch (error) {
      console.error("❌ getDisplayMedia error:", error.name, error.message);

      if (error.name === "NotAllowedError") {
        // User clicked "Cancel" or "Don't Allow"
        if (this.onError) this.onError("cancelled");
      } else {
        if (this.onError) this.onError("error");
      }
      throw error;
    }
  }

  /** Stop the capture and release the stream */
  stopCapture() {
    console.log("🛑 Stopping screenshot capture");
    this._cleanup();
  }

  _cleanup() {
    this.isCapturing = false;

    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
      this.videoEl = null;
    }
  }

  /** Capture one frame from the live screen stream and upload it */
  async captureScreenshot() {
    if (!this.videoEl || !this.isCapturing) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = this.videoEl.videoWidth || 1920;
      canvas.height = this.videoEl.videoHeight || 1080;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.82)
      );

      if (!blob || blob.size < 1000) {
        console.warn("⚠️ Screenshot too small, skipping upload");
        return;
      }

      await this._upload(blob);
      console.log("✅ Screenshot uploaded");
      if (this.onCaptureSuccess) this.onCaptureSuccess(new Date());
    } catch (err) {
      console.error("❌ Capture error:", err);
    }
  }

  async _upload(blob) {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token");
      return;
    }

    const formData = new FormData();
    formData.append("screenshot", blob, `screenshot_${Date.now()}.jpg`);
    formData.append("timestamp", new Date().toISOString());
    formData.append("source", "browser"); // must match enum: browser | desktop | manual

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/screenshots/upload`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Upload failed:", res.status, text);
    }
  }

  getStatus() {
    return { isCapturing: this.isCapturing };
  }

  setCaptureInterval(seconds) {
    this.intervalTime = seconds * 1000;
    if (this.isCapturing) {
      this.stopCapture();
      setTimeout(() => this.startCapture(), 500);
    }
  }
}

const screenshotService = new ScreenshotService();

if (typeof window !== "undefined" && import.meta.env.DEV) {
  window.screenshotService = screenshotService;
}

export default screenshotService;
