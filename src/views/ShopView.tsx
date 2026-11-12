import React, { useState, useMemo } from 'react';
import { Product, CategoryType, EraType } from '../types';
import { ProductCard } from '../components/ProductCard';

interface ShopViewProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, e: React.MouseEvent) => void;
  onAddToCompare?: (p: Product, e: React.MouseEvent) => void;
  wishlistIds?: string[];
  onToggleFavorite?: (p: Product, e?: React.MouseEvent) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onAddToCompare,
  wishlistIds = [],
  onToggleFavorite
}) => {
  type PriceTier = 'all' | 'under-500k' | '500k-1.5m' | '1.5m-3.5m' | '3.5m-8m' | 'above-8m';
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedEra, setSelectedEra] = useState<EraType | 'all'>('all');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedPriceTier, setSelectedPriceTier] = useState<PriceTier>('all');
  const [viewMode, setViewMode] = useState<'grid-4' | 'grid-3' | 'list'>('grid-4');
  const [priceMax, setPriceMax] = useState<number>(20000000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'bestseller'>('featured');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'New Seal 100%' | 'Like New 99%'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const deferredSearch = React.useDeferredValue(searchKeyword);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedEra !== 'all') count++;
    if (selectedSeries !== 'all') count++;
    if (selectedPriceTier !== 'all') count++;
    if (priceMax < 20000000) count++;
    if (conditionFilter !== 'all') count++;
    if (deferredSearch.trim()) count++;
    return count;
  }, [selectedCategory, selectedEra, selectedSeries, selectedPriceTier, priceMax, conditionFilter, deferredSearch]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedEra('all');
    setSelectedSeries('all');
    setSelectedPriceTier('all');
    setPriceMax(20000000);
    setConditionFilter('all');
    setSearchKeyword('');
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    const list = products.filter(p => {
      // Keyword search
      if (query) {
        const matchName = p.name.toLowerCase().includes(query);
        const matchSeries = p.series.toLowerCase().includes(query);
        if (!matchName && !matchSeries) return false;
      }

      if (selectedCategory !== 'all') {
        if (selectedCategory === 'shf-premium' && p.category !== 'shf-pbandai' && p.category !== 'shf-premium') return false;
        else if (selectedCategory === 'super-sentai' && p.category !== 'sentai' && p.category !== 'super-sentai') return false;
        else if (selectedCategory === 'item-card' && p.category !== 'item' && p.category !== 'item-card') return false;
        else if (selectedCategory === 'poster' && p.category !== 'poster') return false;
        else if (!['shf-premium', 'super-sentai', 'item-card', 'poster'].includes(selectedCategory) && p.category !== selectedCategory) return false;
      }
      if (selectedEra !== 'all' && p.era !== selectedEra) return false;
      if (selectedSeries !== 'all') {
        if (selectedSeries === 'Sentai') {
          if (!p.series.toLowerCase().includes('sentai') && p.category !== 'super-sentai') return false;
        } else if (selectedSeries === 'Heisei') {
          if (p.era !== 'Heisei') return false;
        } else if (!p.series.toLowerCase().includes(selectedSeries.toLowerCase())) {
          return false;
        }
      }
      if (conditionFilter !== 'all' && p.condition !== conditionFilter) return false;
      
      // Filter price tiers
      if (selectedPriceTier !== 'all') {
        if (selectedPriceTier === 'under-500k' && p.price >= 500000) return false;
        if (selectedPriceTier === '500k-1.5m' && (p.price < 500000 || p.price > 1500000)) return false;
        if (selectedPriceTier === '1.5m-3.5m' && (p.price < 1500000 || p.price > 3500000)) return false;
        if (selectedPriceTier === '3.5m-8m' && (p.price < 3500000 || p.price > 8000000)) return false;
        if (selectedPriceTier === 'above-8m' && p.price < 8000000) return false;
      }

      if (p.price > priceMax) return false;
      return true;
    });

    // Sort immutable copy
    const sorted = [...list];
    if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'bestseller') sorted.sort((a, b) => b.soldCount - a.soldCount);
    return sorted;
  }, [products, searchKeyword, selectedCategory, selectedEra, selectedSeries, conditionFilter, selectedPriceTier, priceMax, sortBy]);

  const popularSeries = [
    { id: 'all', label: 'Tất Cả Series' },
    { id: 'Gavv', label: 'Gavv 🍬' },
    { id: 'Gotchard', label: 'Gotchard 🃏' },
    { id: 'Geats', label: 'Geats 🦊' },
    { id: 'Revice', label: 'Revice 🦖' },
    { id: 'Saber', label: 'Saber ⚔️' },
    { id: 'Zero-One', label: 'Zero-One 🦗' },
    { id: 'Zeztz', label: 'Zeztz ⚡' },
    { id: 'Heisei', label: 'Heisei All 👑' },
    { id: 'Sentai', label: 'Super Sentai 🤖' },
  ];

  const ITEMS_PER_PAGE = 16;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const categoryOptions = [
    { id: 'all', label: 'Tất Cả Thư Mục', logo: '' },
    { id: 'shf', label: 'Mô Hình SHF Standard', logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png' },
    { id: 'shf-premium', label: 'Mô Hình SHF Premium', logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_kiva_logo_by_driftingcar_dg7tj5z-pre.png' },
    { id: 'super-sentai', label: 'Robot Super Sentai & SMP', logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_saber_logo_by_driftingcar_dgh9vay-pre.png' },
    { id: 'item-card', label: 'Item & Thẻ Bài Capsem', logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_femme_logo_by_driftingcar_dg73lkh-pre.png' },
    { id: 'dx-belt', label: 'Đai DX Belt & Driver', logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_revice_logo_by_driftingcar_dghk15w-pre.png' },
    { id: 'weapon', label: 'Vũ Khí & Khẩu Súng Kiếm', logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_knight_logo_by_driftingcar_dg73k3x-414w-2x.png' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#F5F2EB]">
      {/* Page Header */}
      <div className="border-b border-cyan-500/25 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs uppercase font-extrabold text-cyan-300 tracking-widest">KHO HÀNG BANDAI JAPAN CHÍNH HÃNG</span>
          </div>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-white text-pop">
            Kho Sản Phẩm <span className="aqua-gradient-text">KAMEN RIDER & TOKUSATSU</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Đai biến hình DX, CSM, mô hình S.H.Figuarts, vũ khí và thẻ bài chính hãng Bandai Japan
          </p>
        </div>

        {/* In-Page Fast Filter Search */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên hoặc series..."
            className="w-full bg-[#080e22] border border-cyan-500/35 focus:border-cyan-300 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-300 transition"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs"></i>
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips & Mobile Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080e22] border border-cyan-500/30 p-3 rounded-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <i className="fa-solid fa-filter text-cyan-400 text-xs"></i>
            <span>Đang chọn:</span>
          </span>

          {activeFilterCount === 0 ? (
            <span className="text-xs text-slate-400 italic">Tất cả sản phẩm ({filteredProducts.length})</span>
          ) : (
            <>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold">
                  {categoryOptions.find(c => c.id === selectedCategory)?.label || selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {selectedEra !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold">
                  Kỷ nguyên: {selectedEra}
                  <button onClick={() => setSelectedEra('all')} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {selectedSeries !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold">
                  Series: {selectedSeries}
                  <button onClick={() => setSelectedSeries('all')} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {selectedPriceTier !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold">
                  Giá: {selectedPriceTier}
                  <button onClick={() => setSelectedPriceTier('all')} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {conditionFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold">
                  {conditionFilter}
                  <button onClick={() => setConditionFilter('all')} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {searchKeyword.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold">
                  "{searchKeyword}"
                  <button onClick={() => setSearchKeyword('')} className="hover:text-white ml-0.5">✕</button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold ml-2 cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="lg:hidden px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <i className="fa-solid fa-sliders text-xs"></i>
          <span>{isMobileFiltersOpen ? 'Đóng bộ lọc' : 'Mở bộ lọc'}</span>
          {activeFilterCount > 0 && (
            <span className="bg-cyan-400 text-slate-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters - Responsive desktop + mobile collapsible */}
        <div className={`${isMobileFiltersOpen ? 'block' : 'hidden lg:block'} lg:col-span-3 bg-[#080e1e] border border-cyan-500/35 p-5 rounded-3xl space-y-6 text-xs text-slate-200 shadow-xl`}>
          <div className="flex items-center justify-between border-b border-cyan-500/25 pb-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <i className="fa-solid fa-sliders text-cyan-400"></i> Bộ Lọc Nâng Cao
            </h4>
            {activeFilterCount > 0 && (
              <button 
                onClick={handleResetFilters}
                className="text-[10px] text-cyan-300 hover:text-white underline cursor-pointer"
              >
                Đặt lại
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-300 uppercase text-[10px] tracking-wider">
              Thư Mục Sản Phẩm
            </label>
            <div className="space-y-1">
              {categoryOptions.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as any);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl transition flex items-center gap-2.5 cursor-pointer ${
                    selectedCategory === cat.id 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20' 
                      : 'hover:bg-cyan-950/40 text-slate-300 border border-transparent hover:border-cyan-500/20'
                  }`}
                >
                  {cat.logo ? (
                    <div className="w-6 h-6 rounded-lg bg-[#050914] p-0.5 border border-cyan-400/40 flex items-center justify-center shrink-0">
                      <img src={cat.logo} alt={cat.label} className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <i className="fa-solid fa-layer-group text-xs text-cyan-400 pl-1"></i>
                  )}
                  <span className="truncate text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Era Filter */}
          <div className="space-y-2 pt-2 border-t border-cyan-500/25">
            <label className="block font-bold text-slate-300 uppercase text-[10px] tracking-wider">
              Kỷ Nguyên (Era)
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'Reiwa', label: '令和 Reiwa' },
                { id: 'Heisei', label: '平成 Heisei' },
                { id: 'Showa', label: '昭和 Showa' }
              ].map(era => (
                <button
                  key={era.id}
                  onClick={() => {
                    setSelectedEra(era.id as any);
                    setCurrentPage(1);
                  }}
                  className={`py-1.5 px-2 rounded-xl border text-center font-bold text-[11px] transition cursor-pointer ${
                    selectedEra === era.id 
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm' 
                      : 'bg-[#060b18] border-cyan-500/30 text-slate-300 hover:border-cyan-400/60'
                  }`}
                >
                  {era.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diverse Price Tiers Filter */}
          <div className="space-y-2.5 pt-2 border-t border-cyan-500/25">
            <div className="flex justify-between items-center font-bold text-[10px] uppercase text-slate-300">
              <span className="flex items-center gap-1 text-cyan-300">
                <i className="fa-solid fa-coins"></i> Phân Khúc Mức Giá
              </span>
              {selectedPriceTier !== 'all' && (
                <button 
                  onClick={() => setSelectedPriceTier('all')} 
                  className="text-[9px] text-cyan-300 underline font-normal"
                >
                  Xóa lọc giá
                </button>
              )}
            </div>
            
            <div className="space-y-1">
              {[
                { id: 'all', label: 'Tất Cả Mức Giá' },
                { id: 'under-500k', label: '⚡ Dưới 500.000đ (Thẻ/Box/Mini)' },
                { id: '500k-1.5m', label: '🪙 500.000đ - 1.500.000đ (Phổ thông)' },
                { id: '1.5m-3.5m', label: '⚔️ 1.500.000đ - 3.500.000đ (Đai DX)' },
                { id: '3.5m-8m', label: '🌟 3.500.000đ - 8.000.000đ (Cao cấp/SHF)' },
                { id: 'above-8m', label: '👑 Trên 8.000.000đ (CSM Hoàng Gia)' }
              ].map(tier => (
                <button
                  key={tier.id}
                  onClick={() => {
                    setSelectedPriceTier(tier.id as any);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center justify-between cursor-pointer ${
                    selectedPriceTier === tier.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                      : 'bg-[#060b18] border-cyan-500/25 text-slate-300 hover:text-white hover:border-cyan-400/50'
                  }`}
                >
                  <span>{tier.label}</span>
                  {selectedPriceTier === tier.id && <i className="fa-solid fa-check text-[10px]"></i>}
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="pt-2">
              <div className="flex justify-between font-bold text-[10px] uppercase text-slate-300">
                <span>Trần Giá Lọc:</span>
                <span className="text-[#00f5d4] font-mono font-black">{priceMax.toLocaleString('vi-VN')}đ</span>
              </div>
              <input 
                type="range" 
                min="100000" 
                max="20000000" 
                step="200000"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-cyan-400 cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2 pt-2 border-t border-cyan-500/25">
            <label className="block font-bold text-slate-300 uppercase text-[10px] tracking-wider">
              Tình Trạng Hàng
            </label>
            <div className="space-y-1">
              {['all', 'New Seal 100%', 'Like New 99%'].map(cond => (
                <button
                  key={cond}
                  onClick={() => {
                    setConditionFilter(cond as any);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl transition text-[11px] cursor-pointer ${
                    conditionFilter === cond 
                      ? 'bg-cyan-950/70 text-cyan-300 font-bold border border-cyan-400/60' 
                      : 'text-slate-300 hover:text-white hover:bg-cyan-950/20'
                  }`}
                >
                  {cond === 'all' ? 'Tất cả tình trạng' : cond}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Main Grid */}
        <div className="lg:col-span-9 space-y-6">
          {/* Quick Popular Series Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {popularSeries.map(s => (
              <button
                key={s.id}
                onClick={() => { setSelectedSeries(s.id); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  selectedSeries === s.id
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'bg-[#080e1e] border border-cyan-500/30 text-slate-300 hover:text-white hover:border-cyan-400'
                }`}
              >
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Top Bar Sort & View Mode Switcher */}
          <div className="bg-[#080e1e] border border-cyan-500/35 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-lg">
            <span className="text-slate-300 font-medium">
              Hiển thị <strong className="text-white font-bold">{filteredProducts.length}</strong> sản phẩm phù hợp
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* View Mode Buttons */}
              <div className="flex items-center gap-1 bg-[#050914] p-1 rounded-xl border border-cyan-500/30">
                <button
                  type="button"
                  onClick={() => setViewMode('grid-4')}
                  className={`p-1.5 px-2 rounded-lg text-xs transition cursor-pointer ${viewMode === 'grid-4' ? 'bg-cyan-500/25 text-[#00f5d4] font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Lưới 4 cột tiêu chuẩn"
                >
                  <i className="fa-solid fa-table-cells"></i>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid-3')}
                  className={`p-1.5 px-2 rounded-lg text-xs transition cursor-pointer ${viewMode === 'grid-3' ? 'bg-cyan-500/25 text-[#00f5d4] font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Lưới 3 cột lớn"
                >
                  <i className="fa-solid fa-grip"></i>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 px-2 rounded-lg text-xs transition cursor-pointer ${viewMode === 'list' ? 'bg-cyan-500/25 text-[#00f5d4] font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Danh sách hàng ngang chi tiết"
                >
                  <i className="fa-solid fa-list"></i>
                </button>
              </div>

              {/* Sắp xếp */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 hidden sm:inline">Sắp xếp:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#050914] border border-cyan-500/40 text-xs font-bold text-white px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-300 cursor-pointer"
                >
                  <option value="featured">Nổi bật nhất</option>
                  <option value="bestseller">Bán chạy nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid List */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#080e1e] border border-cyan-500/35 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-xl">
              <i className="fa-solid fa-box-open text-4xl text-cyan-400 block mb-2"></i>
              <p className="font-bold text-white text-base">Không tìm thấy sản phẩm Kamen Rider phù hợp với bộ lọc</p>
              <p className="text-xs text-slate-300">Hãy thử nới lỏng điều kiện lọc hoặc đặt lại bộ lọc để tìm thấy món đồ chơi bạn yêu thích.</p>
              <button 
                onClick={handleResetFilters}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs hover:brightness-110 shadow-md shadow-cyan-500/20 cursor-pointer transition"
              >
                Xóa Bộ Lọc & Tìm Lại
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {viewMode === 'grid-4' && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {paginatedProducts.map(p => (
                    <ProductCard 
                      key={p.id}
                      product={p}
                      onSelect={onSelectProduct}
                      onAddToCart={onAddToCart}
                      onAddToCompare={onAddToCompare}
                      isFavorite={wishlistIds.includes(p.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'grid-3' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map(p => (
                    <ProductCard 
                      key={p.id}
                      product={p}
                      onSelect={onSelectProduct}
                      onAddToCart={onAddToCart}
                      onAddToCompare={onAddToCompare}
                      isFavorite={wishlistIds.includes(p.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="space-y-4">
                  {paginatedProducts.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className="bg-[#080e1e] border border-cyan-500/35 hover:border-cyan-400 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/15 cursor-pointer group"
                    >
                      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl bg-[#050914] border border-cyan-500/25 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                        <img 
                          src={p.images[0]} 
                          alt={p.name} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg'; }}
                        />
                      </div>
                      
                      <div className="flex-grow space-y-1.5 min-w-0 text-left w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                            {p.series}
                          </span>
                          <span className="text-[10px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                            {p.condition}
                          </span>
                          {p.isCSM && (
                            <span className="text-[9px] font-black uppercase text-slate-950 bg-sky-400 px-1.5 py-0.5 rounded">CSM</span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {p.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {p.description || 'Sản phẩm Bandai Japan chính hãng nhập khẩu nguyên seal 100%'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-300">
                          <span className="text-cyan-400 font-bold flex items-center gap-1">
                            <i className="fa-solid fa-star text-xs"></i> {p.rating ? p.rating.toFixed(1) : '5.0'}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">Đã bán {p.soldCount || 120}</span>
                          <span>•</span>
                          <span className="text-slate-400">Kho: {p.stock}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-cyan-500/20">
                        <div>
                          <div className="text-base sm:text-lg font-mono font-black text-[#00f5d4]">
                            {p.price.toLocaleString('vi-VN')}đ
                          </div>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <div className="text-[11px] text-slate-400 line-through font-mono">
                              {p.originalPrice.toLocaleString('vi-VN')}đ
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {onToggleFavorite && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onToggleFavorite(p, e); }}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center border transition ${
                                wishlistIds.includes(p.id) ? 'bg-rose-600 text-white border-rose-500' : 'bg-[#050914] text-slate-300 border-cyan-500/30 hover:text-rose-400'
                              }`}
                              title="Yêu thích"
                            >
                              <i className="fa-solid fa-heart text-xs"></i>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onAddToCart(p, e); }}
                            className="btn-cart-hover-glow px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-md shadow-cyan-500/20 hover:scale-105 hover:shadow-[0_0_22px_rgba(0,245,212,0.8)] cursor-pointer"
                          >
                            <i className="fa-solid fa-cart-plus"></i>
                            <span>Mua</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-cyan-500/25">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="px-3 py-2 rounded-xl bg-[#080e1e] border border-cyan-500/35 text-xs font-bold text-slate-300 hover:text-cyan-300 disabled:opacity-40 cursor-pointer"
                  >
                    ← Trang Trước
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentPage(idx + 1);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-xl font-bold text-xs transition cursor-pointer ${
                        currentPage === idx + 1
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                          : 'bg-[#080e1e] border border-cyan-500/35 text-slate-300 hover:text-white hover:border-cyan-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="px-3 py-2 rounded-xl bg-[#080e1e] border border-cyan-500/35 text-xs font-bold text-slate-300 hover:text-cyan-300 disabled:opacity-40 cursor-pointer"
                  >
                    Trang Sau →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
