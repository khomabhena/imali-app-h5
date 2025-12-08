# React Native WebView Setup for Biometric Authentication

This guide explains how to configure your React Native WebView to support biometric authentication (fingerprint/face ID) for the iMali H5 app.

## WebView Configuration

### 1. Enable WebAuthn Support in WebView

Your React Native WebView component needs to be configured to support WebAuthn APIs. Here's the recommended setup:

```javascript
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: 'https://your-app-url.com' }}
  // Enable JavaScript (required for WebAuthn)
  javaScriptEnabled={true}
  // Enable DOM storage (required for localStorage)
  domStorageEnabled={true}
  // Enable third-party cookies (may be needed for WebAuthn)
  thirdPartyCookiesEnabled={true}
  // Allow file access (may be needed)
  allowFileAccess={true}
  // Enable mixed content (if needed)
  mixedContentMode="always"
  // User agent (important for WebAuthn detection)
  userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
  // Handle navigation
  onShouldStartLoadWithRequest={(request) => {
    return true;
  }}
  // Handle errors
  onError={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
  }}
/>
```

### 2. Android Configuration

#### AndroidManifest.xml

Add these permissions and features:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />

<uses-feature
    android:name="android.hardware.fingerprint"
    android:required="false" />
```

#### build.gradle (app level)

Ensure you're using a WebView that supports WebAuthn (Android 7.0+):

```gradle
android {
    defaultConfig {
        minSdkVersion 24  // Android 7.0+ required for WebAuthn
        targetSdkVersion 33
    }
}
```

### 3. iOS Configuration

#### Info.plist

Add biometric usage description:

```xml
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID to authenticate and access your account</string>
<key>NSBiometricUsageDescription</key>
<string>Use Touch ID or Face ID to authenticate and access your account</string>
```

#### Minimum iOS Version

WebAuthn requires iOS 13.0+:

```swift
// In your Podfile or project settings
platform :ios, '13.0'
```

### 4. Alternative: Native Biometric Bridge (If WebAuthn Doesn't Work)

If WebAuthn doesn't work reliably in your WebView, you can create a native bridge:

#### Install React Native Biometrics Library

```bash
npm install react-native-biometrics
# or
npm install react-native-touch-id
# or
npm install @react-native-async-storage/async-storage react-native-keychain
```

#### Create a Bridge Component

```javascript
// BiometricBridge.js
import { NativeModules, NativeEventEmitter } from 'react-native';

const { BiometricModule } = NativeModules;

export const authenticateWithBiometric = async () => {
  try {
    const result = await BiometricModule.authenticate('Authenticate to login');
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const isBiometricAvailable = async () => {
  try {
    return await BiometricModule.isAvailable();
  } catch (error) {
    return false;
  }
};
```

#### Inject into WebView

```javascript
import { BiometricBridge } from './BiometricBridge';

<WebView
  source={{ uri: 'https://your-app-url.com' }}
  injectedJavaScript={`
    // Inject biometric bridge
    window.ReactNativeBiometric = {
      authenticate: async () => {
        return new Promise((resolve, reject) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'BIOMETRIC_AUTHENTICATE'
          }));
          
          // Listen for response
          window.addEventListener('message', function handler(event) {
            if (event.data.type === 'BIOMETRIC_RESPONSE') {
              window.removeEventListener('message', handler);
              if (event.data.success) {
                resolve(event.data);
              } else {
                reject(new Error(event.data.error));
              }
            }
          });
        });
      },
      isAvailable: async () => {
        return new Promise((resolve) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'BIOMETRIC_CHECK'
          }));
          
          window.addEventListener('message', function handler(event) {
            if (event.data.type === 'BIOMETRIC_AVAILABLE') {
              window.removeEventListener('message', handler);
              resolve(event.data.available);
            }
          });
        });
      }
    };
    true; // Required for injected JavaScript
  `}
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
    
    if (data.type === 'BIOMETRIC_AUTHENTICATE') {
      BiometricBridge.authenticateWithBiometric().then(result => {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'BIOMETRIC_RESPONSE',
          ...result
        }));
      });
    } else if (data.type === 'BIOMETRIC_CHECK') {
      BiometricBridge.isBiometricAvailable().then(available => {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'BIOMETRIC_AVAILABLE',
          available
        }));
      });
    }
  }}
/>
```

### 5. Update H5 App to Use Native Bridge (Optional)

If you implement the native bridge, update `src/lib/biometric.js`:

```javascript
// Check if native bridge is available
const isNativeBridgeAvailable = () => {
  return typeof window !== 'undefined' && 
         window.ReactNativeBiometric !== undefined;
};

export const isBiometricSupported = async () => {
  if (typeof window === 'undefined') return false;
  
  // Try native bridge first
  if (isNativeBridgeAvailable()) {
    try {
      return await window.ReactNativeBiometric.isAvailable();
    } catch (error) {
      console.warn('Native biometric check failed:', error);
    }
  }
  
  // Fall back to WebAuthn
  if (!isBiometricSupportedSync()) return false;
  
  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.warn('Biometric availability check failed, using fallback:', error);
    return isBiometricSupportedSync();
  }
};

export const authenticateBiometric = async () => {
  // ... existing code ...
  
  // Try native bridge first if available
  if (isNativeBridgeAvailable()) {
    try {
      const result = await window.ReactNativeBiometric.authenticate();
      if (result.success) {
        return {
          success: true,
          session: storedSession,
        };
      } else {
        throw new Error(result.error || 'Biometric authentication failed');
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Fall back to WebAuthn
  // ... existing WebAuthn code ...
};
```

## Testing

1. **Test WebAuthn Support**:
   - Open your app in the WebView
   - Navigate to the login page
   - Check browser console for WebAuthn API availability
   - Try the biometric login button

2. **Test Native Bridge** (if implemented):
   - Ensure the bridge is properly injected
   - Test on both iOS and Android
   - Verify biometric prompt appears

## Troubleshooting

### WebAuthn Not Available
- **Issue**: `PublicKeyCredential is undefined`
- **Solution**: Ensure WebView JavaScript is enabled and using a modern user agent

### Biometric Prompt Doesn't Appear
- **Issue**: WebAuthn API exists but no prompt
- **Solution**: 
  - Check device has biometric hardware enabled
  - Verify permissions are granted
  - Try the native bridge approach

### Session Not Persisting
- **Issue**: Biometric login works but session is lost
- **Solution**: Ensure `domStorageEnabled={true}` in WebView config

## Recommended Approach

For best compatibility, we recommend:

1. **First**: Try WebAuthn in WebView (simplest, works on modern devices)
2. **Fallback**: Implement native bridge if WebAuthn is unreliable
3. **Hybrid**: Use native bridge when available, fall back to WebAuthn

The current H5 app implementation will work with WebAuthn if your WebView is properly configured. If you need more reliability, implement the native bridge approach.

