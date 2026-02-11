const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// NativeWind needs package exports, but Firebase's exports map
// doesn't include a react-native condition, so we manually resolve
// firebase/* subpaths using Node's standard resolution (main/browser fields).
const firebaseModules = [
  'firebase/app',
  'firebase/auth',
  'firebase/firestore',
  'firebase/storage',
  'firebase/functions',
];

const firebaseResolved = {};
for (const mod of firebaseModules) {
  try {
    firebaseResolved[mod] = require.resolve(mod);
  } catch {}
}

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (firebaseResolved[moduleName]) {
    return {
      filePath: firebaseResolved[moduleName],
      type: 'sourceFile',
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
