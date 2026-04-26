import { useEffect, useState } from "react";
import { getUserOrders, getReturnByOrderId, createReturnRequest } from "../lib/auth";
import OrderStatusTimeline from "./OrderStatusTimeline";

const ORDER_STAGES = [
  { id: "placed", label: "Placed", icon: "📦" },
  { id: "confirmed", label: "Confirmed", icon: "✓" },
  { id: "packed", label: "Packed", icon: "📦" },
  { id: "ready_for_shipment", label: "Ready for Shipment", icon: "🚚" },
  { id: "shipped", label: "Shipped", icon: "📬" },
  { id: "delivered", label: "Delivered", icon: "✅" },
];

const RETURN_REASONS = [
  { value: "wrong_product", label: "Wrong product received" },
  { value: "damaged", label: "Product is damaged" },
  { value: "size_mismatch", label: "Size mismatch" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed my mind" },
];

const RETURN_STATUS_COLORS = {
  return_requested: "bg-yellow-100 text-yellow-700 border-yellow-300",
  contacting_courier: "bg-blue-100 text-blue-700 border-blue-300",
  pickup_scheduled: "bg-orange-100 text-orange-700 border-orange-300",
  picked_up: "bg-orange-100 text-orange-700 border-orange-300",
  inspected: "bg-purple-100 text-purple-700 border-purple-300",
  refunded: "bg-emerald-100 text-emerald-700 border-emerald-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderReturns, setOrderReturns] = useState({}); // orderId -> return data
  const [showReturnForm, setShowReturnForm] = useState({}); // orderId -> boolean
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState({}); // orderId -> boolean
  const [returnError, setReturnError] = useState({}); // orderId -> error

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getUserOrders();
        console.log("[MyOrders] Response:", response);
        setOrders(response.orders || []);
        // Load return data for each delivered order
        for (const order of response.orders || []) {
          if (order.status === "delivered") {
            try {
              const retResponse = await getReturnByOrderId(order.orderId);
              if (retResponse.return) {
                setOrderReturns(prev => ({ ...prev, [order.orderId]: retResponse.return }));
              }
            } catch (_err) {
              // No return exists for this order
            }
          }
        }
      } catch (err) {
        console.error("[MyOrders] Error:", err);
        setError(err.message || "Unable to load your orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getStatusLabel = (status) => {
    const stage = ORDER_STAGES.find((s) => s.id === status);
    return stage ? stage.label : status?.replace("_", " ");
  };

  const getStatusColor = (status) => {
    const completedStatuses = ["delivered"];
    const activeStatuses = ["placed", "confirmed", "packed", "ready_for_shipment", "shipped"];

    if (completedStatuses.includes(status)) return "bg-emerald-100 text-emerald-700 border-emerald-300";
    if (activeStatuses.includes(status)) return "bg-[#C9A14A]/10 text-[#C9A14A] border-[#C9A14A]/30";
    return "bg-gray-100 text-gray-600 border-gray-300";
  };

  const canRequestReturn = (order) => {
    if (order.status !== "delivered") return false;
    if (orderReturns[order.orderId]) return false;
    // Check within 7 days of delivery
    const deliveredStage = order.timeline?.find(t => t.stage === "delivered");
    if (!deliveredStage?.timestamp) return false;
    const deliveredDate = new Date(deliveredStage.timestamp);
    const now = new Date();
    const daysDiff = (now - deliveredDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  const handleSubmitReturn = async (orderId) => {
    if (!returnReason) {
      setReturnError(prev => ({ ...prev, [orderId]: "Please select a reason for return." }));
      return;
    }
    setSubmittingReturn(prev => ({ ...prev, [orderId]: true }));
    setReturnError(prev => ({ ...prev, [orderId]: "" }));
    try {
      const response = await createReturnRequest(orderId, returnReason, returnDescription, []);
      if (response.return) {
        setOrderReturns(prev => ({ ...prev, [orderId]: response.return }));
        setShowReturnForm(prev => ({ ...prev, [orderId]: false }));
        setReturnReason("");
        setReturnDescription("");
      } else {
        setReturnError(prev => ({ ...prev, [orderId]: response.message || "Failed to submit return." }));
      }
    } catch (_err) {
      setReturnError(prev => ({ ...prev, [orderId]: "Unable to submit return. Please try again." }));
    } finally {
      setSubmittingReturn(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <p className="text-[14px] text-[#555555]">Loading your orders...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A14A] mb-2">My Orders</p>
          <h1
            className="text-3xl sm:text-4xl text-[#0A0A0A] mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Order History
          </h1>
          <div className="w-12 h-px mx-auto mt-3 bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-[12px] text-red-600">{error}</p>
          </div>
        )}

        {!orders.length && !error ? (
          <div className="bg-white rounded-2xl border border-[#C9A14A]/20 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f8f7f2] border border-[#C9A14A]/20 flex items-center justify-center text-2xl">
              📦
            </div>
            <h3 className="text-lg text-[#0A0A0A] mb-2">No orders yet</h3>
            <p className="text-[13px] text-[#555555]">
              When you place an order, it will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Orders List */}
            {orders.map((order) => (
              <div
                key={order.id || order.orderId}
                className="bg-white rounded-2xl border border-[#C9A14A]/20 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-5 border-b border-[#C9A14A]/10">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold">
                        Order ID
                      </p>
                      <p className="text-[15px] text-[#0A0A0A] font-medium">{order.orderId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Return Request Button - appears before status badge */}
                      {canRequestReturn(order) && (
                        <button
                          onClick={() => setShowReturnForm(prev => ({ ...prev, [order.orderId]: true }))}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-colors"
                        >
                          Request Return
                        </button>
                      )}
                      {/* Return Status Badge */}
                      {orderReturns[order.orderId] && (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${RETURN_STATUS_COLORS[orderReturns[order.orderId].status] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
                          Return: {orderReturns[order.orderId].status?.replace(/_/g, " ")}
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                      <button
                        onClick={() =>
                          setSelectedOrder(selectedOrder?.orderId === order.orderId ? null : order)
                        }
                        className="text-[11px] text-[#C9A14A] hover:text-[#0A0A0A] font-semibold underline"
                      >
                        {selectedOrder?.orderId === order.orderId ? "Hide Details" : "View Details"}
                      </button>
                    </div>
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
                    <span>📦 {order.products?.length || 0} item(s)</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedOrder?.orderId === order.orderId && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-1">
                          Customer
                        </p>
                        <p className="text-[13px] text-[#0A0A0A]">{order.customerDetails?.name}</p>
                        <p className="text-[12px] text-gray-600">{order.customerDetails?.phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-1">
                          Delivery Address
                        </p>
                        <p className="text-[13px] text-[#0A0A0A]">{order.customerDetails?.address}</p>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="border-t border-[#C9A14A]/10 pt-4">
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-2">
                        Products
                      </p>
                      {order.products?.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b border-[#C9A14A]/5 last:border-0"
                        >
                          <div>
                            <p className="text-[13px] text-[#0A0A0A]">{product.name}</p>
                            <p className="text-[11px] text-gray-600">
                              {product.color} | {product.size} | Qty: {product.quantity}
                            </p>
                          </div>
                          <p className="text-[13px] text-[#C9A14A] font-semibold">
                            AED {product.price}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Return Form */}
                    {showReturnForm[order.orderId] && (
                      <div className="border-t border-[#C9A14A]/10 pt-4">
                        <h4 className="text-[13px] font-semibold text-[#0A0A0A] mb-3">Request Return</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-2">
                              Reason for Return *
                            </label>
                            <select
                              value={returnReason}
                              onChange={(e) => setReturnReason(e.target.value)}
                              className="w-full border border-[#C9A14A]/30 rounded-xl px-4 py-2.5 text-[12px] outline-none focus:border-[#C9A14A]"
                            >
                              <option value="">Select a reason</option>
                              {RETURN_REASONS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-2">
                              Description <span className="text-gray-400">(max 300 chars)</span>
                            </label>
                            <textarea
                              value={returnDescription}
                              onChange={(e) => setReturnDescription(e.target.value.slice(0, 300))}
                              placeholder="Describe the issue..."
                              rows={3}
                              className="w-full border border-[#C9A14A]/30 rounded-xl px-4 py-2.5 text-[12px] outline-none focus:border-[#C9A14A] resize-none"
                            />
                          </div>
                          {returnError[order.orderId] && (
                            <p className="text-[11px] text-red-500">{returnError[order.orderId]}</p>
                          )}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleSubmitReturn(order.orderId)}
                              disabled={submittingReturn[order.orderId]}
                              className="bg-[#C9A14A] hover:bg-[#E8C97A] disabled:opacity-60 text-[#0A0A0A] px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors"
                            >
                              {submittingReturn[order.orderId] ? "Submitting..." : "Submit Return"}
                            </button>
                            <button
                              onClick={() => {
                                setShowReturnForm(prev => ({ ...prev, [order.orderId]: false }));
                                setReturnReason("");
                                setReturnDescription("");
                                setReturnError(prev => ({ ...prev, [order.orderId]: "" }));
                              }}
                              className="bg-gray-200 hover:bg-gray-300 text-[#0A0A0A] px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Return Status Display */}
                    {orderReturns[order.orderId] && (
                      <div className="border-t border-[#C9A14A]/10 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[13px] font-semibold text-[#0A0A0A]">Return Status</h4>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${RETURN_STATUS_COLORS[orderReturns[order.orderId].status] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
                            {orderReturns[order.orderId].status?.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#f8f7f2] border border-[#C9A14A]/10 mb-3">
                          <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-1">Reason</p>
                          <p className="text-[12px] text-[#0A0A0A] capitalize">
                            {RETURN_REASONS.find(r => r.value === orderReturns[order.orderId].reason)?.label || orderReturns[order.orderId].reason}
                          </p>
                          {orderReturns[order.orderId].description && (
                            <p className="text-[11px] text-gray-600 mt-1">{orderReturns[order.orderId].description}</p>
                          )}
                        </div>
                        {orderReturns[order.orderId].status === "rejected" && orderReturns[order.orderId].rejection_reason && (
                          <div className="p-3 rounded-xl bg-red-50 border border-red-200 mb-3">
                            <p className="text-[10px] uppercase tracking-wider text-red-600 font-semibold mb-1">Rejection Reason</p>
                            <p className="text-[12px] text-red-700">{orderReturns[order.orderId].rejection_reason}</p>
                          </div>
                        )}
                        {(orderReturns[order.orderId].courier_name || orderReturns[order.orderId].tracking_id || orderReturns[order.orderId].pickup_date) && (
                          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                            <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold mb-1">Pickup Details</p>
                            {orderReturns[order.orderId].courier_name && <p className="text-[11px] text-[#0A0A0A]">Courier: {orderReturns[order.orderId].courier_name}</p>}
                            {orderReturns[order.orderId].tracking_id && <p className="text-[11px] text-[#0A0A0A]">Tracking ID: <span className="font-mono">{orderReturns[order.orderId].tracking_id}</span></p>}
                            {orderReturns[order.orderId].pickup_date && <p className="text-[11px] text-[#0A0A0A]">Pickup Date: {new Date(orderReturns[order.orderId].pickup_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="border-t border-[#C9A14A]/10 pt-4">
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-3">
                        Order Journey
                      </p>
                      <OrderStatusTimeline
                        timeline={order.timeline}
                        currentStage={order.status}
                        thirdPartyTracking={order.thirdPartyTracking}
                      />
                    </div>

                    {/* Payment Info */}
                    <div className="border-t border-[#C9A14A]/10 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-[#555555]">
                        <span className="px-2 py-1 bg-[#f8f7f2] rounded border border-[#C9A14A]/20">
                          Payment: {order.paymentMode || "COD"}
                        </span>
                      </div>
                      <p className="text-[16px] text-[#C9A14A] font-semibold">
                        Total: AED {order.totalAmount}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
