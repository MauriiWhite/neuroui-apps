import React, { useState, useEffect, useMemo } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Product, ScoredProduct } from '../types';
import { products, getVocabulary } from '../services/dataset';
import { Card, CardBody, CardFooter, Button, Spinner, Badge, ProgressBar } from './UIComponents';
import { ShoppingCart, X, Plus, Trash2, Zap, Brain, Database, ScanLine } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const RecommenderApp: React.FC<Props> = ({ onBack }) => {
  const [results, setResults] = useState<ScoredProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Only Cart Context now
  const [activeCartTokens, setActiveCartTokens] = useState<string[]>([]);

  const [cart, setCart] = useState<ScoredProduct[]>([]);

  // Memoize vocabulary
  const vocabulary = useMemo(() => getVocabulary(products), []);
  
  // 1. CREACIÓN DEL ESPACIO VECTORIAL DE PRODUCTOS
  // Optimizamos creando los tensores una sola vez.
  const productTensorInfo = useMemo(() => {
    return tf.tidy(() => {
      const rawVectors = products.map(p => {
        const vec = new Array(vocabulary.length).fill(0);
        
        // Ponderación Robusta:
        // Categoría: Peso x3 (La estructura define el producto)
        // Tags: Peso x1 (Los detalles refinan la búsqueda)
        const catIdx = vocabulary.indexOf(p.category.toLowerCase());
        if (catIdx !== -1) vec[catIdx] = 3.0; 
        
        p.tags.forEach(t => {
          const idx = vocabulary.indexOf(t.toLowerCase());
          if (idx !== -1) vec[idx] = 1.0; 
        });
        return vec;
      });

      const tensor = tf.tensor2d(rawVectors);
      
      // Normalización L2 (Euclidiana)
      // Convertimos cada vector de producto en un Vector Unitario.
      // Esto evita que productos con MUCHOS tags dominen injustamente sobre productos con pocos tags pero muy específicos.
      const norms = tensor.norm('euclidean', 1).reshape([-1, 1]);
      const normalizedTensor = tensor.div(norms.add(1e-6)); // +epsilon para evitar div/0
      
      return {
          tensor: normalizedTensor,
          original: tensor // Guardamos el original por si necesitamos magnitud
      };
    });
  }, [vocabulary]);

  // Cleanup tensor on unmount
  useEffect(() => {
    return () => {
      if(productTensorInfo) {
          productTensorInfo.tensor.dispose();
          productTensorInfo.original.dispose();
      }
    };
  }, [productTensorInfo]);

  // 2. MOTOR DE INFERENCIA (Cálculo del Centroide del Carrito)
  useEffect(() => {
    // Debounce para UX
    const timer = setTimeout(() => {
      setIsProcessing(true);
      
      tf.tidy(() => {
        const vocabLen = vocabulary.length;
        
        // Si el carrito está vacío, no hay vector de intención
        if (cart.length === 0) {
            setResults(products.map(p => ({ ...p, score: 0 })));
            setActiveCartTokens([]);
            setIsProcessing(false);
            return;
        }

        // Construcción del Vector del Carrito (Query Vector)
        const cartTokensSet = new Set<string>();
        
        // Sumamos los vectores crudos de todos los productos en el carrito
        // Esto crea un "Producto Promedio" o Centroide de los gustos del usuario
        const cartVecArr = new Array(vocabLen).fill(0);

        cart.forEach(item => {
            const catIdx = vocabulary.indexOf(item.category.toLowerCase());
            if (catIdx !== -1) {
                cartVecArr[catIdx] += 3.0; // Mismo peso que en la indexación
                cartTokensSet.add(item.category.toLowerCase());
            }
            item.tags.forEach(t => {
                const tagIdx = vocabulary.indexOf(t.toLowerCase());
                if (tagIdx !== -1) {
                    cartVecArr[tagIdx] += 1.0;
                    cartTokensSet.add(t.toLowerCase());
                }
            });
        });
        
        setActiveCartTokens(Array.from(cartTokensSet));

        const cartTensor = tf.tensor1d(cartVecArr);
        
        // Normalización L2 del Vector del Carrito
        // Al normalizar el carrito, obtenemos la DIRECCIÓN pura de la intención de compra
        const cartNorm = cartTensor.norm();
        const normalizedCartVector = cartTensor.div(cartNorm.add(1e-6)).reshape([1, vocabLen]);

        // 3. Similitud de Coseno (Producto Punto de vectores normalizados)
        // [N_Productos x Vocab] dot [Vocab x 1] = [N_Productos x 1]
        const scores = productTensorInfo.tensor.matMul(normalizedCartVector.transpose());
        const scoreData = scores.dataSync(); 

        // 4. Ordenamiento y Filtrado
        const scored = products.map((p, i) => ({
          ...p,
          score: scoreData[i]
        })).sort((a, b) => b.score - a.score);

        setResults(scored);
        setIsProcessing(false);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [cart, productTensorInfo, vocabulary]);

  // Cart Handlers
  const toggleCart = (product: ScoredProduct) => {
    if (cart.find(p => p.id === product.id)) {
      setCart(cart.filter(p => p.id !== product.id));
    } else {
      setCart([...cart, product]);
    }
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.price, 0);
  
  // Cálculo de Coherencia del Sistema (Promedio de similitud del carrito consigo mismo)
  const systemCoherence = useMemo(() => {
      if (cart.length < 2) return 100;
      // Simplificación visual: un número basado en la puntuación promedio de los items seleccionados
      const totalScore = cart.reduce((acc, item) => {
          const itemScore = results.find(r => r.id === item.id)?.score || 0;
          return acc + itemScore;
      }, 0);
      return Math.min(100, (totalScore / cart.length) * 100);
  }, [cart, results]);

  // --- VISTA PRINCIPAL (GRID) ---
  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in pb-12 relative z-10 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-6 w-full">
          <Button onClick={onBack} variant="ghost" color="default" size="lg" className="h-12 px-6 border border-zinc-700 hover:border-primary hover:text-primary !rounded-none font-mono text-sm tracking-widest transition-all">
             VOLVER
          </Button>
          <div className="flex-1 text-right md:text-left">
            <h2 className="text-3xl font-black text-white tracking-tight font-mono uppercase">
              TECH_NEXUS<span className="text-primary">.AI</span>
            </h2>
            <div className="flex items-center justify-end md:justify-start gap-2 text-primary/60 text-xs font-mono mt-1 uppercase">
                <span className="w-1.5 h-1.5 bg-primary animate-pulse"></span>
                <span>CATÁLOGO_INTELIGENTE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Context & Cart */}
        <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-6 space-y-6">
                
                {/* AI Context HUD - Now only Cart Context */}
                <Card className="bg-black/60 border-zinc-800 backdrop-blur-xl rounded-none shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <CardBody className="gap-2 p-5">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] text-zinc-500 font-bold font-mono uppercase tracking-widest flex items-center gap-2">
                                <Zap size={10} className="text-yellow-500" /> Nodos de Contexto
                            </span>
                            {isProcessing && <Spinner size="sm" color="border-primary" />}
                        </div>
                        
                        <div className="bg-zinc-900/50 p-4 border border-zinc-800 relative overflow-hidden min-h-[100px] flex flex-col">
                            <div className="absolute top-0 right-0 p-1 opacity-20">
                                <Brain size={40} />
                            </div>
                            
                            <div className="flex flex-wrap gap-2 relative z-10">
                                {activeCartTokens.length === 0 && (
                                    <div className="text-zinc-600 font-mono text-[10px] uppercase w-full text-center py-4">
                                        <p className="animate-pulse mb-1">Esperando Input...</p>
                                        <p className="text-[9px] text-zinc-700">Añada productos para definir el vector objetivo</p>
                                    </div>
                                )}
                                
                                {activeCartTokens.slice(0, 8).map(t => (
                                    <Badge key={`c-${t}`} color="default" size="sm" variant="flat" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                                        {t}
                                    </Badge>
                                ))}
                                {activeCartTokens.length > 8 && (
                                    <span className="text-[9px] text-zinc-500 font-mono self-center">+{activeCartTokens.length - 8} más...</span>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Cart Panel */}
                <Card className="bg-black/60 border-zinc-800 backdrop-blur-xl rounded-none">
                    <CardBody className="p-5">
                         <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                            <h3 className="font-bold text-white flex items-center gap-2 font-mono text-sm tracking-wider uppercase">
                                <ShoppingCart size={14} className="text-secondary" /> MÓDULO_COMPRA <span className="text-zinc-600">[{cart.length}]</span>
                            </h3>
                            {cart.length > 0 && (
                                <button onClick={() => setCart([])} className="text-[10px] text-red-500 hover:text-red-400 font-mono uppercase transition-colors">
                                    [PURGAR]
                                </button>
                            )}
                         </div>

                         {cart.length === 0 ? (
                             <div className="py-8 border border-dashed border-zinc-800 bg-zinc-900/20 text-center">
                                 <p className="text-[10px] text-zinc-600 font-mono uppercase">Sin Componentes</p>
                             </div>
                         ) : (
                             <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                 {cart.map(item => (
                                     <div key={item.id} className="flex gap-3 items-center bg-zinc-900/50 p-2 border border-zinc-800/50 hover:border-zinc-700 transition-colors group">
                                         <img src={item.image} alt="mini" className="w-8 h-8 object-cover grayscale group-hover:grayscale-0 transition-all" />
                                         <div className="flex-1 min-w-0">
                                             <p className="text-[10px] font-bold text-zinc-300 truncate font-mono">{item.name}</p>
                                             <p className="text-[10px] text-secondary">${item.price}</p>
                                         </div>
                                         <button 
                                            onClick={() => toggleCart(item)}
                                            className="p-1.5 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 transition-colors"
                                         >
                                             <X size={12} />
                                         </button>
                                     </div>
                                 ))}
                             </div>
                         )}

                         {cart.length > 0 && (
                             <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4">
                                 {/* AI Relevance Points Display */}
                                 <div className="bg-gradient-to-r from-secondary/5 to-transparent border-l-2 border-secondary pl-3 py-1">
                                     <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-mono text-secondary uppercase">COHERENCIA</span>
                                        <span className="text-sm font-mono font-bold text-white leading-none">
                                            {systemCoherence.toFixed(1)}%
                                        </span>
                                     </div>
                                 </div>
                                 
                                 <div className="flex justify-between items-center font-mono">
                                     <span className="text-xs text-zinc-500">TOTAL</span>
                                     <span className="text-lg font-bold text-primary">${cartTotal.toFixed(2)}</span>
                                 </div>
                             </div>
                         )}
                    </CardBody>
                </Card>
            </div>
        </div>

        {/* Right Grid: Results */}
        <div className="lg:col-span-9">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {results.map((product, index) => {
                   // Normalización visual para la barra (el score coseno va de -1 a 1, pero aquí esperamos 0 a 1 en contexto positivo)
                   const rawScore = Math.max(0, product.score);
                   const matchPercent = Math.round(rawScore * 100);
                   
                   const isMatch = rawScore > 0.15; // Threshold visual
                   const relevanceColor = rawScore > 0.75 ? 'success' : rawScore > 0.4 ? 'primary' : 'secondary';
                   const isInCart = cart.some(p => p.id === product.id);
                   
                   return (
                    <Card 
                        key={product.id} 
                        className={`transition-all duration-300 group border-zinc-800 rounded-none ${
                            isMatch && cart.length > 0 ? 'bg-zinc-900/40 opacity-100 border-primary/30 hover:border-primary/60' : 'opacity-80 hover:opacity-100 bg-black/60'
                        }`}
                        hoverable
                        style={{ order: isInCart ? -1 : undefined }}
                    >
                        <CardBody className="p-0">
                        {/* Image Section */}
                        <div className="relative h-48 w-full overflow-hidden bg-black">
                            <div className="absolute inset-0 bg-grid opacity-20 z-10 pointer-events-none" />
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-20" />
                            
                            {/* AI Match Badge */}
                            {cart.length > 0 && !isInCart && (
                                <div className="absolute top-0 left-0 z-30">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 backdrop-blur-md border-b border-r ${
                                        rawScore > 0.6 
                                            ? 'bg-success/10 border-success/30 text-success' 
                                            : rawScore > 0.3
                                                ? 'bg-primary/10 border-primary/30 text-primary'
                                                : 'bg-zinc-900/80 border-zinc-700 text-zinc-500'
                                    }`}>
                                        <ScanLine size={12} />
                                        <span className="text-[10px] font-mono font-bold">{matchPercent}% AFINIDAD</span>
                                    </div>
                                </div>
                            )}

                            {isInCart && (
                                <div className="absolute top-0 right-0 z-30">
                                    <Badge color="secondary" variant="solid" size="sm" className="rounded-none">
                                        EN SISTEMA
                                    </Badge>
                                </div>
                            )}

                            <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
                                <h3 className="font-bold text-white text-md truncate mb-1 tracking-wide font-mono uppercase">{product.name}</h3>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] text-zinc-400 bg-white/5 border border-white/5 px-2 py-0.5 font-mono uppercase">
                                        {product.category}
                                    </span>
                                    <span className="text-primary font-mono font-bold text-lg drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                                        ${product.price}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="p-5 space-y-4">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 h-12 overflow-hidden content-start">
                                {product.tags.slice(0, 5).map(t => {
                                    const isCartMatch = activeCartTokens.includes(t.toLowerCase());
                                    
                                    let badgeColor: 'default' | 'primary' | 'secondary' | 'success' = 'default';
                                    let badgeVariant: 'flat' | 'glow' = 'flat';

                                    if (isCartMatch) { badgeColor = 'primary'; badgeVariant = 'glow'; }

                                    return (
                                        <Badge key={t} color={badgeColor} variant={badgeVariant} size="sm">
                                            {t}
                                        </Badge>
                                    );
                                })}
                            </div>

                            {/* Relevancy Bar - Only show if cart is active */}
                            {cart.length > 0 && (
                                <div className="relative pt-1 animate-fade-in">
                                    <ProgressBar 
                                        value={matchPercent} 
                                        color={relevanceColor} 
                                        showValueLabel={false}
                                    />
                                    <div className="flex justify-between text-[9px] uppercase font-mono tracking-widest mt-1.5 text-zinc-600">
                                        <span>Índice de Afinidad</span>
                                        <span className={rawScore > 0.5 ? 'text-success' : ''}>
                                            {product.score.toFixed(4)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        </CardBody>
                        <CardFooter className="py-3 px-5">
                           <Button 
                                size="sm" 
                                color={isInCart ? "danger" : "primary"} 
                                variant={isInCart ? "flat" : "neon"} 
                                className={`text-[10px] w-full rounded-none`}
                                onClick={() => toggleCart(product)}
                            >
                                {isInCart ? <Trash2 size={12} /> : <Plus size={12} />}
                                {isInCart ? "QUITAR UNIDAD" : "AÑADIR AL SISTEMA"}
                            </Button>
                        </CardFooter>
                    </Card>
                )})}
            </div>
            {results.length === 0 && (
                <div className="w-full py-32 text-center border border-dashed border-zinc-800 bg-zinc-900/10 flex flex-col items-center justify-center">
                    <Database size={40} className="text-zinc-700 mb-4" />
                    <p className="text-zinc-500 font-mono text-sm uppercase">CARGANDO_INVENTARIO...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RecommenderApp;