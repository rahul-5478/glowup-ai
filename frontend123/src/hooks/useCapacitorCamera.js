// Shared camera hook for all pages
// Save as: frontend123/src/hooks/useCapacitorCamera.js

import { useCallback } from "react";

export function useCapacitorCamera() {
  const getPhoto = useCallback(async (source = "gallery") => {
    try {
      // Try Capacitor Camera first
      const { Camera, CameraSource, CameraResultType } = await import("@capacitor/camera");
      
      const image = await Camera.getPhoto({
        quality: 75,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
        width: 800,
        correctOrientation: true,
      });

      const base64 = image.base64String; // pure base64, no prefix
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      return { base64, dataUrl, error: null };

    } catch (capacitorErr) {
      // Fallback: web file input
      return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        if (source === "camera") input.setAttribute("capture", "environment");

        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return resolve({ base64: null, dataUrl: null, error: "No file selected" });

          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX = 800;
              let w = img.width, h = img.height;
              if (w > MAX || h > MAX) {
                if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                else { w = Math.round(w * MAX / h); h = MAX; }
              }
              canvas.width = w;
              canvas.height = h;
              canvas.getContext("2d").drawImage(img, 0, 0, w, h);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
              const base64 = dataUrl.split(",")[1];
              resolve({ base64, dataUrl, error: null });
            };
            img.onerror = () => resolve({ base64: null, dataUrl: null, error: "Image load failed" });
            img.src = ev.target.result;
          };
          reader.onerror = () => resolve({ base64: null, dataUrl: null, error: "Read failed" });
          reader.readAsDataURL(file);
        };

        input.oncancel = () => resolve({ base64: null, dataUrl: null, error: "Cancelled" });
        document.body.appendChild(input);
        input.click();
        setTimeout(() => { try { document.body.removeChild(input); } catch(e) {} }, 30000);
      });
    }
  }, []);

  return { getPhoto };
}