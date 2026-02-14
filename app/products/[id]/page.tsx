import { getProduct } from "@/app/actions/products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const fields = product.fields || [];
  const events = product.events || [];
  const flows = product.flows || [];

  const purposeColors: Record<string, string> = {
    activation: "bg-blue-100 text-blue-800",
    retention: "bg-green-100 text-green-800",
    winback: "bg-amber-100 text-amber-800",
    transactional: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        {product.description && (
          <p className="mt-2 text-slate-600 dark:text-slate-400">{product.description}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fields.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{flows.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="flows" className="space-y-6">
        <TabsList>
          <TabsTrigger value="flows">Flows ({flows.length})</TabsTrigger>
          <TabsTrigger value="fields">Fields ({fields.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="flows">
          <Card>
            <CardHeader>
              <CardTitle>Flows</CardTitle>
            </CardHeader>
            <CardContent>
              {flows.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No flows yet</p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Flow Name</TableHead>
                        <TableHead className="font-semibold">Purpose</TableHead>
                        <TableHead className="font-semibold">Trigger</TableHead>
                        <TableHead className="font-semibold">Channels</TableHead>
                        <TableHead className="font-semibold text-center">Live</TableHead>
                        <TableHead className="font-semibold text-center">STO</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(flows as any[]).map((flow: any) => (
                        <TableRow key={flow.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">
                            <Link
                              href={`/flows/${flow.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {flow.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge className={purposeColors[flow.purpose]}>
                              {flow.purpose}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{flow.trigger_type}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {flow.channels?.map((channel: string) => (
                                <Badge key={channel} variant="outline" className="text-xs">
                                  {channel}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {flow.live ? (
                              <Badge className="bg-green-100 text-green-800">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {flow.sto ? (
                              <Badge className="bg-green-100 text-green-800">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-800">
                                No
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields">
          <Card>
            <CardHeader>
              <CardTitle>Fields</CardTitle>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No fields yet</p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Field Name</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Format</TableHead>
                        <TableHead className="font-semibold text-center">Live</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(fields as any[]).map((field: any) => (
                        <TableRow key={field.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{field.name}</TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {field.description || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{field.format || "—"}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {field.live ? (
                              <Badge className="bg-green-100 text-green-800">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No events yet</p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Event Name</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(events as any[]).map((event: any) => (
                        <TableRow key={event.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{event.name}</TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {event.description || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
