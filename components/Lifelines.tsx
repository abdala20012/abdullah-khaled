
import React from 'react';

interface LifelinesProps {
  used: {
    fiftyFifty: boolean;
    callFriend: boolean;
    changeQuestion: boolean;
  };
  onUse: (type: 'fiftyFifty' | 'callFriend' | 'changeQuestion') => void;
  disabled: boolean;
}

const Lifelines: React.FC<LifelinesProps> = ({ used, onUse, disabled }) => {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <button
        onClick={() => !used.fiftyFifty && onUse('fiftyFifty')}
        disabled={disabled || used.fiftyFifty}
        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
          used.fiftyFifty 
            ? 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed grayscale' 
            : 'border-yellow-600 bg-emerald-900 hover:bg-yellow-600 text-white hover:shadow-yellow-600/50 shadow-lg'
        }`}
        title="حذف إجابتين"
      >
        <span className="text-xl font-bold">50:50</span>
      </button>

      <button
        onClick={() => !used.callFriend && onUse('callFriend')}
        disabled={disabled || used.callFriend}
        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
          used.callFriend 
            ? 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed grayscale' 
            : 'border-yellow-600 bg-emerald-900 hover:bg-yellow-600 text-white hover:shadow-yellow-600/50 shadow-lg'
        }`}
        title="اتصال بصديق"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>

      <button
        onClick={() => !used.changeQuestion && onUse('changeQuestion')}
        disabled={disabled || used.changeQuestion}
        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
          used.changeQuestion 
            ? 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed grayscale' 
            : 'border-yellow-600 bg-emerald-900 hover:bg-yellow-600 text-white hover:shadow-yellow-600/50 shadow-lg'
        }`}
        title="تغيير السؤال"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
};

export default Lifelines;
