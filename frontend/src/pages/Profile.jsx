import {
  Home,
  ShoppingBag,
  Package,
  User,
  Settings,
  LogOut,
  ChevronRight,
  MapPin,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getFarmerOrders, getMyOrders, getAllProducts } from "../services/api";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    listings: 0,
    spent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      if (user?.role === "farmer") {
        const [ordersRes, productsRes] = await Promise.all([
          getFarmerOrders(),
          getAllProducts(),
        ]);
        const myProducts = productsRes.data.filter(
          (p) => p.farmer_name === user?.name,
        );
        const totalRevenue = ordersRes.data.reduce(
          (sum, o) => sum + parseFloat(o.total_price || 0),
          0,
        );
        setStats({
          orders: ordersRes.data.length,
          revenue: totalRevenue,
          listings: myProducts.length,
          spent: 0,
        });
      } else if (user?.role === "buyer") {
        const ordersRes = await getMyOrders();
        const totalSpent = ordersRes.data.reduce(
          (sum, o) => sum + parseFloat(o.total_price || 0),
          0,
        );
        setStats({
          orders: ordersRes.data.length,
          revenue: 0,
          listings: 0,
          spent: totalSpent,
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const farmerStats = [
    {
      label: "Total Revenue",
      value: `ZMW ${stats.revenue.toLocaleString()}`,
      icon: TrendingUp,
    },
    { label: "Orders Fulfilled", value: stats.orders, icon: Package },
    { label: "Active Listings", value: stats.listings, icon: ShoppingCart },
  ];

  const buyerStats = [
    {
      label: "Total Spent",
      value: `ZMW ${stats.spent.toLocaleString()}`,
      icon: TrendingUp,
    },
    { label: "Orders Placed", value: stats.orders, icon: Package },
  ];

  const displayStats = user?.role === "farmer" ? farmerStats : buyerStats;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-stone-200 p-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Phone Frame */}
      <div className="relative w-[390px] h-[844px] rounded-[48px] overflow-hidden shadow-2xl border-[8px] border-zinc-800 bg-[#F7F5F0] flex flex-col">
        {/* Status Bar */}
        <div className="flex-none px-8 pt-4 pb-1 flex items-center justify-between bg-[#F7F5F0] z-10">
          <span className="text-[13px] font-semibold text-zinc-800">9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="3" width="3" height="9" rx="1" fill="#1C2B1A" />
              <rect x="4.5" y="2" width="3" height="10" rx="1" fill="#1C2B1A" />
              <rect
                x="9"
                y="0.5"
                width="3"
                height="11.5"
                rx="1"
                fill="#1C2B1A"
              />
              <rect
                x="13.5"
                y="0"
                width="3"
                height="12"
                rx="1"
                fill="#1C2B1A"
                opacity="0.3"
              />
            </svg>
          </div>
        </div>

        {/* Cover Banner */}
        <div
          className="flex-none h-[120px] relative"
          style={{
            background: "linear-gradient(135deg, #1B4332 0%, #40916C 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white" />
            <div className="absolute bottom-2 right-24 w-12 h-12 rounded-full bg-white" />
            <div className="absolute top-8 left-16 w-8 h-8 rounded-full bg-white" />
          </div>
          {/* Settings icon */}
          <button
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <Settings size={14} className="text-white" />
          </button>
        </div>

        {/* Avatar + Identity */}
        <div className="flex-none px-6 pb-4" style={{ background: "#F7F5F0" }}>
          <div className="flex items-end justify-between -mt-8 mb-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center ring-4 ring-[#F7F5F0]"
              style={{ background: "#1B4332" }}
            >
              <span className="text-white font-bold text-2xl">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: "#FEE2E2", color: "#991B1B" }}
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>

          <h1 className="text-[20px] font-bold text-[#1C2B1A]">{user?.name}</h1>
          <p className="text-[12px] text-[#7A7A6E] mt-0.5">@{user?.name}</p>

          <div className="flex items-center gap-3 mt-2">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: user?.role === "farmer" ? "#D8F3DC" : "#EFF6FF",
                color: user?.role === "farmer" ? "#1B4332" : "#1D4ED8",
              }}
            >
              {user?.role === "farmer" ? "🌱 Farmer" : "🛒 Buyer"}
            </span>
            <div className="flex items-center gap-1">
              <MapPin size={10} className="text-[#A67C52]" />
              <span className="text-[10px] text-[#7A7A6E]">Zambia</span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex-none px-6 mb-4">
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${displayStats.length}, 1fr)`,
            }}
          >
            {displayStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-3 text-center"
                style={{ background: "#fff", border: "1px solid #D8F3DC" }}
              >
                <stat.icon
                  size={14}
                  className="mx-auto mb-1"
                  style={{ color: "#40916C" }}
                />
                <p className="text-[13px] font-bold text-[#1C2B1A]">
                  {stat.value}
                </p>
                <p className="text-[9px] text-[#7A7A6E] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-none px-6 mb-4">
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ background: "#E8E8E0" }}
          >
            {["info", "activity", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 text-[11px] font-semibold capitalize transition-all"
                style={{
                  background: activeTab === tab ? "#1B4332" : "transparent",
                  color: activeTab === tab ? "#fff" : "#7A7A6E",
                  borderRadius: activeTab === tab ? "10px" : "0",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div
          className="flex-1 overflow-y-auto px-6"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Info Tab */}
          {activeTab === "info" && (
            <div className="space-y-3">
              <div
                className="bg-white rounded-2xl p-4"
                style={{ border: "1px solid #D8F3DC" }}
              >
                <p className="text-[11px] font-semibold text-[#7A7A6E] mb-3 uppercase tracking-wide">
                  Account Info
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-[#7A7A6E]">Username</p>
                    <p className="text-[12px] font-semibold text-[#1C2B1A]">
                      {user?.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-[#7A7A6E]">Email</p>
                    <p className="text-[12px] font-semibold text-[#1C2B1A]">
                      {user?.email}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-[#7A7A6E]">Role</p>
                    <p className="text-[12px] font-semibold text-[#1C2B1A] capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Role CTA */}
              <div
                className="rounded-2xl p-4"
                style={{ background: "#1B4332" }}
              >
                <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wide mb-1">
                  {user?.role === "farmer"
                    ? "Also want to buy?"
                    : "Also want to sell?"}
                </p>
                <p className="text-[13px] font-bold text-white mb-3">
                  {user?.role === "farmer"
                    ? "Switch to Buyer mode to purchase produce from other farmers"
                    : "Switch to Farmer mode to list your own produce for sale"}
                </p>
                <button
                  className="px-4 py-2 rounded-xl text-[11px] font-bold"
                  style={{ background: "#A67C52", color: "#fff" }}
                >
                  Coming soon
                </button>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div
              className="bg-white rounded-2xl p-6 text-center"
              style={{ border: "1px solid #D8F3DC" }}
            >
              <Package
                size={32}
                className="mx-auto mb-3"
                style={{ color: "#D8F3DC" }}
              />
              <p className="text-[13px] font-bold text-[#1C2B1A] mb-1">
                Activity Log
              </p>
              <p className="text-[11px] text-[#7A7A6E]">
                Your recent activity will appear here.
              </p>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-3">
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: "1px solid #D8F3DC" }}
              >
                {[
                  { label: "Edit Profile", icon: User },
                  { label: "Notifications", icon: Package },
                  { label: "Privacy", icon: Settings },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer active:bg-stone-50"
                    style={{
                      borderBottom: i < 2 ? "1px solid #F0F0EA" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "#D8F3DC" }}
                      >
                        <item.icon size={14} style={{ color: "#1B4332" }} />
                      </div>
                      <p className="text-[13px] font-semibold text-[#1C2B1A]">
                        {item.label}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-[#7A7A6E]" />
                  </div>
                ))}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: "#FEE2E2", color: "#991B1B" }}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <div className="flex-none bg-white border-t border-black/8 px-2 pb-4 pt-2">
          <div className="flex items-center">
            {[
              {
                id: "home",
                label: "Home",
                icon: Home,
                path:
                  user?.role === "farmer"
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
                id: "orders",
                label: "Orders",
                icon: Package,
                path:
                  user?.role === "farmer"
                    ? "/dashboard/farmer"
                    : "/dashboard/buyer",
              },
              { id: "profile", label: "Profile", icon: User, path: "/profile" },
            ].map((item) => {
              const active = item.id === "profile";
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
