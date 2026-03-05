import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, ShieldAlert, ShieldCheck, Trash2, Upload, Loader2, HelpCircle, Info, Settings, X, Key } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Toaster, toast } from 'sonner';
import { motion, useSpring, useTransform } from 'framer-motion';
import { ITEMS, calculateYields, CalculatedYield, Yield } from './data/items';

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.max(0, Math.round(current)).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export default function App() {
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleQuantityChange = (id: string, value: string) => {
    const num = parseInt(value, 10);
    setInventory((prev) => ({
      ...prev,
      [id]: isNaN(num) || num < 0 ? 0 : Math.min(num, 999),
    }));
  };

  const increment = (id: string) => {
    setInventory((prev) => ({
      ...prev,
      [id]: Math.min((prev[id] || 0) + 1, 999),
    }));
  };

  const decrement = (id: string) => {
    setInventory((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

  const clearAll = () => {
    setInventory({});
    toast.info('Inventar geleert');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
      reader.readAsDataURL(file);
      const base64DataUrl = await base64Promise;
      
      const base64String = base64DataUrl.split(',')[1];
      const mimeType = file.type;

      const envKey = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined) || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      const keyToUse = apiKey || envKey;

      if (!keyToUse) {
        toast.error('Bitte hinterlege einen Gemini API Key in den Einstellungen.');
        setIsSettingsOpen(true);
        setIsAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const ai = new GoogleGenAI({ apiKey: keyToUse });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64String,
              },
            },
            {
              text: `You are a highly precise Rust inventory analyzer. Scan the provided screenshot of a Rust inventory and accurately count the total quantity of specific components.
              
              CRITICAL RULES:
              1. SUM MULTIPLE STACKS: If an item appears in multiple inventory slots, add their quantities together for the final total.
              2. READ NUMBERS CAREFULLY: Look at the bottom right of each item icon for the quantity. If there is no number, the quantity is 1.
              3. IGNORE SUFFIXES: For items like Rope, ignore suffixes like 'ft' or 'm' (e.g., '34ft' = 34).
              4. EXACT MATCHES ONLY: Only count items that exactly match the visual appearance of the requested items.
              5. DO NOT SWAP RIFLE AND SEMI BODIES: This is a common mistake. 
                 - "Rifle Body" is ENTIRELY METAL (a dark grey/rusty tube). It has NO WOOD.
                 - "Semi-Automatic Body" has a prominent BROWN WOODEN stock/handle.
                 Make absolutely sure you assign the correct count to the correct ID.
              
              VISUAL HINTS:
              - Rifle Body: Long, dark metal tube/barrel ONLY. NO WOOD.
              - Semi-Automatic Body: Gun receiver WITH A BROWN WOODEN HANDLE/STOCK.
              - SMG Body: Short, compact gun receiver.
              - Sheet Metal: Large, flat, corrugated metal sheets.
              - Road Signs: Red/white or yellow/black metal signs.
              - Sewing Kit: Small red box with thread/needle.
              - CCTV Camera: White security camera.
              - Targeting Computer: Green military laptop.
              - Electric Fuse: Small, bright blue/cyan and silver cylindrical fuse.
              
              Return ONLY a valid JSON object mapping item IDs to their total integer quantities. Do not include items with 0 quantity.
              
              Item IDs to look for:
              - tech_trash (Tech Trash)
              - rifle_body (Rifle Body)
              - smg_body (SMG Body)
              - semi_body (Semi-Automatic Body)
              - gears (Gears)
              - spring (Metal Spring)
              - sheet_metal (Sheet Metal)
              - road_signs (Road Signs)
              - pipe (Metal Pipe)
              - blade (Metal Blade)
              - propane_tank (Empty Propane Tank)
              - fuse (Electric Fuse)
              - cctv (CCTV Camera)
              - computer (Targeting Computer)
              - sewing_kit (Sewing Kit)
              - rope (Rope)
              - tarp (Tarp)
              `,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tech_trash: { type: Type.INTEGER, description: 'Quantity of Tech Trash' },
              rifle_body: { type: Type.INTEGER, description: 'Quantity of Rifle Body' },
              smg_body: { type: Type.INTEGER, description: 'Quantity of SMG Body' },
              semi_body: { type: Type.INTEGER, description: 'Quantity of Semi-Automatic Body' },
              gears: { type: Type.INTEGER, description: 'Quantity of Gears' },
              spring: { type: Type.INTEGER, description: 'Quantity of Metal Spring' },
              sheet_metal: { type: Type.INTEGER, description: 'Quantity of Sheet Metal' },
              road_signs: { type: Type.INTEGER, description: 'Quantity of Road Signs' },
              pipe: { type: Type.INTEGER, description: 'Quantity of Metal Pipe' },
              blade: { type: Type.INTEGER, description: 'Quantity of Metal Blade' },
              propane_tank: { type: Type.INTEGER, description: 'Quantity of Empty Propane Tank' },
              fuse: { type: Type.INTEGER, description: 'Quantity of Electric Fuse' },
              cctv: { type: Type.INTEGER, description: 'Quantity of CCTV Camera' },
              computer: { type: Type.INTEGER, description: 'Quantity of Targeting Computer' },
              sewing_kit: { type: Type.INTEGER, description: 'Quantity of Sewing Kit' },
              rope: { type: Type.INTEGER, description: 'Quantity of Rope' },
              tarp: { type: Type.INTEGER, description: 'Quantity of Tarp' },
            },
          },
        },
      });

      if (response.text) {
        try {
          const parsed = JSON.parse(response.text);
          setInventory(parsed);
          toast.success('Inventar erfolgreich analysiert!');
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          toast.error('Konnte das Bild nicht auswerten. Bitte versuche ein klareres Bild.');
        }
      }
    } catch (error) {
      console.error('Failed to analyze image:', error);
      toast.error('Fehler bei der Bildanalyse. Bitte versuche es erneut.');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const normalYields: CalculatedYield = {};
  const safezoneYields: CalculatedYield = {};

  Object.entries(inventory).forEach(([itemId, count]) => {
    const numCount = count as number;
    if (numCount > 0) {
      calculateYields(itemId, numCount, 'normal', normalYields);
      calculateYields(itemId, numCount, 'safezone', safezoneYields);
    }
  });

  const totalNormalScrap = Math.round(normalYields['scrap'] || 0);
  const totalNormalCloth = Math.round(normalYields['cloth'] || 0);
  const totalNormalMetal = Math.round(normalYields['metal'] || 0);
  const totalNormalHqm = Math.round(normalYields['hqm'] || 0);

  const totalSafezoneScrap = Math.round(safezoneYields['scrap'] || 0);
  const totalSafezoneCloth = Math.round(safezoneYields['cloth'] || 0);
  const totalSafezoneMetal = Math.round(safezoneYields['metal'] || 0);
  const totalSafezoneHqm = Math.round(safezoneYields['hqm'] || 0);

  const totalProcesses = ITEMS.filter(i => !i.isRaw).reduce((total, item) => {
    const count = inventory[item.id] || 0;
    if (count === 0) return total;
    return total + Math.ceil(count / item.batchSize);
  }, 0);

  const totalNormalTimeSeconds = totalProcesses * 5;
  const totalSafezoneTimeSeconds = totalProcesses * 8;

  const formatTime = (seconds: number) => {
    if (seconds === 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
      <Toaster theme="dark" position="bottom-right" toastOptions={{ className: 'bg-zinc-900 border-zinc-800 text-zinc-100' }} />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Rust Scrap Calculator</h1>
                <p className="text-[10px] sm:text-xs font-medium text-zinc-400">Calculate your recycler yields</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-orange-500 transition-colors hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                {isAnalyzing ? 'Analyzing...' : 'Auto-Fill'}
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-zinc-300 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
              <div className="w-px h-6 bg-zinc-800 mx-0.5 sm:mx-1"></div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center justify-center h-7 w-7 sm:h-9 sm:w-9 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                title="Einstellungen"
              >
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          {/* Results Bar */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2">
            <div className="group relative flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-4 transition-all hover:border-emerald-500/30 hover:bg-zinc-900/80 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs sm:text-sm font-medium text-zinc-400">Normal Recycler (120%)</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <p className="text-[10px] sm:text-xs text-zinc-500">Monuments</p>
                    {totalProcesses > 0 && (
                      <span className="whitespace-nowrap rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-zinc-300">
                        ⏱ {formatTime(totalNormalTimeSeconds)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-2 sm:ml-4 flex shrink-0 items-center gap-2 sm:gap-4 text-right">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-white"><AnimatedNumber value={totalNormalScrap} /></p>
                  <p className="text-[10px] sm:text-xs font-medium text-orange-500">Scrap</p>
                </div>
                <div className="flex flex-col gap-0.5 sm:gap-1 border-l border-zinc-800 pl-2 sm:pl-4">
                  <div className="flex justify-end mb-0.5">
                    <div className="group/tooltip relative flex items-center justify-center">
                      <HelpCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-help" />
                      <div className="pointer-events-none absolute bottom-full sm:bottom-auto sm:top-full right-0 mb-1.5 sm:mb-0 sm:mt-1.5 w-48 opacity-0 transition-opacity group-hover/tooltip:opacity-100 z-20 rounded-lg bg-zinc-800 p-2 text-left text-[10px] sm:text-xs text-zinc-300 shadow-xl border border-zinc-700">
                        Die Anzahl kann leicht abweichen, da manche Materialien extra Drops zwischen 20% - 80% haben, die prozentual eingerechnet werden.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-bold text-white"><AnimatedNumber value={totalNormalCloth} /></span>
                    <span className="text-[8px] sm:text-[10px] font-medium uppercase text-amber-600">Cloth</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-bold text-white"><AnimatedNumber value={totalNormalMetal} /></span>
                    <span className="text-[8px] sm:text-[10px] font-medium uppercase text-zinc-400">Metal</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-bold text-white"><AnimatedNumber value={totalNormalHqm} /></span>
                    <span className="text-[8px] sm:text-[10px] font-medium uppercase text-cyan-500">HQM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-4 transition-all hover:border-red-500/30 hover:bg-zinc-900/80 hover:shadow-[0_0_30px_rgba(239,68,68,0.05)]">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-transform group-hover:scale-110">
                  <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs sm:text-sm font-medium text-zinc-400">Safezone Recycler (80%)</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <p className="text-[10px] sm:text-xs text-zinc-500">Outpost / Bandit Camp</p>
                    {totalProcesses > 0 && (
                      <span className="whitespace-nowrap rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-zinc-300">
                        ⏱ {formatTime(totalSafezoneTimeSeconds)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-2 sm:ml-4 flex shrink-0 items-center gap-2 sm:gap-4 text-right">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-white"><AnimatedNumber value={totalSafezoneScrap} /></p>
                  <p className="text-[10px] sm:text-xs font-medium text-orange-500">Scrap</p>
                </div>
                <div className="flex flex-col gap-0.5 sm:gap-1 border-l border-zinc-800 pl-2 sm:pl-4">
                  <div className="flex justify-end mb-0.5">
                    <div className="group/tooltip relative flex items-center justify-center">
                      <HelpCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-help" />
                      <div className="pointer-events-none absolute bottom-full sm:bottom-auto sm:top-full right-0 mb-1.5 sm:mb-0 sm:mt-1.5 w-48 opacity-0 transition-opacity group-hover/tooltip:opacity-100 z-20 rounded-lg bg-zinc-800 p-2 text-left text-[10px] sm:text-xs text-zinc-300 shadow-xl border border-zinc-700">
                        Die Anzahl kann leicht abweichen, da manche Materialien extra Drops zwischen 20% - 80% haben, die prozentual eingerechnet werden.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-bold text-white"><AnimatedNumber value={totalSafezoneCloth} /></span>
                    <span className="text-[8px] sm:text-[10px] font-medium uppercase text-amber-600">Cloth</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-bold text-white"><AnimatedNumber value={totalSafezoneMetal} /></span>
                    <span className="text-[8px] sm:text-[10px] font-medium uppercase text-zinc-400">Metal</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-bold text-white"><AnimatedNumber value={totalSafezoneHqm} /></span>
                    <span className="text-[8px] sm:text-[10px] font-medium uppercase text-cyan-500">HQM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.03 }
            }
          }}
          className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5"
        >
          {ITEMS.filter(i => !i.isRaw).map((item) => (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
              key={item.id}
              className="group relative flex flex-col items-center rounded-xl sm:rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:bg-zinc-800/80 hover:shadow-[0_8px_30px_rgba(249,115,22,0.08)]"
            >
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
                <div className="group/item-tooltip relative flex items-center justify-center">
                  <Info className="h-3 w-3 sm:h-4 sm:w-4 text-zinc-500 hover:text-zinc-300 transition-colors cursor-help" />
                  <div className="pointer-events-none absolute bottom-full sm:bottom-auto sm:top-full right-0 sm:-right-2 mb-1.5 sm:mb-0 sm:mt-1.5 w-48 sm:w-56 opacity-0 transition-opacity group-hover/item-tooltip:opacity-100 z-30 rounded-lg bg-zinc-800 p-2 text-left text-[10px] sm:text-xs text-zinc-300 shadow-xl border border-zinc-700">
                    <div className="font-bold text-white mb-1.5 border-b border-zinc-700 pb-1">Yields (per 1)</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[9px] sm:text-[10px] font-semibold text-emerald-400 mb-1">Normal</div>
                        <div className="flex flex-col gap-1">
                          {item.yields?.normal.map((y, idx) => {
                            const targetItem = ITEMS.find(i => i.id === y.itemId);
                            if (!targetItem) return null;
                            return (
                              <div key={idx} className="flex items-center gap-1">
                                <img src={targetItem.image} alt={targetItem.name} className="w-3 h-3 sm:w-4 sm:h-4 object-contain" />
                                <span>{y.amount}{y.chance ? ` (+${Math.round(y.chance * 100)}%)` : ''}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] sm:text-[10px] font-semibold text-red-400 mb-1">Safezone</div>
                        <div className="flex flex-col gap-1">
                          {item.yields?.safezone.map((y, idx) => {
                            const targetItem = ITEMS.find(i => i.id === y.itemId);
                            if (!targetItem) return null;
                            return (
                              <div key={idx} className="flex items-center gap-1">
                                <img src={targetItem.image} alt={targetItem.name} className="w-3 h-3 sm:w-4 sm:h-4 object-contain" />
                                <span>{y.amount}{y.chance ? ` (+${Math.round(y.chance * 100)}%)` : ''}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mb-2 sm:mb-4 flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center rounded-lg sm:rounded-xl bg-zinc-950 p-1.5 sm:p-2 shadow-inner transition-transform duration-300 group-hover:scale-110">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-contain drop-shadow-md"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-[10px] sm:text-xs text-zinc-500 text-center leading-tight">${item.name}</span>`;
                  }}
                />
              </div>

              <h3 className="mb-2 sm:mb-3 text-center text-[10px] sm:text-sm font-medium leading-tight text-zinc-300">{item.name}</h3>

              <div className="mt-auto flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 sm:p-1">
                <button
                  onClick={() => decrement(item.id)}
                  className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white active:bg-zinc-700"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={inventory[item.id] || ''}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  placeholder="0"
                  className="w-8 sm:w-12 bg-transparent text-center text-xs sm:text-sm font-bold text-white outline-none placeholder:text-zinc-600"
                />
                <button
                  onClick={() => increment(item.id)}
                  className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white active:bg-zinc-700"
                >
                  +
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-zinc-400" />
                Einstellungen
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-900 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Gemini API Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => handleSaveApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                  />
                </div>
                <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
                  Dein API Key wird nur lokal in deinem Browser (LocalStorage) gespeichert und niemals an unsere Server gesendet. 
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline ml-1">
                    Hier Key erstellen.
                  </a>
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              >
                Fertig
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
