import { useNavigate } from "react-router-dom";
import {
  getFarmerOrders,
  getAllProducts,
  addProduct,
  deleteProduct,
  uploadProductImage,
} from "../services/api";
import { useState, useEffect } from "react";
import {
  Home,
  ShoppingBag,
  MessageCircle,
  User,
  Bell,
  ChevronRight,
  TrendingUp,
  Package,
  CheckCircle,
  Truck,
  Star,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ORDER_STAGES = [
  { label: "Confirmed", icon: CheckCircle },
  { label: "In Transit", icon: Truck },
  { label: "Delivered", icon: Package },
];

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "market", label: "Marketplace", icon: ShoppingBag },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "orders", label: "Orders", icon: Package },
  { id: "me", label: "Me", icon: User },
];

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    province: "",
    district: "",
    image_url: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        getFarmerOrders(),
        getAllProducts(),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data.filter((p) => p.farmer_name === user?.name));
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseFloat(order.total_price || 0),
    0,
  );

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      let image_url = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadRes = await uploadProductImage(formData);
        image_url = uploadRes.data.image_url;
      }

      await addProduct({
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity),
        province: newProduct.province,
        district: newProduct.district,
        image_url,
      });

      setSuccess("Product listed successfully!");
      setNewProduct({
        name: "",
        description: "",
        price: "",
        quantity: "",
        province: "",
        district: "",
        image_url: "",
      });
      setImageFile(null);
      setImagePreview("");
      setShowAddProduct(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Remove this listing?")) return;
    try {
      await deleteProduct(id);
      fetchData();
    } catch (err) {
      setError("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center bg-stone-200"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="text-center">
          <p style={{ color: "#1B4332", fontWeight: 500 }}>
            Loading your dashboard...
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
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#A67C52] border border-white" />
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
                label: "Total Revenue",
                value: `ZMW ${totalRevenue.toLocaleString()}`,
                icon: TrendingUp,
                color: "text-[#2D6A4F]",
                bg: "bg-[#D8F3DC]",
              },
              {
                label: "Active Orders",
                value: `${orders.length} ${orders.length === 1 ? "Order" : "Orders"}`,
                icon: Package,
                color: "text-[#A67C52]",
                bg: "bg-[#D8F3DC]",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 bg-[#D8F3DC] rounded-2xl px-4 py-3 shadow-sm border border-emerald-100 flex items-center gap-3"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}
                >
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

          {/* Active Listings */}
          <div className="pt-2 pb-1">
            <div className="flex items-center justify-between px-6 mb-3">
              <h2 className="text-[15px] font-bold text-[#1C2B1A]">
                Active Listings
              </h2>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="flex items-center gap-0.5 text-[12px] font-semibold text-[#2D6A4F]"
              >
                <Plus size={13} /> Add listing
              </button>
            </div>

            {/* Add product form */}
            {showAddProduct && (
              <form
                onSubmit={handleAddProduct}
                className="mx-6 mb-4 rounded-2xl p-4 bg-white shadow-sm border border-black/5"
              >
                <p className="font-bold text-sm text-[#1C2B1A] mb-3">
                  New Listing
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Product name (e.g. Tomatoes)"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-black/10 bg-[#F7F5F0]"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-black/10 bg-[#F7F5F0]"
                  />
                  {/* Image Upload */}
                  <div
                    className="w-full rounded-xl border border-black/10 bg-[#F7F5F0] overflow-hidden cursor-pointer"
                    onClick={() =>
                      document.getElementById("productImage").click()
                    }
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="h-32 flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">📷</span>
                        <p className="text-[11px] text-[#7A7A6E]">
                          Tap to add product photo
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    id="productImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <select
                    value={newProduct.province}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        province: e.target.value,
                        district: "",
                      })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-black/10 bg-[#F7F5F0]"
                    style={{
                      color: newProduct.province ? "#1C2B1A" : "#7A7A6E",
                    }}
                  >
                    <option value="">Select Province</option>
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
                    placeholder="District (e.g. Lusaka, Ndola, Chipata)"
                    value={newProduct.district}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, district: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-black/10 bg-[#F7F5F0]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Price (ZMW)"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-black/10 bg-[#F7F5F0]"
                    />
                    <input
                      type="number"
                      placeholder="Quantity (kg)"
                      value={newProduct.quantity}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          quantity: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-black/10 bg-[#F7F5F0]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold border border-black/10"
                      style={{ color: "#7A7A6E" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{
                        background: uploading ? "#40916C" : "#2D6A4F",
                        opacity: uploading ? 0.8 : 1,
                      }}
                    >
                      {uploading ? "Uploading..." : "List Product"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Product cards — horizontal scroll like Figma */}
            {products.length === 0 ? (
              <div className="mx-6 bg-white rounded-2xl p-6 text-center shadow-sm border border-black/5">
                <p className="text-sm text-[#7A7A6E]">
                  No listings yet. Add your first product above.
                </p>
              </div>
            ) : (
              <div
                className="flex gap-4 overflow-x-auto px-6 pb-3"
                style={{ scrollbarWidth: "none" }}
              >
                {products.map((product) => (
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
                        ACTIVE
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
                          New
                        </span>
                      </div>
                      <div className="mt-2 flex items-end justify-between">
                        <div>
                          <p className="text-[11px] text-[#7A7A6E]">
                            Price / kg
                          </p>
                          <p className="text-[14px] font-extrabold text-[#2D6A4F]">
                            ZMW {product.price}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#7A7A6E] mt-1 font-medium">
                        {product.quantity} kg available
                      </p>
                      {product.province && (
                        <p
                          className="text-[10px] mt-0.5 font-medium"
                          style={{ color: "#A67C52" }}
                        >
                          📍 {product.province}
                        </p>
                      )}
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="mt-2 w-full text-[10px] py-1 rounded-lg font-semibold"
                        style={{ background: "#FEE2E2", color: "#991B1B" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Tracker */}
          <div className="px-6 mt-2 mb-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-[#1C2B1A]">
                Order Tracker
              </h2>
              <span className="bg-[#A67C52] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                {orders.length} Orders
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
              {/* Stage Legend */}
              <div className="px-4 pt-4 pb-3 flex items-center">
                {ORDER_STAGES.map((stage, i) => (
                  <div
                    key={stage.label}
                    className="flex-1 flex flex-col items-center relative"
                  >
                    {i < ORDER_STAGES.length - 1 && (
                      <div className="absolute top-[14px] left-1/2 w-full h-[2px] bg-[#EAF3EE]" />
                    )}
                    <div
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center ${i === 0 ? "bg-[#2D6A4F]" : i === 1 ? "bg-[#A67C52]" : "bg-[#EDE9E1]"}`}
                    >
                      <stage.icon
                        size={13}
                        className={i < 2 ? "text-white" : "text-[#7A7A6E]"}
                      />
                    </div>
                    <p
                      className={`text-[9px] font-semibold mt-1.5 ${i < 2 ? "text-[#1C2B1A]" : "text-[#7A7A6E]"}`}
                    >
                      {stage.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Orders from database */}
              {orders.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[12px] text-[#7A7A6E]">
                    No orders yet. They'll appear here when buyers purchase your
                    products.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
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
                          {order.quantity} kg · {order.buyer_name} ·{" "}
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

          {/* CTA Banner */}
          <div className="px-6 mt-4 mb-8">
            <div className="bg-[#2D6A4F] rounded-2xl px-5 py-4 flex items-center justify-between overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute -right-2 -bottom-6 w-32 h-32 rounded-full bg-white/5" />
              <div className="relative z-10">
                <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                  FarmConnect
                </p>
                <p className="text-[15px] font-extrabold text-white mt-0.5 leading-snug">
                  Reach more buyers
                  <br />
                  across Zambia
                </p>
              </div>
              <button className="relative z-10 bg-[#A67C52] text-white text-[12px] font-bold px-4 py-2.5 rounded-xl shadow-lg flex-none">
                Share
              </button>
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
                  onClick={() => {
                    setActiveNav(item.id);
                    if (item.id === "me") navigate("/profile");
                    else if (item.id === "messages") navigate("/messages");
                    else if (item.id === "market") navigate("/dashboard/buyer");
                  }}
                  className="flex-1 flex flex-col items-center gap-1 py-1 relative"
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${active ? "bg-[#EAF3EE]" : ""}`}
                  >
                    <span className="text-lg leading-none">{item.emoji}</span>
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
