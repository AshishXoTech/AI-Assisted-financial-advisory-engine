import express from "express";

const router = express.Router();

router.post("/generate", async (req, res) => {
  console.log("Request received");

  const { userInput } = req.body;

  return res.json({
    success: true,
    result: `
1. Key Issues:
- Lack of planning
- Distractions

2. Suggested Actions:
- Create daily schedule
- Use Pomodoro technique

3. Expected Outcome:
- Better focus
- Improved productivity
`
  });
});

export default router;