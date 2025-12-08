# Biometric Bridge Communication Guide

## Overview

Your H5 app communicates with the React Native biometric bridge through a simple API that's automatically injected into the WebView. **You don't need to do anything special** - the bridge is already set up and your existing `biometric.js` code will work!

## How It Works

### 1. Bridge Injection (Automatic)

The React Native app automatically injects `window.ReactNativeBiometric` into your WebView when the page loads. This happens automatically - you don't need to do anything.

### 2. Your H5 App Usage

Your H5 app already uses the bridge correctly! Here's how it works:

#### Check if Bridge is Available

```javascript
// In your biometric.js (already implemented)
const isNativeBridgeAvailable = () => {
  return typeof window !== 'undefined' && 
         window.ReactNativeBiometric !== undefined;
};
```

#### Check if Biometric is Available

```javascript
// Your code already does this:
if (isNativeBridgeAvailable()) {
  const available = await window.ReactNativeBiometric.isAvailable();
  return available;
}
```

#### Authenticate with Biometric

```javascript
// Your code already does this:
if (isNativeBridgeAvailable()) {
  await window.ReactNativeBiometric.authenticate('Authenticate to login');
  // Success! User authenticated
}
```

## Communication Flow

```
┌─────────────────┐
│   H5 App        │
│  (biometric.js) │
└────────┬────────┘
         │
         │ 1. Check: window.ReactNativeBiometric.isAvailable()
         │ 2. Authenticate: window.ReactNativeBiometric.authenticate()
         │
         ▼
┌─────────────────────────────────┐
│  Injected Bridge                │
│  (window.ReactNativeBiometric)  │
│  - Sends message via            │
│    window.ReactNativeWebView    │
│    .postMessage()               │
└────────┬────────────────────────┘
         │
         │ Message: { type: 'BIOMETRIC_AUTHENTICATE', ... }
         │
         ▼
┌─────────────────────────────────┐
│  React Native App                │
│  (App.js handleMessage)          │
│  - Receives message              │
│  - Calls expo-local-authentication│
│  - Shows fingerprint prompt      │
└────────┬────────────────────────┘
         │
         │ Response: { type: 'BIOMETRIC_RESPONSE', success: true }
         │
         ▼
┌─────────────────────────────────┐
│  Bridge sends response back      │
│  via postMessage()               │
└────────┬────────────────────────┘
         │
         │ Promise resolves/rejects
         │
         ▼
┌─────────────────┐
│   H5 App        │
│  (biometric.js) │
│  - Gets result  │
└─────────────────┘
```

## What You Need to Do

### ✅ Nothing! It's Already Set Up

Your `biometric.js` file already has all the code needed:

1. ✅ Checks for native bridge: `isNativeBridgeAvailable()`
2. ✅ Uses bridge when available: `window.ReactNativeBiometric.isAvailable()`
3. ✅ Authenticates via bridge: `window.ReactNativeBiometric.authenticate()`
4. ✅ Falls back to WebAuthn if bridge not available

### Current Implementation Status

Your code in `biometric.js` is **already correct**:

```javascript
// ✅ This checks for the bridge
const isNativeBridgeAvailable = () => {
  return typeof window !== 'undefined' && 
         window.ReactNativeBiometric !== undefined;
};

// ✅ This uses the bridge for availability check
if (isNativeBridgeAvailable()) {
  const available = await window.ReactNativeBiometric.isAvailable();
  return available;
}

// ✅ This uses the bridge for authentication
if (isNativeBridgeAvailable()) {
  await window.ReactNativeBiometric.authenticate('Authenticate to login');
  return { success: true, session: storedSession };
}
```

## Testing the Bridge

### 1. Check if Bridge is Injected

Open browser console in your H5 app (when running in React Native WebView) and type:

```javascript
window.ReactNativeBiometric
// Should return: { authenticate: function, isAvailable: function }
```

### 2. Test Availability

```javascript
await window.ReactNativeBiometric.isAvailable()
// Should return: true or false
```

### 3. Test Authentication

```javascript
try {
  await window.ReactNativeBiometric.authenticate('Test authentication')
  console.log('Success!')
} catch (error) {
  console.log('Failed:', error.message)
}
```

## Debugging

### Bridge Not Available?

- **Check**: Is the app running in React Native WebView? (Bridge only works in WebView, not regular browsers)
- **Check**: Has the page fully loaded? (Bridge is injected on page load)
- **Check**: Console for errors during bridge injection

### Messages Not Working?

- **Check**: React Native console for message logs
- **Check**: H5 app console for errors
- **Check**: Network tab for any blocked messages

## API Reference

### `window.ReactNativeBiometric.isAvailable()`

Returns a Promise that resolves to `true` or `false`.

```javascript
const available = await window.ReactNativeBiometric.isAvailable();
if (available) {
  // Biometric is available
}
```

### `window.ReactNativeBiometric.authenticate(reason)`

Shows the native biometric prompt and returns a Promise.

**Parameters:**
- `reason` (string, optional): Message to show in prompt (e.g., "Authenticate to login")

**Returns:**
- Promise that resolves on success
- Promise that rejects on failure/cancellation

```javascript
try {
  await window.ReactNativeBiometric.authenticate('Authenticate to login');
  // Success - user authenticated
} catch (error) {
  // Failed or cancelled
  console.error(error.message);
}
```

## Summary

**You don't need to do anything!** Your H5 app is already set up correctly:

1. ✅ Bridge is automatically injected by React Native
2. ✅ Your `biometric.js` already checks for and uses the bridge
3. ✅ Falls back to WebAuthn if bridge isn't available
4. ✅ Works in both React Native WebView and regular browsers

Just test it on a physical device and it should work!

