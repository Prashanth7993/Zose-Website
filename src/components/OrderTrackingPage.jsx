import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getOrderById, getReturnByOrderId, createReturnRequest } from "../lib/auth";
import OrderStatusTimeline from "./OrderStatusTimeline";

const RETURN_REASONS = [
  { value: "wrong_product", label: "Wrong product received" },
  { value: "damaged", label: "Product is damaged" },
  { value: "size_mismatch", label: "Size mismatch" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed my mind" },
];

const RETURN_STAGES = [
  { id: "return_requested", label: "Return Requested" },
  { id: "contacting_courier", label: "Contacting Courier" },
  { id: "pickup_scheduled", label: "Pickup Scheduled" },
  { id: "picked_up", label: "Item Picked Up" },
  { id: "inspected", label: "Inspected" },
  { id: "refunded", label: "Refunded" },
];

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!searchParams.get("id"));

  // Return states
  const [returnData, setReturnData] = useState(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnPhotos, setReturnPhotos] = useState([]);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSubmitError, setReturnSubmitError] = useState("");

  useEffect(() => {
    const initialOrderId = searchParams.get("id");
    if (initialOrderId) {
      setOrderId(initialOrderId);
      trackOrder(initialOrderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackOrder = async (id) => {
    setError("");
    setOrder(null);
    setReturnData(null);
    setShowReturnForm(false);
    setHasSearched(true);

    if (!id.trim()) {
      setError("Please enter your Order ID");
      return;
    }

    const formattedOrderId = id.trim().toUpperCase();
    if (!formattedOrderId.startsWith("ZOSE-")) {
      setError("Order ID should start with ZOSE-");
      return;
    }

    setIsLoading(true);
    try {
      const response = await getOrderById(formattedOrderId);
      if (response.order) {
        setOrder(response.order);
        // Check for existing return
        await checkReturnStatus(formattedOrderId);
      } else {
        setError("Order not found. Please check your Order ID.");
      }
    } catch (_err) {
      setError("Unable to fetch order details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkReturnStatus = async (oid) => {
    try {
      const retResponse = await getReturnByOrderId(oid);
      if (retResponse.return) {
        setReturnData(retResponse.return);
      }
    } catch (_err) {
      // No return exists - that's fine
    }
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    await trackOrder(orderId);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
  };

  const canRequestReturn = () => {
    if (!order) return false;
    if (order.status !== "delivered") return false;
    if (returnData) return false;
    // Check within 7 days
    const deliveredStage = order.timeline?.find(t => t.stage === "delivered");
    if (!deliveredStage?.timestamp) return false;
    const deliveredDate = new Date(deliveredStage.timestamp);
    const now = new Date();
    const daysDiff = (now - deliveredDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      files.splice(3);
    }
    setReturnPhotos(files);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    setReturnSubmitError("");

    if (!returnReason) {
      setReturnSubmitError("Please select a reason for return.");
      return;
    }

    setSubmittingReturn(true);
    try {
      const response = await createReturnRequest(
        order.orderId,
        returnReason,
        returnDescription,
        [] // photos not implemented yet - would need file upload handling
      );
      if (response.return) {
        setReturnData(response.return);
        setShowReturnForm(false);
      } else {
        setReturnSubmitError(response.message || "Failed to submit return.");
      }
    } catch (_err) {
      setReturnSubmitError("Unable to submit return. Please try again.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getReturnStageIndex = (stageId) => RETURN_STAGES.findIndex(s => s.id === stageId);

  const getStatusBadgeColor = (status) => {
    const colors = {
      return_requested: "bg-yellow-100 text-yellow-700 border-yellow-300",
      contacting_courier: "bg-blue-100 text-blue-700 border-blue-300",
      pickup_scheduled: "bg-orange-100 text-orange-700 border-orange-300",
      picked_up: "bg-orange-100 text-orange-700 border-orange-300",
      inspected: "bg-purple-100 text-purple-700 border-purple-300",
      refunded: "bg-emerald-100 text-emerald-700 border-emerald-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  return (
    <section className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A14A] mb-2">
            Track Your Order
          </p>
          <h1
            className="text-3xl sm:text-4xl text-[#0A0A0A] mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Order Status
          </h1>
          <div className="w-12 h-px mx-auto mt-3 bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent" />
          <p className="text-[14px] text-[#555555] mt-4 max-w-md mx-auto">
            Enter your Order ID to track your order status in real-time
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl border border-[#C9A14A]/20 p-5 sm:p-6 mb-6">
          <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                placeholder="Enter Order ID (e.g., ZOSE-123456)"
                className="w-full border border-[#C9A14A]/30 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#C9A14A] uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#C9A14A] hover:bg-[#E8C97A] disabled:opacity-60 disabled:cursor-not-allowed text-[#0A0A0A] px-6 py-3 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
            >
              {isLoading ? "Tracking..." : "Track Order"}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-[12px] text-red-500">{error}</p>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <>
            {/* Order Info Card */}
            <div className="bg-white rounded-2xl border border-[#C9A14A]/20 p-5 sm:p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold">
                    Order ID
                  </p>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl text-[#0A0A0A] font-medium">{order.orderId}</h2>
                    <button
                      onClick={handleCopyOrderId}
                      className="text-[10px] text-[#C9A14A] hover:text-[#0A0A0A] underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold">
                    Order Date
                  </p>
                  <p className="text-[13px] text-[#0A0A0A]">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#C9A14A]/10 pt-4">
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
              </div>

              <div className="border-t border-[#C9A14A]/10 pt-4 mt-4">
                <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-2">
                  Product Details
                </p>
                {order.products?.map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
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

              <div className="border-t border-[#C9A14A]/10 pt-4 mt-4 flex items-center justify-between">
                <p className="text-[12px] text-[#555555]">Total Amount</p>
                <p className="text-[18px] text-[#C9A14A] font-semibold">
                  AED {order.totalAmount}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-[11px] text-[#555555]">
                  <span className="px-2 py-1 bg-[#f8f7f2] rounded border border-[#C9A14A]/20">
                    Payment: {order.paymentMode || "COD"}
                  </span>
                  <span className="px-2 py-1 bg-[#f8f7f2] rounded border border-[#C9A14A]/20">
                    Status: {order.status?.replace("_", " ")}
                  </span>
                </div>

                {/* Request Return Button - prominent placement */}
                {canRequestReturn() && (
                  <button
                    onClick={() => setShowReturnForm(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-colors"
                  >
                    Request Return
                  </button>
                )}
              </div>
            </div>

            {/* Return Form Modal */}
            {showReturnForm && (
              <div className="bg-white rounded-2xl border border-[#C9A14A]/20 p-5 sm:p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#0A0A0A] mb-4">Request Return</h3>
                <form onSubmit={handleSubmitReturn} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-2">
                      Reason for Return *
                    </label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full border border-[#C9A14A]/30 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#C9A14A]"
                    >
                      <option value="">Select a reason</option>
                      {RETURN_REASONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-2">
                      Description <span className="text-gray-400">(max 300 chars)</span>
                    </label>
                    <textarea
                      value={returnDescription}
                      onChange={(e) => setReturnDescription(e.target.value.slice(0, 300))}
                      placeholder="Describe the issue..."
                      rows={4}
                      className="w-full border border-[#C9A14A]/30 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#C9A14A] resize-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">{returnDescription.length}/300</p>
                  </div>
                  {returnSubmitError && (
                    <p className="text-[12px] text-red-500">{returnSubmitError}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submittingReturn}
                      className="bg-[#C9A14A] hover:bg-[#E8C97A] disabled:opacity-60 text-[#0A0A0A] px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors"
                    >
                      {submittingReturn ? "Submitting..." : "Submit Return"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReturnForm(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-[#0A0A0A] px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Return Status Display */}
            {returnData && (
              <div className="bg-white rounded-2xl border border-[#C9A14A]/20 p-5 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#0A0A0A]">Return Status</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusBadgeColor(returnData.status)}`}>
                    {returnData.status?.replace(/_/g, " ")}
                  </span>
                </div>

                {returnData.status === "rejected" && returnData.rejection_reason && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-[12px] text-red-700">
                      <span className="font-semibold">Rejection Reason:</span> {returnData.rejection_reason}
                    </p>
                  </div>
                )}

                {/* Return Reason */}
                <div className="mb-4 p-3 rounded-xl bg-[#f8f7f2] border border-[#C9A14A]/10">
                  <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-1">Reason</p>
                  <p className="text-[13px] text-[#0A0A0A]">
                    {RETURN_REASONS.find(r => r.value === returnData.reason)?.label || returnData.reason}
                  </p>
                  {returnData.description && (
                    <p className="text-[12px] text-gray-600 mt-1">{returnData.description}</p>
                  )}
                </div>

                {/* Pickup Info if available */}
                {(returnData.courier_name || returnData.tracking_id || returnData.pickup_date) && (
                  <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold mb-1">Pickup Details</p>
                    {returnData.courier_name && <p className="text-[12px] text-[#0A0A0A]">Courier: {returnData.courier_name}</p>}
                    {returnData.tracking_id && <p className="text-[12px] text-[#0A0A0A]">Tracking ID: <span className="font-mono">{returnData.tracking_id}</span></p>}
                    {returnData.pickup_date && <p className="text-[12px] text-[#0A0A0A]">Pickup Date: {new Date(returnData.pickup_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>}
                  </div>
                )}

                {/* Return Timeline */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-3">Return Journey</p>
                  <div className="space-y-3">
                    {RETURN_STAGES.map((stage, index) => {
                      const timeline = typeof returnData.timeline_json === 'string' ? JSON.parse(returnData.timeline_json || '[]') : (returnData.timeline_json || []);
                      const stageData = timeline.find(t => t.stage === stage.id);
                      const stageIndex = getReturnStageIndex(returnData.status);
                      const isCompleted = index < stageIndex;
                      const isCurrent = index === stageIndex;

                      return (
                        <div key={stage.id} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 flex-shrink-0 ${
                            isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                            isCurrent ? "bg-[#C9A14A] border-[#C9A14A] text-white animate-pulse" :
                            "bg-gray-100 border-gray-300 text-gray-400"
                          }`}>
                            {isCompleted ? "✓" : stage.id === "return_requested" ? "📋" : stage.id === "contacting_courier" ? "📞" : stage.id === "pickup_scheduled" ? "🚚" : stage.id === "picked_up" ? "📦" : stage.id === "inspected" ? "🔍" : "💰"}
                          </div>
                          <div className="flex-1">
                            <p className={`text-[13px] font-semibold ${isCompleted || isCurrent ? "text-[#0A0A0A]" : "text-gray-400"}`}>
                              {stage.label}
                            </p>
                            {stageData?.timestamp && (
                              <p className="text-[11px] text-gray-500">
                                {new Date(stageData.timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-[#C9A14A]/20 p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-4">
                Order Journey
              </p>
              <OrderStatusTimeline
                timeline={order.timeline}
                currentStage={order.status}
                thirdPartyTracking={order.thirdPartyTracking}
              />
            </div>
          </>
        )}

        {/* Empty State */}
        {hasSearched && !order && !error && (
          <div className="text-center py-12">
            <p className="text-[14px] text-[#777777]">No order found</p>
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f8f7f2] border border-[#C9A14A]/20 flex items-center justify-center text-2xl">
              📦
            </div>
            <p className="text-[14px] text-[#555555]">
              Enter your Order ID above to track your order
            </p>
            <p className="text-[12px] text-[#777777] mt-2">
              Your Order ID was shown after placing your order
            </p>
          </div>
        )}
      </div>
    </section>
  );
}