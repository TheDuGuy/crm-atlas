"use server";

import { supabase } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

type FieldRow = {
  product: string;
  field_name: string;
  description: string;
  format: string;
  live: boolean;
};

type FlowRow = {
  product: string;
  flow_name: string;
  purpose: string;
  description: string;
  trigger_type: string;
  frequency: string;
  channels: string;
  live: boolean;
  sto: boolean;
  iterable_id: string;
};

export async function importFields(fields: FieldRow[]) {
  const errors: string[] = [];
  let success = 0;

  for (const field of fields) {
    try {
      // Get or create product
      let { data: product } = await supabase
        .from("products")
        .select("id")
        .eq("name", field.product)
        .single();

      if (!product) {
        const { data: newProduct, error: productError } = await (supabase as any)
          .from("products")
          .insert([{ name: field.product }])
          .select()
          .single();

        if (productError) throw productError;
        product = newProduct;
      }

      // Insert field
      const { error } = await (supabase as any).from("fields").insert([
        {
          product_id: (product as any).id,
          name: field.field_name,
          description: field.description,
          format: field.format,
          live: field.live,
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          // Duplicate key error
          errors.push(`Field "${field.field_name}" already exists for ${field.product}`);
        } else {
          throw error;
        }
      } else {
        success++;
      }
    } catch (error) {
      console.error(`Error importing field ${field.field_name}:`, error);
      errors.push(`Failed to import ${field.field_name}: ${error}`);
    }
  }

  revalidatePath("/products");
  return { success, errors };
}

export async function importFlows(flows: FlowRow[]) {
  const errors: string[] = [];
  let success = 0;

  for (const flow of flows) {
    try {
      // Get or create product
      let { data: product } = await supabase
        .from("products")
        .select("id")
        .eq("name", flow.product)
        .single();

      if (!product) {
        const { data: newProduct, error: productError } = await (supabase as any)
          .from("products")
          .insert([{ name: flow.product }])
          .select()
          .single();

        if (productError) throw productError;
        product = newProduct;
      }

      // Parse channels
      const channels = flow.channels
        .split(/[,+&]/)
        .map((c) => c.trim().toLowerCase().replace(/\s+/g, "_"))
        .filter((c) => ["email", "push", "in_app"].includes(c));

      // Insert flow
      const { error } = await (supabase as any).from("flows").insert([
        {
          product_id: (product as any).id,
          name: flow.flow_name,
          purpose: flow.purpose as any,
          description: flow.description,
          trigger_type: flow.trigger_type as any,
          frequency: flow.frequency,
          channels: channels as any,
          live: flow.live,
          sto: flow.sto,
          iterable_id: flow.iterable_id,
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          errors.push(`Flow "${flow.flow_name}" already exists for ${flow.product}`);
        } else {
          throw error;
        }
      } else {
        success++;
      }
    } catch (error) {
      console.error(`Error importing flow ${flow.flow_name}:`, error);
      errors.push(`Failed to import ${flow.flow_name}: ${error}`);
    }
  }

  revalidatePath("/flows");
  return { success, errors };
}
