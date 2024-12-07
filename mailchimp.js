const mailchimp = require("@mailchimp/mailchimp_marketing");

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;

console.log("this is", MAILCHIMP_API_KEY);

mailchimp.setConfig({
  apiKey: MAILCHIMP_API_KEY,
  server: "us13",
});

module.exports = mailchimp;
