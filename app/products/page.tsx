import { ProductsList } from "@/components/products-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage your product areas and their capabilities
          </p>
        </div>
        <Link href="/products/new">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </Link>
      </div>
      <ProductsList />
    </div>
  );
}
