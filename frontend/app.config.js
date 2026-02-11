module.exports = ({ config }) => ({
  ...config,
  name: 'Captr - Business Card Scanner',
  slug: 'captr',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'captr',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.captr.scanner',
    infoPlist: {
      NSCameraUsageDescription:
        'Allow Captr to access your camera to scan business cards.',
      NSPhotoLibraryUsageDescription:
        'Allow Captr to access your photos to import business card images.',
      NSContactsUsageDescription:
        'Allow Captr to access contacts to save scanned cards.',
    },
  },
  android: {
    package: 'com.captr.scanner',
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    permissions: [
      'CAMERA',
      'READ_CONTACTS',
      'WRITE_CONTACTS',
      'INTERNET',
      'READ_EXTERNAL_STORAGE',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-camera',
      {
        cameraPermission:
          'Allow Captr to access your camera to scan business cards.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow Captr to access your photos to import business card images.',
      },
    ],
    [
      'expo-contacts',
      {
        contactsPermission:
          'Allow Captr to access contacts to save scanned cards.',
      },
    ],
    'expo-web-browser',
    'expo-auth-session',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: '6c5caa68-534c-472c-8ded-f853feea19c4',
    },
  },
});
