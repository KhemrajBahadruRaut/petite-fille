"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[120] flex flex-col items-center gap-2 px-3">
      {toasts.map(function RenderToast({
        id,
        title,
        description,
        action,
        duration,
        ...props
      }) {
        void duration;
        return (
          <Toast key={id} {...props}>
            <div className="min-w-0 flex-1">
              {title ? <ToastTitle>{title}</ToastTitle> : null}
              {description ? <ToastDescription>{description}</ToastDescription> : null}
            </div>
            {action && <div className="shrink-0">{action}</div>}
            <ToastClose
              className="mt-0.5"
              onClick={() => props.onOpenChange?.(false)}
            />
          </Toast>
        );
      })}
    </div>
  );
}
