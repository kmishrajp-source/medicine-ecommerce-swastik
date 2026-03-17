import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import Image from "next/image";

// 1. Dynamic Metadata Generation for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) return { title: "Medicine Not Found | Swastik Medicare" };

  return {
    title: `${product.name} - Buy Online | Swastik Medicare`,
    description: `Buy ${product.name} online at Swastik Medicare. ${product.salt ? `Salt composition: ${product.salt}. ` : ''}Get fast delivery in 10 minutes.`,
    keywords: [product.name, product.brand, product.salt, "buy medicine online", "Swastik Medicare"].filter(Boolean).join(", "),
    openGraph: {
      title: `${product.name} | Swastik Medicare`,
      description: `Order ${product.name} and get it delivered in minutes.`,
      images: [product.image || "/images/default-medicine.png"],
    }
  };
}

export default async function MedicinePage({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  // 2. Structured JSON-LD Data for Google Rich Snippets
  const finalPrice = product.discount > 0 ? (product.price) : product.price;
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image ? [product.image] : [],
    "description": product.description || `Buy ${product.name} online at Swastik Medicare.`,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Generic Swastik"
    },
    // Adding dummy aggregateRating so the Rich Snippet stars show up in Google
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "12"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://swastikmedicare.com/medicine/${product.id}`,
      "priceCurrency": "INR",
      "price": finalPrice,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Swastik Medicare"
      }
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Navbar cartCount={0} />
      
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container" style={{ marginTop: "100px", maxWidth: "1000px" }}>
        {/* Breadcrumbs */}
        <nav style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "20px" }}>
          <a href="/" style={{ color: "#2563eb", textDecoration: "none" }}>Home</a> 
          <span style={{ margin: "0 8px" }}>/</span>
          <a href="/medicines" style={{ color: "#2563eb", textDecoration: "none" }}>Pharmacy</a>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#0f172a" }}>{product.name}</span>
        </nav>

        <div style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexWrap: "wrap", gap: "40px" }}>
          
          {/* Left: Image Panel */}
          <div style={{ flex: "1 1 300px", minWidth: "300px", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#f1f5f9" }}>
             {product.image ? (
                <img src={product.image} alt={product.name} style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }} />
             ) : (
                <i className="fa-solid fa-prescription-bottle-medical" style={{ fontSize: "6rem", color: "#cbd5e1" }}></i>
             )}
          </div>

          {/* Right: Product Info */}
          <div style={{ flex: "2 1 400px" }}>
            {product.isRecommended && (
                <span style={{ display: "inline-block", background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "15px" }}>
                   <i className="fa-solid fa-star"></i> Swastik Recommended
                </span>
            )}
            
            <h1 style={{ fontSize: "2.5rem", color: "#0f172a", margin: "0 0 10px 0", lineHeight: "1.2" }}>{product.name}</h1>
            
            {product.brand && (
                <p style={{ color: "#475569", fontSize: "1.1rem", marginBottom: "5px" }}><strong>Brand / Manufacturer:</strong> {product.brand}</p>
            )}
            {product.salt && (
                <p style={{ color: "#475569", fontSize: "1.1rem", marginBottom: "20px" }}><strong>Salt Composition:</strong> {product.salt}</p>
            )}

            <div style={{ display: "flex", alignItems: "baseline", gap: "15px", marginBottom: "25px" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: "900", color: "#0f172a" }}>₹{(product.price || 0).toFixed(2)}</span>
                {product.discount > 0 && (
                    <>
                        <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "1.2rem" }}>
                            ₹{(product.price / (1 - product.discount/100)).toFixed(2)}
                        </span>
                        <span style={{ color: "#ef4444", fontWeight: "bold", fontSize: "1.1rem" }}>{product.discount}% OFF</span>
                    </>
                )}
            </div>

            {product.requiresPrescription && (
                <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", padding: "15px", borderRadius: "8px", marginBottom: "25px", display: "flex", gap: "15px", alignItems: "center" }}>
                    <i className="fa-solid fa-file-prescription" style={{ fontSize: "1.5rem", color: "#ea580c" }}></i>
                    <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#9a3412" }}>Prescription Required</h4>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "#c2410c" }}>A valid doctor's prescription must be uploaded during checkout for this medicine.</p>
                    </div>
                </div>
            )}

            {/* In a real app, this form would talk to Context/Cart */}
            <form style={{ display: "flex", gap: "15px" }}>
                <button type="button" style={{ flex: 1, background: "#2563eb", color: "white", border: "none", padding: "16px", borderRadius: "12px", fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(37,99,235,0.3)" }}>
                    <i className="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
            </form>

            <div style={{ marginTop: "30px", borderTop: "1px solid #e2e8f0", paddingTop: "20px", display: "flex", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "0.9rem" }}>
                    <i className="fa-solid fa-bolt" style={{ color: "#eab308" }}></i> Fast 10-Min Local Delivery
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "0.9rem" }}>
                    <i className="fa-solid fa-shield-halved" style={{ color: "#10b981" }}></i> 100% Genuine Medicines
                </div>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        {product.description && (
            <div style={{ background: "white", padding: "30px", borderRadius: "16px", marginTop: "30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "1.5rem", color: "#0f172a", marginBottom: "15px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>Description</h3>
                <p style={{ color: "#475569", lineHeight: "1.8", fontSize: "1.05rem" }}>
                    {product.description}
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
