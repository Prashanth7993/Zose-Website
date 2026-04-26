import { useEffect, useState } from "react";
import { getAdminOrders, updateOrderStatus, addThirdPartyTracking } from "../lib/auth";
import OrderStatusTimeline from "./OrderStatusTimeline";

const ORDER_STAGES = [
  { id: "placed", label: "Placed", icon: "📦" },
  { id: "confirmed", label: "Confirmed", icon: "✓" },
  { id: "packed", label: "Packed", icon: "📦" },
  { id: "ready_for_shipment", label: "Ready for Shipment", icon: "🚚" },
  { id: "shipped", label: "Shipped", icon: "📬", requiresTracking: true },
  { id: "delivered", label: "Delivered", icon: "✅" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStage, setUpdatingStage] = useState(null);
  const [highlightNextStage, setHighlightNextStage] = useState(null);
  const [trackingCourier, setTrackingCourier] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getAdminOrders();
      setOrders(response.orders || []);
    } catch (_err) {
      setError("Unable to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStage = async (orderId, orderDbId, stageId) => {
    setUpdatingStage(stageId);
    setSaveError("");
    setSaveSuccess("");

    try {
      await updateOrderStatus(orderDbId, stageId, true);
      setSaveSuccess(`Order ${orderId} updated to ${ORDER_STAGES.find(s => s.id === stageId)?.label}`);

      // Find current stage index and highlight next stage
      const currentStageIndex = ORDER_STAGES.findIndex(s => s.id === stageId);
      const nextStage = ORDER_STAGES[currentStageIndex + 1];
      if (nextStage) {
        setHighlightNextStage(nextStage.id);
        setTimeout(() => setHighlightNextStage(null), 2000);
      }

      // Refresh orders list
      const refreshedOrders = await getAdminOrders();
      setOrders(refreshedOrders.orders || []);

      // Update selected order with fresh data
      if (selectedOrder?.orderId === orderId) {
        const updatedOrder = refreshedOrders.orders?.find(o => o.orderId === orderId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (_err) {
      setSaveError("Failed to update order status.");
    } finally {
      setUpdatingStage(null);
    }
  };

  const handleAddTracking = async (orderId) => {
    if (!trackingCourier.trim() || !trackingId.trim()) {
      setSaveError("Please enter both courier name and tracking ID.");
      return;
    }

    setSaveError("");
    setSaveSuccess("");

    try {
      await addThirdPartyTracking(orderId, trackingCourier.trim(), trackingId.trim());
      setSaveSuccess("Tracking information added successfully.");
      setTrackingCourier("");
      setTrackingId("");

      // Refresh orders
      await loadOrders();
    } catch (_err) {
      setSaveError("Failed to add tracking information.");
    }
  };

  const getStageIndex = (stageId) => ORDER_STAGES.findIndex((s) => s.id === stageId);

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-[14px] text-[#555555]">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Orders Management
        </h2>
        <p className="text-[13px] text-[#555555] mt-1">
          View and update order statuses
        </p>
      </div>

      {saveError && (
        <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10">
          <p className="text-[12px] text-red-400">{saveError}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <p className="text-[12px] text-emerald-400">{saveSuccess}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10">
          <p className="text-[12px] text-red-400">{error}</p>
        </div>
      )}

      {!orders.length && !error ? (
        <div className="rounded-2xl border border-[#C9A14A]/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f8f7f2] border border-[#C9A14A]/20 flex items-center justify-center text-2xl">
            📦
          </div>
          <h3 className="text-lg text-[#0A0A0A] mb-2">No orders yet</h3>
          <p className="text-[13px] text-[#555555]">Orders will appear here once customers place them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const currentStageIndex = getStageIndex(order.status);

            return (
              <div
                key={order.id || order.orderId}
                className="rounded-2xl border border-[#C9A14A]/20 overflow-hidden bg-white"
              >
                {/* Order Header */}
                <div className="p-4 border-b border-[#C9A14A]/10">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold">
                          Order ID
                        </p>
                        <p className="text-[15px] text-[#0A0A0A] font-medium">{order.orderId}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#C9A14A]/10 text-[#C9A14A] border border-[#C9A14A]/30">
                        {order.status?.replace("_", " ")}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.orderId === order.orderId ? null : order)}
                      className="text-[11px] text-[#C9A14A] hover:text-[#0A0A0A] font-semibold underline"
                    >
                      {selectedOrder?.orderId === order.orderId ? "Collapse" : "Expand"}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-[11px] text-[#555555]">
                    <span>
                      📅 {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>💰 AED {order.totalAmount}</span>
                    <span>👤 {order.customerDetails?.name}</span>
                    <span>📞 {order.customerDetails?.phone}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedOrder?.orderId === order.orderId && (
                  <div className="p-4 border-t border-[#C9A14A]/10 space-y-5">
                    {/* Customer & Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-[#f8f7f2] border border-[#C9A14A]/10">
                        <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-1">
                          Customer Details
                        </p>
                        <p className="text-[13px] text-[#0A0A0A]">{order.customerDetails?.name}</p>
                        <p className="text-[12px] text-gray-600">{order.customerDetails?.phone}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#f8f7f2] border border-[#C9A14A]/10">
                        <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-1">
                          Delivery Address
                        </p>
                        <p className="text-[13px] text-[#0A0A0A]">{order.customerDetails?.address}</p>
                      </div>
                    </div>

                    {/* Products */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-2">
                        Products
                      </p>
                      <div className="space-y-2">
                        {order.products?.map((product, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#f8f7f2] border border-[#C9A14A]/10"
                          >
                            <div>
                              <p className="text-[13px] text-[#0A0A0A]">{product.name}</p>
                              <p className="text-[11px] text-gray-600">
                                {product.color} | {product.size} | Qty: {product.quantity}
                              </p>
                            </div>
                            <p className="text-[13px] text-[#C9A14A] font-semibold">AED {product.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Update Buttons - Each stage with Done button below */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-4">
                        Update Order Status
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ORDER_STAGES.map((stage, index) => {
                          const isCompleted = index < currentStageIndex;
                          const isCurrent = index === currentStageIndex;
                          const isPending = index > currentStageIndex;
                          const isUpdating = updatingStage === stage.id;
                          const stageData = order.timeline?.find((t) => t.stage === stage.id);

                          // Only the CURRENT stage should trigger an update (to advance to next stage)
                          // Completed stages show "Done" but clicking does nothing
                          // Pending stages are disabled
                          const canClickToAdvance = isCurrent && !isUpdating;

                          return (
                            <div
                              key={stage.id}
                              className={`p-4 rounded-xl border transition-all ${
                                highlightNextStage === stage.id
                                  ? "bg-[#C9A14A]/20 border-[#C9A14A] animate-pulse"
                                  : isCurrent
                                  ? "bg-[#C9A14A]/10 border-[#C9A14A] animate-pulse"
                                  : isCompleted
                                  ? "bg-emerald-50 border-emerald-300"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{stage.icon}</span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0A0A0A]">
                                  {stage.label}
                                </span>
                              </div>
                              {stageData?.timestamp && (
                                <p className="text-[9px] text-gray-500 mb-2">
                                  {new Date(stageData.timestamp).toLocaleString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              )}
                              {isPending && !isUpdating && (
                                <p className="text-[9px] text-gray-400 mb-2">Awaiting previous stages</p>
                              )}
                              {highlightNextStage === stage.id && (
                                <p className="text-[9px] text-[#C9A14A] font-semibold mb-2 animate-bounce">
                                  ← Next: Click Done
                                </p>
                              )}
                              <button
                                onClick={() => canClickToAdvance && handleUpdateStage(order.orderId, order.id, stage.id)}
                                disabled={isPending || isUpdating}
                                className={`w-full py-2 rounded-full text-[9px] font-semibold uppercase tracking-wider transition-all ${
                                  isCompleted
                                    ? "bg-emerald-500 text-white cursor-default"
                                    : canClickToAdvance
                                    ? "bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A]"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                } disabled:cursor-not-allowed`}
                              >
                                {isUpdating ? "Updating..." : isCompleted ? "✓ Done" : canClickToAdvance ? "Done" : "Waiting"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Third-Party Tracking (for Shipped stage) */}
                    {currentStageIndex >= getStageIndex("shipped") && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-3">
                          Third-Party Tracking
                        </p>
                        <div className="p-4 rounded-xl bg-[#f8f7f2] border border-[#C9A14A]/10 space-y-3">
                          {order.thirdPartyTracking?.trackingId ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[12px] text-[#0A0A0A]">
                                  <span className="font-semibold">Courier:</span> {order.thirdPartyTracking.courierName}
                                </p>
                                <p className="text-[12px] text-[#0A0A0A]">
                                  <span className="font-semibold">Tracking ID:</span>{" "}
                                  <span className="font-mono">{order.thirdPartyTracking.trackingId}</span>
                                </p>
                              </div>
                              <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                                Active
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={trackingCourier}
                                  onChange={(e) => setTrackingCourier(e.target.value)}
                                  placeholder="Courier Name (e.g., Aramex, DHL)"
                                  className="border border-[#C9A14A]/30 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#C9A14A]"
                                />
                                <input
                                  type="text"
                                  value={trackingId}
                                  onChange={(e) => setTrackingId(e.target.value)}
                                  placeholder="Tracking ID"
                                  className="border border-[#C9A14A]/30 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#C9A14A]"
                                />
                              </div>
                              <button
                                onClick={() => handleAddTracking(order.orderId)}
                                className="bg-[#0A0A0A] hover:bg-[#222222] text-white px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                              >
                                Add Tracking
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline Visualization */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-3">
                        Order Journey Timeline
                      </p>
                      <OrderStatusTimeline
                        timeline={order.timeline}
                        currentStage={order.status}
                        thirdPartyTracking={order.thirdPartyTracking}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
