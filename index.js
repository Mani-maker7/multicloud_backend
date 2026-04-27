const express = require("express");
const { BigQuery } = require("@google-cloud/bigquery");

const app = express();
app.use(express.json());

// 🔥 Initialize BigQuery
const bigquery = new BigQuery();

// health check
app.get("/", (req, res) => {
  res.send("GCP OK");
});

// process data from AWS + store in BigQuery
app.post("/process", async (req, res) => {
  try {
    const data = req.body.data;

    if (!data) {
      return res.status(400).send("No data");
    }

    // 🔥 Format data for both response + BigQuery
    const formatted = data.map(d => ({
      product: d.product,
      revenue: d.amount,
      category: "General"
    }));

    // 🔥 Insert into BigQuery
    await bigquery
      .dataset("sales_dataset")
      .table("sales_data")
      .insert(
        formatted.map(d => ({
          product: d.product,
          revenue: d.revenue
        }))
      );

    // 🔥 Analytics calculation (same as before)
    const totalRevenue = formatted.reduce((sum, item) => sum + item.revenue, 0);

    // 🔥 Response (UNCHANGED STRUCTURE → frontend safe)
    res.json({
      totalProducts: formatted.length,
      totalRevenue,
      data: formatted
    });

  } catch (err) {
    console.error("BigQuery Error:", err);

    res.status(500).json({
      error: "Failed to process and store data"
    });
  }
});

// start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server running on port", PORT));