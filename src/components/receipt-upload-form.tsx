"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReceiptAction } from "@/features/receipts/actions";

type ReceiptUploadFormProps = {
  maxUploadSizeMb: number;
};

export function ReceiptUploadForm({ maxUploadSizeMb }: ReceiptUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Receipt</CardTitle>
        <CardDescription>
          Upload an image plus key receipt details. Image files only, up to {maxUploadSizeMb}MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createReceiptAction} className="space-y-4" encType="multipart/form-data">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Fuel purchase - Truck 12" required minLength={3} maxLength={120} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea id="note" name="note" maxLength={1000} placeholder="Any context or approval note..." />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Receipt Image</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required
              onChange={(event) => {
                setFile(event.currentTarget.files?.[0] ?? null);
              }}
            />
          </div>

          {previewUrl ? (
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="mb-2 text-sm text-muted-foreground">Image preview</p>
              <Image
                alt="Receipt preview"
                src={previewUrl}
                unoptimized
                width={1200}
                height={900}
                className="max-h-72 w-full rounded-md object-contain"
              />
            </div>
          ) : null}

          <Button type="submit" className="w-full sm:w-auto">Create Receipt</Button>
        </form>
      </CardContent>
    </Card>
  );
}
