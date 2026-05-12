import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@shared/lib/firebase";
import { toast } from "sonner";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Label } from "@shared/ui/label";
import { Badge } from "@shared/ui/badge";
import { Card, CardContent } from "@shared/ui/card";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@shared/ui/table";
import { Switch } from "@shared/ui/switch";

type ContentType = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
};

const DEFAULT_TYPES = [
  { name: "Book", slug: "book", isActive: true, order: 0 },
  { name: "Note", slug: "note", isActive: true, order: 1 },
  { name: "Mind Map", slug: "mindmap", isActive: true, order: 2 },
  { name: "Formula Sheet", slug: "formulasheet", isActive: true, order: 3 },
];

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export default function ContentTypeManagement() {
  const [types, setTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "contentTypes"), orderBy("order")),
      async (snap) => {
        setTypes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContentType, "id">) })));
        setLoading(false);

        if (snap.empty) {
          setSeeding(true);
          try {
            const batch = writeBatch(db);
            DEFAULT_TYPES.forEach((t) => {
              batch.set(doc(collection(db, "contentTypes")), t);
            });
            await batch.commit();
          } catch {
            // non-fatal
          } finally {
            setSeeding(false);
          }
        }
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  async function handleAdd() {
    const n = name.trim();
    if (!n) return toast.error("Name required");
    const slug = toSlug(n);
    if (!slug) return toast.error("Invalid name");
    if (types.some((t) => t.slug === slug)) return toast.error("Type already exists");

    setBusy(true);
    try {
      await addDoc(collection(db, "contentTypes"), {
        name: n,
        slug,
        isActive: true,
        order: types.length,
      });
      toast.success("Content type added");
      setName("");
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Failed to add");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(t: ContentType) {
    try {
      await updateDoc(doc(db, "contentTypes", t.id), { isActive: !t.isActive });
    } catch (e: any) {
      toast.error(e?.message || "Failed to update");
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Types</h1>
          <p className="text-sm text-muted-foreground">
            Manage categories available for content uploads across the platform
          </p>
        </div>
        <Button
          onClick={() => {
            setName("");
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Type
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading || seeding ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{t.slug}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.isActive ? "default" : "secondary"}>
                        {t.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={t.isActive} onCheckedChange={() => toggleActive(t)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Content Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Video Lecture"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
              />
              {name.trim() && (
                <p className="text-xs text-muted-foreground">
                  Slug: <code className="rounded bg-muted px-1">{toSlug(name)}</code>
                </p>
              )}
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
