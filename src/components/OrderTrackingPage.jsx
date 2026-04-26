import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getOrderById } from "../lib/auth";
import OrderStatusTimeline from "./OrderStatusTimeline";

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!searchParams.get("id"));

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
      } else {
        setError("Order not found. Please check your Order ID.");
      }
    } catch (_err) {
      setError("Unable to fetch order details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    await trackOrder(orderId);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
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

              <div className="mt-4 flex items-center gap-2 text-[11px] text-[#555555]">
                <span className="px-2 py-1 bg-[#f8f7f2] rounded border border-[#C9A14A]/20">
                  Payment: {order.paymentMode || "COD"}
                </span>
                <span className="px-2 py-1 bg-[#f8f7f2] rounded border border-[#C9A14A]/20">
                  Status: {order.status?.replace("_", " ")}
                </span>
              </div>
            </div>

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
