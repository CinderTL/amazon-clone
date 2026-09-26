"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Form";
import { ProductImage } from "@/components/ProductImage";
import { isProductImageSource, isRemoteImageUrl } from "@/lib/upload-path";

type CategoryOption = { id: string; name: string; children: { id: string; name: string }[] };

function selectionFor(categories: CategoryOption[], categoryId: string | null | undefined) {
  if (!categoryId) return { departmentId: "", subcategoryId: "" };
  for (const category of categories) {
    if (category.id === categoryId) return { departmentId: category.id, subcategoryId: "" };
    if (category.children.some((child) => child.id === categoryId)) {
      return { departmentId: category.id, subcategoryId: categoryId };
    }
  }
  return { departmentId: "", subcategoryId: "" };
}

type ProductDraft = {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAt: number | null;
  stock: number;
  categoryId: string | null;
  brand: string | null;
  imageUrl: string;
  images: string[];
  featured: boolean;
  shippingScope: "INTERNATIONAL" | "NATIONAL";
  status: "DRAFT" | "PUBLISHED";
};

const MAX_IMAGES = 8;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

function storedImages(product?: ProductDraft) {
  const source = product?.images?.length ? product.images : product?.imageUrl ? [product.imageUrl] : [];
  return source.filter(isProductImageSource);
}

export function ProductEditor({
  categories,
  product,
  originCountry,
}: {
  categories: CategoryOption[];
  product?: ProductDraft;
  originCountry: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>(() => storedImages(product));
  const [imageLink, setImageLink] = useState("");
  const [shippingScope, setShippingScope] = useState<"INTERNATIONAL" | "NATIONAL">(product?.shippingScope ?? "INTERNATIONAL");
  const [country, setCountry] = useState(originCountry);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const initialCategory = selectionFor(categories, product?.categoryId);
  const [departmentId, setDepartmentId] = useState(initialCategory.departmentId);
  const [subcategoryId, setSubcategoryId] = useState(initialCategory.subcategoryId);
  const subcategories = categories.find((category) => category.id === departmentId)?.children ?? [];

  async function uploadFiles(list: FileList | null) {
    if (!list?.length) return;
    setError("");
    const room = MAX_IMAGES - images.length;
    if (room < 1) {
      setError(`You can upload up to ${MAX_IMAGES} images`);
      return;
    }
    const files = Array.from(list).slice(0, room);
    setUploading(true);
    const added: string[] = [];
    for (const file of files) {
      if (!ACCEPT.split(",").includes(file.type)) {
        setError("Upload JPEG, PNG, WebP, or GIF images only");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than 5 MB`);
        continue;
      }
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/seller/uploads", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        continue;
      }
      added.push(data.url);
    }
    setImages((current) => [...current, ...added].slice(0, MAX_IMAGES));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addImageLink() {
    const next = imageLink.trim();
    setError("");
    if (images.length >= MAX_IMAGES) {
      setError(`You can add up to ${MAX_IMAGES} images`);
      return;
    }
    if (!isRemoteImageUrl(next)) {
      setError("Enter an image link that starts with http:// or https://");
      return;
    }
    if (images.includes(next)) {
      setError("That image is already in the list");
      return;
    }
    setImages((current) => [...current, next]);
    setImageLink("");
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= images.length) return;
    setImages((current) => {
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  }

  function makePrimary(index: number) {
    setImages((current) => {
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  }

  async function enableLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("This browser cannot share location. National shipping needs your country so buyers know the shipping origin.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const res = await fetch("/api/seller/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        });
        const data = await res.json();
        setLocating(false);
        if (!res.ok) {
          setError(data.error || "Could not determine your country");
          return;
        }
        setCountry(data.country);
      },
      (geoError) => {
        setLocating(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Location permission was denied. National shipping uses only your country as the shipping origin. Allow location for this site in the browser settings, then try again.");
          return;
        }
        setError("Could not read your location. Check that location is enabled and try again.");
      },
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 12000 }
    );
  }

  async function save(intent: "draft" | "publish", formElement: HTMLFormElement) {
    setError("");
    const form = new FormData(formElement);
    const payload = {
      name: String(form.get("name") || ""),
      description: String(form.get("description") || ""),
      price: form.get("price") === "" ? 0 : Number(form.get("price")),
      compareAt: form.get("compareAt") ? Number(form.get("compareAt")) : null,
      stock: form.get("stock") === "" ? 0 : Number(form.get("stock")),
      categoryId: subcategoryId || null,
      brand: String(form.get("brand") || "") || null,
      featured: form.get("featured") === "on",
      images,
      shippingScope,
      intent,
    };

    if (payload.name.trim().length < 2) return setError("Add a product name before saving");
    if (intent === "publish") {
      if (payload.name.trim().length < 2) return setError("Add a product name before publishing");
      if (payload.description.trim().length < 10) return setError("Add a description of at least 10 characters before publishing");
      if (!payload.price || payload.price <= 0) return setError("Add a price greater than 0 before publishing");
      if (!departmentId) return setError("Choose a category before publishing");
      if (!payload.categoryId) return setError("Choose a subcategory before publishing");
      if (!images.length) return setError("Add at least one image before publishing");
      if (shippingScope === "NATIONAL" && !country) return setError("Enable your shipping location before publishing a national product");
    }

    setSaving(intent);
    const res = await fetch(product ? `/api/seller/products/${product.id}` : "/api/seller/products", {
      method: product ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(null);
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    router.push("/seller/products");
    router.refresh();
  }

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        save("publish", event.currentTarget);
      }}
      className="space-y-4"
    >
      {error && (
        <p className="rounded border border-[var(--signal)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--signal)]" role="alert">
          {error}
        </p>
      )}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="lx-card space-y-3 p-5">
            <div>
              <Label htmlFor="name">Product name</Label>
              <Input id="name" name="name" defaultValue={product?.name} required={false} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={product?.description} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? ""} />
              </div>
              <div>
                <Label htmlFor="compareAt">Compare at (USD)</Label>
                <Input id="compareAt" name="compareAt" type="number" min="0" step="0.01" defaultValue={product?.compareAt ?? ""} />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="departmentId">Category</Label>
                <Select
                  id="departmentId"
                  value={departmentId}
                  onChange={(event) => {
                    setDepartmentId(event.target.value);
                    setSubcategoryId("");
                  }}
                >
                  <option value="">Select…</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                {categories.length === 0 && (
                  <p className="mt-1 text-xs text-[var(--muted)]">Website categories are not set up yet.</p>
                )}
              </div>
              <div>
                <Label htmlFor="subcategoryId">Subcategory</Label>
                <Select
                  id="subcategoryId"
                  name="subcategoryId"
                  value={subcategoryId}
                  disabled={!departmentId}
                  onChange={(event) => setSubcategoryId(event.target.value)}
                >
                  <option value="">Select…</option>
                  {subcategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" defaultValue={product?.brand ?? ""} />
              </div>
            </div>
            <p className="text-xs text-[var(--muted)]">Prices are stored in USD and shown to shoppers in the currency they select.</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked={product?.featured} className="cursor-pointer" /> Featured
            </label>
          </section>

          <section className="lx-card space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading font-bold">Images</h2>
              <Button type="button" variant="secondary" size="sm" disabled={uploading || images.length >= MAX_IMAGES} onClick={() => fileRef.current?.click()}>
                <ImagePlus className="h-4 w-4" aria-hidden />
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              onChange={(event) => uploadFiles(event.target.files)}
            />
            <div className="flex gap-2">
              <Input
                value={imageLink}
                placeholder="https://example.com/image.jpg"
                aria-label="Image link"
                onChange={(event) => setImageLink(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addImageLink();
                  }
                }}
              />
              <Button type="button" variant="secondary" disabled={uploading || images.length >= MAX_IMAGES} onClick={addImageLink}>
                <Link2 className="h-4 w-4" aria-hidden />
                Add link
              </Button>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Upload a file or add an image link. Up to 8 images, 5 MB each for files. The first image is the primary photo. Use the arrows to change the order.
            </p>
            {images.length === 0 ? (
              <div className="rounded border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">
                No images yet. Upload a photo or add a link before you publish.
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((src, index) => (
                  <li key={src} className="rounded border border-[var(--border)] bg-[var(--canvas)] p-2">
                    <div className="relative aspect-square overflow-hidden rounded bg-[var(--elevated)]">
                      <ProductImage src={src} alt="" className="absolute inset-0" sizes="160px" />
                      {index === 0 && (
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-[var(--signal)] px-2 py-0.5 text-[10px] font-bold text-[var(--canvas)]">
                          <Star className="h-3 w-3" aria-hidden /> Primary
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-[var(--muted)]">Order {index + 1}</p>
                    <div className="mt-1 flex items-center justify-between gap-1">
                      <div className="flex gap-1">
                        <button type="button" className="lx-focus rounded p-1 hover:bg-[var(--elevated)] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Move image earlier" disabled={index === 0} onClick={() => move(index, -1)}>
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button type="button" className="lx-focus rounded p-1 hover:bg-[var(--elevated)] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Move image later" disabled={index === images.length - 1} onClick={() => move(index, 1)}>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                      <button type="button" className="lx-focus rounded p-1 text-[var(--signal)] hover:bg-[var(--elevated)]" aria-label="Remove image" onClick={() => setImages((current) => current.filter((item) => item !== src))}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {index !== 0 && (
                      <button type="button" className="lx-focus mt-1 text-xs font-semibold text-[var(--signal)]" onClick={() => makePrimary(index)}>
                        Make primary
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="lx-card space-y-3 p-5">
            <h2 className="font-heading font-bold">Shipping</h2>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Where does this product ship?</legend>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input type="radio" name="shippingChoice" className="mt-1" checked={shippingScope === "INTERNATIONAL"} onChange={() => setShippingScope("INTERNATIONAL")} />
                International
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input type="radio" name="shippingChoice" className="mt-1" checked={shippingScope === "NATIONAL"} onChange={() => setShippingScope("NATIONAL")} />
                Local / National
              </label>
            </fieldset>
            {shippingScope === "NATIONAL" && (
              <div className="space-y-2 rounded border border-[var(--border)] bg-[var(--canvas)] p-3 text-sm">
                <p>
                  Location is used only to store your origin country. Shoppers see that country, not a precise address or coordinates.
                </p>
                {country ? (
                  <p className="font-semibold">Origin country: {country}</p>
                ) : (
                  <p className="text-[var(--muted)]">Origin country is not set yet.</p>
                )}
                <Button type="button" variant="secondary" size="sm" disabled={locating} onClick={enableLocation}>
                  {locating ? "Checking location…" : country ? "Update location" : "Enable location"}
                </Button>
              </div>
            )}
          </section>

          <section className="lx-card space-y-3 p-5">
            <p className="text-sm text-[var(--muted)]">
              Status: <span className="font-semibold text-[var(--foreground)]">{product?.status === "PUBLISHED" ? "Published" : "Draft"}</span>
            </p>
            <p className="text-xs text-[var(--muted)]">Drafts stay private. Publishing checks the required fields and makes the product purchasable.</p>
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={saving !== null || uploading}>
                {saving === "publish" ? "Publishing…" : "Publish"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={saving !== null || uploading}
                onClick={() => {
                  if (formRef.current) save("draft", formRef.current);
                }}
              >
                {saving === "draft" ? "Saving draft…" : "Save draft"}
              </Button>
              <Link href="/seller/products" className="lx-focus inline-flex h-10 items-center justify-center rounded border border-[var(--border)] px-4 text-sm font-medium hover:border-[var(--signal)]">
                Cancel
              </Link>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
