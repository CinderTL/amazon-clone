"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";
import { ProductImage } from "@/components/ProductImage";
import { isRemoteImageUrl } from "@/lib/upload-path";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

export function StoreImagePicker({
  label,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Upload JPEG, PNG, WebP, or GIF images only");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller");
      return;
    }
    setUploading(true);
    const body = new FormData();
    body.set("file", file);
    body.set("scope", "store");
    const res = await fetch("/api/seller/uploads", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    onChange(data.url);
    setLink("");
  }

  function applyLink() {
    const next = link.trim();
    if (!isRemoteImageUrl(next)) {
      setError("Enter an image link that starts with http:// or https://");
      return;
    }
    setError("");
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-[var(--muted)]">{hint}</p>
      {value ? (
        <div className="relative h-28 overflow-hidden rounded border border-[var(--border)] bg-[var(--canvas)]">
          <ProductImage src={value} alt="" className="absolute inset-0" sizes="480px" fit="contain" />
        </div>
      ) : (
        <div className="flex h-28 items-center justify-center rounded border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
          No image yet
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={disabled || uploading} onClick={() => fileRef.current?.click()}>
          <ImagePlus className="h-4 w-4" aria-hidden />
          {uploading ? "Uploading…" : "Upload"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" disabled={disabled || uploading} onClick={() => onChange("")}>
            <Trash2 className="h-4 w-4" aria-hidden />
            Remove
          </Button>
        )}
      </div>
      <input ref={fileRef} type="file" accept={ACCEPT} className="sr-only" onChange={(event) => upload(event.target.files?.[0])} />
      <div className="flex gap-2">
        <Input
          value={link}
          placeholder="https://example.com/image.jpg"
          onChange={(event) => setLink(event.target.value)}
          aria-label={`${label} link`}
        />
        <Button type="button" variant="secondary" disabled={disabled || uploading} onClick={applyLink}>
          <Link2 className="h-4 w-4" aria-hidden />
          Use link
        </Button>
      </div>
      {error && (
        <p className="text-sm text-[var(--signal)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
