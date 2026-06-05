import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner({ onResult, onClose }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const scanner = new Html5Qrcode("qr-reader");
    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      function(decodedText) {
        scanner.stop().catch(function() {}).finally(function() {
          onResult(decodedText);
        });
      },
      function() {}
    ).catch(function() {});
    return function() {
      scanner.stop().catch(function() {});
    };
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,.85)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 24
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
          <div id="qr-reader" style={{ width: "100%" }} />
        </div>
        <div style={{ textAlign: "center", color: "#fff", fontSize: 13, marginBottom: 16, opacity: 0.7 }}>
          Aponte a camera para o QR code do cliente
        </div>
        <button onClick={onClose} style={{
          width: "100%",
          padding: "12px",
          background: "transparent",
          border: "1.5px solid rgba(255,255,255,.3)",
          borderRadius: 8,
          color: "#fff",
          fontSize: 13,
          cursor: "pointer"
        }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}