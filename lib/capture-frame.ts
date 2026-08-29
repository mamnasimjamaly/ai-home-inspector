export async function captureFrame(
  video: HTMLVideoElement,
  maxEdge = 1280
): Promise<File> {
  if (video.videoWidth === 0) {
    throw new Error("Camera is not ready.");
  }

  let width = video.videoWidth;
  let height = video.videoHeight;
  const longest = Math.max(width, height);
  if (longest > maxEdge) {
    const scale = maxEdge / longest;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not capture that frame.");
  context.drawImage(video, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.78)
  );
  if (!blob) throw new Error("Could not capture that frame.");
  return new File([blob], "frame-" + Date.now() + ".jpg", { type: "image/jpeg" });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not save that frame."));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
