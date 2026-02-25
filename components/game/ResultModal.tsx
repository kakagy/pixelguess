"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResultModalProps {
  open: boolean;
  won: boolean;
  answer: string;
  shareText: string;
}

export function ResultModal({ open, won, answer, shareText }: ResultModalProps) {
  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="font-mono text-2xl">
            {won ? "Correct!" : "Game Over"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-lg font-mono">
            The answer was: <strong>{answer}</strong>
          </p>
          <pre className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
            {shareText}
          </pre>
          <Button onClick={handleShare} className="w-full font-mono">
            Share Result
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
