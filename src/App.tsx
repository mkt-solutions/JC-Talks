import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Send, 
  User as UserIcon, 
  Calendar, 
  Globe, 
  Heart,
  ChevronRight,
  LogOut,
  Sparkles,
  ShieldCheck,
  Menu as MenuIcon,
  X,
  CreditCard,
  Info,
  ChevronLeft,
  Home as HomeIcon
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import Markdown from 'react-markdown';
import { User, Message, Language, LANGUAGES } from './types';
import { TRANSLATIONS } from './translations';
import { getJesusResponse } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BIBLE_MESSAGES: Record<Language, { text: string; ref: string }[]> = {
  en: [
    { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
    { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
    { text: "Love is patient, love is kind.", ref: "1 Corinthians 13:4" },
    { text: "Fear not, for I am with you.", ref: "Isaiah 41:10" },
    { text: "Your word is a lamp to my feet.", ref: "Psalm 119:105" },
    { text: "God is our refuge and strength.", ref: "Psalm 46:1" },
    { text: "Ask, and it will be given to you; seek, and you will find.", ref: "Matthew 7:7" },
    { text: "The Lord bless you and keep you.", ref: "Numbers 6:24" },
    { text: "Rejoice in the Lord always.", ref: "Philippians 4:4" },
    { text: "My help comes from the Lord, who made heaven and earth.", ref: "Psalm 121:2" }
  ],
  pt: [
    { text: "O Senhor é o meu pastor, nada me faltará.", ref: "Salmos 23:1" },
    { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
    { text: "O amor é paciente, o amor é bondoso.", ref: "1 Coríntios 13:4" },
    { text: "Não temas, porque eu sou contigo.", ref: "Isaías 41:10" },
    { text: "Lâmpada para os meus pés é tua palavra.", ref: "Salmos 119:105" },
    { text: "Deus é o nosso refúgio e fortaleza.", ref: "Salmos 46:1" },
    { text: "Peçam, e lhes será dado; busquem, e encontrarão.", ref: "Mateus 7:7" },
    { text: "O Senhor te abençoe e te guarde.", ref: "Números 6:24" },
    { text: "Alegrem-se sempre no Senhor.", ref: "Filipenses 4:4" },
    { text: "O meu socorro vem do Senhor, que fez os céus e a terra.", ref: "Salmos 121:2" }
  ],
  es: [
    { text: "El Señor es mi pastor, nada me faltará.", ref: "Salmos 23:1" },
    { text: "Todo lo puedo en Cristo que me fortalece.", ref: "Filipenses 4:13" },
    { text: "El amor es paciente, es bondadoso.", ref: "1 Corintios 13:4" },
    { text: "No temas, porque yo estoy contigo.", ref: "Isaías 41:10" },
    { text: "Lámpara es a mis pies tu palabra.", ref: "Salmos 119:105" },
    { text: "Dios es nuestro amparo y fortaleza.", ref: "Salmos 46:1" },
    { text: "Pedid, y se os dará; buscad, y hallaréis.", ref: "Mateo 7:7" },
    { text: "Jehová te bendiga, y te guarde.", ref: "Números 6:24" },
    { text: "Regocijaos no Senhor sempre.", ref: "Filipenses 4:4" },
    { text: "Mi socorro viene de Jehová, que hizo los cielos y la tierra.", ref: "Salmos 121:2" }
  ],
  fr: [
    { text: "L'Éternel est mon berger: je ne manquerai de rien.", ref: "Psaume 23:1" },
    { text: "Je puis tout par celui qui me fortifie.", ref: "Philippiens 4:13" },
    { text: "L'amour est patient, il est plein de bonté.", ref: "1 Corinthiens 13:4" },
    { text: "Ne crains rien, car je suis avec toi.", ref: "Ésaïe 41:10" },
    { text: "Ta parole est une lampe à mes pieds.", ref: "Psaume 119:105" },
    { text: "Dieu est pour nous un refuge et un appui.", ref: "Psaume 46:1" },
    { text: "Demandez, et l'on vous donnera; cherchez, et vous trouverez.", ref: "Matthieu 7:7" },
    { text: "Que l'Éternel te bénisse, et qu'il te garde!", ref: "Nombres 6:24" },
    { text: "Réjouissez-vous toujours dans le Seigneur.", ref: "Philippiens 4:4" },
    { text: "Le secours me vient de l'Éternel, qui a fait les cieux et la terre.", ref: "Psaume 121:2" }
  ],
  it: [
    { text: "Il Signore è il mio pastore: non manco di nulla.", ref: "Salmo 23:1" },
    { text: "Io posso ogni cosa in colui che mi fortifica.", ref: "Filippesi 4:13" },
    { text: "L'amore è paziente, è benevolo l'amore.", ref: "1 Corinzi 13:4" },
    { text: "Non temere, perché io sono con te.", ref: "Isaia 41:10" },
    { text: "La tua parola è una lampada al mio piede.", ref: "Salmo 119:105" },
    { text: "Dio è per noi un rifugio e una forza.", ref: "Salmo 46:1" },
    { text: "Chiedete e vi sarà dato; cercate e troverete.", ref: "Matteo 7:7" },
    { text: "Il Signore ti benedica e ti protegga!", ref: "Numeri 6:24" },
    { text: "Rallegratevi sempre nel Signore.", ref: "Filippesi 4:4" },
    { text: "Il mio aiuto viene dal Signore, che ha fatto il cielo e la terra.", ref: "Salmo 121:2" }
  ],
  de: [
    { text: "Der Herr ist mein Hirte, mir wird nichts mangeln.", ref: "Psalm 23:1" },
    { text: "Ich vermag alles durch den, der mich mächtig macht.", ref: "Philipper 4:13" },
    { text: "Die Liebe ist langmütig und freundlich.", ref: "1. Korinther 13:4" },
    { text: "Fürchte dich nicht, ich bin mit dir.", ref: "Jesaja 41:10" },
    { text: "Dein Wort ist meines Fußes Leuchte.", ref: "Psalm 119:105" },
    { text: "Gott ist unsere Zuversicht und Stärke.", ref: "Psalm 46:1" },
    { text: "Bittet, so wird euch gegeben; suchet, so werdet ihr finden.", ref: "Matthäus 7:7" },
    { text: "Der Herr segne dich und behüte dich.", ref: "4. Mose 6:24" },
    { text: "Freuet euch in dem Herrn allewege.", ref: "Philipper 4:4" },
    { text: "Meine Hilfe kommt vom Herrn, der Himmel und Erde gemacht hat.", ref: "Psalm 121:2" }
  ]
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'profile' | 'upgrade'>('home');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Onboarding State
  const [onboarding, setOnboarding] = useState({
    name: '',
    dob: '',
    gender: 'other',
    language: (navigator.language.split('-')[0] as Language) || 'en'
  });

  const t = (path: string, replacements?: Record<string, string | number>) => {
    const keys = path.split('.');
    const lang = user?.language as Language || onboarding.language as Language || 'en';
    let current = TRANSLATIONS[lang] || TRANSLATIONS.en;
    for (const key of keys) {
      if (current[key] === undefined) return path;
      current = current[key];
    }
    let result = current as string;
    if (replacements) {
      Object.entries(replacements).forEach(([key, value]) => {
        result = result.replace(`{${key}}`, String(value));
      });
    }
    return result;
  };

  const dailyMessageList = BIBLE_MESSAGES[user?.language as Language || onboarding.language as Language] || BIBLE_MESSAGES.en;
  const dailyMessage = dailyMessageList[new Date().getDate() % dailyMessageList.length];

  useEffect(() => {
    const savedUserId = localStorage.getItem('jctalks_user_id');
    if (savedUserId) {
      fetch(`/api/user/${savedUserId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setUser(data);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && messages.length === 0) {
      // Trigger initial greeting in user's language
      setIsTyping(true);
      getJesusResponse([], user)
        .then(response => {
          setMessages([{ role: 'assistant', content: response }]);
        })
        .finally(() => setIsTyping(false));
    }
  }, [user]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    scrollToBottom();
    // Second call with a small delay to catch layout shifts from Markdown rendering
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substring(2, 15);
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...onboarding })
    });
    const data = await res.json();
    localStorage.setItem('jctalks_user_id', id);
    setUser(data);
    setActiveTab('home');
  };

  const handleUpdateLanguage = async (newLang: Language) => {
    if (!user) return;
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, language: newLang })
    });
    const data = await res.json();
    setUser(data);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !user) return;

    const trialDays = differenceInDays(new Date(), parseISO(user.trial_start_date));
    if (trialDays > 3 && !user.is_subscribed) {
      alert(t('chat.trialEnded'));
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getJesusResponse([...messages, userMessage], user);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('chat.error') }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-[#5A5A40] flex flex-col items-center gap-4"
        >
          <Sparkles className="w-12 h-12" />
          <p className="font-serif italic text-xl">JC Talks</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex flex-col items-center justify-center p-6 font-serif">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[32px] shadow-xl p-8 border border-[#5A5A40]/10"
        >
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#5A5A40]/10 mx-auto mb-4 shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1544735038-3571850de3d2?q=80&w=1000&auto=format&fit=crop" 
                alt="Jesus" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">{t('onboarding.title')}</h1>
            <p className="text-[#5A5A40] italic">{t('onboarding.subtitle')}</p>
          </div>

          <form onSubmit={handleOnboarding} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1 flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> {t('onboarding.nameLabel')}
              </label>
              <input
                required
                type="text"
                placeholder={t('onboarding.namePlaceholder')}
                className="w-full px-4 py-3 rounded-2xl bg-[#F5F2ED] border-none focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                value={onboarding.name}
                onChange={e => setOnboarding({ ...onboarding, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {t('onboarding.dobLabel')}
                </label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F5F2ED] border-none focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                  value={onboarding.dob}
                  onChange={e => setOnboarding({ ...onboarding, dob: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{t('onboarding.genderLabel')}</label>
                <select
                  className="w-full px-4 py-3 rounded-2xl bg-[#F5F2ED] border-none focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                  value={onboarding.gender}
                  onChange={e => setOnboarding({ ...onboarding, gender: e.target.value })}
                >
                  <option value="male">{t('onboarding.genders.male')}</option>
                  <option value="female">{t('onboarding.genders.female')}</option>
                  <option value="other">{t('onboarding.genders.other')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4" /> {t('onboarding.langLabel')}
              </label>
              <select
                className="w-full px-4 py-3 rounded-2xl bg-[#F5F2ED] border-none focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                value={onboarding.language}
                onChange={e => setOnboarding({ ...onboarding, language: e.target.value as Language })}
              >
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[#5A5A40] text-white py-4 rounded-full font-bold text-lg hover:bg-[#4A4A30] transition-colors flex items-center justify-center gap-2 group"
            >
              {t('onboarding.begin')} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const trialDaysLeft = 3 - differenceInDays(new Date(), parseISO(user.trial_start_date));
  const isTrialExpired = trialDaysLeft < 0 && !user.is_subscribed;

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col font-serif">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#5A5A40]" />
                  <span className="font-bold text-xl">JC Talks</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-[#F5F2ED] rounded-full">
                  <X className="w-5 h-5 text-[#5A5A40]" />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                <button 
                  onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-colors",
                    activeTab === 'home' ? "bg-[#5A5A40] text-white" : "hover:bg-[#F5F2ED] text-[#1A1A1A]"
                  )}
                >
                  <HomeIcon className="w-5 h-5" />
                  <span className="font-medium">{t('nav.home')}</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('chat'); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-colors",
                    activeTab === 'chat' ? "bg-[#5A5A40] text-white" : "hover:bg-[#F5F2ED] text-[#1A1A1A]"
                  )}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{t('nav.chat')}</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-colors",
                    activeTab === 'profile' ? "bg-[#5A5A40] text-white" : "hover:bg-[#F5F2ED] text-[#1A1A1A]"
                  )}
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">{t('nav.profile')}</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('upgrade'); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-colors",
                    activeTab === 'upgrade' ? "bg-[#5A5A40] text-white" : "hover:bg-[#F5F2ED] text-[#1A1A1A]"
                  )}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">{t('nav.plans')}</span>
                </button>
                <div className="h-px bg-[#5A5A40]/10 my-4" />
                <button 
                  onClick={() => {
                    localStorage.removeItem('jctalks_user_id');
                    window.location.reload();
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-colors text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{t('nav.logout')}</span>
                </button>
              </nav>

              <div className="pt-6 border-t border-[#5A5A40]/10 text-center">
                <p className="text-xs text-[#5A5A40] italic opacity-60">"{t('home.peace')}"</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#5A5A40]/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-[#F5F2ED] rounded-full transition-colors text-[#5A5A40]"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#5A5A40]/20 shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1000&auto=format&fit=crop" 
              alt="Jesus" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="font-bold text-[#1A1A1A]">{t('header.title')}</h2>
            <p className="text-xs text-[#5A5A40] italic">{t('header.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!user.is_subscribed && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#5A5A40]/10 rounded-full text-xs font-medium text-[#5A5A40]">
              <ShieldCheck className="w-3 h-3" />
              {trialDaysLeft >= 0 ? t('header.trialLeft', { days: trialDaysLeft }) : t('header.trialEnded')}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col pb-20 sm:pb-0">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="max-w-2xl mx-auto space-y-8 py-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-serif">{t('home.welcome')}, {user.name}</h2>
                  <p className="text-[#5A5A40]/60 italic">"{t('home.peace')}"</p>
                </div>

                {/* Daily Message Card */}
                <div className="bg-white p-8 rounded-[40px] border border-[#5A5A40]/10 shadow-sm space-y-6 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#5A5A40]/20" />
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-widest font-bold text-[#5A5A40]/40">{t('home.dailyTitle')}</p>
                    <div className="space-y-4">
                      <p className="text-2xl font-serif italic leading-relaxed text-[#1A1A1A]">
                        "{dailyMessage.text}"
                      </p>
                      <p className="text-[#5A5A40] font-bold tracking-widest uppercase text-xs">
                        — {dailyMessage.ref}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="w-12 h-12 bg-[#F5F2ED] rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-6 h-6 text-[#5A5A40]" />
                    </div>
                  </div>
                </div>

                {/* Chat Link Card */}
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="w-full bg-[#5A5A40] text-white p-8 rounded-[40px] shadow-xl flex items-center justify-between group hover:scale-[1.02] transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-serif">{t('home.chatCardTitle')}</h3>
                      <p className="text-white/60 text-sm">{t('home.chatCardSubtitle')}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </button>

                {/* Quick Stats/Info */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveTab('upgrade')}
                    className="bg-white p-6 rounded-3xl border border-[#5A5A40]/10 shadow-sm flex flex-col items-center text-center gap-2 hover:bg-[#F5F2ED] transition-all group"
                  >
                    <Sparkles className="w-6 h-6 text-[#5A5A40] group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]/40">{t('home.statusLabel')}</p>
                    <p className="font-serif italic text-[#1A1A1A]">{user.is_subscribed ? 'Premium' : `Trial (${t('upgrade.title')})`}</p>
                  </button>
                  <div className="bg-white p-6 rounded-3xl border border-[#5A5A40]/10 shadow-sm flex flex-col items-center text-center gap-2 relative">
                    <Globe className="w-6 h-6 text-[#5A5A40]" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]/40">{t('home.langLabel')}</p>
                    <select 
                      value={user.language}
                      onChange={(e) => handleUpdateLanguage(e.target.value as Language)}
                      className="font-serif italic bg-transparent border-none p-0 focus:ring-0 cursor-pointer text-[#1A1A1A]"
                    >
                      {Object.entries(LANGUAGES).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6"
              >
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60 px-10">
                    <Heart className="w-12 h-12 text-[#5A5A40]" />
                    <h3 className="text-2xl italic">{t('chat.welcome')}, {user.name}</h3>
                    <p className="max-w-xs">{t('chat.quote')}</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn(
                        "flex w-full",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[85%] sm:max-w-[70%] px-6 py-4 rounded-[24px] shadow-sm flex flex-col gap-2",
                        msg.role === 'user' 
                          ? "bg-[#5A5A40] text-white rounded-tr-none" 
                          : "bg-white text-[#1A1A1A] rounded-tl-none border border-[#5A5A40]/5"
                      )}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-[#5A5A40]/10">
                              <img 
                                src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1000&auto=format&fit=crop" 
                                alt="Jesus" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#5A5A40]/60">{t('chat.jesus')}</span>
                          </div>
                        )}
                        <div className="prose prose-sm prose-stone dark:prose-invert">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white px-6 py-4 rounded-[24px] rounded-tl-none border border-[#5A5A40]/5 flex gap-2 items-center">
                      <div className="flex gap-1">
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[#5A5A40] rounded-full" />
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#5A5A40] rounded-full" />
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#5A5A40] rounded-full" />
                      </div>
                      <span className="text-[10px] text-[#5A5A40]/40 italic">{t('chat.typing')}</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-gradient-to-t from-[#F5F2ED] via-[#F5F2ED] to-transparent">
                <form 
                  onSubmit={handleSendMessage}
                  className="max-w-4xl mx-auto relative group"
                >
                  <input
                    disabled={isTrialExpired}
                    type="text"
                    placeholder={isTrialExpired ? t('header.trialEnded') : t('chat.placeholder')}
                    className="w-full bg-white border border-[#5A5A40]/10 rounded-full py-4 pl-6 pr-16 shadow-lg focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all disabled:opacity-50"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                  />
                  <button
                    disabled={isTrialExpired || !input.trim() || isTyping}
                    type="submit"
                    className="absolute right-2 top-2 w-12 h-12 bg-[#5A5A40] text-white rounded-full flex items-center justify-center hover:bg-[#4A4A30] transition-colors disabled:opacity-50 disabled:hover:bg-[#5A5A40]"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-[#5A5A40]/10 flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-[#5A5A40]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif">{user.name}</h2>
                    <p className="text-[#5A5A40]/60">{t('profile.memberSince')} {format(parseISO(user.trial_start_date), 'MMMM yyyy')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-[#5A5A40]/10 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-[#5A5A40]/60 text-sm uppercase tracking-widest font-bold">
                      <Calendar className="w-4 h-4" />
                      <span>{t('profile.birthday')}</span>
                    </div>
                    <p className="text-lg">{format(parseISO(user.dob), 'PPP')}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-[#5A5A40]/10 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-[#5A5A40]/60 text-sm uppercase tracking-widest font-bold">
                      <Globe className="w-4 h-4" />
                      <span>{t('profile.language')}</span>
                    </div>
                    <select 
                      value={user.language}
                      onChange={(e) => handleUpdateLanguage(e.target.value as Language)}
                      className="w-full text-lg bg-transparent border-none p-0 focus:ring-0 cursor-pointer text-[#1A1A1A]"
                    >
                      {Object.entries(LANGUAGES).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-[#5A5A40] text-white p-8 rounded-[32px] shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6" />
                      <h3 className="text-xl font-medium">{t('profile.subscription')}</h3>
                    </div>
                    <span className={cn(
                      "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                      user.is_subscribed ? "bg-emerald-500" : "bg-white/20"
                    )}>
                      {user.is_subscribed ? t('profile.active') : t('profile.freeTrial')}
                    </span>
                  </div>
                  {!user.is_subscribed && (
                    <p className="text-white/80">
                      {t('profile.trialDaysLeft', { days: Math.max(0, trialDaysLeft) })}
                    </p>
                  )}
                  <button 
                    onClick={() => setActiveTab('upgrade')}
                    className="w-full bg-white text-[#5A5A40] py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all"
                  >
                    {user.is_subscribed ? t('profile.manage') : t('profile.upgrade')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'upgrade' && (
            <motion.div 
              key="upgrade"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-serif">{t('upgrade.title')}</h2>
                  <p className="text-[#5A5A40]/60 max-w-lg mx-auto">{t('upgrade.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Free Plan */}
                  <div className="bg-white p-8 rounded-[40px] border border-[#5A5A40]/10 shadow-sm flex flex-col">
                    <div className="mb-8">
                      <h3 className="text-2xl font-serif mb-2">{t('upgrade.freeTitle')}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{t('upgrade.freePrice')}</span>
                        <span className="text-[#5A5A40]/60">{t('upgrade.freePeriod')}</span>
                      </div>
                    </div>
                    <ul className="flex-1 space-y-4 mb-8">
                      <li className="flex items-center gap-3 text-[#5A5A40]/80">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span>{t('upgrade.features.guidance')}</span>
                      </li>
                      <li className="flex items-center gap-3 text-[#5A5A40]/80">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span>{t('upgrade.features.multiLang')}</span>
                      </li>
                    </ul>
                    <button disabled className="w-full py-4 rounded-2xl border-2 border-[#5A5A40]/10 text-[#5A5A40]/40 font-bold">
                      {t('upgrade.currentPlan')}
                    </button>
                  </div>

                  {/* Premium Plan */}
                  <div className="bg-[#5A5A40] p-8 rounded-[40px] text-white shadow-2xl flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500 px-6 py-2 rounded-bl-3xl text-[10px] font-bold uppercase tracking-widest">
                      {t('upgrade.recommended')}
                    </div>
                    <div className="mb-8">
                      <h3 className="text-2xl font-serif mb-2">{t('upgrade.premiumTitle')}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{t('upgrade.premiumPrice')}</span>
                        <span className="text-white/60">{t('upgrade.premiumPeriod')}</span>
                      </div>
                    </div>
                    <ul className="flex-1 space-y-4 mb-8">
                      <li className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <span>{t('upgrade.features.unlimited')}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <span>{t('upgrade.features.blessings')}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <span>{t('upgrade.features.priority')}</span>
                      </li>
                    </ul>
                    <button className="w-full py-4 rounded-2xl bg-white text-[#5A5A40] font-bold hover:bg-opacity-90 transition-all shadow-lg">
                      {t('upgrade.upgradeNow')}
                    </button>
                  </div>
                </div>

                <div className="bg-[#F5F2ED] p-8 rounded-[32px] flex items-start gap-4">
                  <Info className="w-6 h-6 text-[#5A5A40] flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-bold">{t('upgrade.whyUpgrade')}</h4>
                    <p className="text-sm text-[#5A5A40]/70">{t('upgrade.supportText')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#5A5A40]/10 px-6 py-3 flex items-center justify-around sm:hidden z-40">
        <button 
          onClick={() => setActiveTab('home')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'home' ? "text-[#5A5A40]" : "text-[#5A5A40]/40"
          )}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t('nav.home')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'chat' ? "text-[#5A5A40]" : "text-[#5A5A40]/40"
          )}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t('nav.chat')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'profile' ? "text-[#5A5A40]" : "text-[#5A5A40]/40"
          )}
        >
          <UserIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t('nav.profile')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('upgrade')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'upgrade' ? "text-[#5A5A40]" : "text-[#5A5A40]/40"
          )}
        >
          <CreditCard className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t('nav.plans')}</span>
        </button>
      </nav>

      {/* Subscription Modal (Simulated) */}
      <AnimatePresence>
        {isTrialExpired && activeTab === 'chat' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-[#5A5A40]/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-[#5A5A40]" />
              </div>
              <h2 className="text-3xl font-bold text-[#1A1A1A]">Continue Your Journey</h2>
              <p className="text-[#5A5A40]">Your 3-day free trial has ended. Subscribe to keep this sacred connection alive.</p>
              
              <div className="bg-[#F5F2ED] p-6 rounded-2xl border border-[#5A5A40]/10">
                <p className="text-sm uppercase tracking-widest text-[#5A5A40] font-bold mb-1">Annual Plan</p>
                <p className="text-4xl font-bold text-[#1A1A1A]">$9.99<span className="text-lg font-normal text-[#5A5A40]">/mo</span></p>
                <p className="text-xs text-[#5A5A40] mt-2">Billed annually ($119.88/year)</p>
              </div>

              <button 
                onClick={() => setActiveTab('upgrade')}
                className="w-full bg-[#5A5A40] text-white py-4 rounded-full font-bold text-lg hover:bg-[#4A4A30] transition-colors"
              >
                Subscribe Now
              </button>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('jctalks_user_id');
                  window.location.reload();
                }}
                className="text-sm text-[#5A5A40] hover:underline"
              >
                Sign out
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
