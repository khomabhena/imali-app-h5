# Biometric Bridge Communication - Complete Guide

## ✅ Good News: You Don't Need to Do Anything!

Your H5 app is **already set up correctly** to communicate with the biometric bridge. The bridge is automatically injected by the React Native app, and your `biometric.js` file already uses it properly.

## How Communication Works

### 1. Bridge Injection (Automatic)

When your H5 app loads in the React Native WebView, the React Native app automatically injects this into your page:

```javascript
window.ReactNativeBiometric = {
  authenticate: function(reason) { ... },
  isAvailable: function() { ... }
}
```

**You don't need to do anything** - this happens automatically!

### 2. Your H5 App Usage (Already Implemented)

Your `biometric.js` file already uses the bridge correctly:

```javascript
// ✅ Check if bridge exists
const isNativeBridgeAvailable = () => {
  return typeof window !== 'undefined' && 
         window.ReactNativeBiometric !== undefined;
};

// ✅ Use bridge to check availability
if (isNativeBridgeAvailable()) {
  const available = await window.ReactNativeBiometric.isAvailable();
  return available;
}

// ✅ Use bridge to authenticate
if (isNativeBridgeAvailable()) {
  await window.ReactNativeBiometric.authenticate('Authenticate to login');
  return { success: true, session: storedSession };
}
```

## Communication Flow

```
┌─────────────────────────────────────────┐
│  H5 App (biometric.js)                  │
│                                          │
│  1. Check: window.ReactNativeBiometric  │
│     .isAvailable()                       │
│                                          │
│  2. Authenticate:                       │
│     window.ReactNativeBiometric         │
│     .authenticate('reason')             │
└──────────────┬──────────────────────────┘
               │
               │ Promise-based API
               │ (Simple function calls)
               ▼
┌─────────────────────────────────────────┐
│  Injected Bridge                        │
│  (window.ReactNativeBiometric)         │
│                                          │
│  - Converts function calls to messages  │
│  - Sends via window.ReactNativeWebView  │
│    .postMessage()                       │
│  - Waits for response                   │
│  - Resolves/rejects Promise             │
└──────────────┬──────────────────────────┘
               │
               │ Message: { type, messageId, ... }
               ▼
┌─────────────────────────────────────────┐
│  React Native App (App.js)              │
│                                          │
│  - Receives message via onMessage       │
│  - Calls expo-local-authentication      │
│  - Shows native biometric prompt        │
│  - Sends response back via              │
│    injectJavaScript()                   │
└──────────────┬──────────────────────────┘
               │
               │ Response: { type, messageId, success, ... }
               ▼
┌─────────────────────────────────────────┐
│  Bridge receives response                │
│  - Calls window.receiveReactNativeMessage│
│  - Resolves/rejects Promise             │
└──────────────┬──────────────────────────┘
               │
               │ Promise resolves
               ▼
┌─────────────────────────────────────────┐
│  H5 App gets result                      │
│  - Success: { success: true }           │
│  - Error: throws Error                   │
└─────────────────────────────────────────┘
```

## API Reference for Your H5 App

### `window.ReactNativeBiometric.isAvailable()`

**Returns:** Promise<boolean>

**Usage:**
```javascript
const available = await window.ReactNativeBiometric.isAvailable();
// Returns: true or false
```

**What it does:**
- Checks if device has biometric hardware
- Checks if user has enrolled biometrics
- Returns `true` if both conditions are met

### `window.ReactNativeBiometric.authenticate(reason)`

**Parameters:**
- `reason` (string, optional): Message shown in biometric prompt
  - Default: "Authenticate to login"

**Returns:** Promise<void>

**Usage:**
```javascript
try {
  await window.ReactNativeBiometric.authenticate('Authenticate to login');
  // Success - user authenticated with fingerprint/Face ID
  console.log('Biometric authentication successful!');
} catch (error) {
  // Failed or cancelled
  console.error('Biometric failed:', error.message);
}
```

**Errors:**
- Throws `Error` if user cancels
- Throws `Error` if authentication fails
- Throws `Error` if biometric not available

## What You Need to Do

### ✅ Nothing! It's Already Working

Your H5 app code in `biometric.js` is **already correct**:

1. ✅ Checks for bridge availability
2. ✅ Uses bridge when available
3. ✅ Falls back to WebAuthn for web browsers
4. ✅ Handles errors properly

### Example: How Your Code Uses It

```javascript
// In your biometric.js (already implemented)
export const isBiometricSupported = async () => {
  // Try native bridge first
  if (isNativeBridgeAvailable()) {
    try {
      const available = await window.ReactNativeBiometric.isAvailable();
      return available; // ✅ Works!
    } catch (error) {
      // Fall through to WebAuthn
    }
  }
  // ... WebAuthn fallback
};

export const authenticateBiometric = async () => {
  // Try native bridge first
  if (isNativeBridgeAvailable()) {
    try {
      await window.ReactNativeBiometric.authenticate('Authenticate to login');
      return { success: true, session: storedSession }; // ✅ Works!
    } catch (nativeError) {
      throw nativeError;
    }
  }
  // ... WebAuthn fallback
};
```

## Testing

### 1. Check Bridge is Available

Open browser console in your H5 app (when running in React Native) and type:

```javascript
// Should return the bridge object
window.ReactNativeBiometric
// { authenticate: function, isAvailable: function }

// Test availability
await window.ReactNativeBiometric.isAvailable()
// Should return: true or false
```

### 2. Test Authentication

```javascript
// This will show the native biometric prompt
try {
  await window.ReactNativeBiometric.authenticate('Test login');
  console.log('✅ Success!');
} catch (error) {
  console.log('❌ Failed:', error.message);
}
```

## Debugging

### Bridge Not Found?

**Check:**
- Is app running in React Native WebView? (Bridge only exists in WebView)
- Has page fully loaded? (Bridge injected on page load)
- Check console for injection errors

### Authentication Not Working?

**Check:**
- React Native console for message logs
- H5 app console for errors
- Device has biometric hardware enabled
- User has enrolled fingerprints/Face ID

### Messages Not Received?

**Check:**
- React Native `handleMessage` is receiving messages
- `injectJavaScript` is being called
- Message IDs match between request and response

## Summary

**Your H5 app is already set up correctly!** 

- ✅ Bridge is automatically injected
- ✅ Your code already uses it
- ✅ No additional setup needed
- ✅ Works in both WebView and browsers

Just test it on a physical device and it should work! 🎉

