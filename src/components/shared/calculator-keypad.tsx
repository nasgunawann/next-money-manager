"use client";

import React, { useState, useEffect, useCallback } from "react";
import { IconBackspace, IconCheck, IconDivide, IconMinus, IconPlus, IconX, IconEqual } from "@tabler/icons-react";
import { cn, formatNumericInput } from "@/lib/utils";

interface CalculatorKeypadProps {
  initialValue?: string;
  currencySymbol?: string;
  onConfirm: (amount: number) => void;
  onCancel?: () => void;
}

interface KeypadButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  onLongPress?: () => void;
  variant?: "default" | "operator" | "action" | "confirm";
  className?: string;
  colSpan?: number;
  disabled?: boolean;
}

const KeypadButton = React.memo(({
  children,
  onClick,
  onLongPress,
  variant = "default",
  className,
  colSpan = 1,
  disabled = false,
}: KeypadButtonProps) => {
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isLongPressActive, setIsLongPressActive] = useState(false);

  const startTimer = () => {
    if (!onLongPress) return;
    setIsLongPressActive(false);
    timerRef.current = setTimeout(() => {
      setIsLongPressActive(true);
      onLongPress();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }
    }, 600);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const variants = {
    default: "bg-white hover:bg-zinc-50 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:active:bg-zinc-700 text-foreground",
    operator: "bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary font-medium",
    action: "bg-destructive/10 hover:bg-destructive/20 active:bg-destructive/30 text-destructive font-medium",
    confirm: "bg-primary hover:bg-primary/90 active:bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale",
  };

  return (
    <button
      onPointerDown={startTimer}
      onPointerUp={clearTimer}
      onPointerLeave={clearTimer}
      onClick={(e) => {
        e.preventDefault();
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
        "flex items-center justify-center rounded-2xl p-4 text-xl transition-all active:scale-95 duration-75 border border-white/20 dark:border-zinc-700/30",
        variants[variant],
        colSpan === 2 ? "col-span-2" : "col-span-1",
        className
      )}
    >
      {children}
    </button>
  );
});

KeypadButton.displayName = "KeypadButton";

export function CalculatorKeypad({
  initialValue = "",
  currencySymbol = "Rp",
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
      const mathExpr = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/,/g, "");

      if (!/^[0-9+\-*/.\s]+$/.test(mathExpr)) {
        return null;
      }

      const func = new Function(`return ${mathExpr}`);
      const evaluated = func();

      if (typeof evaluated === "number" && !isNaN(evaluated)) {
        if (!isFinite(evaluated)) return Infinity;
        return Math.round(evaluated);
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
    }
  }, [expression, evaluateExpression]);

  const handleInput = useCallback((char: string) => {
    setExpression((prev) => {
      if (prev.length >= 20) return prev;
      const isOperator = (c: string) => ["+", "-", "×", "÷"].includes(c);
      if (prev === "0" && isOperator(char) && char !== "-") return prev;
      if (prev === "0" && /[0-9]/.test(char)) {
        if (char === "0" || char === "00" || char === "000") return "0";
        return char;
      }
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
    if (val !== null) setExpression(val.toString());
  }, [expression, evaluateExpression, isError, isIncomplete]);

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    const finalValue = result !== null ? result : evaluateExpression(expression) || 0;
    onConfirm(Math.abs(Number(finalValue)));
  }, [canConfirm, result, expression, evaluateExpression, onConfirm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
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
        }
      }
      if (/[0-9]/.test(key)) { e.preventDefault(); handleInput(key); }
      else if (key === "+" || key === "-") { e.preventDefault(); handleInput(key); }
      else if (key === "*" || key.toLowerCase() === "x") { e.preventDefault(); handleInput("×"); }
      else if (key === "/") { e.preventDefault(); handleInput("÷"); }
      else if (key === "Backspace") { e.preventDefault(); handleDelete(); }
      else if (key === "Enter") { e.preventDefault(); handleConfirm(); }
      else if (key === "=") { e.preventDefault(); handleEvaluate(); }
      else if (key === "Escape") { e.preventDefault(); if (onCancel) onCancel(); }
      else if (key.toLowerCase() === "c") { e.preventDefault(); handleClear(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInput, handleDelete, handleConfirm, handleClear, handleEvaluate, onCancel, isAllSelected]);

  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-md mx-auto">
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
            isAllSelected ? "bg-primary/20 text-primary px-1 rounded" : "text-muted-foreground"
          )}>
            {expression.replace(/\d+/g, (match) => match.replace(/\B(?=(\d{3})+(?!\d))/g, "."))}
          </div>
          <div className="text-4xl font-bold tracking-tight mt-1 text-foreground">
            {isError ? (
              <span className="text-destructive">Error</span>
            ) : (
              <>
                {result !== null && result < 0 ? "-" : ""}{currencySymbol} {result !== null ? formatNumericInput(Math.abs(result).toString()) : "0"}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        <KeypadButton variant="action" onClick={handleClear}>C</KeypadButton>
        <KeypadButton variant="operator" onClick={() => handleInput("÷")}><IconDivide size={24} /></KeypadButton>
        <KeypadButton variant="operator" onClick={() => handleInput("×")}><IconX size={24} /></KeypadButton>
        <KeypadButton variant="operator" onClick={handleDelete} onLongPress={handleClear}><IconBackspace size={24} /></KeypadButton>

        <KeypadButton onClick={() => handleInput("7")}>7</KeypadButton>
        <KeypadButton onClick={() => handleInput("8")}>8</KeypadButton>
        <KeypadButton onClick={() => handleInput("9")}>9</KeypadButton>
        <KeypadButton variant="operator" onClick={() => handleInput("-")}><IconMinus size={24} /></KeypadButton>

        <KeypadButton onClick={() => handleInput("4")}>4</KeypadButton>
        <KeypadButton onClick={() => handleInput("5")}>5</KeypadButton>
        <KeypadButton onClick={() => handleInput("6")}>6</KeypadButton>
        <KeypadButton variant="operator" onClick={() => handleInput("+")}><IconPlus size={24} /></KeypadButton>

        <KeypadButton onClick={() => handleInput("1")}>1</KeypadButton>
        <KeypadButton onClick={() => handleInput("2")}>2</KeypadButton>
        <KeypadButton onClick={() => handleInput("3")}>3</KeypadButton>
        <KeypadButton variant="operator" onClick={handleEvaluate}><IconEqual size={24} /></KeypadButton>

        <KeypadButton onClick={() => handleInput("0")}>0</KeypadButton>
        <KeypadButton onClick={() => handleInput("00")}>00</KeypadButton>
        <KeypadButton onClick={() => handleInput("000")}>000</KeypadButton>
        <KeypadButton variant="confirm" onClick={handleConfirm} disabled={!canConfirm}><IconCheck size={28} /></KeypadButton>
      </div>
    </div>
  );
}
