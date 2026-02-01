import { useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState({ open: false, text: "", type: "success" });
  const timerRef = useRef(null);

  function show(text, type = "success", ms = 1800) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ open: true, text, type });
    timerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, open: false }));
    }, ms);
  }

  return { toast, show };
}
