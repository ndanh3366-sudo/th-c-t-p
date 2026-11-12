import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';

// Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { AboutView } from './views/AboutView';
import { BlogView } from './views/BlogView';
import { PromotionsView } from './views/PromotionsView';
import { WarrantyView } from './views/WarrantyView';
import { AuctionView } from './views/AuctionView';
import { CollectionsView } from './views/CollectionsView';
import { DashboardView } from './views/DashboardView';
import { TributeFeedbackView } from './views/TributeFeedbackView';
import { ContactView } from './views/ContactView';
import { OrderTrackerView } from './views/OrderTrackerView';
import { LiveStreamView } from './views/LiveStreamView';
import { RiderQuiz } from './components/RiderQuiz';
import { LuckyWheelModal } from './components/LuckyWheelModal';
import { ProductCompareModal } from './components/ProductCompareModal';
import { AboutWebModal } from './components/AboutWebModal';
import { CommunityTicker } from './components/CommunityTicker';
import { WishlistModal } from './components/WishlistModal';
import { TeamTributeModal } from './components/TeamTributeModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ChristmasSnowEffect } from './components/ChristmasSnowEffect';
import { ChristmasEventWidget } from './components/ChristmasEventWidget';
import { ChristmasCornerDecor } from './components/ChristmasCornerDecor';
import { HenshinIntroOverlay } from './components/HenshinIntroOverlay';
import { DailyCheckInWidget } from './components/DailyCheckInWidget';
import { CollectorSupportWidget } from './components/CollectorSupportWidget';

import './utils/sound';

// Data
import { INITIAL_PRODUCTS as PRODUCTS_DATA } from './data/products';
import { INITIAL_BLOGS as BLOG_POSTS } from './data/blogs';
import { INITIAL_COUPONS as PROMOTION_COUPONS } from './data/promotions';
import { INITIAL_AUCTIONS as AUCTION_ITEMS } from './data/auctions';
import { INITIAL_ORDERS } from './data/orders';
import { Product, CartItem, User, Order, WarrantyTicket, AuctionItem, BlogPost, Coupon } from './types';
import { api } from './services/api';
import { auth, onAuthStateChanged, signOutFirebase, subscribeToOrdersLive, saveOrderLive } from './utils/firebase';
import { generateCustomerAvatarSvgUrl } from './utils/avatarGenerator';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showIntro, setShowIntro] = useState<boolean>(false);

  const [snowEnabled, setSnowEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('npt_noel_snow');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const handleToggleSnow = React.useCallback(() => {
    setSnowEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('npt_noel_snow', String(next));
      } catch {}
      return next;
    });
  }, []);

  const [soundMuted, setSoundMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('npt_sound_muted') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSound = React.useCallback(() => {
    setSoundMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('npt_sound_muted', String(next));
      } catch {}
      showToast(next ? '🔇 Đã tắt âm thanh' : '🔊 Đã bật âm thanh', 'info');
      return next;
    });
  }, []);


  // Global hotkeys (ESC to close modals)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
        setSelectedBlog(null);
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
        setIsAuthOpen(false);
        setIsAdminOpen(false);
        setIsWheelOpen(false);
        setIsCompareOpen(false);
        setIsWishlistOpen(false);
        setIsAboutOpen(false);
        setIsTributeOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabChange = React.useCallback((newTab: string) => {
    setActiveTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Datasets state (With Offline LocalStorage Hydration and Seed Fallback for Netlify)
  const [products, setProducts] = useState<Product[]>(PRODUCTS_DATA);
  const [auctions, setAuctions] = useState<AuctionItem[]>(AUCTION_ITEMS);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('npt_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ORDERS;
  });
  const [warranties, setWarranties] = useState<WarrantyTicket[]>([]);

  // Dynamic Live Server Sync Effect
  React.useEffect(() => {
    let isMounted = true;
    const fetchServerData = async () => {
      try {
        const [serverProducts, serverAuctions, serverOrders] = await Promise.all([
          api.getProducts(),
          api.getAuctions(),
          api.getOrders()
        ]);
        if (!isMounted) return;
        if (serverProducts && serverProducts.length > 0) {
          setProducts(serverProducts);
        }
        if (serverAuctions && serverAuctions.length > 0) {
          setAuctions(serverAuctions);
        }
        if (serverOrders && serverOrders.length > 0) {
          setOrders(serverOrders);
        }
      } catch (err) {
        console.warn('Live API sync fallback to local datasets:', err);
      }
    };
    fetchServerData();
    return () => { isMounted = false; };
  }, []);

  // Real-time Order synchronization with Firestore & Live Server (Genuine, non-simulated)
  useEffect(() => {
    const unsub = subscribeToOrdersLive((liveOrders) => {
      if (liveOrders && liveOrders.length > 0) {
        setOrders(liveOrders);
      }
    });
    return () => unsub();
  }, []);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('npt_admin_auth') === 'true' || localStorage.getItem('npt_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const handleSetAdminAuthenticated = (val: boolean) => {
    setIsAdminAuthenticated(val);
    try {
      sessionStorage.setItem('npt_admin_auth', String(val));
      localStorage.setItem('npt_admin_auth', String(val));
    } catch {}
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await api.deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast(`🗑️ Đã xóa vĩnh viễn đơn hàng #${orderId}`, 'success');
    } catch {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast(`🗑️ Đã xóa đơn hàng #${orderId}`, 'success');
    }
  };

  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isTributeOpen, setIsTributeOpen] = useState(false);
  const [compareList, setCompareList] = useState<Product[]>([]);

  const handleAddToCompare = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (compareList.some(p => p.id === product.id)) {
      showToast(`⚠️ Sản phẩm [${product.name}] đã có trong danh sách so sánh!`, 'info');
      setIsCompareOpen(true);
      return;
    }
    if (compareList.length >= 3) {
      showToast('⚠️ Chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc!', 'error');
      setIsCompareOpen(true);
      return;
    }
    setCompareList(prev => [...prev, product]);
    showToast(`⚖️ Đã thêm [${product.name}] vào So Sánh!`, 'success');
  };

  // Wishlist state (Hydrated & Persisted)
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('npt_wishlist_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleFavorite = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlistIds(prev => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`💔 Đã bỏ [${product.name}] khỏi Yêu Thích`, 'info');
        return prev.filter(id => id !== product.id);
      } else {
        showToast(`❤️ Đã thêm [${product.name}] vào Yêu Thích!`, 'success');
        return [...prev, product.id];
      }
    });
  };

  // User state (Hydrated & Persisted)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('npt_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Checkout coupon & points state
  const [checkoutCoupon, setCheckoutCoupon] = useState<Coupon | undefined>(undefined);
  const [checkoutPointsUsed, setCheckoutPointsUsed] = useState<number>(0);

  // Cart state (Hydrated & Persisted)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('npt_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Automatic Offline Synchronization Effects
  React.useEffect(() => {
    try {
      localStorage.setItem('npt_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to persist orders', e);
    }
  }, [orders]);

  React.useEffect(() => {
    try {
      localStorage.setItem('npt_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to persist cart', e);
    }
  }, [cartItems]);

  React.useEffect(() => {
    try {
      localStorage.setItem('npt_wishlist_ids', JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn('Failed to persist wishlist', e);
    }
  }, [wishlistIds]);

  React.useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('npt_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('npt_current_user');
      }
    } catch (e) {
      console.warn('Failed to persist user', e);
    }
  }, [currentUser]);

  // Synchronize with Firebase Auth session automatically
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setCurrentUser(prev => {
          if (prev && prev.id === fbUser.uid) return prev;
          return {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Collector Rider',
            email: fbUser.email || '',
            avatar: fbUser.photoURL || undefined,
            phone: fbUser.phoneNumber || undefined,
            role: fbUser.email?.includes('admin') ? 'admin' : 'user',
            riderPoints: prev?.riderPoints ?? 100,
            tierRank: prev?.tierRank ?? 'Novice Rider',
            referralCode: 'RIDER-' + fbUser.uid.substring(0, 5).toUpperCase(),
            wishlist: prev?.wishlist ?? []
          };
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Toast System - quiet notification without top-right visual popup
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    console.log(`[Notification ${type}]:`, msg);
  };

  // Cart Actions
  const handleAddToCart = (product: Product, param2?: React.MouseEvent | number) => {
    if (!currentUser) {
      showToast('⚠️ Đăng nhập nhanh để chốt đơn và tích điểm Rider nhé sếp!', 'info');
      setIsAuthOpen(true);
      return;
    }

    let quantityToAdd = 1;
    if (typeof param2 === 'number') {
      quantityToAdd = param2;
    } else if (param2 && typeof param2 === 'object' && 'stopPropagation' in param2) {
      param2.stopPropagation();
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      }
      return [...prev, { product, quantity: quantityToAdd }];
    });

    showToast(`🛒 Đã chốt [${product.name}] vào giỏ! Tiếp tục săn hàng nào ⚡`, 'success');
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, param2?: React.MouseEvent | number) => {
    if (!currentUser) {
      showToast('⚠️ Đăng nhập nhanh để chốt đơn và tích điểm Rider nhé sếp!', 'info');
      setIsAuthOpen(true);
      return;
    }

    let quantityToAdd = 1;
    if (typeof param2 === 'number') {
      quantityToAdd = param2;
    } else if (param2 && typeof param2 === 'object' && 'stopPropagation' in param2) {
      param2.stopPropagation();
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      }
      return [...prev, { product, quantity: quantityToAdd }];
    });

    showToast(`⚡ Chốt đơn ngay [${product.name}] - Test hàng kỹ trước khi giao!`, 'success');
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCreateOrder = async (order: Order) => {
    try {
      saveOrderLive(order);
      const serverOrder = await api.createOrder(order);
      setOrders(prev => [serverOrder, ...prev.filter(o => o.id !== serverOrder.id)]);
      // Auto refresh products to reflect updated stock on live store
      api.getProducts().then(prods => {
        if (prods && prods.length > 0) setProducts(prods);
      }).catch(() => {});
    } catch {
      setOrders(prev => [order, ...prev]);
    }
    setCartItems([]);
    if (currentUser) {
      // Award Rider Points
      const pointsEarned = Math.floor(order.total / 10000);
      currentUser.riderPoints += pointsEarned;
    }
    showToast(`🎉 Chốt đơn #${order.id} thành công! Team NPT đang đóng gói hàng chuẩn Bandai 🚀`, 'success');
  };

  // Filtered products for search
  const searchedProducts = searchQuery.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.series.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-transparent text-[#F5F2EB] font-sans selection:bg-rose-500 selection:text-white relative">
      {/* Ambient Soft Lighting: Sâu thẳm, dịu mắt, tối ưu hiệu năng */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] z-0"></div>
      <div className="pointer-events-none fixed top-1/3 -right-40 w-96 h-96 bg-rose-600/10 rounded-full blur-[140px] z-0"></div>
      <div className="pointer-events-none fixed -bottom-40 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] z-0"></div>



      {/* Tokusatsu Henshin Intro Screen */}
      {showIntro && (
        <HenshinIntroOverlay onComplete={() => setShowIntro(false)} />
      )}


      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        currentUser={currentUser}
        openCart={() => setIsCartOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        openAuth={() => setIsAuthOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        openAdmin={() => setIsAdminOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        openProfile={() => handleTabChange('dashboard')}
        onOpenProfile={() => handleTabChange('dashboard')}
        onLogout={() => {
          setCurrentUser(null);
          signOutFirebase().catch(() => {});
          showToast('👋 Đã đăng xuất tài khoản!', 'info');
        }}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenWheel={() => setIsWheelOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        compareCount={compareList.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenTribute={() => setIsTributeOpen(true)}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        onReplayIntro={() => setShowIntro(true)}
        isAdminAuthenticated={isAdminAuthenticated}
      />



      {/* Search Result Overlay Page if Query Exists */}
      {searchQuery.trim() ? (
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
          <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-4">
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold">
              Kết Quả Tìm Kiếm CHO: <span className="gold-gradient-text">"{searchQuery}"</span>
            </h2>
            <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-white underline">
              Xóa Tìm Kiếm
            </button>
          </div>

          {searchedProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <i className="fa-solid fa-magnifying-glass text-3xl mb-2 block"></i>
              <p>Không tìm thấy sản phẩm Kamen Rider nào phù hợp với từ khóa này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {searchedProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={(p) => setSelectedProduct(p)}
                  onAddToCart={handleAddToCart}
                  onAddToCompare={handleAddToCompare}
                  isFavorite={wishlistIds.includes(p.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </main>
      ) : (
        /* Dynamic Views Rendering based on activeTab */
        <main className="flex-grow w-full">
          {activeTab === 'home' && (
            <HomeView 
              products={products}
              blogs={BLOG_POSTS}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={handleAddToCart}
              setActiveTab={handleTabChange}
              showToast={showToast}
              wishlistIds={wishlistIds}
              onToggleFavorite={handleToggleFavorite}
              onAddToCompare={handleAddToCompare}
              onSelectBlog={(b) => {
                setSelectedBlog(b);
                handleTabChange('blog');
              }}
            />
          )}

          {activeTab === 'shop' && (
            <ShopView 
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={handleAddToCart}
              onAddToCompare={handleAddToCompare}
              wishlistIds={wishlistIds}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {activeTab === 'livestream' && (
            <LiveStreamView 
              currentUser={currentUser}
              isAdminAuthenticated={isAdminAuthenticated}
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={handleAddToCart}
              onBuyNow={(p) => {
                handleAddToCart(p);
                setIsCheckoutOpen(true);
              }}
              onCloseLive={() => handleTabChange('home')}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'tracker' && (
            <OrderTrackerView orders={orders} showToast={showToast} />
          )}

          {activeTab === 'about' && <AboutView />}

          {activeTab === 'blog' && (
            <BlogView 
              blogs={BLOG_POSTS} 
              selectedPost={selectedBlog} 
              onSelectPost={setSelectedBlog} 
            />
          )}

          {activeTab === 'promotions' && (
            <PromotionsView 
              coupons={PROMOTION_COUPONS}
              currentUser={currentUser}
              showToast={showToast}
            />
          )}

          {activeTab === 'warranty' && (
            <WarrantyView 
              onAddWarrantyTicket={(t) => setWarranties([t, ...warranties])}
              showToast={showToast}
            />
          )}

          {activeTab === 'auction' && (
            <AuctionView 
              auctions={auctions}
              currentUser={currentUser}
              onPlaceBid={async (id, amt, name) => {
                try {
                  const updated = await api.placeBid(id, amt, name);
                  setAuctions(prev => prev.map(a => a.id === id ? updated : a));
                } catch {
                  const item = auctions.find(a => a.id === id);
                  if (item) {
                    item.currentBid = amt;
                    item.highestBidder = name;
                  }
                }
              }}
              showToast={showToast}
            />
          )}

          {activeTab === 'collections' && (
            <CollectionsView 
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={handleAddToCart}
              onAddToCompare={handleAddToCompare}
              wishlistIds={wishlistIds}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {activeTab === 'quiz' && (
            <RiderQuiz 
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              showToast={showToast}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView 
              currentUser={currentUser}
              orders={orders}
              openAuth={() => setIsAuthOpen(true)}
              showToast={showToast}
            />
          )}

          {(activeTab === 'feedback' || activeTab === 'tribute' || activeTab === 'forum') && (
            <TributeFeedbackView 
              currentUser={currentUser}
              showToast={showToast}
              products={products}
              orders={orders}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'contact' && <ContactView showToast={showToast} />}
        </main>
      )}

      {/* Global Footer */}
      <Footer setActiveTab={handleTabChange} showToast={showToast} onOpenTribute={() => setIsTributeOpen(true)} />


      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        showToast={showToast}
        isFavorite={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddToCompare={handleAddToCompare}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onOpenCheckout={(appliedCoupon, pointsUsed) => {
          if (!currentUser) {
            showToast('⚠️ Vui lòng đăng nhập tài khoản để tiến hành thanh toán!', 'info');
            setIsAuthOpen(true);
            return;
          }
          setCheckoutCoupon(appliedCoupon);
          setCheckoutPointsUsed(pointsUsed || 0);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        coupons={PROMOTION_COUPONS}
        userPoints={currentUser?.riderPoints || 0}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        appliedCoupon={checkoutCoupon}
        pointsUsed={checkoutPointsUsed}
        onCompleteOrder={handleCreateOrder}
        showToast={showToast}
        openAuth={() => setIsAuthOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        showToast={showToast}
      />

      {/* Admin Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        warranties={warranties}
        coupons={PROMOTION_COUPONS}
        onAddProduct={async (p) => {
          try {
            const saved = await api.addProduct(p);
            setProducts(prev => [saved, ...prev]);
            showToast(`✅ Đã lưu sản phẩm mới lên máy chủ: ${saved.name}`, 'success');
          } catch {
            setProducts(prev => [p, ...prev]);
            showToast(`✅ Đã tạo sản phẩm: ${p.name}`, 'success');
          }
        }}
        onUpdateOrderStatus={async (orderId, status) => {
          try {
            const updated = await api.updateOrderStatus(orderId, status);
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
          } catch {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
          }
          showToast(`✅ Đã cập nhật trạng thái đơn #${orderId}: ${status}`, 'success');
        }}
        onDeleteOrder={handleDeleteOrder}
        isAdminAuthenticated={isAdminAuthenticated}
        setIsAdminAuthenticated={handleSetAdminAuthenticated}
        showToast={showToast}
      />

      {/* Lucky Wheel Modal */}
      <LuckyWheelModal
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
        currentUser={currentUser}
        showToast={showToast}
      />

      {/* Product Compare Matrix Modal */}
      <ProductCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        compareList={compareList}
        onRemoveFromCompare={(productId) => {
          setCompareList(prev => prev.filter(p => p.id !== productId));
          showToast('🗑️ Đã xóa sản phẩm khỏi danh sách so sánh', 'info');
        }}
        onAddToCart={(product) => {
          handleAddToCart(product);
          setIsCompareOpen(false);
        }}
      />

      {/* About & Biography Modal */}
      <AboutWebModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={products.filter(p => wishlistIds.includes(p.id))}
        onRemoveFromWishlist={(p, e) => handleToggleFavorite(p, e)}
        onAddToCart={(p, e) => {
          handleAddToCart(p, e);
        }}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsWishlistOpen(false);
        }}
        onClearWishlist={() => {
          setWishlistIds([]);
          showToast('🗑️ Đã xóa toàn bộ sản phẩm khỏi Yêu Thích', 'info');
        }}
        showToast={showToast}
      />


      {/* Team NPT Tribute Modal */}
      <TeamTributeModal
        isOpen={isTributeOpen}
        onClose={() => setIsTributeOpen(false)}
        showToast={showToast}
      />

      {/* Thanh thông báo ai mua sản phẩm ở dưới (Duy nhất 1 thanh thông báo) */}
      <CommunityTicker latestOrder={orders[0] || null} />

      {/* PWA Offline Connection Indicator & Toast */}
      <OfflineIndicator />

      {/* Christmas / Noel Holiday Falling Snowflakes (60fps Canvas, Toggleable) */}
      <ChristmasSnowEffect enabled={snowEnabled} />

      {/* Christmas / Noel Floating Holiday Corner Emote Decor */}
      <ChristmasCornerDecor />

      {/* Christmas / Noel Interactive Event Widget (Music, Snow, Voucher) */}
      <ChristmasEventWidget
        snowEnabled={snowEnabled}
        onToggleSnow={handleToggleSnow}
      />

      {/* Daily Check-In Bonus */}
      <DailyCheckInWidget
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        currentUser={currentUser}
        onUpdateUserPoints={(points) => {
          if (currentUser) {
            setCurrentUser(prev => prev ? { ...prev, riderPoints: (prev.riderPoints || 0) + points } : null);
          }
        }}
        showToast={showToast}
      />

      {/* Floating AI Robot Button (🤖 AI / Rider GPT) */}
      <CollectorSupportWidget
        onOpenProduct={(pId) => {
          const found = products.find(p => p.id === pId);
          if (found) setSelectedProduct(found);
        }}
        showToast={showToast}
      />
    </div>
  );
}

export default App;
