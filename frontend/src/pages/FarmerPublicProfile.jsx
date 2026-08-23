import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllProducts } from "../services/api";
import { ArrowLeft, MapPin, Star, Package } from "lucide-react";

export default function FarmerPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmerData();
  }, [id]);

  const fetchFarmerData = async () => {
    setLoading(true);
    try {
      const productsRes = await getAllProducts();
      const farmerProducts = productsRes.data.filter(
        (p) => String(p.farmer_id) === String(id),
      );
      if (farmerProducts.length > 0) {
        setFarmer({
          name: farmerProducts[0].farmer_name,
          id: id,
        });
        setProducts(farmerProducts);
      }
    } catch (err) {
      console.error("Failed to fetch farmer data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center bg-stone-200"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <p style={{ color: "#1B4332", fontWeight: 500 }}>
          Loading farmer profile...
        </p>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center bg-stone-200"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="text-center">
          <p style={{ color: "#1B4332", fontWeight: 500 }}>Farmer not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#1B4332" }}
          >
            Go back
          </button>
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
        {/* Cover Banner */}
        <div
          className="flex-none h-[140px] relative"
          style={{
            background: "linear-gradient(135deg, #1B4332 0%, #40916C 100%)",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            className="absolute top-12 left-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white" />
            <div className="absolute bottom-2 right-24 w-12 h-12 rounded-full bg-white" />
          </div>
        </div>

        {/* Identity */}
        <div className="flex-none px-6 pb-4" style={{ background: "#F7F5F0" }}>
          <div className="flex items-end justify-between -mt-8 mb-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center ring-4 ring-[#F7F5F0]"
              style={{ background: "#1B4332" }}
            >
              <span className="text-white font-bold text-2xl">
                {farmer.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <span
              className="text-[10px] font-bold px-3 py-1 rounded-full"
              style={{ background: "#D8F3DC", color: "#1B4332" }}
            >
              🌱 Verified Farmer
            </span>
          </div>

          <h1 className="text-[20px] font-bold text-[#1C2B1A]">
            {farmer.name}
          </h1>
          <p className="text-[12px] text-[#7A7A6E] mt-0.5">@{farmer.name}</p>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <MapPin size={10} className="text-[#A67C52]" />
              <span className="text-[10px] text-[#7A7A6E]">
                {products[0]?.province || "Zambia"}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div
              className="rounded-2xl p-3 text-center"
              style={{ background: "#fff", border: "1px solid #D8F3DC" }}
            >
              <Package
                size={14}
                className="mx-auto mb-1"
                style={{ color: "#40916C" }}
              />
              <p className="text-[15px] font-bold text-[#1C2B1A]">
                {products.length}
              </p>
              <p className="text-[9px] text-[#7A7A6E]">Active Listings</p>
            </div>
            <div
              className="rounded-2xl p-3 text-center"
              style={{ background: "#fff", border: "1px solid #D8F3DC" }}
            >
              <Star
                size={14}
                className="mx-auto mb-1"
                style={{ color: "#A67C52" }}
              />
              <p className="text-[15px] font-bold text-[#1C2B1A]">New</p>
              <p className="text-[9px] text-[#7A7A6E]">Seller Rating</p>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div
          className="flex-1 overflow-y-auto px-6"
          style={{ scrollbarWidth: "none" }}
        >
          <h2 className="text-[15px] font-bold text-[#1C2B1A] mb-3">
            Active Listings
          </h2>

          {products.length === 0 ? (
            <div
              className="bg-white rounded-2xl p-6 text-center"
              style={{ border: "1px solid #D8F3DC" }}
            >
              <p className="text-sm text-[#7A7A6E]">No listings yet.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm"
                  style={{ border: "1px solid #D8F3DC" }}
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[13px] font-bold text-[#1C2B1A]">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-[11px] text-[#7A7A6E] mt-0.5">
                            {product.description}
                          </p>
                        )}
                        <p className="text-[10px] text-[#7A7A6E] mt-1">
                          {product.quantity} kg available
                        </p>
                        {product.province && (
                          <p
                            className="text-[10px] mt-0.5 font-medium"
                            style={{ color: "#A67C52" }}
                          >
                            📍 {product.province}
                            {product.district ? `, ${product.district}` : ""}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p
                          className="text-[16px] font-extrabold"
                          style={{ color: "#2D6A4F" }}
                        >
                          ZMW {product.price}
                        </p>
                        <p className="text-[10px] text-[#7A7A6E]">per kg</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/dashboard/buyer")}
                      className="mt-3 w-full py-2 rounded-xl text-[12px] font-bold text-white"
                      style={{ background: "#2D6A4F" }}
                    >
                      Order from marketplace →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
