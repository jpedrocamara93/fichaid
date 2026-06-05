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
      position: "fixed", inset: 0, background: "rgba(0,0,0,.85)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", zIndex: 1000, paddin