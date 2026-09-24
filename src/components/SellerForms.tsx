"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import {
  upsertProductAction,
  deleteProductAction,
  updateStockAction,
  updateOrderStatusAction,
  updateStoreProfileAction,
  type ActionState,
} from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select, FormError, FormSuccess } from "@/components/ui/Form";
import { formatPrice } from "@/lib/utils";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="cta" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

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
  const [state, action] = useActionState(upsertProductAction, {} as ActionState);

  return (
    <form action={action} className="bg-white border border-mh-border rounded-lg p-4 space-y-3 max-w-2xl">
      {product && <input type="hidden" name="id" value={product.id} />}
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
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Featured
        </label>
      </div>
      <FormError message={state.error} />
      <div className="flex gap-2">
        <Submit label={product ? "Update product" : "Create product"} />
        <Link href="/seller/products" className="inline-flex items-center text-sm text-mh-link hover:underline px-3">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function ProductList({
  products,
}: {
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    active: boolean;
    imageUrl: string;
    category: { name: string };
  }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="bg-white border border-mh-border rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-mh-border">
        <h2 className="font-bold">Your products ({products.length})</h2>
        <Link
          href="/seller/products/new"
          className="inline-flex h-9 px-4 items-center rounded-lg bg-gradient-to-b from-mh-cta-top to-mh-cta-bottom border border-mh-cta-border text-sm font-medium"
        >
          Add product
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-mh-muted border-b border-mh-border bg-mh-soft">
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-mh-border last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-mh-soft shrink-0">
                      <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="40px" />
                    </div>
                    <span className="line-clamp-2">{p.name}</span>
                  </div>
                </td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3">{formatPrice(p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.active ? "Active" : "Hidden"}</td>
                <td className="p-3 space-x-2 whitespace-nowrap">
                  <Link href={`/seller/products/${p.id}/edit`} className="text-mh-link hover:underline">
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={pending}
                    className="text-mh-danger hover:underline"
                    onClick={() => {
                      if (confirm("Delete this product?")) {
                        startTransition(() => deleteProductAction(p.id));
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-mh-muted">
                  No products yet. Create your first listing.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InventoryList({
  products,
}: {
  products: { id: string; name: string; stock: number; imageUrl: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="bg-white border border-mh-border rounded-lg divide-y divide-mh-border">
      {products.map((p) => (
        <div key={p.id} className="flex items-center gap-3 p-3">
          <div className="relative w-12 h-12 rounded overflow-hidden bg-mh-soft shrink-0">
            <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="48px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{p.name}</p>
          </div>
          <input
            type="number"
            min={0}
            defaultValue={p.stock}
            disabled={pending}
            className="w-24 h-9 border border-mh-input rounded-md px-2"
            onBlur={(e) => {
              const stock = parseInt(e.target.value, 10);
              if (!Number.isNaN(stock) && stock !== p.stock) {
                startTransition(() => updateStockAction(p.id, stock));
              }
            }}
          />
        </div>
      ))}
      {products.length === 0 && <p className="p-6 text-center text-mh-muted">No products</p>}
    </div>
  );
}

type OrderStatusValue =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export function SellerOrdersList({
  orders,
}: {
  orders: {
    id: string;
    orderNumber: string;
    status: OrderStatusValue;
    createdAt: Date;
    shippingName: string;
    items: { id: string; name: string; quantity: number; price: number }[];
    sellerTotal: number;
  }[];
}) {
  const [pending, startTransition] = useTransition();
  const statuses: OrderStatusValue[] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="bg-white border border-mh-border rounded-lg p-4">
          <div className="flex flex-wrap justify-between gap-2 mb-2">
            <div>
              <p className="font-bold">{o.orderNumber}</p>
              <p className="text-xs text-mh-muted">
                {o.shippingName} · {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                defaultValue={o.status}
                disabled={pending}
                className="h-8 border border-mh-border rounded-md px-2 text-sm"
                onChange={(e) => {
                  const status = e.target.value as OrderStatusValue;
                  startTransition(async () => {
                    await updateOrderStatusAction(o.id, status as Parameters<typeof updateOrderStatusAction>[1]);
                  });
                }}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="font-bold text-sm">{formatPrice(o.sellerTotal)}</span>
            </div>
          </div>
          <ul className="text-sm text-mh-muted space-y-1">
            {o.items.map((i) => (
              <li key={i.id}>
                {i.quantity}× {i.name} — {formatPrice(i.price * i.quantity)}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {orders.length === 0 && (
        <div className="bg-white border border-mh-border rounded-lg p-8 text-center text-mh-muted">
          No orders for your products yet.
        </div>
      )}
    </div>
  );
}

export function StoreProfileForm({
  store,
}: {
  store: {
    storeName: string;
    description: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    slug: string;
  };
}) {
  const [state, action] = useActionState(updateStoreProfileAction, {} as ActionState);
  return (
    <form action={action} className="bg-white border border-mh-border rounded-lg p-4 space-y-3 max-w-xl">
      <div>
        <Label htmlFor="storeName">Store name</Label>
        <Input id="storeName" name="storeName" defaultValue={store.storeName} required />
      </div>
      <div>
        <Label>Store URL slug</Label>
        <p className="text-sm text-mh-muted">/store/{store.slug}</p>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={store.description ?? ""} />
      </div>
      <div>
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" name="logoUrl" defaultValue={store.logoUrl ?? ""} />
      </div>
      <div>
        <Label htmlFor="bannerUrl">Banner URL</Label>
        <Input id="bannerUrl" name="bannerUrl" defaultValue={store.bannerUrl ?? ""} />
      </div>
      <FormError message={state.error} />
      <FormSuccess message={state.success} />
      <Submit label="Save store profile" />
    </form>
  );
}
