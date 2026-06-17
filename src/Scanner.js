import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner(props) {
  var onResult = props.onResult;
  var onClose = props.onClose;
  var onError = props.onError;
  var started = useRef(false);

  useEffect(function() {
    if (started.current) return;
    started.current = true;
    var scanner = new Html5Qrcode("qr-reader");

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      function(decodedText) {
        started.current = false;
        scanner.stop().catch(function() {}).finally(function() {
          onResult(decodedText);
        });
      },
      function() {}
    ).catch(function(err) {
      started.current = false;
      if (onError) onError(err);
    });

    return function() {
      if (started.current) {
        started.current = false;
        scanner.stop().catch(function() {});
      }
    };
  }, [onResult, onError]);

  function handleClose() {
    if (started.current) {
      started.current = false;
      var el = document.getElementById("qr-reader");
      if (el) {
        try {
          var instance = new Html5Qrcode("qr-reader");
          instance.stop().catch(function() {}).finally(onClose);
        } catch(e) {
          onClose();
        }
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  }

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
        <button onClick={handleClose} style={{
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
