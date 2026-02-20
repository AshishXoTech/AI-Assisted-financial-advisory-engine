import { useState } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function App() {
  const [formData, setFormData] = useState({
    revenue: "",
    expenses: "",
    debt: "",
    emi: "",
    volatility: "medium"
  });

  const [result, setResult] = useState(null);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [viewMode, setViewMode] = useState("msme");
  const [loading, setLoading] = useState(false);

  const [scenario, setScenario] = useState({
    revenueIncrease: 0,
    expenseReduction: 0,
    emiReduction: 0
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScenarioChange = (e) => {
    setScenario({ ...scenario, [e.target.name]: Number(e.target.value) });
  };

  const getRiskColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 60) return "orange";
    return "red";
  };

  const getLenderInsights = (data) => {
    const probabilityOfDefault = Math.max(100 - data.score, 5);

    const approval =
      data.score >= 80
        ? "Approve"
        : data.score >= 65
        ? "Approve with Conditions"
        : "High Risk - Manual Review Required";

    const confidenceScore = Math.min(
      100 - Math.abs(data.debtRatio * 100 - 50),
      95
    );

    return { probabilityOfDefault, approval, confidenceScore };
  };

  const callRiskEngine = async (payload) => {
    const response = await fetch("http://localhost:8000/api/risk/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await response.json();
  };

  const callAIExplain = async (data) => {
    const response = await fetch("http://localhost:8000/api/explain/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: data.score,
        debtRatio: data.debtRatio,
        surplus: data.surplus,
        volatility: formData.volatility
      })
    });
    return await response.json();
  };

  const calculateRisk = async () => {
    setLoading(true);

    const payload = {
      revenue: Number(formData.revenue),
      expenses: Number(formData.expenses),
      debt: Number(formData.debt),
      emi: Number(formData.emi),
      volatility: formData.volatility
    };

    const riskData = await callRiskEngine(payload);
    const explainData = await callAIExplain(riskData);

    setResult({
      ...riskData,
      explanation: explainData.explanation,
      recommendedLoan: riskData.surplus * 6
    });

    setScenarioResult(null);
    setLoading(false);
  };

  const simulateScenario = async () => {
    const newRevenue =
      Number(formData.revenue) * (1 + scenario.revenueIncrease / 100);
    const newExpenses =
      Number(formData.expenses) * (1 - scenario.expenseReduction / 100);
    const newEmi =
      Number(formData.emi) * (1 - scenario.emiReduction / 100);

    const payload = {
      revenue: newRevenue,
      expenses: newExpenses,
      debt: Number(formData.debt),
      emi: newEmi,
      volatility: formData.volatility
    };

    const riskData = await callRiskEngine(payload);

    setScenarioResult({
      ...riskData,
      recommendedLoan: riskData.surplus * 6
    });
  };

  const calculateHealthMetrics = (data) => {
    const cashflowStrength = Math.min((data.surplus / 100000) * 100, 100);
    const debtExposure = 100 - data.debtRatio * 100;
    const stability =
      formData.volatility === "low"
        ? 90
        : formData.volatility === "medium"
        ? 70
        : 50;
    const repaymentCapacity = Math.min(
      (data.surplus / (Number(formData.emi) + 1)) * 10,
      100
    );
    const growthReadiness = data.score;

    return [
      Math.max(cashflowStrength, 10),
      Math.max(debtExposure, 10),
      Math.max(stability, 10),
      Math.max(repaymentCapacity, 10),
      Math.max(growthReadiness, 10)
    ];
  };

  const radarData =
    result && {
      labels: [
        "Cashflow Strength",
        "Debt Exposure",
        "Stability",
        "Repayment Capacity",
        "Growth Readiness"
      ],
      datasets: [
        {
          label: "Current Health",
          data: calculateHealthMetrics(result),
          backgroundColor: "rgba(0,123,255,0.2)",
          borderColor: "rgba(0,123,255,1)",
          borderWidth: 2
        },
        scenarioResult && {
          label: "Scenario Health",
          data: calculateHealthMetrics(scenarioResult),
          backgroundColor: "rgba(40,167,69,0.2)",
          borderColor: "rgba(40,167,69,1)",
          borderWidth: 2
        }
      ].filter(Boolean)
    };

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: "auto", fontFamily: "Arial" }}>
      <h2>MSME AI Financial Health Engine</h2>

      {/* FORM */}
      <div style={{ marginTop: 20 }}>
        {["revenue", "expenses", "debt", "emi"].map((field) => (
          <input
            key={field}
            type="number"
            name={field}
            placeholder={field}
            value={formData[field]}
            onChange={handleChange}
            style={{ display: "block", marginBottom: 10, width: "100%", padding: 8 }}
          />
        ))}

        <select
          name="volatility"
          value={formData.volatility}
          onChange={handleChange}
          style={{ display: "block", marginBottom: 20, width: "100%", padding: 8 }}
        >
          <option value="low">Low Volatility</option>
          <option value="medium">Medium Volatility</option>
          <option value="high">High Volatility</option>
        </select>

        <button onClick={calculateRisk}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 30 }}>
          {/* Toggle */}
          <button onClick={() => setViewMode("msme")}>MSME View</button>
          <button onClick={() => setViewMode("lender")}>Lender View</button>

          <div style={{ padding: 20, background: "#f4f4f4", borderRadius: 10 }}>

            {/* MSME VIEW */}
            {viewMode === "msme" && (
              <>
                <h1 style={{ color: getRiskColor(result.score) }}>
                  {result.score}
                </h1>

                <p><strong>Tier:</strong> {result.tier}</p>
                <p><strong>Recommended Loan:</strong> ₹{result.recommendedLoan}</p>

                {radarData && <Radar data={radarData} />}

                <h3>AI Advisory</h3>
                <div style={{ whiteSpace: "pre-line" }}>
                  {result.explanation}
                </div>

                {/* SCENARIO SIMULATOR */}
<h3 style={{ marginTop: 30 }}>What-If Scenario Simulator</h3>

<input
  type="number"
  name="revenueIncrease"
  placeholder="Revenue Increase %"
  onChange={handleScenarioChange}
  style={{ marginBottom: 10, width: "100%", padding: 8 }}
/>

<input
  type="number"
  name="expenseReduction"
  placeholder="Expense Reduction %"
  onChange={handleScenarioChange}
  style={{ marginBottom: 10, width: "100%", padding: 8 }}
/>

<input
  type="number"
  name="emiReduction"
  placeholder="EMI Reduction %"
  onChange={handleScenarioChange}
  style={{ marginBottom: 10, width: "100%", padding: 8 }}
/>

<button
  onClick={simulateScenario}
  style={{
    padding: 10,
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 6
  }}
>
  Simulate Impact
</button>

{scenarioResult && (
  <div style={{ marginTop: 20, background: "#e9f5ff", padding: 15 }}>
    <h4>Scenario Risk Score: {scenarioResult.score}</h4>
    <p>
      Improvement:{" "}
      {scenarioResult.score - result.score >= 0
        ? `+${scenarioResult.score - result.score}`
        : scenarioResult.score - result.score}
    </p>
    <p>
      New Recommended Loan: ₹{scenarioResult.recommendedLoan}
    </p>
  </div>
)} 
              </>
            )}

            {/* LENDER VIEW */}
            {viewMode === "lender" && (
              <>
                {(() => {
                  const lender = getLenderInsights(result);
                  return (
                    <>
                      <p><strong>Risk Score:</strong> {result.score}</p>
                      <p><strong>Probability of Default:</strong> {lender.probabilityOfDefault}%</p>
                      <p><strong>Approval:</strong> {lender.approval}</p>
                      <p><strong>Confidence:</strong> {Math.round(lender.confidenceScore)}%</p>
                    </>
                  );
                })()}
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default App;