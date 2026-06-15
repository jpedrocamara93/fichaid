
import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import Scanner from "./Scanner";
 
// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const FIELDS = [
  { key: "nome", label: "Nome", required: true },
  { key: "sobrenome", label: "Sobrenome", required: true },
  { key: "cpf", label: "CPF", required: true, placeholder: "000.000.000-00" },
  { key: "rg", label: "RG", placeholder: "00.000.000-0" },
  { key: "nascimento", label: "Nascimento", type: "date" },
  { key: "telefone", label: "Telefone", placeholder: "(00) 00000-0000" },
  { key: "email", label: "E-mail", type: "email" },
  { key: "cep", label: "CEP", placeholder: "00000-000" },
  { key: "endereco", label: "Endereco" },
  { key: "cidade", label: "Cidade" },
  { key: "estado", label: "Estado" },
];
 
const SEGMENTOS = ["hotel", "loja", "hospital", "clinica", "academia", "restaurante", "outro"];
 
// ─── SESSION (somente auth - sem dados pessoais) ───────────────────────────────
const Session = {
  get() { try { return JSON.parse(localStorage.getItem("fid_session")); } catch { return null; } },
  save(u) { localStorage.setItem("fid_session", JSON.stringify(u)); },
  clear() { localStorage.removeItem("fid_session"); },
};
 
// ─── PERFIL LOCAL (dados pessoais ficam so no dispositivo do cliente) ──────────
const PerfilLocal = {
  get(userId) { try { return JSON.parse(localStorage.getItem("fid_perfil_" + userId)) || {}; } catch { return {}; } },
  save(userId, perfil) { localStorage.setItem("fid_perfil_" + userId, JSON.stringify(perfil)); },
  getCompartilhar(userId) {
    try { return JSON.parse(localStorage.getItem("fid_compartilhar_" + userId)); } catch { return null; }
  },
  saveCompartilhar(userId, c) { localStorage.setItem("fid_compartilhar_" + userId, JSON.stringify(c)); },
};
 
// ─── QR REAL ──────────────────────────────────────────────────────────────────
function RealQR({ data, size }) {
  var ref = useRef();
  useEffect(function() {
    if (!ref.current || !data) return;
    var script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = function() {
      if (!ref.current) return;
      ref.current.innerHTML = "";
      new window.QRCode(ref.current, {
        text: data,
        width: size || 200,
        height: size || 200,
        colorDark: "#1a1714",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    };
    document.head.appendChild(script);
    return function() {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [data, size]);
  return <div ref={ref} style={{ borderRadius: 6, overflow: "hidden", display: "inline-block" }} />;
}
 
// ─── STYLES ────────────────────────────────────────────────────────────────────
var CSS = "\n@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&family=Geist:wght@300;400;500;600&display=swap');\n*{box-sizing:border-box;margin:0;padding:0;}\n:root{\n  --bg:#f5f2ec;--surface:#fff;--surface2:#f0ede6;--border:#e0dbd0;\n  --text:#1a1714;--text2:#6b6560;--text3:#a09890;\n  --accent:#1a1714;--accent2:#c8401a;--green:#1a6b3a;\n  --shadow:0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.04);\n}\nbody{background:var(--bg);font-family:'Geist',sans-serif;color:var(--text);}\n::-webkit-scrollbar{width:4px;}\n::-webkit-scrollbar-track{background:var(--bg);}\n::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}\n.input{width:100%;background:var(--surface);border:1.5px solid var(--border);\n  color:var(--text);padding:10px 14px;font-family:'Geist',sans-serif;font-size:13px;\n  border-radius:6px;outline:none;transition:border-color .15s;}\n.input:focus{border-color:var(--accent);}\n.input::placeholder{color:var(--text3);}\nselect.input{cursor:pointer;}\n.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;\n  padding:10px 20px;border-radius:6px;font-family:'Geist',sans-serif;\n  font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;border:none;letter-spacing:.01em;}\n.btn-dark{background:var(--accent);color:#fff;}\n.btn-dark:hover{background:#2d2926;}\n.btn-ghost{background:transparent;color:var(--text);border:1.5px solid var(--border);}\n.btn-ghost:hover{border-color:var(--accent);background:var(--surface);}\n.btn:disabled{opacity:.4;cursor:not-allowed;}\n.btn-full{width:100%;}\n.card{background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);}\n.label{font-size:11px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;\n  color:var(--text2);margin-bottom:5px;display:block;}\n.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500;}\n.badge-green{background:#e8f5ee;color:var(--green);}\n.badge-orange{background:#fef3e8;color:#b05a10;}\n.badge-gray{background:var(--surface2);color:var(--text2);}\n.toggle-row{display:flex;align-items:center;gap:10px;padding:9px 12px;\n  border-radius:6px;border:1.5px solid var(--border);background:var(--surface);\n  cursor:pointer;transition:all .15s;user-select:none;}\n.toggle-row.on{border-color:#1a6b3a30;background:#f0f8f3;}\n.toggle-row:hover{border-color:var(--accent);}\n.pill{width:34px;height:18px;border-radius:9px;background:var(--border);\n  position:relative;transition:background .2s;flex-shrink:0;}\n.pill.on{background:var(--green);}\n.pill::after{content:'';width:12px;height:12px;border-radius:50%;background:#fff;\n  position:absolute;top:3px;left:3px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);}\n.pill.on::after{left:19px;}\n.tab-bar{display:flex;border-bottom:1px solid var(--border);background:var(--surface);}\n.tab{flex:1;padding:12px 8px;background:transparent;border:none;\n  font-family:'Geist',sans-serif;font-size:12px;font-weight:500;letter-spacing:.04em;\n  text-transform:uppercase;color:var(--text2);cursor:pointer;transition:all .15s;\n  border-bottom:2px solid transparent;margin-bottom:-1px;}\n.tab.active{color:var(--accent);border-bottom-color:var(--accent);}\n.tab:hover:not(.active){color:var(--text);}\n.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:18px 20px;box-shadow:var(--shadow);}\n.table{width:100%;border-collapse:collapse;}\n.table th{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;\n  color:var(--text2);padding:10px 14px;text-align:left;border-bottom:1px solid var(--border);}\n.table td{padding:12px 14px;font-size:13px;border-bottom:1px solid var(--surface2);vertical-align:middle;}\n.table tr:hover td{background:var(--surface2);}\n.table tr:last-child td{border-bottom:none;}\n@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}\n@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}\n.fade-up{animation:fadeUp .3s ease;}\n.fade-in{animation:fadeIn .2s ease;}\n.scan-zone{border:2px dashed var(--border);border-radius:12px;padding:48px 24px;\n  text-align:center;cursor:pointer;transition:all .2s;background:var(--surface2);}\n.scan-zone:hover{border-color:var(--accent);background:var(--surface);}\n.sidebar{width:220px;background:var(--surface);border-right:1px solid var(--border);\n  min-height:100vh;display:flex;flex-direction:column;}\n.nav-item{display:flex;align-items:center;gap:10px;padding:9px 16px;\n  font-size:13px;font-weight:500;color:var(--text2);cursor:pointer;\n  transition:all .15s;border-radius:6px;margin:1px 8px;}\n.nav-item:hover{background:var(--surface2);color:var(--text);}\n.nav-item.active{background:var(--accent);color:#fff;}\n@media(max-width:640px){\n  .sidebar{display:none;}\n  .table-scroll{overflow-x:auto;}\n}\n";
 
// ─── ICONS ─────────────────────────────────────────────────────────────────────
function Icon(props) {
  var name = props.name;
  var size = props.size || 16;
  var icons = {
    user: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
    building: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22V12h6v10M8 7h1M8 11h1M15 7h1M15 11h1" /></>,
    scan: <><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="3" y1="12" x2="21" y2="12" /></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}
 
// ─── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen(props) {
  var onLogin = props.onLogin;
  var [mode, setMode] = useState("login");
  var [tipo, setTipo] = useState(null);
  var [form, setForm] = useState({});
  var [error, setError] = useState("");
  var [loading, setLoading] = useState(false);
  function set(k, v) { setForm(function(f) { return Object.assign({}, f, { [k]: v }); }); }
 
  async function handleLogin() {
    setLoading(true); setError("");
    var result = await supabase.from("users").select("*").eq("email", form.email).eq("senha", form.senha).single();
    if (result.error || !result.data) { setError("E-mail ou senha incorretos."); setLoading(false); return; }
    Session.save(result.data);
    onLogin(result.data);
  }
 
  async function handleRegister() {
    setLoading(true); setError("");
    if (!form.email || !form.senha) { setError("Preencha e-mail e senha."); setLoading(false); return; }
    if (form.senha.length < 6) { setError("Senha minima de 6 caracteres."); setLoading(false); return; }
    if (!form.aceito) { setError("Voce precisa aceitar os termos para continuar."); setLoading(false); return; }
    var newUser = {
      id: "u" + Date.now(), tipo: tipo, email: form.email, senha: form.senha,
      nome_empresa: tipo === "empresa" ? (form.nomeEmpresa || "") : null,
      cnpj: tipo === "empresa" ? (form.cnpj || "") : null,
      segmento: tipo === "empresa" ? (form.segmento || "outro") : null,
      plano: tipo === "empresa" ? "free" : null,
    };
    var result = await supabase.from("users").insert([newUser]).select().single();
    if (result.error) { setError(result.error.message.includes("duplicate") ? "E-mail ja cadastrado." : "Erro ao criar conta."); setLoading(false); return; }
    Session.save(result.data);
    onLogin(result.data);
  }
 
  if (mode === "login") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38, letterSpacing: "-.5px" }}>Ficha<span style={{ color: "var(--accent2)" }}>ID</span></div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 8 }}>Identidade portátil para o mercado brasileiro</div>
        </div>
        <div className="card fade-up" style={{ padding: 28 }}>
          <div style={{ marginBottom: 16 }}><label className="label">E-mail</label><input className="input" type="email" placeholder="seu@email.com" value={form.email || ""} onChange={function(e) { set("email", e.target.value); }} /></div>
          <div style={{ marginBottom: 20 }}><label className="label">Senha</label><input className="input" type="password" placeholder="••••••••" value={form.senha || ""} onChange={function(e) { set("senha", e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") handleLogin(); }} /></div>
          {error && <div style={{ background: "#fef2f0", border: "1px solid #f8d5cd", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "var(--accent2)", marginBottom: 16 }}>{error}</div>}
          <button className="btn btn-dark btn-full" onClick={handleLogin} disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text2)" }}>
            Não tem conta?{" "}<span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 500 }} onClick={function() { setMode("choose"); }}>Cadastrar</span>
          </div>
        </div>
      </div>
    </div>
  );
 
  if (mode === "choose") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 8 }}>Criar conta</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>Qual é o seu perfil?</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { t: "cliente", icon: "user", title: "Sou Cliente", desc: "Pessoa fisica. Meus dados ficam so no meu celular." },
            { t: "empresa", icon: "building", title: "Sou Empresa", desc: "Negocio que quer coletar cadastros via QR code." },
          ].map(function(item) {
            return (
              <div key={item.t} className="card fade-up" style={{ padding: 22, cursor: "pointer", border: tipo === item.t ? "2px solid var(--accent)" : undefined }}
                onClick={function() { setTipo(item.t); setMode("register"); }}>
                <div style={{ marginBottom: 10 }}><Icon name={item.icon} size={22} /></div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text2)" }}>
          Já tem conta?{" "}<span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 500 }} onClick={function() { setMode("login"); setTipo(null); }}>Entrar</span>
        </div>
      </div>
    </div>
  );
 
  if (mode === "register") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30 }}>{tipo === "cliente" ? "Sua conta" : "Conta da empresa"}</div>
        </div>
        <div className="card fade-up" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          {tipo === "cliente" ? (
            <div style={{ background: "#e8f5ee", border: "1px solid #c0e0cc", borderRadius: 8, padding: "12px 14px", fontSize: 12, color: "var(--green)", lineHeight: 1.6 }}>
              <strong>Seus dados pessoais ficam so no seu celular.</strong> Nos armazenamos apenas seu e-mail e senha para autenticacao. Nada mais.
            </div>
          ) : (
            <>
              <div><label className="label">Nome da empresa</label><input className="input" value={form.nomeEmpresa || ""} onChange={function(e) { set("nomeEmpresa", e.target.value); }} /></div>
              <div><label className="label">CNPJ</label><input className="input" placeholder="00.000.000/0001-00" value={form.cnpj || ""} onChange={function(e) { set("cnpj", e.target.value); }} /></div>
              <div>
                <label className="label">Segmento</label>
                <select className="input" value={form.segmento || ""} onChange={function(e) { set("segmento", e.target.value); }}>
                  <option value="">Selecionar...</option>
                  {SEGMENTOS.map(function(s) { return <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>; })}
                </select>
              </div>
            </>
          )}
          <div><label className="label">E-mail</label><input className="input" type="email" value={form.email || ""} onChange={function(e) { set("email", e.target.value); }} /></div>
          <div><label className="label">Senha</label><input className="input" type="password" placeholder="minimo 6 caracteres" value={form.senha || ""} onChange={function(e) { set("senha", e.target.value); }} /></div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "var(--surface2)", borderRadius: 8 }}>
            <input type="checkbox" id="aceito" checked={form.aceito || false} onChange={function(e) { set("aceito", e.target.checked); }} style={{ marginTop: 2, cursor: "pointer" }} />
            <label htmlFor="aceito" style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5, cursor: "pointer" }}>
              Li e aceito os termos de uso e a politica de privacidade. Entendo que {tipo === "cliente" ? "meus dados pessoais ficam armazenados apenas no meu dispositivo." : "os dados dos clientes compartilhados via QR serao armazenados com meu consentimento."}
            </label>
          </div>
          {error && <div style={{ background: "#fef2f0", border: "1px solid #f8d5cd", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "var(--accent2)" }}>{error}</div>}
          <button className="btn btn-dark btn-full" onClick={handleRegister} disabled={loading}>{loading ? "Criando..." : "Criar conta"}</button>
          <button className="btn btn-ghost btn-full" onClick={function() { setMode("choose"); }}>Voltar</button>
        </div>
      </div>
    </div>
  );
 
  return null;
}
 
// ─── CLIENTE APP ───────────────────────────────────────────────────────────────
function ClienteApp(props) {
  var user = props.user;
  var onLogout = props.onLogout;
  var [tab, setTab] = useState("perfil");
  var [perfil, setPerfil] = useState(PerfilLocal.get(user.id));
  var [compartilhar, setCompartilhar] = useState(
    PerfilLocal.getCompartilhar(user.id) || { nome: true, sobrenome: true, cpf: true, rg: false, nascimento: true, telefone: true, email: true, cep: false, endereco: false, cidade: true, estado: true }
  );
  var [qrData, setQrData] = useState(null);
  var [saved, setSaved] = useState(false);
 
  var camposShared = FIELDS.filter(function(f) { return compartilhar[f.key] && perfil[f.key]; });
 
  function salvar() {
    PerfilLocal.save(user.id, perfil);
    PerfilLocal.saveCompartilhar(user.id, compartilhar);
    setSaved(true);
    setTimeout(function() { setSaved(false); }, 2000);
  }
 
  function gerarQR() {
    var dados = { _uid: user.id, _ts: Date.now() };
    FIELDS.forEach(function(f) { if (compartilhar[f.key] && perfil[f.key]) dados[f.key] = perfil[f.key]; });
    setQrData(JSON.stringify(dados));
    setTab("qr");
  }
 
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>Ficha<span style={{ color: "var(--accent2)" }}>ID</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--green)", background: "#e8f5ee", padding: "4px 10px", borderRadius: 20 }}>
            <Icon name="lock" size={12} /> Dados so no seu celular
          </div>
          <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={onLogout}><Icon name="logout" size={14} /> Sair</button>
        </div>
      </div>
 
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="tab-bar">
            {[["perfil", "Meu Perfil"], ["qr", "Meu QR"], ["privacidade", "Privacidade"]].map(function(item) {
              return <button key={item[0]} className={"tab" + (tab === item[0] ? " active" : "")} onClick={function() { setTab(item[0]); }}>{item[1]}</button>;
            })}
          </div>
          <div style={{ padding: 24 }}>
 
            {tab === "perfil" && (
              <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "#e8f5ee", border: "1px solid #c0e0cc", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--green)", lineHeight: 1.5 }}>
                  Seus dados ficam salvo apenas neste dispositivo. Nenhuma informacao pessoal e enviada para nossos servidores.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label className="label">Nome *</label><input className="input" value={perfil.nome || ""} onChange={function(e) { setPerfil(function(p) { return Object.assign({}, p, { nome: e.target.value }); }); }} /></div>
                  <div><label className="label">Sobrenome *</label><input className="input" value={perfil.sobrenome || ""} onChange={function(e) { setPerfil(function(p) { return Object.assign({}, p, { sobrenome: e.target.value }); }); }} /></div>
                </div>
                {[
                  { key: "cpf", label: "CPF *", ph: "000.000.000-00" },
                  { key: "rg", label: "RG", ph: "00.000.000-0" },
                  { key: "nascimento", label: "Data de Nascimento", type: "date" },
                  { key: "telefone", label: "Telefone", ph: "(00) 00000-0000" },
                  { key: "email", label: "E-mail de contato", type: "email" },
                  { key: "cep", label: "CEP", ph: "00000-000" },
                  { key: "endereco", label: "Endereco" },
                ].map(function(f) {
                  return (
                    <div key={f.key}>
                      <label className="label">{f.label}</label>
                      <input className="input" type={f.type || "text"} placeholder={f.ph || ""} value={perfil[f.key] || ""}
                        onChange={function(e) { var v = e.target.value; setPerfil(function(p) { return Object.assign({}, p, { [f.key]: v }); }); }} />
                    </div>
                  );
                })}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }}>
                  <div><label className="label">Cidade</label><input className="input" value={perfil.cidade || ""} onChange={function(e) { setPerfil(function(p) { return Object.assign({}, p, { cidade: e.target.value }); }); }} /></div>
                  <div><label className="label">Estado</label><input className="input" value={perfil.estado || ""} onChange={function(e) { setPerfil(function(p) { return Object.assign({}, p, { estado: e.target.value }); }); }} /></div>
                </div>
                <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                  <button className="btn btn-dark" style={{ flex: 1 }} onClick={salvar}>{saved ? <><Icon name="check" size={14} /> Salvo!</> : "Salvar no celular"}</button>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={gerarQR} disabled={!perfil.nome || !perfil.cpf}>Gerar QR</button>
                </div>
              </div>
            )}
 
            {tab === "qr" && (
              <div className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                {!qrData ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 16 }}>Salve seus dados para gerar o QR</div>
                    <button className="btn btn-dark" onClick={function() { setTab("perfil"); }}>Ir para Perfil</button>
                  </div>
                ) : (
                  <>
                    <div style={{ background: "#f8f8f6", border: "1px solid var(--border)", borderRadius: 12, padding: 24, textAlign: "center" }}>
                      <RealQR data={qrData} size={200} />
                      <div style={{ marginTop: 12, fontWeight: 600, fontSize: 15 }}>{perfil.nome} {perfil.sobrenome}</div>
                      <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>Apresente para a empresa escanear</div>
                    </div>
                    <div style={{ width: "100%", background: "var(--surface2)", borderRadius: 8, padding: "14px 16px" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 10 }}>
                        Compartilhando {camposShared.length} campos
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {camposShared.map(function(f) { return <span key={f.key} className="badge badge-green">{f.label}</span>; })}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-full" onClick={function() { setTab("privacidade"); }}>Editar o que compartilhar</button>
                  </>
                )}
              </div>
            )}
 
            {tab === "privacidade" && (
              <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Controle de privacidade</div>
                <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5, marginBottom: 8 }}>Escolha quais dados aparecem no seu QR code. A empresa so ve o que voce autorizar.</div>
                {FIELDS.map(function(f) {
                  return (
                    <div key={f.key} className={"toggle-row" + (compartilhar[f.key] ? " on" : "")} onClick={function() { setCompartilhar(function(c) { return Object.assign({}, c, { [f.key]: !c[f.key] }); }); }}>
                      <div className={"pill" + (compartilhar[f.key] ? " on" : "")} />
                      <span style={{ flex: 1, fontSize: 13, color: compartilhar[f.key] ? "var(--text)" : "var(--text2)" }}>{f.label}</span>
                      {perfil[f.key] ? <span className="badge badge-green" style={{ fontSize: 10 }}>preenchido</span> : <span className="badge badge-gray" style={{ fontSize: 10 }}>vazio</span>}
                    </div>
                  );
                })}
                <button className="btn btn-dark btn-full" style={{ marginTop: 8 }} onClick={function() { salvar(); gerarQR(); }}>Salvar e atualizar QR</button>
              </div>
            )}
 
          </div>
        </div>
      </div>
    </div>
  );
}
 
// ─── EMPRESA APP ───────────────────────────────────────────────────────────────
function EmpresaApp(props) {
  var user = props.user;
  var onLogout = props.onLogout;
  var [nav, setNav] = useState("dashboard");
  var [records, setRecords] = useState([]);
  var [showScanner, setShowScanner] = useState(false);
  var [scanResult, setScanResult] = useState(null);
  var [savedScan, setSavedScan] = useState(false);
  var [busca, setBusca] = useState("");
  var [selectedRecord, setSelectedRecord] = useState(null);
  var [loading, setLoading] = useState(true);
 
  useEffect(function() {
    supabase.from("registros").select("*").eq("empresa_id", user.id)
      .order("criado_em", { ascending: false })
      .then(function(result) { setRecords(result.data || []); setLoading(false); });
  }, [user.id]);
 
  function handleScanResult(raw) {
    setShowScanner(false);
    try {
      var dados = JSON.parse(raw);
      setScanResult(dados);
      setNav("scanner");
    } catch(e) {
      alert("QR code invalido.");
    }
  }
 
  async function salvarRegistro() {
    var novo = { id: "r" + Date.now(), empresa_id: user.id, criado_em: new Date().toISOString() };
    FIELDS.forEach(function(f) { if (scanResult[f.key]) novo[f.key] = scanResult[f.key]; });
    var result = await supabase.from("registros").insert([novo]).select().single();
    if (result.data) {
      setRecords(function(prev) { return [result.data].concat(prev); });
      setSavedScan(true);
      setTimeout(function() { setSavedScan(false); setScanResult(null); setNav("clientes"); }, 1500);
    }
  }
 
  var filtrados = records.filter(function(r) {
    if (!busca) return true;
    var q = busca.toLowerCase();
    return ((r.nome || "") + " " + (r.sobrenome || "") + (r.email || "") + (r.cpf || "") + (r.telefone || "")).toLowerCase().includes(q);
  });
 
  var hoje = records.filter(function(r) { return new Date(r.criado_em).toDateString() === new Date().toDateString(); }).length;
  var semana = records.filter(function(r) { return Date.now() - new Date(r.criado_em) < 7 * 86400000; }).length;
  var cidades = [...new Set(records.map(function(r) { return r.cidade; }).filter(Boolean))].length;
 
  function NavItem(p) {
    return (
      <div className={"nav-item" + (nav === p.id ? " active" : "")} onClick={function() { setNav(p.id); }}>
        <Icon name={p.icon} size={16} /> {p.label}
      </div>
    );
  }
 
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      {showScanner && <Scanner onResult={handleScanResult} onClose={function() { setShowScanner(false); }} />}
 
      <div className="sidebar">
        <div style={{ padding: "20px 16px 12px" }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>Ficha<span style={{ color: "var(--accent2)" }}>ID</span></div>
          <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>Empresa</div>
        </div>
        <div style={{ padding: "8px 0", flex: 1 }}>
          <NavItem id="dashboard" icon="chart" label="Dashboard" />
          <NavItem id="scanner" icon="scan" label="Scanner QR" />
          <NavItem id="clientes" icon="users" label="Clientes" />
          <NavItem id="config" icon="settings" label="Configuracoes" />
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{user.nome_empresa || user.email}</div>
          <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>{user.segmento}</div>
          <button className="btn btn-ghost" style={{ marginTop: 10, width: "100%", fontSize: 12, padding: "7px 12px" }} onClick={onLogout}><Icon name="logout" size={13} /> Sair</button>
        </div>
      </div>
 
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: 28, maxWidth: 900 }}>
 
          {nav === "dashboard" && (
            <div className="fade-up">
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, marginBottom: 4 }}>Ola, {user.nome_empresa || "Empresa"}</h1>
                <div style={{ fontSize: 14, color: "var(--text2)" }}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
                {[{ label: "Total de clientes", value: records.length }, { label: "Hoje", value: hoje }, { label: "Essa semana", value: semana }, { label: "Cidades", value: cidades }].map(function(s) {
                  return (
                    <div key={s.label} className="stat-card">
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 8 }}>{s.label}</div>
                      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, lineHeight: 1 }}>{s.value}</div>
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 14 }}>Ultimos cadastros</div>
                {loading ? (
                  <div style={{ padding: 32, textAlign: "center", color: "var(--text2)" }}>Carregando...</div>
                ) : records.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: "var(--text2)", fontSize: 14 }}>Nenhum cadastro ainda.</div>
                ) : (
                  <div className="table-scroll">
                    <table className="table">
                      <thead><tr><th>Nome</th><th>Cidade</th><th>Telefone</th><th>Data</th></tr></thead>
                      <tbody>
                        {records.slice(0, 5).map(function(r) {
                          return (
                            <tr key={r.id} style={{ cursor: "pointer" }} onClick={function() { setSelectedRecord(r); setNav("clientes"); }}>
                              <td><div style={{ fontWeight: 500 }}>{r.nome} {r.sobrenome}</div><div style={{ fontSize: 11, color: "var(--text2)" }}>{r.email}</div></td>
                              <td>{r.cidade || "—"}</td><td>{r.telefone || "—"}</td>
                              <td style={{ fontSize: 12, color: "var(--text2)" }}>{new Date(r.criado_em).toLocaleDateString("pt-BR")}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <button className="btn btn-dark" onClick={function() { setShowScanner(true); }}><Icon name="camera" size={14} /> Escanear cliente</button>
            </div>
          )}
 
          {nav === "scanner" && (
            <div className="fade-up" style={{ maxWidth: 480 }}>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, marginBottom: 4 }}>Scanner QR</h1>
              <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 24 }}>Leia o QR code do cliente para cadastra-lo automaticamente.</div>
              {!scanResult ? (
                <div>
                  <div className="scan-zone" onClick={function() { setShowScanner(true); }}>
                    <div style={{ marginBottom: 12, color: "var(--text2)" }}><Icon name="camera" size={36} /></div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Abrir camera</div>
                    <div style={{ fontSize: 13, color: "var(--text2)" }}>Aponte para o QR code do cliente</div>
                  </div>
                </div>
              ) : (
                <div className="fade-up">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "12px 16px", background: "#e8f5ee", borderRadius: 8, border: "1px solid #c0e0cc" }}>
                    <Icon name="check" size={16} />
                    <div><div style={{ fontWeight: 600, fontSize: 13 }}>QR lido com sucesso</div><div style={{ fontSize: 11, color: "var(--green)" }}>{Object.keys(scanResult).filter(function(k) { return !k.startsWith("_"); }).length} campos recebidos</div></div>
                  </div>
                  <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Dados do cliente</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {Object.entries(scanResult).filter(function(e) { return !e[0].startsWith("_"); }).map(function(entry) {
                        var field = FIELDS.find(function(f) { return f.key === entry[0]; });
                        return (
                          <div key={entry[0]} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid var(--surface2)" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--text2)" }}>{field ? field.label : entry[0]}</span>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{entry[1]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {savedScan ? (
                    <div style={{ padding: "14px 20px", background: "#e8f5ee", borderRadius: 8, textAlign: "center", fontWeight: 600, color: "var(--green)" }}>Salvo no CRM!</div>
                  ) : (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn btn-ghost" style={{ flex: 1 }} onClick={function() { setScanResult(null); }}>Cancelar</button>
                      <button className="btn btn-dark" style={{ flex: 2 }} onClick={salvarRegistro}>Salvar no CRM</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
 
          {nav === "clientes" && (
            <div className="fade-up">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28 }}>Clientes</h1>
                  <div style={{ fontSize: 13, color: "var(--text2)" }}>{records.length} cadastrados</div>
                </div>
                <button className="btn btn-dark" onClick={function() { setShowScanner(true); }}><Icon name="camera" size={14} /> Escanear</button>
              </div>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }}><Icon name="search" size={14} /></div>
                <input className="input" style={{ paddingLeft: 36 }} placeholder="Buscar por nome, e-mail, CPF..." value={busca} onChange={function(e) { setBusca(e.target.value); }} />
              </div>
              {selectedRecord ? (
                <div className="fade-up">
                  <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={function() { setSelectedRecord(null); }}>Voltar</button>
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, marginBottom: 4 }}>{selectedRecord.nome} {selectedRecord.sobrenome}</div>
                    <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 20 }}>Cadastrado em {new Date(selectedRecord.criado_em).toLocaleString("pt-BR")}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      {FIELDS.filter(function(f) { return selectedRecord[f.key]; }).map(function(f) {
                        return (
                          <div key={f.key} style={{ background: "var(--surface2)", borderRadius: 8, padding: "12px 14px" }}>
                            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 4 }}>{f.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedRecord[f.key]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  {loading ? (
                    <div style={{ padding: 32, textAlign: "center", color: "var(--text2)" }}>Carregando...</div>
                  ) : filtrados.length === 0 ? (
                    <div style={{ padding: 32, textAlign: "center", color: "var(--text2)" }}>{busca ? "Nenhum resultado." : "Nenhum cliente ainda."}</div>
                  ) : (
                    <div className="table-scroll">
                      <table className="table">
                        <thead><tr><th>Cliente</th><th>CPF</th><th>Telefone</th><th>Cidade</th><th>Data</th><th></th></tr></thead>
                        <tbody>
                          {filtrados.map(function(r) {
                            return (
                              <tr key={r.id} style={{ cursor: "pointer" }} onClick={function() { setSelectedRecord(r); }}>
                                <td><div style={{ fontWeight: 500 }}>{r.nome} {r.sobrenome}</div><div style={{ fontSize: 11, color: "var(--text2)" }}>{r.email}</div></td>
                                <td style={{ fontSize: 12, fontFamily: "monospace" }}>{r.cpf || "—"}</td>
                                <td style={{ fontSize: 12 }}>{r.telefone || "—"}</td>
                                <td style={{ fontSize: 12 }}>{r.cidade || "—"}</td>
                                <td style={{ fontSize: 11, color: "var(--text2)" }}>{new Date(r.criado_em).toLocaleDateString("pt-BR")}</td>
                                <td><Icon name="arrow" size={14} /></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
 
          {nav === "config" && (
            <div className="fade-up" style={{ maxWidth: 480 }}>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, marginBottom: 24 }}>Configuracoes</h1>
              <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label className="label">Nome da empresa</label><input className="input" defaultValue={user.nome_empresa} /></div>
                <div><label className="label">CNPJ</label><input className="input" defaultValue={user.cnpj} /></div>
                <div>
                  <label className="label">Segmento</label>
                  <select className="input" defaultValue={user.segmento}>
                    {SEGMENTOS.map(function(s) { return <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>; })}
                  </select>
                </div>
                <div><label className="label">E-mail</label><input className="input" defaultValue={user.email} type="email" /></div>
                <div style={{ paddingTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Plano atual</div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>{user.plano === "pro" ? "Pro — ilimitado" : "Free — ate 50 clientes"}</div>
                  </div>
                  <span className={"badge " + (user.plano === "pro" ? "badge-green" : "badge-orange")}>{user.plano ? user.plano.toUpperCase() : "FREE"}</span>
                </div>
                <button className="btn btn-dark btn-full">Salvar alteracoes</button>
              </div>
            </div>
          )}
 
        </div>
      </div>
    </div>
  );
}
 
// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  var [user, setUser] = useState(null);
  var [booting, setBooting] = useState(true);
 
  useEffect(function() {
    var session = Session.get();
    if (session) setUser(session);
    setBooting(false);
  }, []);
 
  function handleLogin(u) { setUser(u); }
  function handleLogout() { Session.clear(); setUser(null); }
 
  if (booting) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f2ec" }}>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}>Ficha<span style={{ color: "#c8401a" }}>ID</span></div>
    </div>
  );
 
  return (
    <>
      <style>{CSS}</style>
      {!user ? <AuthScreen onLogin={handleLogin} /> : user.tipo === "cliente" ? <ClienteApp user={user} onLogout={handleLogout} /> : <EmpresaApp user={user} onLogout={handleLogout} />}
    </>
  );
}
 