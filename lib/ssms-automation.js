import { WhatsAppTriggers, WhatsAppMessageSender } from "./whatsapp";
import prisma from "./prisma";

/**
 * Swastik Service Management System (SSMS) Automation Engine
 * Handles all state-based triggers for leads.
 */
export const SSMSAutomation = {
    /**
     * Triggered when a lead status changes
     */
    async onStatusChange(leadId, newStatus) {
        console.log(`[SSMS AUTOMATION] Status Change for Lead ${leadId}: New Status = ${newStatus}`);
        
        const lead = await prisma.lead.findUnique({
            where: { id: leadId }
        });

        if (!lead) return;

        switch (newStatus) {
            case 'new':
                // Send WhatsApp Intro
                await WhatsAppMessageSender.sendBulkTemplate(
                    lead.guestPhone, 
                    "ssms_intro_v1", 
                    { name: lead.guestName, service: lead.serviceType }
                );
                break;

            case 'interested':
                // Generate and Send Payment Link (Simulated logic)
                const paymentLink = `https://swastikmedicare.in/pay/lead/${lead.id}`;
                await WhatsAppMessageSender.sendBulkTemplate(
                    lead.guestPhone, 
                    "ssms_payment_v1", 
                    { name: lead.guestName, amount: lead.amount || 2999, link: paymentLink }
                );
                break;

            case 'follow_up':
                // Logic for follow-up reminders could be added here or in a cron job
                console.log(`[SSMS AUTOMATION] Follow-up scheduled for ${lead.id}`);
                break;

            case 'converted':
                // Notify Agent of Conversion Success
                if (lead.assignedAgentId) {
                    // Internal notification logic
                }
                break;
        }
    },

    /**
     * Logic for Auto-Conversion after Payment
     */
    async handlePaymentSuccess(leadId, paymentId) {
        const lead = await prisma.lead.update({
            where: { id: leadId },
            data: {
                status: 'converted',
                paymentStatus: 'paid',
                lastAction: `Payment Verified: ${paymentId}`
            }
        });

        // Trigger Profile Activation
        await this.activatePartnerProfile(lead);
        
        return lead;
    },

    async activatePartnerProfile(lead) {
        console.log(`[SSMS AUTOMATION] Activating Partner Profile for ${lead.guestName}`);
        
        // Modular logic to create/update Doctor or Retailer profile
        if (lead.serviceType === 'doctor') {
            await prisma.doctor.upsert({
                where: { phone: lead.guestPhone }, // Simple unique check
                update: { verified: true, status: 'verified', name: lead.guestName },
                create: {
                    name: lead.guestName,
                    phone: lead.guestPhone,
                    specialization: "General Physician", // Placeholder
                    city: lead.area || "Gorakhpur",
                    verified: true,
                    status: 'verified',
                    source: 'converted_lead'
                }
            });
        } else if (lead.serviceType === 'retailer') {
            await prisma.retailer.upsert({
                where: { phone: lead.guestPhone },
                update: { verified: true, status: 'verified', shopName: lead.guestName },
                create: {
                    shopName: lead.guestName,
                    phone: lead.guestPhone,
                    address: lead.area || "Gorakhpur",
                    verified: true,
                    status: 'verified',
                    licenseNumber: "PENDING",
                    source: 'converted_lead'
                }
            });
        }
    }
};
