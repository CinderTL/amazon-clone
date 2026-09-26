"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Form";
import { ProductImage } from "@/components/ProductImage";
import { StoreImagePicker } from "@/components/seller/StoreImagePicker";

type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
};

function CategoryFields({
  name,
  description,
  imageUrl,
  onName,
  onDescription,
  onImage,
  disabled,
}: {
  name: string;
  description: string;
  imageUrl: string;
  onName: (value: string) => void;
  onDescription: (value: string) => void;
  onImage: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(event) => onName(event.target.value)} required />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(event) => onDescription(event.target.value)} />
      </div>
      <StoreImagePicker
        label="Category image"
        hint="Upload a file or paste an image link."
        value={imageUrl}
        onChange={onImage}
        disabled={disabled}
      />
    </div>
  );
}

export function CategoryManager({ categories, storeSlug }: { categories: StoreCategory[]; storeSlug: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", description: "", imageUrl: "" });

  async function createCategory(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/seller/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || null, imageUrl: imageUrl || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not create the category");
      return;
    }
    setName("");
    setDescription("");
    setImageUrl("");
    router.refresh();
  }

  function startEdit(category: StoreCategory) {
    setEditingId(category.id);
    setDraft({
      name: category.name,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
    });
    setError("");
  }

  async function saveEdit(id: string) {
    setError("");
    setSaving(true);
    const res = await fetch(`/api/seller/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        description: draft.description || null,
        imageUrl: draft.imageUrl || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not update the category");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function remove(id: string) {
    setError("");
    setSaving(true);
    const res = await fetch(`/api/seller/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not delete the category");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createCategory} className="lx-card max-w-xl space-y-3 p-5">
        <h2 className="font-heading font-bold">New category</h2>
        <p className="text-sm text-[var(--muted)]">
          Categories you add here appear on{" "}
          <a href={`/store/${storeSlug}`} className="text-[var(--signal)]">
            your store page
          </a>{" "}
          and in the product form.
        </p>
        <CategoryFields
          name={name}
          description={description}
          imageUrl={imageUrl}
          onName={setName}
          onDescription={setDescription}
          onImage={setImageUrl}
          disabled={saving}
        />
        {error && !editingId && (
          <p className="text-sm text-[var(--signal)]" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          {saving && !editingId ? "Saving…" : "Add category"}
        </Button>
      </form>

      <ul className="max-w-3xl space-y-3">
        {categories.map((category) => (
          <li key={category.id} className="lx-card p-4">
            {editingId === category.id ? (
              <div className="space-y-3">
                <CategoryFields
                  name={draft.name}
                  description={draft.description}
                  imageUrl={draft.imageUrl}
                  onName={(value) => setDraft((current) => ({ ...current, name: value }))}
                  onDescription={(value) => setDraft((current) => ({ ...current, description: value }))}
                  onImage={(value) => setDraft((current) => ({ ...current, imageUrl: value }))}
                  disabled={saving}
                />
                {error && (
                  <p className="text-sm text-[var(--signal)]" role="alert">
                    {error}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button type="button" disabled={saving} onClick={() => saveEdit(category.id)}>
                    Save
                  </Button>
                  <Button type="button" variant="secondary" disabled={saving} onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-[var(--elevated)]">
                  <ProductImage src={category.imageUrl} alt="" className="absolute inset-0" sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{category.name}</p>
                  {category.description && <p className="text-sm text-[var(--muted)]">{category.description}</p>}
                  <p className="text-xs text-[var(--muted)]">{category.productCount} products</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="sm" disabled={saving} onClick={() => startEdit(category)}>
                    Edit
                  </Button>
                  <Button type="button" variant="ghost" size="sm" disabled={saving} onClick={() => remove(category.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
        {categories.length === 0 && (
          <li className="lx-card p-8 text-center text-sm text-[var(--muted)]">No store categories yet.</li>
        )}
      </ul>
    </div>
  );
}
