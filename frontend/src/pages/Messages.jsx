import { useNavigate } from "react-router-dom";
import { Home, ShoppingBag, MessageCircle, Package, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const NAV_ITEMS = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path:
        user?.active_mode === "farmer"
          ? "/dashboard/farmer"
          : "/dashboard/buyer",
    },
    {
      id: "market",
      label: "Marketplace",
      icon: ShoppingBag,
      path: "/dashboard/buyer",
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      path: "/messages",
    },
    {
      id: "orders",
      label: "Orders",
      icon: Package,
      path:
        user?.active_mode === "farmer"
          ? "/dashboard/farmer"
          : "/dashboard/buyer",
    },
    { id: "me", label: "Me", icon: User, path: "/profile" },
  ];

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-stone-200 p-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="relative w-[390px] h-[844px] rounded-[48px] overflow-hidden shadow-2xl border-[8px] border-zinc-800 bg-[#F7F5F0] flex flex-col">
        {/* Status Bar */}
        <div className="flex-none px-8 pt-4 pb-1 flex items-center justify-between bg-[#F7F5F0]">
          <span className="text-[13px] font-semibold text-zinc-800">9:41</span>
        </div>

        {/* Header */}
        <div className="flex-none px-6 pt-4 pb-4 bg-[#F7F5F0]">
          <h1 className="text-[22px] font-bold text-[#1C2B1A]">Messages</h1>
          <p className="text-[12px] text-[#7A7A6E] mt-0.5">
            Your conversations with farmers and buyers
          </p>
        </div>

        {/* Coming Soon Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{ background: "#D8F3DC" }}
          >
            <MessageCircle size={40} style={{ color: "#1B4332" }} />
          </div>
          <h2 className="text-[18px] font-bold text-[#1C2B1A] mb-2 text-center">
            Messaging Coming Soon
          </h2>
          <p className="text-[13px] text-[#7A7A6E] text-center leading-relaxed max-w-[260px]">
            Soon you'll be able to chat directly with farmers and buyers,
            negotiate prices, and arrange deliveries — all in one place.
          </p>
          <div
            className="mt-8 px-6 py-4 rounded-2xl text-center"
            style={{ background: "#fff", border: "1px solid #D8F3DC" }}
          >
            <p className="text-[11px] font-semibold text-[#7A7A6E] uppercase tracking-wide mb-1">
              In the meantime
            </p>
            <p className="text-[12px] text-[#1C2B1A]">
              Use the phone number on a farmer's profile to contact them
              directly
            </p>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="flex-none bg-white border-t border-black/8 px-2 pb-4 pt-2">
          <div className="flex items-center">
            {NAV_ITEMS.map((item) => {
              const active = item.id === "messages";
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="flex-1 flex flex-col items-center gap-1 py-1"
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${active ? "bg-[#EAF3EE]" : ""}`}
                  >
                    <item.icon
                      size={20}
                      className={`transition-colors ${active ? "text-[#2D6A4F]" : "text-[#7A7A6E]"}`}
                      strokeWidth={active ? 2.5 : 2.1}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-semibold transition-colors ${active ? "text-[#2D6A4F]" : "text-[#7A7A6E]"}`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
