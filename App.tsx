
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Question, PRIZES } from './types';
import { fetchQuestion, callFriendAdvice } from './services/geminiService';
import PrizeLadder from './components/PrizeLadder';
import Lifelines from './components/Lifelines';

// روابط أصوات بنمط ديني/إسلامي (روابط مباشرة من Pixabay لمؤثرات صوتية هادئة ومنشدة)
const SOUNDS = {
  start: 'https://cdn.pixabay.com/audio/2024/02/14/audio_91b72e9a38.mp3', // أنشودة بداية هادئة
  correct: 'https://cdn.pixabay.com/audio/2021/08/04/audio_c39486c9d7.mp3', // نغمة نجاح مشرقة
  wrong: 'https://cdn.pixabay.com/audio/2024/02/13/audio_7847473587.mp3', // نغمة تنبيه هادئة للخطأ
  lifeline: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3', 
  win: 'https://cdn.pixabay.com/audio/2022/10/24/audio_d493a7e584.mp3', // تكبيرات أو فرحة إسلامية
  gameOver: 'https://cdn.pixabay.com/audio/2022/03/10/audio_f5747683f8.mp3' 
};

/** 
 * صورة الغلاف المخصصة لعائلة أولاد سليم
 */
const USER_PHOTO = "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1470&auto=format&fit=crop"; 

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    score: 0,
    isGameOver: false,
    hasWon: false,
    usedLifelines: {
      fiftyFifty: false,
      callFriend: false,
      changeQuestion: false,
    },
    hiddenOptions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'checking' | 'correct' | 'wrong'>('idle');
  const [friendMessage, setFriendMessage] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);
  
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playSound = (soundKey: keyof typeof SOUNDS) => {
    if (!audioRefs.current[soundKey]) {
      audioRefs.current[soundKey] = new Audio(SOUNDS[soundKey]);
    }
    const audio = audioRefs.current[soundKey];
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Audio play blocked:", e));
  };

  const loadNextQuestion = useCallback(async (level: number) => {
    setLoading(true);
    setFriendMessage(null);
    setSelectedOption(null);
    setAnswerState('idle');
    try {
      const q = await fetchQuestion(level);
      setCurrentQuestion(q);
      setGameState(prev => ({ ...prev, hiddenOptions: [] }));
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const startGame = () => {
    playSound('start');
    setGameStarted(true);
    loadNextQuestion(1);
  };

  const handleOptionClick = (index: number) => {
    if (answerState !== 'idle' || loading || gameState.hiddenOptions.includes(index)) return;
    setSelectedOption(index);
    setAnswerState('checking');

    setTimeout(() => {
      if (index === currentQuestion?.correctIndex) {
        setAnswerState('correct');
        playSound('correct');
        setTimeout(() => {
          if (gameState.currentLevel === 15) {
            playSound('win');
            setGameState(prev => ({ ...prev, hasWon: true, isGameOver: true }));
          } else {
            const nextLevel = gameState.currentLevel + 1;
            setGameState(prev => ({ ...prev, currentLevel: nextLevel }));
            loadNextQuestion(nextLevel);
          }
        }, 2000);
      } else {
        setAnswerState('wrong');
        playSound('wrong');
        setTimeout(() => {
          playSound('gameOver');
          setGameState(prev => ({ ...prev, isGameOver: true }));
        }, 2000);
      }
    }, 1800);
  };

  const executeChangeQuestion = () => {
    setShowChangeConfirmation(false);
    playSound('lifeline');
    setGameState(prev => ({
      ...prev,
      usedLifelines: { ...prev.usedLifelines, changeQuestion: true }
    }));
    loadNextQuestion(gameState.currentLevel);
  };

  const useLifeline = async (type: 'fiftyFifty' | 'callFriend' | 'changeQuestion') => {
    if (!currentQuestion) return;

    if (type === 'fiftyFifty') {
      playSound('lifeline');
      const options = [0, 1, 2, 3];
      const wrongOptions = options.filter(i => i !== currentQuestion.correctIndex);
      const shuffled = wrongOptions.sort(() => 0.5 - Math.random());
      const toHide = shuffled.slice(0, 2);
      setGameState(prev => ({
        ...prev,
        hiddenOptions: toHide,
        usedLifelines: { ...prev.usedLifelines, fiftyFifty: true }
      }));
    } else if (type === 'callFriend') {
      playSound('lifeline');
      setLoading(true);
      const advice = await callFriendAdvice(currentQuestion);
      setFriendMessage(advice);
      setGameState(prev => ({
        ...prev,
        usedLifelines: { ...prev.usedLifelines, callFriend: true }
      }));
      setLoading(false);
    } else if (type === 'changeQuestion') {
      setShowChangeConfirmation(true);
    }
  };

  const resetGame = () => {
    setGameState({
      currentLevel: 1,
      score: 0,
      isGameOver: false,
      hasWon: false,
      usedLifelines: {
        fiftyFifty: false,
        callFriend: false,
        changeQuestion: false,
      },
      hiddenOptions: []
    });
    setGameStarted(false);
    setCurrentQuestion(null);
    setShowChangeConfirmation(false);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-emerald-950 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40 scale-105"
          style={{ backgroundImage: `url(${USER_PHOTO})` }}
        >
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-lg"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center animate-fade-in w-full max-w-lg text-center">
          <div className="relative mb-10 group">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[12px] border-yellow-500/80 overflow-hidden shadow-[0_0_80px_rgba(234,179,8,0.4)] transition-all duration-1000 group-hover:rotate-3 group-hover:scale-110">
              <img 
                src={USER_PHOTO} 
                alt="أولاد سليم" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-yellow-600 px-12 py-3 rounded-full text-white font-black text-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-2 border-emerald-900">
              أولاد سليم
            </div>
          </div>

          <h1 className="text-7xl md:text-9xl font-black text-yellow-500 mb-6 drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)]">المسابقة</h1>
          <p className="text-xl md:text-2xl text-white/80 font-bold mb-12 tracking-widest">تحدى معلوماتك الدينية مع عائلة سليم</p>

          <button
            onClick={startGame}
            className="group relative px-24 py-6 bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-400 text-white rounded-full text-4xl font-black transition-all transform hover:scale-110 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            <span className="relative z-10">ابدأ الآن</span>
            <div className="absolute inset-0 rounded-full bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row p-4 gap-6 bg-emerald-950 overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${USER_PHOTO})` }}
      >
        <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-[8px]"></div>
      </div>

      <div className="relative z-10 w-full md:w-72 h-[120px] md:h-full">
        <PrizeLadder currentLevel={gameState.currentLevel} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4">
        {gameState.isGameOver ? (
          <div className="text-center bg-emerald-950/95 p-12 rounded-[3rem] border-8 border-yellow-600 shadow-[0_30px_100px_rgba(0,0,0,0.8)] max-w-xl w-full animate-fade-in scale-up">
            {gameState.hasWon ? (
              <>
                <div className="text-8xl mb-6 animate-bounce">🥇</div>
                <h2 className="text-6xl font-black text-yellow-400 mb-6">عبقري سليم!</h2>
                <p className="text-3xl text-white/90 mb-10 leading-relaxed">لقد فزت بمليون ريال من المعلومات الدينية القيمة!</p>
              </>
            ) : (
              <>
                <h2 className="text-5xl font-black text-red-500 mb-6">للأسف، خسرت!</h2>
                <p className="text-2xl text-white/70 mb-4 font-bold">رصيدك المستحق:</p>
                <p className="text-7xl font-black text-yellow-500 mb-12 drop-shadow-2xl">
                  {gameState.currentLevel > 1 ? PRIZES[gameState.currentLevel - 2] : "0"} <span className="text-2xl">ريال</span>
                </p>
              </>
            )}
            <button
              onClick={resetGame}
              className="w-full py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white rounded-[2rem] font-black text-2xl transition-all shadow-2xl active:scale-95 border-b-8 border-yellow-800"
            >
              العب مرة أخرى
            </button>
          </div>
        ) : (
          <div className="w-full max-w-5xl flex flex-col h-full gap-8">
            <Lifelines 
              used={gameState.usedLifelines} 
              onUse={useLifeline} 
              disabled={loading || answerState !== 'idle'} 
            />

            <div className="flex-1 flex flex-col justify-center gap-12">
              {loading ? (
                <div className="text-center py-24 bg-emerald-950/60 rounded-[3rem] border-2 border-yellow-600/20 backdrop-blur-md">
                  <div className="inline-block animate-spin rounded-full h-24 w-24 border-8 border-yellow-500 border-t-transparent shadow-2xl"></div>
                  <p className="mt-10 text-yellow-500 font-black text-3xl animate-pulse">السؤال التالي في الطريق...</p>
                </div>
              ) : currentQuestion ? (
                <>
                  <div className="relative p-12 bg-emerald-950/90 border-4 border-yellow-600 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center q-font overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-yellow-500 to-yellow-700 px-10 py-3 rounded-full text-white text-xl font-black border-2 border-emerald-900 shadow-2xl">
                      سؤال {gameState.currentLevel} • {PRIZES[gameState.currentLevel-1]} ريال
                    </div>
                    <h2 className="text-3xl md:text-5xl leading-tight text-white font-black drop-shadow-2xl mt-4">
                      {currentQuestion.text}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentQuestion.options.map((opt, idx) => {
                      const isHidden = gameState.hiddenOptions.includes(idx);
                      const isSelected = selectedOption === idx;
                      const isCorrect = currentQuestion.correctIndex === idx;

                      let baseStyle = "relative p-6 md:p-10 text-right border-4 rounded-[1.5rem] transition-all duration-500 flex items-center gap-6 overflow-hidden shadow-2xl group ";
                      let stateStyle = "bg-emerald-900/80 border-yellow-600/40 hover:bg-yellow-600/30 hover:border-yellow-400 backdrop-blur-md";
                      
                      if (isSelected) {
                        if (answerState === 'checking') {
                          stateStyle = "bg-blue-600 border-white scale-105 shadow-[0_0_50px_rgba(37,99,235,0.7)] animate-pulse z-20";
                        } else if (answerState === 'correct') {
                          stateStyle = "bg-green-600 border-white shadow-[0_0_60px_rgba(34,197,94,0.8)] scale-110 z-20 font-black";
                        } else if (answerState === 'wrong') {
                          stateStyle = "bg-red-600 border-white scale-105 z-20";
                        }
                      } else if (answerState === 'wrong') {
                        // تمييز جميع الخيارات الخاطئة باللون الأحمر عند الخسارة
                        if (isCorrect) {
                          stateStyle = "bg-green-600 border-white shadow-[0_0_60px_rgba(34,197,94,0.8)] scale-110 z-20 font-black";
                        } else {
                          stateStyle = "bg-red-600/40 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)] opacity-80 scale-95";
                        }
                      } else if (answerState === 'correct') {
                         if (!isCorrect) stateStyle = "bg-emerald-950/30 border-transparent opacity-30 scale-95";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(idx)}
                          disabled={isHidden || answerState !== 'idle'}
                          className={`${baseStyle} ${stateStyle} ${isHidden ? 'opacity-0 pointer-events-none' : ''}`}
                        >
                          <span className={`text-3xl font-black ${isSelected || (answerState === 'wrong' && isCorrect) || (answerState === 'wrong' && !isCorrect) ? 'text-white' : 'text-yellow-500'}`}>
                            {['أ', 'ب', 'ج', 'د'][idx]}:
                          </span>
                          <span className="text-2xl md:text-3xl flex-1 text-white font-bold">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>

            {friendMessage && (
              <div className="bg-blue-900/90 border-4 border-blue-400 p-8 rounded-[2.5rem] flex gap-8 items-center animate-fade-in backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center shadow-2xl border-4 border-white/30 text-white">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21a10.003 10.003 0 008.384-4.51l.054.09m-4.289-3.95A5 5 0 1114.95 4.95a5 5 0 010 7.071z" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-blue-300 mb-2 tracking-widest uppercase">مكالمة صديق ديني:</p>
                  <p className="text-2xl italic text-white leading-relaxed font-bold">"{friendMessage}"</p>
                </div>
                <button onClick={() => setFriendMessage(null)} className="text-white/40 hover:text-white transition-all hover:scale-125">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showChangeConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-2xl">
          <div className="bg-emerald-950 border-8 border-yellow-600 p-12 rounded-[4rem] shadow-[0_0_150px_rgba(0,0,0,1)] max-w-xl w-full text-center scale-up">
            <h3 className="text-4xl font-black mb-8 text-white leading-tight">تغيير السؤال؟</h3>
            <p className="text-white/60 mb-12 text-xl italic font-bold">سيتم استبدال السؤال الحالي بواحد جديد تماماً.</p>
            <div className="flex flex-col gap-6">
              <button
                onClick={executeChangeQuestion}
                className="w-full py-6 bg-gradient-to-r from-yellow-700 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white rounded-[2rem] font-black text-3xl transition-all shadow-2xl active:scale-95 border-b-8 border-yellow-800"
              >
                نعم، غيره لي
              </button>
              <button
                onClick={() => setShowChangeConfirmation(false)}
                className="w-full py-4 bg-transparent hover:bg-white/10 text-white/50 rounded-[2rem] font-bold text-xl transition-colors border-2 border-white/20"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
