import { useEffect, useState } from "react";
import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@shared/lib/firebase";
import { toast } from "sonner";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/ui/dialog";
import { Badge } from "@shared/ui/badge";
import { Loader2, Plus, Pencil, Trash2, BookOpen, Bot, Zap } from "lucide-react";
import { Label } from "@shared/ui/label";
import { Switch } from "@shared/ui/switch";
import { Separator } from "@shared/ui/separator";

export type PlanFeatureDefaults = {
  contentLibrary: boolean;
  chatbot: boolean;
  chatDailyTokenLimit: number;
  dpp: boolean;
  dppDailyLimit: number;
};

export type Plan = {
  id: string;
  name: string;
  pricePerSeat: number;
  features: string[];
  isActive: boolean;
  isArchived?: boolean;
  purchaseCount?: number;
  featureDefaults?: PlanFeatureDefaults;
};

const DEFAULT_FEATURE_DEFAULTS: PlanFeatureDefaults = {
  contentLibrary: false,
  chatbot: false,
  chatDailyTokenLimit: 100000,
  dpp: false,
  dppDailyLimit: 3,
};

export default function PlanManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [pricePerSeat, setPricePerSeat] = useState("");
  const [features, setFeatures] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [fd, setFd] = useState<PlanFeatureDefaults>(DEFAULT_FEATURE_DEFAULTS);

  useEffect(() => {
    const q = query(collection(db, "plans"), orderBy("name"));
    return onSnapshot(q, (snap) => {
      setPlans(
        snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Plan, "id">) }))
          .filter((p) => !p.isArchived)
      );
      setLoading(false);
    });
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setPricePerSeat("");
    setFeatures("");
    setIsActive(true);
    setFd(DEFAULT_FEATURE_DEFAULTS);
    setOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditing(plan);
    setName(plan.name);
    setPricePerSeat(String(plan.pricePerSeat));
    setFeatures(plan.features.join(", "));
    setIsActive(plan.isActive);
    setFd(plan.featureDefaults ?? DEFAULT_FEATURE_DEFAULTS);
    setOpen(true);
  }

  async function handleSave() {
    const price = parseInt(pricePerSeat, 10);
    if (!name.trim() || isNaN(price) || price <= 0) {
      toast.error("Name and valid price per seat required");
      return;
    }
    const featureList = features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    setBusy(true);
    try {
      const payload = {
        name,
        pricePerSeat: price,
        features: featureList,
        isActive,
        featureDefaults: {
          ...fd,
          chatDailyTokenLimit: Math.max(0, Math.floor(fd.chatDailyTokenLimit)),
          dppDailyLimit: Math.max(0, Math.floor(fd.dppDailyLimit)),
        },
      };
      if (editing) {
        await updateDoc(doc(db, "plans", editing.id), payload);
        toast.success("Plan updated");
      } else {
        await addDoc(collection(db, "plans"), { ...payload, createdAt: new Date() });
        toast.success("Plan created");
      }
      setOpen(false);
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive(plan: Plan) {
    if (plan.purchaseCount && plan.purchaseCount > 0) {
      toast.error(
        `"${plan.name}" has been purchased by ${plan.purchaseCount} educator(s) and cannot be deleted. Deactivate it instead.`
      );
      return;
    }
    if (!confirm(`Archive plan "${plan.name}"? This cannot be undone.`)) return;
    await updateDoc(doc(db, "plans", plan.id), { isActive: false, isArchived: true });
    toast.success("Plan archived");
  }

  async function toggleActive(plan: Plan) {
    await updateDoc(doc(db, "plans", plan.id), { isActive: !plan.isActive });
  }

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plans</h1>
          <p className="text-sm text-muted-foreground">Manage seat plans and feature defaults</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Plan
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <Badge variant={plan.isActive ? "default" : "secondary"}>
                  {plan.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-bold">
                ₹{plan.pricePerSeat}
                <span className="text-sm font-normal text-muted-foreground"> / seat</span>
              </p>
              {plan.features.length > 0 && (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              )}

              {plan.featureDefaults && (
                <div className="space-y-1 pt-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Included features
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <FeatureBadge
                      icon={<BookOpen className="h-3 w-3" />}
                      label="Content Library"
                      enabled={plan.featureDefaults.contentLibrary}
                    />
                    <FeatureBadge
                      icon={<Bot className="h-3 w-3" />}
                      label={`Chatbot (${(plan.featureDefaults.chatDailyTokenLimit / 1000).toFixed(0)}k/day)`}
                      enabled={plan.featureDefaults.chatbot}
                    />
                    <FeatureBadge
                      icon={<Zap className="h-3 w-3" />}
                      label={`DPP (${plan.featureDefaults.dppDailyLimit}/day)`}
                      enabled={plan.featureDefaults.dpp}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(plan)}>
                  <Pencil className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleActive(plan)}>
                  {plan.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleArchive(plan)}
                  disabled={!!(plan.purchaseCount && plan.purchaseCount > 0)}
                  title={
                    plan.purchaseCount && plan.purchaseCount > 0
                      ? "Plan has active purchases — deactivate instead"
                      : "Archive plan"
                  }
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {plans.length === 0 && (
          <p className="col-span-3 py-8 text-center text-muted-foreground">
            No plans yet. Create one.
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Plan" : "New Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Plan Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Basic, Pro"
              />
            </div>
            <div className="space-y-1">
              <Label>Price Per Seat (₹)</Label>
              <Input
                type="number"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                placeholder="e.g. 199"
              />
              <p className="text-xs text-muted-foreground">
                {pricePerSeat && !isNaN(parseInt(pricePerSeat))
                  ? `= ₹${parseInt(pricePerSeat)}`
                  : "Enter price in rupees"}
              </p>
            </div>
            <div className="space-y-1">
              <Label>Features (comma-separated display text)</Label>
              <Input
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Unlimited tests, AI analysis, ..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Active</Label>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-semibold">Feature Defaults</p>
              <p className="text-xs text-muted-foreground">
                Applied to educator automatically when seats are assigned with this plan.
              </p>

              <div className="space-y-3">
                {/* Content Library */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Content Library</p>
                      <p className="text-xs text-muted-foreground">
                        Access to upload and manage books/notes
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={fd.contentLibrary}
                    onCheckedChange={(v) => setFd((p) => ({ ...p, contentLibrary: v }))}
                  />
                </div>

                {/* Chatbot */}
                <div className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">AI Doubt Chatbot</p>
                        <p className="text-xs text-muted-foreground">
                          Student RAG chatbot powered by course content
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={fd.chatbot}
                      onCheckedChange={(v) => setFd((p) => ({ ...p, chatbot: v }))}
                    />
                  </div>
                  {fd.chatbot && (
                    <div className="pl-6">
                      <Label className="text-xs text-muted-foreground">Daily Token Limit</Label>
                      <Input
                        type="number"
                        min={0}
                        className="mt-1 max-w-[160px]"
                        value={fd.chatDailyTokenLimit}
                        onChange={(e) =>
                          setFd((p) => ({ ...p, chatDailyTokenLimit: Number(e.target.value) }))
                        }
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {(fd.chatDailyTokenLimit / 1000).toFixed(0)}k tokens/day
                      </p>
                    </div>
                  )}
                </div>

                {/* DPP */}
                <div className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">DPP Generator</p>
                        <p className="text-xs text-muted-foreground">
                          AI-generated daily practice papers
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={fd.dpp}
                      onCheckedChange={(v) => setFd((p) => ({ ...p, dpp: v }))}
                    />
                  </div>
                  {fd.dpp && (
                    <div className="pl-6">
                      <Label className="text-xs text-muted-foreground">
                        Daily Generation Limit
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        className="mt-1 max-w-[160px]"
                        value={fd.dppDailyLimit}
                        onChange={(e) =>
                          setFd((p) => ({ ...p, dppDailyLimit: Number(e.target.value) }))
                        }
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {fd.dppDailyLimit} DPPs/day
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeatureBadge({
  icon,
  label,
  enabled,
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${enabled ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground line-through"}`}
    >
      {icon}
      {label}
    </span>
  );
}
