import { useEffect, useState } from "react";
import { getAdminReturns, updateReturnStatus } from "../lib/auth";

const RETURN_STAGES = [
  { id: "return_requested", label: "Return Requested" },
  { id: "contacting_courier", label: "Contacting Courier" },
  { id: "pickup_scheduled", label: "Pickup Scheduled" },
  { id: "picked_up", label: "Item Picked Up" },
  { id: "inspected", label: "Inspected" },
  { id: "refunded", label: "Refunded" },
];

const STATUS_COLORS = {
  return_requested: "bg-yellow-100 text-yellow-700 border-yellow-300",
  contacting_courier: "bg-blue-100 text-blue-700 border-blue-300",
  pickup_scheduled: "bg-orange-100 text-orange-700 border-orange-300",
  picked_up: "bg-orange-100 text-orange-700 border-orange-300",
  inspected: "bg-purple-100 text-purple-700 border-purple-300",
  refunded: "bg-emerald-100 text-emerald-700 border-emerald-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Form fields for courier info
  const [courierName, setCourierName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getAdminReturns();
      setReturns(response.returns || []);
    } catch (_err) {
      setError("Unable to load returns. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReturns = statusFilter
    ? returns.filter(r => r.status === statusFilter)
    : returns;

  const getReturnStageIndex = (stageId) => RETURN_STAGES.findIndex(s => s.id === stageId);

  const handleOpenReturn = (ret) => {
    setSelectedReturn(ret);
    setCourierName(ret.courier_name || "");
    setTrackingId(ret.tracking_id || "");
    setPickupDate(ret.pickup_date || "");
    setRejectionReason("");
    setUpdateError("");
    setUpdateSuccess("");
  };

  const handleApproveReturn = async () => {
    if (!selectedReturn) return;
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");
    try {
      const response = await updateReturnStatus(selectedReturn.id, { status: "contacting_courier" });
      if (response.return) {
        setSelectedReturn(response.return);
        setReturns(prev => prev.map(r => r.id === response.return.id ? response.return : r));
        setUpdateSuccess("Return approved. Now contact courier for pickup.");
      }
    } catch (_err) {
      setUpdateError("Failed to approve return.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectReturn = async () => {
    if (!selectedReturn || !rejectionReason.trim()) {
      setUpdateError("Please provide a rejection reason.");
      return;
    }
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");
    try {
      const response = await updateReturnStatus(selectedReturn.id, { status: "rejected", rejectionReason: rejectionReason.trim() });
      if (response.return) {
        setSelectedReturn(response.return);
        setReturns(prev => prev.map(r => r.id === response.return.id ? response.return : r));
        setUpdateSuccess("Return rejected.");
      }
    } catch (_err) {
      setUpdateError("Failed to reject return.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCourierInfo = async () => {
    if (!selectedReturn || !courierName.trim() || !trackingId.trim() || !pickupDate) {
      setUpdateError("Please fill all courier details and pickup date.");
      return;
    }
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");
    try {
      const response = await updateReturnStatus(selectedReturn.id, {
        status: "pickup_scheduled",
        courierName: courierName.trim(),
        trackingId: trackingId.trim(),
        pickupDate,
      });
      if (response.return) {
        setSelectedReturn(response.return);
        setReturns(prev => prev.map(r => r.id === response.return.id ? response.return : r));
        setUpdateSuccess("Courier info saved. Pickup scheduled.");
      }
    } catch (_err) {
      setUpdateError("Failed to save courier info.");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkPickedUp = async () => {
    if (!selectedReturn) return;
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");
    try {
      const response = await updateReturnStatus(selectedReturn.id, { status: "picked_up" });
      if (response.return) {
        setSelectedReturn(response.return);
        setReturns(prev => prev.map(r => r.id === response.return.id ? response.return : r));
        setUpdateSuccess("Marked as picked up.");
      }
    } catch (_err) {
      setUpdateError("Failed to update.");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkInspected = async () => {
    if (!selectedReturn) return;
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");
    try {
      const response = await updateReturnStatus(selectedReturn.id, { status: "inspected" });
      if (response.return) {
        setSelectedReturn(response.return);
        setReturns(prev => prev.map(r => r.id === response.return.id ? response.return : r));
        setUpdateSuccess("Marked as inspected.");
      }
    } catch (_err) {
      setUpdateError("Failed to update.");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkRefunded = async () => {
    if (!selectedReturn) return;
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");
    try {
      const response = await updateReturnStatus(selectedReturn.id, { status: "refunded" });
      if (response.return) {
        setSelectedReturn(response.return);
        setReturns(prev => prev.map(r => r.id === response.return.id ? response.return : r));
        setUpdateSuccess("Marked as refunded.");
      }
    } catch (_err) {
      setUpdateError("Failed to update.");
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-[14px] text-[#555555]">Loading returns...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Returns Management
        </h2>
        <p className="text-[13px] text-[#555555] mt-1">
          View and manage return requests
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10">
          <p className="text-[12px] text-red-400">{error}</p>
        </div>
      )}

      {/* Status Filters */}
      {returns.length > 0 && (
        <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setStatusFilter(null)}
            className={`min-w-[120px] p-3 rounded-xl border transition-all text-left flex-shrink-0 ${
              statusFilter === null
                ? "bg-[#C9A14A] border-[#C9A14A] text-[#0A0A0A]"
                : "bg-white border-[#C9A14A]/20 hover:border-[#C9A14A]/40"
            }`}
          >
            <p className="text-[18px] font-bold">{returns.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider">All</p>
          </button>
          {RETURN_STAGES.map(stage => {
            const count = returns.filter(r => r.status === stage.id).length;
            return (
              <button
                key={stage.id}
                onClick={() => setStatusFilter(stage.id)}
                className={`min-w-[120px] p-3 rounded-xl border transition-all text-left flex-shrink-0 ${
                  statusFilter === stage.id
                    ? "bg-[#C9A14A] border-[#C9A14A] text-[#0A0A0A]"
                    : "bg-white border-[#C9A14A]/20 hover:border-[#C9A14A]/40"
                }`}
              >
                <p className="text-[18px] font-bold">{count}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider truncate">{stage.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Returns List */}
      {!filteredReturns.length && !error ? (
        <div className="rounded-2xl border border-[#C9A14A]/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f8f7f2] border border-[#C9A14A]/20 flex items-center justify-center text-2xl">
            🔄
          </div>
          <h3 className="text-lg text-[#0A0A0A] mb-2">No returns found</h3>
          <p className="text-[13px] text-[#555555]">
            {statusFilter ? "Try selecting a different status" : "No return requests yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map(ret => (
            <div
              key={ret.id}
              className="rounded-2xl border border-[#C9A14A]/20 overflow-hidden bg-white"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleOpenReturn(ret)}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold">Order ID</p>
                      <p className="text-[15px] text-[#0A0A0A] font-medium">{ret.order_id}</p>
                    </div>
                    <div className="ml-4">
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold">Customer</p>
                      <p className="text-[13px] text-[#0A0A0A]">{ret.customerName || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${STATUS_COLORS[ret.status] || "bg-gray-100 text-gray-700"}`}>
                      {ret.status?.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(ret.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-gray-600">
                  Reason: {ret.reason?.replace(/_/g, " ")}
                </div>
              </div>

              {/* Expanded Detail */}
              {selectedReturn?.id === ret.id && (
                <div className="p-4 border-t border-[#C9A14A]/10 space-y-4">
                  {updateError && (
                    <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10">
                      <p className="text-[12px] text-red-400">{updateError}</p>
                    </div>
                  )}
                  {updateSuccess && (
                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                      <p className="text-[12px] text-emerald-400">{updateSuccess}</p>
                    </div>
                  )}

                  {/* Return Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-[#f8f7f2] border border-[#C9A14A]/10">
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-1">Reason</p>
                      <p className="text-[13px] text-[#0A0A0A] capitalize">{ret.reason?.replace(/_/g, " ")}</p>
                    </div>
                    {ret.description && (
                      <div className="p-3 rounded-xl bg-[#f8f7f2] border border-[#C9A14A]/10">
                        <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-1">Description</p>
                        <p className="text-[13px] text-[#0A0A0A]">{ret.description}</p>
                      </div>
                    )}
                  </div>

                  {ret.status === "rejected" && ret.rejection_reason && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                      <p className="text-[10px] uppercase tracking-wider text-red-600 font-semibold mb-1">Rejection Reason</p>
                      <p className="text-[13px] text-red-700">{ret.rejection_reason}</p>
                    </div>
                  )}

                  {/* Courier Info Display */}
                  {(ret.courier_name || ret.tracking_id || ret.pickup_date) && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold mb-2">Courier & Pickup Info</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {ret.courier_name && <div><p className="text-[10px] text-gray-500">Courier</p><p className="text-[12px] text-[#0A0A0A]">{ret.courier_name}</p></div>}
                        {ret.tracking_id && <div><p className="text-[10px] text-gray-500">Tracking ID</p><p className="text-[12px] font-mono text-[#0A0A0A]">{ret.tracking_id}</p></div>}
                        {ret.pickup_date && <div><p className="text-[10px] text-gray-500">Pickup Date</p><p className="text-[12px] text-[#0A0A0A]">{new Date(ret.pickup_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></div>}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons based on status */}
                  <div className="pt-4 border-t border-[#C9A14A]/10">
                    {ret.status === "return_requested" && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={handleApproveReturn}
                            disabled={updating}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors"
                          >
                            {updating ? "Processing..." : "Approve Return"}
                          </button>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-2">Rejection Reason *</p>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            rows={2}
                            className="w-full sm:w-1/2 border border-[#C9A14A]/30 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#C9A14A] resize-none mb-2"
                          />
                          <button
                            onClick={handleRejectReturn}
                            disabled={updating || !rejectionReason.trim()}
                            className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors"
                          >
                            Reject Return
                          </button>
                        </div>
                      </div>
                    )}

                    {ret.status === "contacting_courier" && (
                      <div className="space-y-3">
                        <p className="text-[12px] text-gray-600 mb-2">Enter courier details to schedule pickup:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={courierName}
                            onChange={(e) => setCourierName(e.target.value)}
                            placeholder="Courier Name (e.g., Aramex)"
                            className="border border-[#C9A14A]/30 rounded-xl px-4 py-2.5 text-[12px] outline-none focus:border-[#C9A14A]"
                          />
                          <input
                            type="text"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            placeholder="Tracking ID"
                            className="border border-[#C9A14A]/30 rounded-xl px-4 py-2.5 text-[12px] outline-none focus:border-[#C9A14A]"
                          />
                          <input
                            type="date"
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            className="border border-[#C9A14A]/30 rounded-xl px-4 py-2.5 text-[12px] outline-none focus:border-[#C9A14A]"
                          />
                        </div>
                        <button
                          onClick={handleSaveCourierInfo}
                          disabled={updating}
                          className="bg-[#C9A14A] hover:bg-[#E8C97A] disabled:opacity-60 text-[#0A0A0A] px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors"
                        >
                          {updating ? "Saving..." : "Save & Schedule Pickup"}
                        </button>
                      </div>
                    )}

                    {ret.status === "pickup_scheduled" && (
                      <button
                        onClick={handleMarkPickedUp}
                        disabled={updating}
                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors"
                      >
                        {updating ? "Processing..." : "Mark as Picked Up"}
                      </button>
                    )}

                    {ret.status === "picked_up" && (
                      <button
                        onClick={handleMarkInspected}
                        disabled={updating}
                        className="bg-purple-500 hover:bg-purple-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors"
                      >
                        {updating ? "Processing..." : "Mark as Inspected"}
                      </button>
                    )}

                    {ret.status === "inspected" && (
                      <button
                        onClick={handleMarkRefunded}
                        disabled={updating}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors"
                      >
                        {updating ? "Processing..." : "Mark as Refunded"}
                      </button>
                    )}

                    {(ret.status === "refunded" || ret.status === "rejected") && (
                      <p className="text-[12px] text-gray-500">
                        This return has been {ret.status}.
                      </p>
                    )}
                  </div>

                  {/* Return Timeline */}
                  {ret.timeline_json && (
                    <div className="pt-4 border-t border-[#C9A14A]/10">
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-3">Return Timeline</p>
                      <div className="space-y-2">
                        {(() => {
                          const timeline = typeof ret.timeline_json === 'string' ? JSON.parse(ret.timeline_json || '[]') : (ret.timeline_json || []);
                          const stageIndex = getReturnStageIndex(ret.status);
                          return RETURN_STAGES.map((stage, index) => {
                            const stageData = timeline.find(t => t.stage === stage.id);
                            const isCompleted = index < stageIndex;
                            const isCurrent = index === stageIndex;
                            return (
                              <div key={stage.id} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border ${
                                  isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                                  isCurrent ? "bg-[#C9A14A] border-[#C9A14A] text-white" :
                                  "bg-gray-100 border-gray-300 text-gray-400"
                                }`}>
                                  {isCompleted ? "✓" : ""}
                                </div>
                                <p className={`text-[11px] ${isCompleted || isCurrent ? "text-[#0A0A0A]" : "text-gray-400"}`}>
                                  {stage.label}
                                  {stageData?.timestamp && (
                                    <span className="text-gray-400 ml-2">
                                      {new Date(stageData.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                    </span>
                                  )}
                                </p>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}