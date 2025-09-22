// web-admin/components/dashboard/LiveNotifications.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

interface LiveNotificationsProps {
  onNewIncident?: (incident: any) => void;
}

interface LiveSession {
  id: string;
  name?: string;
  device?: { name?: string };
  streamUrl?: string;
  startedAt?: string;
  [k: string]: any;
}

const LiveNotifications: React.FC<LiveNotificationsProps> = ({ onNewIncident }) => {
  const { socket, connected } = useSocket();
  const [liveStreams, setLiveStreams] = useState<LiveSession[]>([]);

  // Handlers wrapped in useCallback so we can refer to the same function when removing listeners
  const handleNewIncident = useCallback((data: any) => {
    const { incident, mlResult } = data || {};
    const confidence =
      (incident && typeof incident.confidence === 'number'
        ? incident.confidence
        : mlResult && typeof mlResult.confidence === 'number'
        ? mlResult.confidence
        : undefined) ?? 0;

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">
                  {incident?.type === 'smoking'
                    ? '🚭'
                    : incident?.type === 'dress_code'
                    ? '👔'
                    : '⚠️'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New {incident?.type ? incident.type.replace('_', ' ') : 'incident'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Confidence: {(confidence * 100).toFixed(1)}%
                </p>
                {incident?.location && (
                  <p className="text-xs text-gray-400">Location: {incident.location}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Dismiss
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );

    if (onNewIncident && incident) {
      onNewIncident(incident);
    }
  }, [onNewIncident]);

  const handleLiveStarted = useCallback((data: any) => {
    const session = data?.session;
    if (!session || !session.id) return;

    setLiveStreams((prev) => {
      // avoid duplicates
      if (prev.some((s) => s.id === session.id)) return prev;
      return [...prev, session];
    });

    const deviceName = session?.device?.name || session?.name || 'unknown device';
    toast.success(`🔴 Live stream started from ${deviceName}`, { duration: 5000 });
  }, []);

  const handleLiveStopped = useCallback((data: any) => {
    const sessionId = data?.session?.id ?? data?.sessionId;
    if (!sessionId) return;

    setLiveStreams((prev) => prev.filter((s) => s.id !== sessionId));
    toast(`⏹️ Live stream ended`, { duration: 4000 });
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Join admin room for privileged notifications
    socket.emit('join_room', 'admin_room');

    // Register listeners
    socket.on('new_incident', handleNewIncident);
    socket.on('live_stream_started', handleLiveStarted);
    socket.on('live_stream_stopped', handleLiveStopped);

    // Clean up listeners & leave room on unmount
    return () => {
      socket.off('new_incident', handleNewIncident);
      socket.off('live_stream_started', handleLiveStarted);
      socket.off('live_stream_stopped', handleLiveStopped);
      socket.emit('leave_room', 'admin_room');
    };
  }, [socket, handleNewIncident, handleLiveStarted, handleLiveStopped]);

  // Optional: If socket disconnects, clear liveStreams (avoids stale UI)
  useEffect(() => {
    if (!connected) {
      setLiveStreams([]);
    }
  }, [connected]);

  const handleViewStream = (session: LiveSession) => {
    // try to open stream URL in new tab if available, otherwise notify admin
    const url = session.streamUrl || session.url || session.playbackUrl;
    if (url && typeof url === 'string') {
      window.open(url, '_blank');
      return;
    }

    // Fallback: emit an event requesting a viewer or show a toast
    if (socket && session.id) {
      socket.emit('request_stream_view', { sessionId: session.id });
      toast('Requested stream view from server...', { duration: 3000 });
      return;
    }

    toast.error('No stream URL available for this session.', { duration: 4000 });
  };

  return (
    <div>
      {/* Hidden component: this mostly drives toasts, but also shows active streams */}
      <div className="space-y-2">
        {liveStreams.length === 0 ? (
          <p className="text-sm text-gray-500">No live streams currently active.</p>
        ) : (
          liveStreams.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-white shadow px-3 py-2 rounded-md"
            >
              <div>
                <div className="text-sm font-medium">
                  {s.device?.name || s.name || 'Live session'}
                </div>
                {s.startedAt && (
                  <div className="text-xs text-gray-400">
                    Started: {new Date(s.startedAt).toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewStream(s)}
                  className="px-3 py-1 text-sm rounded-md border bg-indigo-50 hover:bg-indigo-100"
                >
                  View
                </button>
                <button
                  onClick={() => {
                    // locally remove and tell server to stop viewing (UI convenience)
                    setLiveStreams((prev) => prev.filter((x) => x.id !== s.id));
                    if (socket && s.id) {
                      socket.emit('admin_stop_viewing', { sessionId: s.id });
                    }
                  }}
                  className="px-3 py-1 text-sm rounded-md border bg-red-50 hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveNotifications;
