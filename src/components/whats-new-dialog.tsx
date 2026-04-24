"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconCheck } from "@tabler/icons-react";
import type { UpdateFeature } from "@/constants/updates";

interface WhatsNewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  version: string;
  features: UpdateFeature[];
  minorFixes?: string[];
}

export function WhatsNewDialog({
  open,
  onClose,
  title,
  version,
  features,
  minorFixes = [],
}: WhatsNewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-sm sm:max-w-md p-0 overflow-hidden gap-0"
      >
        {/* Header Banner */}
        <div className="bg-linear-to-br from-[#4663f1] via-[#3552d8] to-[#1f37a7] px-6 pt-6 pb-5 text-white">
          <div className="flex items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 bg-white/20 px-2 py-0.5 rounded-md">
              {version}
            </span>
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white text-left leading-tight">
              {title}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Simple Feature List */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
          <div className="space-y-5">
            {features.map((feature, i) => (
              <div key={i} className="space-y-1 relative pl-5">
                <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[#4663f1]" />
                <p className="font-bold text-[15px] text-foreground leading-none">
                  {feature.title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Minor Fixes Section */}
          {minorFixes.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Perbaikan Lainnya
              </p>
              <ul className="space-y-1.5">
                {minorFixes.map((fix, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="shrink-0 text-[#4663f1]">•</span>
                    {fix}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 pt-0">
          <Button
            onClick={onClose}
            className="w-full bg-[#4663f1] hover:bg-[#3552d8] text-white gap-2 font-semibold h-11"
          >
            <IconCheck className="h-4 w-4" />
            Mantap!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
