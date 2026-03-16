import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';

const MODES = ['10m', '60s', '15s', 'PHOTO', 'TEXT'];
const BOTTOM_TABS = ['LIVE', 'POST', 'CREATE'];

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

  const showPermissionAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
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
        showPermissionAlert(
          'Enable camera from settings',
          'Please enable camera access from settings to capture reels, video, or images.'
        );
        return;
      }
    }

    if (activeMode !== 'PHOTO') {
      if (!micPermission?.granted) {
        const { granted } = await requestMicPermission();
        if (!granted) {
          showPermissionAlert(
            'Enable microphone from settings',
            'Please enable microphone access to record video with audio.'
          );
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
      await cameraRef.current.recordAsync({ maxDuration: videoDuration, quality: '1080p' });
    } finally {
      setIsRecording(false);
    }
  };

  const handlePickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showPermissionAlert(
        'Enable photo library from settings',
        'Please enable photo library access to select images or videos.'
      );
      return;
    }

    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 1,
    });
  };

  const toggleCameraFacing = () => {
    setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlashMode = () => {
    setFlashMode((current) => (current === 'off' ? 'on' : 'off'));
  };

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
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
          {MODES.map((mode) => (
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
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton}>
            <MaterialIcons name="cloud-upload" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomTabs}>
          {BOTTOM_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveBottom(tab)}
              style={styles.bottomTab}
            >
              <Text style={[styles.bottomTabText, activeBottom === tab && styles.bottomTabActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#27E57D',
  },
  soundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F1F1F',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  soundText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rightTools: {
    position: 'absolute',
    right: 18,
    top: 88,
    gap: 18,
    alignItems: 'center',
  },
  toolButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeRow: {
    position: 'absolute',
    bottom: 140,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modePillActive: {
    backgroundColor: '#fff',
  },
  modeText: {
    color: '#C7C7CC',
    fontSize: 13,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#111',
  },
  captureRow: {
    position: 'absolute',
    bottom: 60,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  bottomTabs: {
    position: 'absolute',
    bottom: 12,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  bottomTab: {
    paddingHorizontal: 8,
  },
  bottomTabText: {
    color: '#C7C7CC',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  bottomTabActive: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
