"use server";

import { supabase } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      fields:fields(count),
      events:events(count),
      flows:flows(count)
    `)
    .order("name");

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data;
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      fields (*),
      events (*),
      flows (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data;
}

export async function createProduct(formData: {
  name: string;
  description?: string;
}) {
  const { data, error } = await (supabase as any)
    .from("products")
    .insert([formData])
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    throw new Error(error.message);
  }

  revalidatePath("/products");
  return data;
}

export async function updateProduct(
  id: string,
  formData: {
    name?: string;
    description?: string;
  }
) {
  const { data, error } = await (supabase as any)
    .from("products")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw new Error(error.message);
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    throw new Error(error.message);
  }

  revalidatePath("/products");
}
