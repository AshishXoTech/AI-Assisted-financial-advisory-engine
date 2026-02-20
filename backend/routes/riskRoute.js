import express from "express";

const router = express.Router();

router.post("/calculate", async (req, res) => {
  const { revenue, expenses, debt, emi, volatility } = req.body;

  let score = 100;

  const debtRatio = debt / revenue;
  const surplus = revenue - expenses - emi;

  if (debtRatio > 0.5) score -= 20;
  if (surplus < 0) score -= 25;
  if (volatility === "high") score -= 15;
  if (volatility === "medium") score -= 8;

  if (score < 0) score = 0;

  let tier = "Low Risk";
  if (score < 80) tier = "Moderate Risk";
  if (score < 60) tier = "High Risk";
  if (score < 40) tier = "Critical";

  res.json({
    score,
    tier,
    debtRatio,
    surplus
  });
});

export default router;