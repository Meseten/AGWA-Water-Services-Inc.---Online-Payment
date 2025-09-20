const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const callGeminiAPI = async (promptText) => {
    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is missing. Please configure it in your .env file as VITE_GEMINI_API_KEY.");
    }

    const payload = {
        contents: [{ parts: [{ text: promptText }] }],
    };

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`Gemini API request failed: ${errorBody.error?.message || response.statusText}`);
        }

        const result = await response.json();

        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            const reason = result.candidates?.[0]?.finishReason;
            if (reason === 'SAFETY') {
                throw new Error("AI response blocked due to safety settings.");
            }
            throw new Error("Failed to extract text from Gemini API response.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
};

export const generateAnnouncement = async ({ reason, area, time }) => {
    const prompt = `
        You are a professional communications officer for AGWA Water Services.
        Generate a formal, clear, and customer-friendly public service announcement in HTML format based on the following details.

        **Announcement Details:**
        - **Primary Reason:** ${reason}
        - **Affected Area(s):** ${area || "All service areas"}
        - **Date and Time:** ${time || "Effective immediately until further notice"}

        **Instructions for HTML Output:**
        1.  Start with an <h2> tag for the headline, using the Primary Reason.
        2.  Write a main paragraph explaining the situation clearly in a <p> tag.
        3.  List the key details (Affected Areas, Date/Time) using a <ul> with <li> items. Use <strong> tags for the labels (e.g., "<strong>Affected Areas:</strong> ...").
        4.  If it's a service interruption, add a paragraph advising customers to store water.
        5.  Include a paragraph apologizing for the inconvenience.
        6.  End with a paragraph for contact information: "For inquiries, please call our 24/7 hotline at <strong>1627-AGWA</strong>."
        7.  Ensure the entire output is valid HTML that can be placed inside a <div>.

        Generate the full HTML announcement content now.
    `;

    return callGeminiAPI(prompt);
};