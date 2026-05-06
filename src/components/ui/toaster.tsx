"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      expand
      closeButton
      position="top-right"
      toastOptions={{
        duration: 5000,
        className:
          "relative rounded-xl border border-border/70 bg-card pr-12 text-card-foreground shadow-xl",
        descriptionClassName: "text-muted-foreground",
        classNames: {
          success:
            "text-card-foreground [&_[data-icon]]:text-success-soft-foreground",
          error:
            "text-card-foreground [&_[data-icon]]:text-danger-soft-foreground",
          closeButton: "!left-auto !right-2 !top-1/2 !-translate-y-1/2",
        },
      }}
      {...props}
    />
  );
}
