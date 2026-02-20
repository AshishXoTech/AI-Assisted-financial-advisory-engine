import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/generate", async (req, res) => {
  try {
    const { score, debtRatio, surplus, volatility } = req.body;

    const prompt = `
You are an AI-powered advisory layer integrated with a deterministic financial risk engine.

SYSTEM ARCHITECTURE CONTEXT:
- The risk score is generated using structured financial rules.
- These rules evaluate cashflow stability, debt ratio, EMI burden, and volatility.
- Your role is NOT to calculate or modify the score.
- Your role is to enhance interpretability and provide contextual reasoning.

Financial Data:
- Risk Score: ${score}
- Debt Ratio: ${debtRatio}
- Monthly Surplus: ${surplus}
- Cashflow Volatility: ${volatility}

Respond strictly in the following structure:

1. Score Interpretation
Explain why this score was assigned based on financial signals.

2. Key Risk Drivers
• Bullet points explaining contributors to financial risk.

3. Financial Strength Indicators
• Bullet points explaining positive signals.

4. Improvement Strategy
Provide practical and measurable improvement suggestions.

5. Loan Readiness Verdict
Clearly state one of:
- Loan Ready
- Moderately Ready (with improvements required)
- High Risk (requires financial stabilization)

Tone:
Professional, analytical, structured.
Avoid generic advice.
Be concise but insightful.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a fintech AI assistant specialized in credit risk explainability. You enhance deterministic scoring systems with contextual reasoning while preserving auditability."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4
    });

    res.json({
      explanation: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      error: "AI explanation failed",
      fallback:
        "Structured financial advisory temporarily unavailable. Please retry."
    });
  }
});

export default router;