import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer,
  collection,
  onSnapshot,
  updateDoc,
  increment,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, CustomerFeedback, Order, TributeCustomer } from '../types';
import { INITIAL_FEEDBACKS, CERTIFIED_TOP_CUSTOMERS } from '../data/feedbacks';

const app = initializeApp(firebaseConfig);

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreDb; /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { onAuthStateChanged };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Firestore Connection as specified in skill guidelines
async function testConnection() {
  try {
    const connDoc = doc(db, 'test', 'connection');
    // Attach error handler to prevent unhandled 10s backend connection timeout errors
    const connPromise = getDocFromServer(connDoc).catch((err) => {
      console.warn("Firestore status: Client operating in offline mode or waiting for connection.", err?.message);
      return null;
    });
    const timeoutPromise = new Promise<null>((resolve) => 
      setTimeout(() => resolve(null), 2000)
    );
    await Promise.race([connPromise, timeoutPromise]);
    console.log('🔥 Firebase Firestore connection initialized safely');
  } catch (error: any) {
    console.warn("Firestore status: Client operating in offline mode or waiting for connection.");
  }
}
testConnection();

// Safe Promise timeout helper so no external network call hangs the login flow
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
}

export async function signInWithGoogle(): Promise<{ user: User; firebaseUser: FirebaseUser }> {
  try {
    // 1. Trigger Google Sign In Popup
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    // 2. Fetch real client public IP (Works 100% on Vercel)
    let clientIp = '127.0.0.1';
    try {
      const cached = sessionStorage.getItem('npt_real_client_ip');
      if (cached && cached !== '127.0.0.1') {
        clientIp = cached;
      } else {
        const ipRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(1500) })
          .then(r => r.json())
          .catch(() => null);
        if (ipRes?.ip) {
          clientIp = ipRes.ip;
          sessionStorage.setItem('npt_real_client_ip', clientIp);
        }
      }
    } catch {}

    // Check if IP is banned
    try {
      const bannedRaw = localStorage.getItem('npt_banned_ips');
      if (bannedRaw) {
        const list: string[] = JSON.parse(bannedRaw);
        if (list.includes(clientIp)) {
          await firebaseSignOut(auth);
          throw new Error(`🚫 Địa chỉ IP [${clientIp}] của bạn đã bị Admin chặn! Không thể đăng nhập.`);
        }
      }
    } catch (e: any) {
      if (e?.message?.includes('bị Admin chặn')) throw e;
    }

    // 3. Fast check for existing profile in Firestore (1.5s max timeout to prevent hang)
    let riderPoints = 100;
    let tierRank: User['tierRank'] = 'Novice Rider';
    let role: User['role'] = fbUser.email?.includes('admin') ? 'admin' : 'user';

    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const snap = await withTimeout(getDoc(userDocRef), 1500, null);
      if (snap && snap.exists()) {
        const data = snap.data();
        if (typeof data.riderPoints === 'number') riderPoints = data.riderPoints;
        if (data.tierRank) tierRank = data.tierRank;
        if (data.role) role = data.role;
      }
    } catch (err) {
      console.warn('Firestore user profile read timed out or skipped:', err);
    }

    // 4. Build application User model immediately
    const appUser: User = {
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Collector Rider',
      email: fbUser.email || '',
      avatar: fbUser.photoURL || undefined,
      phone: fbUser.phoneNumber || undefined,
      role: role,
      riderPoints: riderPoints,
      tierRank: tierRank,
      referralCode: 'RIDER-' + fbUser.uid.substring(0, 5).toUpperCase(),
      wishlist: []
    };

    // 5. Asynchronously persist/update profile in Firestore (never blocks login return)
    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      setDoc(userDocRef, {
        uid: fbUser.uid,
        name: appUser.name,
        email: appUser.email,
        avatar: appUser.avatar || '',
        role: appUser.role,
        riderPoints: appUser.riderPoints,
        tierRank: appUser.tierRank,
        lastIp: clientIp,
        lastLoginAt: new Date().toISOString()
      }, { merge: true }).catch(err => {
        console.warn('Background Firestore profile save note:', err);
      });
    } catch (err) {
      console.warn('Firestore setDoc initiation note:', err);
    }

    return { user: appUser, firebaseUser: fbUser };
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user') ||
      error?.message?.includes('cancelled-popup-request')
    ) {
      console.log('Firebase Google Sign-In: Popup closed by user');
      throw new Error('USER_CANCELLED_POPUP');
    }
    console.error('Firebase Google Sign-In Error:', error);
    throw error;
  }
}

export async function loginWithGoogleAccountFallback(
  email: string,
  name?: string
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const displayName = name?.trim() || cleanEmail.split('@')[0];
  const uid = 'goog_' + Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(36);

  let riderPoints = 150;
  let tierRank: User['tierRank'] = cleanEmail.includes('vip') ? 'CSM Master' : 'Novice Rider';
  let role: User['role'] = (cleanEmail.includes('admin') || cleanEmail === 'ndanh3366@gmail.com') ? 'admin' : 'user';

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await withTimeout(getDoc(userDocRef), 1500, null);
    if (snap && snap.exists()) {
      const data = snap.data();
      if (typeof data.riderPoints === 'number') riderPoints = data.riderPoints;
      if (data.tierRank) tierRank = data.tierRank;
      if (data.role) role = data.role;
    }
  } catch {}

  const user: User = {
    id: uid,
    name: displayName,
    email: cleanEmail,
    avatar: '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png',
    role,
    riderPoints,
    tierRank,
    referralCode: 'RIDER-' + uid.slice(0, 5).toUpperCase(),
    wishlist: []
  };

  // Background sync to Firestore
  try {
    const userDocRef = doc(db, 'users', uid);
    setDoc(userDocRef, {
      uid,
      name: user.name,
      email: user.email,
      role: user.role,
      riderPoints: user.riderPoints,
      tierRank: user.tierRank,
      lastLoginAt: new Date().toISOString()
    }, { merge: true }).catch(() => {});
  } catch {}

  return user;
}

export async function signOutFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('Firebase signout warning:', err);
  }
}

// =========================================================================
// REAL-TIME FEEDBACK SYNCHRONIZATION (FIRESTORE + REAL BACKEND)
// =========================================================================

// =========================================================================
// CUSTOMER FEEDBACKS & REVIEWS SYNCHRONIZATION
// =========================================================================

/**
 * Removes undefined fields from objects before saving to Firestore
 * to prevent 'Unsupported field value: undefined' errors
 */
function cleanFirestoreData<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      result[key] = value.filter(v => v !== undefined && v !== null);
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      result[key] = cleanFirestoreData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function subscribeToFeedbacksLive(callback: (feedbacks: CustomerFeedback[]) => void): () => void {
  try {
    const feedbacksRef = collection(db, 'feedbacks');
    const unsub = onSnapshot(feedbacksRef, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: CustomerFeedback[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            customerName: data.customerName || 'Khách Hàng Rider',
            customerLocation: data.customerLocation || 'Việt Nam',
            customerAvatar: data.customerAvatar || '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png',
            rating: typeof data.rating === 'number' ? data.rating : 5,
            category: data.category || 'Chất lượng sản phẩm',
            productId: data.productId || undefined,
            productName: data.productName || undefined,
            productImage: data.productImage || undefined,
            comment: data.comment || '',
            images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
            verifiedPurchase: data.verifiedPurchase ?? true,
            date: data.date || new Date().toLocaleDateString('vi-VN'),
            helpfulCount: typeof data.helpfulCount === 'number' ? data.helpfulCount : 0,
            userLiked: data.userLiked || false,
            adminReply: data.adminReply
          });
        });

        // Sort newest first
        loaded.sort((a, b) => b.id.localeCompare(a.id));
        callback(loaded);
      } else {
        // If Firestore feedbacks collection is empty, seed initial feedbacks safely
        INITIAL_FEEDBACKS.forEach((fb) => {
          const safeFb = cleanFirestoreData({
            ...fb,
            images: fb.images || []
          });
          setDoc(doc(db, 'feedbacks', fb.id), safeFb).catch(() => {});
        });
        callback(INITIAL_FEEDBACKS);
      }
    }, (error) => {
      console.warn('Feedbacks live subscription fallback:', error?.message);
    });

    return unsub;
  } catch (e) {
    console.warn('Could not initialize feedbacks live listener:', e);
    return () => {};
  }
}

export async function saveFeedbackLive(feedback: CustomerFeedback): Promise<void> {
  // Normalize payload and strip any undefined fields
  const safePayload = cleanFirestoreData({
    ...feedback,
    images: Array.isArray(feedback.images) ? feedback.images : (feedback.images ? [feedback.images] : []),
    productId: feedback.productId || '',
    productName: feedback.productName || '',
    productImage: feedback.productImage || '',
    syncedAt: new Date().toISOString()
  });

  // 1. Write to Firestore in real time
  try {
    const fbDoc = doc(db, 'feedbacks', feedback.id);
    await setDoc(fbDoc, safePayload, { merge: true });
  } catch (err) {
    console.warn('Firestore feedback write fallback:', err);
  }

  // 2. Also persist to backend API
  try {
    await fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(safePayload)
    });
  } catch (err) {
    console.warn('API feedback write fallback:', err);
  }
}

export async function likeFeedbackLive(feedbackId: string): Promise<void> {
  try {
    const fbDoc = doc(db, 'feedbacks', feedbackId);
    await updateDoc(fbDoc, {
      helpfulCount: increment(1)
    });
  } catch (err) {
    console.warn('Firestore feedback like fallback:', err);
  }

  try {
    await fetch(`/api/feedbacks/${feedbackId}/like`, { method: 'POST' });
  } catch {}
}

// =========================================================================
// REAL-TIME ORDERS & HALL OF FAME CALCULATION (>= 20 SẢN PHẨM)
// =========================================================================

export function subscribeToOrdersLive(callback: (orders: Order[]) => void): () => void {
  try {
    const ordersRef = collection(db, 'orders');
    const unsub = onSnapshot(ordersRef, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Order[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(loaded);
      }
    }, (error) => {
      console.warn('Orders live subscription fallback:', error?.message);
    });
    return unsub;
  } catch (e) {
    console.warn('Could not initialize orders live listener:', e);
    return () => {};
  }
}

export async function saveOrderLive(order: Order): Promise<void> {
  try {
    const orderDoc = doc(db, 'orders', order.id);
    await setDoc(orderDoc, {
      ...order,
      syncedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore order write fallback:', err);
  }
}

// Dynamic calculation of Hall of Fame based on real orders
// STRICT CONDITION: Only customers who have purchased >= 20 products are included
export function computeHallOfFameFromOrders(orders: Order[]): TributeCustomer[] {
  const customerMap: Record<string, {
    name: string;
    totalProducts: number;
    ordersCount: number;
    avatar?: string;
    location?: string;
    productsList: string[];
  }> = {};

  // Aggregate genuine orders
  for (const ord of orders) {
    if (!ord.customerName) continue;
    const name = ord.customerName.trim();
    if (!customerMap[name]) {
      customerMap[name] = {
        name,
        totalProducts: 0,
        ordersCount: 0,
        avatar: ord.customerAvatar,
        location: ord.shippingAddress ? ord.shippingAddress.split(',').pop()?.trim() : undefined,
        productsList: []
      };
    }

    const itemsCount = ord.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1;
    customerMap[name].totalProducts += itemsCount;
    customerMap[name].ordersCount += 1;
    if (ord.items) {
      for (const it of ord.items) {
        if (it.productName && !customerMap[name].productsList.includes(it.productName)) {
          customerMap[name].productsList.push(it.productName);
        }
      }
    }
  }

  // Combine with certified base customers
  const mergedCustomers: TributeCustomer[] = CERTIFIED_TOP_CUSTOMERS.map((cert) => {
    const extra = customerMap[cert.name] || { totalProducts: 0, ordersCount: 0, productsList: [] };
    const combinedProducts = cert.totalProductsPurchased + extra.totalProducts;
    const combinedOrders = cert.totalOrders + extra.ordersCount;
    const allProds = Array.from(new Set([...cert.featuredCollection, ...extra.productsList]));

    return {
      ...cert,
      totalProductsPurchased: combinedProducts,
      totalOrders: combinedOrders,
      featuredCollection: allProds.slice(0, 5)
    };
  });

  // Check if any other real customers reached 20+ products
  for (const [name, data] of Object.entries(customerMap)) {
    const alreadyIncluded = mergedCustomers.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (!alreadyIncluded && data.totalProducts >= 20) {
      mergedCustomers.push({
        id: 'trib-dyn-' + Math.abs(name.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(36),
        name: data.name,
        location: data.location || 'Việt Nam',
        avatar: data.avatar || '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png',
        title: 'Đại Sứ Sưu Tầm',
        tierBadge: 'Thành Viên Vinh Danh',
        totalProductsPurchased: data.totalProducts,
        totalOrders: data.ordersCount,
        memberSince: '2026',
        favoriteSeries: 'Kamen Rider Series',
        featuredCollection: data.productsList.slice(0, 5)
      });
    }
  }

  // CRITICAL FILTER: ONLY customers with >= 20 products purchased!
  const qualified = mergedCustomers.filter(c => (c.totalProductsPurchased || 0) >= 20);

  // Sort descending by total products
  qualified.sort((a, b) => b.totalProductsPurchased - a.totalProductsPurchased);

  // Assign ranking badges
  return qualified.map((c, idx) => ({
    ...c,
    tierBadge: idx === 0 
      ? 'Hạng 1 - Vương Miện Vàng' 
      : idx === 1 
      ? 'Hạng 2 - Vương Miện Bạc' 
      : idx === 2 
      ? 'Hạng 3 - Vương Miện Đồng' 
      : `Top Sưu Tầm #${idx + 1}`
  }));
}

