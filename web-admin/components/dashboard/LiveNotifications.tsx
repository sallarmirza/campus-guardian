// web-admin/components/dashboard/LiveNotifications.tsx
import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

interface LiveNotificationsProps {
  onNewIncident?: (incident: any) => void;
}

const LiveNotifications: React.FC<LiveNotificationsProps> = ({ onNewIncident }) => {
  const { socket, connected } = useSocket();
  const [liveStreams, setLiveStreams] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Join admin room for privileged notifications
    socket.emit('join_room', 'admin_room');

    // Listen for new incidents
    socket.on('new_incident', (data) => {
      const { incident, mlResult } = data;
      
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">
                  {incident.type === 'smoking' ? '🚭' : incident.type === 'dress_code' ? '👔' : '⚠️'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New {incident.type.replace('_', ' ')} incident
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Confidence: {(incident.confidence * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">
                  Location: {incident.location}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              View
            </button>
          </div>
        </div>
      ), {
        duration: 8000,
      });

      if (onNewIncident) {
        onNewIncident(incident);
      }
    });

    // Listen for live stream events
    socket.on('live_stream_started', (data) => {
      setLiveStreams(prev => [...prev, data.session]);
      
      toast.success(
        `🔴 Live stream started from ${data.device.name}`,
        { duration: 5