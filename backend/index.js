import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import riskRoute from "./routes/riskRoute.js";
import explainRoute from "./routes/explainRoute.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/explain", explainRoute);
app.use("/api/risk", riskRoute);

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});