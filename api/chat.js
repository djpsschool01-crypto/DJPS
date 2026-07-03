// api/chat.js
// Ye function Vercel par chalega — API key yahan SAFE rahegi, browser mein kabhi exposed nahi hogi.

export default async function handler(req, res) {
  // Sirf POST requests allow karo
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message missing' });
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        // Key Vercel ke Environment Variables se aayegi, code mein kahin nahi likhi
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b", // current supported fast model
        messages: [
          {
            role: "system",
            content: "You are a helpful, respectful, and smart AI assistant for Divya Jyoti Public School (DJPS). Answer student's general knowledge questions accurately in short and crisp paragraphs."
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await groqResponse.json();

    if (data.choices && data.choices.length > 0) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      console.error('Groq error:', data);
      return res.status(502).json({ error: 'AI se response nahi mila' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}
