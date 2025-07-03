import { useState, useRef } from 'react';
import screenshotService from '../services/screenshotService';

/**
 * Screenshot Debug Component
 * Helps debug screenshot capture issues
 */
const ScreenshotDebug = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [testImage, setTestImage] = useState(null);
  const canvasRef = useRef(null);

  /**
   * Test screen capture initialization
   */
  const testInitialization = async () => {
    try {
      console.log('🧪 Testing initialization...');
      await screenshotService.initialize();
      
      const status = screenshotService.getStatus();
      setDebugInfo({
        ...status,
        message: 'Initialization successful',
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setDebugInfo({
        error: error.message,
        message: 'Initialization failed',
        timestamp: new Date().toLocaleString()
      });
    }
  };

  /**
   * Test manual screenshot capture
   */
  const testCapture = async () => {
    try {
      console.log('🧪 Testing capture...');
      
      if (!screenshotService.mediaStream) {
        await screenshotService.initialize();
      }

      // Get the video element from the service
      const video = screenshotService.video;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        throw new Error('Video or canvas not available');
      }

      // Set canvas size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Convert to blob and create URL for preview
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setTestImage(imageUrl);
        
        setDebugInfo({
          message: 'Capture successful',
          blobSize: blob.size,
          canvasSize: `${canvas.width}x${canvas.height}`,
          videoSize: `${video.videoWidth}x${video.videoHeight}`,
          videoState: video.readyState,
          timestamp: new Date().toLocaleString()
        });
      } else {
        throw new Error('Failed to create blob');
      }

    } catch (error) {
      setDebugInfo({
        error: error.message,
        message: 'Capture failed',
        timestamp: new Date().toLocaleString()
      });
    }
  };

  /**
   * Test full service capture
   */
  const testServiceCapture = async () => {
    try {
      console.log('🧪 Testing service capture...');
      await screenshotService.testCapture();
      
      setDebugInfo({
        message: 'Service capture test completed - check console for details',
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setDebugInfo({
        error: error.message,
        message: 'Service capture test failed',
        timestamp: new Date().toLocaleString()
      });
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      margin: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔧 Screenshot Debug Tools</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testInitialization}
          style={{ 
            padding: '10px 15px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Initialization
        </button>
        
        <button 
          onClick={testCapture}
          style={{ 
            padding: '10px 15px', 
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Manual Capture
        </button>
        
        <button 
          onClick={testServiceCapture}
          style={{ 
            padding: '10px 15px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Service Capture
        </button>
      </div>

      {debugInfo && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: debugInfo.error ? '#f8d7da' : '#d4edda',
          border: `1px solid ${debugInfo.error ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h4>Debug Info:</h4>
          <pre style={{ fontSize: '12px', margin: 0 }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {testImage && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Test Screenshot:</h4>
          <img 
            src={testImage} 
            alt="Test screenshot" 
            style={{ 
              maxWidth: '400px', 
              maxHeight: '300px',
              border: '1px solid #ccc'
            }} 
          />
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Click "Test Initialization" to request screen sharing permission</li>
          <li>Select the screen/window you want to capture</li>
          <li>Click "Test Manual Capture" to see if the capture works</li>
          <li>Check the browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default ScreenshotDebug;
