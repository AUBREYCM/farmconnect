import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Bell,
  ChevronRight,
  ShoppingCart,
  Package,
  Star,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAllProducts, placeOrder, getMyOrders } from "../services/api";

const PROVINCES = [
  "",
  "Lusaka",
  "Copperbelt",
  "Eastern",
  "Northern",
  "Southern",
  "Western",
  "Central",
  "North-Western",
  "Luapula",
  "Muchinga",
];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80";

export default function BuyerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeNav, setActiveNav] = useState("home");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [ordering, setOrdering] = useState(null);
  const [orderQty, setOrderQty] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-clear notification messages after 4 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        getAllProducts(),
        getMyOrders(),
      ]);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load marketplace data. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesProvince = selectedProvince
      ? p.province === selectedProvince
      : true;
    return matchesSearch && matchesProvince;
  });

  const totalSpent = orders.reduce(
    (sum, order) => sum + (parseFloat(order.total_price) || 0),
    0,
  );

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handlePlaceOrder = async (product) => {
    setError("");
    setSuccess("");
    try {
      await placeOrder({
        product_id: product.id,
        quantity: orderQty,
      });
      setSuccess(`Order placed for ${orderQty}kg of ${product.name}!`);
      setOrdering(null);
      setOrderQty(1);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order.");
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center bg-stone-200"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#1B4332] font-medium text-sm">
            Loading marketplace...
          </p>
        </div>
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
            <div className="w-6 h-3 rounded-sm border border-zinc-700 p-px flex items-center">
              <div className="w-full h-full rounded-[1px] bg-zinc-800" />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex-none px-6 pt-2 pb-4 bg-[#F7F5F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#7A7A6E] tracking-wide uppercase">
                Good morning
              </p>
              <h1 className="text-[22px] font-bold text-[#1C2B1A] leading-tight mt-0.5">
                {user?.name || "Buyer"} 👋
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/5 active:scale-95 transition-transform">
                <Bell size={18} className="text-[#1C2B1A]" />
              </button>
              <button
                onClick={logout}
                title="Logout"
                className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#2D6A4F] ring-offset-2 ring-offset-[#F7F5F0] bg-emerald-100 flex items-center justify-center active:scale-95 transition-transform"
              >
                <span className="text-[#2D6A4F] font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-[#D8F3DC] rounded-2xl px-4 py-3 shadow-sm border border-emerald-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#B7E4C7] flex items-center justify-center">
                <ShoppingCart size={16} className="text-[#2D6A4F]" />
              </div>
              <div>
                <p className="text-[10px] text-[#7A7A6E] font-medium leading-none">
                  Total Spent
                </p>
                <p className="text-[13px] font-bold text-[#1C2B1A] mt-1">
                  ZMW {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>

            <div className="flex-1 bg-[#F5EBE0] rounded-2xl px-4 py-3 shadow-sm border border-amber-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E6CCB2] flex items-center justify-center">
                <Package size={16} className="text-[#A67C52]" />
              </div>
              <div>
                <p className="text-[10px] text-[#7A7A6E] font-medium leading-none">
                  My Orders
                </p>
                <p className="text-[13px] font-bold text-[#1C2B1A] mt-1">
                  {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Notifications */}
          {success && (
            <div className="mx-6 mt-2 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between bg-[#D8F3DC] text-[#1B4332]">
              <span>{success}</span>
              <button onClick={() => setSuccess("")}>
                <X size={14} />
              </button>
            </div>
          )}
          {error && (
            <div className="mx-6 mt-2 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between bg-red-100 text-red-800">
              <span>{error}</span>
              <button onClick={() => setError("")}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Dynamic Tab Views */}
          {(activeNav === "home" || activeNav === "market") && (
            <>
              {/* Search */}
              <div className="px-6 pt-3 pb-3">
                <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-black/5">
                  <Search size={15} className="text-[#7A7A6E]" />
                  <input
                    type="text"
                    placeholder="Search produce..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-sm outline-none bg-transparent text-[#1C2B1A]"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")}>
                      <X size={14} className="text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Province Filter */}
              <div
                className="px-6 pb-3 flex gap-2 overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {PROVINCES.map((province) => (
                  <button
                    key={province || "all"}
                    onClick={() => setSelectedProvince(province)}
                    className="flex-none px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                    style={{
                      background:
                        selectedProvince === province ? "#1B4332" : "#fff",
                      color: selectedProvince === province ? "#fff" : "#7A7A6E",
                      border: "1px solid #D8F3DC",
                    }}
                  >
                    {province === "" ? "All Zambia" : province}
                  </button>
                ))}
              </div>

              {/* Marketplace List */}
              <div className="pt-1 pb-4">
                <div className="flex items-center justify-between px-6 mb-3">
                  <h2 className="text-[15px] font-bold text-[#1C2B1A]">
                    Fresh Produce
                  </h2>
                  <span className="text-[12px] font-semibold text-[#2D6A4F] flex items-center gap-0.5">
                    {filteredProducts.length} listings{" "}
                    <ChevronRight size={13} />
                  </span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="mx-6 bg-white rounded-2xl p-6 text-center shadow-sm border border-black/5">
                    <p className="text-sm text-[#7A7A6E]">
                      No products matching your search.
                    </p>
                  </div>
                ) : (
                  <div
                    className="flex gap-4 overflow-x-auto px-6 pb-2"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {filteredProducts.map((product) => {
                      const unitPrice = Number(product.price) || 0;
                      return (
                        <div
                          key={product.id}
                          className="flex-none w-[158px] bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5 flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative h-[110px] bg-stone-100">
                              <img
                                src={product.image_url || DEFAULT_IMAGE}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = DEFAULT_IMAGE;
                                }}
                              />
                              <span className="absolute top-2 left-2 bg-[#2D6A4F] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                                FRESH
                              </span>
                            </div>

                            <div className="px-3 pt-2.5">
                              <p className="text-[13px] font-bold text-[#1C2B1A] truncate">
                                {product.name}
                              </p>

                              <div
                                onClick={() =>
                                  navigate(
                                    `/farmer/${product.farmer_id || product.user_id}`,
                                  )
                                }
                                className="flex items-center gap-1 mt-0.5 cursor-pointer hover:underline group"
                              >
                                <Star
                                  size={9}
                                  className="text-yellow-400 fill-yellow-400"
                                />
                                <span className="text-[10px] text-[#7A7A6E] font-medium group-hover:text-[#2D6A4F] truncate">
                                  by {product.farmer_name || "Local Farmer"}
                                </span>
                              </div>

                              <div className="mt-2">
                                <p className="text-[10px] text-[#7A7A6E]">
                                  Price / kg
                                </p>
                                <p className="text-[14px] font-extrabold text-[#2D6A4F]">
                                  ZMW {formatCurrency(unitPrice)}
                                </p>
                              </div>
                              <p className="text-[10px] text-[#7A7A6E] mt-0.5 font-medium">
                                {product.quantity} kg available
                              </p>
                            </div>
                          </div>

                          {/* Order Actions */}
                          <div className="p-3 pt-1">
                            {ordering === product.id ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      setOrderQty(Math.max(1, orderQty - 1))
                                    }
                                    className="w-6 h-6 rounded-lg text-sm font-bold flex items-center justify-center bg-[#D8F3DC] text-[#1B4332]"
                                  >
                                    -
                                  </button>
                                  <span className="flex-1 text-center text-xs font-bold text-[#1C2B1A]">
                                    {orderQty} kg
                                  </span>
                                  <button
                                    onClick={() =>
                                      setOrderQty(
                                        Math.min(
                                          product.quantity,
                                          orderQty + 1,
                                        ),
                                      )
                                    }
                                    className="w-6 h-6 rounded-lg text-sm font-bold flex items-center justify-center bg-[#D8F3DC] text-[#1B4332]"
                                  >
                                    +
                                  </button>
                                </div>

                                <p className="text-center text-[10px] font-bold text-[#2D6A4F]">
                                  Total: ZMW{" "}
                                  {formatCurrency(unitPrice * orderQty)}
                                </p>

                                <button
                                  onClick={() => handlePlaceOrder(product)}
                                  className="w-full py-1.5 rounded-lg text-[11px] font-bold text-white bg-[#2D6A4F] active:scale-95 transition-transform"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => {
                                    setOrdering(null);
                                    setOrderQty(1);
                                  }}
                                  className="w-full py-1 rounded-lg text-[10px] font-medium text-[#7A7A6E]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setOrdering(product.id);
                                  setOrderQty(1);
                                }}
                                disabled={product.quantity === 0}
                                className="w-full py-1.5 rounded-lg text-[11px] font-bold text-white transition-opacity active:scale-95 disabled:opacity-50"
                                style={{
                                  background:
                                    product.quantity === 0 ? "#CCC" : "#2D6A4F",
                                }}
                              >
                                {product.quantity === 0
                                  ? "Out of Stock"
                                  : "Order Now"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Orders Section / View */}
          {(activeNav === "home" || activeNav === "orders") && (
            <div className="px-6 mt-2 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-[#1C2B1A]">
                  My Orders
                </h2>
                <span className="bg-[#A67C52] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {orders.length} total
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-black/5">
                  <p className="text-sm text-[#7A7A6E]">
                    No orders yet. Browse fresh produce above and place your
                    first order!
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden divide-y divide-black/5">
                  {orders.map((order) => (
                    <div
                      key={order.order_id || order.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-bold text-[#1C2B1A] truncate">
                            {order.product_name}
                          </p>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex-none">
                            Confirmed
                          </span>
                        </div>
                        <p className="text-[10px] text-[#7A7A6E] mt-0.5 truncate">
                          {order.quantity} kg · {order.farmer_name || "Farmer"}{" "}
                          ·{" "}
                          {order.order_date
                            ? new Date(order.order_date).toLocaleDateString()
                            : "Recent"}
                        </p>
                      </div>
                      <p className="text-[12px] font-bold text-[#2D6A4F] ml-3 flex-none">
                        ZMW {formatCurrency(order.total_price)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <div className="flex-none bg-white border-t border-black/8 px-2 pb-4 pt-2">
          <div className="flex items-center">
            {[
              { id: "home", label: "Home", emoji: "🏠" },
              { id: "market", label: "Marketplace", emoji: "🛒" },
              { id: "orders", label: "Orders", emoji: "📦" },
              {
                id: "profile",
                label: "Profile",
                emoji: "👤",
                isRoute: true,
                path: "/profile",
              },
            ].map((item) => {
              const active = item.isRoute
                ? location.pathname === item.path
                : activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isRoute) {
                      navigate(item.path);
                    } else {
                      setActiveNav(item.id);
                    }
                  }}
                  className="flex-1 flex flex-col items-center gap-1 py-1 transition-opacity active:opacity-75"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: active ? "#2D6A4F" : "#7A7A6E" }}
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
