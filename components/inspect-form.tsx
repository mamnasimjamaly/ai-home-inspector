"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Camera, ImageUp, LoaderCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AREAS, findingsFor, type Area, type Finding, type Severity } from "@/lib/sample-findings";
import { cn } from "@/lib/utils";

const severityVariant: Record<Severity, "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export function InspectForm() {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!cameraOpen) return;

    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    void video.play();

    return () => {
      video.srcObject = null;
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraOpen]);

  function acceptFile(next: File | undefined) {
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setError("Choose a photo (JPG, PNG, HEIC, or similar).");
      return;
    }
    setError(null);
    setFile(next);
    setStatus("idle");
    setFindings([]);
  }

  function onFiles(list: FileList | null) {
    acceptFile(list?.[0]);
  }

  function clearPhoto() {
    setFile(null);
    setStatus("idle");
    setFindings([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function closeCamera() {
    setCameraOpen(false);
    setCameraReady(false);
  }

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser cannot use the camera. Choose a file instead.");
      return;
    }

    setCameraStarting(true);
    setError(null);
    setCameraReady(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setError(
        "Could not open the camera. Allow camera access in the browser, or choose a file instead."
      );
    } finally {
      setCameraStarting(false);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Could not capture that photo. Try again.");
          return;
        }
        acceptFile(
          new File([blob], `inspection-${Date.now()}.jpg`, { type: "image/jpeg" })
        );
        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  }

  async function runInspection() {
    if (!file) return;
    setStatus("running");
    setFindings([]);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    setFindings(findingsFor(area));
    setStatus("done");
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Inspect your home</h1>
        <p className="mt-2 text-muted-foreground">
          Upload a photo and pick an area. We will flag likely maintenance and
          repair issues.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
          <CardDescription>
            Use your camera or drop a photo from your computer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => onFiles(event.target.files)}
          />

          {cameraOpen ? (
            <div className="relative overflow-hidden rounded-xl bg-black ring-1 ring-foreground/10">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="max-h-80 w-full object-cover"
                onLoadedMetadata={() => setCameraReady(true)}
              />
            </div>
          ) : preview ? (
            <div className="relative overflow-hidden rounded-xl ring-1 ring-foreground/10">
              {/* Local blob preview; next/image is not needed here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Photo selected for inspection"
                className="max-h-80 w-full object-cover"
              />
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute top-3 right-3"
                onClick={clearPhoto}
                aria-label="Remove photo"
              >
                <X />
              </Button>
            </div>
          ) : (
            <label
              htmlFor={inputId}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                onFiles(event.dataTransfer.files);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                dragging
                  ? "border-foreground bg-muted"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <ImageUp className="size-8 text-muted-foreground" />
              <span className="font-medium">Drop a photo or click to upload</span>
              <span className="text-sm text-muted-foreground">
                JPG, PNG, or HEIC
              </span>
            </label>
          )}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {cameraOpen ? (
              <>
                <Button
                  type="button"
                  disabled={!cameraReady}
                  onClick={capturePhoto}
                >
                  <Camera />
                  Capture
                </Button>
                <Button type="button" variant="outline" onClick={closeCamera}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={cameraStarting}
                  onClick={openCamera}
                >
                  {cameraStarting ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Camera />
                  )}
                  Take photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageUp />
                  Choose file
                </Button>
              </>
            )}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Area</legend>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((name) => (
                <Button
                  key={name}
                  type="button"
                  size="sm"
                  variant={area === name ? "default" : "outline"}
                  onClick={() => {
                    setArea(name);
                    setStatus("idle");
                    setFindings([]);
                  }}
                >
                  {name}
                </Button>
              ))}
            </div>
          </fieldset>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!file || status === "running" || cameraOpen}
            onClick={runInspection}
          >
            {status === "running" ? (
              <>
                <LoaderCircle className="animate-spin" />
                Inspecting…
              </>
            ) : (
              "Inspect this photo"
            )}
          </Button>
        </CardFooter>
      </Card>

      {status === "done" ? (
        <section className="space-y-4" aria-live="polite">
          <div>
            <h2 className="text-lg font-semibold">Findings</h2>
            <p className="text-sm text-muted-foreground">
              Sample findings for {area ?? "this photo"} — AI analysis comes next.
            </p>
          </div>
          <ul className="space-y-3">
            {findings.map((finding) => (
              <li key={finding.id}>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-3">
                      <span>{finding.title}</span>
                      <Badge variant={severityVariant[finding.severity]}>
                        {finding.severity}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{finding.summary}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
