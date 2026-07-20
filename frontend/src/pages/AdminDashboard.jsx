import { useState, useEffect } from "react";
import {
  Home,
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getAllUsers,
  getPlatformStats,
  getAllOrdersAdmin,
} from "../services/api";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "users", label: "Users", icon: Users },
  { id: "orders", label: "Orders", icon: Package },
  { id: "market", label: "Market", icon: ShoppingBag },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState("home");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        getPlatformStats(),
        getAllUsers(),
        getAllOrdersAdmin(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const farmers = users.filter((u) => u.role === "farmer");
  const buyers = users.filter((u) => u.role === "buyer");

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center bg-stone-200"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <p style={{ color: "#1B4332", fontWeight: 500 }}>
          Loading admin panel...
        </p>
      </div>
    );
  }

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
            <div className="flex items-center gap-0.5">
              <div className="w-6 h-3 rounded-sm border border-zinc-700 p-px flex items-center">
                <div className="w-full h-full rounded-[1px] bg-zinc-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex-none px-6 pt-2 pb-4 bg-[#1B4332]">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs font-medium tracking-wide uppercase"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Admin Panel
              </p>
              <h1 className="text-[22px] font-bold text-white leading-tight mt-0.5">
                {user?.name} 👋
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="relative w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <Bell size={18} className="text-white" />
              </button>
              <button
                onClick={logout}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <LogOut size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              {
                label: "Total Users",
                value: stats?.totalUsers || 0,
                icon: Users,
                sub: `${farmers.length} farmers · ${buyers.length} buyers`,
              },
              {
                label: "Total Orders",
                value: stats?.totalOrders || 0,
                icon: Package,
                sub: "All time",
              },
              {
                label: "Products Listed",
                value: stats?.totalProducts || 0,
                icon: ShoppingBag,
                sub: "Active listings",
              },
              {
                label: "Platform Revenue",
                value: `ZMW ${(stats?.totalRevenue || 0).toLocaleString()}`,
                icon: TrendingUp,
                sub: "Total processed",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl px-4 py-3 flex flex-col gap-1"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <div className="flex items-center gap-2">
                  <s.icon
                    size={14}
                    className="text-white"
                    style={{ opacity: 0.7 }}
                  />
                  <p
                    className="text-[10px] font-medium"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {s.label}
                  </p>
                </div>
                <p className="text-[18px] font-bold text-white">{s.value}</p>
                <p
                  className="text-[10px]"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* All Orders */}
          <div className="px-6 mt-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-[#1C2B1A]">
                All Orders
              </h2>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#D8F3DC", color: "#1B4332" }}
              >
                {orders.length} total
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-black/5">
                <p className="text-sm text-[#7A7A6E]">No orders yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden divide-y divide-black/5">
                {orders.map((order) => (
                  <div
                    key={order.order_id}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-bold text-[#1C2B1A]">
                          {order.product_name}
                        </p>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          Confirmed
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7A7A6E] mt-0.5">
                        {order.buyer_name} → {order.farmer_name} ·{" "}
                        {order.quantity} kg
                      </p>
                      <p className="text-[10px] text-[#7A7A6E]">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-[12px] font-bold text-[#2D6A4F] ml-3 flex-none">
                      ZMW {parseFloat(order.total_price).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Users */}
          <div className="px-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-[#1C2B1A]">
                All Users
              </h2>
              <button className="flex items-center gap-0.5 text-[12px] font-semibold text-[#2D6A4F]">
                {users.length} total <ChevronRight size={13} />
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden divide-y divide-black/5">
              {users.map((u) => {
                const roleColors = {
                  farmer: "bg-emerald-50 text-emerald-700",
                  buyer: "bg-blue-50 text-blue-700",
                  admin: "bg-purple-50 text-purple-700",
                };
                const avatarColors = {
                  farmer: "bg-emerald-100 text-emerald-700",
                  buyer: "bg-blue-100 text-blue-700",
                  admin: "bg-purple-100 text-purple-700",
                };
                return (
                  <div key={u.id} className="px-4 py-3 flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-none ${avatarColors[u.role]}`}
                    >
                      {u.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-bold text-[#1C2B1A] truncate">
                          {u.username}
                        </p>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-none ${roleColors[u.role]}`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7A7A6E] truncate">
                        {u.email}
                      </p>
                      <p className="text-[10px] text-[#7A7A6E]">
                        Joined {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="flex-none bg-white border-t border-black/8 px-2 pb-4 pt-2">
          <div className="flex items-center">
            {NAV_ITEMS.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
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
