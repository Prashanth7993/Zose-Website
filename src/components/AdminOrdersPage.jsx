import { useEffect, useState, useMemo } from "react";
import { getAdminOrders, updateOrderStatus, addThirdPartyTracking } from "../lib/auth";
import ExcelJS from "exceljs";
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
  const [justCompletedStage, setJustCompletedStage] = useState(null);
  const [trackingCourier, setTrackingCourier] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);

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

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    ORDER_STAGES.forEach(stage => {
      counts[stage.id] = orders.filter(o => o.status === stage.id).length;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!statusFilter) return orders;
    return orders.filter(o => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "ZOSE Admin";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("All Orders");

      sheet.columns = [
        { header: "Order ID", key: "orderId", width: 14 },
        { header: "Date", key: "createdAt", width: 12 },
        { header: "Customer Name", key: "customerName", width: 22 },
        { header: "Phone", key: "phone", width: 16 },
        { header: "Address", key: "address", width: 30 },
        { header: "Email", key: "email", width: 24 },
        { header: "Status", key: "status", width: 16 },
        { header: "Products", key: "products", width: 40 },
        { header: "Total (AED)", key: "totalAmount", width: 12 },
        { header: "Payment Mode", key: "paymentMode", width: 12 },
      ];

      // Style header row
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8F7F2" }
      };
      sheet.getRow(1).border = {
        bottom: { style: "thin", color: { argb: "FFC9A14A" } }
      };

      // Add data rows (ALL orders, not filtered)
      orders.forEach((order) => {
        const productsList = order.products
          ?.map(p => `${p.name} (${p.color}, ${p.size}) x${p.quantity}`)
          ?.join("; ") || "";

        sheet.addRow({
          orderId: order.orderId,
          createdAt: new Date(order.createdAt).toLocaleDateString("en-GB"),
          customerName: order.customerDetails?.name || "",
          phone: order.customerDetails?.phone || "",
          address: order.customerDetails?.address || "",
          email: order.customerDetails?.email || "",
          status: order.status?.replace("_", " ").toUpperCase() || "",
          products: productsList,
          totalAmount: order.totalAmount,
          paymentMode: order.paymentMode || "COD",
        });
      });

      sheet.autoFilter = {
        from: "A1",
        to: `J${orders.length + 1}`
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ZOSE-Orders-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (_err) {
      alert("Failed to export Excel file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const getStageIndex = (stageId) => ORDER_STAGES.findIndex((s) => s.id === stageId);

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
      // Mark the completed stage so it turns green immediately
      setJustCompletedStage(stageId);

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

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-[14px] text-[#555555]">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Orders Management
          </h2>
          <p className="text-[13px] text-[#555555] mt-1">
            View and update order statuses
          </p>
        </div>
        <button
          onClick={handleExportToExcel}
          disabled={isExporting || !orders.length}
          className="rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 text-[11px] tracking-[0.12em] uppercase font-semibold transition-colors"
        >
          {isExporting ? "Exporting..." : "Export to Excel"}
        </button>
      </div>

      {/* Status Summary Dashboard */}
      {orders.length > 0 && (
        <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
          {/* All box */}
          <button
            onClick={() => setStatusFilter(null)}
            className={`min-w-[120px] p-3 rounded-xl border transition-all text-left flex-shrink-0 ${
              statusFilter === null
                ? "bg-[#C9A14A] border-[#C9A14A] text-[#0A0A0A]"
                : "bg-white border-[#C9A14A]/20 hover:border-[#C9A14A]/40"
            }`}
          >
            <p className="text-xl mb-1">📋</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider">All</p>
            <p className="text-[18px] font-bold">{statusCounts.all}</p>
          </button>

          {/* Per-stage boxes */}
          {ORDER_STAGES.map(stage => (
            <button
              key={stage.id}
              onClick={() => setStatusFilter(stage.id)}
              className={`min-w-[120px] p-3 rounded-xl border transition-all text-left flex-shrink-0 ${
                statusFilter === stage.id
                  ? "bg-[#C9A14A] border-[#C9A14A] text-[#0A0A0A]"
                  : "bg-white border-[#C9A14A]/20 hover:border-[#C9A14A]/40"
              }`}
            >
              <p className="text-xl mb-1">{stage.icon}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider truncate">
                {stage.label}
              </p>
              <p className="text-[18px] font-bold">{statusCounts[stage.id] || 0}</p>
            </button>
          ))}
        </div>
      )}

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

      {!filteredOrders.length && !error ? (
        <div className="rounded-2xl border border-[#C9A14A]/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f8f7f2] border border-[#C9A14A]/20 flex items-center justify-center text-2xl">
            📦
          </div>
          <h3 className="text-lg text-[#0A0A0A] mb-2">
            {statusFilter ? `No ${statusFilter.replace("_", " ")} orders` : "No orders yet"}
          </h3>
          <p className="text-[13px] text-[#555555]">
            {statusFilter ? "Try selecting a different status or click All to see all orders" : "Orders will appear here once customers place them"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
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
                      <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                        order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                          : "bg-[#C9A14A]/10 text-[#C9A14A] border-[#C9A14A]/30"
                      }`}>
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
                          const isCompleted = index < currentStageIndex || order.status === stage.id || (justCompletedStage === stage.id && index === currentStageIndex);
                          const isCurrent = index === currentStageIndex;
                          const isPending = index > currentStageIndex;
                          const isUpdating = updatingStage === stage.id;
                          const stageData = order.timeline?.find((t) => t.stage === stage.id);

                          // Pending stages are disabled
                          const canClickToAdvance = isCurrent && !isUpdating;
                          // Special case: when at shipped (index 4), delivered (index 5) should also be clickable to advance
                          const isAtLastStageBeforeDelivery = currentStageIndex === 4 && stage.id === "delivered";

                          return (
                            <div
                              key={stage.id}
                              className={`p-4 rounded-xl border transition-all ${
                                highlightNextStage === stage.id
                                  ? "bg-[#C9A14A]/20 border-[#C9A14A] animate-pulse"
                                  : isCompleted
                                  ? "bg-emerald-50 border-emerald-300"
                                  : isCurrent || isAtLastStageBeforeDelivery
                                  ? "bg-[#C9A14A]/10 border-[#C9A14A] animate-pulse"
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
                                onClick={() => (canClickToAdvance || isAtLastStageBeforeDelivery) && handleUpdateStage(order.orderId, order.id, stage.id)}
                                disabled={(isPending && !isAtLastStageBeforeDelivery) || isUpdating}
                                className={`w-full py-2 rounded-full text-[9px] font-semibold uppercase tracking-wider transition-all ${
                                  isCompleted
                                    ? "bg-emerald-500 text-white cursor-default"
                                    : canClickToAdvance || isAtLastStageBeforeDelivery
                                    ? "bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A]"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                } disabled:cursor-not-allowed`}
                              >
                                {isUpdating ? "Updating..." : isCompleted ? "✓ Done" : canClickToAdvance || isAtLastStageBeforeDelivery ? "Done" : "Waiting"}
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
