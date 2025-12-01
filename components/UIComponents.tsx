import React from 'react';

// --- Primitives ---

export const HeroUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="min-h-screen text-foreground bg-background selection:bg-primary/30 selection:text-primary-foreground font-sans antialiased">{children}</div>;
};

export const Spacer: React.FC<{ y?: number; x?: number }> = ({ y = 1, x = 0 }) => (
  <div style={{ marginTop: `${y * 0.25}rem`, marginLeft: `${x * 0.25}rem` }} />
);

// --- HUD Overlay (New) ---

export const HUDOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dark Elegance Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
      
      {/* Horizontal Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20 pointer-events-none"></div>

      {/* Wide & Low Corners */}
      <div className="absolute inset-0 p-4 md:p-8">
          {/* Top Left */}
          <div className="absolute top-8 left-8 w-32 md:w-64 h-16 border-t-2 border-l-2 border-zinc-800/60 rounded-none"></div>
          <div className="absolute top-8 left-8 w-16 h-32 md:h-64 border-l-2 border-zinc-800/30 rounded-none"></div>
          
          {/* Top Right */}
          <div className="absolute top-8 right-8 w-32 md:w-64 h-16 border-t-2 border-r-2 border-zinc-800/60 rounded-none"></div>
          <div className="absolute top-8 right-8 w-16 h-32 md:h-64 border-r-2 border-zinc-800/30 rounded-none"></div>
          
          {/* Bottom Left */}
          <div className="absolute bottom-8 left-8 w-32 md:w-64 h-16 border-b-2 border-l-2 border-zinc-800/60 rounded-none"></div>
          <div className="absolute bottom-8 left-8 w-16 h-32 md:h-64 border-l-2 border-zinc-800/30 rounded-none"></div>

          {/* Bottom Right */}
          <div className="absolute bottom-8 right-8 w-32 md:w-64 h-16 border-b-2 border-r-2 border-zinc-800/60 rounded-none"></div>
          <div className="absolute bottom-8 right-8 w-16 h-32 md:h-64 border-r-2 border-zinc-800/30 rounded-none"></div>
      </div>
      
      {/* Decorative Marks */}
      <div className="absolute top-1/2 left-6 w-1 h-12 bg-zinc-800/50 hidden md:block"></div>
      <div className="absolute top-1/2 right-6 w-1 h-12 bg-zinc-800/50 hidden md:block"></div>
    </div>
  );
};

// --- Badge ---

interface BadgeProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'default';
  variant?: 'solid' | 'flat' | 'outline' | 'glow';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'default', variant = 'flat', size = 'md', className = '' }) => {
  const colors = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    default: "bg-zinc-800/50 text-zinc-400 border-zinc-700/50",
  };
  
  const solidColors = {
    primary: "bg-primary text-black border-transparent shadow-[0_0_15px_rgba(0,240,255,0.6)]",
    secondary: "bg-secondary text-white border-transparent shadow-[0_0_15px_rgba(112,0,255,0.6)]",
    success: "bg-success text-black border-transparent shadow-[0_0_15px_rgba(0,255,148,0.6)]",
    warning: "bg-orange-500 text-black border-transparent",
    default: "bg-zinc-700 text-white border-transparent",
  };

  const glowColors = {
    primary: "bg-transparent text-primary border border-primary shadow-[0_0_12px_rgba(0,240,255,0.5),inset_0_0_8px_rgba(0,240,255,0.2)]",
    secondary: "bg-transparent text-secondary border border-secondary shadow-[0_0_12px_rgba(112,0,255,0.5),inset_0_0_8px_rgba(112,0,255,0.2)]",
    success: "bg-transparent text-success border border-success shadow-[0_0_12px_rgba(0,255,148,0.5),inset_0_0_8px_rgba(0,255,148,0.2)]",
    warning: "bg-transparent text-orange-400 border border-orange-400",
    default: "bg-transparent text-zinc-300 border border-zinc-600",
  };

  const sizes = { sm: "text-[10px] px-2 h-5 tracking-wider", md: "text-xs px-3 h-7 tracking-wide" };
  
  let selectedStyle = colors[color];
  if (variant === 'solid') selectedStyle = solidColors[color];
  if (variant === 'glow') selectedStyle = glowColors[color];

  const border = variant === 'outline' ? 'border' : 'border';

  return (
    <span className={`inline-flex items-center justify-center rounded-none font-mono font-bold uppercase ${sizes[size]} ${selectedStyle} ${border} transition-all ${className}`}>
      {children}
    </span>
  );
};

// --- ProgressBar ---

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  color?: 'primary' | 'secondary' | 'success';
  label?: string;
  showValueLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, color = 'primary', label, showValueLabel }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorStyles = {
    primary: "bg-primary shadow-[0_0_15px_rgba(0,240,255,0.8)]",
    secondary: "bg-secondary shadow-[0_0_15px_rgba(112,0,255,0.8)]",
    success: "bg-success shadow-[0_0_15px_rgba(0,255,148,0.8)]",
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {(label || showValueLabel) && (
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
          {label && <span>{label}</span>}
          {showValueLabel && <span>{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800 rounded-none overflow-hidden">
        <div 
          className={`h-full ${colorStyles[color]} transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// --- Button ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'secondary' | 'danger' | 'default';
  variant?: 'solid' | 'flat' | 'ghost' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  color = 'default', 
  variant = 'solid', 
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "relative z-0 group box-border inline-flex items-center justify-center gap-2 overflow-hidden outline-none font-bold uppercase tracking-wide transition-all motion-reduce:transition-none text-small rounded-none active:scale-[0.98] duration-200 border border-transparent";
  
  const sizeStyles = {
    sm: "h-8 text-[10px] px-4",
    md: "h-10 text-xs px-6",
    lg: "h-14 text-sm px-8", // Increased height for large buttons
  };

  const colorStyles = {
    solid: {
      primary: "bg-primary text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]",
      secondary: "bg-secondary text-white hover:bg-purple-600 shadow-[0_0_20px_rgba(112,0,255,0.4)]",
      danger: "bg-red-600 text-white shadow-lg shadow-red-500/20",
      default: "bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700",
    },
    flat: {
      primary: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
      secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20",
      danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
      default: "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50",
    },
    ghost: {
        primary: "border-primary/50 text-primary hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]",
        secondary: "border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary hover:shadow-[0_0_15px_rgba(112,0,255,0.3)]",
        danger: "border-red-500 text-red-500 hover:bg-red-500/10",
        default: "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500",
    },
    neon: {
      primary: "bg-black/50 border border-primary text-primary shadow-[0_0_15px_rgba(0,240,255,0.3),inset_0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6),inset_0_0_15px_rgba(0,240,255,0.2)] hover:text-white hover:bg-primary/10",
      secondary: "bg-black/50 border border-secondary text-secondary shadow-[0_0_15px_rgba(112,0,255,0.3),inset_0_0_10px_rgba(112,0,255,0.1)] hover:shadow-[0_0_25px_rgba(112,0,255,0.6),inset_0_0_15px_rgba(112,0,255,0.2)] hover:text-white hover:bg-secondary/10",
      danger: "",
      default: ""
    }
  };

  // @ts-ignore - simple mapping
  const selectedStyle = colorStyles[variant]?.[color] || colorStyles['solid']['default'];
  const disabledStyles = (disabled || isLoading) ? "opacity-50 cursor-not-allowed active:scale-100 pointer-events-none grayscale" : "cursor-pointer";

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${selectedStyle} ${disabledStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" color="current" />}
      {!isLoading && children}
    </button>
  );
};

// --- Input ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  placeholder?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, startContent, endContent, helperText, className = '', ...props }) => {
  return (
    <div className={`group flex flex-col w-full ${className}`}>
      {label && <span className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2 ml-1 font-mono">{label}</span>}
      <div className="relative w-full inline-flex tap-highlight-transparent flex-row items-center shadow-inner px-4 gap-3 bg-black/40 hover:bg-black/60 transition-all rounded-none min-h-12 border border-zinc-800 focus-within:border-primary focus-within:bg-black/80 focus-within:ring-1 focus-within:ring-primary focus-within:shadow-[0_0_15px_rgba(0,240,255,0.15)]">
        {startContent && <div className="text-zinc-500 group-focus-within:text-primary transition-colors">{startContent}</div>}
        <input 
          className="w-full h-full font-mono !bg-transparent outline-none placeholder:text-zinc-700 text-sm text-zinc-100 placeholder:font-sans"
          {...props} 
        />
        {endContent && <div className="text-zinc-500">{endContent}</div>}
      </div>
      {helperText && <span className="text-[10px] text-zinc-600 mt-1.5 ml-3 font-mono">{helperText}</span>}
    </div>
  );
};

// --- Card ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isPressable?: boolean;
  onPress?: () => void;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', isPressable, onPress, hoverable = false, style }) => {
  const pressableStyles = isPressable ? "cursor-pointer active:scale-[0.98]" : "";
  const hoverStyles = hoverable ? "hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:border-primary/50" : "";
  
  return (
    <div 
      onClick={onPress}
      className={`glass-panel flex flex-col relative overflow-hidden h-auto text-foreground box-border outline-none rounded-none transition-all duration-300 border border-white/5 ${pressableStyles} ${hoverStyles} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative flex w-full p-6 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 h-auto flex w-full items-center overflow-hidden color-inherit subpixel-antialiased rounded-none bg-black/40 border-t border-white/5 backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

// --- Spinner ---

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }> = ({ size = 'md', color = 'border-primary' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-4' };
  return (
    <div className={`animate-spin rounded-full border-t-transparent ${sizes[size]} ${color === 'current' ? 'border-current' : color} border-solid shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
  );
};