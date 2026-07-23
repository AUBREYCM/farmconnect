import { useState, useEffect } from "react";
import {
  Home,
  ShoppingBag,
  MessageCircle,
  User,
  Bell,
  ChevronRight,
  ShoppingCart,
  Package,
  Star,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAllProducts, placeOrder, getMyOrders } from "../services/api";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "market", label: "Marketplace", icon: ShoppingBag },
  { id: "orders", label: "Orders", icon: Package },
  { id: "profile", label: "Profile", icon: User },
];

export default function BuyerDashboard() {
  const { user, logout } = useAuth();
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        getAllProducts(),
        getMyOrders(),
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
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
    (sum, order) => sum + parseFloat(order.total_price || 0),
    0,
  );

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
      setError(err.response?.data?.message || "Failed to place order");
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center bg-stone-200"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <p style={{ color: "#1B4332", fontWeight: 500 }}>
          Loading marketplace...
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
        <div className="flex-none px-6 pt-2 pb-4 bg-[#F7F5F0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#7A7A6E] tracking-wide uppercase">
                Good morning
              </p>
              <h1 className="text-[22px] font-bold text-[#1C2B1A] leading-tight mt-0.5">
                {user?.name} 👋
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/5">
                <Bell size={18} className="text-[#1C2B1A]" />
              </button>
              <button
                onClick={logout}
                className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#2D6A4F] ring-offset-2 ring-offset-[#F7F5F0] bg-emerald-100 flex items-center justify-center"
              >
                <span className="text-[#2D6A4F] font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex gap-3 mt-4">
            {[
              {
                label: "Total Spent",
                value: `ZMW ${totalSpent.toLocaleString()}`,
                icon: ShoppingCart,
                color: "text-[#2D6A4F]",
              },
              {
                label: "My Orders",
                value: `${orders.length} ${orders.length === 1 ? "Order" : "Orders"}`,
                icon: Package,
                color: "text-[#A67C52]",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 bg-[#D8F3DC] rounded-2xl px-4 py-3 shadow-sm border border-emerald-100 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[#D8F3DC] flex items-center justify-center">
                  <s.icon size={16} className={s.color} />
                </div>
                <div>
                  <p className="text-[10px] text-[#7A7A6E] font-medium leading-none">
                    {s.label}
                  </p>
                  <p className="text-[13px] font-bold text-[#1C2B1A] mt-1">
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Success/Error messages */}
          {success && (
            <div
              className="mx-6 mt-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: "#D8F3DC", color: "#1B4332" }}
            >
              {success}
            </div>
          )}
          {error && (
            <div
              className="mx-6 mt-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: "#FEE2E2", color: "#991B1B" }}
            >
              {error}
            </div>
          )}

          {/* Search */}
          <div className="px-6 pt-2 pb-3">
            <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-black/5">
              <Search size={15} className="text-[#7A7A6E]" />
              <input
                type="text"
                placeholder="Search produce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent text-[#1C2B1A]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
            </div>
          </div>
          {/* Province Filter */}
          <div
            className="px-6 pb-3 flex gap-2 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {[
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
            ].map((province) => (
              <button
                key={province}
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

          {/* Marketplace */}
          <div className="pt-1 pb-1">
            <div className="flex items-center justify-between px-6 mb-3">
              <h2 className="text-[15px] font-bold text-[#1C2B1A]">
                Fresh Produce
              </h2>
              <button className="flex items-center gap-0.5 text-[12px] font-semibold text-[#2D6A4F]">
                {filteredProducts.length} listings <ChevronRight size={13} />
              </button>
            </div>

            {/* Product cards */}
            {filteredProducts.length === 0 ? (
              <div className="mx-6 bg-white rounded-2xl p-6 text-center shadow-sm border border-black/5">
                <p className="text-sm text-[#7A7A6E]">No products found.</p>
              </div>
            ) : (
              <div
                className="flex gap-4 overflow-x-auto px-6 pb-3"
                style={{ scrollbarWidth: "none" }}
              >
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex-none w-[158px] bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5"
                  >
                    <div className="relative h-[110px] bg-stone-100">
                      <img
                        src={
                          product.image_url ||
                          `https://source.unsplash.com/400x300/?${encodeURIComponent(product.name)},vegetable,food`
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=400&h=300&fit=crop&auto=format";
                        }}
                      />
                      <span className="absolute top-2 left-2 bg-[#2D6A4F] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                        FRESH
                      </span>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] font-bold text-[#1C2B1A]">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star
                          size={9}
                          className="text-yellow-400 fill-yellow-400"
                        />
                        <span className="text-[10px] text-[#7A7A6E] font-medium">
                          by {product.farmer_name}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-[11px] text-[#7A7A6E]">Price / kg</p>
                        <p className="text-[14px] font-extrabold text-[#2D6A4F]">
                          ZMW {product.price}
                        </p>
                      </div>
                      <p className="text-[10px] text-[#7A7A6E] mt-1 font-medium">
                        {product.quantity} kg left
                      </p>

                      {/* Order button */}
                      {ordering === product.id ? (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setOrderQty(Math.max(1, orderQty - 1))
                              }
                              className="w-6 h-6 rounded-lg text-sm font-bold flex items-center justify-center"
                              style={{
                                background: "#D8F3DC",
                                color: "#1B4332",
                              }}
                            >
                              -
                            </button>
                            <span className="flex-1 text-center text-xs font-bold text-[#1C2B1A]">
                              {orderQty} kg
                            </span>
                            <button
                              onClick={() =>
                                setOrderQty(
                                  Math.min(product.quantity, orderQty + 1),
                                )
                              }
                              className="w-6 h-6 rounded-lg text-sm font-bold flex items-center justify-center"
                              style={{
                                background: "#D8F3DC",
                                color: "#1B4332",
                              }}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-center text-[10px] font-bold text-[#2D6A4F]">
                            ZMW {(product.price * orderQty).toFixed(2)}
                          </p>
                          <button
                            onClick={() => handlePlaceOrder(product)}
                            className="w-full py-1.5 rounded-lg text-[11px] font-bold text-white"
                            style={{ background: "#2D6A4F" }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setOrdering(null);
                              setOrderQty(1);
                            }}
                            className="w-full py-1 rounded-lg text-[10px] font-medium"
                            style={{ color: "#7A7A6E" }}
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
                          className="mt-2 w-full py-1.5 rounded-lg text-[11px] font-bold text-white"
                          style={{
                            background:
                              product.quantity === 0 ? "#ccc" : "#2D6A4F",
                          }}
                        >
                          {product.quantity === 0
                            ? "Out of stock"
                            : "Order now"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Orders */}
          <div className="px-6 mt-4 mb-6">
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
                  No orders yet. Browse fresh produce above and place your first
                  order!
                </p>
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
                        {order.quantity} kg · {order.farmer_name} ·{" "}
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
                  className="flex-1 flex flex-col items-center gap-1 py-1 relative"
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
