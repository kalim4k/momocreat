/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'server_db.json');

// Ensure data directory exists
const dir = path.dirname(DB_FILE_PATH);
try {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
} catch (err) {
  console.warn('[ServerDB] Safe warning: Could not verify or create database directory, probably running in a read-only serverless environment:', err);
}

export interface ServerPurchase {
  id: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerFirstName: string;
  buyerLastName: string;
  contentId: string;
  status: 'pending' | 'completed' | 'failed';
  paymentReference: string; // cartId
  amountPaid: number;
  commissionAmount: number;
  creatorNetAmount: number;
  createdAt: string;
  purchasedAt?: string;
}

export interface ServerTransaction {
  id: string;
  provider: 'maketou';
  providerTransactionId: string; // cartId
  status: 'pending' | 'success' | 'failed';
  type: 'purchase' | 'subscription';
  createdAt: string;
}

export interface ServerSubscription {
  id: string;
  creatorId: string;
  transactionId?: string | null;
  amountPaid: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
}


export interface ServerNotification {
  id: string;
  userId: string; // creator's user_id or creator_id
  type: 'new_sale' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface DBStructure {
  purchases: ServerPurchase[];
  transactions: ServerTransaction[];
  notifications: ServerNotification[];
  subscriptions: ServerSubscription[];
  creator_profiles: any[];
  withdrawals: any[];
}

let memoryDb: DBStructure | null = null;

function loadDB(): DBStructure {
  if (memoryDb) {
    return memoryDb;
  }

  // Try to load from disk
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const defaultDB: DBStructure = { purchases: [], transactions: [], notifications: [], subscriptions: [], creator_profiles: [], withdrawals: [] };
      try {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultDB, null, 2), 'utf-8');
      } catch (writeErr) {
        console.warn('[ServerDB] Cannot write default DB to disk, using in-memory mode:', writeErr);
      }
      memoryDb = defaultDB;
    } else {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const db = JSON.parse(content);
      db.subscriptions = db.subscriptions || [];
      db.creator_profiles = db.creator_profiles || [];
      db.withdrawals = db.withdrawals || [];
      memoryDb = db;
    }
  } catch (err) {
    console.error('[ServerDB] Error loading database from disk, falling back to in-memory mode:', err);
    if (!memoryDb) {
      memoryDb = { purchases: [], transactions: [], notifications: [], subscriptions: [], creator_profiles: [], withdrawals: [] };
    }
  }

  const db = memoryDb!;

  // Seed mock creators if empty
  if (db.creator_profiles.length === 0) {
    db.creator_profiles = [
      {
        id: 'creator_1',
        user_id: 'user_1',
        username: 'michella_coaching',
        display_name: 'Michella Coaching',
        bio: 'Coach certifiée en influence et monétisation d\'audience.',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        cover_url: '',
        payout_phone_number: '2250707070707',
        payout_provider: 'wave',
        status: 'active',
        is_premium: true,
        premium_expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'creator_2',
        user_id: 'user_2',
        username: 'dev_guy',
        display_name: 'Abdoulaye Sow',
        bio: 'Formateur en développement web React et Node.js.',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        cover_url: '',
        payout_phone_number: '221776543210',
        payout_provider: 'orange',
        status: 'active',
        is_premium: false,
        premium_expires_at: null,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'creator_3',
        user_id: 'user_3',
        username: 'momo_designer',
        display_name: 'Mamadou Diallo',
        bio: 'UI/UX Designer, je vends des templates Figma professionnels.',
        avatar_url: '',
        cover_url: '',
        payout_phone_number: '22366778899',
        payout_provider: 'mtn',
        status: 'inactive',
        is_premium: true,
        premium_expires_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Seed mock withdrawals if empty
  if (db.withdrawals.length === 0) {
    db.withdrawals = [
      {
        id: 'w_1',
        creator_id: 'creator_1',
        amount_requested: 15000,
        payout_provider: 'wave',
        payout_phone_number: '2250707070707',
        status: 'pending',
        requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'w_2',
        creator_id: 'creator_2',
        amount_requested: 25000,
        payout_provider: 'orange',
        payout_phone_number: '221776543210',
        status: 'pending',
        requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'w_3',
        creator_id: 'creator_1',
        amount_requested: 10000,
        payout_provider: 'wave',
        payout_phone_number: '2250707070707',
        status: 'paid',
        requested_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        processed_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  return db;
}


function saveDB(db: DBStructure) {
  memoryDb = db;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[ServerDB] Error saving database to disk, keeping state in-memory:', err);
  }
}

export const serverDb = {
  getPurchases(): ServerPurchase[] {
    return loadDB().purchases;
  },

  getPurchase(id: string): ServerPurchase | undefined {
    return loadDB().purchases.find(p => p.id === id);
  },

  getPurchaseByCart(cartId: string): ServerPurchase | undefined {
    return loadDB().purchases.find(p => p.paymentReference === cartId);
  },

  addPurchase(purchase: Omit<ServerPurchase, 'id' | 'createdAt'> & { id?: string }): ServerPurchase {
    const db = loadDB();
    const newPurchase: ServerPurchase = {
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
      createdAt: new Date().toISOString()
    };
    db.purchases.push(newPurchase);
    saveDB(db);
    return newPurchase;
  },

  updatePurchase(id: string, updates: Partial<ServerPurchase>): ServerPurchase | null {
    const db = loadDB();
    const idx = db.purchases.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.purchases[idx] = { ...db.purchases[idx], ...updates };
    saveDB(db);
    return db.purchases[idx];
  },

  addTransaction(tx: Omit<ServerTransaction, 'id' | 'createdAt'>): ServerTransaction {
    const db = loadDB();
    const newTx: ServerTransaction = {
      ...tx,
      id: `tx_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString()
    };
    db.transactions.push(newTx);
    saveDB(db);
    return newTx;
  },

  updateTransactionByCart(cartId: string, updates: Partial<ServerTransaction>): ServerTransaction | null {
    const db = loadDB();
    const idx = db.transactions.findIndex(t => t.providerTransactionId === cartId);
    if (idx === -1) return null;
    db.transactions[idx] = { ...db.transactions[idx], ...updates };
    saveDB(db);
    return db.transactions[idx];
  },

  addNotification(notif: Omit<ServerNotification, 'id' | 'createdAt' | 'isRead'>): ServerNotification {
    const db = loadDB();
    const newNotif: ServerNotification = {
      ...notif,
      id: `notif_${Math.random().toString(36).substring(2, 11)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(newNotif);
    saveDB(db);
    
    // Also push to local storage in demo mode if on the client-side
    return newNotif;
  },

  getNotifications(userId: string): ServerNotification[] {
    return loadDB().notifications.filter(n => n.userId === userId);
  },

  getSubscriptions(): ServerSubscription[] {
    return loadDB().subscriptions;
  },

  getCreatorSubscriptions(creatorId: string): ServerSubscription[] {
    return loadDB().subscriptions.filter(s => s.creatorId === creatorId);
  },

  addSubscription(sub: Omit<ServerSubscription, 'id' | 'createdAt'>): ServerSubscription {
    const db = loadDB();
    const newSub: ServerSubscription = {
      ...sub,
      id: `sub_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString()
    };
    db.subscriptions.push(newSub);
    saveDB(db);
    return newSub;
  },

  updateSubscription(id: string, updates: Partial<ServerSubscription>): ServerSubscription | null {
    const db = loadDB();
    const idx = db.subscriptions.findIndex(s => s.id === id);
    if (idx === -1) return null;
    db.subscriptions[idx] = { ...db.subscriptions[idx], ...updates };
    saveDB(db);
    return db.subscriptions[idx];
  },

  isCreatorSubscribed(creatorId: string): boolean {
    const db = loadDB();
    const now = Date.now();
    const graceLimit = now - 3 * 24 * 60 * 60 * 1000; // 3 days ago
    
    // Returns true if there is any subscription WHERE creatorId = $1 AND status = 'active' AND endDate > graceLimit
    return db.subscriptions.some(
      s => s.creatorId === creatorId && 
           s.status === 'active' && 
           new Date(s.endDate).getTime() > graceLimit
    );
  },

  getCreators(): any[] {
    return loadDB().creator_profiles;
  },

  updateCreator(id: string, updates: Partial<any>): any | null {
    const db = loadDB();
    const idx = db.creator_profiles.findIndex(c => c.id === id);
    if (idx === -1) return null;
    db.creator_profiles[idx] = { ...db.creator_profiles[idx], ...updates };
    saveDB(db);
    return db.creator_profiles[idx];
  },

  getWithdrawals(): any[] {
    return loadDB().withdrawals;
  },

  addWithdrawal(w: any): any {
    const db = loadDB();
    db.withdrawals.push(w);
    saveDB(db);
    return w;
  },

  updateWithdrawal(id: string, updates: Partial<any>): any | null {
    const db = loadDB();
    const idx = db.withdrawals.findIndex(w => w.id === id);
    if (idx === -1) return null;
    db.withdrawals[idx] = { ...db.withdrawals[idx], ...updates };
    saveDB(db);
    return db.withdrawals[idx];
  }
};

