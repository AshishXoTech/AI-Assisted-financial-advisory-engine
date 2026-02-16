import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoute from "./routes/aiRoute.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRoute);

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});