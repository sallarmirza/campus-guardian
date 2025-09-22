// mobile-app/src/screens/HomeScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { incidentService } from '../services/incident';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  
  const { data: recentIncidents, isLoading, refetch } = useQuery({
    queryKey: ['incidents', 'recent'],
    queryFn: () => incidentService.getMyIncidents({ limit: 5 }),
    refetchInterval: 30000,
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  const stats = {
    todayReports: recentIncidents?.filter(incident => {
      const today = new Date().toDateString();
      return new Date(incident.createdAt).toDateString() === today;
    }).length || 0,
    totalReports: recentIncidents?.length || 0,
    pendingReports: recentIncidents?.filter(incident => 
      incident.status === 'pending'
    ).length || 0
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.todayReports}</Text>
          <Text style={styles.statLabel}>Today's Reports</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalReports}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pendingReports}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.actionIcon}>📹</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Start Camera Monitoring</Text>
            <Text style={styles.actionSubtitle}>Monitor for violations in real-time</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Incidents')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View My Reports</Text>
            <Text style={styles.actionSubtitle}>Check status of submitted incidents</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionSubtitle}>Configure app preferences</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {isLoading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : recentIncidents && recentIncidents.length > 0 ? (
          recentIncidents.slice(0, 3).map((incident) => (
            <View key={incident.id} style={styles.incidentCard}>
              <View style={styles.incidentHeader}>
                <Text style={styles.incidentType}>
                  {incident.type === 'smoking' ? '🚭' : incident.type === 'dress_code' ? '👔' : '⚠️'}
                  {' '}{incident.type.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={[
                  styles.incidentStatus,
                  { color: incident.status === 'pending' ? '#F59E0B' : 
                           incident.status === 'verified' ? '#EF4444' : '#10B981' }
                ]}>
                  {incident.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.incidentLocation}>{incident.location}</Text>
              <Text style={styles.incidentTime}>
                {new Date(incident.createdAt).toLocaleDateString()} at{' '}
                {new Date(incident.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent activity</Text>
            <Text style={styles.emptyStateSubtext}>Start monitoring to create reports</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  roleText: {
    color: '#93C5FD',
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
  },
  recentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  incidentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incidentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  incidentStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  incidentLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  incidentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default HomeScreen;