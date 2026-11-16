// Fake accounts created by tools/seed-fake-data.js all use this email domain.
const SEED_DOMAIN = "seed.2syria.test";
const SEED_EMAIL = new RegExp(`@${SEED_DOMAIN.replace(/\./g, "\\.")}$`, "i");

// demo login is on unless DEMO_ACCOUNTS=false
const demoEnabled = () => String(process.env.DEMO_ACCOUNTS || "true").toLowerCase() !== "false";

module.exports = { SEED_DOMAIN, SEED_EMAIL, demoEnabled };
