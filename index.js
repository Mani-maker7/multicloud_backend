const express = require("express");
const app = express();

app.use(express.json());

// health
app.get("/", (req, res) => {
  res.send("GCP OK");
});

// process data from AWS
app.post("/process", (req, res) => {
  const data = req.body.data;

  if (!data) {
    return res.status(400).send("No data");
  }

  // simple analytics
  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0);

  res.json({
    totalProducts: data.length,
    totalRevenue,
    data: data.map(d => ({
      product: d.product,
      revenue: d.amount,
      category: "General"
    }))
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server running"));