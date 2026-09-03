import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getFarmerOrders,
  getMyOrders,
  getAllProducts,
  activateFarmer,
  switchMode,
} from "../services/api";
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
} from "lucide-react";

export default function Profile() {
  const { user, login, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    listings: 0,
    spent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showFarmerSetup, setShowFarmerSetup] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const [farmerForm, setFarmerForm] = useState({
    phone: "",
    farm_province: "",
    main_produce: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      if (user?.is_farmer) {
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
      } else {
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

  const handleActivateFarmer = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    try {
      const response = await activateFarmer(farmerForm);
      setFormSuccess("Farmer mode activated! You can now list produce.");
      // Update user in AuthContext
      login(response.data, token);
      setTimeout(() => {
        setShowFarmerSetup(false);
        navigate("/dashboard/farmer");
      }, 1500);
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to activate farmer mode",
      );
    }
  };

  const handleSwitchMode = async (mode) => {
    setSwitchingMode(true);
    try {
      const response = await switchMode({ mode });
      login(response.data, token);
      navigate(mode === "farmer" ? "/dashboard/farmer" : "/dashboard/buyer");
    } catch (err) {
      console.error("Failed to switch mode:", err);
    } finally {
      setSwitchingMode(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
          </div>
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

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {user?.is_farmer && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#D8F3DC", color: "#1B4332" }}
              >
                🌱 Farmer
              </span>
            )}
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#EFF6FF", color: "#1D4ED8" }}
            >
              🛒 Buyer
            </span>
            {user?.farm_province && (
              <div className="flex items-center gap-1">
                <MapPin size={10} className="text-[#A67C52]" />
                <span className="text-[10px] text-[#7A7A6E]">
                  {user.farm_province}
                </span>
              </div>
            )}
          </div>

          {/* Mode Switch (only if farmer) */}
          {user?.is_farmer && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleSwitchMode("buyer")}
                disabled={switchingMode}
                className="flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all"
                style={{
                  background:
                    user?.active_mode === "buyer" ? "#1B4332" : "#F0F0EA",
                  color: user?.active_mode === "buyer" ? "#fff" : "#7A7A6E",
                }}
              >
                🛒 Buyer mode
              </button>
              <button
                onClick={() => handleSwitchMode("farmer")}
                disabled={switchingMode}
                className="flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all"
                style={{
                  background:
                    user?.active_mode === "farmer" ? "#1B4332" : "#F0F0EA",
                  color: user?.active_mode === "farmer" ? "#fff" : "#7A7A6E",
                }}
              >
                🌱 Farmer mode
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto px-6"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Tabs */}
          <div
            className="flex rounded-xl overflow-hidden mb-4"
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

          {/* Info Tab */}
          {activeTab === "info" && (
            <div className="space-y-3">
              {/* Account Info Card */}
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
                    <p className="text-[12px] font-semibold text-[#1C2B1A] truncate max-w-[180px]">
                      {user?.email}
                    </p>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-[#7A7A6E]">Phone</p>
                      <p className="text-[12px] font-semibold text-[#1C2B1A]">
                        {user.phone}
                      </p>
                    </div>
                  )}
                  {user?.created_at && (
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-[#7A7A6E]">Member since</p>
                      <p className="text-[12px] font-semibold text-[#1C2B1A]">
                        {new Date(user.created_at).toLocaleDateString("en-GB", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-[#7A7A6E]">Account type</p>
                    <div className="flex gap-1">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                      >
                        Buyer
                      </span>
                      {user?.is_farmer && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "#D8F3DC", color: "#1B4332" }}
                        >
                          Farmer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Farmer Details Card — only if farmer */}
              {user?.is_farmer && (
                <div
                  className="bg-white rounded-2xl p-4"
                  style={{ border: "1px solid #D8F3DC" }}
                >
                  <p className="text-[11px] font-semibold text-[#7A7A6E] mb-3 uppercase tracking-wide">
                    Farmer Details
                  </p>
                  <div className="space-y-3">
                    {user?.farm_province && (
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-[#7A7A6E]">Province</p>
                        <p className="text-[12px] font-semibold text-[#1C2B1A]">
                          {user.farm_province}
                        </p>
                      </div>
                    )}
                    {user?.main_produce && (
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-[#7A7A6E]">
                          Main Produce
                        </p>
                        <p className="text-[12px] font-semibold text-[#1C2B1A]">
                          {user.main_produce}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-[#7A7A6E]">
                        Total Listings
                      </p>
                      <p className="text-[12px] font-semibold text-[#1C2B1A]">
                        {stats.listings}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-[#7A7A6E]">
                        Total Revenue
                      </p>
                      <p
                        className="text-[12px] font-semibold"
                        style={{ color: "#2D6A4F" }}
                      >
                        ZMW {stats.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-[#7A7A6E]">
                        Orders Fulfilled
                      </p>
                      <p className="text-[12px] font-semibold text-[#1C2B1A]">
                        {stats.orders}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Buyer Stats Card */}
              <div
                className="bg-white rounded-2xl p-4"
                style={{ border: "1px solid #D8F3DC" }}
              >
                <p className="text-[11px] font-semibold text-[#7A7A6E] mb-3 uppercase tracking-wide">
                  Buyer Activity
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-[#7A7A6E]">Total Orders</p>
                    <p className="text-[12px] font-semibold text-[#1C2B1A]">
                      {stats.orders}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-[#7A7A6E]">Total Spent</p>
                    <p
                      className="text-[12px] font-semibold"
                      style={{ color: "#2D6A4F" }}
                    >
                      ZMW {stats.spent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activate Farmer CTA */}
              {!user?.is_farmer && !showFarmerSetup && (
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "#1B4332" }}
                >
                  <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wide mb-1">
                    Want to sell?
                  </p>
                  <p className="text-[13px] font-bold text-white mb-3">
                    Activate Farmer mode to list your produce and start earning
                  </p>
                  <button
                    onClick={() => setShowFarmerSetup(true)}
                    className="px-4 py-2 rounded-xl text-[11px] font-bold"
                    style={{ background: "#A67C52", color: "#fff" }}
                  >
                    Start selling →
                  </button>
                </div>
              )}

              {/* Farmer Setup Form */}
              {showFarmerSetup && (
                <form
                  onSubmit={handleActivateFarmer}
                  className="bg-white rounded-2xl p-4"
                  style={{ border: "1px solid #D8F3DC" }}
                >
                  <p className="font-bold text-sm text-[#1C2B1A] mb-3">
                    🌱 Set up your farmer profile
                  </p>

                  {formError && (
                    <div
                      className="mb-3 px-3 py-2 rounded-lg text-xs"
                      style={{ background: "#FEE2E2", color: "#991B1B" }}
                    >
                      {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div
                      className="mb-3 px-3 py-2 rounded-lg text-xs"
                      style={{ background: "#D8F3DC", color: "#1B4332" }}
                    >
                      {formSuccess}
                    </div>
                  )}

                  <div className="space-y-2">
                    <input
                      type="tel"
                      placeholder="Phone number (e.g. 0977123456)"
                      value={farmerForm.phone}
                      onChange={(e) =>
                        setFarmerForm({ ...farmerForm, phone: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-black/10 bg-[#F7F5F0]"
                    />

                    <select
                      value={farmerForm.farm_province}
                      onChange={(e) =>
                        setFarmerForm({
                          ...farmerForm,
                          farm_province: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-black/10 bg-[#F7F5F0]"
                    >
                      <option value="">Select your province</option>
                      <option value="Lusaka">Lusaka</option>
                      <option value="Copperbelt">Copperbelt</option>
                      <option value="Eastern">Eastern</option>
                      <option value="Northern">Northern</option>
                      <option value="Southern">Southern</option>
                      <option value="Western">Western</option>
                      <option value="Central">Central</option>
                      <option value="North-Western">North-Western</option>
                      <option value="Luapula">Luapula</option>
                      <option value="Muchinga">Muchinga</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Main produce (e.g. Tomatoes, Maize)"
                      value={farmerForm.main_produce}
                      onChange={(e) =>
                        setFarmerForm({
                          ...farmerForm,
                          main_produce: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-black/10 bg-[#F7F5F0]"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFarmerSetup(false)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold border border-black/10"
                        style={{ color: "#7A7A6E" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                        style={{ background: "#2D6A4F" }}
                      >
                        Activate
                      </button>
                    </div>
                  </div>
                </form>
              )}
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
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
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
                id: "orders",
                label: "Orders",
                icon: Package,
                path:
                  user?.active_mode === "farmer"
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
