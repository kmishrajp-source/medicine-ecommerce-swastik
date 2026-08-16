import axios from 'axios';

/**
 * ONDC (Open Network for Digital Commerce) Beckn Protocol Architecture
 * Domain: Health & Wellness (ONDC:RET11) / Pharmacy
 * 
 * Status: Integration-ready
 * Awaiting ONDC Network Onboarding and BPP (Buyer/Provider Platform) credentials.
 */

const ONDC_LIVE_MODE = process.env.ONDC_LIVE_MODE === 'true';
const ONDC_GATEWAY_URL = process.env.ONDC_GATEWAY_URL || 'https://staging.gateway.ondc.org';
const SUBSCRIBER_ID = process.env.ONDC_SUBSCRIBER_ID || 'swastikmed.online';
const UNIQUE_KEY_ID = process.env.ONDC_UNIQUE_KEY_ID || '123';

export class OndcProtocolService {
  /**
   * Receives a search query from the ONDC gateway and responds with the Swastik catalog
   * Implements the `on_search` Beckn callback.
   */
  static async handleSearch(searchContext, intent) {
    console.log(`[ONDC BPP] Received search query for:`, intent?.item?.descriptor?.name);
    
    // In live mode, we would query the Prisma database for matching medicines
    // and broadcast the `on_search` callback to the specific Buyer App (BAP)
    const onSearchPayload = {
      context: {
        ...searchContext,
        action: 'on_search',
        bpp_id: SUBSCRIBER_ID,
        bpp_uri: `https://${SUBSCRIBER_ID}/api/ondc`
      },
      message: {
        catalog: {
          "bpp/descriptor": { name: "Swastik Medicare Pharmacy" },
          "bpp/providers": [
            {
              id: "provider-swastik-01",
              descriptor: { name: "Swastik Medicare Core Fulfillment" },
              items: [
                {
                  id: "med-1234",
                  descriptor: { name: "Paracetamol 500mg" },
                  price: { currency: "INR", value: "30.00" }
                }
              ]
            }
          ]
        }
      }
    };

    if (ONDC_LIVE_MODE) {
      try {
        await axios.post(`${searchContext.bap_uri}/on_search`, onSearchPayload, {
          headers: { 'Authorization': await this._generateAuthHeader(onSearchPayload) }
        });
        return { success: true, broadcasted: true };
      } catch (error) {
        console.error("ONDC on_search Error:", error.message);
        return { success: false, error: "Failed to broadcast on_search to BAP" };
      }
    }
    
    // Return payload for local logging/testing
    return { success: true, payload: onSearchPayload, broadcasted: false };
  }

  /**
   * Dummy signing payload function. In live mode, this must sign the request
   * using ED25519 cryptography as required by the ONDC Network.
   */
  static async _generateAuthHeader(payload) {
    // Requires crypto implementation with ONDC provided private keys
    return `Signature keyId="${SUBSCRIBER_ID}|${UNIQUE_KEY_ID}|ed25519",algorithm="ed25519",signature="dummy_signature"`;
  }
}
