import express from "express";
import PDFDocument from "pdfkit";

const router = express.Router();

router.post("/generate", (req, res) => {
  try {
    const {
      score,
      tier,
      surplus,
      debtRatio,
      recommendedLoan,
      probabilityOfDefault,
      approval,
      explanation
    } = req.body;

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=MSME_Credit_Report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(20).text("MSME AI Credit Risk Report", {
      align: "center"
    });

    doc.moveDown();
    doc.fontSize(12).text(`Generated On: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text("Credit Summary");
    doc.moveDown();

    doc.fontSize(12).text(`Risk Score: ${score}`);
    doc.text(`Risk Tier: ${tier}`);
    doc.text(`Probability of Default: ${probabilityOfDefault}%`);
    doc.text(`Approval: ${approval}`);
    doc.text(`Debt Ratio: ${debtRatio}`);
    doc.text(`Monthly Surplus: ₹${surplus}`);
    doc.text(`Recommended Loan: ₹${recommendedLoan}`);

    doc.moveDown();
    doc.fontSize(14).text("AI Advisory");
    doc.moveDown();

    doc.fontSize(11).text(explanation || "No advisory available");

    doc.end(); // VERY IMPORTANT

  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).send("PDF generation failed");
  }
});

export default router;