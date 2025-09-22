// mobile-app/src/components/camera/LiveStreamView.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useCameraContext } from '../../context/CameraContext';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';

interface LiveStreamViewProps {
  onStreamEnd: () => void;
}

const LiveStreamView: React.FC<LiveStreamViewProps> = ({ onStreamEnd }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamSession, setStreamSession] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const { user } = useAuth();
  const { deviceInfo } = useCameraContext();
  const cameraRef = useRef<Camera>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize socket connection for live streaming
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
    socketRef.current = io(API_URL, {
      auth: {
        token: user?.token
      }
    });

    socketRef.current.on('stream_viewer_count', (count: number) => {
      setViewerCount(count);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const startLiveStream = async () => {
    try {
      setIsStreaming(true);
      
      // Start recording
      if (cameraRef.current) {
        const video = await cameraRef.current.recordAsync({
          quality: Camera.Constants.VideoQuality['720p'],
          maxDuration: 3600, // 1 hour max
        });
        
        // TODO: Implement actual streaming protocol (WebRTC, RTMP, etc.)
        // For now, we'll simulate with periodic frame captures
        
        setStreamSession({
          id: `stream_${Date.now()}`,
          startedAt: new Date(),
        });
      }
    } catch (error) {
      setIsStreaming(false);
      Alert.alert('Stream Error', 'Failed to start live stream');
    }
  };

  const stopLiveStream = () => {
    setIsStreaming(false);
    setStreamSession(null);
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
    onStreamEnd();
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        ratio="16:9"
      >
        <View style={styles.overlay}>
          {/* Stream Status Header */}
          <View style={styles.header}>
            {isStreaming && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
                <Text style={styles.viewerText}>👥 {viewerCount}</Text>
              </View>
            )}
          </View>

          {/* Stream Controls */}
          <View style={styles.controls}>
            {!isStreaming ? (
              <TouchableOpacity style={styles.startButton} onPress={startLiveStream}>
                <MaterialIcons name="videocam" size={32} color="white" />
                <Text style={styles.buttonText}>Start Live Stream</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopButton} onPress={stopLiveStream}>
                <MaterialIcons name="stop" size={32} color="white" />
                <Text style={styles.buttonText}>Stop Stream</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Stream Info */}
          {isStreaming && streamSession && (
            <View style={styles.streamInfo}>
              <Text style={styles.streamText}>
                🔴 Streaming to Admin Panel
              </Text>
              <Text style={styles.streamText}>
                Duration: {Math.floor((Date.now() - new Date(streamSession.startedAt).getTime()) / 1000)}s
              </Text>
            </View>
          )}
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    padding: 20,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  viewerText: {
    color: 'white',
    fontSize: 12,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b7280',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  streamInfo: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    alignItems: 'center',
  },
  streamText: {
    color: 'white',
    fontSize: 12,
    marginVertical: 2,
  },
});

export default LiveStreamView;