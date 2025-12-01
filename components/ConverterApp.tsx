import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Input, Button, Card, CardBody, Spacer, Spinner, Badge, ProgressBar } from './UIComponents';
import { Brain, Thermometer, RefreshCw, Activity, LineChart, Cpu, TrendingUp } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const ConverterApp: React.FC<Props> = ({ onBack }) => {
  const [model, setModel] = useState<tf.Sequential | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs] = useState(550); // Increased epochs for precision
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  
  const [weightM, setWeightM] = useState<number>(0); 
  const [biasB, setBiasB] = useState<number>(0);     

  const [celsius, setCelsius] = useState<string>('');
  const [kelvin, setKelvin] = useState<string | null>(null);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { 
      isMounted.current = false;
      if(model) model.dispose();
    };
  }, []);

  const createAndTrainModel = async () => {
    if (model) model.dispose();
    setIsTraining(true);
    setLossHistory([]);
    setCurrentEpoch(0);
    setWeightM(0);
    setBiasB(0);
    setKelvin(null);

    const newModel = tf.sequential();
    newModel.add(tf.layers.dense({ units: 1, inputShape: [1] })); 

    newModel.compile({ 
        loss: 'meanSquaredError', 
        optimizer: tf.train.adam(0.1) 
    });

    // Generate dense dataset for high precision (-200 to 200)
    const trainX: number[] = [];
    const trainY: number[] = [];
    
    for (let i = -200; i <= 200; i += 1) {
        trainX.push(i);
        trainY.push(i + 273.15);
    }
    
    // Add extra weight to the intercept point
    for(let k=0; k<20; k++) {
        trainX.push(0);
        trainY.push(273.15);
    }

    const xs = tf.tensor2d(trainX, [trainX.length, 1]);
    const ys = tf.tensor2d(trainY, [trainY.length, 1]);

    await newModel.fit(xs, ys, {
      epochs: totalEpochs,
      shuffle: true,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          if (!isMounted.current) return;
          // Update visualization less frequently to save UI thread
          if (epoch % 10 === 0 || epoch === totalEpochs - 1) {
             setCurrentEpoch(epoch + 1);
             setLossHistory(prev => [...prev.slice(-49), logs?.loss || 0]);
             
             const layer = newModel.layers[0];
             const weights = layer.getWeights();
             const m = weights[0].dataSync()[0];
             const b = weights[1].dataSync()[0];
             
             setWeightM(m);
             setBiasB(b);
             await new Promise(r => requestAnimationFrame(r));
          }
        }
      }
    });

    if (isMounted.current) {
      setModel(newModel);
      setIsTraining(false);
      xs.dispose();
      ys.dispose();
    }
  };

  const handlePredict = () => {
    if (!model || !celsius) return;
    tf.tidy(() => {
      const input = parseFloat(celsius);
      if (isNaN(input)) return;
      const pred = model.predict(tf.tensor2d([input], [1, 1])) as tf.Tensor;
      setKelvin(pred.dataSync()[0].toFixed(2));
    });
  };

  useEffect(() => { createAndTrainModel(); }, []);

  const renderLossGraph = () => {
      if (lossHistory.length < 2) return null;
      const height = 80;
      const width = 300;
      const maxLoss = Math.max(...lossHistory);
      const minLoss = Math.min(...lossHistory);
      
      const points = lossHistory.map((val, i) => {
          const x = (i / (lossHistory.length - 1)) * width;
          const normalizedVal = (val - minLoss) / (maxLoss - minLoss || 1);
          const y = height - (normalizedVal * height);
          return `${x},${y}`;
      }).join(' ');

      return (
          <div className="relative w-full h-full">
            {/* Grid Lines */}
            <div className="absolute inset-0 border-b border-l border-zinc-700/50" 
                 style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible relative z-10">
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7000FF" />
                        <stop offset="100%" stopColor="#00F0FF" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <polyline 
                   points={points} 
                   fill="none" 
                   stroke="url(#lineGradient)" 
                   strokeWidth="2" 
                   strokeLinecap="round" 
                   strokeLinejoin="round"
                   filter="url(#glow)"
                   vectorEffect="non-scaling-stroke"
                />
            </svg>
          </div>
      );
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in flex flex-col items-center pb-12 relative z-10 pt-4">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-6 w-full">
             <Button onClick={onBack} variant="ghost" color="default" size="lg" className="h-12 px-6 border border-zinc-700 hover:border-secondary hover:text-secondary !rounded-none font-mono text-sm tracking-widest transition-all">
                VOLVER
             </Button>
            <div className="flex-1 text-right md:text-left">
              <h2 className="text-3xl font-black text-white tracking-tight font-mono uppercase">
                CONVERSOR<span className="text-secondary">.NEURONAL</span>
              </h2>
              <div className="flex items-center justify-end md:justify-start gap-2 text-secondary/80 text-xs font-mono mt-1 uppercase">
                  <span className="w-1.5 h-1.5 bg-secondary animate-pulse"></span>
                  <span>ENTORNO_APRENDIZAJE_SUPERVISADO</span>
              </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        
        {/* Left: Monitor (The Lab) */}
        <Card className="h-full bg-black/40 border-zinc-800 rounded-none">
          <CardBody className="p-8 gap-8">
             <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 ${isTraining ? 'bg-secondary/20 text-secondary animate-pulse' : 'bg-success/10 text-success'}`}>
                        {isTraining ? <RefreshCw className="animate-spin" size={20} /> : <Brain size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-md text-white font-mono uppercase tracking-wide">Monitor de Entrenamiento</h3>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase">
                            {isTraining ? `CICLO_ÉPOCA: ${currentEpoch}/${totalEpochs}` : 'ESTADO_MODELO::LISTO'}
                        </span>
                    </div>
                </div>
                {isTraining && <Badge color="secondary" variant="glow" size="sm">ACTIVO</Badge>}
             </div>

             {/* Weights Visualization */}
             <div className="space-y-6">
                 <div className="bg-zinc-900/40 p-5 border border-zinc-800 space-y-4 shadow-inner">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono flex items-center gap-2">
                        <Cpu size={12} /> Parámetros Neuronales
                     </p>
                     
                     {/* Slope (m) */}
                     <div>
                         <div className="flex justify-between text-xs mb-2 font-mono">
                             <span className="text-zinc-400">PESO (m) [OBJ:1.0]</span>
                             <span className="text-secondary font-bold">{weightM.toFixed(5)}</span>
                         </div>
                         <ProgressBar value={weightM * 100} max={150} color="secondary" />
                     </div>

                     {/* Bias (b) */}
                     <div>
                         <div className="flex justify-between text-xs mb-2 font-mono">
                             <span className="text-zinc-400">SESGO (b) [OBJ:273.15]</span>
                             <span className="text-primary font-bold">{biasB.toFixed(3)}</span>
                         </div>
                         <ProgressBar value={biasB} max={300} color="primary" />
                     </div>
                 </div>

                 {/* Loss Graph */}
                 <div className="bg-black/60 p-6 border border-zinc-800 h-48 flex flex-col relative overflow-hidden">
                     <div className="flex justify-between items-center mb-4 relative z-20">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono flex items-center gap-2">
                            <Activity size={12} /> Función de Pérdida (MSE)
                        </p>
                        <span className="text-xs font-mono text-white bg-white/5 px-2 py-0.5">
                             {lossHistory.length > 0 ? lossHistory[lossHistory.length-1].toFixed(5) : '0.00'}
                        </span>
                     </div>
                     <div className="flex-1 w-full">
                         {lossHistory.length > 0 ? renderLossGraph() : <div className="h-full w-full flex items-center justify-center text-xs text-zinc-700 font-mono animate-pulse">ESPERANDO_FLUJO_DATOS...</div>}
                     </div>
                 </div>
             </div>
             
             {!isTraining && (
                 <Button size="sm" variant="neon" color="default" onClick={createAndTrainModel} className="w-full mt-auto border-zinc-700 text-zinc-400 hover:text-white rounded-none">
                    <RefreshCw size={14} className="mr-2" /> REINICIAR ENTRENAMIENTO
                 </Button>
             )}
          </CardBody>
        </Card>

        {/* Right: Interaction (The Interface) */}
        <div className="flex flex-col gap-6">
            <Card className="flex-1 bg-gradient-to-br from-zinc-900/90 to-black border-zinc-800 shadow-2xl shadow-secondary/5 rounded-none">
                <CardBody className="flex flex-col justify-center p-10 gap-8 relative overflow-hidden">
                    {/* Background glow effect */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="text-center relative z-10">
                        <h3 className="text-2xl font-black text-white tracking-tight mb-2 font-mono uppercase">MOTOR DE INFERENCIA</h3>
                        <p className="text-xs text-zinc-500 font-mono max-w-xs mx-auto">Ingrese valor Celsius para propagación.</p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <Input 
                            type="number" 
                            label="TEMP_ENTRADA [°C]" 
                            placeholder="0"
                            value={celsius}
                            onChange={(e) => setCelsius(e.target.value)}
                            disabled={isTraining}
                            startContent={<Thermometer size={16} className="text-zinc-500" />}
                            className="font-mono text-xl"
                        />
                        
                        <Button 
                            color="secondary" 
                            size="lg"
                            variant="solid"
                            className="w-full font-bold tracking-widest h-14 text-sm rounded-none" 
                            onClick={handlePredict}
                            disabled={isTraining || !celsius}
                            isLoading={isTraining}
                        >
                            {isTraining ? 'ENTRENANDO...' : 'CALCULAR PREDICCIÓN'}
                        </Button>
                    </div>

                    <div className="bg-black/40 p-8 text-center border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/5 group-hover:to-secondary/10 transition-colors"></div>
                        
                        <span className="text-zinc-600 text-[10px] block mb-2 uppercase tracking-[0.3em] font-mono">Salida Predicha</span>
                        {kelvin ? (
                            <div className="relative">
                                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 tracking-tighter block drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                    {kelvin}
                                </span>
                                <span className="text-xl text-secondary font-mono absolute top-2 -right-4">K</span>
                            </div>
                        ) : (
                            <span className="text-6xl font-black text-zinc-800 tracking-tighter block animate-pulse">---</span>
                        )}
                    </div>
                </CardBody>
            </Card>
            
            <div className="p-5 bg-zinc-900/50 border border-zinc-800 flex gap-4 items-start backdrop-blur-sm">
                <TrendingUp className="text-primary shrink-0 mt-1" size={18} />
                <div className="space-y-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">Cómo aprende</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        El modelo no conoce la fórmula física. Recibe pares de datos <span className="text-zinc-300 font-mono">[-100 → 173.15]</span> y ajusta sus pesos internos a través de <span className="text-primary">Gradient Descent</span> para minimizar el error cuadrático medio.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConverterApp;