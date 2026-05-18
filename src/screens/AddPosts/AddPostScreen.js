import React, { useRef, useState } from 'react';
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
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';

export default function AddPostScreen() {
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [cameraFacing, setCameraFacing] = useState('back');
  const [isRecording, setIsRecording] = useState(false);
  const flashMode = 'off';

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

  const handleCapture = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        showPermissionAlert(
          'Enable camera from settings',
          'Please enable camera access from settings to record reels.'
        );
        return;
      }
    }

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

    if (!cameraRef.current) {
      Alert.alert('Camera not ready', 'Please wait for the camera to load.');
      return;
    }

    if (isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    try {
      const result = await cameraRef.current.recordAsync({ maxDuration: 60, quality: '1080p' });
      if (result?.uri) {
        const fileName = result.uri.split('/').pop() || `video_${Date.now()}.mp4`;
        navigation.navigate('UploadVideo', {
          recordedVideo: {
            uri: result.uri,
            fileName,
          },
        });
      }
    } finally {
      setIsRecording(false);
    }
  };
  const handleUploadPress = () => {
    navigation.navigate("UploadVideo");
  };

  const toggleCameraFacing = () => {
    setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));
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
          mode="video"
        />
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.iconButton} onPress={handleClose}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Reel</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.rightTools}>
          <TouchableOpacity style={styles.toolButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.captureRow}>
          <View style={styles.sideSpacer} />

          <TouchableOpacity style={styles.shutterOuter} onPress={handleCapture}>
            <View style={[styles.shutterInner, isRecording && styles.shutterInnerRecording]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPress}>
            <MaterialIcons name="cloud-upload" size={22} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload Video</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.captureHintRow}>
          <Text style={styles.captureHintText}>
            {isRecording ? 'Tap the center button to stop recording' : 'Tap the center button to record a video'}
          </Text>
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
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  captureRow: {
    position: 'absolute',
    bottom: 60,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSpacer: {
    width: 44,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1F1F1F',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
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
  shutterInnerRecording: {
    backgroundColor: '#FF3B30',
  },
  captureHintRow: {
    position: 'absolute',
    bottom: 24,
    left: 18,
    right: 18,
    alignItems: 'center',
  },
  captureHintText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
});
