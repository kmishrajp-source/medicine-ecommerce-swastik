async function testOrder() {
  console.log("🛒 Simulating a checkout on the live website with GPS coordinates...");
  
  const payload = {
    amount: 250,
    items: [
       { id: "fallback-id-test", quantity: 1, price: 250, isLab: false, name: "Test Allopathy & Homeopathy Meds" }
    ],
    guestName: "GPS Routing Test User",
    guestPhone: "919999999999",
    address: "Gorakhpur Test Address",
    paymentMethod: "COD",
    deliveryCharge: 0,
    lat: 26.7606, // Same as retailer to guarantee matching
    lng: 83.3732  // Same as retailer
  };

  try {
    const res = await fetch("https://www.swastikmed.online/api/create-cod-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    console.log("\n📡 HTTP Status:", res.status);
    console.log("📦 Server Response:", JSON.stringify(data, null, 2));

    if (res.status === 200 && data.success) {
      console.log("\n✅ SUCCESS: Order placed with GPS coordinates!");
      console.log("The system should now trigger assignOrderToNearestRetailer and dispatch a WhatsApp to the nearest shop.");
    } else {
      console.error("\n❌ FAILED: The checkout API returned an error.");
    }
  } catch(e) {
    console.error("\n❌ NETWORK ERROR:", e.message);
  }
}
testOrder();
