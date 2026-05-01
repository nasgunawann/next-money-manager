"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { IconBackspace, IconCheck, IconDivide, IconMinus, IconPlus, IconX, IconEqual } from "@tabler/icons-react";
import { cn, formatNumericInput } from "@/lib/utils";

interface CalculatorKeypadProps {
  initialValue?: string;
  onConfirm: (amount: number) => void;
  onCancel?: () => void;
}

export function CalculatorKeypad({
  initialValue = "",
  onConfirm,
  onCancel,
}: CalculatorKeypadProps) {
  const [expression, setExpression] = useState(initialValue || "0");
  const [result, setResult] = useState<number | null>(null);
  const [isError, setIsError] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Safely evaluate simple math expressions
  const evaluateExpression = useCallback((expr: string): number | null => {
    try {
      // Replace display operators with standard math operators
      const mathExpr = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/,/g, "");

      // Only allow numbers and basic operators to prevent eval vulnerabilities
      if (!/^[0-9+\-*/.\s]+$/.test(mathExpr)) {
        return null;
      }

      const func = new Function(`return ${mathExpr}`);
      const evaluated = func();

      if (typeof evaluated === "number" && !isNaN(evaluated)) {
        if (!isFinite(evaluated)) return Infinity;
        return evaluated;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const val = evaluateExpression(expression);
    if (val === Infinity) {
      setIsError(true);
      setResult(null);
    } else if (val !== null) {
      setIsError(false);
      setResult(val);
    } else {
      // If we are currently in error state, keep it until expression changes to something valid
      // or at least not incomplete.
    }
  }, [expression, evaluateExpression]);

  const handleInput = useCallback((char: string) => {
    setExpression((prev) => {
      if (prev.length >= 20) return prev; // Guard: Max length 20 characters

      // Guard: Prevent starting with invalid operators
      const isOperator = (c: string) => ["+", "-", "×", "÷"].includes(c);
      if (prev === "0" && isOperator(char) && char !== "-") {
        return prev;
      }

      if (prev === "0" && /[0-9]/.test(char)) {
        if (char === "0" || char === "00" || char === "000") return "0";
        return char;
      }

      // Prevent consecutive operators
      const lastChar = prev.slice(-1);

      if (isOperator(char) && isOperator(lastChar)) {
        return prev.slice(0, -1) + char;
      }

      return prev + char;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setExpression((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  }, []);

  const handleClear = useCallback(() => {
    setExpression("0");
    setResult(0);
    setIsError(false);
    setIsAllSelected(false);
  }, []);

  const isOperator = (c: string) => ["+", "-", "×", "÷"].includes(c);
  const isIncomplete = isOperator(expression.slice(-1));
  const canConfirm = !isError && !isIncomplete;

  const handleEvaluate = useCallback(() => {
    if (isError || isIncomplete) return;
    const val = evaluateExpression(expression);
    if (val !== null) {
      setExpression(val.toString());
    }
  }, [expression, evaluateExpression, isError, isIncomplete]);

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    const finalValue = result !== null ? result : evaluateExpression(expression) || 0;
    onConfirm(Math.abs(Number(finalValue)));
  }, [canConfirm, result, expression, evaluateExpression, onConfirm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow default behavior for actual form inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Only ignore if it's NOT our specific readonly input
        if (!e.target.readOnly) return;
      }

      const key = e.key;

      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === "a") {
        e.preventDefault();
        setIsAllSelected(true);
        return;
      }

      if (isAllSelected) {
        if (key === "Backspace" || key === "Delete") {
          e.preventDefault();
          handleClear();
          return;
        } else if (key !== "Shift" && key !== "Control" && key !== "Alt" && key !== "Meta") {
          handleClear();
          // let it fall through to handle the new input
        }
      }
      
      if (/[0-9]/.test(key)) {
        e.preventDefault();
        handleInput(key);
      } else if (key === "+" || key === "-") {
        e.preventDefault();
        handleInput(key);
      } else if (key === "*" || key.toLowerCase() === "x") {
        e.preventDefault();
        handleInput("×");
      } else if (key === "/") {
        e.preventDefault();
        handleInput("÷");
      } else if (key === "Backspace") {
        e.preventDefault();
        handleDelete();
      } else if (key === "Enter") {
        e.preventDefault();
        handleConfirm();
      } else if (key === "=") {
        e.preventDefault();
        handleEvaluate();
      } else if (key === "Escape") {
        e.preventDefault();
        if (onCancel) onCancel();
      } else if (key.toLowerCase() === "c") {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInput, handleDelete, handleConfirm, handleClear, handleEvaluate, onCancel, isAllSelected]);

  const Button = ({
    children,
    onClick,
    onLongPress,
    variant = "default",
    className,
    colSpan = 1,
    disabled = false,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    onLongPress?: () => void;
    variant?: "default" | "operator" | "action" | "confirm";
    className?: string;
    colSpan?: number;
    disabled?: boolean;
  }) => {
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const [isLongPressActive, setIsLongPressActive] = useState(false);

    const startTimer = () => {
      if (!onLongPress) return;
      setIsLongPressActive(false);
      timerRef.current = setTimeout(() => {
        setIsLongPressActive(true);
        onLongPress();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([30, 50, 30]); // Haptic feedback khusus long press
        }
      }, 600); // 0.6 detik untuk long press
    };

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const variants = {
      default: "bg-white/50 hover:bg-white/80 active:bg-zinc-200/80 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/80 dark:active:bg-zinc-600/80 text-foreground",
      operator: "bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary font-medium",
      action: "bg-destructive/10 hover:bg-destructive/20 active:bg-destructive/30 text-destructive font-medium",
      confirm: "bg-primary hover:bg-primary/90 active:bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale",
    };

    return (
      <motion.button
        transition={{ duration: 0.1 }}
        whileTap={{ scale: 0.95 }}
        onPointerDown={startTimer}
        onPointerUp={clearTimer}
        onPointerLeave={clearTimer}
        onClick={(e) => {
          e.preventDefault();
          // Jika baru saja trigger long press, jangan jalankan onClick biasa
          if (isLongPressActive) {
            setIsLongPressActive(false);
            return;
          }
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(10);
          }
          onClick();
        }}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center rounded-2xl p-4 text-xl backdrop-blur-sm transition-colors duration-75 active:transition-none border border-white/20 dark:border-zinc-700/30",
          variants[variant],
          colSpan === 2 ? "col-span-2" : "col-span-1",
          className
        )}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-md mx-auto">
      {/* Display Section */}
      <div className="flex flex-col items-end justify-end p-4 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-border/50 min-h-[100px] overflow-hidden relative">
        <div className="absolute top-4 left-4 flex gap-2">
          {onCancel && (
            <button onClick={onCancel} className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
              <IconX size={18} />
            </button>
          )}
        </div>

        <div className="text-right w-full">
          <div className={cn(
            "text-lg font-medium tracking-wide break-all transition-colors inline-block",
            isAllSelected 
              ? "bg-primary/20 text-primary px-1 rounded" 
              : "text-muted-foreground"
          )}>
            {expression.replace(/\d+/g, (match) => match.replace(/\B(?=(\d{3})+(?!\d))/g, "."))}
          </div>
          <div className="text-4xl font-bold tracking-tight mt-1 text-foreground">
            {isError ? (
              <span className="text-destructive">Error</span>
            ) : (
              <>
                {result !== null && result < 0 ? "-" : ""}Rp {result !== null ? formatNumericInput(Math.abs(result).toString()) : "0"}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        <Button variant="action" onClick={handleClear}>C</Button>
        <Button variant="operator" onClick={() => handleInput("÷")}><IconDivide size={24} /></Button>
        <Button variant="operator" onClick={() => handleInput("×")}><IconX size={24} /></Button>
        <Button 
          variant="operator" 
          onClick={() => handleDelete()} 
          onLongPress={handleClear}
        >
          <IconBackspace size={24} />
        </Button>

        <Button onClick={() => handleInput("7")}>7</Button>
        <Button onClick={() => handleInput("8")}>8</Button>
        <Button onClick={() => handleInput("9")}>9</Button>
        <Button variant="operator" onClick={() => handleInput("-")}><IconMinus size={24} /></Button>

        <Button onClick={() => handleInput("4")}>4</Button>
        <Button onClick={() => handleInput("5")}>5</Button>
        <Button onClick={() => handleInput("6")}>6</Button>
        <Button variant="operator" onClick={() => handleInput("+")}><IconPlus size={24} /></Button>

        <Button onClick={() => handleInput("1")}>1</Button>
        <Button onClick={() => handleInput("2")}>2</Button>
        <Button onClick={() => handleInput("3")}>3</Button>
        <Button variant="operator" onClick={handleEvaluate}>
          <IconEqual size={24} />
        </Button>

        <Button onClick={() => handleInput("0")}>0</Button>
        <Button onClick={() => handleInput("00")}>00</Button>
        <Button onClick={() => handleInput("000")}>000</Button>
        <Button 
          variant="confirm" 
          onClick={handleConfirm} 
          className="h-full"
          disabled={!canConfirm}
        >
          <IconCheck size={28} />
        </Button>
      </div>
    </div>
  );
}
