import React, { useEffect, useRef, useState } from 'react';
import { PlayIcon, StopIcon } from '@heroicons/react/24/solid';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

interface LiveStreamVideoProps {
  cameraId?: string;
  className?: string;
}

interface StreamData {
  sessionId: string;
  frame: string;
  timestamp: number;
  cameraId?: string;
}

const LiveStreamVideo: React.FC<LiveStreamVideoProps> = ({ 
  cameraId = 'default',
  className = '' 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [streamStatus, setStreamStatus] = useState<'idle' | 'connecting' | 'streaming' | 'error'>('idle');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socket } = useSocket();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to live stream
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      setStreamStatus('connecting');
      // Join camera stream room
      socket.emit('join_stream', { cameraId });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setStreamStatus('error');
      setCurrentFrame(null);
    };

    const handleStreamFrame = (data: StreamData) => {
      if (data.cameraId === cameraId || !data.cameraId) {
        setCurrentFrame(data.frame);
        setLastUpdate(Date.now());
        setStreamStatus('streaming');
      }
    };

    const handleViewerCount = (data: { cameraId: string; count: number }) => {
      if (data.cameraId === cameraId) {
        setViewerCount(data.count);
      }
    };

    const handleStreamError = (error: { message: string }) => {
      setStreamStatus('error');
      toast.error(`Stream error: ${error.message}`);
    };

    // Socket event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('stream_frame', handleStreamFrame);
    socket.on('stream_viewer_count', handleViewerCount);
    socket.on('stream_error', handleStreamError);

    // Initial connection check
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('stream_frame', handleStreamFrame);
      socket.off('stream_viewer_count', handleViewerCount);
      socket.off('stream_error', handleStreamError);
      
      // Leave stream room
      socket.emit('leave_stream', { cameraId });
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [socket, cameraId]);

  // Render frame to canvas
  useEffect(() => {
    if (!currentFrame || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate aspect ratio and draw
      const aspectRatio = img.width / img.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.width / aspectRatio;
      
      if (drawHeight > canvas.height) {
        drawHeight = canvas.height;
        drawWidth = canvas.height * aspectRatio;
      }
      
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    };
    
    img.src = `data:image/jpeg;base64,${currentFrame}`;
  }, [currentFrame]);

  // Auto-reconnect logic
  useEffect(() => {
    if (streamStatus === 'error' && socket) {
      reconnectTimeoutRef.current = setTimeout(() => {
        if (socket.connected) {
          socket.emit('join_stream', { cameraId });
          setStreamStatus('connecting');
        }
      }, 3000);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [streamStatus, socket, cameraId]);

  const handleManualReconnect = () => {
    if (!socket) return;
    
    setStreamStatus('connecting');
    socket.emit('join_stream', { cameraId });
    toast.loading('Reconnecting to stream...', { id: 'reconnect' });
  };

  const getStatusColor = () => {
    switch (streamStatus) {
      case 'streaming': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (streamStatus) {
      case 'streaming': return 'LIVE';
      case 'connecting': return 'CONNECTING';
      case 'error': return 'ERROR';
      default: return 'OFFLINE';
    }
  };

  const isStreamActive = Date.now() - lastUpdate < 5000; // Consider active if updated in last 5s

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Video Canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        className="w-full h-full object-contain"
        style={{ aspectRatio: '16/9' }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Status Indicator */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className={`flex items-center space-x-2 bg-black bg-opacity-70 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            <div className={`w-2 h-2 rounded-full ${streamStatus === 'streaming' && isStreamActive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            <span>{getStatusText()}</span>
          </div>
          
          {streamStatus === 'streaming' && (
            <div className="bg-black bg-opacity-70 px-3 py-1 rounded-full text-sm text-white">
              👥 {viewerCount}
            </div>
          )}
        </div>

        {/* Camera Info */}
        <div className="absolute top-4 right-4">
          <div className="bg-black bg-opacity-70 px-3 py-1 rounded-full text-sm text-white">
            Camera: {cameraId}
          </div>
        </div>

        {/* Error State */}
        {streamStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white">
              <StopIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg font-medium mb-2">Stream Unavailable</p>
              <p className="text-sm text-gray-300 mb-4">Unable to connect to camera feed</p>
              <button
                onClick={handleManualReconnect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors pointer-events-auto"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {streamStatus === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium">Connecting to stream...</p>
            </div>
          </div>
        )}

        {/* No Frame State */}
        {streamStatus === 'streaming' && !currentFrame && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white">
              <PlayIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Waiting for video feed...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Stream Info Footer */}
      {streamStatus === 'streaming' && currentFrame && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="text-white text-xs opacity-75">
            Last update: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamVideo;