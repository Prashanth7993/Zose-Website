import { useEffect, useState } from "react";
import { getUserOrders } from "../lib/auth";
import OrderStatusTimeline from "./OrderStatusTimeline";

const ORDER_STAGES = [
  { id: "placed", label: "Placed", icon: "📦" },
  { id: "confirmed", label: "Confirmed", icon: "✓" },
  { id: "packed", label: "Packed", icon: "📦" },
  { id: "ready_for_shipment", label: "Ready for Shipment", icon: "🚚" },
  { id: "shipped", label: "Shipped", icon: "📬" },
  { id: "delivered", label: "Delivered", icon: "✅" },
];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getUserOrders();
        console.log("[MyOrders] Response:", response);
        setOrders(response.orders || []);
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
