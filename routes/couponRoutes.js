const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const mailchimp = require("../mailchimp");

// Generálj egyedi kuponkódot
const generateCouponCode = () => {
  return `BTC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
};

// Definiáld a campaign nevét
const CAMPAIGN_NAME = "BTC-BP-EARLY-BIRD-COUPON";

// Küldj adatokat a Mailchimp audience-hez
const addToMailchimpAudience = async (email, couponCode) => {
  try {
    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID,
      {
        email_address: email,
        status: "subscribed", // vagy "pending" ha double opt-in-t szeretnél
        merge_fields: {
          BALAZS: couponCode, // Az audience-ben létrehozott "Coupon Code" mező tag
          CAMPAIGN: CAMPAIGN_NAME, // Fixált campaign érték
        },
      }
    );
    console.log("Successfully added to Mailchimp audience:", response);
    return response;
  } catch (error) {
    console.error("Error adding to Mailchimp audience:", error.response.body);
    throw new Error("Mailchimp API error");
  }
};

// Új kupon létrehozása
router.post("/", async (req, res) => {
  const { email } = req.body; // Csak email-t várunk a frontend-től

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Ellenőrizd, hogy az email + campaign már létezik-e
    const existingCoupon = await Coupon.findOne({
      email,
      campaign: CAMPAIGN_NAME,
    });

    if (existingCoupon) {
      return res.status(400).json({
        error: "Coupon already generated for this email and campaign",
      });
    }

    // Generálj új kuponkódot
    const couponCode = generateCouponCode();

    // Mentsd el a kupon adatbázisba
    const coupon = new Coupon({
      email,
      couponCode,
      campaign: CAMPAIGN_NAME, // Fixált campaign érték
    });

    await coupon.save();

    // Add hozzá a Mailchimp audience-hez
    await addToMailchimpAudience(email, couponCode);

    res.status(201).json({
      message: "Coupon created successfully and added to Mailchimp",
      coupon,
    });
  } catch (error) {
    console.error("Error creating coupon or adding to Mailchimp:", error);
    res.status(500).json({
      error:
        "An error occurred while creating the coupon or adding to Mailchimp",
    });
  }
});

// Kuponok lekérdezése
router.get("/", async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching coupons" });
  }
});

module.exports = router;
