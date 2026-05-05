import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import api from '../../services/api';

const MODES = ['10m', '60s', '15s', 'PHOTO', 'TEXT'];
const BOTTOM_TABS = ['LIVE', 'POST', 'CREATE'];
const CATEGORIES = ['Science', 'Technology', 'Business', 'Design', 'Mathematics', 'History', 'Personal Development', 'Physics', 'Chemistry'];

export default function AddPostScreen() {
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [activeMode, setActiveMode] = useState('PHOTO');
  const [activeBottom, setActiveBottom] = useState('POST');
  const [cameraFacing, setCameraFacing] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [isRecording, setIsRecording] = useState(false);

  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [pickedVideoUri, setPickedVideoUri] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  const showPermissionAlert = (title, message) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]);
  };

  const videoDuration = useMemo(() => {
    if (activeMode === '10m') return 600;
    if (activeMode === '60s') return 60;
    if (activeMode === '15s') return 15;
    return 15;
  }, [activeMode]);

  const handleCapture = async () => {
    if (activeMode === 'TEXT') {
      Alert.alert('Text mode', 'Switch to Photo or Video to capture.');
      return;
    }
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        showPermissionAlert('Enable camera from settings', 'Please enable camera access from settings.');
        return;
      }
    }
    if (activeMode !== 'PHOTO') {
      if (!micPermission?.granted) {
        const { granted } = await requestMicPermission();
        if (!granted) {
          showPermissionAlert('Enable microphone from settings', 'Please enable microphone access to record video.');
          return;
        }
      }
    }
    if (!cameraRef.current) {
      Alert.alert('Camera not ready', 'Please wait for the camera to load.');
      return;
    }
    if (activeMode === 'PHOTO') {
      await cameraRef.current.takePictureAsync({ quality: 1 });
      return;
    }
    if (isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    try {
      const result = await cameraRef.current.recordAsync({ maxDuration: videoDuration, quality: '1080p' });
      if (result?.uri) {
        setPickedVideoUri(result.uri);
        setShowUploadForm(true);
      }
    } finally {
      setIsRecording(false);
    }
  };

  const handlePickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showPermissionAlert('Enable photo library from settings', 'Please enable photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPickedVideoUri(result.assets[0].uri);
      setShowUploadForm(true);
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a title for your video.');
      return;
    }
    if (!pickedVideoUri) {
      Alert.alert('No video', 'Please pick a video first.');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload video file to get a URL
      // We use FormData to send the file
      const formData = new FormData();
      formData.append('file', {
        uri: pickedVideoUri,
        type: 'video/mp4',
        name: 'upload.mp4',
      });

      const uploadRes = await api.post('/videos/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      const videoUrl = uploadRes?.data?.url ?? pickedVideoUri;

      // Step 2: Save video metadata
      await api.post('/videos/upload', {
        title: title.trim(),
        description: description.trim(),
        videoUrl,
        category,
      });

      Alert.alert('Success!', 'Your video has been posted.', [
        {
          text: 'OK', onPress: () => {
            setShowUploadForm(false);
            setPickedVideoUri(null);
            setTitle('');
            setDescription('');
            setCategory('');
            navigation.navigate('Home');
          }
        }
      ]);
    } catch (err) {
      // If no file upload endpoint, try posting with local URI directly
      // (for testing — backend should have a cloud upload endpoint)
      try {
        await api.post('/videos/upload', {
          title: title.trim(),
          description: description.trim(),
          videoUrl: pickedVideoUri,
          category,
        });
        Alert.alert('Success!', 'Your video has been posted.', [
          {
            text: 'OK', onPress: () => {
              setShowUploadForm(false);
              setPickedVideoUri(null);
              setTitle('');
              setDescription('');
              setCategory('');
              navigation.navigate('Home');
            }
          }
        ]);
      } catch (err2) {
        Alert.alert('Upload failed', err2?.response?.data?.error ?? err2?.message ?? 'Something went wrong.');
      }
    } finally {
      setUploading(false);
    }
  };

  const toggleCameraFacing = () => setCameraFacing(c => c === 'back' ? 'front' : 'back');
  const toggleFlashMode = () => setFlashMode(c => c === 'off' ? 'on' : 'off');
  const handleClose = () => {
    if (navigation.canGoBack()) { navigation.goBack(); return; }
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={cameraFacing}
          flash={flashMode}
        />

        <View style={styles.topRow}>
          <TouchableOpacity style={styles.iconButton} onPress={handleClose}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.soundPill}>
            <MaterialCommunityIcons name="music-note" size={18} color="#fff" />
            <Text style={styles.soundText}>Add sound</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.greenDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.rightTools}>
          <TouchableOpacity style={styles.toolButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={toggleFlashMode}>
            <Ionicons name={flashMode === 'off' ? 'flash-off-outline' : 'flash-outline'} size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton}>
            <MaterialIcons name="timelapse" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton}>
            <Ionicons name="grid-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton}>
            <MaterialCommunityIcons name="magic-staff" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton}>
            <Feather name="smile" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton}>
            <Ionicons name="chevron-down" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.modeRow}>
          {MODES.map(mode => (
            <TouchableOpacity
              key={mode}
              onPress={() => setActiveMode(mode)}
              style={[styles.modePill, activeMode === mode && styles.modePillActive]}
            >
              <Text style={[styles.modeText, activeMode === mode && styles.modeTextActive]}>
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.captureRow}>
          <TouchableOpacity style={styles.galleryButton} onPress={handlePickFromGallery}>
            <MaterialIcons name="photo-library" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shutterOuter} onPress={handleCapture}>
            <View style={[styles.shutterInner, isRecording && { backgroundColor: '#ff4d58' }]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={handlePickFromGallery}>
            <MaterialIcons name="cloud-upload" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomTabs}>
          {BOTTOM_TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveBottom(tab)} style={styles.bottomTab}>
              <Text style={[styles.bottomTabText, activeBottom === tab && styles.bottomTabActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Upload Form Modal */}
      <Modal visible={showUploadForm} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.formSafe}>
          <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">

            <View style={styles.formHeader}>
              <TouchableOpacity onPress={() => setShowUploadForm(false)}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.formTitle}>Post Video</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.videoPreviewBox}>
              <Ionicons name="videocam" size={40} color="#1a5ff5" />
              <Text style={styles.videoReadyText}>Video ready to post</Text>
            </View>

            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a title..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="What is this video about?"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={300}
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
                >
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.postBtn, uploading && { opacity: 0.6 }]}
              onPress={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.postBtnText}>Post Video</Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#27E57D' },
  soundPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1F1F1F', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 8 },
  soundText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  rightTools: { position: 'absolute', right: 18, top: 88, gap: 18, alignItems: 'center' },
  toolButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  modeRow: { position: 'absolute', bottom: 140, left: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between' },
  modePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  modePillActive: { backgroundColor: '#fff' },
  modeText: { color: '#C7C7CC', fontSize: 13, fontWeight: '600' },
  modeTextActive: { color: '#111' },
  captureRow: { position: 'absolute', bottom: 60, left: 18, right: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  galleryButton: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#1F1F1F', alignItems: 'center', justifyContent: 'center' },
  uploadButton: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#1F1F1F', alignItems: 'center', justifyContent: 'center' },
  shutterOuter: { width: 86, height: 86, borderRadius: 43, borderWidth: 5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
  bottomTabs: { position: 'absolute', bottom: 12, left: 18, right: 18, flexDirection: 'row', justifyContent: 'center', gap: 24 },
  bottomTab: { paddingHorizontal: 8 },
  bottomTabText: { color: '#C7C7CC', fontSize: 14, fontWeight: '600', letterSpacing: 0.6 },
  bottomTabActive: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Form modal
  formSafe: { flex: 1, backgroundColor: '#0a0a14' },
  formScroll: { padding: 20, paddingBottom: 40 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  formTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  videoPreviewBox: { backgroundColor: 'rgba(26,95,245,0.1)', borderWidth: 1, borderColor: 'rgba(26,95,245,0.3)', borderRadius: 14, padding: 30, alignItems: 'center', marginBottom: 24, gap: 10 },
  videoReadyText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(26,95,245,0.3)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 15 },
  categoryRow: { marginBottom: 8 },
  categoryPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginRight: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  categoryPillActive: { backgroundColor: '#1a5ff5', borderColor: '#1a5ff5' },
  categoryText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  postBtn: { backgroundColor: '#1a5ff5', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  postBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});