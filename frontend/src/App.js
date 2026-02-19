import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generateAI = async () => {
    setLoading(true);
    setOutput("");

    try {
      const response = await fetch("http://localhost:8000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: input })
      });

      const data = await response.json();
      setOutput(data.result);
    } catch (error) {
      setOutput("Error connecting to server");
    }

    setLoading(false);
  };

  return (
  <div
    style={{
      padding: "40px",
      fontFamily: "Arial",
      maxWidth: "800px",
      margin: "auto"
    }}
  >
    <h2>AI Hackathon Assistant 🚀</h2>
    <p>AI-powered structured recommendation engine</p>

      <textarea
        rows="5"
        cols="60"
        placeholder="Enter your problem..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <br /><br />

      <button onClick={generateAI} disabled={loading}>
      {loading ? "Generating..." : "Generate"}
      </button>

      <br /><br />

      {loading && <p>Loading...</p>}

      <pre>{output}</pre>
    </div>
  );
}

export default App;