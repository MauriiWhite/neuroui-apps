import React, { useState } from 'react';
import { HeroUIProvider, Card, CardBody, CardFooter, HUDOverlay } from './components/UIComponents';
import { AppView } from './types';
import RecommenderApp from './components/RecommenderApp';
import ConverterApp from './components/ConverterApp';
import { ShoppingBag, BrainCircuit, ArrowRight, Layers, Cpu, ScanLine } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 animate-fade-in relative z-10 w-full max-w-7xl mx-auto border-x border-transparent">
      
      {/* HUD Info Text */}
      <div className="absolute top-10 left-10 hidden md:block text-[10px] font-mono text-zinc-700 uppercase tracking-widest opacity-60">
        COORD: 45.912, -12.004<br/>
        SECTOR: ALPHA-9
      </div>
      <div className="absolute bottom-10 right-10 hidden md:block text-[10px] font-mono text-zinc-700 uppercase tracking-widest text-right opacity-60">
        SYS_STATUS: NOMINAL<br/>
        UPTIME: 99.99%
      </div>

      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="text-center mb-24 max-w-4xl relative mt-20 md:mt-12">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-zinc-900/50 border border-white/5 backdrop-blur-md mb-16 shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">Sistema En Línea</span>
        </div>
        
        <h1 className="text-6xl md:text-9xl font-black text-white mb-10 tracking-tighter drop-shadow-2xl animate-float relative z-20">
          NEURO<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-primary animate-gradient-x">UI</span>
        </h1>
        
        <div className="max-w-3xl mx-auto px-6 relative">
          {/* Text Decoration Lines */}
          <div className="absolute left-0 top-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent to-primary/50 hidden md:block"></div>
          <div className="absolute right-0 top-1/2 w-12 h-[1px] bg-gradient-to-l from-transparent to-primary/50 hidden md:block"></div>

          <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed font-mono text-center">
            Suite de herramientas de IA de próxima generación ejecutándose localmente en tu navegador mediante <span className="text-primary font-bold">TensorFlow.js</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-4 relative z-20">
        {/* Card 1: Recommender */}
        <Card 
          isPressable 
          hoverable
          onPress={() => setView('recommender')} 
          className="h-[400px] group bg-black/40 border-zinc-800/50 rounded-none overflow-visible backdrop-blur-sm"
        >
          {/* Corner accents for cards */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-zinc-600 group-hover:border-primary transition-colors"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-zinc-600 group-hover:border-primary transition-colors"></div>

          <CardBody className="items-center justify-center p-12 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="bg-zinc-900 border border-zinc-700 p-6 mb-8 group-hover:scale-110 group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-500">
              <ShoppingBag size={48} className="text-zinc-300 group-hover:text-primary transition-colors" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight group-hover:text-primary transition-colors font-mono uppercase">RECOMENDADOR</h2>
            <p className="text-zinc-500 text-center text-sm leading-relaxed font-mono">
              [MOTOR_BÚSQUEDA_VECTORIAL]<br/>
              Similitud de Coseno + Inferencia Híbrida.
            </p>
          </CardBody>
          <CardFooter className="justify-center py-6 bg-black/60 border-t border-white/5">
             <span className="text-zinc-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2 group-hover:text-primary group-hover:gap-4 transition-all">
               Iniciar Módulo <ArrowRight size={14} />
             </span>
          </CardFooter>
        </Card>

        {/* Card 2: Converter */}
        <Card 
          isPressable 
          hoverable
          onPress={() => setView('converter')} 
          className="h-[400px] group bg-black/40 border-zinc-800/50 rounded-none overflow-visible backdrop-blur-sm"
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-zinc-600 group-hover:border-secondary transition-colors"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-zinc-600 group-hover:border-secondary transition-colors"></div>

          <CardBody className="items-center justify-center p-12 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="bg-zinc-900 border border-zinc-700 p-6 mb-8 group-hover:scale-110 group-hover:border-secondary group-hover:shadow-[0_0_30px_rgba(112,0,255,0.2)] transition-all duration-500">
              <BrainCircuit size={48} className="text-zinc-300 group-hover:text-secondary transition-colors" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight group-hover:text-secondary transition-colors font-mono uppercase">RED NEURONAL</h2>
            <p className="text-zinc-500 text-center text-sm leading-relaxed font-mono">
              [REGRESIÓN_LINEAL]<br/>
              Aprendizaje supervisado en tiempo real.
            </p>
          </CardBody>
          <CardFooter className="justify-center py-6 bg-black/60 border-t border-white/5">
             <span className="text-zinc-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2 group-hover:text-secondary group-hover:gap-4 transition-all">
               Acceder al Core <ArrowRight size={14} />
             </span>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-32 flex gap-8 text-zinc-700 border-t border-white/5 pt-8 w-full max-w-3xl justify-center z-20">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono hover:text-primary transition-colors cursor-help">
              <Layers size={12} /> React 19 Core
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono hover:text-secondary transition-colors cursor-help">
              <Cpu size={12} /> Acelerado por TFJS
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono hover:text-success transition-colors cursor-help">
              <ScanLine size={12} /> GPU Activada
          </div>
      </div>
    </div>
  );

  return (
    <HeroUIProvider>
      <div className="min-h-screen bg-[#030305] text-foreground p-6 overflow-x-hidden relative">
        <HUDOverlay />
        
        {/* Animated Grid Background */}
        <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none animate-grid-flow z-0" />
        
        {view === 'home' && renderHome()}
        {view === 'recommender' && <RecommenderApp onBack={() => setView('home')} />}
        {view === 'converter' && <ConverterApp onBack={() => setView('home')} />}
      </div>
    </HeroUIProvider>
  );
};

export default App;