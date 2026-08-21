import OpenAI from 'openai';
import { DoctorBookingEngine } from './booking/DoctorBookingEngine.js';
import { LabBookingEngine } from './booking/LabBookingEngine.js';
import { AmbulanceBookingEngine } from './booking/AmbulanceBookingEngine.js';

export class HealthcareBookingOrchestrator {
  static async _detectServiceType(query) {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback simple detection
      const q = query.toLowerCase();
      if (q.includes('ambulance')) return 'AMBULANCE';
      if (q.includes('lab') || q.includes('test') || q.includes('blood')) return 'LAB_TEST';
      if (q.includes('hospital')) return 'HOSPITAL';
      return 'DOCTOR_APPOINTMENT';
    }

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a healthcare orchestration engine. Extract the service type from the user's booking request.
Return exactly one of these strings: DOCTOR_APPOINTMENT, LAB_TEST, AMBULANCE, HOSPITAL, ONLINE_DOCTOR, HOME_HEALTHCARE, UNKNOWN.
Do not return any other text or JSON.`
          },
          { role: "user", content: query }
        ],
        temperature: 0
      });
      return completion.choices[0].message.content.trim().toUpperCase();
    } catch (err) {
      console.error("Booking Intent Extraction Error:", err);
      return 'DOCTOR_APPOINTMENT';
    }
  }

  static _checkUrgency(query) {
    const emergencyWords = ['severe', 'bleeding', 'chest pain', 'heart attack', 'unconscious', 'breathing problem', 'emergency', 'accident', 'dying'];
    return emergencyWords.some(w => query.toLowerCase().includes(w));
  }

  static async processBookingIntent(rawTranscript, userId, normalizedQuery) {
    if (!userId) {
      return {
        intent: "AUTH_REQUIRED",
        message: "I can help with your booking. Please sign in to your Swastik account first.",
        data: { message: "Please sign in to place a booking." }
      };
    }

    const queryForExtraction = rawTranscript || normalizedQuery;
    const isEmergency = this._checkUrgency(queryForExtraction);

    if (isEmergency && !queryForExtraction.toLowerCase().includes("ambulance")) {
      return {
        intent: "EMERGENCY_ESCALATION",
        isEmergency: true,
        message: "This sounds like a medical emergency. Do not wait for a regular appointment. Should I book an emergency ambulance for you immediately?",
        data: { showEmergencyUI: true }
      };
    }

    // Determine specific service
    const serviceType = await this._detectServiceType(queryForExtraction);

    let engineResponse;
    switch (serviceType) {
      case 'DOCTOR_APPOINTMENT':
      case 'ONLINE_DOCTOR':
        engineResponse = await DoctorBookingEngine.process(queryForExtraction, userId, serviceType);
        break;
      case 'LAB_TEST':
        engineResponse = await LabBookingEngine.process(queryForExtraction, userId);
        break;
      case 'AMBULANCE':
        engineResponse = await AmbulanceBookingEngine.process(queryForExtraction, userId);
        break;
      case 'HOSPITAL':
      case 'HOME_HEALTHCARE':
        return {
          intent: "UNSUPPORTED_SERVICE",
          message: "Booking for this service via voice is currently in development. Please use the app menu.",
          data: { showServiceMenu: true }
        };
      default:
        engineResponse = await DoctorBookingEngine.process(queryForExtraction, userId, 'DOCTOR_APPOINTMENT');
    }

    return engineResponse;
  }
}
