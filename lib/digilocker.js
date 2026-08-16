import axios from 'axios';

/**
 * DigiLocker Integration Architecture
 * 
 * Status: Integration-ready
 * Awaiting official API credentials from National e-Governance Division (NeGD).
 */

const DIGILOCKER_LIVE_MODE = process.env.DIGILOCKER_LIVE_MODE === 'true';
const DIGILOCKER_BASE_URL = process.env.DIGILOCKER_BASE_URL || 'https://api.digitallocker.gov.in/public/oauth2/1/authorize';
const DIGILOCKER_CLIENT_ID = process.env.DIGILOCKER_CLIENT_ID;
const DIGILOCKER_CLIENT_SECRET = process.env.DIGILOCKER_CLIENT_SECRET;
const DIGILOCKER_REDIRECT_URI = process.env.DIGILOCKER_REDIRECT_URI || 'https://www.swastikmed.online/api/digilocker/callback';

export class DigiLockerService {
  /**
   * Returns the OAuth2 authorization URL to redirect the user to DigiLocker
   */
  static getAuthUrl(state = '') {
    if (!DIGILOCKER_CLIENT_ID) {
      console.warn("DigiLocker credentials missing. Returning stub URL.");
      return `/en/my-health-records/digilocker?status=pending_credentials&state=${state}`;
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: DIGILOCKER_CLIENT_ID,
      redirect_uri: DIGILOCKER_REDIRECT_URI,
      state: state
    });

    return `${DIGILOCKER_BASE_URL}?${params.toString()}`;
  }

  /**
   * Exchanges the OAuth authorization code for an access token
   */
  static async getAccessToken(code) {
    if (!DIGILOCKER_LIVE_MODE) {
      return { success: false, error: "DigiLocker Integration is currently in Sandbox/Pending Mode." };
    }

    try {
      const response = await axios.post('https://api.digitallocker.gov.in/public/oauth2/1/token', {
        code,
        grant_type: 'authorization_code',
        client_id: DIGILOCKER_CLIENT_ID,
        client_secret: DIGILOCKER_CLIENT_SECRET,
        redirect_uri: DIGILOCKER_REDIRECT_URI
      });
      return { success: true, token: response.data.access_token };
    } catch (error) {
      console.error("DigiLocker Token Error:", error.response?.data || error.message);
      return { success: false, error: "Failed to get access token from DigiLocker" };
    }
  }

  /**
   * Fetches the user's issued documents from DigiLocker
   * E.g., Health IDs, Vaccination Certificates
   */
  static async getIssuedDocuments(accessToken) {
    if (!DIGILOCKER_LIVE_MODE) return { success: false, error: "Sandbox Mode" };

    try {
      const response = await axios.get('https://api.digitallocker.gov.in/public/oauth2/1/files/issued', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return { success: true, documents: response.data.items };
    } catch (error) {
      console.error("DigiLocker Fetch Error:", error.response?.data || error.message);
      return { success: false, error: "Failed to fetch documents" };
    }
  }

  /**
   * Downloads a specific document from DigiLocker
   */
  static async getDocumentFile(accessToken, uri) {
    if (!DIGILOCKER_LIVE_MODE) return { success: false, error: "Sandbox Mode" };

    try {
      const response = await axios.get(`https://api.digitallocker.gov.in/public/oauth2/1/file/${uri}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        responseType: 'arraybuffer'
      });
      return { success: true, fileData: response.data };
    } catch (error) {
      console.error("DigiLocker Download Error:", error.response?.data || error.message);
      return { success: false, error: "Failed to download document" };
    }
  }
}
