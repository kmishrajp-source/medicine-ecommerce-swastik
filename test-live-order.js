async function testOrder() {
  console.log("🛒 Simulating a checkout on the live website...");
  
  const payload = {
    amount: 150,
    items: [
       { id: "fallback-id-test", quantity: 1, price: 150, isLab: false }
    ],
    guestName: "System Auto Test",
    guestPhone: "919999999999",
    address: "System Verification Test Address",
    paymentMethod: "COD",
    deliveryCharge: 0
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
      console.log("\n✅ SUCCESS: Order placed successfully!");
      console.log(`🧾 Invoice Link: https://www.swastikmed.online/en/order/${data.orderId}/invoice`);
    } else {
      console.error("\n❌ FAILED: The checkout API returned an error.");
    }
  } catch(e) {
    console.error("\n❌ NETWORK ERROR:", e.message);
  }
}
testOrder();
