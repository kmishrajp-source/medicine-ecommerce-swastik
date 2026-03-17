import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const lowerMessage = message.toLowerCase();
        
        // 1. Identify if the user is asking about a specific medicine
        // We'll use a simple regex or keyword match for common medicines if needed, 
        // but let's try to extract potential drug names.
        const drugMatch = lowerMessage.match(/\b(paracetamol|ibuprofen|aspirin|crocin|metformin|amlodipine|atorvastatin)\b/);
        const drugName = drugMatch ? drugMatch[0] : null;

        let responseText = "";
        let sources = [];

        if (drugName) {
            // 2. Fetch data from OpenFDA
            try {
                const fdaRes = await fetch(`https://api.fda.gov/drug/label.json?search=active_ingredient:"${drugName}"&limit=1`);
                const fdaData = await fdaRes.json();

                if (fdaData.results && fdaData.results.length > 0) {
                    const info = fdaData.results[0];
                    const dosage = info.dosage_and_administration ? info.dosage_and_administration[0].substring(0, 300) + "..." : "Consult label for dosage.";
                    const indications = info.indications_and_usage ? info.indications_and_usage[0].substring(0, 200) + "..." : "Commonly used for pain/fever.";
                    
                    responseText = `**${drugName.charAt(0).toUpperCase() + drugName.slice(1)} Information:**\n\n`;
                    responseText += `*   **Common Use:** ${indications}\n`;
                    responseText += `*   **Typical Guidance:** ${dosage}\n\n`;
                    responseText += `**Important Safety Note:** Typical adult dose for fever/pain is often 500-650mg every 6 hours, not exceeding 3000-4000mg in 24 hours. Always check the specific packaging and consult a doctor if symptoms persist beyond 48 hours.`;
                    
                    sources.push("OpenFDA");
                } else {
                    responseText = `I found some information about ${drugName}, but detailed FDA labels aren't immediately available. Generally, ${drugName} is used for symptom relief. Please consult a doctor for specific dosage.`;
                }
            } catch (err) {
                console.error("OpenFDA fetch failed", err);
                responseText = `I recognize ${drugName}, but I'm having trouble fetching official data right now. Please seek professional medical advice for accurate dosage.`;
            }
        } else {
            // 3. General Symptom/Health Guidance (Simulation)
            responseText = "I'm here to help with medicine and health queries. Please specify a medicine name or describe your symptoms for general guidance. \n\nRemember: I provide informational guidance, not a medical diagnosis.";
        }

        return NextResponse.json({ 
            success: true, 
            response: responseText,
            disclaimer: "Informational guidance only. Not a medical diagnosis. Consult a doctor before taking any medication.",
            sources: sources
        });

    } catch (error) {
        console.error("AI Assistant Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
