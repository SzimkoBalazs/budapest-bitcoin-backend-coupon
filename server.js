require("dotenv").config();

const express = require("express");
const mailchimp = require("./mailchimp");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

const couponRoutes = require("./routes/couponRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/coupons", couponRoutes);

app.get("/test-mailchimp", async (req, res) => {
  try {
    // Get all lists for debugging
    const lists = await mailchimp.lists.getAllLists();
    console.log("Mailchimp lists:", lists);

    // Get specific list by Audience ID
    const response = await mailchimp.lists.getList(
      process.env.MAILCHIMP_AUDIENCE_ID
    );
    res.status(200).json(response);
  } catch (error) {
    console.error(
      "Mailchimp hiba:",
      error.response ? error.response.body : error
    );
    res.status(500).json({ error: "Mailchimp kapcsolat hiba" });
  }
});

// Alap útvonal (teszteléshez)
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// MongoDB csatlakozás
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
