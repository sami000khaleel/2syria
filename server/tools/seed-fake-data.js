/*
 * Fills the database with fake users and reviews so the app looks alive.
 *
 *   npm run seed                      # 40 users, 3-12 reviews per place
 *   npm run seed -- --users=80        # more users
 *   npm run seed -- --min=5 --max=20  # reviews per place
 *   npm run seed -- --dry             # show what would happen, change nothing
 *   npm run seed:clean                # remove ALL fake users and their reviews
 *
 * What it does
 *  - creates fake users (emails end in @seed.2syria.test so they can be found and removed)
 *    with a real bcrypt password, so you can log in as any of them
 *  - adds reviews to every place, written to match the place type (historical, restaurant…)
 *    with dates spread over the last 18 months, one review per user per place
 *  - recalculates every touched place's avgRating (real reviews included)
 *  - fills each fake user's placesReviewed history
 *
 * Safe to run again: existing fake users are reused, places that already have fake reviews are
 * skipped, and nobody reviews the same place twice. New places added later get reviews on the next run.
 * Real users and their reviews are never changed.
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Place = require("../models/placeModel");
const { getMongoUrl, safeMongoUrl } = require("../utils/mongoUrl");

// ---------------- options ----------------
const arg = (name, def) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : def;
};
const has = (name) => process.argv.includes(`--${name}`);
const USERS = Math.max(1, parseInt(arg("users", "40"), 10));
const MIN = Math.max(0, parseInt(arg("min", "3"), 10));
const MAX = Math.max(MIN, parseInt(arg("max", "12"), 10));
const PASSWORD = arg("password", process.env.SEED_PASSWORD || "Syria2026!");
const DRY = has("dry");
const CLEAN = has("clean");
const { SEED_DOMAIN, SEED_EMAIL: FAKE_EMAIL } = require("../utils/demo");

// deterministic random so repeated runs look consistent
let _s = parseInt(arg("seed", "2026"), 10) || 2026;
const rand = () => ((_s = (_s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (a, b) => a + Math.floor(rand() * (b - a + 1));
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ---------------- fake people ----------------
const FIRST = [
  "Layla", "Omar", "Rana", "Sami", "Maya", "Karim", "Nour", "Hadi", "Lina", "Yousef", "Dana", "Ziad",
  "Hiba", "Fadi", "Reem", "Tarek", "Salma", "Bashar", "Aya", "Majd", "Rama", "Elias", "Joud", "Anas",
  "Sarah", "George", "Hala", "Nabil", "Yara", "Firas", "Mira", "Khaled", "Lara", "Ammar", "Tala", "Wael",
  "Emma", "Lukas", "Sofia", "Daniel", "Hannah", "Marco", "Julia", "Ahmed", "Mariam", "Jad",
];
const LAST = [
  "Haddad", "Khoury", "Nassar", "Darwish", "Hamdan", "Saleh", "Mansour", "Aziz", "Halabi", "Shami",
  "Hourani", "Atassi", "Kabbani", "Sabbagh", "Jabri", "Qassab", "Rifai", "Asaad", "Tannous", "Barakat",
  "Fischer", "Rossi", "Weber", "Martin", "Novak", "Schmidt",
];

function makeUsers(n) {
  const used = new Set();
  const users = [];
  while (users.length < n) {
    const first = pick(FIRST);
    const last = pick(LAST);
    const style = between(0, 3);
    let userName =
      style === 0 ? `${first}_${last}` :
      style === 1 ? `${first}${last[0]}` :
      style === 2 ? `${first}.${last}` :
      `${first}${between(10, 99)}`;
    userName = userName.toLowerCase();
    if (used.has(userName)) continue;
    used.add(userName);
    users.push({ userName, email: `${userName.replace(/[^a-z0-9]/g, "")}${users.length}@${SEED_DOMAIN}` });
  }
  return users;
}

// ---------------- review writing ----------------
const BANK = {
  historical: {
    good: [
      "walking through here feels like stepping back centuries.",
      "the stonework is incredible and very well preserved.",
      "a must see if you care about history at all.",
      "our guide explained every corner, absolutely fascinating.",
      "beautiful old walls and so much detail everywhere.",
    ],
    meh: [
      "interesting place but there is very little information on site.",
      "nice to see, though some parts are closed for restoration.",
      "worth a short visit, an hour is enough.",
    ],
  },
  "old ruins": {
    good: [
      "the columns at sunset are unforgettable.",
      "huge site, you can explore for hours.",
      "standing between these ruins is humbling.",
      "amazing views from the top, bring your camera.",
    ],
    meh: [
      "very hot at midday and almost no shade.",
      "impressive but parts are damaged, still worth it.",
      "hard to reach without a car.",
    ],
  },
  religios: {
    good: [
      "very peaceful, a quiet place to sit and reflect.",
      "the building is beautiful inside and out.",
      "warm welcome from the people who look after it.",
      "one of the oldest places of worship i have visited.",
    ],
    meh: [
      "lovely place, please dress modestly when visiting.",
      "can get crowded on holidays.",
    ],
  },
  restaurant: {
    good: [
      "the best kibbeh i had during the whole trip.",
      "generous portions and very fair prices.",
      "try the fattoush and the grilled meat, both excellent.",
      "friendly staff and a lovely terrace.",
      "real home style cooking, we came back twice.",
    ],
    meh: [
      "good food but the service was slow on friday.",
      "tasty, a bit noisy in the evening.",
      "decent place, nothing special.",
    ],
  },
  "great view": {
    good: [
      "breathtaking view, especially at sunset.",
      "worth the climb, you can see the whole city.",
      "perfect spot for photos.",
      "came for ten minutes and stayed two hours.",
    ],
    meh: [
      "nice view but the road up is rough.",
      "beautiful when it is clear, hazy in summer.",
    ],
  },
  hotel: {
    good: [
      "clean rooms and very helpful staff.",
      "great breakfast and a quiet location.",
      "comfortable beds and a lovely courtyard.",
      "excellent value, would stay again.",
    ],
    meh: [
      "good location but the wifi was weak.",
      "room was fine, a bit small.",
      "ok for one night.",
    ],
  },
  generic: {
    good: [
      "really enjoyed our visit, highly recommended.",
      "beautiful place and friendly people.",
      "one of the highlights of our trip.",
      "better than i expected.",
    ],
    meh: [
      "nice, but not worth a long detour.",
      "ok place, a bit crowded.",
    ],
  },
};
const TIPS = {
  outdoor: [
    "go early in the morning to avoid the crowds.",
    "bring water and a hat in summer.",
    "spring is the best time to come.",
    "ask the locals, they love to share stories.",
  ],
  restaurant: [
    "book a table on weekends.",
    "save room for the sweets.",
    "come hungry!",
  ],
  hotel: [
    "ask for a room facing the courtyard.",
    "the staff can arrange day trips.",
  ],
};
const tipsFor = (cat) => TIPS[cat === "restaurant" || cat === "hotel" ? cat : "outdoor"];
const BAD = [
  "not what i expected, the place needs more care.",
  "too crowded and hard to find parking.",
  "disappointing visit, maybe we came on a bad day.",
];
const ARABIC = [
  "مكان رائع جداً، أنصح بزيارته",
  "تجربة جميلة والناس لطيفين",
  "من أجمل الأماكن التي زرتها في سوريا",
  "المكان جميل لكن يحتاج إلى اهتمام أكثر",
];

function categoryFor(type = "") {
  const t = String(type).toLowerCase();
  if (t.includes("ruin")) return "old ruins";
  if (t.includes("histor")) return "historical";
  if (t.includes("relig")) return "religios";
  if (t.includes("restaur") || t.includes("food") || t.includes("cafe")) return "restaurant";
  if (t.includes("view")) return "great view";
  if (t.includes("hotel")) return "hotel";
  return "generic";
}

// realistic spread: mostly 4-5 stars, some 3, few 1-2
function randomRating() {
  const r = rand();
  if (r < 0.42) return 5;
  if (r < 0.78) return 4;
  if (r < 0.92) return 3;
  if (r < 0.97) return 2;
  return 1;
}

function writeReview(place, rating) {
  if (rand() < 0.07) return pick(ARABIC);
  const cat = categoryFor(place.type);
  const bank = BANK[cat];
  let text;
  if (rating <= 2) text = pick(BAD);
  else if (rating === 3) text = pick(bank.meh);
  else text = pick(bank.good);
  if (rating >= 3 && rand() < 0.55) {
    const second = rating >= 4 ? pick(bank.good) : pick(bank.meh);
    if (second !== text) text += " " + second;
  }
  if (rating >= 3 && rand() < 0.35) text += " " + pick(tipsFor(cat));
  if (place.city && rand() < 0.15) text += ` one of my favourite spots in ${String(place.city).toLowerCase()}.`;
  return text;
}

// random date in the last 18 months (older than 8 days, so the app's
// "one review per week" rule never blocks a real user because of seeded data)
function randomDate() {
  const now = Date.now();
  const days = between(8, 540);
  return new Date(now - days * 86400000 - between(0, 86399) * 1000);
}

const average = (reviews) => {
  const rated = reviews.filter((r) => typeof r.rating === "number");
  if (!rated.length) return 0;
  return rated.reduce((s, r) => s + r.rating, 0) / rated.length;
};

// ---------------- clean ----------------
async function clean() {
  const fakeUsers = await User.find({ email: FAKE_EMAIL }, { _id: 1 }).lean();
  const ids = fakeUsers.map((u) => u._id);
  console.log(`Found ${ids.length} fake users`);
  if (!ids.length) return;
  const places = await Place.find({ "reviews.userId": { $in: ids } }, { reviews: 1 }).lean();
  console.log(`Removing their reviews from ${places.length} places...`);
  if (DRY) return console.log("(dry run — nothing changed)");
  const idSet = new Set(ids.map(String));
  const ops = places.map((p) => {
    const kept = p.reviews.filter((r) => !idSet.has(String(r.userId)));
    return {
      updateOne: {
        filter: { _id: p._id },
        update: { $pull: { reviews: { userId: { $in: ids } } }, $set: { avgRating: average(kept) } },
      },
    };
  });
  for (let i = 0; i < ops.length; i += 500) await Place.bulkWrite(ops.slice(i, i + 500));
  const del = await User.deleteMany({ _id: { $in: ids } });
  console.log(`Deleted ${del.deletedCount} fake users. Real data untouched.`);
}

// ---------------- seed ----------------
async function seed() {
  // 1. users
  const wanted = makeUsers(USERS);
  const existing = await User.find({ email: FAKE_EMAIL }).lean();
  const byName = new Map(existing.map((u) => [u.userName, u]));
  const hash = await bcrypt.hash(PASSWORD, 10);
  const toCreate = wanted.filter((u) => !byName.has(u.userName));
  console.log(`Fake users: ${existing.length} already there, ${toCreate.length} to create`);
  if (!DRY && toCreate.length) {
    const created = await User.insertMany(
      toCreate.map((u) => ({ ...u, password: hash, accountVerificationCodes: [], placesReviewed: [] }))
    );
    created.forEach((u) => byName.set(u.userName, u.toObject()));
  }
  const users = DRY ? wanted.map((u) => byName.get(u.userName) || { ...u, _id: new mongoose.Types.ObjectId() }) : [...byName.values()];

  // 2. reviews
  const places = await Place.find({}, { name: 1, type: 1, city: 1, reviews: 1 }).lean();
  console.log(`Places: ${places.length}`);
  if (!places.length) {
    console.log("No places in the database yet — insert places first, then run the seed again.");
    return;
  }
  const placeOps = [];
  const userHistory = new Map(); // userId -> [{ date, place }]
  let reviewCount = 0;
  for (const place of places) {
    const already = new Set((place.reviews || []).map((r) => String(r.userId)));
    // already seeded before -> leave this place alone (running the script twice adds nothing)
    if (users.some((u) => already.has(String(u._id)))) continue;
    const hi = Math.min(MAX, users.length);
    const need = between(Math.min(MIN, hi), hi);
    if (!need) continue;
    const reviewers = shuffle(users.filter((u) => !already.has(String(u._id)))).slice(0, need);
    const newReviews = reviewers.map((u) => {
      const rating = randomRating();
      const date = randomDate();
      if (!userHistory.has(String(u._id))) userHistory.set(String(u._id), []);
      userHistory.get(String(u._id)).push({ date, place: place._id });
      return { _id: new mongoose.Types.ObjectId(), userId: u._id, rating, review: writeReview(place, rating), date };
    });
    newReviews.sort((a, b) => a.date - b.date); // oldest first, like the app appends them
    reviewCount += newReviews.length;
    const all = [...(place.reviews || []), ...newReviews];
    placeOps.push({
      updateOne: {
        filter: { _id: place._id },
        update: {
          $push: { reviews: { $each: newReviews } }, // existing reviews keep their order
          $set: { avgRating: Math.round(average(all) * 100) / 100 },
        },
      },
    });
  }
  console.log(`Reviews to add: ${reviewCount} across ${placeOps.length} places`);

  if (DRY) {
    const sample = placeOps[0]?.updateOne.update.$push.reviews.$each.slice(0, 3) || [];
    sample.forEach((r) => console.log(`  example: ${r.rating}★ "${r.review}"`));
    return console.log("(dry run — nothing changed)");
  }
  for (let i = 0; i < placeOps.length; i += 500) await Place.bulkWrite(placeOps.slice(i, i + 500));

  // 3. each user's placesReviewed history
  const userOps = [...userHistory.entries()].map(([id, items]) => ({
    updateOne: { filter: { _id: id }, update: { $push: { placesReviewed: { $each: items } } } },
  }));
  for (let i = 0; i < userOps.length; i += 500) await User.bulkWrite(userOps.slice(i, i + 500));

  console.log("Done.");
  console.log(`Log in as any fake user, e.g. "${users[0].userName}" with password "${PASSWORD}"`);
}
(async () => {
  const url = getMongoUrl();
  const source = process.env.DATABASE_URL ? "DATABASE_URL"
    : process.env.MONGO_CLUSTER ? "MONGO_CLUSTER (Atlas)"
    : "MONGO_HOST (local Docker)";
  console.log(`Using ${source}: ${safeMongoUrl(url)}`);
  try {
    await mongoose.connect(url, { family: 4, serverSelectionTimeoutMS: 15000 });
    console.log(`Connected to db "${mongoose.connection.name}"${DRY ? "  (dry run)" : ""}`);
    if (CLEAN) await clean();
    else await seed();
  } catch (err) {
    console.error("Seeding failed:", err.message);
    if (/bad auth|authentication failed/i.test(err.message))
      console.error("→ username/password don't match the Atlas database user (Atlas → Database Access)");
    else if (/ENOTFOUND|querySrv/i.test(err.message))
      console.error("→ cluster hostname is wrong (copy it from Atlas → Connect → Drivers)");
    else if (/timed out|Server selection/i.test(err.message))
      console.error("→ your IP isn't allowed (Atlas → Network Access → add your IP or 0.0.0.0/0)");
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();