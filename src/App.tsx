/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';

type LevelType = 'beginner' | 'experienced' | null;
type RoleType = 'dev' | 'qa' | 'manager' | null;
type GoalType = 'exam' | 'career' | 'curiosity' | null;

interface Profile {
  level: LevelType;
  role: RoleType;
  goal: GoalType;
}

interface DecisionOption {
  title: string;
  sub: string;
  isCorrect: boolean;
  what: string;
  why: string;
}

interface DecisionData {
  id: number;
  topic: string;
  time: string;
  title: string;
  desc: {
    dev: string;
    qa: string;
    manager: string;
  };
  optionA: DecisionOption;
  optionB: DecisionOption;
  hint: string;
  socraticQuestion: string;
}

interface ChatMessage {
  id: string;
  sender: 'tutor' | 'user';
  text: string;
  time: string;
}

interface AnswerRecord {
  decisionIndex: number;
  choice: 'A' | 'B' | 'TIMEOUT';
  isWrong: boolean;
  topic: string;
  title: string;
  what: string;
  why: string;
}

const DECISIONS: DecisionData[] = [
  {
    id: 1,
    topic: 'KARAR 1 · MİMARİ',
    time: '08:05',
    title: 'Randevu servisi üretimde çöktü. Müdahale refleksin ne olacak?',
    desc: {
      dev: 'v2.4.0 dağıtımı sonrası PostgreSQL connection pool tükendi. Canlı loglarda "too many clients" dönüyor.',
      qa: 'Canlı ortama yeni çıkan sürüm regression oluşturdu. 300 hasta gişede bekliyor.',
      manager: 'Kritik hasta kabul servisi SLA sınırını aştı. Kriz masasında ilk kararı vermen gerekiyor.',
    },
    optionA: {
      title: 'Eski sürüme geri dön',
      sub: 'v2.3.9 stabil imajına anında rollback başlat',
      isCorrect: true,
      what: 'Sistem 4 dakika içinde v2.3.9 kararlı sürümüne rollback edildi. Veritabanı bağlantı havuzu normale döndü ve 300 hastanın randevusu açıldı.',
      why: 'Canlıda doğrudan kod yamamak (hotfix) test edilmemiş yeni yan etkilere yol açabilirdi. Rollback stratejisi kriz anında en güvenli mimari reflekstir.',
    },
    optionB: {
      title: 'Canlıda yama yap',
      sub: 'Konteyner havuz limitini SSH ile canlıda sıcak güncelle',
      isCorrect: false,
      what: 'SSH ile canlı yapılandırma güncellenirken bir konteyner crash oldu; veritabanı kilitlendi ve kesinti 25 dakika daha uzadı.',
      why: 'Üretim ortamında acil sıcak yama yapmak mimari drift ve kontrolsüz yan etkilere yol açar. Test edilmemiş yama felaketi derinleştirir.',
    },
    hint: 'Geri dönmeden önce son sürümde veritabanı şema göçü (migration) olup olmadığını ve eski kodun bu şemayla uyumlu kalıp kalmadığını düşün.',
    socraticQuestion: 'Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?',
  },
  {
    id: 2,
    topic: 'KARAR 2 · TEST & DOĞRULAMA',
    time: '08:12',
    title: 'Rollback/düzeltme sonrası sistemi yayına nasıl alacaksın?',
    desc: {
      dev: 'Kod tabanı hazırlandı fakat acil durum testi koşulmalı mı yoksa saniyeler bile kıymetli mi?',
      qa: 'Smoke test otomasyonunu 90 saniyede çalıştırabilirsin veya doğrudan prod trafiğine açabilirsin.',
      manager: 'Yönetim bir an önce servisin yeşile dönmesini istiyor. Hız ile kalite dengesini kurmalısın.',
    },
    optionA: {
      title: 'Önce kısa test koş',
      sub: 'Canary / Staging üzerinde 60 saniyelik kritik smoke test yürüt',
      isCorrect: true,
      what: 'Kısa smoke test sayesinde poliklinik hekim randevu listeleme API\'sinin sorunsuz çalıştığı doğrulandıktan sonra trafik açıldı.',
      why: 'Baskı altında dahi en temel 1-2 kritik akışı test etmek (smoke testing), düzeltmenin yeni bir çöküş yaratmadığından emin olmanın tek yoludur.',
    },
    optionB: {
      title: 'Hemen yayına al',
      sub: 'Test ile vakit kaybetmeden trafiği doğrudan içeri ver',
      isCorrect: false,
      what: 'Test edilmeden açılan serviste hekim yetkilendirme token hatası fark edilemedi; hastalar randevu ekranında beyaz ekranla karşılaştı.',
      why: 'Kriz anında "zaman kazanmak" için test atlamak, gizli hataların canlıda 300 hasta üzerinde test edilmesine ve güven kaybına sebep olur.',
    },
    hint: 'En azından en kritik "randevu sorgulama" ve "onaylama" gibi birkaç temel akışın çalıştığını 1 dakikada doğrulamak sana ne kazandırır?',
    socraticQuestion: 'Test yapmadan yayına aldığında ortaya çıkabilecek bir hatayı kullanıcıdan önce kim tespit edebilir?',
  },
  {
    id: 3,
    topic: 'KARAR 3 · KVKK & LOG GÜVENLİĞİ',
    time: '08:18',
    title: 'Hata ayıklamak için ortak Slack/kriz kanalına log aktaracaksın.',
    desc: {
      dev: 'Hatanın stack trace ve SQL kayıtlarında hastaların T.C. kimlik ve teşhis bilgileri görünüyor.',
      qa: 'Paylaşacağın loglar tüm nöbetçi mühendis ve stajyerlerin görebileceği genel kanala gidecek.',
      manager: 'Veri mahremiyeti ve kriz koordinasyonu arasında mevzuat riski var.',
    },
    optionA: {
      title: 'Logdaki hasta adını ve T.C.\'yi maskele',
      sub: 'Hassas PII alanlarını regex ile [MASKELENDİ] yaparak ilet',
      isCorrect: true,
      what: 'Loglardaki hassas kişisel sağlık ve kimlik verileri anında maskelenerek mühendislik ekibine iletildi. Hata hızla çözüldü ve KVKK korundu.',
      why: 'Kriz ortamı dahi olsa sağlık ve kimlik verilerinin korunması kanuni zorunluluktur. Maskeleme hem sorunun görülmesini sağlar hem ihlali önler.',
    },
    optionB: {
      title: 'Logu ekibe olduğu gibi ham at',
      sub: 'Vakit kaybetmemek için tüm SQL ve hasta dökümünü kanala yapıştır',
      isCorrect: false,
      what: '300 hastanın adı, T.C. kimlik numarası ve muayene teşhisleri yetkisiz ortak kanalda depolandı. KVKK Madde 12 uyarınca resmi soruşturma başlatıldı.',
      why: 'Operasyonel hız, hasta mahremiyetinin ve KVKK uyumluluğunun önüne konulamaz. Sızan kişisel veriler geri alınamaz cezai sonuçlar doğurur.',
    },
    hint: 'Teknik kök nedeni görmek için hastanın gerçek T.C. kimlik numarasına veya adına gerçekten ihtiyaç var mı?',
    socraticQuestion: 'Bir hata analizinde mühendisin sistem parametreleri haricinde gerçek hasta kimliğine ihtiyacı var mıdır?',
  },
];

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [apiKeyInputVal, setApiKeyInputVal] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');

  // Screen states: 'Giris' | 'Kriz' | 'Karar1' | 'Karar2' | 'Karar3' | 'SonA' | 'SonB'
  const [currentState, setCurrentState] = useState<string>('Giris');

  // Profile selection
  const [profile, setProfile] = useState<Profile>({
    level: null,
    role: null,
    goal: null,
  });
  const [errors, setErrors] = useState<{ level?: boolean; role?: boolean; goal?: boolean }>({});

  // Decision flow
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | 'TIMEOUT' | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [hintOpen, setHintOpen] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);

  // Socratic Tutor
  const [tutorQuestion, setTutorQuestion] = useState<string>(DECISIONS[0].socraticQuestion);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'tutor',
      text: DECISIONS[0].socraticQuestion,
      time: '08:05',
    },
  ]);
  const [tutorInput, setTutorInput] = useState<string>('');
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Theme synchronization
  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('theme-light');
      document.documentElement.classList.remove('dark');
    } else {
      document.body.classList.remove('theme-light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Audio helper
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (freq: number, type: OscillatorType = 'sine', duration = 0.15, vol = 0.12) => {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio error suppressed
    }
  };

  const playSfx = (type: 'click' | 'correct' | 'wrong' | 'tick' | 'fanfare') => {
    if (!soundEnabled) return;
    if (type === 'click') {
      playTone(600, 'triangle', 0.06, 0.08);
    } else if (type === 'correct') {
      playTone(523.25, 'sine', 0.12, 0.12);
      setTimeout(() => playTone(659.25, 'sine', 0.16, 0.12), 100);
      setTimeout(() => playTone(783.99, 'sine', 0.25, 0.14), 220);
    } else if (type === 'wrong') {
      playTone(220, 'sawtooth', 0.2, 0.12);
      setTimeout(() => playTone(180, 'sawtooth', 0.25, 0.14), 120);
    } else if (type === 'tick') {
      playTone(880, 'sine', 0.04, 0.05);
    } else if (type === 'fanfare') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, idx) => {
        setTimeout(() => playTone(n, 'triangle', 0.22, 0.15), idx * 120);
      });
    }
  };

  // Confetti launch for Son A
  const launchConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number;
      y: number;
      r: number;
      color: string;
      vx: number;
      vy: number;
      gravity: number;
      alpha: number;
      decay: number;
    }[] = [];
    const colors = ['#FFE600', '#4ADE9A', '#FFFFFF', '#38BDF8', '#F472B6'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        r: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -12 - 4,
        gravity: 0.35,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008,
      });
    }

    let animationId: number;
    function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (alive) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    render();

    return () => cancelAnimationFrame(animationId);
  };

  // Timer logic for experienced players during decision screens
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const isDecisionScreen =
      currentState === 'Karar1' || currentState === 'Karar2' || currentState === 'Karar3';

    if (isDecisionScreen && profile.level === 'experienced' && selectedChoice === null) {
      setTimeLeft(60);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 10 && prev > 1) {
            playSfx('tick');
          }
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleMakeChoice('TIMEOUT');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentState, profile.level, selectedChoice, currentDecisionIndex]);

  // Victory / Defeat sound triggers
  useEffect(() => {
    if (currentState === 'SonA') {
      playSfx('fanfare');
      launchConfetti();
    } else if (currentState === 'SonB') {
      playSfx('wrong');
    }
  }, [currentState]);

  // Current decision data
  const currentDecision = DECISIONS[currentDecisionIndex] || DECISIONS[0];
  const userRole = profile.role || 'dev';

  // Socratic question updates when decision step advances
  useEffect(() => {
    if (DECISIONS[currentDecisionIndex]) {
      const q = DECISIONS[currentDecisionIndex].socraticQuestion;
      setTutorQuestion(q);
      setChatHistory([
        {
          id: `init-${currentDecisionIndex + 1}`,
          sender: 'tutor',
          text: q,
          time: DECISIONS[currentDecisionIndex].time,
        },
      ]);
    }
    setHintOpen(false);
    setSelectedChoice(null);
  }, [currentDecisionIndex]);

  // Profile Selection handlers
  const handleSelectProfile = (field: keyof Profile, value: string) => {
    playSfx('click');
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleStartGame = () => {
    playSfx('click');
    const newErrors: { level?: boolean; role?: boolean; goal?: boolean } = {};
    if (!profile.level) newErrors.level = true;
    if (!profile.role) newErrors.role = true;
    if (!profile.goal) newErrors.goal = true;

    if (Object.keys(newErrors).length > 0) {
      playSfx('wrong');
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentState('Kriz');
  };

  const startDecisionFlow = () => {
    playSfx('click');
    setCurrentDecisionIndex(0);
    setAnswers([]);
    setSelectedChoice(null);
    setCurrentState('Karar1');
  };

  const handleMakeChoice = (choice: 'A' | 'B' | 'TIMEOUT') => {
    if (selectedChoice !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedChoice(choice);
    const data = currentDecision;

    let isWrong = false;
    let whatText = '';
    let whyText = '';

    if (choice === 'A') {
      isWrong = !data.optionA.isCorrect;
      whatText = data.optionA.what;
      whyText = data.optionA.why;
      playSfx('correct');
    } else if (choice === 'B') {
      isWrong = !data.optionB.isCorrect;
      whatText = data.optionB.what;
      whyText = data.optionB.why;
      playSfx('wrong');
    } else if (choice === 'TIMEOUT') {
      isWrong = true;
      whatText =
        '60 saniye içinde karar verilemediği için randevu servisi askıda kaldı ve veritabanı bağlantıları kilitlendi.';
      whyText =
        'Kriz esnasında kararsızlık en kötü karardan daha fazla kayba yol açar. SLA süresi aşıldığı için müdahale başarısız sayıldı.';
      playSfx('wrong');
    }

    const record: AnswerRecord = {
      decisionIndex: currentDecisionIndex,
      choice,
      isWrong,
      topic: data.topic,
      title: data.title,
      what: whatText,
      why: whyText,
    };

    setAnswers((prev) => [...prev, record]);
  };

  const handleContinueNextStep = () => {
    playSfx('click');
    if (currentDecisionIndex < 2) {
      const nextIndex = currentDecisionIndex + 1;
      setCurrentDecisionIndex(nextIndex);
      setCurrentState(`Karar${nextIndex + 1}`);
    } else {
      const wrongCount = answers.filter((a) => a.isWrong).length;
      if (wrongCount === 0) {
        setCurrentState('SonA');
      } else {
        setCurrentState('SonB');
      }
    }
  };

  const restartSimulation = () => {
    playSfx('click');
    setProfile({ level: null, role: null, goal: null });
    setCurrentDecisionIndex(0);
    setAnswers([]);
    setSelectedChoice(null);
    setCurrentState('Giris');
  };

  // Socratic AI Tutor submit
  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = tutorInput.trim();
    if (!text || isTutorLoading) return;

    playSfx('click');
    setTutorInput('');

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: timeStr,
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsTutorLoading(true);

    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 40);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          currentDecision: `Karar ${currentDecisionIndex + 1}`,
          sceneTitle: currentDecision.title,
          sceneDesc: currentDecision.desc[userRole] || currentDecision.desc.dev,
          optionA: `${currentDecision.optionA.title} - ${currentDecision.optionA.sub}`,
          optionB: `${currentDecision.optionB.title} - ${currentDecision.optionB.sub}`,
          history: chatHistory.map((m) => ({ sender: m.sender, text: m.text })),
          customApiKey: apiKey || undefined,
        }),
      });
      const data = await res.json();
      const reply = data?.question || 'Mühendislik prensiplerini ve olası riskleri düşünerek adım atmalısın.';

      setTutorQuestion(reply);
      setChatHistory((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}`,
          sender: 'tutor',
          text: reply,
          time: timeStr,
        },
      ]);
      playSfx('correct');
    } catch {
      const fallback =
        currentDecision.id === 1
          ? 'Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?'
          : currentDecision.id === 2
          ? 'Sistemi test etmeden doğrudan yayına aldığında oluşabilecek yeni bir hatayı kim fark eder?'
          : 'Bir yazılım mühendisi hatayı çözmek için gerçek bir hastanın kimliğine mi ihtiyaç duyar?';
      setTutorQuestion(fallback);
      setChatHistory((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}`,
          sender: 'tutor',
          text: fallback,
          time: timeStr,
        },
      ]);
      playSfx('click');
    } finally {
      setIsTutorLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    }
  };

  // Result panel details
  const currentAnswer = answers.find((a) => a.decisionIndex === currentDecisionIndex);
  const isCurrentWrong = currentAnswer ? currentAnswer.isWrong : false;

  return (
    <>
      <canvas id="confetti-canvas" ref={canvasRef}></canvas>

      <main className="w-full max-w-[420px] min-h-screen bg-appBg flex flex-col relative px-4 pt-safe pb-safe shadow-2xl border-x border-appBorder">
        {/* TOP HEADER: CONTROLS & NIGHT/DAY MODE */}
        <header
          data-cy="app-header"
          className="flex items-center justify-between py-2 px-2 border-b border-appBorder mb-3 rounded-xl backdrop-blur-md"
          style={{ backgroundColor: 'var(--header-bg)' }}
        >
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600] animate-ping absolute opacity-75"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600] relative"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black tracking-widest uppercase text-appText flex items-center gap-1">
                SE PRIMER <span className="text-[#FFE600] drop-shadow-sm font-extrabold">· 08:00</span>
              </span>
              <span className="text-[9px] text-appMuted flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-appMint"></span> Kriz Odası
              </span>
            </div>
          </div>

          {/* Quick Controls: Theme (Night/Light) + Sound + API */}
          <div className="flex items-center gap-1.5">
            {/* Night / Light Mode Button */}
            <button
              id="themeToggleBtn"
              data-cy="theme-toggle-btn"
              onClick={() => {
                playSfx('click');
                setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
              }}
              title="Gece / Gündüz Modu"
              className="p-1.5 rounded-lg bg-appSurface text-[#FFE600] border border-appBorder hover:bg-appSurfaceHigh transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]" id="themeIcon">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
              </span>
            </button>

            {/* Audio Toggle Button */}
            <button
              id="soundToggleBtn"
              data-cy="audio-toggle-btn"
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                if (nextState) playTone(520, 'sine', 0.1);
              }}
              title="Sesi Aç/Kapat"
              className="p-1.5 rounded-lg bg-appSurface text-[#FFE600] border border-appBorder hover:bg-appSurfaceHigh transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${!soundEnabled ? 'opacity-40' : ''}`}
                id="soundIcon"
              >
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
            </button>

            {/* Gemini API Button */}
            <button
              id="apiKeyToggleBtn"
              data-cy="api-key-toggle-btn"
              onClick={() => {
                playSfx('click');
                setApiKeyInputVal(apiKey);
                setApiKeyModalOpen(true);
              }}
              className="text-[11px] text-appMuted hover:text-appText flex items-center gap-1 bg-appSurface px-2 py-1.5 rounded-lg border border-appBorder active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-[#FFE600]">key</span>
              <span
                id="apiKeyStatusText"
                data-cy="api-key-status"
                className={`font-bold ${apiKey ? 'text-appMint' : ''}`}
              >
                {apiKey ? 'Gemini' : 'API'}
              </span>
            </button>
          </div>
        </header>

        {/* GEMINI API MODAL */}
        <div
          id="apiKeyModal"
          data-cy="api-key-modal"
          className={`${
            apiKeyModalOpen ? 'flex' : 'hidden'
          } fixed inset-0 z-50 bg-black/80 backdrop-blur-sm items-center justify-center p-4`}
        >
          <div className="bg-appSurface border border-appBorder w-full max-w-sm rounded-2xl p-5 flex flex-col gap-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-[#FFE600] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">smart_toy</span> Gemini Sokratik Model
              </h3>
              <button
                data-cy="api-key-modal-close-btn"
                onClick={() => {
                  playSfx('click');
                  setApiKeyModalOpen(false);
                }}
                className="text-appMuted hover:text-appText p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <p className="text-xs text-appMuted leading-relaxed">
              Google Gemini API anahtarınızı girerseniz Sokratik AI Tutor canlı Gemini API'ye bağlanır. Boş bırakırsanız sunucu tabanlı model ve dahili sokratik soru motoru devrede kalır.
            </p>
            <input
              type="password"
              id="geminiApiKeyInput"
              data-cy="gemini-api-key-input"
              value={apiKeyInputVal}
              onChange={(e) => setApiKeyInputVal(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-appBg text-xs p-3 rounded-xl border border-appBorder text-appText focus:outline-none focus:border-[#FFE600]"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                data-cy="api-key-save-btn"
                onClick={() => {
                  playSfx('correct');
                  const trimmed = apiKeyInputVal.trim();
                  setApiKey(trimmed);
                  localStorage.setItem('gemini_api_key', trimmed);
                  setApiKeyModalOpen(false);
                }}
                className="px-4 py-2 app-main-btn font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                Kaydet & Kapat
              </button>
            </div>
          </div>
        </div>

        {/* SCREEN 1: GİRİŞ (DURUM: Giris) */}
        <section
          id="screen-giris"
          data-cy="screen-giris"
          className={`${
            currentState === 'Giris' ? 'flex' : 'hidden'
          } screen-fade flex-col flex-1 justify-between pb-2`}
        >
          <div className="flex flex-col gap-3">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-appSurface border border-appBorder p-4 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFE600]/20 border border-[#FFE600]/40 text-[#FFE600] text-[10px] font-black tracking-wider uppercase mb-2">
                <span className="material-symbols-outlined text-xs">local_hospital</span> ACİL SAĞLIK MİMARİSİ
              </div>
              <h1 className="text-2xl font-black tracking-tight text-appText leading-tight">
                08:00, Randevu Sistemi Çöktü
              </h1>
              <p className="text-xs text-appMuted mt-1 leading-relaxed">
                300 hasta kapıda, veritabanı kilit. Kriz masasında kararlarını vermeden önce profilini belirle.
              </p>

              {/* Animated EKG Pulse line */}
              <div className="mt-3 pt-2.5 border-t border-appBorder flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-20 h-5" viewBox="0 0 100 24">
                    <path
                      d="M0,12 L30,12 L35,4 L40,20 L45,2 L50,18 L55,12 L100,12"
                      fill="none"
                      stroke="#FFE600"
                      strokeWidth="2.2"
                      className="ekg-line"
                    ></path>
                  </svg>
                  <span className="text-[10px] font-mono font-bold text-[#FFE600] animate-pulse">
                    SİSTEM_NABZI: KRİTİK
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-appBg border border-appBorder text-appMint">
                  v2.4.0
                </span>
              </div>
            </div>

            {/* 3 Required Profile Questions */}
            <div className="flex flex-col gap-2.5">
              {/* 01 Level */}
              <div
                id="wrapper-level"
                data-cy="question-level-wrapper"
                className={`p-3 rounded-xl bg-appSurface border transition-all ${
                  errors.level ? 'border-appMercan' : 'border-appBorder'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black tracking-wider text-[#FFE600] uppercase flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-appBg border border-appBorder flex items-center justify-center text-[10px] font-mono text-[#FFE600]">
                      1
                    </span>
                    Seviyen?
                  </span>
                  <span id="badge-level" data-cy="badge-level" className="text-[10px] text-appMuted font-mono">
                    Zorunlu
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2" role="radiogroup">
                  <button
                    type="button"
                    data-cy="level-beginner"
                    onClick={() => handleSelectProfile('level', 'beginner')}
                    className={`btn-profile-opt min-h-[46px] px-3 py-2 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer ${
                      profile.level === 'beginner'
                        ? 'border-[#FFE600] bg-[#FFE600]/15 shadow-glow-yellow'
                        : 'border-appBorder bg-appBg'
                    }`}
                  >
                    <span>Yeni başladım</span>
                    <span
                      className={`material-symbols-outlined text-sm ${
                        profile.level === 'beginner' ? 'text-[#FFE600]' : 'opacity-40'
                      }`}
                    >
                      {profile.level === 'beginner' ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>
                  <button
                    type="button"
                    data-cy="level-experienced"
                    onClick={() => handleSelectProfile('level', 'experienced')}
                    className={`btn-profile-opt min-h-[46px] px-3 py-2 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer ${
                      profile.level === 'experienced'
                        ? 'border-[#FFE600] bg-[#FFE600]/15 shadow-glow-yellow'
                        : 'border-appBorder bg-appBg'
                    }`}
                  >
                    <span>Deneyimliyim</span>
                    <span
                      className={`material-symbols-outlined text-sm ${
                        profile.level === 'experienced' ? 'text-[#FFE600]' : 'opacity-40'
                      }`}
                    >
                      {profile.level === 'experienced' ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>
                </div>
                {errors.level && (
                  <p
                    id="error-level"
                    data-cy="error-level"
                    className="text-[11px] text-appMercan mt-1.5 flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-xs">warning</span> Lütfen deneyim seviyeni belirle.
                  </p>
                )}
              </div>

              {/* 02 Role */}
              <div
                id="wrapper-role"
                data-cy="question-role-wrapper"
                className={`p-3 rounded-xl bg-appSurface border transition-all ${
                  errors.role ? 'border-appMercan' : 'border-appBorder'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black tracking-wider text-[#FFE600] uppercase flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-appBg border border-appBorder flex items-center justify-center text-[10px] font-mono text-[#FFE600]">
                      2
                    </span>
                    Rolün?
                  </span>
                  <span id="badge-role" data-cy="badge-role" className="text-[10px] text-appMuted font-mono">
                    Zorunlu
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2" role="radiogroup">
                  <button
                    type="button"
                    data-cy="role-dev"
                    onClick={() => handleSelectProfile('role', 'dev')}
                    className={`btn-profile-opt min-h-[46px] p-2 rounded-xl border text-center text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.98] cursor-pointer ${
                      profile.role === 'dev'
                        ? 'border-[#FFE600] bg-[#FFE600]/15 shadow-glow-yellow'
                        : 'border-appBorder bg-appBg'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm text-[#FFE600]">code</span>
                    <span className="text-[11px]">Geliştirici</span>
                  </button>
                  <button
                    type="button"
                    data-cy="role-qa"
                    onClick={() => handleSelectProfile('role', 'qa')}
                    className={`btn-profile-opt min-h-[46px] p-2 rounded-xl border text-center text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.98] cursor-pointer ${
                      profile.role === 'qa'
                        ? 'border-[#FFE600] bg-[#FFE600]/15 shadow-glow-yellow'
                        : 'border-appBorder bg-appBg'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm text-appMint">bug_report</span>
                    <span className="text-[11px]">Testçi (QA)</span>
                  </button>
                  <button
                    type="button"
                    data-cy="role-manager"
                    onClick={() => handleSelectProfile('role', 'manager')}
                    className={`btn-profile-opt min-h-[46px] p-2 rounded-xl border text-center text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.98] cursor-pointer ${
                      profile.role === 'manager'
                        ? 'border-[#FFE600] bg-[#FFE600]/15 shadow-glow-yellow'
                        : 'border-appBorder bg-appBg'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm text-[#FFE600]">account_tree</span>
                    <span className="text-[11px]">Yönetici</span>
                  </button>
                </div>
                {errors.role && (
                  <p
                    id="error-role"
                    data-cy="error-role"
                    className="text-[11px] text-appMercan mt-1.5 flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-xs">warning</span> Lütfen nöbetteki rolünü seç.
                  </p>
                )}
              </div>

              {/* 03 Goal */}
              <div
                id="wrapper-goal"
                data-cy="question-goal-wrapper"
                className={`p-3 rounded-xl bg-appSurface border transition-all ${
                  errors.goal ? 'border-appMercan' : 'border-appBorder'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black tracking-wider text-[#FFE600] uppercase flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-appBg border border-appBorder flex items-center justify-center text-[10px] font-mono text-[#FFE600]">
                      3
                    </span>
                    Hedefin?
                  </span>
                  <span id="badge-goal" data-cy="badge-goal" className="text-[10px] text-appMuted font-mono">
                    Zorunlu
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2" role="radiogroup">
                  <button
                    type="button"
                    data-cy="goal-exam"
                    onClick={() => handleSelectProfile('goal', 'exam')}
                    className={`btn-profile-opt min-h-[46px] p-2 rounded-xl border text-center text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.98] cursor-pointer ${
                      profile.goal === 'exam'
                        ? 'border-[#FFE600] bg-[#FFE600]/15 shadow-glow-yellow'
                        : 'border-appBorder bg-appBg'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm text-appMuted">school</span>
                    <span className="text-[11px]">Sınav</span>
                  </button>
                  <button
                    type="button"
                    data-cy="goal-career"
                    onClick={() => handleSelectProfile('goal', 'career')}
                    className={`btn-profile-opt min-h-[46px] p-2 rounded-xl border text-center text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.98] cursor-pointer ${
                      profile.goal === 'career'
                        ? 'border-[#FFE600] bg-[#FFE600]/15 shadow-glow-yellow'
                        : 'border-appBorder bg-appBg'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm text-appMuted">trending_up</span>
                    <span className="text-[11px]">Kariyer</span>
                  </button>
                  <button
                    type="button"
                    data-cy="goal-curiosity"
                    onClick={() => handleSelectProfile('goal', 'curiosity')}
                    className={`btn-profile-opt min-h-[46px] p-2 rounded-xl border text-center text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.98] cursor-pointer ${
                      profile.goal === 'curiosity'
                        ? 'border-[#FFE600] bg-[#FFE600]/15 shadow-glow-yellow'
                        : 'border-appBorder bg-appBg'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm text-appMuted">lightbulb</span>
                    <span className="text-[11px]">Merak</span>
                  </button>
                </div>
                {errors.goal && (
                  <p
                    id="error-goal"
                    data-cy="error-goal"
                    className="text-[11px] text-appMercan mt-1.5 flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-xs">warning</span> Lütfen hedefini belirle.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="mt-4 pt-1">
            <button
              type="button"
              id="startBtn"
              data-cy="start"
              onClick={handleStartGame}
              className="w-full min-h-[52px] app-main-btn font-black text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg cursor-pointer"
            >
              <span>Kriz Odasına Giriş Yap</span>
              <span className="material-symbols-outlined text-lg">bolt</span>
            </button>
          </div>
        </section>

        {/* SCREEN 2: KRİZ BRİFİNGİ (DURUM: Kriz) */}
        <section
          id="screen-kriz"
          data-cy="screen-kriz"
          className={`${
            currentState === 'Kriz' ? 'flex' : 'hidden'
          } screen-fade flex-col flex-1 justify-between pb-2`}
        >
          <div className="flex flex-col gap-3.5">
            {/* P0 Incident Banner */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-appMercan/20 border border-appMercan/50 text-appMercan shadow-glow-mercan">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-appMercan animate-ping"></span>
                <span className="text-xs font-black tracking-wider uppercase">ACİL MÜDAHALE · P0 ÇÖKÜŞ</span>
              </div>
              <span className="text-[11px] font-mono font-bold">08:00 TSİ</span>
            </div>

            {/* Briefing Card */}
            <div className="bg-appSurface border border-appBorder rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-appBorder pb-2">
                <span className="text-xs font-black text-[#FFE600] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">domain</span> Şehir Hastanesi Bilgi İşlem
                </span>
                <span className="text-[10px] font-mono text-appMuted bg-appBg px-2 py-0.5 rounded border border-appBorder">
                  INC-9102
                </span>
              </div>

              <h2 className="text-base font-extrabold text-appText leading-snug">
                "Randevu servisi HTTP 503 veriyor. Kapıda 300 hasta onay bekliyor!"
              </h2>

              <p id="kriz-personalized-text" data-cy="kriz-briefing-text" className="text-xs text-appMuted leading-relaxed">
                {userRole === 'dev'
                  ? 'Dün gece v2.4.0 dağıtımı canlıya alındı. Saat 08:00\'de poliklinikler açıldığı an PostgreSQL connection pool tükendi ve servis çöktü. Geliştirici olarak terminal başındasın.'
                  : userRole === 'qa'
                  ? 'Dün gece v2.4.0 dağıtımı canlıya alındı. Saat 08:00\'de regression patlak verdi ve 300 hasta gişede kaldı. Test mühendisi gözüyle riskleri denetleyerek müdahale et.'
                  : 'Dün gece v2.4.0 dağıtımı canlıya alındı. 300 hasta gişede bekliyor ve başhekimlik açıklama istiyor. Yönetici olarak servis sürekliliği ve KVKK dengesini kurmalısın.'}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-appBg p-2.5 rounded-xl border border-appBorder flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-appMercan/15 text-appMercan flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base">group</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-appMuted">Kuyruk</span>
                    <span className="text-xs font-black text-appText">300+ Hasta</span>
                  </div>
                </div>
                <div className="bg-appBg p-2.5 rounded-xl border border-appBorder flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FFE600]/20 text-[#FFE600] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base">timer</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-appMuted">SLA Limiti</span>
                    <span className="text-xs font-black text-[#FFE600]">&lt; 15 Dakika</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-appSurface/80 rounded-xl p-3 border border-appBorder flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#FFE600] text-base mt-0.5">assignment_turned_in</span>
              <div className="text-[11px] text-appMuted leading-relaxed">
                <strong className="text-appText block mb-0.5">Kriz Kuralı:</strong>
                3 ardışık kararla sistemi kurtaracaksın. Her seçimin sonuçları ("ne oldu / neden oldu") anında işletilecektir.
              </div>
            </div>
          </div>

          {/* Crisis Continue Button */}
          <div className="mt-4 pt-1">
            <button
              type="button"
              id="krizContinueBtn"
              data-cy="kriz-continue"
              onClick={startDecisionFlow}
              className="w-full min-h-[52px] app-main-btn font-black text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg cursor-pointer"
            >
              <span>Operasyonu Başlat</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* SCREEN 3: DECISION SCREEN (DURUM: Karar1, Karar2, Karar3) */}
        <section
          id="screen-decision"
          data-cy="screen-decision"
          className={`${
            currentState === 'Karar1' || currentState === 'Karar2' || currentState === 'Karar3'
              ? 'flex'
              : 'hidden'
          } screen-fade flex-col flex-1 pb-2`}
        >
          {/* Stepper & Timer/Hint Header Bar */}
          <div className="flex items-center justify-between py-2 border-b border-appBorder mb-3">
            {/* 3 Step Dots */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5" id="step-dots-container" data-cy="step-dots">
                {[0, 1, 2].map((i) => {
                  let dotClass = 'w-2.5 h-2 rounded-full bg-appSurfaceHigh transition-all';
                  if (i === currentDecisionIndex) {
                    dotClass = 'w-6 h-2 rounded-full bg-[#FFE600] transition-all shadow-glow-yellow';
                  } else if (i < currentDecisionIndex) {
                    dotClass = 'w-2.5 h-2 rounded-full bg-appMint transition-all';
                  }
                  return <div key={i} id={`dot-${i + 1}`} className={dotClass}></div>;
                })}
              </div>
              <span
                id="decision-step-label"
                data-cy="decision-step-label"
                className="text-xs font-black text-appMuted uppercase tracking-wider ml-1"
              >
                Karar {currentDecisionIndex + 1}/3
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 60s Countdown for "experienced" */}
              {profile.level === 'experienced' && (
                <div
                  id="timer-badge"
                  data-cy="timer"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-appSurface border shadow-sm ${
                    timeLeft <= 10
                      ? 'border-appMercan text-appMercan animate-pulse'
                      : 'border-appBorder text-[#FFE600]'
                  }`}
                >
                  <svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="none" r="14" stroke="#1E3574" strokeWidth="3"></circle>
                    <circle
                      id="timer-ring"
                      cx="18"
                      cy="18"
                      fill="none"
                      r="14"
                      stroke={timeLeft <= 10 ? '#FF6B5B' : '#FFE600'}
                      strokeDasharray="88"
                      strokeDashoffset={88 - (timeLeft / 60) * 88}
                      strokeLinecap="round"
                      strokeWidth="3"
                    ></circle>
                  </svg>
                  <span id="timer-seconds" data-cy="timer-seconds" className="text-xs font-mono font-black text-appText">
                    {timeLeft}s
                  </span>
                </div>
              )}

              {/* Hint Button for "beginner" */}
              {profile.level === 'beginner' && (
                <button
                  type="button"
                  id="hint-button"
                  data-cy="hint-button"
                  onClick={() => {
                    playSfx('click');
                    setHintOpen((prev) => !prev);
                  }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFE600]/20 text-[#FFE600] text-xs font-black border border-[#FFE600]/40 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">lightbulb</span>
                  <span>İpucu</span>
                </button>
              )}
            </div>
          </div>

          {/* Scene Card */}
          <div
            className="bg-appSurface border border-appBorder rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden shadow-lg"
            data-cy="scene-card"
          >
            <div className="flex items-center justify-between">
              <span
                id="scene-topic-badge"
                data-cy="scene-topic"
                className="text-[10px] font-black tracking-widest uppercase text-[#FFE600] bg-[#FFE600]/15 px-2 py-0.5 rounded border border-[#FFE600]/30"
              >
                {currentDecision.topic}
              </span>
              <span className="text-[11px] text-appMuted flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-xs">schedule</span> {currentDecision.time}
              </span>
            </div>

            <h2 id="scene-title" data-cy="scene-title" className="text-sm font-black text-appText leading-snug">
              {currentDecision.title}
            </h2>

            <p id="scene-description" data-cy="scene-description" className="text-xs text-appMuted leading-relaxed">
              {currentDecision.desc[userRole] || currentDecision.desc.dev}
            </p>

            {/* Expandable Hint (Yeni Başladım) */}
            <div
              id="hint-content"
              data-cy="hint-content"
              className={`${
                hintOpen ? 'flex' : 'hidden'
              } mt-2 p-3 rounded-xl bg-appBg border border-[#FFE600]/50 text-xs text-appMuted items-start gap-2 shadow-inner`}
            >
              <span className="material-symbols-outlined text-[#FFE600] text-base mt-0.5">tips_and_updates</span>
              <div>
                <span className="font-bold text-[#FFE600] block mb-0.5">Kritik Mühendislik İpucu:</span>
                <span id="hint-text">{currentDecision.hint}</span>
              </div>
            </div>
          </div>

          {/* Choice Cards (A / B) */}
          <div className="flex flex-col gap-2.5 mt-3" id="choices-container" data-cy="choices-container">
            {/* Option A */}
            <button
              type="button"
              id="btn-choice-a"
              data-cy="choice-a"
              disabled={selectedChoice !== null}
              onClick={() => handleMakeChoice('A')}
              className={`app-choice-card w-full min-h-[58px] p-3 rounded-xl text-left flex items-center justify-between active:scale-[0.98] transition-all shadow-sm ${
                selectedChoice === null
                  ? 'opacity-100 cursor-pointer'
                  : selectedChoice === 'A'
                  ? 'border-appMint shadow-glow-mint'
                  : 'opacity-40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="choice-tag w-8 h-8 rounded-lg bg-black/20 border border-white/20 flex items-center justify-center font-black text-xs text-[#FFE600] shrink-0">
                  A
                </span>
                <div className="flex flex-col">
                  <span id="choice-a-title" data-cy="choice-a-title" className="text-xs font-bold text-white">
                    {currentDecision.optionA.title}
                  </span>
                  <span id="choice-a-sub" data-cy="choice-a-sub" className="text-[11px] text-white/70">
                    {currentDecision.optionA.sub}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/60 text-base">chevron_right</span>
            </button>

            {/* Option B */}
            <button
              type="button"
              id="btn-choice-b"
              data-cy="choice-b"
              disabled={selectedChoice !== null}
              onClick={() => handleMakeChoice('B')}
              className={`app-choice-card w-full min-h-[58px] p-3 rounded-xl text-left flex items-center justify-between active:scale-[0.98] transition-all shadow-sm ${
                selectedChoice === null
                  ? 'opacity-100 cursor-pointer'
                  : selectedChoice === 'B'
                  ? 'border-appMercan shadow-glow-mercan'
                  : 'opacity-40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="choice-tag w-8 h-8 rounded-lg bg-black/20 border border-white/20 flex items-center justify-center font-black text-xs text-[#FFE600] shrink-0">
                  B
                </span>
                <div className="flex flex-col">
                  <span id="choice-b-title" data-cy="choice-b-title" className="text-xs font-bold text-white">
                    {currentDecision.optionB.title}
                  </span>
                  <span id="choice-b-sub" data-cy="choice-b-sub" className="text-[11px] text-white/70">
                    {currentDecision.optionB.sub}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/60 text-base">chevron_right</span>
            </button>
          </div>

          {/* RESULT PANEL (WHAT HAPPENED / WHY IT HAPPENED) */}
          <div
            id="result-panel"
            data-cy="result-panel"
            className={`${
              selectedChoice !== null ? 'block' : 'hidden'
            } mt-3 p-4 rounded-xl bg-appSurface border border-appBorder relative overflow-hidden screen-fade shadow-xl`}
          >
            <div
              id="result-status-bar"
              data-cy="result-status-bar"
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                !isCurrentWrong ? 'bg-appMint' : 'bg-appMercan'
              }`}
            ></div>

            <div className="pl-2 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    id="result-status-icon"
                    className={`material-symbols-outlined text-lg ${
                      !isCurrentWrong ? 'text-appMint' : 'text-appMercan'
                    }`}
                  >
                    {!isCurrentWrong ? 'verified' : 'warning'}
                  </span>
                  <span
                    id="result-status-title"
                    data-cy="result-status-title"
                    className={`text-xs font-black uppercase tracking-wider ${
                      !isCurrentWrong ? 'text-appMint' : 'text-appMercan'
                    }`}
                  >
                    {!isCurrentWrong
                      ? 'Doğru Karar · Hizmet Kurtarıldı'
                      : selectedChoice === 'TIMEOUT'
                      ? 'Süre Doldu · Müdahale Gecikti'
                      : 'Riskli Karar · Hata Gerçekleşti'}
                  </span>
                </div>
                {/* XP Badge */}
                <span
                  id="result-xp-badge"
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    !isCurrentWrong
                      ? 'bg-appMint/20 text-appMint animate-bounce border border-appMint/40'
                      : 'bg-appMercan/20 text-appMercan border border-appMercan/40'
                  }`}
                >
                  {!isCurrentWrong ? '+100 TP' : '0 TP (Hata)'}
                </span>
              </div>

              {/* What happened */}
              <div className="flex flex-col gap-0.5 bg-appBg/80 p-2.5 rounded-lg border border-appBorder">
                <span className="text-[10px] font-black text-[#FFE600] flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">visibility</span> Ne oldu?
                </span>
                <p id="result-what-happened" data-cy="result-what-happened" className="text-xs text-appText leading-relaxed">
                  {currentAnswer?.what}
                </p>
              </div>

              {/* Why it happened */}
              <div className="flex flex-col gap-0.5 bg-appBg/80 p-2.5 rounded-lg border border-appBorder">
                <span className="text-[10px] font-black text-appMuted flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">psychology</span> Neden oldu?
                </span>
                <p id="result-why-happened" data-cy="result-why-happened" className="text-xs text-appMuted leading-relaxed">
                  {currentAnswer?.why}
                </p>
              </div>

              {/* Continue Button */}
              <div className="pt-1">
                <button
                  type="button"
                  id="continue-button"
                  data-cy="continue-button"
                  onClick={handleContinueNextStep}
                  className="w-full min-h-[46px] app-main-btn font-black text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  <span id="continue-btn-text">
                    {currentDecisionIndex === 2 ? 'Nihai Raporu Gör' : 'Sonraki Karara Geç'}
                  </span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI SOCRATIC TUTOR SECTION */}
          <div
            id="tutor-section"
            data-cy="tutor-section"
            className="mt-3 p-3 rounded-2xl bg-appSurface border border-appBorder flex flex-col gap-2.5 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFE600] text-appText flex items-center justify-center font-black shadow-sm">
                  <span className="material-symbols-outlined text-base">smart_toy</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-appText flex items-center gap-1">
                    AI Tutor <span className="w-1.5 h-1.5 rounded-full bg-appMint animate-pulse"></span>
                  </span>
                  <span className="text-[9px] text-appMuted">Sokratik Kriz Rehberi</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-appBg text-[#FFE600] border border-appBorder font-bold">
                Aktif
              </span>
            </div>

            {/* Tutor Bubble & Conversation Thread */}
            <div
              className="bg-appBg border border-appBorder rounded-xl p-3 flex flex-col gap-2 shadow-inner"
              id="tutor-bubble"
              data-cy="tutor-bubble"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-appBorder/60">
                <span className="text-[10px] uppercase font-black text-[#FFE600] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">forum</span> Sokratik Sohbet Akışı
                </span>
                <span
                  id="tutor-indicator"
                  data-cy="tutor-loading"
                  className={`${isTutorLoading ? 'flex' : 'hidden'} text-[10px] text-[#FFE600] items-center gap-1 font-mono`}
                >
                  <span className="dot-flashing"></span>
                  <span className="dot-flashing"></span>
                  <span className="dot-flashing"></span>
                  <span className="ml-1 text-[10px] font-bold">Düşünüyor...</span>
                </span>
              </div>

              {/* Chat Messages List */}
              <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
                {chatHistory.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  const isLatestTutor =
                    !isUser &&
                    idx ===
                      chatHistory.map((m) => m.sender).lastIndexOf('tutor');

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isUser ? 'items-end' : 'items-start'
                      } screen-fade`}
                    >
                      <div className="flex items-center gap-1 mb-0.5 text-[9px] text-appMuted font-mono">
                        <span>{isUser ? 'Sen' : 'AI Tutor'}</span>
                        <span>·</span>
                        <span>{msg.time}</span>
                      </div>
                      <div
                        className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[90%] shadow-sm ${
                          isUser
                            ? 'bg-[#FFE600] text-[#0B1B3F] font-semibold rounded-br-none'
                            : 'bg-appSurfaceHigh text-appText border border-appBorder/80 rounded-bl-none'
                        }`}
                      >
                        {isLatestTutor ? (
                          <p
                            id="tutor-question-text"
                            data-cy="tutor-question"
                            className="leading-relaxed"
                          >
                            "{msg.text}"
                          </p>
                        ) : (
                          <p className="leading-relaxed">"{msg.text}"</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef}></div>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
                {[
                  currentDecisionIndex === 0 ? 'Rollback veri siler mi?' : currentDecisionIndex === 1 ? 'Smoke test ne kazandırır?' : 'Logdaki T.C. gerekli mi?',
                  'Hangi seçenek daha az riskli?',
                  'Neden bu kural önemli?',
                ].map((suggested, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => {
                      setTutorInput(suggested);
                    }}
                    className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-lg bg-appSurface border border-appBorder text-appMuted hover:text-appText hover:border-[#FFE600]/60 active:scale-95 transition-all cursor-pointer"
                  >
                    💬 {suggested}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Form */}
            <form id="tutor-form" data-cy="tutor-form" onSubmit={handleTutorSubmit} className="flex items-center gap-2">
              <input
                type="text"
                id="tutor-input"
                data-cy="tutor-input"
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                disabled={isTutorLoading}
                placeholder="Tutor'a soru sor (örn: 'Rollback veri siler mi?')..."
                className="flex-1 bg-appBg text-xs text-appText px-3 py-2.5 rounded-xl border border-appBorder focus:outline-none focus:border-[#FFE600] transition-colors placeholder:text-appMuted/60"
              />
              <button
                type="submit"
                id="tutor-send"
                data-cy="tutor-send"
                disabled={isTutorLoading}
                className="min-h-[42px] px-3.5 app-main-btn rounded-xl font-black flex items-center justify-center active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </form>
          </div>
        </section>

        {/* SCREEN 4: SON A - SUCCESS (DURUM: SonA) */}
        <section
          id="screen-son-a"
          data-cy="screen-son-a"
          className={`${
            currentState === 'SonA' ? 'flex' : 'hidden'
          } screen-fade flex-col flex-1 justify-between pb-2`}
        >
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-appMint/20 text-appMint text-xs font-black border border-appMint/40 shadow-glow-mint">
                <span className="material-symbols-outlined text-sm">military_tech</span>
                <span>KUSURSUZ OPERASYON</span>
              </div>
              <span className="text-xs font-mono text-appMint font-black bg-appMint/10 px-2 py-0.5 rounded border border-appMint/20">
                3/3 BAŞARI
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-appSurface border border-appBorder p-4 shadow-xl">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-appMint"></div>
              <div className="pl-2">
                <span className="text-[10px] font-black text-appMint tracking-widest uppercase">MİSYON TAMAMLANDI</span>
                <h1 className="text-xl font-black text-appText mt-0.5" id="ending-a" data-cy="ending-a">
                  SON A · 08:25, Sistem Ayakta, Veri Güvende
                </h1>
                <p className="text-xs text-appMuted mt-1.5 leading-relaxed">
                  Kriz protokolü hatasız uygulandı. Sıfır veri kaybı sağlandı, hasta hakları korundu ve 300 vatandaşın randevu akışı başarıyla normale döndü.
                </p>
              </div>
            </div>

            {/* Decision Summary List */}
            <div className="flex flex-col gap-2" data-cy="summary-list-a">
              <span className="text-xs font-black text-appMuted uppercase tracking-wider px-1">
                Uygulanan Karar Protokolü
              </span>

              <div className="p-3 rounded-xl bg-appSurface border border-appBorder flex items-start gap-3" data-cy="summary-item-1">
                <span className="material-symbols-outlined text-appMint text-lg mt-0.5">verified</span>
                <div className="text-xs">
                  <strong className="text-appText block font-bold">1. Karar: Eski sürüme geri dönüldü</strong>
                  <span className="text-appMuted">Canlıda plansız yama riski yerine stabil sürüme dönülerek yangın söndürüldü.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-appSurface border border-appBorder flex items-start gap-3" data-cy="summary-item-2">
                <span className="material-symbols-outlined text-appMint text-lg mt-0.5">verified</span>
                <div className="text-xs">
                  <strong className="text-appText block font-bold">2. Karar: Önce kısa test koşuldu</strong>
                  <span className="text-appMuted">Kritik duman testi ile hasta kayıt akışının doğruluğu tescillendi.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-appSurface border border-appBorder flex items-start gap-3" data-cy="summary-item-3">
                <span className="material-symbols-outlined text-appMint text-lg mt-0.5">verified</span>
                <div className="text-xs">
                  <strong className="text-appText block font-bold">3. Karar: Hasta verileri maskelendi</strong>
                  <span className="text-appMuted">Kriz anında bile kişisel sağlık verileri kanuna uygun korundu.</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-appSurface border border-appBorder flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#FFE600] text-base mt-0.5">psychology</span>
              <p className="text-xs text-appMuted leading-relaxed">
                <strong className="text-[#FFE600] block">Temel Mühendislik Prensibi:</strong>
                Kriz anında kahramanlık değil; öngörülebilir, test edilebilir ve regülasyona saygılı adımlar hayat kurtarır.
              </p>
            </div>
          </div>

          {/* Restart Button */}
          <div className="mt-4 pt-1">
            <button
              type="button"
              data-cy="restart-button"
              onClick={restartSimulation}
              className="w-full min-h-[50px] app-main-btn font-black text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">replay</span>
              <span>Simülasyonu Tekrar Oyna</span>
            </button>
          </div>
        </section>

        {/* SCREEN 5: SON B - RISKY/FAIL (DURUM: SonB) */}
        <section
          id="screen-son-b"
          data-cy="screen-son-b"
          className={`${
            currentState === 'SonB' ? 'flex' : 'hidden'
          } screen-fade flex-col flex-1 justify-between pb-2`}
        >
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-appMercan/20 text-appMercan text-xs font-black border border-appMercan/40 shadow-glow-mercan">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>RİSKLİ MÜDAHALE RAPORU</span>
              </div>
              <span
                id="son-b-score-badge"
                data-cy="son-b-score-badge"
                className="text-xs font-mono text-appMercan font-black bg-appMercan/10 px-2 py-0.5 rounded border border-appMercan/20"
              >
                {answers.filter((a) => a.isWrong).length} HATA
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-appSurface border border-appBorder p-4 shadow-xl">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-appMercan"></div>
              <div className="pl-2">
                <span className="text-[10px] font-black text-appMercan tracking-widest uppercase">MÜDAHALE AKSADI</span>
                <h1 className="text-xl font-black text-appText mt-0.5" id="ending-b" data-cy="ending-b">
                  SON B · Sistem Ayakta Fakat KVKK / Kesinti Riski Doğdu
                </h1>
                <p className="text-xs text-appMuted mt-1.5 leading-relaxed">
                  Sistem çalışıyor gibi görünüyor; ancak baskı altında verilen aceleci kararlar sebebiyle kurumsal ve cezai riskler doğdu.
                </p>
              </div>
            </div>

            {/* Mistakes & Decisions list */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-appMercan uppercase tracking-wider px-1">
                Hatalı Kararlar ve Analizi
              </span>

              <div id="son-b-mistakes-list" data-cy="son-b-mistakes-list" className="flex flex-col gap-2">
                {answers.map((ans, i) => (
                  <div
                    key={i}
                    data-cy={`mistake-item-${i + 1}`}
                    className={`p-3 rounded-xl bg-appSurface border flex items-start gap-3 shadow-md ${
                      ans.isWrong ? 'border-appMercan/60' : 'border-appBorder opacity-80'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-lg mt-0.5 ${
                        ans.isWrong ? 'text-appMercan' : 'text-appMint'
                      }`}
                    >
                      {ans.isWrong ? 'error' : 'check_circle'}
                    </span>
                    <div className="text-xs">
                      <strong className="text-appText block font-bold">
                        Karar {i + 1}: {ans.isWrong ? (ans.choice === 'TIMEOUT' ? 'Süre Doldu' : 'Riskli Tercih') : 'İsabetli Karar'}
                      </strong>
                      {ans.isWrong ? (
                        <p className="text-appMuted mt-0.5">
                          <span className="text-appMercan font-semibold">Hata Sebebi:</span> {ans.why}
                        </p>
                      ) : (
                        <p className="text-appMuted mt-0.5">{ans.what}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-appMercan/10 border border-appMercan/30 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-appMercan text-base mt-0.5">gavel</span>
              <p className="text-xs text-appMuted leading-relaxed">
                <strong className="text-appMercan block">Post-Mortem Dersi:</strong>
                Kesinti süresi telafi edilebilir; ancak canlıda plansız yama ve sızan kişisel veriler geri alınamaz kurumsal yıkım doğurur.
              </p>
            </div>
          </div>

          {/* Restart Button */}
          <div className="mt-4 pt-1">
            <button
              type="button"
              data-cy="restart-button"
              onClick={restartSimulation}
              className="w-full min-h-[50px] app-main-btn font-black text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">replay</span>
              <span>Ders Al ve Tekrar Oyna</span>
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
