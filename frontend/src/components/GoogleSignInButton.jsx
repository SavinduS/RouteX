import { useEffect, useRef } from "react";

export default function GoogleSignInButton({ onSuccess, onError }) {
  const btnRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Load Google Identity script once
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
      init();
    }

    function init() {
      if (!window.google || !btnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          // response.credential = ID token
          onSuccess?.(response.credential);
        },
      });

      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
      });
    }
  }, [onSuccess, onError]);

  return <div ref={btnRef} />;
}