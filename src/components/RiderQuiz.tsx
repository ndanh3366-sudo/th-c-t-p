import React, { useState } from 'react';
import { QUIZ_QUESTIONS, RIDER_RESULTS, RiderResult } from '../data/quiz';
import { Product } from '../types';

interface RiderQuizProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const RiderQuiz: React.FC<RiderQuizProps> = ({ products, onSelectProduct, showToast }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<RiderResult | null>(null);

  const handleSelectOption = (riderKey: string) => {
    const nextAnswers = [...answers, riderKey];
    setAnswers(nextAnswers);

    if (currentQuestionIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate most selected rider
      const counts: Record<string, number> = {};
      nextAnswers.forEach(r => { counts[r] = (counts[r] || 0) + 1; });
      let maxRider = 'Gavv';
      let maxCount = 0;
      Object.entries(counts).forEach(([r, c]) => {
        if (c > maxCount) {
          maxCount = c;
          maxRider = r;
        }
      });
      const finalResult = RIDER_RESULTS[maxRider] || RIDER_RESULTS['Gavv'];
      setResult(finalResult);
      showToast('🎉 Đã tìm ra Kamen Rider định mệnh của bạn!', 'success');
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
  };

  const recommendedProduct = result 
    ? products.find(p => p.id === result.recommendedBeltId) || products[0]
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 text-[#F5F2EB]">
      <div className="text-center space-y-2">
        <span className="bg-[#8B1E1E] text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
          🔥 Interactive Henshin Quiz
        </span>
        <h2 className="font-serif-title text-2xl sm:text-4xl font-black">
          Trắc Nghiệm: <span className="gold-gradient-text">BẠN LÀ KAMEN RIDER NÀO?</span>
        </h2>
        <p className="text-xs text-gray-400">Khám phá tính cách và chiếc đai Henshin Belt định mệnh của bạn</p>
      </div>

      {!result ? (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Progress */}
          <div className="flex items-center justify-between text-xs font-bold text-gray-400">
            <span>Câu hỏi {currentQuestionIndex + 1} / {QUIZ_QUESTIONS.length}</span>
            <span className="text-[#C9A84C]">{Math.round(((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-[#0D0D0D] rounded-full h-2 overflow-hidden border border-[#2A2A2A]">
            <div 
              className="bg-gradient-to-r from-[#C9A84C] to-[#8B1E1E] h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Text */}
          <h3 className="font-serif-title text-lg sm:text-xl font-bold text-[#F5F2EB] pt-2">
            {QUIZ_QUESTIONS[currentQuestionIndex].question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt.rider)}
                className="w-full text-left p-4 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] hover:border-[#C9A84C] hover:bg-[#222222] transition text-xs sm:text-sm text-gray-200 hover:text-white flex items-center justify-between group"
              >
                <span>{opt.label}</span>
                <i className="fa-solid fa-chevron-right text-gray-600 group-hover:text-[#C9A84C] text-xs"></i>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Result Screen */
        <div className="bg-gradient-to-r from-[#1A1A1A] via-[#222222] to-[#1A1A1A] border border-[#C9A84C] rounded-3xl p-6 sm:p-10 space-y-6 text-center shadow-2xl animate-fadeIn">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest block">Kết Quả Biến Hình Dành Cho Bạn</span>
            <h3 className="font-serif-title text-2xl sm:text-4xl font-black text-[#F5F2EB]">
              {result.name}
            </h3>
            <p className="text-xs font-bold text-rose-400 italic">"{result.henshinCatchphrase}"</p>
          </div>

          <div className="aspect-video max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-[#C9A84C] shadow-2xl">
            <img src={result.image} alt={result.name} className="w-full h-full object-cover" />
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl mx-auto">
            {result.description}
          </p>

          {/* Recommended Product Box */}
          {recommendedProduct && (
            <div className="bg-[#0D0D0D] border border-[#2A2A2A] p-4 rounded-2xl max-w-md mx-auto flex items-center gap-4 text-left">
              <img src={recommendedProduct.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover bg-black" />
              <div className="flex-grow min-w-0">
                <span className="text-[9px] text-[#C9A84C] font-bold uppercase">Đai Biến Hình Định Mệnh</span>
                <h4 className="font-bold text-xs text-white truncate">{recommendedProduct.name}</h4>
                <p className="text-xs font-mono font-bold text-[#C9A84C]">{recommendedProduct.price.toLocaleString('vi-VN')}đ</p>
              </div>
              <button 
                onClick={() => onSelectProduct(recommendedProduct)}
                className="px-3 py-2 bg-[#C9A84C] text-[#0A0A0A] font-extrabold text-xs rounded-xl whitespace-nowrap"
              >
                Xem
              </button>
            </div>
          )}

          <div className="pt-4">
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-[#222222] border border-[#2A2A2A] text-gray-300 hover:text-white font-bold text-xs rounded-xl"
            >
              <i className="fa-solid fa-rotate-left mr-1"></i> Làm Lại Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
