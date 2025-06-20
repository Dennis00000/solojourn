import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  Animated,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  Audio,
  Video,
  ResizeMode
} from 'expo-av';
import { RecordingOptionsPresets } from 'expo-av/build/Audio/RecordingConstants';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

type Message = {
  id: string;
  text: string;
  fromMe: boolean;
  reactions?: { emoji: string; userId: string }[];
  replyTo?: { id: string; text: string; fromMe: boolean };
};
type Thread = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  pending: boolean;
  muted?: boolean;
  messages: Message[];
  group?: {
    name: string;
    photo: string;
    members: { id: string; name: string; avatar: string }[];
  };
  pinned?: boolean;
  category: 'primary' | 'general' | 'group';
  active?: boolean;
};

export default function MessagesScreen() {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messageText, setMessageText] = useState('');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [groupInfoVisible, setGroupInfoVisible] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([
  {
    id: '1',
      name: 'Emma Chen',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      lastMessage: 'See you at the cafe tomorrow!',
      time: '2m ago',
      unread: true,
      pending: false,
      muted: false,
      messages: [
        { id: 'm1', text: 'Hey! Are we still on for tomorrow?', fromMe: false },
        { id: 'm2', text: 'Yes! See you at the cafe at 10am.', fromMe: true },
        { id: 'm3', text: 'See you at the cafe tomorrow!', fromMe: false },
      ],
      category: 'primary',
      active: true,
  },
  {
    id: '2',
      name: 'Marcus Silva',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      lastMessage: 'Thanks for the travel tips!',
      time: '1h ago',
      unread: false,
      pending: false,
      messages: [
        { id: 'm1', text: 'Thanks for the travel tips!', fromMe: false },
        { id: 'm2', text: "You're welcome! Let me know if you need more info.", fromMe: true },
      ],
      category: 'primary',
    },
    // Example pending request
  {
    id: '3',
      name: 'New User',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      lastMessage: 'Hi! Can we connect?',
      time: '5m ago',
      unread: true,
      pending: true,
      messages: [
        { id: 'm1', text: 'Hi! Can we connect?', fromMe: false },
      ],
      category: 'primary',
    },
    // Example group chat
  {
    id: '4',
      name: 'Travel Buddies',
      avatar: 'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      lastMessage: "Let's plan our next trip! 🌍",
      time: '10m ago',
      unread: true,
      pending: false,
      messages: [
        { id: 'm1', text: "Let's plan our next trip! 🌍", fromMe: false },
        { id: 'm2', text: "I'm in! Where to?", fromMe: true },
      ],
      group: {
        name: 'Travel Buddies',
        photo: 'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        members: [
          { id: '1', name: 'Emma Chen', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
          { id: '2', name: 'Marcus Silva', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
          { id: 'me', name: 'You', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
        ],
      },
      category: 'group',
      active: true,
    },
  ]);

  const [reactionModal, setReactionModal] = useState<{ visible: boolean; messageId: string | null }>({ visible: false, messageId: null });
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showRequests, setShowRequests] = useState(false);
  const [tab, setTab] = useState<'primary' | 'general' | 'group'>('primary');
  const [search, setSearch] = useState('');
  const [showRequestsPage, setShowRequestsPage] = useState(false);
  const [createForumVisible, setCreateForumVisible] = useState(false);
  const [newForumMessage, setNewForumMessage] = useState('');
  const [forumThreads, setForumThreads] = useState<any[]>([]); // Replace with your thread/message type
  const [editForumModalVisible, setEditForumModalVisible] = useState(false);
  const [editForumMessage, setEditForumMessage] = useState('');
  const [editForumId, setEditForumId] = useState<string | null>(null);
  const [deleteForumId, setDeleteForumId] = useState<string | null>(null);
  const [actionSheetForumId, setActionSheetForumId] = useState<string | null>(null);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyToThreadId, setReplyToThreadId] = useState<string | null>(null);

  const handleSend = () => {
    if (!messageText.trim() || !selectedThread) return;
    selectedThread.messages.push({
      id: Date.now().toString(),
      text: messageText,
      fromMe: true,
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, fromMe: replyingTo.fromMe } : undefined,
    });
    setMessageText('');
    setReplyingTo(null);
  };

  function handlePickImage() {
    (async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (selectedThread) {
          selectedThread.messages.push({
            id: Date.now().toString(),
            text: asset.uri,
            fromMe: true,
          });
          setMessageText('');
          setSelectedThread({ ...selectedThread });
        }
      }
    })();
  }

  function handleTakePhoto() {
    (async () => {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (selectedThread) {
          selectedThread.messages.push({
            id: Date.now().toString(),
            text: asset.uri,
            fromMe: true,
          });
          setMessageText('');
          setSelectedThread({ ...selectedThread });
        }
      }
    })();
  }

  function handleRecordVoice() {
    if (recording) {
      (async () => {
        try {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          setRecording(null);
          if (uri && selectedThread) {
            selectedThread.messages.push({
              id: Date.now().toString(),
              text: uri,
              fromMe: true,
            });
            setSelectedThread({ ...selectedThread });
          }
        } catch (e) {
          setRecording(null);
        }
      })();
    } else {
      (async () => {
        try {
          const { status } = await Audio.requestPermissionsAsync();
          if (status !== 'granted') return;
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const rec = new Audio.Recording();
          await rec.prepareToRecordAsync(RecordingOptionsPresets.HIGH_QUALITY);
          await rec.startAsync();
          setRecording(rec);
        } catch (e) {
          setRecording(null);
        }
      })();
    }
  }

  const handleLongPressMessage = (msg: Message) => {
    setReactionModal({ visible: true, messageId: msg.id });
  };

  const requestThreads = threads.filter(t => t.pending);

  const filteredThreads = threads.filter(t => !t.pending && t.category === tab && (t.name.toLowerCase().includes(search.toLowerCase()) || t.lastMessage.toLowerCase().includes(search.toLowerCase())));

  if (showRequestsPage) {
    return <RequestsScreen
      requests={requestThreads}
      onAccept={id => setThreads(ts => ts.map(t => t.id === id ? { ...t, pending: false } : t))}
      onDecline={id => setThreads(ts => ts.filter(t => t.id !== id))}
      onBack={() => setShowRequestsPage(false)}
    />;
  }

  if (!selectedThread) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#0EA5E9" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.headerTitle}>Messages</Text>
            </View>
          <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => setCreateForumVisible(true)}>
            <Ionicons name="add-circle" size={28} color="#0EA5E9" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, backgroundColor: '#fff' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, height: 36 }}>
              <Ionicons name="search" size={18} color="#64748B" style={{ marginRight: 6 }} />
              <TextInput
                placeholder="Search"
                placeholderTextColor="#A0AEC0"
                style={{ flex: 1, fontSize: 15, color: '#1F2937' }}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowRequestsPage(true)} style={{ padding: 4 }}>
            <Text style={{ color: '#0EA5E9', fontWeight: '700', fontSize: 15 }}>{requestThreads.length > 0 ? `${requestThreads.length} request${requestThreads.length > 1 ? 's' : ''}` : 'Requests'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 2 }}>
          {['primary', 'general', 'group'].map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t as 'primary' | 'general' | 'group')}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: tab === t ? '#0EA5E9' : 'transparent' }}
            >
              <Text style={{ fontWeight: tab === t ? '700' : '600', color: tab === t ? '#1F2937' : '#64748B', fontSize: 16 }}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView style={styles.threadsList} contentContainerStyle={{ padding: 0, paddingTop: 8 }}>
          {filteredThreads.map(thread => (
            <TouchableOpacity
              key={thread.id}
              style={styles.threadItem}
              onPress={() => setSelectedThread(thread)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ position: 'relative', marginRight: 12 }}>
                  <Image source={{ uri: thread.avatar }} style={styles.avatar} />
                  {thread.active && (
                    <View style={{ position: 'absolute', bottom: 2, left: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff' }} />
                  )}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontWeight: '700', fontSize: 16, color: '#1F2937' }} numberOfLines={1}>{thread.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    {thread.active && <Text style={{ color: '#22C55E', fontWeight: '600', fontSize: 13, marginRight: 6 }}>Active now</Text>}
                    <Text style={{ color: '#64748B', fontSize: 14, flexShrink: 1 }} numberOfLines={1}>{thread.lastMessage}</Text>
            </View>
          </View>
                <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                  <Text style={{ color: '#A0AEC0', fontSize: 13, fontWeight: '500', marginBottom: 2 }}>{thread.time}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {thread.unread && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#0EA5E9', marginRight: 8 }} />}
                    <Ionicons name="camera-outline" size={22} color="#A0AEC0" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
          ))}
          {filteredThreads.length === 0 && (
            <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 32 }}>No messages yet.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedThread(null)} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0EA5E9" />
        </TouchableOpacity>
        {/* Group or user avatar */}
        <Image source={{ uri: selectedThread.group ? selectedThread.group.photo : selectedThread.avatar }} style={styles.avatar} />
        <Text style={styles.headerTitle}>{selectedThread.group ? selectedThread.group.name : selectedThread.name}</Text>
        {/* Mute/unmute button */}
        <TouchableOpacity
          onPress={() => {
            setThreads(ts => ts.map(t => t.id === selectedThread.id ? { ...t, muted: !t.muted } : t));
            Alert.alert(selectedThread.muted ? 'Unmuted' : 'Muted', `You have ${selectedThread.muted ? 'unmuted' : 'muted'} this chat.`);
            setSelectedThread(Object.assign({}, selectedThread, { muted: !selectedThread.muted }));
          }}
          style={{ padding: 6 }}
        >
          <Ionicons name={selectedThread.muted ? 'notifications-off-outline' : 'notifications-outline'} size={24} color={selectedThread.muted ? '#64748B' : '#0EA5E9'} />
        </TouchableOpacity>
        {/* Group info button if group */}
        {selectedThread.group && (
          <TouchableOpacity onPress={() => setGroupInfoVisible(true)} style={{ padding: 6 }}>
            <Ionicons name="people-outline" size={24} color="#0EA5E9" />
          </TouchableOpacity>
        )}
        {/* Call & Video Call Buttons */}
        <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 8 }}>
          <TouchableOpacity onPress={() => Alert.alert('Call', 'Voice call feature coming soon!')} style={{ padding: 6 }}>
            <Ionicons name="call-outline" size={24} color="#0EA5E9" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Video Call', 'Video call feature coming soon!')} style={{ padding: 6 }}>
            <Ionicons name="videocam-outline" size={24} color="#0EA5E9" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.chatContainer} contentContainerStyle={{ padding: 20 }}>
        {selectedThread.messages.map(msg => {
          const isImage = /\.(jpg|jpeg|png|gif)$/i.test(msg.text);
          const isVideo = /\.(mp4|mov|avi|webm)$/i.test(msg.text);
          const isAudio = /\.(m4a|aac|mp3|wav|caf)$/i.test(msg.text) || msg.text.startsWith('file://') && msg.text.includes('recording');
          return (
            <Pressable key={msg.id} onLongPress={() => handleLongPressMessage(msg)}>
              <View style={msg.fromMe ? styles.myMessageBubble : styles.theirMessageBubble}>
                {isImage ? (
                  <Image source={{ uri: msg.text }} style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 4 }} resizeMode="cover" />
                ) : isVideo ? (
                  <TouchableOpacity onPress={() => setPlayingVideoId(playingVideoId === msg.id ? null : msg.id)}>
                    {playingVideoId === msg.id ? (
                      <Video
                        source={{ uri: msg.text }}
                        style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 4 }}
                        useNativeControls
                        resizeMode={ResizeMode.COVER}
                        shouldPlay
                        isLooping
                      />
                    ) : (
                      <View style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 4, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="play-circle" size={48} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ) : isAudio ? (
                  <TouchableOpacity onPress={async () => {
                    if (playingAudioId === msg.id) {
                      setPlayingAudioId(null);
                      return;
                    }
                    setPlayingAudioId(msg.id);
                    const { sound } = await Audio.Sound.createAsync({ uri: msg.text });
                    await sound.playAsync();
                    sound.setOnPlaybackStatusUpdate(status => {
                      if (!status.isLoaded || status.didJustFinish) {
                        setPlayingAudioId(null);
                        sound.unloadAsync();
                      }
                    });
                  }} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name={playingAudioId === msg.id ? 'pause-circle' : 'play-circle'} size={40} color="#0EA5E9" />
                    <Text style={{ marginLeft: 8, color: '#374151', fontWeight: '500' }}>Voice Note</Text>
                  </TouchableOpacity>
                ) : null}
                <Text style={msg.fromMe ? styles.myMessageText : styles.theirMessageText}>{(!isImage && !isVideo && !isAudio) ? msg.text : ''}</Text>
                {/* Render reactions if any */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center', alignSelf: msg.fromMe ? 'flex-end' : 'flex-start', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
                    {msg.reactions.map((r, i) => (
                      <Text key={i} style={{ fontSize: 16, marginRight: 2 }}>{r.emoji}</Text>
                    ))}
                  </View>
                )}
                {msg.replyTo && (
                  <View style={{ backgroundColor: '#E0E7EF', borderRadius: 8, padding: 6, marginBottom: 4 }}>
                    <Text style={{ color: '#0EA5E9', fontWeight: '600', fontSize: 12 }}>{msg.replyTo.fromMe ? 'You' : selectedThread?.name}</Text>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>{msg.replyTo.text}</Text>
                  </View>
                )}
                {selectedThread && selectedThread.messages[selectedThread.messages.length-1]?.fromMe && msg.id === selectedThread.messages[selectedThread.messages.length-1].id && (
                  <Text style={{ color: '#0EA5E9', fontSize: 12, marginTop: 2, alignSelf: 'flex-end' }}>Seen</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.inputIcon} onPress={handlePickImage}>
          <Ionicons name="image-outline" size={24} color="#0EA5E9" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.inputIcon} onPress={handleTakePhoto}>
          <Ionicons name="camera-outline" size={24} color="#0EA5E9" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.inputIcon} onPress={handleRecordVoice}>
          <Ionicons name={recording ? "stop-circle" : "mic-outline"} size={24} color={recording ? "#EF4444" : "#0EA5E9"} />
        </TouchableOpacity>
        {replyingTo && (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 10, marginHorizontal: 10, marginBottom: 4, padding: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#0EA5E9', fontWeight: '600', fontSize: 13 }}>Replying to {replyingTo.fromMe ? 'yourself' : selectedThread?.name}</Text>
              <Text numberOfLines={1} style={{ color: '#64748B', fontSize: 13 }}>{replyingTo.text}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)} style={{ marginLeft: 8, padding: 4 }}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
        />
        {messageText.trim().length > 0 && (
          <TouchableOpacity
            onPress={handleSend}
            style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#0EA5E9', fontWeight: '700', fontSize: 18 }}>Send</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Group Info Modal */}
      {selectedThread.group && (
        <Modal visible={groupInfoVisible} animationType="slide" transparent onRequestClose={() => setGroupInfoVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '85%' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' }}>{selectedThread.group.name}</Text>
              <Image source={{ uri: selectedThread.group.photo }} style={{ width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 16 }} />
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Members:</Text>
              {selectedThread.group.members.map(m => (
                <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Image source={{ uri: m.avatar }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} />
                  <Text style={{ fontSize: 16 }}>{m.name}</Text>
                  {/* Remove button for others, leave for self */}
                  {m.id !== 'me' ? (
                    <TouchableOpacity style={{ marginLeft: 'auto', padding: 4 }} onPress={() => Alert.alert('Remove', `Remove ${m.name} (mock)`)}>
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={{ marginLeft: 'auto', padding: 4 }} onPress={() => Alert.alert('Leave Group', 'Leave group (mock)')}>
                      <Ionicons name="log-out-outline" size={20} color="#0EA5E9" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={{ marginTop: 16, backgroundColor: '#0EA5E9', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }} onPress={() => Alert.alert('Add Member', 'Add member (mock)')}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Add Member</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setGroupInfoVisible(false)}>
                <Text style={{ color: '#64748B', fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>
            </View>
        </View>
        </Modal>
      )}
      {/* Emoji Reaction Modal */}
      <Modal visible={reactionModal.visible} transparent animationType="fade" onRequestClose={() => setReactionModal({ visible: false, messageId: null })}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setReactionModal({ visible: false, messageId: null })}>
          <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 6 }}>
            {["❤️","😂","😮","😢","👍","👎"].map(emoji => (
              <Pressable
                key={emoji}
                onPress={() => {
                  setThreads(ts => ts.map(t => {
                    if (!selectedThread || t.id !== selectedThread.id) return t;
                    return {
                      ...t,
                      messages: t.messages.map(m => {
                        if (m.id !== reactionModal.messageId) return m;
                        // Only one reaction per user (mock userId: 'me')
                        const filtered = (m.reactions || []).filter(r => r.userId !== 'me');
                        return { ...m, reactions: [...filtered, { emoji, userId: 'me' }] };
                      })
                    };
                  }));
                  setReactionModal({ visible: false, messageId: null });
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, marginHorizontal: 6 })}
              >
                <Text style={{ fontSize: 28 }}>{emoji}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                const msg = selectedThread?.messages.find(m => m.id === reactionModal.messageId);
                if (msg) setReplyingTo(msg);
                setReactionModal({ visible: false, messageId: null });
              }}
              style={{ marginLeft: 16, justifyContent: 'center' }}
            >
              <Text style={{ color: '#0EA5E9', fontWeight: '700', fontSize: 16 }}>Reply</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      {/* Create Forum Modal */}
      <Modal
        visible={createForumVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateForumVisible(false)}
      >
        <Pressable style={styles.createForumOverlay} onPress={() => setCreateForumVisible(false)} />
        <View style={styles.createForumModal}>
          <Text style={styles.createForumTitle}>New Forum Post</Text>
          <TextInput
            style={styles.createForumInput}
            placeholder="Start a new thread..."
            value={newForumMessage}
            onChangeText={setNewForumMessage}
            multiline
          />
          <TouchableOpacity
            style={styles.createForumButton}
            onPress={() => {
              if (!newForumMessage.trim()) return;
              setForumThreads([
                {
                  id: Date.now().toString(),
                  user: 'You',
                  message: newForumMessage,
                  timeAgo: 'now',
                },
                ...forumThreads,
              ]);
              setCreateForumVisible(false);
              setNewForumMessage('');
            }}
          >
            <Text style={styles.createForumButtonText}>Post</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createForumCancel} onPress={() => setCreateForumVisible(false)}>
            <Text style={styles.createForumCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* ActionSheet/modal for Edit/Delete */}
      <Modal
        visible={!!actionSheetForumId}
        transparent
        animationType="fade"
        onRequestClose={() => setActionSheetForumId(null)}
      >
        <Pressable style={styles.createForumOverlay} onPress={() => setActionSheetForumId(null)} />
        <View style={styles.actionSheetModal}>
          <TouchableOpacity
            style={styles.actionSheetItem}
            onPress={() => {
              const thread = forumThreads.find(t => t.id === actionSheetForumId);
              setEditForumId(thread?.id || null);
              setEditForumMessage(thread?.message || '');
              setActionSheetForumId(null);
              setEditForumModalVisible(true);
            }}
          >
            <Text style={styles.actionSheetText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSheetItem}
            onPress={() => {
              setDeleteForumId(actionSheetForumId);
              setActionSheetForumId(null);
            }}
          >
            <Text style={[styles.actionSheetText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionSheetItem} onPress={() => setActionSheetForumId(null)}>
            <Text style={styles.actionSheetText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Edit Forum modal */}
      <Modal
        visible={editForumModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditForumModalVisible(false)}
      >
        <Pressable style={styles.createForumOverlay} onPress={() => setEditForumModalVisible(false)} />
        <View style={styles.createForumModal}>
          <Text style={styles.createForumTitle}>Edit Forum Post</Text>
          <TextInput
            style={styles.createForumInput}
            placeholder="Edit your message..."
            value={editForumMessage}
            onChangeText={setEditForumMessage}
            multiline
          />
          <TouchableOpacity
            style={styles.createForumButton}
            onPress={() => {
              setForumThreads(forumThreads.map(thread =>
                thread.id === editForumId
                  ? { ...thread, message: editForumMessage }
                  : thread
              ));
              setEditForumModalVisible(false);
              setEditForumId(null);
              setEditForumMessage('');
            }}
          >
            <Text style={styles.createForumButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createForumCancel} onPress={() => setEditForumModalVisible(false)}>
            <Text style={styles.createForumCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Delete confirmation modal */}
      <Modal
        visible={!!deleteForumId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteForumId(null)}
      >
        <Pressable style={styles.createForumOverlay} onPress={() => setDeleteForumId(null)} />
        <View style={styles.actionSheetModal}>
          <Text style={[styles.createForumTitle, { fontSize: 17, marginBottom: 12 }]}>Delete this forum post?</Text>
          <TouchableOpacity
            style={styles.actionSheetItem}
            onPress={() => {
              setForumThreads(forumThreads.filter(thread => thread.id !== deleteForumId));
              setDeleteForumId(null);
            }}
          >
            <Text style={[styles.actionSheetText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionSheetItem} onPress={() => setDeleteForumId(null)}>
            <Text style={styles.actionSheetText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Reply modal */}
      <Modal
        visible={replyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <Pressable style={styles.createForumOverlay} onPress={() => setReplyModalVisible(false)} />
        <View style={styles.createForumModal}>
          <Text style={styles.createForumTitle}>Reply</Text>
          <TextInput
            style={styles.createForumInput}
            placeholder="Write a reply..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            style={styles.createForumButton}
            onPress={handleAddReply}
          >
            <Text style={styles.createForumButtonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createForumCancel} onPress={() => setReplyModalVisible(false)}>
            <Text style={styles.createForumCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function RequestsScreen({ requests, onAccept, onDecline, onBack }: { requests: Thread[]; onAccept: (id: string) => void; onDecline: (id: string) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<Thread | null>(null);
  return selected ? (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <TouchableOpacity onPress={() => setSelected(null)} style={{ padding: 6, marginRight: 8 }}>
          <Ionicons name="chevron-back" size={24} color="#0EA5E9" />
        </TouchableOpacity>
        <Text style={{ fontWeight: '700', fontSize: 18, color: '#1F2937' }}>Request Details</Text>
      </View>
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <Image source={{ uri: selected.avatar }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 16 }} />
        <Text style={{ fontWeight: '700', fontSize: 20, color: '#1F2937', marginBottom: 6 }}>{selected.name}</Text>
        <Text style={{ color: '#64748B', fontSize: 15, marginBottom: 16 }}>{selected.lastMessage}</Text>
        <Text style={{ color: '#A0AEC0', fontSize: 13, marginBottom: 24 }}>{selected.time}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => { onAccept(selected.id); setSelected(null); }} style={{ backgroundColor: '#0EA5E9', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginRight: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onDecline(selected.id); setSelected(null); }} style={{ backgroundColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
            <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 16 }}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <TouchableOpacity onPress={onBack} style={{ padding: 6, marginRight: 8 }}>
          <Ionicons name="chevron-back" size={24} color="#0EA5E9" />
        </TouchableOpacity>
        <Text style={{ fontWeight: '700', fontSize: 18, color: '#1F2937' }}>Message Requests</Text>
      </View>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {requests.length === 0 && <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 32 }}>No requests.</Text>}
        {requests.map(thread => (
          <TouchableOpacity key={thread.id} onPress={() => setSelected(thread)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 18 }}>
            <Image source={{ uri: thread.avatar }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 14 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, color: '#1F2937' }}>{thread.name}</Text>
              <Text style={{ color: '#64748B', fontSize: 14 }} numberOfLines={1}>{thread.lastMessage}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  backButton: {
    padding: 10,
    marginRight: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  chatContainer: {
    flex: 1,
  },
  myMessageBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0EA5E9',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  theirMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  myMessageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  theirMessageText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  inputIcon: {
    padding: 6,
    marginRight: 2,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 17,
    color: '#374151',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginRight: 8,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  threadsList: {
    flex: 1,
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  threadName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  threadLastMessage: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  threadTime: {
    fontSize: 13,
    color: '#A0AEC0',
    fontWeight: '500',
    marginLeft: 10,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0EA5E9',
    marginLeft: 10,
  },
  createForumOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  createForumModal: {
    position: 'absolute',
    top: '25%',
    left: 24,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'stretch',
  },
  createForumTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0EA5E9',
    marginBottom: 16,
    textAlign: 'center',
  },
  createForumInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
  },
  createForumButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createForumButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createForumCancel: {
    alignItems: 'center',
    marginTop: 12,
  },
  createForumCancelText: {
    color: '#64748B',
    fontSize: 15,
  },
  actionSheetModal: {
    position: 'absolute',
    left: 32,
    right: 32,
    top: '35%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  actionSheetItem: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionSheetText: {
    fontSize: 16,
    color: '#0EA5E9',
    fontWeight: '600',
  },
});

const handleAddReply = () => {
  if (!replyText.trim() || !replyToThreadId) return;
  setForumThreads(forumThreads.map((thread: any) =>
    thread.id === replyToThreadId
      ? {
          ...thread,
          replies: [
            {
              id: Date.now().toString(),
              user: 'You',
              message: replyText,
              timeAgo: 'now',
              reactions: {},
            },
            ...(thread.replies || []),
          ],
        }
      : thread
  ));
  setReplyModalVisible(false);
  setReplyText('');
  setReplyToThreadId(null);
};

const handleToggleReaction = (threadId: string, emoji: string, isReply = false, replyId: string | null = null) => {
  setForumThreads(forumThreads.map((thread: any) => {
    if (thread.id === threadId) {
      if (isReply && replyId) {
        return {
          ...thread,
          replies: thread.replies.map((reply: any) =>
            reply.id === replyId
              ? {
                  ...reply,
                  reactions: {
                    ...reply.reactions,
                    [emoji]: reply.reactions[emoji]?.includes('You')
                      ? reply.reactions[emoji].filter((u: string) => u !== 'You')
                      : [...(reply.reactions[emoji] || []), 'You'],
                  },
                }
              : reply
          ),
        };
      } else {
        return {
          ...thread,
          reactions: {
            ...thread.reactions,
            [emoji]: thread.reactions[emoji]?.includes('You')
              ? thread.reactions[emoji].filter((u: string) => u !== 'You')
              : [...(thread.reactions[emoji] || []), 'You'],
          },
        };
      }
    }
    return thread;
  }));
};