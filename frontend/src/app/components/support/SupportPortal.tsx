import { useState } from "react";
import {
  AlertCircle, FileCheck, RefreshCw, MessageSquare, ScrollText, Headphones,
  CheckCircle2, XCircle, Search, ChevronDown, ChevronRight, Clock, Eye
} from "lucide-react";
import { PortalShell } from "../PortalShell";

import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/app/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Separator } from "@/app/components/ui/separator";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Label } from "@/app/components/ui/label";

const mockDisputes = [
  { id: "DSP-1041", orderId: "ORD-2026-4720", customer: "sunita.patel@nestigo.com", reason: "Missing items", notes: "Ordered 6 items but only received 4. Missing: Amul Butter and Toor Dal.", status: "open", created: "2026-07-25 18:20" },
  { id: "DSP-1039", orderId: "ORD-2026-4680", customer: "rohan.kumar@nestigo.com", reason: "Late delivery", notes: "Delivery was 2 hours late. Food was cold and unusable.", status: "open", created: "2026-07-24 20:10" },
  { id: "DSP-1035", orderId: "ORD-2026-4650", customer: "meera.iyer@nestigo.com", reason: "Driver conduct", notes: "Driver was rude and refused to carry items to the door.", status: "resolved", created: "2026-07-23 11:30" },
  { id: "DSP-1031", orderId: "ORD-2026-4620", customer: "vikram.nair@nestigo.com", reason: "Damaged items", notes: "Bakery cake was damaged during delivery. Box was crushed.", status: "resolved", created: "2026-07-22 15:45" },
];

const mockKycQueue = [
  { id: "KYC-8201", providerId: "PROV-5521", provider: "SwiftMove Logistics", docType: "Trade License", url: "https://storage.nestigo.com/signed/kyc/swiftmove/trade.pdf", uploaded: "2026-07-28 09:10", status: "pending" },
  { id: "KYC-8198", providerId: "PROV-5518", provider: "CityPharm Stores", docType: "Commercial License", url: "https://storage.nestigo.com/signed/kyc/citypharm/license.pdf", uploaded: "2026-07-27 15:30", status: "pending" },
  { id: "KYC-8191", providerId: "PROV-5508", provider: "FreshMart Groceries", docType: "PAN Card", url: "https://storage.nestigo.com/signed/kyc/freshmart/pan.pdf", uploaded: "2026-07-26 11:00", status: "verified" },
];

const mockRefunds = [
  { id: "REF-3041", orderId: "ORD-2026-4650", customer: "meera.iyer@nestigo.com", amount: 4500, status: "completed", created: "2026-07-23", reason: "Customer cancellation" },
  { id: "REF-3038", orderId: "ORD-2026-4612", customer: "amit.verma@nestigo.com", amount: 799, status: "failed", created: "2026-07-22", reason: "Provider no-show" },
  { id: "REF-3035", orderId: "ORD-2026-4590", customer: "priya.sharma@nestigo.com", amount: 85, status: "completed", created: "2026-07-21", reason: "Item unavailable" },
  { id: "REF-3031", orderId: "ORD-2026-4570", customer: "deepa.rao@nestigo.com", amount: 120, status: "failed", created: "2026-07-20", reason: "Prescription rejected" },
];

const mockLogs = [
  { id: 1, recipient: "+919876543210", message: "NestiGo: New job offer ORD-2026-4891 - Paracetamol delivery - ₹320 payout. Accept within 5 seconds.", status: "sent", timestamp: "2026-07-28 14:32:01" },
  { id: 2, recipient: "+918765432109", message: "NestiGo: Your order ORD-2026-4850 has been picked up by Ramesh Kumar. ETA: 15 minutes.", status: "sent", timestamp: "2026-07-28 13:45:22" },
  { id: 3, recipient: "+0000000000", message: "NestiGo: Assignment offer ORD-2026-4848 - Grocery delivery.", status: "failed_invalid_phone", timestamp: "2026-07-28 13:40:11" },
  { id: 4, recipient: "+919988776655", message: "NestiGo: Your KYC has been approved. You are now active on the platform.", status: "sent", timestamp: "2026-07-28 12:15:30" },
  { id: 5, recipient: "+917766554433", message: "NestiGo: Assignment offer for shifting job ORD-2026-4820.", status: "sent", timestamp: "2026-07-28 11:30:44" },
];

const mockAuditLogs = [
  { id: 1, topic: "orders", event: "order.placed", payload: { order_id: "ORD-2026-4891", customer_id: "usr-881", total: 250, vertical: "pharma" }, timestamp: "2026-07-28 14:31:55" },
  { id: 2, topic: "payments", event: "payment.captured", payload: { order_id: "ORD-2026-4891", amount: 250, gateway: "razorpay" }, timestamp: "2026-07-28 14:32:10" },
  { id: 3, topic: "provider.assignments", event: "provider.assignment.accepted", payload: { assignment_id: "ASN-7821", provider_id: "PROV-5501", order_id: "ORD-2026-4891" }, timestamp: "2026-07-28 14:32:45" },
  { id: 4, topic: "orders", event: "order.status.updated", payload: { order_id: "ORD-2026-4891", status: "picked_up", driver_id: "DRV-1102" }, timestamp: "2026-07-28 14:48:12" },
  { id: 5, topic: "notifications", event: "sms.sent", payload: { recipient: "+919876543210", message_preview: "Order picked up...", status: "sent" }, timestamp: "2026-07-28 14:48:14" },
  { id: 6, topic: "payments", event: "settlement.processed", payload: { provider_id: "PROV-5501", amount: 199, order_id: "ORD-2026-4850" }, timestamp: "2026-07-28 15:10:30" },
];

const TOPIC_COLORS: Record<string, string> = {
  orders: "#3B82F6",
  payments: "#00D4AA",
  "provider.assignments": "#F59E0B",
  notifications: "#EC4899",
};

// Disputes Page
function DisputesPage() {
  const [disputes, setDisputes] = useState(mockDisputes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  const filtered = disputes.filter((d) => filter === "all" || d.status === filter);
  const selected = disputes.find((d) => d.id === selectedId);

  const resolve = () => {
    if (!selectedId || !resolutionNotes.trim()) return;
    setDisputes((prev) => prev.map((d) => d.id === selectedId ? { ...d, status: "resolved" } : d));
    setSelectedId(null);
    setResolutionNotes("");
  };

  return (
    <div className="space-y-4 page-enter">
      <div className="flex gap-2">
        <Tabs value={filter} onValueChange={(val) => setFilter(val as any)} className="w-full sm:w-auto">
          <TabsList className="bg-surface-2">
            {(["all", "open", "resolved"] as const).map((f) => (
              <TabsTrigger key={f} value={f} className="capitalize">
                {f} {f !== "all" && `(${disputes.filter((d) => d.status === f).length})`}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dispute list */}
        <div className="space-y-3 stagger-children">
          {filtered.length === 0 && (
            <div className="empty-state bg-card rounded-xl border border-border">
              <AlertCircle className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-sm font-medium">No disputes found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
          {filtered.map((dispute) => (
            <Card
              key={dispute.id}
              role="button"
              tabIndex={0}
              aria-label={`Select dispute ${dispute.id}`}
              className={`cursor-pointer hover-lift transition-all ${selectedId === dispute.id ? "ring-2 ring-primary border-primary" : ""}`}
              onClick={() => setSelectedId(dispute.id === selectedId ? null : dispute.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(dispute.id === selectedId ? null : dispute.id);
                }
              }}
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <span className="text-foreground font-mono text-sm font-semibold">{dispute.id}</span>
                <Badge variant={dispute.status === "open" ? "destructive" : "secondary"} className={dispute.status === "resolved" ? "bg-success/10 text-success hover:bg-success/20 border-success/20" : ""}>
                  {dispute.status}
                </Badge>
              </div>
              <CardContent className="p-4">
                <p className="text-muted-foreground text-sm">{dispute.customer}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-normal">
                    {dispute.reason}
                  </Badge>
                  <span className="text-muted-foreground text-xs font-mono">{dispute.orderId}</span>
                </div>
                <p className="text-muted-foreground text-xs mt-2 leading-relaxed">
                  {dispute.notes.slice(0, 80)}...
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resolution drawer */}
        {selected && (
          <Card className="h-fit sticky top-4 border-primary/30 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="font-heading">Resolve {selected.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Customer</Label>
                <p className="text-foreground font-medium mt-0.5">{selected.customer}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Original Complaint</Label>
                <p className="text-foreground text-sm mt-1 leading-relaxed bg-surface-1 p-3 rounded-md">{selected.notes}</p>
              </div>
              {selected.status === "open" ? (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Resolution Notes</Label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe the resolution action taken..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-md outline-none resize-none bg-background border border-border text-foreground text-sm focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <Button
                    disabled={!resolutionNotes.trim()}
                    onClick={resolve}
                    className="w-full font-bold mt-2"
                  >
                    Mark as Resolved
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl p-3 text-center bg-success/10 border border-success/30">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-success" />
                  <p className="text-success font-semibold text-sm">Dispute Resolved</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// KYC Verification Page
function KycPage() {
  const [queue, setQueue] = useState(mockKycQueue);

  const verify = (id: string, status: "verified" | "rejected") => {
    setQueue((prev) => prev.map((k) => k.id === id ? { ...k, status } : k));
  };

  return (
    <div className="space-y-4 max-w-3xl page-enter">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/30">
        <Clock className="w-4 h-4 text-warning" />
        <p className="text-warning font-semibold text-sm">
          {queue.filter((k) => k.status === "pending").length} provider KYC documents awaiting verification
        </p>
      </div>

      <div className="space-y-4 stagger-children">
        {queue.map((doc) => (
          <Card key={doc.id} className={`overflow-hidden border ${doc.status === "verified" ? "border-success/30" : doc.status === "rejected" ? "border-destructive/30" : "border-border"}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-foreground font-mono text-sm">{doc.id}</span>
                <span className="text-muted-foreground text-sm">· {doc.provider}</span>
              </div>
              <Badge variant={doc.status === "verified" ? "default" : doc.status === "rejected" ? "destructive" : "secondary"}
                className={doc.status === "verified" ? "bg-success/10 text-success hover:bg-success/20 border-success/20" : doc.status === "pending" ? "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20" : ""}>
                {doc.status}
              </Badge>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Document preview */}
              <div className="rounded-xl overflow-hidden relative h-40 bg-surface-2 border border-border flex flex-col items-center justify-center gap-2">
                <FileCheck className="w-8 h-8 text-warning" />
                <p className="text-muted-foreground font-semibold text-sm">{doc.docType}</p>
                <p className="text-muted-foreground font-mono text-xs text-center px-2 break-all line-clamp-2">
                  {doc.url}
                </p>
                <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground font-mono text-[10px] uppercase">
                  SIGNED URL ✓
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Provider ID", value: doc.providerId },
                    { label: "Document Type", value: doc.docType },
                    { label: "Uploaded", value: doc.uploaded.split(" ")[0] },
                    { label: "Time", value: doc.uploaded.split(" ")[1] },
                  ].map((row) => (
                    <div key={row.label}>
                      <p className="text-muted-foreground text-xs">{row.label}</p>
                      <p className="text-foreground font-mono text-sm mt-0.5">{row.value}</p>
                    </div>
                  ))}
                </div>

                {doc.status === "pending" ? (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => verify(doc.id, "rejected")}
                      className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10 font-bold">
                      <XCircle className="w-4 h-4 mr-1.5" /> Reject
                    </Button>
                    <Button onClick={() => verify(doc.id, "verified")}
                      className="flex-1 bg-success text-success-foreground hover:bg-success/90 font-bold">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
                    </Button>
                  </div>
                ) : (
                  <div className={`rounded-xl p-3 text-center border ${doc.status === "verified" ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"}`}>
                    <p className={`font-semibold text-sm ${doc.status === "verified" ? "text-success" : "text-destructive"}`}>
                      {doc.status === "verified" ? "✓ Approved — Provider Active" : "✗ Document Rejected"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Refunds Page
function RefundsPage() {
  const [refunds, setRefunds] = useState(mockRefunds);

  const retry = (id: string) => {
    setRefunds((prev) => prev.map((r) => r.id === id ? { ...r, status: "completed" } : r));
  };

  return (
    <div className="space-y-4 page-enter">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <p className="text-destructive font-semibold text-sm">
          {refunds.filter((r) => r.status === "failed").length} failed refunds require manual retry
        </p>
      </div>

      <Card className="overflow-hidden border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {["Refund ID", "Order", "Customer", "Amount", "Status", "Reason", "Date", "Action"].map((h) => (
                <TableHead key={h} className="text-muted-foreground font-semibold text-xs tracking-wider">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.map((r) => (
              <TableRow key={r.id} className="border-border">
                <TableCell className="font-mono text-sm">{r.id}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{r.orderId}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.customer}</TableCell>
                <TableCell className="font-bold" style={{ color: "#FF6B00" }}>₹{r.amount}</TableCell>
                <TableCell>
                  <Badge variant={r.status === "completed" ? "default" : "destructive"} className={r.status === "completed" ? "bg-success/10 text-success hover:bg-success/20 border-success/20" : "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"}>
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.reason}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{r.created}</TableCell>
                <TableCell>
                  {r.status === "failed" ? (
                    <Button variant="outline" size="sm" onClick={() => retry(r.id)}
                      className="bg-warning/10 border-warning/30 text-warning hover:bg-warning/20 font-semibold h-7 text-xs px-2">
                      <RefreshCw className="w-3 h-3 mr-1" /> Retry
                    </Button>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// Logs Page (SMS Auditor)
function LogsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockLogs.filter((l) =>
    (statusFilter === "all" || l.status === statusFilter) &&
    (l.recipient.includes(search) || l.message.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4 page-enter">
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl min-w-48 bg-surface-1 border border-border focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by phone or message..."
            className="bg-transparent outline-none flex-1 text-foreground text-sm" />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-surface-2 h-10">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent" className="data-[state=active]:text-success data-[state=active]:bg-success/10">Sent</TabsTrigger>
            <TabsTrigger value="failed_invalid_phone" className="data-[state=active]:text-destructive data-[state=active]:bg-destructive/10">Failed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="overflow-hidden border-border bg-card">
        {filtered.length === 0 && (
          <div className="empty-state py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-sm font-medium">No SMS logs found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
        {filtered.map((log, i) => (
          <div key={log.id} className={`p-4 ${i > 0 ? "border-t border-border" : ""}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${log.status === "sent" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-foreground font-mono text-sm font-semibold">
                    {log.recipient}
                  </span>
                  <Badge variant={log.status === "sent" ? "default" : "destructive"}
                    className={log.status === "sent" ? "bg-success/10 text-success hover:bg-success/20 border-success/20" : "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"}>
                    {log.status === "sent" ? "SENT" : "FAILED"}
                  </Badge>
                  {log.status === "failed_invalid_phone" && (
                    <span className="text-destructive text-[10px] font-mono">
                      INVALID E.164 FORMAT
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{log.message}</p>
                <p className="text-muted-foreground font-mono text-[10px] mt-1">{log.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// Audit Logs Page (Kafka Black Box)
function AuditPage() {
  const [topicFilter, setTopicFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = mockAuditLogs.filter((l) => topicFilter === "all" || l.topic === topicFilter);
  const topics = ["all", "orders", "payments", "provider.assignments", "notifications"];

  return (
    <div className="space-y-4 page-enter">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-info/10 border border-info/30">
        <ScrollText className="w-4 h-4 text-info" />
        <p className="text-info font-mono font-medium text-xs">
          KAFKA AUDIT STREAM · audit-service-group · {mockAuditLogs.length} events
        </p>
        <div className="ml-auto w-2 h-2 rounded-full bg-info animate-pulse-dot" />
      </div>

      {/* Topic tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {topics.map((t) => {
          const color = TOPIC_COLORS[t] ?? "var(--muted-foreground)";
          return (
            <button key={t} onClick={() => setTopicFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all font-mono font-medium"
              style={{
                background: topicFilter === t ? `${color}20` : "var(--surface-2)",
                border: `1px solid ${topicFilter === t ? `${color}40` : "var(--border)"}`,
                color: topicFilter === t ? color : "var(--muted-foreground)",
              }}>
              {t === "all" ? "ALL TOPICS" : t.toUpperCase()}
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden border-border bg-card">
        {filtered.length === 0 && (
          <div className="empty-state py-12">
            <ScrollText className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-sm font-medium">No audit events found</p>
            <p className="text-xs text-muted-foreground">Try selecting a different topic</p>
          </div>
        )}
        {filtered.map((log, i) => {
          const topicColor = TOPIC_COLORS[log.topic] ?? "var(--muted-foreground)";
          const isExpanded = expanded === log.id;
          return (
            <div key={log.id} className={`${i > 0 ? "border-t border-border" : ""}`}>
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`Toggle audit log ${log.id}`}
                onClick={() => setExpanded(isExpanded ? null : log.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpanded(isExpanded ? null : log.id);
                  }
                }}
                className="w-full text-left px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-surface-1/50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: topicColor, boxShadow: `0 0 6px ${topicColor}60` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px]"
                      style={{ background: `${topicColor}20`, color: topicColor }}>
                      {log.topic.toUpperCase()}
                    </span>
                    <span className="text-foreground font-mono font-semibold text-xs">
                      {log.event}
                    </span>
                  </div>
                  <p className="text-muted-foreground font-mono text-[10px] mt-1">
                    {log.timestamp}
                  </p>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" />}
              </div>
              {isExpanded && (
                <div className="px-4 pb-3 pl-9 animate-fade-in-up">
                  <ScrollArea className="h-[120px] sm:h-auto rounded-lg">
                    <pre className="p-3 rounded-lg overflow-x-auto text-xs bg-black text-[#00D4AA] font-mono leading-relaxed border border-border">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}

const navItems = [
  { id: "disputes", label: "Disputes", icon: AlertCircle, badge: 2 },
  { id: "kyc", label: "KYC Desk", icon: FileCheck, badge: 2 },
  { id: "refunds", label: "Refunds", icon: RefreshCw },
  { id: "logs", label: "SMS Logs", icon: MessageSquare },
  { id: "audit", label: "Audit Logs", icon: ScrollText },
];

export function SupportPortal({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage] = useState("disputes");

  return (
    <PortalShell
      portalName="Support Portal"
      portalColor="var(--portal-support)"
      portalIcon={Headphones}
      navItems={navItems}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={onLogout}
      userName="Support Agent"
      userRole="Support Specialist"
    >
      {activePage === "disputes" && <DisputesPage />}
      {activePage === "kyc" && <KycPage />}
      {activePage === "refunds" && <RefundsPage />}
      {activePage === "logs" && <LogsPage />}
      {activePage === "audit" && <AuditPage />}
    </PortalShell>
  );
}
