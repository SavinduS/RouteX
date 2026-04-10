import { useEffect, useRef } from "react";

export default function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  fullWidth = false,
  heightClass = "",
  className = "",
}) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (disabled) return;

    let cancelled = false;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
    const allowedOrigins = (import.meta.env.VITE_GOOGLE_ALLOWED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (!clientId) {
      onError?.("Google sign-in is not configured.");
      return;
    }

    if (
      allowedOrigins.length > 0 &&
      !allowedOrigins.includes(window.location.origin)
    ) {
      onError?.(
        `Google sign-in is disabled for this origin (${window.location.origin}).`
      );
      return;
    }

    function init() {
      if (!window.google || !btnRef.current || cancelled) return;

      try {
        btnRef.current.innerHTML = "";

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              onSuccess?.(response.credential);
            } else {
              onError?.("No Google credential received");
            }
          },
        });

        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: btnRef.current.offsetWidth || 400,
        });
      } catch (e) {
        onError?.("Failed to initialize Google sign-in");
      }
    }

    if (!document.getElementById("google-gsi")) {
      const script = document.createElement("script");
      script.id = "google-gsi";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = init;
      script.onerror = () => onError?.("Failed to load Google script");
      document.body.appendChild(script);
    } else {
      if (window.google?.accounts?.id) {
        init();
      } else {
        let tries = 0;
        const poll = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(poll);
            init();
          } else if (++tries > 20) {
            clearInterval(poll);
            onError?.("Google script failed to load in time");
          }
        }, 100);
      }
    }

    return () => {
      cancelled = true;
      if (btnRef.current) btnRef.current.innerHTML = "";
    };
  }, [onSuccess, onError, disabled, fullWidth]);

  return (
    <div className={`w-full ${heightClass} ${className}`}>
      <div ref={btnRef} className="w-full" />
    </div>
  );
}