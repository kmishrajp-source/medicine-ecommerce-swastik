const fs = require('fs');

let code = fs.readFileSync('lib/healthmart/store.js', 'utf8');

// Replace createHealthMartOrder
const oldCreateOrder = `async function createHealthMartOrder(quotation) {
  const orderNumber = \`HM-ORD-\${new Date().getFullYear()}\${String(new Date().getMonth() + 1).padStart(2, "0")}-\${Math.floor(1000 + Math.random() * 9000)}\`;

  // Use MarketplaceLeadAccess as the "order" record (repurposed to track confirmed orders)
  // This avoids needing a new table while still persisting the order state
  const record = await prisma.marketplaceLeadAccess.create({
    data: {
      enquiryId: quotation.enquiryId,
      providerId: quotation.providerId,
      accessType: "CONFIRMED_ORDER",
      pricePaid: quotation.totalAmount,
      metadata: {
        orderNumber,
        quoteId: quotation.id,
        quoteNumber: quotation.quoteNumber,
        providerBusinessName: quotation.providerBusinessName,
        totalAmount: Number(quotation.totalAmount),
        currency: "INR",
        timelineDelivery: quotation.timelineDelivery,
        paymentTerms: quotation.paymentTerms,
        warrantyTerms: quotation.warrantyTerms,
        status: "ORDER_CONFIRMED",
        deliveryStatus: "PENDING_DISPATCH",
        confirmedAt: new Date().toISOString(),
      },
    },
  });

  return {
    id: record.id,
    orderNumber,
    status: "ORDER_CONFIRMED",
    deliveryStatus: "PENDING_DISPATCH",
    confirmedAt: record.createdAt,
    totalAmount: Number(quotation.totalAmount),
    providerBusinessName: quotation.providerBusinessName,
    timelineDelivery: quotation.timelineDelivery,
  };
}`;

const newCreateOrder = `async function createHealthMartOrder(quotation) {
  const orderNumber = \`HM-ORD-\${new Date().getFullYear()}\${String(new Date().getMonth() + 1).padStart(2, "0")}-\${Math.floor(1000 + Math.random() * 9000)}\`;

  const record = await prisma.marketplaceOrder.create({
    data: {
      orderNumber,
      enquiryId: quotation.enquiryId,
      quotationId: quotation.id,
      providerId: quotation.providerId,
      providerBusinessName: quotation.providerBusinessName,
      totalAmount: Number(quotation.totalAmount),
      currency: "INR",
      timelineDelivery: quotation.timelineDelivery,
      paymentTerms: quotation.paymentTerms,
      warrantyTerms: quotation.warrantyTerms,
      status: "ORDER_CONFIRMED",
      deliveryStatus: "PENDING_DISPATCH",
    },
  });

  return {
    id: record.id,
    orderNumber: record.orderNumber,
    enquiryId: record.enquiryId,
    quotationId: record.quotationId,
    status: record.status,
    deliveryStatus: record.deliveryStatus,
    confirmedAt: record.createdAt,
    totalAmount: record.totalAmount,
    providerBusinessName: record.providerBusinessName,
    timelineDelivery: record.timelineDelivery,
  };
}`;

code = code.replace(oldCreateOrder, newCreateOrder);

// Replace getHealthMartOrders
const oldGetOrders = `export async function getHealthMartOrders({ buyerId, enquiryId } = {}) {
  try {
    const where = { accessType: "CONFIRMED_ORDER" };
    if (enquiryId) where.enquiryId = enquiryId;

    const records = await prisma.marketplaceLeadAccess.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return records.map((r) => ({
      id: r.id,
      enquiryId: r.enquiryId,
      providerId: r.providerId,
      confirmedAt: r.createdAt,
      ...((r.metadata) || {}),
    }));
  } catch {
    const store = loadLocalStore();
    return (store.orders || []).filter((o) => !enquiryId || o.enquiryId === enquiryId);
  }
}`;

const newGetOrders = `export async function getHealthMartOrders({ buyerId, enquiryId } = {}) {
  try {
    const where = {};
    if (enquiryId) where.enquiryId = enquiryId;
    if (buyerId) where.buyerUserId = buyerId;

    const records = await prisma.marketplaceOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (records.length > 0) {
      return records.map((r) => ({
        id: r.id,
        orderNumber: r.orderNumber,
        enquiryId: r.enquiryId,
        quotationId: r.quotationId,
        providerId: r.providerId,
        providerBusinessName: r.providerBusinessName,
        totalAmount: Number(r.totalAmount),
        currency: r.currency,
        status: r.status,
        deliveryStatus: r.deliveryStatus,
        deliveryNotes: r.deliveryNotes,
        timelineDelivery: r.timelineDelivery,
        paymentTerms: r.paymentTerms,
        warrantyTerms: r.warrantyTerms,
        dispatchedAt: r.dispatchedAt,
        deliveredAt: r.deliveredAt,
        confirmedAt: r.createdAt,
      }));
    }
  } catch (err) {
    console.warn("[HealthMart] getHealthMartOrders DB error:", err.message);
  }

  const store = loadLocalStore();
  return (store.orders || []).filter((o) => !enquiryId || o.enquiryId === enquiryId);
}`;

code = code.replace(oldGetOrders, newGetOrders);

// Replace updateDeliveryStatus
const oldUpdateDelivery = `export async function updateDeliveryStatus(orderId, deliveryStatus, notes = "") {
  const VALID_STATUSES = ["PENDING_DISPATCH", "DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
  if (!VALID_STATUSES.includes(deliveryStatus)) throw new Error(\`Invalid delivery status: \${deliveryStatus}\`);

  try {
    const record = await prisma.marketplaceLeadAccess.findUnique({ where: { id: orderId } });
    if (!record) throw new Error("Order not found");

    const updatedMeta = {
      ...(record.metadata || {}),
      deliveryStatus,
      deliveryNotes: notes,
      [\`\${deliveryStatus.toLowerCase()}At\`]: new Date().toISOString(),
      ...(deliveryStatus === "DELIVERED" ? { status: "ORDER_DELIVERED" } : {}),
    };

    const updated = await prisma.marketplaceLeadAccess.update({
      where: { id: orderId },
      data: { metadata: updatedMeta },
    });

    return { id: updated.id, deliveryStatus, ...(updated.metadata || {}) };
  } catch (dbErr) {
    console.warn("[HealthMart] delivery status update fallback:", dbErr.message);
    const store = loadLocalStore();
    const oIdx = (store.orders || []).findIndex((o) => o.id === orderId);
    if (oIdx < 0) throw new Error("Order not found");
    store.orders[oIdx].deliveryStatus = deliveryStatus;
    store.orders[oIdx].updatedAt = new Date().toISOString();
    if (deliveryStatus === "DELIVERED") store.orders[oIdx].status = "ORDER_DELIVERED";
    saveLocalStore(store);
    return store.orders[oIdx];
  }
}`;

const newUpdateDelivery = `export async function updateDeliveryStatus(orderId, deliveryStatus, notes = "") {
  const VALID_STATUSES = ["PENDING_DISPATCH", "DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
  if (!VALID_STATUSES.includes(deliveryStatus)) throw new Error(\`Invalid delivery status: \${deliveryStatus}\`);

  try {
    const data = {
      deliveryStatus,
      deliveryNotes: notes,
      ...(deliveryStatus === "DISPATCHED" ? { dispatchedAt: new Date() } : {}),
      ...(deliveryStatus === "DELIVERED" ? { deliveredAt: new Date(), status: "ORDER_DELIVERED" } : {}),
      ...(deliveryStatus === "CANCELLED" ? { cancelledAt: new Date(), status: "ORDER_CANCELLED" } : {}),
    };

    const updated = await prisma.marketplaceOrder.update({
      where: { id: orderId },
      data,
    });

    return {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      deliveryStatus: updated.deliveryStatus,
      deliveryNotes: updated.deliveryNotes,
      dispatchedAt: updated.dispatchedAt,
      deliveredAt: updated.deliveredAt,
    };
  } catch (dbErr) {
    console.warn("[HealthMart] delivery status update fallback:", dbErr.message);
    const store = loadLocalStore();
    const oIdx = (store.orders || []).findIndex((o) => o.id === orderId);
    if (oIdx < 0) throw new Error("Order not found");
    store.orders[oIdx].deliveryStatus = deliveryStatus;
    store.orders[oIdx].deliveryNotes = notes;
    store.orders[oIdx].updatedAt = new Date().toISOString();
    if (deliveryStatus === "DELIVERED") store.orders[oIdx].status = "ORDER_DELIVERED";
    saveLocalStore(store);
    return store.orders[oIdx];
  }
}`;

code = code.replace(oldUpdateDelivery, newUpdateDelivery);

fs.writeFileSync('lib/healthmart/store.js', code, 'utf8');
console.log('store.js updated to use MarketplaceOrder!');

