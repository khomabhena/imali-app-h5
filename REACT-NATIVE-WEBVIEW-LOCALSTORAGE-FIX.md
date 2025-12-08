# Fix: localStorage Not Working in React Native WebView

## Problem
If you're getting "No biometric credentials found" error even after logging in, it's likely because `localStorage` is not enabled in your React Native WebView.

## Solution

### 1. Enable DOM Storage in WebView

Make sure your React Native WebView has `domStorageEnabled={true}`:

```javascript
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: 'https://your-app-url.com' }}
  // ⚠️ CRITICAL: Enable DOM storage for localStorage to work
  domStorageEnabled={true}
  // Also enable JavaScript
  javaScriptEnabled={true}
  // Other recommended settings
  thirdPartyCookiesEnabled={true}
  allowFileAccess={true}
  // ... other props
/>
```

### 2. Android Specific

For Android, you may also need to enable cache mode:

```javascript
<WebView
  source={{ uri: 'https://your-app-url.com' }}
  domStorageEnabled={true}
  javaScriptEnabled={true}
  // Android specific
  cacheEnabled={true}
  cacheMode="LOAD_DEFAULT"
  // ... other props
/>
```

### 3. iOS Specific

For iOS, localStorage should work with just `domStorageEnabled={true}`, but make sure you're using a recent version of `react-native-webview`.

### 4. Verify localStorage is Working

After enabling `domStorageEnabled`, test by:

1. Log in with email/password
2. Check the debug logs - you should see:
   - "💾 Storing biometric session..."
   - "✅ Biometric session stored and verified successfully"
3. Log out
4. Try biometric login - it should now work

### 5. Debug localStorage

If it's still not working, the debug logs will show:
- "❌ localStorage is not available!" - means `domStorageEnabled` is not set
- "⚠️ Storage verification failed" - means localStorage exists but data isn't persisting

## Quick Checklist

- [ ] `domStorageEnabled={true}` is set in WebView
- [ ] `javaScriptEnabled={true}` is set in WebView
- [ ] WebView is using a recent version (v11+)
- [ ] Test on a physical device (not just simulator)
- [ ] Check debug logs to see if storage is working

## Example Complete WebView Setup

```javascript
import { WebView } from 'react-native-webview';
import React, { useRef } from 'react';

export default function AppWebView() {
  const webViewRef = useRef(null);

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: 'https://your-app-url.com' }}
      // Critical for localStorage
      domStorageEnabled={true}
      javaScriptEnabled={true}
      // Recommended settings
      thirdPartyCookiesEnabled={true}
      allowFileAccess={true}
      cacheEnabled={true}
      // Handle messages from H5 app
      onMessage={(event) => {
        const data = JSON.parse(event.nativeEvent.data);
        // Handle biometric bridge messages
        // ... your message handling code
      }}
      // Inject biometric bridge
      injectedJavaScript={`
        // Your biometric bridge injection code
        // ...
        true;
      `}
    />
  );
}
```

## Still Not Working?

If localStorage still doesn't work after enabling `domStorageEnabled`:

1. **Check WebView version**: Update to latest `react-native-webview`
2. **Check Android version**: Some older Android versions have localStorage issues
3. **Try incognito/private mode**: Some WebView settings might disable localStorage
4. **Check console logs**: Look for localStorage-related errors
5. **Test in browser first**: Open the H5 app in a mobile browser to verify localStorage works there

