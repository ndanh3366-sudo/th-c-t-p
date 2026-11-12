# Implementation Plan - Robust SRS WebRTC Camera Streamer Fallback

## Problem
When running in an iframe or restricted browser environment, `navigator.mediaDevices.getUserMedia` with high-resolution constraints or advanced camera focus parameters can throw `Permission denied` or `OverconstrainedError` even if the user clicked Allow, or when running in the AI Studio preview iframe.

## Proposed Changes
1. **Update `/src/utils/srsCameraConfig.ts`**:
   - Simplify initial `getUserMedia` constraints to basic `{ video: true, audio: true }` first (instead of rigid 1080p 60fps with advanced focus modes which frequently trigger `OverconstrainedError` in restricted environments).
   - Add a robust fallback: if camera access fails or is blocked by iframe policy, generate a real working WebRTC canvas stream or fallback video stream so the user can broadcast successfully without being blocked by hardware/iframe errors.
2. **Update `/src/views/LiveShoppingView.tsx`**:
   - Ensure `startCameraStream` gracefully catches any error, notifies the user clearly, and offers immediate screen share or fallback streaming options.

## Verification
- Run `compile_applet` to verify compilation.
- Run `lint_applet` (`tsc --noEmit`) to verify zero TypeScript errors.
