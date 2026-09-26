"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select } from "@/components/ui/Form";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/ProductImage";

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    compareAt: number | null;
    stock: number;
    categoryId: string;
    brand: string | null;
    imageUrl: string;
    active: boolean;
    featured: boolean;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      description: String(form.get("description")),
      price: Number(form.get("price")),
      compareAt: form.get("compareAt") ? Number(form.get("compareAt")) : null,
      stock: Number(form.get("stock")),
      categoryId: String(form.get("categoryId")),
      brand: String(form.get("brand") || "") || undefined,
      imageUrl: String(form.get("imageUrl")),
      featured: form.get("featured") === "on",
      active: form.get("active") !== "off",
    };

    const res = await fetch(product ? `/api/seller/products/${product.id}` : "/api/seller/products", {
      method: product ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    router.push("/seller/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="lx-card p-5 space-y-3 max-w-2xl">
      {error && <p className="text-sm text-[var(--coral)]">{error}</p>}
      <div>
        <Label htmlFor="name">Product name</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product?.description} required />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price ?? ""} required />
        </div>
        <div>
          <Label htmlFor="compareAt">Compare at</Label>
          <Input id="compareAt" name="compareAt" type="number" step="0.01" defaultValue={product?.compareAt ?? ""} />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" defaultValue={product?.stock ?? 0} required />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select id="categoryId" name="categoryId" defaultValue={product?.categoryId} required>
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" defaultValue={product?.brand ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          defaultValue={product?.imageUrl ?? "https://picsum.photos/seed/newproduct/600/600"}
          required
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save product"}
        </Button>
        <Link href="/seller/products">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}

export function ProductTable({
  products,
}: {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    stock: number;
    active: boolean;
  }[];
}) {
  const router = useRouter();

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="lx-card overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
        <h2 className="font-heading font-bold">Products</h2>
        <Link href="/seller/products/new">
          <Button size="sm">Add product</Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)] bg-[var(--bg-page)]">
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <ProductImage src={p.imageUrl} alt="" className="absolute inset-0" sizes="40px" />
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-3">{formatPrice(p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.active ? "Active" : "Hidden"}</td>
                <td className="p-3 text-right space-x-2">
                  <Link href={`/seller/products/${p.id}/edit`} className="text-[var(--sky)]">
                    Edit
                  </Link>
                  <button type="button" className="text-[var(--coral)]" onClick={() => remove(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InventoryEditor({
  products,
}: {
  products: { id: string; name: string; imageUrl: string; stock: number }[];
}) {
  const router = useRouter();
  return (
    <div className="lx-card divide-y divide-[var(--border)]">
      {products.map((p) => (
        <div key={p.id} className="p-4 flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
            <ProductImage src={p.imageUrl} alt="" className="absolute inset-0" sizes="48px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{p.name}</p>
          </div>
          <Input
            type="number"
            className="w-24"
            defaultValue={p.stock}
            onBlur={async (e) => {
              await fetch(`/api/seller/products/${p.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stock: Number(e.target.value) }),
              });
              router.refresh();
            }}
          />
        </div>
      ))}
      {products.length === 0 && <p className="p-6 text-center text-[var(--text-muted)]">No products</p>}
    </div>
  );
}

export function SellerOrdersList({
  orders,
}: {
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string | Date;
    user: { name: string; email: string };
    items: { name: string; quantity: number; price: number }[];
  }[];
}) {
  const router = useRouter();
  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="lx-card p-4">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="font-bold">{o.orderNumber}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {o.user.name} · {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Select
              className="w-40"
              defaultValue={o.status}
              onChange={async (e) => {
                await fetch("/api/seller/orders", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: o.id, status: e.target.value }),
                });
                router.refresh();
              }}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <ul className="text-sm text-[var(--text-muted)] mt-3 space-y-1">
            {o.items.map((item, idx) => (
              <li key={idx}>
                {item.name} × {item.quantity} — {formatPrice(item.price * item.quantity)}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {orders.length === 0 && <div className="lx-card p-8 text-center text-[var(--text-muted)]">No orders yet.</div>}
    </div>
  );
}

export function StoreProfileForm({
  store,
}: {
  store: { storeName: string; slug: string; description: string | null; logoUrl: string | null; bannerUrl: string | null };
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/seller/store", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName: form.get("storeName"),
        description: form.get("description") || null,
        logoUrl: form.get("logoUrl") || null,
        bannerUrl: form.get("bannerUrl") || null,
      }),
    });
    setMessage(res.ok ? "Saved" : "Failed");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="lx-card p-5 space-y-3 max-w-xl">
      <div>
        <Label>Store name</Label>
        <Input name="storeName" defaultValue={store.storeName} required />
        <p className="text-sm text-[var(--text-muted)] mt-1">/store/{store.slug}</p>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea name="description" defaultValue={store.description || ""} />
      </div>
      <div>
        <Label>Logo URL</Label>
        <Input name="logoUrl" defaultValue={store.logoUrl || ""} />
      </div>
      <div>
        <Label>Banner URL</Label>
        <Input name="bannerUrl" defaultValue={store.bannerUrl || ""} />
      </div>
      {message && <p className="text-sm text-[var(--mint)]">{message}</p>}
      <Button type="submit">Save store</Button>
    </form>
  );
}
