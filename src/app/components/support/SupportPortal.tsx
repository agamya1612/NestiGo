import { useState } from "react";
import {
  AlertCircle, FileCheck, RefreshCw, MessageSquare, ScrollText, Headphones,
  CheckCircle2, XCircle, Search, ChevronDown, ChevronRight, Clock, Eye
} from "lucide-react";
import { PortalShell } from "../PortalShell";

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
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["all", "open", "resolved"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg capitalize text-xs"
            style={{
              background: filter === f ? "#EC489920" : "#111D38",
              border: `1px solid ${filter === f ? "#EC489940" : "rgba(255,255,255,0.06)"}`,
              color: filter === f ? "#EC4899" : "#6B7FA0",
              fontFamily: "DM Sans", fontWeight: 500,
            }}>
            {f} {f !== "all" && `(${disputes.filter((d) => d.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dispute list */}
        <div className="space-y-3">
          {filtered.map((dispute) => (
            <div key={dispute.id}
              className={`rounded-xl overflow-hidden cursor-pointer transition-all ${selectedId === dispute.id ? "ring-2" : ""}`}
              style={{
                background: "#0C1225",
                border: `1px solid ${dispute.status === "open" ? "#FF3B5C30" : "rgba(255,255,255,0.06)"}`,
                ringColor: "#EC4899",
              }}
              onClick={() => setSelectedId(dispute.id === selectedId ? null : dispute.id)}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <span style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontSize: "0.78rem", fontWeight: 600 }}>{dispute.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${dispute.status === "open" ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-green-400 bg-green-400/10 border-green-400/20"}`}
                  style={{ fontFamily: "DM Sans" }}>
                  {dispute.status}
                </span>
              </div>
              <div className="p-4">
                <p style={{ color: "#A0B4D0", fontFamily: "DM Sans", fontSize: "0.8rem" }}>{dispute.customer}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded text-xs"
                    style={{ background: "#FF3B5C20", color: "#FF3B5C", fontFamily: "DM Sans" }}>
                    {dispute.reason}
                  </span>
                  <span style={{ color: "#3B4A6B", fontSize: "0.7rem", fontFamily: "JetBrains Mono" }}>{dispute.orderId}</span>
                </div>
                <p style={{ color: "#6B7FA0", fontSize: "0.75rem", fontFamily: "DM Sans", marginTop: "8px", lineHeight: 1.5 }}>
                  {dispute.notes.slice(0, 80)}...
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Resolution drawer */}
        {selected && (
          <div className="rounded-xl p-5 space-y-4 h-fit" style={{ background: "#0C1225", border: "1px solid #EC489930" }}>
            <h3 style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700 }}>Resolve {selected.id}</h3>
            <div>
              <p style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>Customer</p>
              <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontWeight: 500, marginTop: "2px" }}>{selected.customer}</p>
            </div>
            <div>
              <p style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>Original Complaint</p>
              <p style={{ color: "#A0B4D0", fontFamily: "DM Sans", fontSize: "0.82rem", marginTop: "4px", lineHeight: 1.6 }}>{selected.notes}</p>
            </div>
            {selected.status === "open" ? (
              <>
                <div>
                  <label style={{ color: "#A0B4D0", fontSize: "0.78rem", fontFamily: "DM Sans", fontWeight: 600 }}>Resolution Notes</label>
                  <textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe the resolution action taken..."
                    rows={4} className="w-full mt-1.5 px-3 py-2 rounded-lg outline-none resize-none"
                    style={{ background: "#111D38", border: "1px solid rgba(255,255,255,0.07)", color: "#E4ECF7", fontFamily: "DM Sans", fontSize: "0.875rem" }} />
                </div>
                <button disabled={!resolutionNotes.trim()} onClick={resolve}
                  className="w-full py-2.5 rounded-xl"
                  style={{ background: resolutionNotes.trim() ? "#EC4899" : "#162040", color: resolutionNotes.trim() ? "white" : "#6B7FA0", fontFamily: "Outfit", fontWeight: 700 }}>
                  Mark as Resolved
                </button>
              </>
            ) : (
              <div className="rounded-xl p-3 text-center" style={{ background: "#00D4AA10", border: "1px solid #00D4AA30" }}>
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1" style={{ color: "#00D4AA" }} />
                <p style={{ color: "#00D4AA", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.82rem" }}>Dispute Resolved</p>
              </div>
            )}
          </div>
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
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: "#F59E0B10", border: "1px solid #F59E0B30" }}>
        <Clock className="w-4 h-4" style={{ color: "#F59E0B" }} />
        <p style={{ color: "#F59E0B", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.82rem" }}>
          {queue.filter((k) => k.status === "pending").length} provider KYC documents awaiting verification
        </p>
      </div>

      {queue.map((doc) => (
        <div key={doc.id} className="rounded-xl overflow-hidden"
          style={{ background: "#0C1225", border: `1px solid ${doc.status === "verified" ? "#00D4AA30" : doc.status === "rejected" ? "#FF3B5C30" : "rgba(255,255,255,0.06)"}` }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <span style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontSize: "0.78rem" }}>{doc.id}</span>
              <span style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>· {doc.provider}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${doc.status === "verified" ? "text-green-400 bg-green-400/10 border-green-400/20" : doc.status === "rejected" ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-amber-400 bg-amber-400/10 border-amber-400/20"}`}
              style={{ fontFamily: "DM Sans" }}>
              {doc.status}
            </span>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Document preview */}
            <div className="rounded-xl overflow-hidden relative" style={{ height: "160px", background: "#111D38", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <FileCheck className="w-8 h-8" style={{ color: "#F59E0B" }} />
                <p style={{ color: "#A0B4D0", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.78rem" }}>{doc.docType}</p>
                <p style={{ color: "#3B4A6B", fontFamily: "JetBrains Mono", fontSize: "0.6rem", textAlign: "center", padding: "0 8px", wordBreak: "break-all" }}>
                  {doc.url}
                </p>
              </div>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs"
                style={{ background: "#F59E0B", color: "#06091A", fontFamily: "JetBrains Mono" }}>SIGNED URL ✓</div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Provider ID", value: doc.providerId },
                  { label: "Document Type", value: doc.docType },
                  { label: "Uploaded", value: doc.uploaded.split(" ")[0] },
                  { label: "Time", value: doc.uploaded.split(" ")[1] },
                ].map((row) => (
                  <div key={row.label}>
                    <p style={{ color: "#6B7FA0", fontSize: "0.7rem", fontFamily: "DM Sans" }}>{row.label}</p>
                    <p style={{ color: "#A0B4D0", fontFamily: "JetBrains Mono", fontSize: "0.78rem", marginTop: "2px" }}>{row.value}</p>
                  </div>
                ))}
              </div>

              {doc.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => verify(doc.id, "rejected")}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm"
                    style={{ background: "#FF3B5C15", border: "1px solid #FF3B5C40", color: "#FF3B5C", fontFamily: "Outfit", fontWeight: 700 }}>
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => verify(doc.id, "verified")}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm"
                    style={{ background: "#00D4AA", color: "#06091A", fontFamily: "Outfit", fontWeight: 700 }}>
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                </div>
              ) : (
                <div className="rounded-xl p-3 text-center"
                  style={{ background: doc.status === "verified" ? "#00D4AA10" : "#FF3B5C10", border: `1px solid ${doc.status === "verified" ? "#00D4AA30" : "#FF3B5C30"}` }}>
                  <p style={{ color: doc.status === "verified" ? "#00D4AA" : "#FF3B5C", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.82rem" }}>
                    {doc.status === "verified" ? "✓ Approved — Provider Active" : "✗ Document Rejected"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: "#FF3B5C10", border: "1px solid #FF3B5C30" }}>
        <AlertCircle className="w-4 h-4" style={{ color: "#FF3B5C" }} />
        <p style={{ color: "#FF3B5C", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.82rem" }}>
          {refunds.filter((r) => r.status === "failed").length} failed refunds require manual retry
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Refund ID", "Order", "Customer", "Amount", "Status", "Reason", "Date", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap"
                  style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {refunds.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < refunds.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <td className="px-4 py-3">
                  <span style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontSize: "0.78rem" }}>{r.id}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: "#A0B4D0", fontFamily: "JetBrains Mono", fontSize: "0.78rem" }}>{r.orderId}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>{r.customer}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: "#FF6B00", fontFamily: "Outfit", fontWeight: 700 }}>₹{r.amount}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${r.status === "completed" ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}
                    style={{ fontFamily: "DM Sans" }}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>{r.reason}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: "#6B7FA0", fontFamily: "JetBrains Mono", fontSize: "0.72rem" }}>{r.created}</span>
                </td>
                <td className="px-4 py-3">
                  {r.status === "failed" ? (
                    <button onClick={() => retry(r.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs"
                      style={{ background: "#F59E0B20", border: "1px solid #F59E0B40", color: "#F59E0B", fontFamily: "DM Sans", fontWeight: 600 }}>
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  ) : (
                    <span style={{ color: "#3B4A6B", fontSize: "0.72rem", fontFamily: "DM Sans" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl min-w-48"
          style={{ background: "#111D38", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Search className="w-4 h-4" style={{ color: "#6B7FA0" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by phone or message..."
            className="bg-transparent outline-none flex-1"
            style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontSize: "0.875rem" }} />
        </div>
        <div className="flex gap-1.5">
          {["all", "sent", "failed_invalid_phone"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-xl text-xs"
              style={{
                background: statusFilter === s ? (s === "failed_invalid_phone" ? "#FF3B5C20" : "#00D4AA20") : "#111D38",
                border: `1px solid ${statusFilter === s ? (s === "failed_invalid_phone" ? "#FF3B5C40" : "#00D4AA40") : "rgba(255,255,255,0.06)"}`,
                color: statusFilter === s ? (s === "failed_invalid_phone" ? "#FF3B5C" : "#00D4AA") : "#6B7FA0",
                fontFamily: "DM Sans",
              }}>
              {s === "all" ? "All" : s === "sent" ? "Sent" : "Failed"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        {filtered.map((log, i) => (
          <div key={log.id} className={`p-4 ${i > 0 ? "border-t" : ""}`}
            style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: log.status === "sent" ? "#00D4AA20" : "#FF3B5C20" }}>
                <MessageSquare className="w-3.5 h-3.5" style={{ color: log.status === "sent" ? "#00D4AA" : "#FF3B5C" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontSize: "0.82rem", fontWeight: 600 }}>
                    {log.recipient}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${log.status === "sent" ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}
                    style={{ fontFamily: "DM Sans" }}>
                    {log.status === "sent" ? "SENT" : "FAILED"}
                  </span>
                  {log.status === "failed_invalid_phone" && (
                    <span style={{ color: "#FF3B5C", fontSize: "0.65rem", fontFamily: "JetBrains Mono" }}>
                      INVALID E.164 FORMAT
                    </span>
                  )}
                </div>
                <p style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.78rem", lineHeight: 1.5 }}>{log.message}</p>
                <p style={{ color: "#3B4A6B", fontFamily: "JetBrains Mono", fontSize: "0.65rem", marginTop: "4px" }}>{log.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: "#3B82F610", border: "1px solid #3B82F630" }}>
        <ScrollText className="w-4 h-4" style={{ color: "#3B82F6" }} />
        <p style={{ color: "#3B82F6", fontFamily: "JetBrains Mono", fontWeight: 500, fontSize: "0.78rem" }}>
          KAFKA AUDIT STREAM · audit-service-group · {mockAuditLogs.length} events
        </p>
        <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: "#3B82F6" }} />
      </div>

      {/* Topic tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {topics.map((t) => {
          const color = TOPIC_COLORS[t] ?? "#6B7FA0";
          return (
            <button key={t} onClick={() => setTopicFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: topicFilter === t ? `${color}20` : "#111D38",
                border: `1px solid ${topicFilter === t ? `${color}40` : "rgba(255,255,255,0.06)"}`,
                color: topicFilter === t ? color : "#6B7FA0",
                fontFamily: "JetBrains Mono", fontWeight: 500,
              }}>
              {t === "all" ? "ALL TOPICS" : t.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        {filtered.map((log, i) => {
          const topicColor = TOPIC_COLORS[log.topic] ?? "#6B7FA0";
          const isExpanded = expanded === log.id;
          return (
            <div key={log.id} className={`${i > 0 ? "border-t" : ""}`}
              style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              <button
                onClick={() => setExpanded(isExpanded ? null : log.id)}
                className="w-full text-left px-4 py-3 flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: topicColor, boxShadow: `0 0 6px ${topicColor}60` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-xs"
                      style={{ background: `${topicColor}20`, color: topicColor, fontFamily: "JetBrains Mono", fontSize: "0.65rem" }}>
                      {log.topic.toUpperCase()}
                    </span>
                    <span style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontWeight: 600, fontSize: "0.8rem" }}>
                      {log.event}
                    </span>
                  </div>
                  <p style={{ color: "#3B4A6B", fontFamily: "JetBrains Mono", fontSize: "0.65rem", marginTop: "2px" }}>
                    {log.timestamp}
                  </p>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#6B7FA0" }} /> : <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#6B7FA0" }} />}
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 pl-9">
                  <pre className="p-3 rounded-lg overflow-x-auto text-xs"
                    style={{ background: "#06091A", border: "1px solid rgba(255,255,255,0.06)", color: "#00D4AA", fontFamily: "JetBrains Mono", lineHeight: 1.6 }}>
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
      portalColor="#EC4899"
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
