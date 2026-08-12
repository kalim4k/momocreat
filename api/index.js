// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// src/lib/serverDb.ts
import fs from "fs";
import path from "path";
var DB_FILE_PATH = path.join(process.cwd(), "src", "data", "server_db.json");
var dir = path.dirname(DB_FILE_PATH);
try {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
} catch (err) {
  console.warn("[ServerDB] Safe warning: Could not verify or create database directory, probably running in a read-only serverless environment:", err);
}
var memoryDb = null;
function loadDB() {
  if (memoryDb) {
    return memoryDb;
  }
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const defaultDB = { purchases: [], donations: [], transactions: [], notifications: [], subscriptions: [], creator_profiles: [], withdrawals: [] };
      try {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultDB, null, 2), "utf-8");
      } catch (writeErr) {
        console.warn("[ServerDB] Cannot write default DB to disk, using in-memory mode:", writeErr);
      }
      memoryDb = defaultDB;
    } else {
      const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const db2 = JSON.parse(content);
      db2.donations = db2.donations || [];
      db2.subscriptions = db2.subscriptions || [];
      db2.creator_profiles = db2.creator_profiles || [];
      db2.withdrawals = db2.withdrawals || [];
      memoryDb = db2;
    }
  } catch (err) {
    console.error("[ServerDB] Error loading database from disk, falling back to in-memory mode:", err);
    if (!memoryDb) {
      memoryDb = { purchases: [], donations: [], transactions: [], notifications: [], subscriptions: [], creator_profiles: [], withdrawals: [] };
    }
  }
  const db = memoryDb;
  if (db.creator_profiles.length === 0) {
    db.creator_profiles = [
      {
        id: "creator_1",
        user_id: "user_1",
        username: "michella_coaching",
        display_name: "Michella Coaching",
        bio: "Coach certifi\xE9e en influence et mon\xE9tisation d'audience.",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        cover_url: "",
        payout_phone_number: "2250707070707",
        payout_provider: "wave",
        status: "active",
        is_premium: true,
        premium_expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1e3).toISOString(),
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1e3).toISOString(),
        store_quota: 2
      },
      {
        id: "creator_2",
        user_id: "user_2",
        username: "dev_guy",
        display_name: "Abdoulaye Sow",
        bio: "Formateur en d\xE9veloppement web React et Node.js.",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        cover_url: "",
        payout_phone_number: "221776543210",
        payout_provider: "orange",
        status: "active",
        is_premium: false,
        premium_expires_at: null,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString(),
        store_quota: 2
      },
      {
        id: "creator_3",
        user_id: "user_3",
        username: "momo_designer",
        display_name: "Mamadou Diallo",
        bio: "UI/UX Designer, je vends des templates Figma professionnels.",
        avatar_url: "",
        cover_url: "",
        payout_phone_number: "22366778899",
        payout_provider: "mtn",
        status: "inactive",
        is_premium: true,
        premium_expires_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
        // Expired
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1e3).toISOString(),
        store_quota: 2
      }
    ];
  }
  if (db.withdrawals.length === 0) {
    db.withdrawals = [
      {
        id: "w_1",
        creator_id: "creator_1",
        amount_requested: 15e3,
        payout_provider: "wave",
        payout_phone_number: "2250707070707",
        status: "pending",
        requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString()
      },
      {
        id: "w_2",
        creator_id: "creator_2",
        amount_requested: 25e3,
        payout_provider: "orange",
        payout_phone_number: "221776543210",
        status: "pending",
        requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString()
      },
      {
        id: "w_3",
        creator_id: "creator_1",
        amount_requested: 1e4,
        payout_provider: "wave",
        payout_phone_number: "2250707070707",
        status: "paid",
        requested_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1e3).toISOString(),
        processed_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1e3).toISOString()
      }
    ];
  }
  return db;
}
function saveDB(db) {
  memoryDb = db;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ServerDB] Error saving database to disk, keeping state in-memory:", err);
  }
}
var serverDb = {
  getPurchases() {
    return loadDB().purchases;
  },
  getPurchase(id) {
    return loadDB().purchases.find((p) => p.id === id);
  },
  getPurchaseByCart(cartId) {
    return loadDB().purchases.find((p) => p.paymentReference === cartId);
  },
  addPurchase(purchase) {
    const db = loadDB();
    const newPurchase = {
      buyerPhone: purchase.buyerPhone,
      buyerEmail: purchase.buyerEmail,
      buyerFirstName: purchase.buyerFirstName,
      buyerLastName: purchase.buyerLastName,
      contentId: purchase.contentId,
      status: purchase.status,
      paymentReference: purchase.paymentReference,
      amountPaid: purchase.amountPaid,
      commissionAmount: purchase.commissionAmount,
      creatorNetAmount: purchase.creatorNetAmount,
      id: purchase.id || `purchase_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.purchases.push(newPurchase);
    saveDB(db);
    return newPurchase;
  },
  getDonations() {
    return loadDB().donations;
  },
  getDonation(id) {
    return loadDB().donations.find((d) => d.id === id);
  },
  getDonationByCart(cartId) {
    return loadDB().donations.find((d) => d.paymentReference === cartId);
  },
  addDonation(donation) {
    const db = loadDB();
    const newDonation = {
      creatorId: donation.creatorId,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donorMessage: donation.donorMessage,
      status: donation.status,
      paymentReference: donation.paymentReference,
      amount: donation.amount,
      commissionAmount: donation.commissionAmount,
      creatorNetAmount: donation.creatorNetAmount,
      id: donation.id || `donation_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.donations.push(newDonation);
    saveDB(db);
    return newDonation;
  },
  updateDonation(id, updates) {
    const db = loadDB();
    const idx = db.donations.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    db.donations[idx] = { ...db.donations[idx], ...updates };
    saveDB(db);
    return db.donations[idx];
  },
  updatePurchase(id, updates) {
    const db = loadDB();
    const idx = db.purchases.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    db.purchases[idx] = { ...db.purchases[idx], ...updates };
    saveDB(db);
    return db.purchases[idx];
  },
  addTransaction(tx) {
    const db = loadDB();
    const newTx = {
      ...tx,
      id: `tx_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.transactions.push(newTx);
    saveDB(db);
    return newTx;
  },
  updateTransactionByCart(cartId, updates) {
    const db = loadDB();
    const idx = db.transactions.findIndex((t) => t.providerTransactionId === cartId);
    if (idx === -1) return null;
    db.transactions[idx] = { ...db.transactions[idx], ...updates };
    saveDB(db);
    return db.transactions[idx];
  },
  addNotification(notif) {
    const db = loadDB();
    const newNotif = {
      ...notif,
      id: `notif_${Math.random().toString(36).substring(2, 11)}`,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.notifications.push(newNotif);
    saveDB(db);
    return newNotif;
  },
  getNotifications(userId) {
    return loadDB().notifications.filter((n) => n.userId === userId);
  },
  getSubscriptions() {
    return loadDB().subscriptions;
  },
  getCreatorSubscriptions(creatorId) {
    return loadDB().subscriptions.filter((s) => s.creatorId === creatorId);
  },
  addSubscription(sub) {
    const db = loadDB();
    const newSub = {
      ...sub,
      id: `sub_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.subscriptions.push(newSub);
    saveDB(db);
    return newSub;
  },
  updateSubscription(id, updates) {
    const db = loadDB();
    const idx = db.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    db.subscriptions[idx] = { ...db.subscriptions[idx], ...updates };
    saveDB(db);
    return db.subscriptions[idx];
  },
  isCreatorSubscribed(creatorId) {
    const db = loadDB();
    const now = Date.now();
    const graceLimit = now - 3 * 24 * 60 * 60 * 1e3;
    return db.subscriptions.some(
      (s) => s.creatorId === creatorId && s.status === "active" && new Date(s.endDate).getTime() > graceLimit
    );
  },
  getCreators() {
    return loadDB().creator_profiles;
  },
  updateCreator(id, updates) {
    const db = loadDB();
    const idx = db.creator_profiles.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    db.creator_profiles[idx] = { ...db.creator_profiles[idx], ...updates };
    saveDB(db);
    return db.creator_profiles[idx];
  },
  getWithdrawals() {
    return loadDB().withdrawals;
  },
  addWithdrawal(w) {
    const db = loadDB();
    db.withdrawals.push(w);
    saveDB(db);
    return w;
  },
  updateWithdrawal(id, updates) {
    const db = loadDB();
    const idx = db.withdrawals.findIndex((w) => w.id === id);
    if (idx === -1) return null;
    db.withdrawals[idx] = { ...db.withdrawals[idx], ...updates };
    saveDB(db);
    return db.withdrawals[idx];
  }
};

// server.ts
dotenv.config();
function syncEnvAliases(...names) {
  const value = names.map((n) => process.env[n]).find((v) => v && v !== "undefined");
  for (const name of names) {
    if (value) {
      process.env[name] = value;
    } else if (process.env[name] === "undefined") {
      delete process.env[name];
    }
  }
}
syncEnvAliases("SUPABASE_URL", "VITE_SUPABASE_URL");
syncEnvAliases("SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");
syncEnvAliases("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE", "VITE_SUPABASE_SERVICE_ROLE_KEY");
syncEnvAliases("MAKETOU_API_KEY", "VITE_MAKETOU_API_KEY");
syncEnvAliases("MAKETOU_PRODUCT_ID", "VITE_MAKETOU_PRODUCT_ID");
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || "bigardlamine@gmail.com";
process.env.VITE_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
var app = express();
var PORT = 3e3;
var SUBSCRIPTION_PRICE_FCFA = 4990;
app.use(express.json());
var getAppUrl = () => {
  const isRealUrl = (v) => !!v && /^https?:\/\//.test(v);
  const configuredAppUrl = [process.env.NEXT_PUBLIC_APP_URL, process.env.APP_URL].find(isRealUrl);
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const vercelAppUrl = vercelHost ? `https://${vercelHost}` : void 0;
  let url = (configuredAppUrl || vercelAppUrl || `http://localhost:${PORT}`).replace(/\/$/, "");
  if (url.includes("localhost")) {
    url = url.replace("localhost", "lvh.me");
  }
  return url;
};
var supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
var supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
var supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
var isSupabaseConfigured = !!(supabaseUrl && /^https?:\/\//.test(supabaseUrl) && supabaseUrl !== "https://your-project-id.supabase.co" && supabaseAnonKey && supabaseAnonKey !== "your-anon-public-key");
if (!isSupabaseConfigured) {
  console.error("[Server] Supabase non configur\xE9 : v\xE9rifiez SUPABASE_URL / SUPABASE_ANON_KEY. L'application d\xE9marre en mode d\xE9grad\xE9.");
}
var supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
var supabaseAdmin = isSupabaseConfigured && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : supabase;
console.log(`[Server] Supabase configuration status: ${isSupabaseConfigured ? "CONNECTED" : "DEMO MODE"}`);
console.log(`[Server] Supabase Admin status: ${supabaseAdmin !== supabase ? "SERVICE ROLE ENABLED" : "FALLBACK MODE"}`);
var MISSING_COLUMN_ERROR = "PGRST204";
function mapPurchaseRow(row) {
  return {
    id: row.id,
    buyerPhone: row.buyer_phone || "",
    buyerEmail: row.buyer_email || "",
    buyerFirstName: row.buyer_first_name || "Un acheteur",
    buyerLastName: row.buyer_last_name || "",
    contentId: row.content_id,
    status: row.status,
    paymentReference: row.payment_reference || "",
    amountPaid: row.amount_paid_fcfa || 0,
    commissionAmount: row.commission_amount_fcfa || 0,
    creatorNetAmount: row.creator_net_amount_fcfa || 0,
    createdAt: row.created_at,
    // Supabase has no separate "purchased at" column — created_at is the reference date there.
    purchasedAt: void 0
  };
}
async function getPurchaseById(purchaseId) {
  if (supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin.from("purchases").select("*").eq("id", purchaseId).maybeSingle();
      if (data) return mapPurchaseRow(data);
    } catch (err) {
      console.warn("[Server] getPurchaseById: Supabase lookup failed, falling back to local db:", err);
    }
  }
  return serverDb.getPurchase(purchaseId) || null;
}
async function getCompletedPurchasesByEmail(email) {
  const emailStr = email.toLowerCase().trim();
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.from("purchases").select("*").ilike("buyer_email", emailStr).eq("status", "completed").order("created_at", { ascending: false });
      if (error) {
        console.warn("[Server] getCompletedPurchasesByEmail: Supabase query failed, using local db:", error.message);
      } else if (data && data.length > 0) {
        return data.map(mapPurchaseRow);
      }
    } catch (err) {
      console.warn("[Server] getCompletedPurchasesByEmail: Supabase lookup threw, using local db:", err);
    }
  }
  return serverDb.getPurchases().filter((p) => p.buyerEmail.toLowerCase() === emailStr && p.status === "completed").sort(
    (a, b) => new Date(b.purchasedAt || b.createdAt).getTime() - new Date(a.purchasedAt || a.createdAt).getTime()
  );
}
function mapCartStatus(cartStatus) {
  if (cartStatus === "completed" || cartStatus === "success") return "completed";
  if (cartStatus === "payment_failed" || cartStatus === "failed" || cartStatus === "abandoned") return "failed";
  return "waiting_payment";
}
async function fetchCartStatus(cartId) {
  if (cartId.startsWith("mock_") || !process.env.MAKETOU_API_KEY) return "completed";
  try {
    const maketouRes = await fetch(`https://api.maketou.net/api/v1/stores/cart/${cartId}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${process.env.MAKETOU_API_KEY}` }
    });
    if (!maketouRes.ok) {
      console.error(`[Server] Maketou status check failed for cart ${cartId}: ${maketouRes.status} ${maketouRes.statusText}`);
      return null;
    }
    const cartData = await maketouRes.json();
    return mapCartStatus(cartData.status || cartData.cart?.status);
  } catch (err) {
    console.error(`[Server] Maketou status check threw for cart ${cartId}:`, err);
    return null;
  }
}
async function finalizePurchase(purchase, cartId, knownContentTitle) {
  const alreadyCompleted = purchase.status === "completed";
  serverDb.updatePurchase(purchase.id, { status: "completed", purchasedAt: (/* @__PURE__ */ new Date()).toISOString() });
  serverDb.updateTransactionByCart(cartId, { status: "success" });
  let contentTitle = knownContentTitle || "Contenu exclusif";
  let creatorUserId = null;
  if (supabaseAdmin) {
    try {
      const { data: contentData } = await supabaseAdmin.from("contents").select("title, creator_profiles(id, user_id)").eq("id", purchase.contentId).maybeSingle();
      if (contentData) {
        if (!knownContentTitle && contentData.title) contentTitle = contentData.title;
        const creatorProfile = contentData.creator_profiles;
        creatorUserId = creatorProfile?.user_id || creatorProfile?.id || null;
      }
      await supabaseAdmin.from("purchases").update({ status: "completed" }).eq("id", purchase.id);
      await supabaseAdmin.from("transactions").update({ status: "success" }).eq("provider_transaction_id", cartId);
      if (creatorUserId && !alreadyCompleted) {
        await supabaseAdmin.from("notifications").insert({
          user_id: creatorUserId,
          title: "Nouvelle vente !",
          message: `L'acheteur ${purchase.buyerFirstName} a d\xE9bloqu\xE9 votre contenu "${contentTitle}" pour ${purchase.amountPaid} FCFA.`,
          is_read: false
        });
      }
    } catch (dbErr) {
      console.error("[Server] finalizePurchase: Supabase write warning:", dbErr);
    }
  }
  if (!alreadyCompleted) {
    serverDb.addNotification({
      userId: creatorUserId || "creator_1",
      type: "new_sale",
      title: "Nouvelle vente !",
      message: `L'acheteur ${purchase.buyerFirstName} a d\xE9bloqu\xE9 votre contenu "${contentTitle}" pour ${purchase.amountPaid} FCFA.`
    });
  }
  return { contentTitle, creatorUserId };
}
async function getDonationById(donationId) {
  if (supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin.from("donations").select("*").eq("id", donationId).maybeSingle();
      if (data) {
        return {
          id: data.id,
          creatorId: data.creator_id,
          donorName: data.donor_name || "Un fan",
          donorEmail: data.donor_email || void 0,
          donorMessage: data.donor_message || void 0,
          status: data.status,
          paymentReference: data.payment_reference || "",
          amount: data.amount_fcfa || 0,
          commissionAmount: data.commission_amount_fcfa || 0,
          creatorNetAmount: data.creator_net_amount_fcfa || 0,
          createdAt: data.created_at
        };
      }
    } catch (err) {
      console.warn("[Server] getDonationById: Supabase lookup failed, falling back to local db:", err);
    }
  }
  return serverDb.getDonation(donationId) || null;
}
async function finalizeDonation(donation, cartId) {
  serverDb.updateDonation(donation.id, { status: "completed" });
  serverDb.updateTransactionByCart(cartId, { status: "success" });
  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from("donations").update({ status: "completed" }).eq("id", donation.id);
      await supabaseAdmin.from("transactions").update({ status: "success" }).eq("provider_transaction_id", cartId);
    } catch (dbErr) {
      console.error("[Server] finalizeDonation: Supabase write warning:", dbErr);
    }
  }
}
async function markDonationFailed(donation, cartId) {
  serverDb.updateDonation(donation.id, { status: "failed" });
  serverDb.updateTransactionByCart(cartId, { status: "failed" });
  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from("donations").update({ status: "failed" }).eq("id", donation.id);
      await supabaseAdmin.from("transactions").update({ status: "failed" }).eq("provider_transaction_id", cartId);
    } catch (dbErr) {
      console.error("[Server] markDonationFailed: Supabase write warning:", dbErr);
    }
  }
}
async function markPurchaseFailed(purchase, cartId) {
  serverDb.updatePurchase(purchase.id, { status: "failed" });
  serverDb.updateTransactionByCart(cartId, { status: "failed" });
  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from("purchases").update({ status: "failed" }).eq("id", purchase.id);
      await supabaseAdmin.from("transactions").update({ status: "failed" }).eq("provider_transaction_id", cartId);
    } catch (dbErr) {
      console.error("[Server] markPurchaseFailed: Supabase write warning:", dbErr);
    }
  }
}
async function getTestAccountIds() {
  if (!supabaseAdmin) return { creatorIds: /* @__PURE__ */ new Set(), contentIds: /* @__PURE__ */ new Set() };
  try {
    const { data: testCreators } = await supabaseAdmin.from("creator_profiles").select("id").eq("is_test_account", true);
    const creatorIds = new Set((testCreators || []).map((c) => c.id));
    if (creatorIds.size === 0) return { creatorIds, contentIds: /* @__PURE__ */ new Set() };
    const { data: testContents } = await supabaseAdmin.from("contents").select("id").in("creator_id", Array.from(creatorIds));
    const contentIds = new Set((testContents || []).map((c) => c.id));
    return { creatorIds, contentIds };
  } catch (err) {
    console.warn("[Server] Failed to resolve test account ids:", err);
    return { creatorIds: /* @__PURE__ */ new Set(), contentIds: /* @__PURE__ */ new Set() };
  }
}
function generateFakePaymentReference(provider) {
  const prefixes = { wave: "WAVE", orange: "OM", mtn: "MTN", moov: "MOOV" };
  const prefix = prefixes[(provider || "wave").toLowerCase()] || "WAVE";
  const num = Math.floor(1e5 + Math.random() * 899999);
  return `${prefix}-${num}-MOMO`;
}
var MOMO_PROVIDERS = ["wave", "orange", "mtn", "moov"];
function randomMomoProvider() {
  return MOMO_PROVIDERS[Math.floor(Math.random() * MOMO_PROVIDERS.length)];
}
function randomGrowthDate(maxDaysAgo) {
  let daysAgo = maxDaysAgo * Math.pow(Math.random(), 2);
  const candidate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1e3);
  const isWeekend = candidate.getDay() === 0 || candidate.getDay() === 6;
  if (!isWeekend && Math.random() < 0.3) {
    daysAgo = Math.max(0, daysAgo - Math.random() * 2);
  }
  const finalDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1e3);
  finalDate.setHours(8 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return finalDate.toISOString();
}
app.post("/api/payment/create-cart", async (req, res) => {
  const { contentId, buyerEmail, buyerFirstName, buyerLastName, buyerPhone } = req.body;
  if (!contentId || !buyerEmail || !buyerFirstName || !buyerLastName || !buyerPhone) {
    return res.status(400).json({ error: "Champs obligatoires manquants (contentId, buyerEmail, buyerFirstName, buyerLastName, buyerPhone)." });
  }
  try {
    let content = null;
    if (supabase) {
      const { data, error } = await supabase.from("contents").select("*, creator_profiles(*)").eq("id", contentId).maybeSingle();
      if (error) {
        console.error("[Server] Supabase error fetching content:", error);
      }
      content = data;
    }
    if (!content) {
      const localContents = [
        {
          id: "1",
          creator_id: "creator_1",
          title: "Pack PDF : Booster son audience TikTok en 30 jours",
          price_fcfa: 2500,
          status: "published",
          is_published: true,
          creator_profiles: { user_id: "user_1", id: "creator_1" }
        },
        {
          id: "2",
          creator_id: "creator_1",
          title: "Template Notion : Organiser ses tournages Reels & TikTok",
          price_fcfa: 1500,
          status: "published",
          is_published: true,
          creator_profiles: { user_id: "user_1", id: "creator_1" }
        },
        {
          id: "3",
          creator_id: "creator_1",
          title: "Masterclass : D\xE9cryptage de l'Algorithme 2026 (Vid\xE9o 20m)",
          price_fcfa: 5e3,
          status: "published",
          is_published: true,
          creator_profiles: { user_id: "user_1", id: "creator_1" }
        }
      ];
      content = localContents.find((c) => c.id === contentId);
    }
    if (!content) {
      return res.status(404).json({ error: "Contenu non trouv\xE9." });
    }
    const price_amount = content.price_fcfa || content.price_amount;
    const isPublished = content.status === "published" || content.is_published === true;
    if (!isPublished) {
      return res.status(400).json({ error: "Ce contenu n'est pas publi\xE9." });
    }
    const existingPurchases = serverDb.getPurchases();
    const hasBought = existingPurchases.some(
      (p) => p.buyerEmail.toLowerCase() === buyerEmail.toLowerCase() && p.contentId === contentId && p.status === "completed"
    );
    if (hasBought) {
      return res.status(400).json({ error: "Vous avez d\xE9j\xE0 achet\xE9 ce contenu." });
    }
    const commission_amount = Math.round(price_amount * 0.1);
    const creator_net_amount = price_amount - commission_amount;
    let purchaseId = `purchase_${Math.random().toString(36).substring(2, 11)}`;
    if (supabaseAdmin) {
      try {
        const purchaseRow = {
          buyer_phone: buyerPhone || "Non fourni",
          content_id: contentId,
          status: "pending",
          amount_paid_fcfa: price_amount,
          commission_amount_fcfa: commission_amount,
          creator_net_amount_fcfa: creator_net_amount,
          payment_reference: "temp_ref_" + Date.now()
        };
        let { data: pbData, error: pbErr } = await supabaseAdmin.from("purchases").insert({
          ...purchaseRow,
          buyer_email: buyerEmail,
          buyer_first_name: buyerFirstName,
          buyer_last_name: buyerLastName
        }).select().single();
        if (pbErr && pbErr.code === MISSING_COLUMN_ERROR) {
          console.warn("[Server] Colonnes acheteur absentes (migration SQL non appliqu\xE9e) \u2014 insertion sans identit\xE9 acheteur.");
          ({ data: pbData, error: pbErr } = await supabaseAdmin.from("purchases").insert(purchaseRow).select().single());
        }
        if (!pbErr && pbData) {
          purchaseId = pbData.id;
        } else {
          console.error("[Server] Supabase purchase insertion warning:", pbErr);
        }
      } catch (dbErr) {
        console.error("[Server] DB writing exception:", dbErr);
      }
    }
    const localPurchase = serverDb.addPurchase({
      id: purchaseId,
      buyerPhone: buyerPhone || "",
      buyerEmail,
      buyerFirstName,
      buyerLastName,
      contentId,
      status: "pending",
      paymentReference: "",
      // Will be updated to cartId once returned
      amountPaid: price_amount,
      commissionAmount: commission_amount,
      creatorNetAmount: creator_net_amount
    });
    const isMaketouConfigured = process.env.MAKETOU_API_KEY && process.env.MAKETOU_PRODUCT_ID;
    if (isMaketouConfigured) {
      const appUrl = getAppUrl();
      const redirectURL = `${appUrl}/payment/confirm?purchaseId=${purchaseId}`;
      const normalizedPhone = (buyerPhone || "").replace(/[^\d+]/g, "");
      const isValidE164Phone = /^\+\d{8,15}$/.test(normalizedPhone);
      const requestBody = {
        productDocumentId: process.env.MAKETOU_PRODUCT_ID,
        email: buyerEmail,
        firstName: buyerFirstName,
        lastName: buyerLastName,
        phone: isValidE164Phone ? normalizedPhone : void 0,
        customerPrice: price_amount,
        redirectURL,
        meta: { contentId, purchaseId, buyerEmail }
      };
      console.log("[Server] Requesting Maketou checkout:", requestBody);
      const maketouRes = await fetch("https://api.maketou.net/api/v1/stores/cart/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MAKETOU_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });
      if (!maketouRes.ok) {
        const errorText = await maketouRes.text();
        console.error("[Server] Maketou API error:", errorText);
        throw new Error(`Erreur Maketou API: ${maketouRes.statusText}`);
      }
      const maketouData = await maketouRes.json();
      console.log("[Server] Maketou Response:", maketouData);
      const cart = maketouData.cart || maketouData || {};
      const cartId = cart.id || cart.cartId || cart.uuid || maketouData.id || maketouData.cartId || maketouData.cart_id || maketouData.uuid;
      const redirectUrl = maketouData.redirectUrl || maketouData.checkoutUrl || maketouData.checkout_url || maketouData.url || maketouData.paymentUrl || maketouData.payment_url || cart.redirectUrl || cart.checkoutUrl || cart.checkout_url || cart.url || cart.paymentUrl || cart.payment_url;
      if (!cartId || !redirectUrl) {
        console.error("[Server] Missing keys in Maketou response. Full response:", JSON.stringify(maketouData));
        throw new Error(`Donn\xE9es de panier ou d'URL de redirection manquantes dans la r\xE9ponse Maketou. R\xE9ponse re\xE7ue: ${JSON.stringify(maketouData)}`);
      }
      serverDb.updatePurchase(purchaseId, { paymentReference: cartId });
      serverDb.addTransaction({
        provider: "maketou",
        providerTransactionId: cartId,
        status: "pending",
        type: "purchase"
      });
      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from("transactions").insert({
            provider: "maketou",
            provider_transaction_id: cartId,
            status: "pending",
            type: "purchase"
          }).select().maybeSingle();
          await supabaseAdmin.from("purchases").update({ payment_reference: cartId }).eq("id", purchaseId);
        } catch (dbErr) {
          console.warn("[Server] Supabase transaction update skipped or failed:", dbErr);
        }
      }
      return res.json({ redirectUrl });
    } else {
      console.log("[Server] Maketou not configured. Simulating payment checkout redirect.");
      const mockCartId = `mock_cart_${Math.random().toString(36).substring(2, 11)}`;
      serverDb.updatePurchase(purchaseId, { paymentReference: mockCartId });
      serverDb.addTransaction({
        provider: "maketou",
        providerTransactionId: mockCartId,
        status: "pending",
        type: "purchase"
      });
      const appUrl = getAppUrl();
      const simulatedRedirectUrl = `${appUrl}/payment/confirm?cartId=${mockCartId}&purchaseId=${purchaseId}`;
      return res.json({ redirectUrl: simulatedRedirectUrl });
    }
  } catch (err) {
    console.error("[Server] Create Cart handler error:", err);
    return res.status(500).json({ error: err.message || "Une erreur interne est survenue lors de l'initialisation du paiement." });
  }
});
app.get("/api/payment/check-status", async (req, res) => {
  const { cartId, purchaseId } = req.query;
  if (!cartId || !purchaseId) {
    return res.status(400).json({ error: "Param\xE8tres cartId et purchaseId requis." });
  }
  try {
    const purchase = await getPurchaseById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ error: "Achat non trouv\xE9." });
    }
    let contentTitle = "Contenu exclusif";
    let creatorUsername = "michella_coaching";
    if (supabase) {
      try {
        const { data: contentData } = await supabase.from("contents").select("title, creator_profiles(username)").eq("id", purchase.contentId).maybeSingle();
        if (contentData) {
          contentTitle = contentData.title;
          if (contentData.creator_profiles) {
            creatorUsername = contentData.creator_profiles.username || "michella_coaching";
          }
        }
      } catch (err) {
        console.warn("[Server] Error fetching content title inside check-status:", err);
      }
    } else {
      const localContents = [
        { id: "1", title: "Pack PDF : Booster son audience TikTok en 30 jours", creatorUsername: "michella_coaching" },
        { id: "2", title: "Template Notion : Organiser ses tournages Reels & TikTok", creatorUsername: "michella_coaching" },
        { id: "3", title: "Masterclass : D\xE9cryptage de l'Algorithme 2026 (Vid\xE9o 20m)", creatorUsername: "michella_coaching" }
      ];
      const found = localContents.find((c) => c.id === purchase.contentId);
      if (found) {
        contentTitle = found.title;
        creatorUsername = found.creatorUsername;
      } else {
        contentTitle = "Votre contenu exclusif";
      }
    }
    console.log(`[Server] Polling Maketou status for cart ${cartId}`);
    const cartStatus = await fetchCartStatus(cartId);
    if (cartStatus === null) {
      return res.status(500).json({ error: "Impossible de v\xE9rifier le statut aupr\xE8s de Maketou." });
    }
    const statusToSet = cartStatus;
    if (statusToSet === "completed") {
      const finalized = await finalizePurchase(purchase, cartId, contentTitle);
      return res.json({
        status: "completed",
        contentId: purchase.contentId,
        contentTitle: finalized.contentTitle,
        creatorUsername,
        buyerEmail: purchase.buyerEmail,
        buyerPhone: purchase.buyerPhone
      });
    } else if (statusToSet === "failed") {
      await markPurchaseFailed(purchase, cartId);
      return res.json({ status: "failed", contentId: purchase.contentId, contentTitle, creatorUsername });
    } else {
      return res.json({ status: "waiting_payment", contentId: purchase.contentId, contentTitle, creatorUsername });
    }
  } catch (err) {
    console.error("[Server] Status verification error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors de la v\xE9rification." });
  }
});
app.post("/api/payment/create-donation-cart", async (req, res) => {
  const { creatorId, amount, donorName, donorEmail, donorMessage } = req.body;
  if (!creatorId || !amount || !donorName) {
    return res.status(400).json({ error: "Champs obligatoires manquants (creatorId, amount, donorName)." });
  }
  const donationAmount = Math.round(Number(amount));
  if (!Number.isFinite(donationAmount) || donationAmount < 1e3) {
    return res.status(400).json({ error: "Le montant du don doit \xEAtre d'au moins 1000 FCFA." });
  }
  try {
    let creator = null;
    if (supabase) {
      const { data, error } = await supabase.from("creator_profiles").select("*").eq("id", creatorId).maybeSingle();
      if (error) {
        console.error("[Server] Supabase error fetching creator for donation:", error);
      }
      creator = data;
    }
    if (!creator) {
      const localCreators = serverDb.getCreators();
      creator = localCreators.find((c) => c.id === creatorId);
    }
    if (!creator) {
      return res.status(404).json({ error: "Cr\xE9ateur non trouv\xE9." });
    }
    const commission_amount = Math.round(donationAmount * 0.1);
    const creator_net_amount = donationAmount - commission_amount;
    let donationId = `donation_${Math.random().toString(36).substring(2, 11)}`;
    if (supabaseAdmin) {
      try {
        const { data: donData, error: donErr } = await supabaseAdmin.from("donations").insert({
          creator_id: creatorId,
          donor_name: donorName,
          donor_email: donorEmail || null,
          donor_message: donorMessage || null,
          status: "pending",
          amount_fcfa: donationAmount,
          commission_amount_fcfa: commission_amount,
          creator_net_amount_fcfa: creator_net_amount,
          payment_reference: "temp_ref_" + Date.now()
        }).select().single();
        if (!donErr && donData) {
          donationId = donData.id;
        } else {
          console.error("[Server] Supabase donation insertion warning:", donErr);
        }
      } catch (dbErr) {
        console.error("[Server] DB writing exception:", dbErr);
      }
    }
    serverDb.addDonation({
      id: donationId,
      creatorId,
      donorName,
      donorEmail,
      donorMessage,
      status: "pending",
      paymentReference: "",
      amount: donationAmount,
      commissionAmount: commission_amount,
      creatorNetAmount: creator_net_amount
    });
    const isMaketouConfigured = process.env.MAKETOU_API_KEY && process.env.MAKETOU_PRODUCT_ID;
    if (isMaketouConfigured) {
      const appUrl = getAppUrl();
      const redirectURL = `${appUrl}/payment/confirm?purchaseId=${donationId}&kind=donation`;
      const [donorFirstName, ...rest] = donorName.trim().split(" ");
      const donorLastName = rest.join(" ") || donorFirstName;
      const requestBody = {
        productDocumentId: process.env.MAKETOU_PRODUCT_ID,
        email: donorEmail || "anonyme@momolink.pro",
        firstName: donorFirstName,
        lastName: donorLastName,
        customerPrice: donationAmount,
        redirectURL,
        meta: { donationId, creatorId }
      };
      const maketouRes = await fetch("https://api.maketou.net/api/v1/stores/cart/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MAKETOU_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });
      if (!maketouRes.ok) {
        const errorText = await maketouRes.text();
        console.error("[Server] Maketou API error (donation):", errorText);
        throw new Error(`Erreur Maketou API: ${maketouRes.statusText}`);
      }
      const maketouData = await maketouRes.json();
      const cart = maketouData.cart || maketouData || {};
      const cartId = cart.id || cart.cartId || cart.uuid || maketouData.id || maketouData.cartId || maketouData.cart_id || maketouData.uuid;
      const redirectUrl = maketouData.redirectUrl || maketouData.checkoutUrl || maketouData.checkout_url || maketouData.url || maketouData.paymentUrl || maketouData.payment_url || cart.redirectUrl || cart.checkoutUrl || cart.checkout_url || cart.url || cart.paymentUrl || cart.payment_url;
      if (!cartId || !redirectUrl) {
        console.error("[Server] Missing keys in Maketou donation response. Full response:", JSON.stringify(maketouData));
        throw new Error(`Donn\xE9es de panier ou d'URL de redirection manquantes dans la r\xE9ponse Maketou. R\xE9ponse re\xE7ue: ${JSON.stringify(maketouData)}`);
      }
      serverDb.updateDonation(donationId, { paymentReference: cartId });
      serverDb.addTransaction({ provider: "maketou", providerTransactionId: cartId, status: "pending", type: "purchase" });
      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from("donations").update({ payment_reference: cartId }).eq("id", donationId);
        } catch (dbErr) {
          console.warn("[Server] Supabase donation reference update skipped:", dbErr);
        }
      }
      return res.json({ redirectUrl });
    } else {
      console.log("[Server] Maketou not configured. Simulating donation checkout redirect.");
      const mockCartId = `mock_cart_${Math.random().toString(36).substring(2, 11)}`;
      serverDb.updateDonation(donationId, { paymentReference: mockCartId });
      serverDb.addTransaction({ provider: "maketou", providerTransactionId: mockCartId, status: "pending", type: "purchase" });
      const appUrl = getAppUrl();
      const simulatedRedirectUrl = `${appUrl}/payment/confirm?cartId=${mockCartId}&purchaseId=${donationId}&kind=donation`;
      return res.json({ redirectUrl: simulatedRedirectUrl });
    }
  } catch (err) {
    console.error("[Server] Create Donation Cart handler error:", err);
    return res.status(500).json({ error: err.message || "Une erreur interne est survenue lors de l'initialisation du don." });
  }
});
app.get("/api/payment/check-donation-status", async (req, res) => {
  const { cartId, purchaseId } = req.query;
  if (!cartId || !purchaseId) {
    return res.status(400).json({ error: "Param\xE8tres cartId et purchaseId requis." });
  }
  try {
    const donation = await getDonationById(purchaseId);
    if (!donation) {
      return res.status(404).json({ error: "Don non trouv\xE9." });
    }
    let creatorUsername = "michella_coaching";
    if (supabase) {
      try {
        const { data: creatorData } = await supabase.from("creator_profiles").select("username").eq("id", donation.creatorId).maybeSingle();
        if (creatorData) creatorUsername = creatorData.username;
      } catch (err) {
        console.warn("[Server] Error fetching creator username inside check-donation-status:", err);
      }
    }
    const statusToSet = await fetchCartStatus(cartId);
    if (statusToSet === null) {
      return res.status(500).json({ error: "Impossible de v\xE9rifier le statut aupr\xE8s de Maketou." });
    }
    if (statusToSet === "completed") {
      await finalizeDonation(donation, cartId);
      return res.json({ status: "completed", creatorUsername, amount: donation.amount });
    } else if (statusToSet === "failed") {
      await markDonationFailed(donation, cartId);
      return res.json({ status: "failed", creatorUsername });
    } else {
      return res.json({ status: "waiting_payment", creatorUsername });
    }
  } catch (err) {
    console.error("[Server] Donation status verification error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors de la v\xE9rification." });
  }
});
app.post("/api/payment/create-anonymous-cart", async (req, res) => {
  try {
    const isMaketouConfigured = process.env.MAKETOU_API_KEY && process.env.MAKETOU_PRODUCT_ID;
    const price_amount = 2500;
    const buyerEmail = "anonymous-payment@example.com";
    const buyerFirstName = "Client";
    const buyerLastName = "Anonyme";
    if (isMaketouConfigured) {
      const appUrl = getAppUrl();
      const redirectURL = `${appUrl}/pay/confirm`;
      const requestBody = {
        productDocumentId: process.env.MAKETOU_PRODUCT_ID,
        email: buyerEmail,
        firstName: buyerFirstName,
        lastName: buyerLastName,
        customerPrice: price_amount,
        redirectURL,
        meta: { isAnonymous: true }
      };
      console.log("[Server] Requesting anonymous Maketou checkout:", requestBody);
      const maketouRes = await fetch("https://api.maketou.net/api/v1/stores/cart/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MAKETOU_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });
      if (!maketouRes.ok) {
        const errorText = await maketouRes.text();
        console.error("[Server] Anonymous Maketou API error:", errorText);
        throw new Error(`Erreur Maketou API: ${maketouRes.statusText}`);
      }
      const maketouData = await maketouRes.json();
      console.log("[Server] Anonymous Maketou Response:", maketouData);
      const cart = maketouData.cart || maketouData || {};
      const cartId = cart.id || cart.cartId || cart.uuid || maketouData.id || maketouData.cartId || maketouData.cart_id || maketouData.uuid;
      const redirectUrl = maketouData.redirectUrl || maketouData.checkoutUrl || maketouData.checkout_url || maketouData.url || maketouData.paymentUrl || maketouData.payment_url || cart.redirectUrl || cart.checkoutUrl || cart.checkout_url || cart.url || cart.paymentUrl || cart.payment_url;
      if (!cartId || !redirectUrl) {
        console.error("[Server] Missing keys in Maketou response. Full response:", JSON.stringify(maketouData));
        throw new Error(`Donn\xE9es de panier ou d'URL de redirection manquantes dans la r\xE9ponse Maketou.`);
      }
      return res.json({ redirectUrl, cartId });
    } else {
      console.log("[Server] Maketou not configured. Simulating anonymous checkout.");
      const mockCartId = `mock_cart_anon_${Math.random().toString(36).substring(2, 11)}`;
      const appUrl = getAppUrl();
      const simulatedRedirectUrl = `${appUrl}/pay/confirm?cartId=${mockCartId}`;
      return res.json({ redirectUrl: simulatedRedirectUrl, cartId: mockCartId });
    }
  } catch (err) {
    console.error("[Server] Create Anonymous Cart error:", err);
    return res.status(500).json({ error: err.message || "Une erreur interne est survenue lors de l'initialisation." });
  }
});
app.get("/api/payment/check-anonymous-status", async (req, res) => {
  const { cartId } = req.query;
  if (!cartId) {
    return res.status(400).json({ error: "Param\xE8tre cartId requis." });
  }
  try {
    const isMock = cartId.startsWith("mock_") || !process.env.MAKETOU_API_KEY;
    if (isMock) {
      return res.json({ status: "completed" });
    } else {
      console.log(`[Server] Polling Maketou status for anonymous cart ${cartId}`);
      const maketouRes = await fetch(`https://api.maketou.net/api/v1/stores/cart/${cartId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.MAKETOU_API_KEY}`
        }
      });
      if (!maketouRes.ok) {
        console.error("[Server] Anonymous Maketou status check error:", maketouRes.statusText);
        return res.status(500).json({ error: "Impossible de v\xE9rifier le statut aupr\xE8s de Maketou." });
      }
      const cartData = await maketouRes.json();
      console.log("[Server] Anonymous Maketou Cart status details:", cartData);
      const cartStatus = cartData.status || cartData.cart?.status;
      let statusToReturn = "waiting_payment";
      if (cartStatus === "completed" || cartStatus === "success") {
        statusToReturn = "completed";
      } else if (cartStatus === "payment_failed" || cartStatus === "failed" || cartStatus === "abandoned") {
        statusToReturn = "failed";
      }
      return res.json({ status: statusToReturn });
    }
  } catch (err) {
    console.error("[Server] Anonymous status verification error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors de la v\xE9rification." });
  }
});
app.get("/api/payment/access-list", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }
  try {
    const activePurchases = await getCompletedPurchasesByEmail(email);
    const contentIds = activePurchases.map((p) => p.contentId);
    return res.json({ contentIds });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.get("/api/payment/access", async (req, res) => {
  const { contentId, email } = req.query;
  if (!contentId || !email) {
    return res.status(400).json({ error: "Champs contentId et email requis." });
  }
  try {
    const purchases = await getCompletedPurchasesByEmail(email);
    const hasAccess = purchases.some((p) => p.contentId === contentId);
    if (!hasAccess) {
      return res.json({ hasAccess: false });
    }
    let fileUrl = "";
    if (supabase) {
      const { data } = await supabase.from("contents").select("file_url").eq("id", contentId).maybeSingle();
      if (data) {
        fileUrl = data.file_url;
      }
    }
    if (!fileUrl) {
      const defaults = {
        "1": "https://example.com/secured/guide-tiktok.pdf",
        "2": "https://example.com/secured/notion-template.zip",
        "3": "https://example.com/secured/masterclass-algo.mp4"
      };
      fileUrl = defaults[contentId] || "https://example.com/secured/content.zip";
    }
    let signedUrl = fileUrl;
    if (supabase && fileUrl) {
      try {
        let storagePath = fileUrl;
        if (fileUrl.includes("/storage/v1/object/private/contents/")) {
          storagePath = fileUrl.split("/storage/v1/object/private/contents/")[1];
        } else if (fileUrl.includes("/storage/v1/object/public/contents/")) {
          storagePath = fileUrl.split("/storage/v1/object/public/contents/")[1];
        } else if (fileUrl.startsWith("http")) {
          const parsed = new URL(fileUrl);
          const paths = parsed.pathname.split("/");
          storagePath = paths[paths.length - 1];
        }
        const { data, error } = await supabase.storage.from("contents").createSignedUrl(storagePath, 3600);
        if (!error && data?.signedUrl) {
          signedUrl = data.signedUrl;
        } else if (error) {
          console.warn("[Server] Supabase Storage signed URL generation error:", error.message);
        }
      } catch (err) {
        console.error("[Server] Exception generating signed URL:", err);
      }
    }
    return res.json({ hasAccess: true, signedUrl });
  } catch (err) {
    console.error("[Server] Access check error:", err);
    return res.status(500).json({ error: err.message || "Une erreur est survenue lors de la v\xE9rification des acc\xE8s." });
  }
});
async function isCreatorSubscribedServer(creatorId) {
  const graceLimit = new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3);
  if (supabaseAdmin) {
    try {
      const { data: currentCreator } = await supabaseAdmin.from("creator_profiles").select("user_id").eq("id", creatorId).maybeSingle();
      if (currentCreator?.user_id) {
        const userId = currentCreator.user_id;
        const { data: premiumProfiles } = await supabaseAdmin.from("creator_profiles").select("is_premium, premium_expires_at").eq("user_id", userId).eq("is_premium", true);
        const hasPremiumProfile = (premiumProfiles || []).some(
          (cp) => !cp.premium_expires_at || new Date(cp.premium_expires_at).getTime() > graceLimit.getTime()
        );
        if (hasPremiumProfile) {
          return true;
        }
        const { data: userProfiles } = await supabaseAdmin.from("creator_profiles").select("id").eq("user_id", userId);
        const profileIds = (userProfiles || []).map((p) => p.id);
        if (profileIds.length > 0) {
          const { data: subs, error } = await supabaseAdmin.from("subscriptions").select("end_date").in("creator_id", profileIds).eq("status", "active").gt("end_date", graceLimit.toISOString());
          if (!error && subs && subs.length > 0) {
            return true;
          }
        }
      }
    } catch (err) {
      console.warn("[Server] Supabase error in isCreatorSubscribedServer:", err);
    }
  }
  const localCreator = serverDb.getCreators().find((c) => c.id === creatorId);
  if (localCreator) {
    const userId = localCreator.user_id;
    const localUserCreators = serverDb.getCreators().filter((c) => c.user_id === userId);
    const anyPremium = localUserCreators.some((c) => c.is_premium);
    if (anyPremium) return true;
    for (const c of localUserCreators) {
      if (serverDb.isCreatorSubscribed(c.id)) {
        return true;
      }
    }
  }
  return false;
}
async function apply_subscription_expiry() {
  console.log("[Server] Running apply_subscription_expiry check...");
  const now = /* @__PURE__ */ new Date();
  const thresholdDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1e3);
  try {
    if (supabaseAdmin) {
      try {
        const { data: expiredSubs, error: subErr } = await supabaseAdmin.from("subscriptions").select("id, creator_id, end_date").eq("status", "active").lt("end_date", thresholdDate.toISOString());
        if (!subErr && expiredSubs && expiredSubs.length > 0) {
          for (const sub of expiredSubs) {
            const { data: creatorProfile } = await supabaseAdmin.from("creator_profiles").select("user_id, is_premium, premium_expires_at").eq("id", sub.creator_id).maybeSingle();
            if (creatorProfile) {
              const { data: userProfiles } = await supabaseAdmin.from("creator_profiles").select("id, is_premium, premium_expires_at").eq("user_id", creatorProfile.user_id);
              const hasPremium = (userProfiles || []).some(
                (cp) => cp.is_premium && (!cp.premium_expires_at || new Date(cp.premium_expires_at).getTime() > Date.now())
              );
              if (hasPremium) {
                console.log(`[Server] Skipping auto-drafting for user ${creatorProfile.user_id} due to premium profile`);
                continue;
              }
              const profileIds = (userProfiles || []).map((p) => p.id);
              if (profileIds.length > 0) {
                const { data: activeSubs } = await supabaseAdmin.from("subscriptions").select("id").in("creator_id", profileIds).eq("status", "active").gt("end_date", thresholdDate.toISOString()).neq("id", sub.id);
                if (activeSubs && activeSubs.length > 0) {
                  console.log(`[Server] Skipping auto-drafting for creator ${sub.creator_id} because another boutique has an active subscription`);
                  continue;
                }
              }
            }
            console.log(`[Server] Subscription ${sub.id} is expired past grace. Setting status and drafting contents.`);
            await supabaseAdmin.from("subscriptions").update({ status: "expired" }).eq("id", sub.id);
            const { error: draftErr } = await supabaseAdmin.from("contents").update({
              status: "draft",
              is_published: false,
              auto_drafted_by_subscription: true
            }).eq("creator_id", sub.creator_id).eq("status", "published");
            if (draftErr) {
              console.error(`[Server] Error auto-drafting content for creator ${sub.creator_id}:`, draftErr);
            }
          }
        }
      } catch (dbErr) {
        console.error("[Server] Supabase subscription expiry job warning:", dbErr);
      }
    }
    const localSubs = serverDb.getSubscriptions();
    const activeExpired = localSubs.filter((s) => s.status === "active" && new Date(s.endDate) < thresholdDate);
    for (const sub of activeExpired) {
      console.log(`[Server Local] Subscription ${sub.id} expired past grace.`);
      serverDb.updateSubscription(sub.id, { status: "expired" });
    }
  } catch (err) {
    console.error("[Server] apply_subscription_expiry error:", err);
  }
}
setInterval(apply_subscription_expiry, 60 * 60 * 1e3);
setTimeout(apply_subscription_expiry, 1e4);
var RECONCILE_MIN_AGE_MS = 2 * 60 * 1e3;
var RECONCILE_BATCH_SIZE = 50;
async function reconcilePendingPayments() {
  if (!supabaseAdmin) return { purchases: 0, donations: 0 };
  const olderThan = new Date(Date.now() - RECONCILE_MIN_AGE_MS).toISOString();
  let purchasesFixed = 0;
  let donationsFixed = 0;
  try {
    const { data: pendingPurchases } = await supabaseAdmin.from("purchases").select("*").eq("status", "pending").lt("created_at", olderThan).not("payment_reference", "like", "temp_ref_%").limit(RECONCILE_BATCH_SIZE);
    for (const row of pendingPurchases || []) {
      const purchase = mapPurchaseRow(row);
      if (!purchase.paymentReference) continue;
      const outcome = await fetchCartStatus(purchase.paymentReference);
      if (outcome === "completed") {
        await finalizePurchase(purchase, purchase.paymentReference);
        purchasesFixed++;
        console.log(`[Reconcile] Vente ${purchase.id} r\xE9cup\xE9r\xE9e (paiement confirm\xE9 c\xF4t\xE9 op\xE9rateur).`);
      } else if (outcome === "failed") {
        await markPurchaseFailed(purchase, purchase.paymentReference);
        console.log(`[Reconcile] Vente ${purchase.id} marqu\xE9e comme \xE9chou\xE9e.`);
      }
    }
    const { data: pendingDonations } = await supabaseAdmin.from("donations").select("*").eq("status", "pending").lt("created_at", olderThan).not("payment_reference", "like", "temp_ref_%").limit(RECONCILE_BATCH_SIZE);
    for (const row of pendingDonations || []) {
      const donation = {
        id: row.id,
        creatorId: row.creator_id,
        donorName: row.donor_name || "Un fan",
        donorEmail: row.donor_email || void 0,
        donorMessage: row.donor_message || void 0,
        status: row.status,
        paymentReference: row.payment_reference || "",
        amount: row.amount_fcfa || 0,
        commissionAmount: row.commission_amount_fcfa || 0,
        creatorNetAmount: row.creator_net_amount_fcfa || 0,
        createdAt: row.created_at
      };
      if (!donation.paymentReference) continue;
      const outcome = await fetchCartStatus(donation.paymentReference);
      if (outcome === "completed") {
        await finalizeDonation(donation, donation.paymentReference);
        donationsFixed++;
        console.log(`[Reconcile] Don ${donation.id} r\xE9cup\xE9r\xE9 (paiement confirm\xE9 c\xF4t\xE9 op\xE9rateur).`);
      } else if (outcome === "failed") {
        await markDonationFailed(donation, donation.paymentReference);
      }
    }
    if (purchasesFixed > 0 || donationsFixed > 0) {
      console.log(`[Reconcile] Termin\xE9 : ${purchasesFixed} vente(s) et ${donationsFixed} don(s) r\xE9cup\xE9r\xE9s.`);
    }
  } catch (err) {
    console.error("[Reconcile] Erreur pendant la r\xE9conciliation :", err);
  }
  return { purchases: purchasesFixed, donations: donationsFixed };
}
setInterval(reconcilePendingPayments, 5 * 60 * 1e3);
setTimeout(reconcilePendingPayments, 2e4);
app.get("/api/health", (_req, res) => {
  return res.json({
    ok: true,
    supabase: { configured: isSupabaseConfigured, serviceRole: supabaseAdmin !== supabase },
    maketou: { apiKey: !!process.env.MAKETOU_API_KEY, productId: !!process.env.MAKETOU_PRODUCT_ID },
    appUrl: getAppUrl(),
    vercel: !!process.env.VERCEL
  });
});
app.get("/api/cron/reconcile", async (req, res) => {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret) {
    const provided = req.headers.authorization?.replace(/^Bearer\s+/i, "") || req.query.secret;
    if (provided !== expectedSecret) {
      return res.status(401).json({ error: "Non autoris\xE9." });
    }
  }
  try {
    const result = await reconcilePendingPayments();
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("[Server] Cron reconcile error:", err);
    return res.status(500).json({ error: err.message || "Erreur pendant la r\xE9conciliation." });
  }
});
app.post("/api/subscription/create-cart", async (req, res) => {
  const { creatorId, buyerEmail, buyerFirstName, buyerLastName, buyerPhone } = req.body;
  if (!creatorId) {
    return res.status(400).json({ error: "creatorId est requis." });
  }
  try {
    const amount = SUBSCRIPTION_PRICE_FCFA;
    const productDocumentId = process.env.MAKETOU_PRODUCT_ID || "";
    const firstName = buyerFirstName || "Abonn\xE9";
    const lastName = buyerLastName || "Cr\xE9ateur";
    const email = buyerEmail || "abonne@momo.com";
    const hasMaketou = !!process.env.MAKETOU_API_KEY;
    let phoneToUse = (buyerPhone || "").replace(/[\s\-\(\)]/g, "");
    if (!phoneToUse || phoneToUse === "") {
      phoneToUse = "+221771234567";
    } else if (!phoneToUse.startsWith("+")) {
      phoneToUse = "+" + phoneToUse;
    }
    if (hasMaketou && productDocumentId) {
      const appUrl = getAppUrl();
      const redirectURL = `${appUrl}/subscription/confirm?creatorId=${creatorId}`;
      const body = {
        productDocumentId,
        email,
        firstName,
        lastName,
        phone: phoneToUse,
        customerPrice: amount,
        redirectURL,
        meta: {
          type: "subscription",
          creatorId
        }
      };
      console.log("[Server] Initializing Maketou Cart for Subscription:", body);
      const maketouRes = await fetch("https://api.maketou.net/api/v1/stores/cart/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MAKETOU_API_KEY}`
        },
        body: JSON.stringify(body)
      });
      if (!maketouRes.ok) {
        const errorText = await maketouRes.text();
        console.error("[Server] Maketou subscription cart creation failed:", errorText);
        throw new Error(`Erreur Maketou: ${errorText}`);
      }
      const maketouData = await maketouRes.json();
      const cart = maketouData.cart || maketouData || {};
      const cartId = cart.id || cart.cartId || cart.uuid || maketouData.id || maketouData.cartId || maketouData.cart_id || maketouData.uuid;
      const redirectUrlRaw = maketouData.redirectUrl || maketouData.checkoutUrl || maketouData.checkout_url || maketouData.url || maketouData.paymentUrl || maketouData.payment_url || cart.redirectUrl || cart.checkoutUrl || cart.checkout_url || cart.url || cart.paymentUrl || cart.payment_url;
      if (!cartId || !redirectUrlRaw) {
        throw new Error("Donn\xE9es de panier ou d'URL de redirection manquantes dans la r\xE9ponse Maketou.");
      }
      serverDb.addTransaction({
        provider: "maketou",
        providerTransactionId: cartId,
        status: "pending",
        type: "subscription"
      });
      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from("transactions").insert({
            provider: "maketou",
            provider_transaction_id: cartId,
            status: "pending",
            type: "subscription"
          });
        } catch (dbErr) {
          console.warn("[Server] Supabase subscription transaction warning:", dbErr);
        }
      }
      return res.json({ redirectUrl: redirectUrlRaw });
    } else {
      console.log("[Server] Maketou not configured. Simulating subscription redirect.");
      const mockCartId = `mock_sub_${Math.random().toString(36).substring(2, 11)}`;
      serverDb.addTransaction({
        provider: "maketou",
        providerTransactionId: mockCartId,
        status: "pending",
        type: "subscription"
      });
      const appUrl = getAppUrl();
      const simulatedRedirectUrl = `${appUrl}/subscription/confirm?cartId=${mockCartId}&creatorId=${creatorId}`;
      return res.json({ redirectUrl: simulatedRedirectUrl });
    }
  } catch (err) {
    console.error("[Server] Create Subscription Cart handler error:", err);
    return res.status(500).json({ error: err.message || "Une erreur interne est survenue." });
  }
});
app.get("/api/subscription/check-status", async (req, res) => {
  const { cartId, creatorId } = req.query;
  if (!cartId || !creatorId) {
    return res.status(400).json({ error: "Param\xE8tres cartId et creatorId requis." });
  }
  try {
    let statusToSet = "waiting_payment";
    const isMock = cartId.startsWith("mock_") || !process.env.MAKETOU_API_KEY;
    if (isMock) {
      statusToSet = "completed";
    } else {
      console.log(`[Server] Polling Maketou subscription status for cart ${cartId}`);
      const maketouRes = await fetch(`https://api.maketou.net/api/v1/stores/cart/${cartId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.MAKETOU_API_KEY}`
        }
      });
      if (!maketouRes.ok) {
        console.error("[Server] Maketou status check error:", maketouRes.statusText);
        return res.status(500).json({ error: "Impossible de v\xE9rifier le statut aupr\xE8s de Maketou." });
      }
      const cartData = await maketouRes.json();
      const cartStatus = cartData.status || cartData.cart?.status;
      if (cartStatus === "completed" || cartStatus === "success") {
        statusToSet = "completed";
      } else if (cartStatus === "payment_failed" || cartStatus === "failed" || cartStatus === "abandoned") {
        statusToSet = "failed";
      } else {
        statusToSet = "waiting_payment";
      }
    }
    if (statusToSet === "completed") {
      serverDb.updateTransactionByCart(cartId, { status: "success" });
      const startDate = /* @__PURE__ */ new Date();
      const endDate = /* @__PURE__ */ new Date();
      endDate.setDate(startDate.getDate() + 30);
      serverDb.addSubscription({
        creatorId,
        amountPaid: SUBSCRIPTION_PRICE_FCFA,
        currency: "XOF",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "active"
      });
      let restoredCount = 0;
      if (supabaseAdmin) {
        try {
          const { data: contentsToRestore } = await supabaseAdmin.from("contents").select("id").eq("creator_id", creatorId).eq("auto_drafted_by_subscription", true);
          restoredCount = contentsToRestore?.length || 0;
          await supabaseAdmin.from("contents").update({
            status: "published",
            is_published: true,
            auto_drafted_by_subscription: false
          }).eq("creator_id", creatorId).eq("auto_drafted_by_subscription", true);
          await supabaseAdmin.from("subscriptions").insert({
            creator_id: creatorId,
            amount_paid: SUBSCRIPTION_PRICE_FCFA,
            currency: "XOF",
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            status: "active"
          });
          try {
            await supabaseAdmin.from("transactions").insert({
              provider: "maketou",
              provider_transaction_id: cartId,
              status: "success",
              type: "subscription"
            });
          } catch (txErr) {
            await supabaseAdmin.from("transactions").update({ status: "success" }).eq("provider_transaction_id", cartId);
          }
        } catch (dbErr) {
          console.error("[Server] Supabase subscription completed warning:", dbErr);
        }
      }
      serverDb.addNotification({
        userId: creatorId,
        type: "system",
        title: "Abonnement activ\xE9 !",
        message: `Votre abonnement de 5 000 FCFA est actif jusqu'au ${endDate.toLocaleDateString("fr-FR")}.`
      });
      return res.json({
        status: "completed",
        endDate: endDate.toISOString(),
        restoredCount
      });
    } else if (statusToSet === "failed") {
      serverDb.updateTransactionByCart(cartId, { status: "failed" });
      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from("transactions").update({ status: "failed" }).eq("provider_transaction_id", cartId);
        } catch (e) {
        }
      }
      return res.json({ status: "failed" });
    } else {
      return res.json({ status: "waiting_payment" });
    }
  } catch (err) {
    console.error("[Server] Check subscription status error:", err);
    return res.status(500).json({ error: err.message || "Une erreur est survenue." });
  }
});
app.get("/api/subscription/status", async (req, res) => {
  const { creatorId } = req.query;
  if (!creatorId) {
    return res.status(400).json({ error: "creatorId est requis." });
  }
  try {
    let subscriptionsList = [];
    let isPremiumFromProfile = false;
    let premiumExpiresAt = null;
    let userId = "";
    if (supabase) {
      try {
        const { data: currentProfile } = await supabase.from("creator_profiles").select("user_id").eq("id", creatorId).maybeSingle();
        if (currentProfile) {
          userId = currentProfile.user_id;
          const { data: userProfiles } = await supabase.from("creator_profiles").select("id, is_premium, premium_expires_at").eq("user_id", userId);
          const anyPremium = (userProfiles || []).find((p) => p.is_premium);
          if (anyPremium) {
            isPremiumFromProfile = true;
            premiumExpiresAt = anyPremium.premium_expires_at;
          }
          const profileIds = (userProfiles || []).map((p) => p.id);
          if (profileIds.length > 0) {
            const { data, error } = await supabase.from("subscriptions").select("*").in("creator_id", profileIds).order("created_at", { ascending: false });
            if (!error && data) {
              subscriptionsList = data;
            }
          }
        }
      } catch (err) {
        console.warn("[Server] Supabase error loading subscriptions:", err);
      }
    } else {
      const creator = serverDb.getCreators().find((c) => c.id === creatorId);
      if (creator) {
        userId = creator.user_id;
        const userProfiles = serverDb.getCreators().filter((c) => c.user_id === userId);
        const anyPremium = userProfiles.find((p) => p.is_premium);
        if (anyPremium) {
          isPremiumFromProfile = true;
          premiumExpiresAt = anyPremium.premium_expires_at || null;
        }
        userProfiles.forEach((p) => {
          const localSubs2 = serverDb.getCreatorSubscriptions(p.id);
          localSubs2.forEach((s) => {
            subscriptionsList.push({
              id: s.id,
              creator_id: s.creatorId,
              transaction_id: s.transactionId,
              amount_paid: s.amountPaid,
              currency: s.currency,
              start_date: s.startDate,
              end_date: s.endDate,
              status: s.status,
              created_at: s.createdAt
            });
          });
        });
        subscriptionsList.sort((a, b) => b.created_at.localeCompare(a.created_at));
      }
    }
    const localSubs = subscriptionsList.length === 0 ? serverDb.getCreatorSubscriptions(creatorId) : [];
    if (subscriptionsList.length === 0 && localSubs.length > 0) {
      subscriptionsList = localSubs.map((s) => ({
        id: s.id,
        creator_id: s.creatorId,
        transaction_id: s.transactionId,
        amount_paid: s.amountPaid,
        currency: s.currency,
        start_date: s.startDate,
        end_date: s.endDate,
        status: s.status,
        created_at: s.createdAt
      }));
    }
    let activeSub = subscriptionsList.find((s) => s.status === "active");
    if (!activeSub && isPremiumFromProfile) {
      activeSub = {
        id: "sub_profile_premium",
        creator_id: creatorId,
        amount_paid: SUBSCRIPTION_PRICE_FCFA,
        currency: "XOF",
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString(),
        end_date: premiumExpiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString(),
        status: "active",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString()
      };
      subscriptionsList.unshift(activeSub);
    }
    let autoDraftedCount = 0;
    if (supabase) {
      try {
        const { count } = await supabase.from("contents").select("id", { count: "exact", head: true }).eq("creator_id", creatorId).eq("auto_drafted_by_subscription", true);
        autoDraftedCount = count || 0;
      } catch (e) {
      }
    }
    return res.json({
      subscriptions: subscriptionsList,
      activeSubscription: activeSub || null,
      autoDraftedCount
    });
  } catch (err) {
    console.error("[Server] Get subscription status error:", err);
    return res.status(500).json({ error: err.message || "Une erreur est survenue." });
  }
});
app.get("/api/subscription/check-subscribed", async (req, res) => {
  const { creatorId } = req.query;
  if (!creatorId) {
    return res.status(400).json({ error: "creatorId est requis." });
  }
  try {
    const subscribed = await isCreatorSubscribedServer(creatorId);
    return res.json({ subscribed });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.post("/api/subscription/apply-expiry", async (req, res) => {
  try {
    await apply_subscription_expiry();
    return res.json({ success: true, message: "Expiration check completed." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.get("/api/portal/verify", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }
  try {
    const purchases = await getCompletedPurchasesByEmail(email);
    return res.json({ exists: purchases.length > 0 });
  } catch (err) {
    console.error("[Server] Portal verify error:", err);
    return res.status(500).json({ error: "Une erreur est survenue lors de la v\xE9rification de l'email." });
  }
});
app.get("/api/portal/purchases", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }
  try {
    const purchases = await getCompletedPurchasesByEmail(email);
    if (purchases.length === 0) {
      return res.json([]);
    }
    const contentIds = Array.from(new Set(purchases.map((p) => p.contentId)));
    let fetchedContents = [];
    if (supabase && contentIds.length > 0) {
      const { data, error } = await supabase.from("contents").select("*, creator_profiles(*)").in("id", contentIds);
      if (!error && data) {
        fetchedContents = data;
      }
    }
    const localContents = [
      {
        id: "1",
        creator_id: "creator_1",
        title: "Pack PDF : Booster son audience TikTok en 30 jours",
        content_type: "pdf",
        preview_url: null,
        price_fcfa: 2500,
        creator_profiles: {
          id: "creator_1",
          username: "michella_coaching",
          display_name: "Michella Coaching",
          avatar_url: null
        }
      },
      {
        id: "2",
        creator_id: "creator_1",
        title: "Template Notion : Organiser ses tournages Reels & TikTok",
        content_type: "pdf",
        preview_url: null,
        price_fcfa: 1500,
        creator_profiles: {
          id: "creator_1",
          username: "michella_coaching",
          display_name: "Michella Coaching",
          avatar_url: null
        }
      },
      {
        id: "3",
        creator_id: "creator_1",
        title: "Masterclass : D\xE9cryptage de l'Algorithme 2026 (Vid\xE9o 20m)",
        content_type: "video",
        preview_url: null,
        price_fcfa: 5e3,
        creator_profiles: {
          id: "creator_1",
          username: "michella_coaching",
          display_name: "Michella Coaching",
          avatar_url: null
        }
      }
    ];
    const contentsMap = /* @__PURE__ */ new Map();
    for (const item of localContents) {
      contentsMap.set(item.id, item);
    }
    for (const item of fetchedContents) {
      contentsMap.set(item.id, {
        id: item.id,
        creator_id: item.creator_id,
        title: item.title,
        content_type: item.content_type,
        preview_url: item.preview_url,
        price_fcfa: item.price_fcfa,
        creator_profiles: item.creator_profiles ? {
          id: item.creator_profiles.id,
          username: item.creator_profiles.username,
          display_name: item.creator_profiles.display_name,
          avatar_url: item.creator_profiles.avatar_url
        } : null
      });
    }
    const creatorGroupsMap = /* @__PURE__ */ new Map();
    for (const p of purchases) {
      const content = contentsMap.get(p.contentId) || {
        id: p.contentId,
        title: "Contenu exclusif d\xE9bloqu\xE9",
        content_type: "pdf",
        preview_url: null,
        price_fcfa: p.amountPaid,
        creator_profiles: {
          id: "creator_unknown",
          username: "unknown_creator",
          display_name: "Cr\xE9ateur Exclusif",
          avatar_url: null
        }
      };
      const creator = content.creator_profiles || {
        id: content.creator_id || "creator_unknown",
        username: "unknown_creator",
        display_name: "Cr\xE9ateur Exclusif",
        avatar_url: null
      };
      const creatorId = creator.id;
      if (!creatorGroupsMap.has(creatorId)) {
        creatorGroupsMap.set(creatorId, {
          creator: {
            id: creatorId,
            username: creator.username,
            display_name: creator.display_name,
            avatar_url: creator.avatar_url
          },
          purchases: []
        });
      }
      creatorGroupsMap.get(creatorId).purchases.push({
        purchaseId: p.id,
        contentId: p.contentId,
        title: content.title,
        content_type: content.content_type || "pdf",
        preview_url: content.preview_url,
        price_fcfa: p.amountPaid,
        purchased_at: p.purchasedAt || p.createdAt
      });
    }
    return res.json(Array.from(creatorGroupsMap.values()));
  } catch (err) {
    console.error("[Server] Portal purchases error:", err);
    return res.status(500).json({ error: "Une erreur est survenue lors de la r\xE9cup\xE9ration des achats." });
  }
});
app.get("/api/portal/creator-purchases", async (req, res) => {
  const { email, creatorId } = req.query;
  if (!email || !creatorId) {
    return res.status(400).json({ error: "Champs email et creatorId requis." });
  }
  try {
    const emailStr = email.toLowerCase().trim();
    const purchases = serverDb.getPurchases().filter(
      (p) => p.buyerEmail.toLowerCase() === emailStr && p.status === "completed"
    );
    if (purchases.length === 0) {
      return res.json({ purchasedContentIds: [] });
    }
    const contentIds = purchases.map((p) => p.contentId);
    let creatorContentIds = [];
    if (supabase) {
      const { data, error } = await supabase.from("contents").select("id").eq("creator_id", creatorId).in("id", contentIds);
      if (!error && data) {
        creatorContentIds = data.map((c) => c.id);
      }
    }
    const localContentCreatorMap = {
      "1": "creator_1",
      "2": "creator_1",
      "3": "creator_1"
    };
    const finalIds = /* @__PURE__ */ new Set();
    const purchaseMap = {};
    for (const id of creatorContentIds) {
      finalIds.add(id);
    }
    for (const p of purchases) {
      const cid = p.contentId;
      purchaseMap[cid] = p.id;
      if (localContentCreatorMap[cid] === creatorId) {
        finalIds.add(cid);
      }
    }
    return res.json({ purchasedContentIds: Array.from(finalIds), purchaseMap });
  } catch (err) {
    console.error("[Server] Portal creator purchases error:", err);
    return res.status(500).json({ error: "Une erreur est survenue lors de la v\xE9rification des achats cr\xE9ateur." });
  }
});
var adminMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminEmail = process.env.ADMIN_EMAIL || "bigardlamine@gmail.com";
  if (!supabase) {
    return next();
  }
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non autoris\xE9 : En-t\xEAte Authorization manquant ou invalide." });
  }
  const token = authHeader.slice(7);
  if (token === adminEmail && process.env.NODE_ENV !== "production") {
    return next();
  }
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.error("[Admin Auth] Supabase getUser error:", error);
      return res.status(401).json({ error: "Non autoris\xE9 : Token invalide ou expir\xE9." });
    }
    if (user.email !== adminEmail) {
      console.warn(`[Admin Auth] Access forbidden: logged in as ${user.email} but expected ${adminEmail}`);
      return res.status(403).json({ error: "Interdit : Vous n'avez pas les droits d'administration." });
    }
    return next();
  } catch (err) {
    console.error("[Admin Auth] Exception verifying token:", err);
    return res.status(500).json({ error: "Erreur interne lors de la validation des droits admin." });
  }
};
app.use("/api/admin", adminMiddleware);
app.get("/api/admin/check", (req, res) => {
  return res.json({ isAdmin: true });
});
var getCreatorBalance = async (creatorId) => {
  if (supabaseAdmin) {
    const { data: contents } = await supabaseAdmin.from("contents").select("id").eq("creator_id", creatorId);
    const contentIds = (contents || []).map((c) => c.id);
    let earnings = 0;
    if (contentIds.length > 0) {
      const { data: purchases } = await supabaseAdmin.from("purchases").select("creator_net_amount_fcfa").eq("status", "completed").in("content_id", contentIds);
      earnings = (purchases || []).reduce((sum, p) => sum + (p.creator_net_amount_fcfa || 0), 0);
    }
    const { data: withdrawals } = await supabaseAdmin.from("withdrawals").select("amount_requested").eq("creator_id", creatorId).in("status", ["pending", "approved", "paid"]);
    const withdrawn = (withdrawals || []).reduce((sum, w) => sum + (w.amount_requested || 0), 0);
    return Math.max(0, earnings - withdrawn);
  } else {
    const purchases = serverDb.getPurchases();
    const localContentCreatorMap = {
      "1": "creator_1",
      "2": "creator_1",
      "3": "creator_1"
    };
    const earnings = purchases.filter((p) => p.status === "completed" && localContentCreatorMap[p.contentId] === creatorId).reduce((sum, p) => sum + (p.creatorNetAmount || 0), 0);
    const withdrawals = serverDb.getWithdrawals();
    const withdrawn = withdrawals.filter((w) => w.creator_id === creatorId && ["pending", "approved", "paid"].includes(w.status)).reduce((sum, w) => sum + (w.amount_requested || 0), 0);
    return Math.max(0, earnings - withdrawn);
  }
};
app.get("/api/admin/kpis", async (req, res) => {
  try {
    const startOfMonth = /* @__PURE__ */ new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthStr = startOfMonth.toISOString();
    let activeCreatorsCount = 0;
    let platformEarnings = 0;
    let totalVolume = 0;
    let pendingWithdrawalsCount = 0;
    let usedFallback = false;
    let uniqueUsersCount = 0;
    let totalShopsCount = 0;
    let avgShopsPerUser = 0;
    let topShopsForMultiShopUsers = [];
    if (supabaseAdmin) {
      try {
        const { contentIds: testContentIds } = await getTestAccountIds();
        const { count: activeCreators, error: err1 } = await supabaseAdmin.from("creator_profiles").select("*", { count: "exact", head: true }).eq("status", "active");
        if (err1) throw err1;
        activeCreatorsCount = activeCreators || 0;
        const { data: monthPurchases, error: err2 } = await supabaseAdmin.from("purchases").select("commission_amount_fcfa, amount_paid_fcfa, content_id").eq("status", "completed").gte("created_at", startOfMonthStr);
        if (err2) throw err2;
        const realMonthPurchases = (monthPurchases || []).filter((p) => !testContentIds.has(p.content_id));
        platformEarnings = realMonthPurchases.reduce((sum, p) => sum + (p.commission_amount_fcfa || 0), 0);
        totalVolume = realMonthPurchases.reduce((sum, p) => sum + (p.amount_paid_fcfa || 0), 0);
        const { count: pendingWithdrawals, error: err3 } = await supabaseAdmin.from("withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending");
        if (err3) throw err3;
        pendingWithdrawalsCount = pendingWithdrawals || 0;
        const { data: allProfiles } = await supabaseAdmin.from("creator_profiles").select("id, user_id, username, display_name, status");
        const { data: allPurchases } = await supabaseAdmin.from("purchases").select("creator_id, amount_paid_fcfa").eq("status", "completed");
        const profiles = allProfiles || [];
        const purchases = allPurchases || [];
        totalShopsCount = profiles.length;
        const uniqueUsers = new Set(profiles.map((p) => p.user_id));
        uniqueUsersCount = uniqueUsers.size;
        avgShopsPerUser = uniqueUsersCount > 0 ? Number((totalShopsCount / uniqueUsersCount).toFixed(2)) : 0;
        const revenueMap = {};
        purchases.forEach((p) => {
          revenueMap[p.creator_id] = (revenueMap[p.creator_id] || 0) + (p.amount_paid_fcfa || 0);
        });
        const userShops = {};
        profiles.forEach((p) => {
          const rev = revenueMap[p.id] || 0;
          if (!userShops[p.user_id]) {
            userShops[p.user_id] = [];
          }
          userShops[p.user_id].push({
            id: p.id,
            username: p.username,
            displayName: p.display_name,
            revenue: rev
          });
        });
        Object.entries(userShops).forEach(([userId, shops]) => {
          if (shops.length > 1) {
            let maxRevShop = shops[0];
            shops.forEach((s) => {
              if (s.revenue > maxRevShop.revenue) {
                maxRevShop = s;
              }
            });
            topShopsForMultiShopUsers.push({
              userId,
              displayName: maxRevShop.displayName || "Sans Nom",
              username: maxRevShop.username,
              revenue: maxRevShop.revenue,
              totalShopsCount: shops.length
            });
          }
        });
      } catch (dbErr) {
        console.warn("[Server] Supabase query failed for KPIs, falling back to mock data:", dbErr);
        usedFallback = true;
      }
    }
    if (!supabaseAdmin || usedFallback) {
      const creators = serverDb.getCreators();
      activeCreatorsCount = creators.filter((c) => c.status === "active").length;
      const purchases = serverDb.getPurchases();
      const monthPurchases = purchases.filter((p) => p.status === "completed" && p.createdAt >= startOfMonthStr);
      platformEarnings = monthPurchases.reduce((sum, p) => sum + (p.commissionAmount || 0), 0);
      totalVolume = monthPurchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
      const withdrawals = serverDb.getWithdrawals();
      pendingWithdrawalsCount = withdrawals.filter((w) => w.status === "pending").length;
      totalShopsCount = creators.length;
      const uniqueUsers = new Set(creators.map((c) => c.user_id));
      uniqueUsersCount = uniqueUsers.size;
      avgShopsPerUser = uniqueUsersCount > 0 ? Number((totalShopsCount / uniqueUsersCount).toFixed(2)) : 0;
      const completedPurchases = purchases.filter((p) => p.status === "completed");
      const revenueMap = {};
      completedPurchases.forEach((p) => {
        const cId = p.contentId === "3e1df9e1-7c23-4bf5-b8a7-c5d55be5e32a" ? "creator_1" : "creator_1";
        revenueMap[cId] = (revenueMap[cId] || 0) + (p.amountPaid || 0);
      });
      const userShops = {};
      creators.forEach((c) => {
        const rev = revenueMap[c.id] || 0;
        if (!userShops[c.user_id]) {
          userShops[c.user_id] = [];
        }
        userShops[c.user_id].push({
          id: c.id,
          username: c.username,
          displayName: c.display_name,
          revenue: rev
        });
      });
      Object.entries(userShops).forEach(([userId, shops]) => {
        if (shops.length > 1) {
          let maxRevShop = shops[0];
          shops.forEach((s) => {
            if (s.revenue > maxRevShop.revenue) {
              maxRevShop = s;
            }
          });
          topShopsForMultiShopUsers.push({
            userId,
            displayName: maxRevShop.displayName || "Sans Nom",
            username: maxRevShop.username,
            revenue: maxRevShop.revenue,
            totalShopsCount: shops.length
          });
        }
      });
    }
    return res.json({
      activeCreators: activeCreatorsCount,
      platformEarnings,
      totalVolume,
      pendingWithdrawals: pendingWithdrawalsCount,
      uniqueUsersCount,
      totalShopsCount,
      avgShopsPerUser,
      topShopsForMultiShopUsers,
      isDemoMode: !supabaseAdmin || usedFallback
    });
  } catch (err) {
    console.error("[Server] Admin KPIs error:", err);
    return res.status(500).json({ error: "Erreur lors du calcul des KPIs." });
  }
});
app.get("/api/admin/chart", async (req, res) => {
  try {
    const range = req.query.range || "30d";
    const customStart = req.query.start;
    const customEnd = req.query.end;
    const now = /* @__PURE__ */ new Date();
    now.setHours(23, 59, 59, 999);
    let startDate;
    let endDate = now;
    if (range === "custom" && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const daysBack = range === "7d" ? 6 : range === "30d" ? 29 : range === "90d" ? 89 : 364;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - daysBack);
      startDate.setHours(0, 0, 0, 0);
    }
    if (startDate > endDate) [startDate, endDate] = [endDate, startDate];
    const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 864e5) + 1);
    const granularity = totalDays <= 31 ? "day" : totalDays <= 180 ? "week" : "month";
    const buckets = [];
    if (granularity === "month") {
      const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      while (cursor <= endDate) {
        buckets.push({
          date: cursor.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
          bucketStart: new Date(cursor),
          revenu: 0
        });
        cursor.setMonth(cursor.getMonth() + 1);
      }
    } else {
      const step = granularity === "week" ? 7 : 1;
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        buckets.push({
          date: granularity === "week" ? `Sem. du ${cursor.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : cursor.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
          bucketStart: new Date(cursor),
          revenu: 0
        });
        cursor.setDate(cursor.getDate() + step);
      }
    }
    const findBucketIndex = (d) => {
      for (let idx = buckets.length - 1; idx >= 0; idx--) {
        if (d >= buckets[idx].bucketStart) return idx;
      }
      return -1;
    };
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    let usedFallback = false;
    if (supabaseAdmin) {
      try {
        const { contentIds: testContentIds } = await getTestAccountIds();
        const { data: purchases, error: err1 } = await supabaseAdmin.from("purchases").select("commission_amount_fcfa, created_at, content_id").eq("status", "completed").gte("created_at", startDateStr).lte("created_at", endDateStr);
        if (err1) throw err1;
        (purchases || []).filter((p) => !testContentIds.has(p.content_id)).forEach((p) => {
          const idx = findBucketIndex(new Date(p.created_at));
          if (idx >= 0) buckets[idx].revenu += p.commission_amount_fcfa || 0;
        });
      } catch (dbErr) {
        console.warn("[Server] Supabase query failed for chart, falling back to mock data:", dbErr);
        usedFallback = true;
      }
    }
    if (!supabaseAdmin || usedFallback) {
      const purchases = serverDb.getPurchases();
      purchases.filter((p) => p.status === "completed" && p.createdAt >= startDateStr && p.createdAt <= endDateStr).forEach((p) => {
        const idx = findBucketIndex(new Date(p.createdAt));
        if (idx >= 0) buckets[idx].revenu += p.commissionAmount || 0;
      });
    }
    return res.json(buckets.map((b) => ({ date: b.date, revenu: b.revenu })));
  } catch (err) {
    console.error("[Server] Admin chart error:", err);
    return res.status(500).json({ error: "Erreur lors de la g\xE9n\xE9ration du graphique." });
  }
});
app.get("/api/admin/creators", async (req, res) => {
  try {
    const search = (req.query.search || "").toLowerCase().trim();
    const testOnly = req.query.testOnly === "true";
    let resultCreators = [];
    let usedFallback = false;
    if (supabaseAdmin) {
      try {
        let query = supabaseAdmin.from("creator_profiles").select("*").order("created_at", { ascending: false });
        if (testOnly) query = query.eq("is_test_account", true);
        const { data: creators, error } = await query;
        if (error) throw error;
        resultCreators = creators || [];
      } catch (dbErr) {
        console.warn("[Server] Supabase query failed for creators, falling back to mock data:", dbErr);
        usedFallback = true;
      }
    }
    if (!supabaseAdmin || usedFallback) {
      resultCreators = [...serverDb.getCreators()].sort((a, b) => b.created_at.localeCompare(a.created_at));
      if (testOnly) resultCreators = resultCreators.filter((c) => c.is_test_account);
    }
    const creatorStatsList = await Promise.all(resultCreators.map(async (creator) => {
      let activeSubStatus = "none";
      let subscriptionExpiry = null;
      if (supabaseAdmin && !usedFallback) {
        try {
          const { data: userProfiles } = await supabaseAdmin.from("creator_profiles").select("id, is_premium, premium_expires_at").eq("user_id", creator.user_id);
          const profileIds = (userProfiles || []).map((p) => p.id);
          let subs = [];
          if (profileIds.length > 0) {
            const { data } = await supabaseAdmin.from("subscriptions").select("end_date, status").in("creator_id", profileIds).order("end_date", { ascending: false });
            subs = data || [];
          }
          const latestSub = subs && subs[0];
          if (latestSub) {
            const now = /* @__PURE__ */ new Date();
            const endDate = new Date(latestSub.end_date);
            const graceLimit = now.getTime() - 3 * 24 * 60 * 60 * 1e3;
            if (latestSub.status === "active" && endDate.getTime() > now.getTime()) {
              activeSubStatus = "active";
            } else if (latestSub.status === "active" && endDate.getTime() > graceLimit) {
              activeSubStatus = "grace";
            } else {
              activeSubStatus = "expired";
            }
            subscriptionExpiry = latestSub.end_date;
          }
          const anyPremiumProfile = (userProfiles || []).find((p) => p.is_premium);
          if (anyPremiumProfile && activeSubStatus !== "active") {
            activeSubStatus = "active";
            subscriptionExpiry = anyPremiumProfile.premium_expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
          }
        } catch (subErr) {
          console.warn("[Server] Subscriptions query failed for creator", creator.id, subErr);
        }
      } else {
        const userId = creator.user_id;
        const localUserCreators = serverDb.getCreators().filter((c) => c.user_id === userId);
        let subs = [];
        localUserCreators.forEach((c) => {
          subs = [...subs, ...serverDb.getCreatorSubscriptions(c.id)];
        });
        const latestSub = subs.sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
        if (latestSub) {
          const now = /* @__PURE__ */ new Date();
          const endDate = new Date(latestSub.endDate);
          const graceLimit = now.getTime() - 3 * 24 * 60 * 60 * 1e3;
          if (latestSub.status === "active" && endDate.getTime() > now.getTime()) {
            activeSubStatus = "active";
          } else if (latestSub.status === "active" && endDate.getTime() > graceLimit) {
            activeSubStatus = "grace";
          } else {
            activeSubStatus = "expired";
          }
          subscriptionExpiry = latestSub.endDate;
        }
        const anyPremiumLocal = localUserCreators.find((c) => c.is_premium);
        if (anyPremiumLocal && activeSubStatus !== "active") {
          activeSubStatus = "active";
          subscriptionExpiry = anyPremiumLocal.premium_expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
        }
      }
      let contentCount = 0;
      if (supabaseAdmin && !usedFallback) {
        try {
          const { count } = await supabaseAdmin.from("contents").select("*", { count: "exact", head: true }).eq("creator_id", creator.id);
          contentCount = count || 0;
        } catch (cntErr) {
          console.warn("[Server] Contents query failed for creator", creator.id, cntErr);
        }
      } else {
        contentCount = creator.id === "creator_1" ? 3 : 1;
      }
      let revenueGenerated = 0;
      if (supabaseAdmin && !usedFallback) {
        try {
          const { data: contents } = await supabaseAdmin.from("contents").select("id").eq("creator_id", creator.id);
          const contentIds = (contents || []).map((c) => c.id);
          if (contentIds.length > 0) {
            const { data: purchases } = await supabaseAdmin.from("purchases").select("creator_net_amount_fcfa").eq("status", "completed").in("content_id", contentIds);
            revenueGenerated = (purchases || []).reduce((sum, p) => sum + (p.creator_net_amount_fcfa || 0), 0);
          }
        } catch (revErr) {
          console.warn("[Server] Revenue query failed for creator", creator.id, revErr);
        }
      } else {
        const purchases = serverDb.getPurchases();
        const localContentCreatorMap = {
          "1": "creator_1",
          "2": "creator_1",
          "3": "creator_1"
        };
        revenueGenerated = purchases.filter((p) => p.status === "completed" && localContentCreatorMap[p.contentId] === creator.id).reduce((sum, p) => sum + (p.creatorNetAmount || 0), 0);
      }
      let creatorEmail = "";
      if (supabaseAdmin && !usedFallback) {
        try {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(creator.user_id);
          creatorEmail = userData?.user?.email || "createur@momo.link";
        } catch (usrErr) {
          console.warn("[Server] Get user email failed for user_id", creator.user_id, usrErr);
          creatorEmail = `${creator.username || "creator"}@momo.link`;
        }
      } else {
        creatorEmail = `${creator.username}@momo.link`;
      }
      return {
        ...creator,
        email: creatorEmail,
        contentCount,
        revenueGenerated,
        subscriptionStatus: activeSubStatus,
        subscriptionExpiry
      };
    }));
    const filtered = creatorStatsList.filter((c) => {
      if (!search) return true;
      return (c.username || "").toLowerCase().includes(search) || (c.display_name || "").toLowerCase().includes(search) || (c.email || "").toLowerCase().includes(search);
    });
    return res.json(filtered);
  } catch (err) {
    console.error("[Server] Admin creators error:", err);
    return res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration de la liste." });
  }
});
app.post("/api/admin/creators/:id/toggle-status", async (req, res) => {
  const { id } = req.params;
  try {
    let currentCreator = null;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("creator_profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      currentCreator = data;
    } else {
      currentCreator = serverDb.getCreators().find((c) => c.id === id);
    }
    if (!currentCreator) {
      return res.status(404).json({ error: "Cr\xE9ateur introuvable." });
    }
    const nextStatus = currentCreator.status === "active" ? "inactive" : "active";
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("creator_profiles").update({ status: nextStatus }).eq("id", id);
      if (error) throw error;
    } else {
      serverDb.updateCreator(id, { status: nextStatus });
    }
    return res.json({ success: true, status: nextStatus });
  } catch (err) {
    console.error("[Server] Toggle creator status error:", err);
    return res.status(500).json({ error: "Erreur lors du changement de statut." });
  }
});
app.post("/api/admin/creators/:id/update-quota", async (req, res) => {
  const { id } = req.params;
  const { quota } = req.body;
  if (typeof quota !== "number" || quota < 1) {
    return res.status(400).json({ error: "Quota invalide." });
  }
  try {
    let currentCreator = null;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("creator_profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      currentCreator = data;
    } else {
      currentCreator = serverDb.getCreators().find((c) => c.id === id);
    }
    if (!currentCreator) {
      return res.status(404).json({ error: "Cr\xE9ateur introuvable." });
    }
    const userId = currentCreator.user_id;
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("creator_profiles").update({ store_quota: quota }).eq("user_id", userId);
      if (error) throw error;
    } else {
      serverDb.getCreators().forEach((c) => {
        if (c.user_id === userId) {
          serverDb.updateCreator(c.id, { store_quota: quota });
        }
      });
    }
    return res.json({ success: true, quota });
  } catch (err) {
    console.error("[Server] Update quota error:", err);
    return res.status(500).json({ error: "Erreur lors de la mise \xE0 jour du quota." });
  }
});
app.get("/api/admin/creators/:id/details", async (req, res) => {
  const { id } = req.params;
  try {
    let creator = null;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("creator_profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      creator = data;
    } else {
      creator = serverDb.getCreators().find((c) => c.id === id);
    }
    if (!creator) {
      return res.status(404).json({ error: "Cr\xE9ateur introuvable." });
    }
    let recentPurchases = [];
    if (supabaseAdmin) {
      const { data: contents } = await supabaseAdmin.from("contents").select("id, title").eq("creator_id", id);
      const contentIds = (contents || []).map((c) => c.id);
      if (contentIds.length > 0) {
        const { data: purchases } = await supabaseAdmin.from("purchases").select("*, contents(title)").in("content_id", contentIds).order("created_at", { ascending: false }).limit(5);
        recentPurchases = (purchases || []).map((p) => ({
          id: p.id,
          createdAt: p.created_at,
          buyerPhone: p.buyer_phone,
          buyerEmail: "***" + (p.buyer_phone ? p.buyer_phone.slice(-4) : "") + "@momo.link",
          // masked
          amountPaid: p.amount_paid_fcfa,
          commissionAmount: p.commission_amount_fcfa,
          creatorNetAmount: p.creator_net_amount_fcfa,
          status: p.status,
          contentTitle: p.contents?.title || "Contenu exclusif"
        }));
      }
    } else {
      const purchases = serverDb.getPurchases();
      recentPurchases = purchases.filter((p) => p.contentId === "1" || p.contentId === "2" || p.contentId === "3").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((p) => ({
        id: p.id,
        createdAt: p.createdAt,
        buyerPhone: p.buyerPhone,
        buyerEmail: p.buyerEmail.replace(/.*(?=@)/, "***"),
        amountPaid: p.amountPaid,
        status: p.status,
        contentTitle: "Contenu exclusif de Michella"
      }));
    }
    let withdrawals = [];
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin.from("withdrawals").select("*").eq("creator_id", id).order("requested_at", { ascending: false });
      withdrawals = data || [];
    } else {
      withdrawals = serverDb.getWithdrawals().filter((w) => w.creator_id === id);
    }
    let subscriptions = [];
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin.from("subscriptions").select("*").eq("creator_id", id).order("created_at", { ascending: false });
      subscriptions = data || [];
    } else {
      subscriptions = serverDb.getCreatorSubscriptions(id);
    }
    const balance = await getCreatorBalance(id);
    if (creator.is_premium && subscriptions.length === 0) {
      subscriptions = [{
        id: "sub_profile_premium",
        creator_id: id,
        amount_paid: SUBSCRIPTION_PRICE_FCFA,
        currency: "XOF",
        start_date: creator.created_at || new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString(),
        end_date: creator.premium_expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString(),
        status: "active",
        created_at: creator.created_at || new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString()
      }];
    }
    return res.json({
      creator,
      balance,
      recentPurchases,
      withdrawals,
      subscriptions
    });
  } catch (err) {
    console.error("[Server] Creator details error:", err);
    return res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration des d\xE9tails." });
  }
});
app.get("/api/admin/withdrawals", async (req, res) => {
  try {
    let pendingList = [];
    let historyList = [];
    if (supabaseAdmin) {
      const { data: pending, error: ep } = await supabaseAdmin.from("withdrawals").select("*, creator_profiles(*)").eq("status", "pending").order("requested_at", { ascending: true });
      const { data: history, error: eh } = await supabaseAdmin.from("withdrawals").select("*, creator_profiles(*)").in("status", ["approved", "paid", "rejected"]).order("requested_at", { ascending: false });
      if (ep) throw ep;
      if (eh) throw eh;
      pendingList = pending || [];
      historyList = history || [];
    } else {
      const creatorsMap = Object.fromEntries(serverDb.getCreators().map((c) => [c.id, c]));
      const withdrawals = serverDb.getWithdrawals();
      pendingList = withdrawals.filter((w) => w.status === "pending").map((w) => ({ ...w, creator_profiles: creatorsMap[w.creator_id] })).sort((a, b) => a.requested_at.localeCompare(b.requested_at));
      historyList = withdrawals.filter((w) => ["approved", "paid", "rejected"].includes(w.status)).map((w) => ({ ...w, creator_profiles: creatorsMap[w.creator_id] })).sort((a, b) => b.requested_at.localeCompare(a.requested_at));
    }
    const pendingWithBalances = await Promise.all(pendingList.map(async (w) => {
      const balance = await getCreatorBalance(w.creator_id);
      return {
        ...w,
        available_balance: balance
      };
    }));
    return res.json({
      pending: pendingWithBalances,
      history: historyList
    });
  } catch (err) {
    console.error("[Server] Admin withdrawals fetch error:", err);
    return res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration des retraits." });
  }
});
app.post("/api/admin/withdrawals/:id/pay", async (req, res) => {
  const { id } = req.params;
  try {
    let withdrawal = null;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("withdrawals").select("*, creator_profiles(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      withdrawal = data;
    } else {
      const creatorsMap = Object.fromEntries(serverDb.getCreators().map((c) => [c.id, c]));
      const rawW = serverDb.getWithdrawals().find((w) => w.id === id);
      if (rawW) {
        withdrawal = { ...rawW, creator_profiles: creatorsMap[rawW.creator_id] };
      }
    }
    if (!withdrawal) {
      return res.status(404).json({ error: "Demande de retrait introuvable." });
    }
    if (withdrawal.creator_profiles?.is_test_account) {
      return res.status(400).json({ error: "Ce compte est un compte de test : aucun paiement r\xE9el ne peut \xEAtre envoy\xE9." });
    }
    const nowStr = (/* @__PURE__ */ new Date()).toISOString();
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("withdrawals").update({ status: "paid", processed_at: nowStr }).eq("id", id);
      if (error) throw error;
      if (withdrawal.creator_profiles?.user_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: withdrawal.creator_profiles.user_id,
          title: "Retrait trait\xE9 avec succ\xE8s",
          message: `Votre demande de retrait de ${withdrawal.amount_requested.toLocaleString()} FCFA via ${withdrawal.payout_provider} (${withdrawal.payout_phone_number}) a \xE9t\xE9 valid\xE9e et envoy\xE9e.`,
          is_read: false
        });
      }
    } else {
      serverDb.updateWithdrawal(id, { status: "paid", processed_at: nowStr });
      serverDb.addNotification({
        userId: withdrawal.creator_profiles?.user_id || "user_1",
        type: "system",
        title: "Retrait trait\xE9 avec succ\xE8s",
        message: `Votre demande de retrait de ${withdrawal.amount_requested.toLocaleString()} FCFA via ${withdrawal.payout_provider} (${withdrawal.payout_phone_number}) a \xE9t\xE9 valid\xE9e et envoy\xE9e.`
      });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("[Server] Pay withdrawal error:", err);
    return res.status(500).json({ error: "Erreur lors de la validation du paiement." });
  }
});
app.post("/api/admin/withdrawals/:id/reject", async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: "La raison du rejet est obligatoire." });
  }
  try {
    let withdrawal = null;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("withdrawals").select("*, creator_profiles(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      withdrawal = data;
    } else {
      const creatorsMap = Object.fromEntries(serverDb.getCreators().map((c) => [c.id, c]));
      const rawW = serverDb.getWithdrawals().find((w) => w.id === id);
      if (rawW) {
        withdrawal = { ...rawW, creator_profiles: creatorsMap[rawW.creator_id] };
      }
    }
    if (!withdrawal) {
      return res.status(404).json({ error: "Demande de retrait introuvable." });
    }
    const nowStr = (/* @__PURE__ */ new Date()).toISOString();
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("withdrawals").update({ status: "rejected", processed_at: nowStr, notes: reason.trim() }).eq("id", id);
      if (error) throw error;
      if (withdrawal.creator_profiles?.user_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: withdrawal.creator_profiles.user_id,
          title: "Retrait rejet\xE9",
          message: `Votre demande de retrait de ${withdrawal.amount_requested.toLocaleString()} FCFA a \xE9t\xE9 rejet\xE9e. Motif : ${reason.trim()}`,
          is_read: false
        });
      }
    } else {
      serverDb.updateWithdrawal(id, { status: "rejected", processed_at: nowStr, notes: reason.trim() });
      serverDb.addNotification({
        userId: withdrawal.creator_profiles?.user_id || "user_1",
        type: "system",
        title: "Retrait rejet\xE9",
        message: `Votre demande de retrait de ${withdrawal.amount_requested.toLocaleString()} FCFA a \xE9t\xE9 rejet\xE9e. Motif : ${reason.trim()}`
      });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("[Server] Reject withdrawal error:", err);
    return res.status(500).json({ error: "Erreur lors du rejet du retrait." });
  }
});
app.get("/api/admin/subscriptions", async (req, res) => {
  try {
    const filter = req.query.filter || "all";
    let creators = [];
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("creator_profiles").select("*");
      if (error) throw error;
      creators = data || [];
    } else {
      creators = serverDb.getCreators();
    }
    const fullSubsList = await Promise.all(creators.map(async (creator) => {
      let subStatus = "none";
      let expiryDateStr = null;
      let amountPaid = 0;
      let daysRemaining = 0;
      if (supabaseAdmin) {
        const { data: subs } = await supabaseAdmin.from("subscriptions").select("*").eq("creator_id", creator.id).order("end_date", { ascending: false });
        const latestSub = subs && subs[0];
        if (latestSub) {
          const now = /* @__PURE__ */ new Date();
          const endDate = new Date(latestSub.end_date);
          const graceLimit = now.getTime() - 3 * 24 * 60 * 60 * 1e3;
          if (latestSub.status === "active" && endDate.getTime() > now.getTime()) {
            subStatus = "active";
          } else if (latestSub.status === "active" && endDate.getTime() > graceLimit) {
            subStatus = "grace";
          } else {
            subStatus = "expired";
          }
          expiryDateStr = latestSub.end_date;
          daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
        }
        amountPaid = (subs || []).reduce((sum, s) => sum + (s.amount_paid || 0), 0);
        if (creator.is_premium && subStatus !== "active") {
          subStatus = "active";
          expiryDateStr = creator.premium_expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
          const endDate = new Date(expiryDateStr);
          daysRemaining = Math.ceil((endDate.getTime() - Date.now()) / (1e3 * 60 * 60 * 24));
          if (amountPaid === 0) {
            amountPaid = SUBSCRIPTION_PRICE_FCFA;
          }
        }
      } else {
        const subs = serverDb.getCreatorSubscriptions(creator.id);
        const latestSub = subs.sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
        if (latestSub) {
          const now = /* @__PURE__ */ new Date();
          const endDate = new Date(latestSub.endDate);
          const graceLimit = now.getTime() - 3 * 24 * 60 * 60 * 1e3;
          if (latestSub.status === "active" && endDate.getTime() > now.getTime()) {
            subStatus = "active";
          } else if (latestSub.status === "active" && endDate.getTime() > graceLimit) {
            subStatus = "grace";
          } else {
            subStatus = "expired";
          }
          expiryDateStr = latestSub.endDate;
          daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
        }
        if (creator.is_premium && subStatus !== "active") {
          subStatus = "active";
          expiryDateStr = creator.premium_expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
          const endDate = new Date(expiryDateStr);
          daysRemaining = Math.ceil((endDate.getTime() - Date.now()) / (1e3 * 60 * 60 * 24));
          if (amountPaid === 0) {
            amountPaid = SUBSCRIPTION_PRICE_FCFA;
          }
        }
        amountPaid = subs.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
      }
      return {
        id: creator.id,
        display_name: creator.display_name,
        username: creator.username,
        avatar_url: creator.avatar_url,
        status: subStatus,
        expiryDate: expiryDateStr,
        daysRemaining,
        amountPaid,
        is_test_account: !!creator.is_test_account
      };
    }));
    const filtered = fullSubsList.filter((s) => {
      if (filter === "all") return true;
      if (filter === "active") return s.status === "active";
      if (filter === "grace") return s.status === "grace";
      if (filter === "expired") return s.status === "expired";
      if (filter === "expiring_soon") return s.status === "active" && s.daysRemaining <= 5 && s.daysRemaining >= 0;
      return true;
    });
    return res.json(filtered);
  } catch (err) {
    console.error("[Server] Admin subscriptions list error:", err);
    return res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration des abonnements." });
  }
});
app.get("/api/admin/transactions", async (req, res) => {
  try {
    const search = (req.query.search || "").trim().toLowerCase();
    const type = req.query.type || "all";
    const status = req.query.status || "all";
    let fullList = [];
    if (supabaseAdmin) {
      const { data: purchases } = await supabaseAdmin.from("purchases").select("*, contents(title, creator_profiles(display_name, username, avatar_url, is_test_account))").order("created_at", { ascending: false });
      const purchaseTransactions = (purchases || []).filter((p) => !p.contents?.creator_profiles?.is_test_account).map((p) => ({
        id: p.id,
        date: p.created_at,
        type: "purchase",
        creatorName: p.contents?.creator_profiles?.display_name || "Inconnu",
        creatorUsername: p.contents?.creator_profiles?.username || "inconnu",
        creatorAvatar: p.contents?.creator_profiles?.avatar_url || "",
        buyerEmail: "***" + (p.buyer_phone ? p.buyer_phone.slice(-4) : "") + "@momo.link",
        amount: p.amount_paid_fcfa,
        commission: p.commission_amount_fcfa,
        status: p.status,
        // completed, pending, failed
        providerTxId: p.payment_reference || ""
      }));
      const { data: subs } = await supabaseAdmin.from("subscriptions").select("*, creator_profiles(display_name, username, avatar_url, is_test_account), transactions(provider_transaction_id)").order("created_at", { ascending: false });
      const subTransactions = (subs || []).filter((s) => !s.creator_profiles?.is_test_account).map((s) => ({
        id: s.id,
        date: s.created_at,
        type: "subscription",
        creatorName: s.creator_profiles?.display_name || "Inconnu",
        creatorUsername: s.creator_profiles?.username || "inconnu",
        creatorAvatar: s.creator_profiles?.avatar_url || "",
        buyerEmail: s.creator_profiles?.display_name || "Inconnu",
        amount: s.amount_paid,
        commission: 0,
        status: s.status === "active" ? "completed" : "expired",
        providerTxId: s.transactions?.provider_transaction_id || ""
      }));
      fullList = [...purchaseTransactions, ...subTransactions].sort((a, b) => b.date.localeCompare(a.date));
    } else {
      const creatorsMap = Object.fromEntries(serverDb.getCreators().map((c) => [c.id, c]));
      const purchases = serverDb.getPurchases().map((p) => {
        const creatorId = "creator_1";
        const creator = creatorsMap[creatorId];
        return {
          id: p.id,
          date: p.createdAt,
          type: "purchase",
          creatorName: creator?.display_name || "Michella Coaching",
          creatorUsername: creator?.username || "michella_coaching",
          creatorAvatar: creator?.avatar_url || "",
          buyerEmail: p.buyerEmail.replace(/.*(?=@)/, "***"),
          amount: p.amountPaid,
          commission: p.commissionAmount,
          status: p.status,
          providerTxId: p.paymentReference
        };
      });
      const subs = serverDb.getSubscriptions().map((s) => {
        const creator = creatorsMap[s.creatorId];
        return {
          id: s.id,
          date: s.createdAt,
          type: "subscription",
          creatorName: creator?.display_name || "Inconnu",
          creatorUsername: creator?.username || "inconnu",
          creatorAvatar: creator?.avatar_url || "",
          buyerEmail: creator?.display_name || "Inconnu",
          amount: s.amountPaid,
          commission: 0,
          status: s.status === "active" ? "completed" : "expired",
          providerTxId: s.transactionId || ""
        };
      });
      fullList = [...purchases, ...subs].sort((a, b) => b.date.localeCompare(a.date));
    }
    const filtered = fullList.filter((t) => {
      const matchesSearch = !search || (t.providerTxId || "").toLowerCase().includes(search) || (t.creatorUsername || "").toLowerCase().includes(search) || (t.creatorName || "").toLowerCase().includes(search);
      const matchesType = type === "all" || t.type === type;
      let matchesStatus = true;
      if (status !== "all") {
        matchesStatus = t.status === status;
      }
      return matchesSearch && matchesType && matchesStatus;
    });
    return res.json(filtered);
  } catch (err) {
    console.error("[Server] Admin transactions error:", err);
    return res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration de l'historique." });
  }
});
app.get("/api/admin/recent-purchases", async (req, res) => {
  try {
    let recentPurchases = [];
    let usedFallback = false;
    if (supabaseAdmin) {
      try {
        const { data: purchases, error: err1 } = await supabaseAdmin.from("purchases").select("*, contents(title, creator_profiles(display_name, username, is_test_account))").order("created_at", { ascending: false }).limit(20);
        if (err1) throw err1;
        recentPurchases = (purchases || []).filter((p) => !p.contents?.creator_profiles?.is_test_account).slice(0, 5).map((p) => ({
          id: p.id,
          createdAt: p.created_at,
          creatorName: p.contents?.creator_profiles?.display_name || "Inconnu",
          contentTitle: p.contents?.title || "Contenu exclusif",
          buyerEmail: "***" + (p.buyer_phone ? p.buyer_phone.slice(-4) : "") + "@momo.link",
          amountPaid: p.amount_paid_fcfa,
          commissionAmount: p.commission_amount_fcfa,
          status: p.status
        }));
      } catch (dbErr) {
        console.warn("[Server] Supabase query failed for recent purchases, falling back to mock data:", dbErr);
        usedFallback = true;
      }
    }
    if (!supabaseAdmin || usedFallback) {
      const creatorsMap = Object.fromEntries(serverDb.getCreators().map((c) => [c.id, c]));
      const purchases = serverDb.getPurchases();
      recentPurchases = purchases.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((p) => {
        const creator = creatorsMap["creator_1"];
        return {
          id: p.id,
          createdAt: p.createdAt,
          creatorName: creator?.display_name || "Michella Coaching",
          contentTitle: "Pack PDF : Booster son audience TikTok",
          buyerEmail: p.buyerEmail.replace(/.*(?=@)/, "***"),
          amountPaid: p.amountPaid,
          commissionAmount: p.commissionAmount,
          status: p.status
        };
      });
    }
    return res.json(recentPurchases);
  } catch (err) {
    console.error("[Server] Admin recent purchases error:", err);
    return res.status(500).json({ error: "Erreur lors du chargement des transactions r\xE9centes." });
  }
});
app.get("/api/admin/contents", async (req, res) => {
  try {
    const search = (req.query.search || "").toLowerCase();
    const type = req.query.type || "all";
    const status = req.query.status || "all";
    let allContents = [];
    let usedFallback = false;
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from("contents").select("*, creator:creator_profiles(display_name, username, avatar_url)");
        if (error) throw error;
        allContents = data || [];
      } catch (dbErr) {
        console.warn("[Server] Supabase contents select failed, falling back to mock data:", dbErr);
        usedFallback = true;
      }
    }
    if (!supabaseAdmin || usedFallback) {
      const localContents = [
        {
          id: "con_1",
          creator_id: "creator_1",
          title: "Pack PDF : Booster son audience TikTok en 30 jours",
          description: "La m\xE9thode compl\xE8te pour scaler son compte.",
          price_fcfa: 2500,
          content_type: "pdf",
          status: "published",
          is_published: true,
          created_at: new Date(Date.now() - 36e5 * 240).toISOString(),
          creator: { display_name: "Michella Coaching", username: "michella_coaching", avatar_url: null }
        },
        {
          id: "con_2",
          creator_id: "creator_1",
          title: "Template Notion : Organiser ses tournages Reels & TikTok",
          description: "Un espace de travail pr\xEAt \xE0 l'emploi.",
          price_fcfa: 1500,
          content_type: "pdf",
          status: "published",
          is_published: true,
          created_at: new Date(Date.now() - 36e5 * 120).toISOString(),
          creator: { display_name: "Michella Coaching", username: "michella_coaching", avatar_url: null }
        },
        {
          id: "con_3",
          creator_id: "creator_1",
          title: "Masterclass : D\xE9cryptage de l'Algorithme 2026 (Vid\xE9o 20m)",
          description: "Vid\xE9o exclusive pour comprendre l'algo.",
          price_fcfa: 5e3,
          content_type: "video",
          status: "published",
          is_published: true,
          created_at: new Date(Date.now() - 36e5 * 72).toISOString(),
          creator: { display_name: "Michella Coaching", username: "michella_coaching", avatar_url: null }
        }
      ];
      allContents = localContents;
    }
    const filtered = allContents.filter((c) => {
      const matchesSearch = !search || c.title.toLowerCase().includes(search) || c.description && c.description.toLowerCase().includes(search) || c.creator && c.creator.display_name.toLowerCase().includes(search) || c.creator && c.creator.username.toLowerCase().includes(search);
      const matchesType = type === "all" || c.content_type === type;
      const matchesStatus = status === "all" || c.status === status;
      return matchesSearch && matchesType && matchesStatus;
    });
    return res.json(filtered);
  } catch (err) {
    console.error("[Server] Admin contents list error:", err);
    return res.status(500).json({ error: "Erreur lors du chargement des contenus." });
  }
});
app.post("/api/admin/contents/:id/toggle-status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status || !["published", "draft", "archived", "removed"].includes(status)) {
    return res.status(400).json({ error: "Statut de mod\xE9ration invalide." });
  }
  try {
    const isPublished = status === "published";
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("contents").update({ status, is_published: isPublished }).eq("id", id).select().single();
      if (error) throw error;
      return res.json({ success: true, status: data.status, is_published: data.is_published });
    }
    return res.json({ success: true, status, is_published: isPublished });
  } catch (err) {
    console.error("[Server] Admin content toggle status error:", err);
    return res.status(500).json({ error: "Erreur lors du changement de statut du contenu." });
  }
});
app.delete("/api/admin/contents/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("contents").delete().eq("id", id);
      if (error) throw error;
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("[Server] Admin content delete error:", err);
    return res.status(500).json({ error: "Erreur lors de la suppression du contenu." });
  }
});
app.get("/api/admin/donations", async (req, res) => {
  const search = (req.query.search || "").toLowerCase().trim();
  try {
    let donations = [];
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("donations").select("*, creator_profiles(display_name, username, avatar_url)").order("created_at", { ascending: false });
      if (error) throw error;
      donations = data || [];
    }
    const filtered = search ? donations.filter(
      (d) => (d.creator_profiles?.display_name || "").toLowerCase().includes(search) || (d.creator_profiles?.username || "").toLowerCase().includes(search) || (d.donor_name || "").toLowerCase().includes(search)
    ) : donations;
    return res.json(filtered);
  } catch (err) {
    console.error("[Server] Admin donations list error:", err);
    return res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration des dons." });
  }
});
app.get("/api/admin/messages", async (req, res) => {
  const search = (req.query.search || "").toLowerCase().trim();
  try {
    let messages = [];
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from("profile_messages").select("*, creator_profiles(display_name, username, avatar_url)").order("created_at", { ascending: false });
      if (error) throw error;
      messages = data || [];
    }
    const filtered = search ? messages.filter(
      (m) => (m.creator_profiles?.display_name || "").toLowerCase().includes(search) || (m.creator_profiles?.username || "").toLowerCase().includes(search) || (m.sender_name || "").toLowerCase().includes(search) || (m.body || "").toLowerCase().includes(search)
    ) : messages;
    return res.json(filtered);
  } catch (err) {
    console.error("[Server] Admin messages list error:", err);
    return res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration des messages." });
  }
});
app.post("/api/admin/creators/:id/grant-premium", async (req, res) => {
  const { id } = req.params;
  const days = Number(req.body?.days) || 30;
  if (!Number.isFinite(days) || days <= 0 || days > 365) {
    return res.status(400).json({ error: "Le nombre de jours doit \xEAtre compris entre 1 et 365." });
  }
  try {
    if (supabaseAdmin) {
      const { data: creator, error: fetchErr } = await supabaseAdmin.from("creator_profiles").select("is_premium, premium_expires_at").eq("id", id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!creator) return res.status(404).json({ error: "Cr\xE9ateur introuvable." });
      const now = /* @__PURE__ */ new Date();
      const currentExpiry = creator.is_premium && creator.premium_expires_at ? new Date(creator.premium_expires_at) : now;
      const base = currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
      const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1e3);
      const { error: updateErr } = await supabaseAdmin.from("creator_profiles").update({ is_premium: true, premium_expires_at: newExpiry.toISOString() }).eq("id", id);
      if (updateErr) throw updateErr;
      return res.json({ success: true, premium_expires_at: newExpiry.toISOString() });
    } else {
      const creator = serverDb.getCreators().find((c) => c.id === id);
      if (!creator) return res.status(404).json({ error: "Cr\xE9ateur introuvable." });
      const now = /* @__PURE__ */ new Date();
      const currentExpiry = creator.is_premium && creator.premium_expires_at ? new Date(creator.premium_expires_at) : now;
      const base = currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
      const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1e3);
      serverDb.updateCreator(id, { is_premium: true, premium_expires_at: newExpiry.toISOString() });
      return res.json({ success: true, premium_expires_at: newExpiry.toISOString() });
    }
  } catch (err) {
    console.error("[Server] Grant premium error:", err);
    return res.status(500).json({ error: "Erreur lors de l'attribution du premium." });
  }
});
var FAKE_DONOR_NAMES = [
  "A\xEFcha D.",
  "Moussa K.",
  "Fatou S.",
  "Ibrahim T.",
  "Awa N.",
  "Yao B.",
  "Mariam C.",
  "Kofi A.",
  "Adjoa L.",
  "Sekou M.",
  "Nad\xE8ge P.",
  "Kwame O."
];
app.post("/api/admin/creators/:id/seed-test-data", async (req, res) => {
  const { id } = req.params;
  const purchasesCount = Math.min(200, Math.max(0, Number(req.body?.purchasesCount ?? 15)));
  const donationsCount = Math.min(200, Math.max(0, Number(req.body?.donationsCount ?? 8)));
  const daysRange = Math.min(365, Math.max(1, Number(req.body?.daysRange ?? 30)));
  if (!supabaseAdmin) {
    return res.status(400).json({ error: "Supabase non configur\xE9 : impossible de g\xE9n\xE9rer des donn\xE9es de test." });
  }
  try {
    const { data: creator, error: creatorErr } = await supabaseAdmin.from("creator_profiles").select("id, is_test_account, payout_provider").eq("id", id).maybeSingle();
    if (creatorErr) throw creatorErr;
    if (!creator) return res.status(404).json({ error: "Cr\xE9ateur introuvable." });
    if (!creator.is_test_account) {
      return res.status(403).json({ error: "Ce cr\xE9ateur n'est pas marqu\xE9 comme compte de test. Activez `is_test_account` avant de g\xE9n\xE9rer de fausses donn\xE9es." });
    }
    const { data: contents, error: contentsErr } = await supabaseAdmin.from("contents").select("id, price_fcfa").eq("creator_id", id).eq("status", "published");
    if (contentsErr) throw contentsErr;
    if (purchasesCount > 0 && (!contents || contents.length === 0)) {
      return res.status(400).json({ error: "Ce cr\xE9ateur n'a aucun contenu publi\xE9 : ajoutez au moins un contenu avant de g\xE9n\xE9rer de fausses ventes." });
    }
    const fakePurchases = Array.from({ length: purchasesCount }).map(() => {
      const content = contents[Math.floor(Math.random() * contents.length)];
      const amount = content.price_fcfa;
      const commission = Math.round(amount * 0.1);
      return {
        buyer_phone: `+2289${Math.floor(1e6 + Math.random() * 8999999)}`,
        content_id: content.id,
        status: "completed",
        amount_paid_fcfa: amount,
        commission_amount_fcfa: commission,
        creator_net_amount_fcfa: amount - commission,
        payment_reference: generateFakePaymentReference(randomMomoProvider()),
        is_fake: true,
        created_at: randomGrowthDate(daysRange)
      };
    });
    const fakeDonations = Array.from({ length: donationsCount }).map(() => {
      const amount = [1e3, 1500, 2e3, 2500, 3e3, 5e3][Math.floor(Math.random() * 6)];
      const commission = Math.round(amount * 0.1);
      return {
        creator_id: id,
        donor_name: FAKE_DONOR_NAMES[Math.floor(Math.random() * FAKE_DONOR_NAMES.length)],
        donor_email: null,
        donor_message: null,
        status: "completed",
        amount_fcfa: amount,
        commission_amount_fcfa: commission,
        creator_net_amount_fcfa: amount - commission,
        payment_reference: generateFakePaymentReference(randomMomoProvider()),
        is_fake: true,
        created_at: randomGrowthDate(daysRange)
      };
    });
    if (fakePurchases.length > 0) {
      const { error: insertPurchasesErr } = await supabaseAdmin.from("purchases").insert(fakePurchases);
      if (insertPurchasesErr) throw insertPurchasesErr;
    }
    if (fakeDonations.length > 0) {
      const { error: insertDonationsErr } = await supabaseAdmin.from("donations").insert(fakeDonations);
      if (insertDonationsErr) throw insertDonationsErr;
    }
    return res.json({
      success: true,
      purchasesCreated: fakePurchases.length,
      donationsCreated: fakeDonations.length
    });
  } catch (err) {
    console.error("[Server] Seed test data error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors de la g\xE9n\xE9ration des donn\xE9es de test." });
  }
});
app.post("/api/admin/test-accounts", async (req, res) => {
  const { email, password, username, display_name } = req.body || {};
  if (!email || !password || !username || !display_name) {
    return res.status(400).json({ error: "Champs requis : email, password, username, display_name." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caract\xE8res." });
  }
  if (!/^[a-z0-9_]{3,30}$/.test(username.toLowerCase())) {
    return res.status(400).json({ error: "Nom d'utilisateur invalide (3-30 caract\xE8res, lettres/chiffres/underscore)." });
  }
  if (!supabaseAdmin) {
    return res.status(400).json({ error: "Supabase non configur\xE9 : impossible de cr\xE9er un compte de test." });
  }
  try {
    const { data: existingUsername } = await supabaseAdmin.from("creator_profiles").select("id").eq("username", username.toLowerCase()).maybeSingle();
    if (existingUsername) {
      return res.status(400).json({ error: "Ce nom d'utilisateur est d\xE9j\xE0 pris." });
    }
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (createErr) {
      if (String(createErr.message || "").toLowerCase().includes("already")) {
        return res.status(400).json({ error: 'Un compte existe d\xE9j\xE0 avec cet email. Utilisez plut\xF4t "Lier un compte existant".' });
      }
      throw createErr;
    }
    const userId = created.user.id;
    const { data: profile, error: profileErr } = await supabaseAdmin.from("creator_profiles").insert({
      user_id: userId,
      username: username.toLowerCase(),
      display_name,
      bio: "",
      payout_phone_number: "+22900000000",
      payout_provider: "wave",
      status: "active",
      is_test_account: true,
      is_premium: true,
      premium_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString()
    }).select().single();
    if (profileErr) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw profileErr;
    }
    return res.json({ success: true, creator: profile });
  } catch (err) {
    console.error("[Server] Create test account error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors de la cr\xE9ation du compte de test." });
  }
});
app.post("/api/admin/creators/:id/toggle-test-account", async (req, res) => {
  const { id } = req.params;
  if (!supabaseAdmin) {
    return res.status(400).json({ error: "Supabase non configur\xE9." });
  }
  try {
    const { data: creator, error: fetchErr } = await supabaseAdmin.from("creator_profiles").select("is_test_account").eq("id", id).maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!creator) return res.status(404).json({ error: "Cr\xE9ateur introuvable." });
    const { data: updated, error: updateErr } = await supabaseAdmin.from("creator_profiles").update({ is_test_account: !creator.is_test_account }).eq("id", id).select("id, is_test_account").single();
    if (updateErr) throw updateErr;
    return res.json({ success: true, is_test_account: updated.is_test_account });
  } catch (err) {
    console.error("[Server] Toggle test account error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors du changement de statut." });
  }
});
app.post("/api/admin/creators/:id/fake-purchase", async (req, res) => {
  const { id } = req.params;
  const { contentId, createdAt } = req.body || {};
  if (!contentId || !createdAt) {
    return res.status(400).json({ error: "Champs requis : contentId, createdAt." });
  }
  if (!supabaseAdmin) {
    return res.status(400).json({ error: "Supabase non configur\xE9." });
  }
  try {
    const { data: creator, error: creatorErr } = await supabaseAdmin.from("creator_profiles").select("id, is_test_account, payout_provider").eq("id", id).maybeSingle();
    if (creatorErr) throw creatorErr;
    if (!creator) return res.status(404).json({ error: "Cr\xE9ateur introuvable." });
    if (!creator.is_test_account) {
      return res.status(403).json({ error: "Ce cr\xE9ateur n'est pas un compte de test." });
    }
    const { data: content, error: contentErr } = await supabaseAdmin.from("contents").select("id, price_fcfa, creator_id").eq("id", contentId).maybeSingle();
    if (contentErr) throw contentErr;
    if (!content || content.creator_id !== id) {
      return res.status(400).json({ error: "Ce contenu n'appartient pas \xE0 ce cr\xE9ateur." });
    }
    const amount = content.price_fcfa;
    const commission = Math.round(amount * 0.1);
    const { data: purchase, error: insertErr } = await supabaseAdmin.from("purchases").insert({
      buyer_phone: `+2289${Math.floor(1e6 + Math.random() * 8999999)}`,
      content_id: contentId,
      status: "completed",
      amount_paid_fcfa: amount,
      commission_amount_fcfa: commission,
      creator_net_amount_fcfa: amount - commission,
      payment_reference: generateFakePaymentReference(randomMomoProvider()),
      is_fake: true,
      created_at: new Date(createdAt).toISOString()
    }).select().single();
    if (insertErr) throw insertErr;
    return res.json({ success: true, purchase });
  } catch (err) {
    console.error("[Server] Fake purchase error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors de la cr\xE9ation de la vente fictive." });
  }
});
app.post("/api/admin/creators/:id/fake-donation", async (req, res) => {
  const { id } = req.params;
  const { amount, donorName, createdAt } = req.body || {};
  const amountNum = Number(amount);
  if (!amountNum || amountNum < 1e3 || !donorName || !createdAt) {
    return res.status(400).json({ error: "Champs requis : amount (>= 1000), donorName, createdAt." });
  }
  if (!supabaseAdmin) {
    return res.status(400).json({ error: "Supabase non configur\xE9." });
  }
  try {
    const { data: creator, error: creatorErr } = await supabaseAdmin.from("creator_profiles").select("id, is_test_account, payout_provider").eq("id", id).maybeSingle();
    if (creatorErr) throw creatorErr;
    if (!creator) return res.status(404).json({ error: "Cr\xE9ateur introuvable." });
    if (!creator.is_test_account) {
      return res.status(403).json({ error: "Ce cr\xE9ateur n'est pas un compte de test." });
    }
    const commission = Math.round(amountNum * 0.1);
    const { data: donation, error: insertErr } = await supabaseAdmin.from("donations").insert({
      creator_id: id,
      donor_name: donorName,
      donor_email: null,
      donor_message: null,
      status: "completed",
      amount_fcfa: amountNum,
      commission_amount_fcfa: commission,
      creator_net_amount_fcfa: amountNum - commission,
      payment_reference: generateFakePaymentReference(randomMomoProvider()),
      is_fake: true,
      created_at: new Date(createdAt).toISOString()
    }).select().single();
    if (insertErr) throw insertErr;
    return res.json({ success: true, donation });
  } catch (err) {
    console.error("[Server] Fake donation error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors de la cr\xE9ation du don fictif." });
  }
});
app.post("/api/admin/creators/:id/fake-withdrawal", async (req, res) => {
  const { id } = req.params;
  const { amount, createdAt } = req.body || {};
  const amountNum = Number(amount);
  if (!amountNum || amountNum < 5e3 || !createdAt) {
    return res.status(400).json({ error: "Champs requis : amount (>= 5000), createdAt." });
  }
  if (!supabaseAdmin) {
    return res.status(400).json({ error: "Supabase non configur\xE9." });
  }
  try {
    const { data: creator, error: creatorErr } = await supabaseAdmin.from("creator_profiles").select("id, is_test_account, payout_provider, payout_phone_number").eq("id", id).maybeSingle();
    if (creatorErr) throw creatorErr;
    if (!creator) return res.status(404).json({ error: "Cr\xE9ateur introuvable." });
    if (!creator.is_test_account) {
      return res.status(403).json({ error: "Ce cr\xE9ateur n'est pas un compte de test." });
    }
    const requestedAt = new Date(createdAt).toISOString();
    const { data: withdrawal, error: insertErr } = await supabaseAdmin.from("withdrawals").insert({
      creator_id: id,
      amount_requested: amountNum,
      payout_provider: creator.payout_provider || "wave",
      payout_phone_number: creator.payout_phone_number || "+22900000000",
      status: "paid",
      is_fake: true,
      requested_at: requestedAt,
      processed_at: requestedAt
    }).select().single();
    if (insertErr) throw insertErr;
    return res.json({ success: true, withdrawal });
  } catch (err) {
    console.error("[Server] Fake withdrawal error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors de la cr\xE9ation du retrait fictif." });
  }
});
app.get("/api/admin/creators/:id/fake-transactions", async (req, res) => {
  const { id } = req.params;
  if (!supabaseAdmin) {
    return res.status(400).json({ error: "Supabase non configur\xE9." });
  }
  try {
    const { data: contents } = await supabaseAdmin.from("contents").select("id, title").eq("creator_id", id);
    const contentMap = new Map((contents || []).map((c) => [c.id, c.title]));
    const contentIds = (contents || []).map((c) => c.id);
    let purchases = [];
    if (contentIds.length > 0) {
      const { data } = await supabaseAdmin.from("purchases").select("id, content_id, amount_paid_fcfa, created_at").in("content_id", contentIds).eq("is_fake", true).order("created_at", { ascending: false });
      purchases = (data || []).map((p) => ({
        id: p.id,
        type: "purchase",
        label: contentMap.get(p.content_id) || "Contenu",
        amount: p.amount_paid_fcfa,
        createdAt: p.created_at
      }));
    }
    const { data: donationsData } = await supabaseAdmin.from("donations").select("id, donor_name, amount_fcfa, created_at").eq("creator_id", id).eq("is_fake", true).order("created_at", { ascending: false });
    const donations = (donationsData || []).map((d) => ({
      id: d.id,
      type: "donation",
      label: d.donor_name,
      amount: d.amount_fcfa,
      createdAt: d.created_at
    }));
    const { data: withdrawalsData } = await supabaseAdmin.from("withdrawals").select("id, amount_requested, requested_at").eq("creator_id", id).eq("is_fake", true).order("requested_at", { ascending: false });
    const withdrawals = (withdrawalsData || []).map((w) => ({
      id: w.id,
      type: "withdrawal",
      label: "Retrait",
      amount: w.amount_requested,
      createdAt: w.requested_at
    }));
    const combined = [...purchases, ...donations, ...withdrawals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return res.json(combined);
  } catch (err) {
    console.error("[Server] Fake transactions list error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors de la r\xE9cup\xE9ration des transactions fictives." });
  }
});
app.delete("/api/admin/fake-transactions/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  if (type !== "purchase" && type !== "donation" && type !== "withdrawal") {
    return res.status(400).json({ error: "Type invalide (purchase, donation ou withdrawal)." });
  }
  if (!supabaseAdmin) {
    return res.status(400).json({ error: "Supabase non configur\xE9." });
  }
  try {
    if (type === "purchase") {
      const { data: purchase, error: fetchErr } = await supabaseAdmin.from("purchases").select("id, is_fake, content_id, contents(creator_id, creator_profiles(is_test_account))").eq("id", id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!purchase) return res.status(404).json({ error: "Vente introuvable." });
      if (!purchase.is_fake || !purchase.contents?.creator_profiles?.is_test_account) {
        return res.status(403).json({ error: "Cette vente ne peut pas \xEAtre supprim\xE9e (pas une donn\xE9e de test)." });
      }
      const { error: delErr } = await supabaseAdmin.from("purchases").delete().eq("id", id);
      if (delErr) throw delErr;
    } else if (type === "donation") {
      const { data: donation, error: fetchErr } = await supabaseAdmin.from("donations").select("id, is_fake, creator_id, creator_profiles(is_test_account)").eq("id", id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!donation) return res.status(404).json({ error: "Don introuvable." });
      if (!donation.is_fake || !donation.creator_profiles?.is_test_account) {
        return res.status(403).json({ error: "Ce don ne peut pas \xEAtre supprim\xE9 (pas une donn\xE9e de test)." });
      }
      const { error: delErr } = await supabaseAdmin.from("donations").delete().eq("id", id);
      if (delErr) throw delErr;
    } else {
      const { data: withdrawal, error: fetchErr } = await supabaseAdmin.from("withdrawals").select("id, is_fake, creator_id, creator_profiles(is_test_account)").eq("id", id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!withdrawal) return res.status(404).json({ error: "Retrait introuvable." });
      if (!withdrawal.is_fake || !withdrawal.creator_profiles?.is_test_account) {
        return res.status(403).json({ error: "Ce retrait ne peut pas \xEAtre supprim\xE9 (pas une donn\xE9e de test)." });
      }
      const { error: delErr } = await supabaseAdmin.from("withdrawals").delete().eq("id", id);
      if (delErr) throw delErr;
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("[Server] Delete fake transaction error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors de la suppression." });
  }
});
var RESERVED_ROOT_PATHS = /* @__PURE__ */ new Set([
  "auth",
  "dashboard",
  "admin",
  "portal",
  "legal",
  "pay",
  "payment",
  "congrat",
  "onboarding",
  "api",
  "content"
]);
var USERNAME_PATH_RE = /^\/([a-zA-Z0-9_.]+)\/?$/;
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
async function getCreatorForOg(username) {
  if (!supabase) return null;
  const { data } = await supabase.from("creator_profiles").select("display_name, username, bio, avatar_url").eq("username", username.toLowerCase()).eq("status", "active").maybeSingle();
  return data;
}
function injectOgTags(html, creator, pageUrl) {
  const title = escapeHtml(`${creator.display_name} \u2014 contenus exclusifs | MomoLink`);
  const description = escapeHtml(
    creator.bio?.trim() || `D\xE9couvrez les contenus exclusifs de ${creator.display_name} sur MomoLink.`
  );
  const image = creator.avatar_url ? escapeHtml(creator.avatar_url) : "";
  const tags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="profile" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    ${image ? `<meta property="og:image" content="${image}" />` : ""}
    <meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    ${image ? `<meta name="twitter:image" content="${image}" />` : ""}
  `;
  return html.replace(/<title>.*?<\/title>/i, "").replace("</head>", `${tags}
  </head>`);
}
async function maybeServeCreatorOgPage(req, res, readHtml) {
  const match = USERNAME_PATH_RE.exec(req.path);
  if (!match) return false;
  const candidate = match[1].toLowerCase();
  if (RESERVED_ROOT_PATHS.has(candidate)) return false;
  try {
    const creator = await getCreatorForOg(candidate);
    if (!creator) return false;
    const html = await readHtml();
    const pageUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    res.status(200).set({ "Content-Type": "text/html" }).end(injectOgTags(html, creator, pageUrl));
    return true;
  } catch (err) {
    console.error("[Server] OG injection error:", err);
    return false;
  }
}
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    if (req.method !== "GET") return next();
    const handled = await maybeServeCreatorOgPage(req, res, async () => {
      const origin = `${req.protocol}://${req.get("host")}`;
      const r = await fetch(`${origin}/index.html`);
      return r.text();
    });
    if (!handled) next();
  });
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Starting development server with Vite middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(async (req, res, next) => {
      if (req.method !== "GET") return next();
      const handled = await maybeServeCreatorOgPage(req, res, async () => {
        const rawHtml = fs2.readFileSync(path2.resolve(process.cwd(), "index.html"), "utf-8");
        return vite.transformIndexHtml(req.originalUrl, rawHtml);
      });
      if (!handled) next();
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Starting production server...");
    const distPath = path2.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", async (req, res) => {
      const indexPath = path2.join(distPath, "index.html");
      const handled = await maybeServeCreatorOgPage(req, res, async () => fs2.readFileSync(indexPath, "utf-8"));
      if (!handled) res.sendFile(indexPath);
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Full-stack application ready at http://localhost:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
export {
  server_default as default
};
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=index.js.map
