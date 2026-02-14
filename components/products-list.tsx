import { getProducts } from "@/app/actions/products";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Zap, Workflow, ArrowRight } from "lucide-react";

export async function ProductsList() {
  const products = await getProducts();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="text-center py-12 text-slate-500">
            <p>No products yet. Create your first product to get started!</p>
          </CardContent>
        </Card>
      ) : (
        products.map((product: any) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <Card className="hover:shadow-lg transition-all hover:border-blue-500 h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{product.name}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </CardTitle>
                {product.description && (
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      <span className="font-semibold">{product.fields?.[0]?.count || 0}</span>{" "}
                      <span className="text-slate-500">fields</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">
                      <span className="font-semibold">{product.events?.[0]?.count || 0}</span>{" "}
                      <span className="text-slate-500">events</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      <span className="font-semibold">{product.flows?.[0]?.count || 0}</span>{" "}
                      <span className="text-slate-500">flows</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
