/**
 * Browser-based Screenshot Capture Service
 * Captures screenshots using Screen Capture API without desktop app
 */

class ScreenshotService {
  constructor() {
    this.isCapturing = false;
    this.captureInterval = null;
    this.mediaStream = null;
    this.intervalTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.canvas = null;
    this.video = null;
  }

  /**
   * Initialize screenshot capture
   * Requests screen sharing permission from user
   */
  async initialize() {
    try {
      console.log("🖥️ Initializing browser screenshot capture...");

      // Request screen capture permission
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: "screen",
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
        },
        audio: false,
      });

      // Create video element to capture frames
      this.video = document.createElement("video");
      this.video.srcObject = this.mediaStream;
      this.video.autoplay = true;
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.style.display = "none";
      document.body.appendChild(this.video);

      // Create canvas for screenshot processing
      this.canvas = document.createElement("canvas");
      this.canvas.style.display = "none";
      document.body.appendChild(this.canvas);

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        this.video.onloadedmetadata = () => {
          console.log("📹 Video metadata loaded:", {
            videoWidth: this.video.videoWidth,
            videoHeight: this.video.videoHeight,
            readyState: this.video.readyState,
          });
          resolve();
        };

        this.video.onerror = (error) => {
          console.error("❌ Video error:", error);
          reject(new Error("Failed to load video stream"));
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.video.readyState < 2) {
            reject(new Error("Video loading timeout"));
          }
        }, 10000);
      });

      console.log("✅ Screenshot capture initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize screenshot capture:", error);
      throw new Error("Screen capture permission denied or not supported");
    }
  }

  /**
   * Start automatic screenshot capture
   * Captures screenshots every 5 minutes
   */
  async startCapture() {
    if (this.isCapturing) {
      console.log("⚠️ Screenshot capture already running");
      return;
    }

    try {
      // Initialize if not already done
      if (!this.mediaStream) {
        await this.initialize();
      }

      this.isCapturing = true;
      console.log("🚀 Starting automatic screenshot capture (every 5 minutes)");

      // Take first screenshot after 30 seconds
      setTimeout(() => {
        this.captureScreenshot();
      }, 30000);

      // Set up interval for regular captures
      this.captureInterval = setInterval(() => {
        this.captureScreenshot();
      }, this.intervalTime);

      // Handle stream end (user stops sharing)
      this.mediaStream.getVideoTracks()[0].addEventListener("ended", () => {
        console.log("🛑 Screen sharing stopped by user");
        this.stopCapture();
      });
    } catch (error) {
      console.error("❌ Failed to start screenshot capture:", error);
      this.isCapturing = false;
      throw error;
    }
  }

  /**
   * Stop screenshot capture
   */
  stopCapture() {
    console.log("🛑 Stopping screenshot capture");

    this.isCapturing = false;

    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.video) {
      this.video.remove();
      this.video = null;
    }

    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
  }

  /**
   * Capture a single screenshot
   */
  async captureScreenshot() {
    if (!this.video || !this.canvas) {
      console.log("⚠️ Screenshot capture not properly initialized");
      return;
    }

    try {
      console.log("📸 Capturing screenshot...");

      // Check video state
      console.log("📹 Video state:", {
        readyState: this.video.readyState,
        videoWidth: this.video.videoWidth,
        videoHeight: this.video.videoHeight,
        paused: this.video.paused,
        ended: this.video.ended,
      });

      // Ensure video is playing and ready
      if (this.video.readyState < 2) {
        console.log("⏳ Video not ready, waiting...");
        await new Promise((resolve) => {
          const checkReady = () => {
            if (this.video.readyState >= 2) {
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
      }

      // Ensure video has valid dimensions
      if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
        console.error("❌ Video has invalid dimensions");
        return;
      }

      // Set canvas size to match video
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;

      console.log("🎨 Canvas size set to:", {
        width: this.canvas.width,
        height: this.canvas.height,
      });

      // Draw video frame to canvas
      const ctx = this.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      // Check if canvas has content
      const imageData = ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      const hasContent = imageData.data.some((pixel) => pixel !== 0);

      if (!hasContent) {
        console.error("❌ Canvas appears to be empty (all black)");
        return;
      }

      console.log("✅ Canvas has content, creating blob...");

      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        this.canvas.toBlob(resolve, "image/jpeg", 0.8);
      });

      if (blob && blob.size > 0) {
        console.log("📦 Blob created:", {
          size: blob.size,
          type: blob.type,
        });
        await this.uploadScreenshot(blob);
        console.log("✅ Screenshot captured and uploaded successfully");
      } else {
        console.error("❌ Failed to create screenshot blob or blob is empty");
      }
    } catch (error) {
      console.error("❌ Error capturing screenshot:", error);
    }
  }

  /**
   * Upload screenshot to server
   */
  async uploadScreenshot(blob) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found");
        return;
      }

      const formData = new FormData();
      formData.append("screenshot", blob, `screenshot_${Date.now()}.jpg`);
      formData.append("timestamp", new Date().toISOString());
      formData.append("source", "browser");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/screenshots/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("📤 Screenshot uploaded:", result);
      } else {
        console.error("❌ Failed to upload screenshot:", response.statusText);
      }
    } catch (error) {
      console.error("❌ Error uploading screenshot:", error);
    }
  }

  /**
   * Check if browser supports screen capture
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }

  /**
   * Get capture status
   */
  getStatus() {
    return {
      isCapturing: this.isCapturing,
      isInitialized: !!this.mediaStream,
      isSupported: ScreenshotService.isSupported(),
    };
  }

  /**
   * Set capture interval (in minutes)
   */
  setCaptureInterval(minutes) {
    this.intervalTime = minutes * 60 * 1000;

    if (this.isCapturing) {
      // Restart with new interval
      this.stopCapture();
      setTimeout(() => this.startCapture(), 1000);
    }
  }

  /**
   * Test screenshot capture (for debugging)
   * This method can be called from browser console
   */
  async testCapture() {
    try {
      console.log("🧪 Testing screenshot capture...");

      if (!this.mediaStream) {
        console.log("🔧 Initializing for test...");
        await this.initialize();
      }

      await this.captureScreenshot();
      console.log("🧪 Test capture completed");
    } catch (error) {
      console.error("🧪 Test capture failed:", error);
    }
  }
}

// Create singleton instance
const screenshotService = new ScreenshotService();

// Expose for debugging in development
if (typeof window !== "undefined" && import.meta.env.DEV) {
  window.screenshotService = screenshotService;
  console.log(
    "🔧 Screenshot service exposed as window.screenshotService for debugging"
  );
}

export default screenshotService;
