const express = require("express");
const { BigQuery } = require("@google-cloud/bigquery");

const app = express();
app.use(express.json());

const bigquery = new BigQuery();

// health check
app.get("/", (req, res) => {
  res.send("OK");
});

// receive data from AWS
app.post("/process", async (req, res) => {
  try {
    const rows = req.body.data;

    if (!rows || rows.length === 0) {
      return res.status(400).send("No data received");
    }

    await bigquery
      .dataset("sales_dataset")
      .table("sales_data")
      .insert(rows);

    res.send("Inserted into BigQuery");

  } catch (err) {
    console.error("BIGQUERY ERROR:", err);
    res.status(500).send("BigQuery failed");
  }
});

// analytics
app.get("/analytics", async (req, res) => {
  try {
    const query = `
      SELECT product, SUM(amount) as revenue
      FROM \`sales_dataset.sales_data\`
      GROUP BY product
    `;

    const [rows] = await bigquery.query(query);

    const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);

    res.json({
      totalProducts: rows.length,
      totalRevenue,
      data: rows.map(r => ({
        product: r.product,
        revenue: r.revenue,
        category: "General"
      }))
    });

  } catch (err) {
    console.error("QUERY ERROR:", err);
    res.status(500).send("Query failed");
  }
});

// 🔥 CRITICAL FIX
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});