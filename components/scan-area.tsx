"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, LoaderCircle, Square, Video } from "lucide-react";
import { Disclaimer } from "@/components/disclaimer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { captureFrame, fileToDataUrl } from "@/lib/capture-frame";
import { type Finding, type RoomName, type RoomSlug } from "@/lib/inspection";
import { addScan } from "@/lib/property-store";

const MAX_FRAMES = 8;
const INTERVAL_MS = 2000;

export function ScanArea({
  room,
  roomName,
}: {
  room: RoomSlug;
  roomName: RoomName;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [frames, setFrames] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const framesRef = useRef<File[]>([]);
  const capturingRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!cameraOpen) return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    void video.play();
    return () => {
      video.srcObject = null;
    };
  }, [cameraOpen]);

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser cannot use the camera.");
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setError("Allow camera access, or try another browser.");
    }
  }

  function stopCamera() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
    setCameraReady(false);
    setScanning(false);
  }

  async function takeFrame() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || capturingRef.current) return;
    if (framesRef.current.length >= MAX_FRAMES) {
      stopWalk();
      return;
    }
    capturingRef.current = true;
    try {
      const file = await captureFrame(video);
      const url = URL.createObjectURL(file);
      framesRef.current = [...framesRef.current, file];
      setFrames(framesRef.current);
      setPreviews((current) => [...current, url]);
      if (framesRef.current.length >= MAX_FRAMES) stopWalk();
    } catch {
      setError("Could not capture that frame.");
    } finally {
      capturingRef.current = false;
    }
  }

  function startWalk() {
    if (!cameraReady) return;
    setScanning(true);
    setError(null);
    void takeFrame();
    timerRef.current = window.setInterval(() => {
      void takeFrame();
    }, INTERVAL_MS);
  }

  function stopWalk() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setScanning(false);
  }

  async function analyze() {
    if (frames.length === 0) {
      setError("Capture at least one frame while you walk.");
      return;
    }
    setStatus("running");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("room", room);
      for (const frame of frames) {
        formData.append("photos", frame);
      }
      const response = await fetch("/api/inspect", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        findings?: Finding[];
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Inspection failed.");
        setStatus("idle");
        return;
      }
      const savedFrames = await Promise.all(frames.map(fileToDataUrl));
      addScan({
        id: crypto.randomUUID(),
        room,
        createdAt: new Date().toISOString(),
        frames: savedFrames,
        findings: data.findings ?? [],
      });
      setStatus("done");
      router.push("/rooms/" + room);
    } catch {
      setError("Could not reach the inspection service.");
      setStatus("idle");
    }
  }

  const frameCountLabel =
    frames.length + " of " + MAX_FRAMES + " frames";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-8">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/home" className="hover:underline">
            My Home
          </Link>
          {" / "}
          <Link href={"/rooms/" + room} className="hover:underline">
            {roomName}
          </Link>
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Video className="size-6 text-primary" />
          Scan area
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Walk around the {roomName.toLowerCase()}. The app captures a frame
          every two seconds.
        </p>
      </div>

      <Disclaimer />

      <Card>
        <CardHeader>
          <CardTitle>{roomName}</CardTitle>
          <CardDescription>
            Start the camera, then start scan. Stop when you have covered the
            space.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cameraOpen ? (
            <div className="relative overflow-hidden rounded-lg bg-black ring-1 ring-foreground/10">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="max-h-80 w-full object-cover"
                onLoadedMetadata={() => setCameraReady(true)}
              />
              {scanning ? (
                <span className="absolute top-3 left-3 rounded-sm bg-red-600 px-2 py-1 text-xs font-medium text-white">
                  Scanning
                </span>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center">
              <Camera className="size-8 text-muted-foreground" />
              <p className="font-medium">Camera is off</p>
              <p className="text-sm text-muted-foreground">{frameCountLabel}</p>
            </div>
          )}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          {previews.length > 0 ? (
            <ul className="grid grid-cols-4 gap-2">
              {previews.map((src, index) => (
                <li key={src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={"Frame " + (index + 1)}
                    className="h-16 w-full rounded-sm object-cover"
                  />
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {!cameraOpen ? (
              <Button type="button" onClick={openCamera}>
                <Camera />
                Open camera
              </Button>
            ) : scanning ? (
              <Button type="button" variant="outline" onClick={stopWalk}>
                <Square />
                Stop scan
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  disabled={!cameraReady || frames.length >= MAX_FRAMES}
                  onClick={startWalk}
                >
                  <Video />
                  Start scan
                </Button>
                <Button type="button" variant="outline" onClick={stopCamera}>
                  Close camera
                </Button>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{frameCountLabel}</p>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            size="lg"
            className="w-full rounded-sm"
            disabled={frames.length === 0 || status === "running" || scanning}
            onClick={analyze}
          >
            {status === "running" ? (
              <>
                <LoaderCircle className="animate-spin" />
                Reviewing frames…
              </>
            ) : (
              "Review scan"
            )}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
