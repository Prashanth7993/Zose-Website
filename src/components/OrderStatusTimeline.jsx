const ORDER_STAGES = [
  { id: "placed", label: "Placed", icon: "📦" },
  { id: "confirmed", label: "Confirmed", icon: "✓" },
  { id: "packed", label: "Packed", icon: "📦" },
  { id: "ready_for_shipment", label: "Ready for Shipment", icon: "🚚" },
  { id: "shipped", label: "Shipped", icon: "📬" },
  { id: "delivered", label: "Delivered", icon: "✅" },
];

export default function OrderStatusTimeline({ timeline, currentStage, thirdPartyTracking }) {
  const getStageIndex = (stageId) => ORDER_STAGES.findIndex((s) => s.id === stageId);
  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="w-full">
      <style>
        {`
          @keyframes blink-pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(201, 161, 74, 0.7);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.05);
              box-shadow: 0 0 0 12px rgba(201, 161, 74, 0);
            }
          }
          .stage-current {
            animation: blink-pulse 1.5s ease-in-out infinite;
          }
        `}
      </style>

      {/* Desktop Timeline - Horizontal */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A14A] via-[#C9A14A] to-[#e0e0e0]"
               style={{
                 background: `linear-gradient(to right,
                   #C9A14A 0%,
                   #C9A14A ${currentIndex >= 0 ? (currentIndex / 5) * 100 : 0}%,
                   #e0e0e0 ${currentIndex >= 0 ? (currentIndex / 5) * 100 : 0}%,
                   #e0e0e0 100%)`
               }}
          />

          <div className="relative flex justify-between items-start">
            {ORDER_STAGES.map((stage, index) => {
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const isPending = index > currentIndex;
              const hasTimestamp = timeline?.find(t => t.stage === stage.id && t.timestamp);

              return (
                <div key={stage.id} className="flex flex-col items-center" style={{ width: "16.66%" }}>
                  {/* Stage Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all
                      ${isCurrent ? "stage-current bg-[#C9A14A] border-[#C9A14A] text-white" : ""}
                      ${isCompleted && !isCurrent ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                      ${hasTimestamp && isCurrent ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                      ${isPending ? "bg-gray-100 border-gray-300 text-gray-400" : ""}
                    `}
                  >
                    {isCompleted && !isCurrent ? "✓" : (isCurrent && timeline?.find(t => t.stage === stage.id && t.timestamp) ? "✓" : stage.icon)}
                  </div>

                  {/* Stage Label */}
                  <div className="mt-3 text-center">
                    <p className={`text-[11px] font-semibold uppercase tracking-wider
                      ${isCurrent || isCompleted ? "text-[#0A0A0A]" : "text-gray-400"}
                    `}>
                      {stage.label}
                    </p>
                    {timeline?.find((t) => t.stage === stage.id)?.timestamp && (
                      <p className="text-[9px] text-gray-500 mt-0.5">
                        {new Date(timeline.find((t) => t.stage === stage.id).timestamp).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Timeline - Vertical */}
      <div className="md:hidden space-y-4">
        {ORDER_STAGES.map((stage, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const hasTimestamp = timeline?.find(t => t.stage === stage.id && t.timestamp);

          return (
            <div key={stage.id} className="flex items-start gap-3">
              {/* Stage Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 flex-shrink-0
                  ${isCurrent ? "stage-current bg-[#C9A14A] border-[#C9A14A] text-white" : ""}
                  ${isCompleted && !isCurrent ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                  ${hasTimestamp && isCurrent ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                  ${isPending ? "bg-gray-100 border-gray-300 text-gray-400" : ""}
                `}
              >
                {isCompleted && !isCurrent ? "✓" : (isCurrent && timeline?.find(t => t.stage === stage.id && t.timestamp) ? "✓" : stage.icon)}
              </div>

              {/* Stage Info */}
              <div className="flex-1 pt-1">
                <p className={`text-[13px] font-semibold
                  ${isCurrent || isCompleted ? "text-[#0A0A0A]" : "text-gray-400"}
                `}>
                  {stage.label}
                </p>
                {timeline?.find((t) => t.stage === stage.id)?.timestamp && (
                  <p className="text-[11px] text-gray-500">
                    {new Date(timeline.find((t) => t.stage === stage.id).timestamp).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                {isPending && <p className="text-[11px] text-gray-400">Pending</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Third-Party Tracking Info */}
      {thirdPartyTracking?.trackingId && (
        <div className="mt-6 p-3 rounded-xl bg-[#f8f7f2] border border-[#C9A14A]/20">
          <p className="text-[10px] uppercase tracking-wider text-[#C9A14A] font-semibold mb-1">
            Third-Party Tracking
          </p>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[12px] text-[#0A0A0A] font-medium">
                {thirdPartyTracking.courierName || "Courier"}
              </p>
              <p className="text-[11px] text-gray-600">
                Tracking ID: <span className="font-mono">{thirdPartyTracking.trackingId}</span>
              </p>
            </div>
            {thirdPartyTracking.trackingUrl && (
              <a
                href={thirdPartyTracking.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#C9A14A] hover:text-[#0A0A0A] font-semibold underline"
              >
                Track Online
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
