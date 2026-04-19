import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, Image, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LOGS = [
  {
    id: '1',
    time: '10:45 AM',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Ped_crossing_sign.jpg/240px-Ped_crossing_sign.jpg',
    tag: 'INFO',
    tagColor: '#1A56DB',
    tagBg: '#EFF6FF',
    title: 'Crosswalk and Pedestrians detected',
  },
  {
    id: '2',
    time: '10:30 AM',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80',
    tag: 'INFO',
    tagColor: '#1A56DB',
    tagBg: '#EFF6FF',
    title: 'Park bench - Safe to sit',
  },
  {
    id: '3',
    time: '09:15 AM',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80',
    tag: 'INFO',
    tagColor: '#1A56DB',
    tagBg: '#EFF6FF',
    title: 'Kitchen Table - Obstacle clear',
  },
  {
    id: '4',
    time: '08:45 AM',
    image: 'https://i.pravatar.cc/80?img=47',
    tag: 'INFO',
    tagColor: '#1A56DB',
    tagBg: '#EFF6FF',
    title: 'Face Recognized: Sarah (Caregiver)',
  },
  {
    id: '5',
    time: '08:30 AM',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Ped_crossing_sign.jpg/240px-Ped_crossing_sign.jpg',
    tag: 'WARNING',
    tagColor: '#D97706',
    tagBg: '#FFFBEB',
    title: 'Traffic Light: Red - Do not cross',
  },
];

export default function ActivityScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState(LOGS);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="bg-white pt-14 px-5 pb-4 border-b border-gray-200 flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-bold text-gray-900">Recent Events Logs</Text>
          <Text className="text-xs text-gray-500 mt-0.5">Real-time AI analysis feed</Text>
        </View>
        <Ionicons name="time-outline" size={24} color="#1A56DB" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1A56DB']}
          />
        }
      >
        <View className="pb-6">
          {logs.map((log) => (
            <View
              key={log.id}
              className="flex-row bg-white mx-4 mt-3 rounded-xl overflow-hidden border border-gray-200"
            >
              {/* Thumbnail */}
              <Image
                source={{ uri: log.image }}
                style={{ width: 80, height: 90 }}
                resizeMode="cover"
              />

              {/* Content */}
              <View className="flex-1 p-2.5">
                {/* Top row */}
                <View className="flex-row items-center mb-1">
                  <Text className="text-xs text-gray-400 mr-2">{log.time}</Text>
                  <View
                    className="px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: log.tagBg }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: log.tagColor }}
                    >
                      {log.tag}
                    </Text>
                  </View>
                  <View className="flex-1" />
                  <TouchableOpacity className="flex-row items-center">
                    <Ionicons name="send-outline" size={11} color="#9CA3AF" />
                    <Text className="text-xs text-gray-400 ml-0.5">Sent</Text>
                  </TouchableOpacity>
                </View>

                {/* Title */}
                <Text className="text-sm font-medium text-gray-900 leading-5">
                  {log.title}
                </Text>

                {/* View Details */}
                <TouchableOpacity className="flex-row items-center mt-2">
                  <Ionicons name="eye-outline" size={12} color="#6B7280" />
                  <Text className="text-xs text-gray-500 ml-1">View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}