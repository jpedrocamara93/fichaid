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
  { key: "endereco", label: "Endereço" },
  { key: "cidade", label: "Cidade" },
  { key: "estado", label: "Estado" },
];

const SEGMENTOS = ["hotel", "loja", "hospital", "clínica", "academia", "restaurante", "outro"];

// ─── SESSION ───────────────────────────────────────────────────────────────────
const Session = {
  get() { try { return JSON.parse(localStorage.getItem("fid_session")); } catch { return null; } },
  save(u) { localStorage.setItem("fid_session", JSON.stringify(u)); },
  clear() { localStorage.removeItem("fid_session"); },
};


// ─── REAL QR CODE GENERATOR ────────────────────────────────────────────────────
function RealQR({ data, size = 200 }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current || !data) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = () => {
      ref.current.innerHTML = "";
      new window.QRCode(ref.current, {
        text: data,
        width: size,
        height: size,
        colorDark: "#1a1714",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    };
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, [data, size]);
  return <div ref={ref} style={{ borderRadius: 6, overflow: "hidden", display: "inline-block" }} />;
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&family=Geist:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#f5f2ec;--surface:#fff;--surface2:#f0ede6;--border:#e0dbd0;
  --text:#1a1714;--text2:#6b6560;--text3:#a09890;
  --accent:#1a1714;--accent2:#c8401a;--green:#1a6b3a;
  --shadow:0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.04);
}
body{background:var(--bg);font-family:'Geist',sans-serif;color:var(--text);}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:var(--bg);}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
.input{width:100%;background:var(--surface);border:1.5px solid var(--border);
  color:var(--text);padding:10px 14px;font-family:'Geist',sans-serif;font-size:13px;
  border-radius:6px;outline:none;transition:border-color .15s;}
.input:focus{border-color:var(--accent);}
.input::placeholder{color:var(--text3);}
select.input{cursor:pointer;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:10px 20px;border-radius:6px;font-family:'Geist',sans-serif;
  font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;border:none;letter-spacing:.01em;}
.btn-dark{background:var(--accent);color:#fff;}
.btn-dark:hover{background:#2d2926;}
.btn-ghost{background:transparent;color:var(--text);border:1.5px solid var(--border);}
.btn-ghost:hover{border-color:var(--accent);background:var(--surface);}
.btn:disabled{opacity:.4;cursor:not-allowed;}
.btn-full{width:100%;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);}
.label{font-size:11px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;
  color:var(--text2);margin-bottom:5px;display:block;}
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500;}
.badge-green{background:#e8f5ee;color:var(--green);}
.badge-orange{background:#fef3e8;color:#b05a10;}
.badge-gray{background:var(--surface2);color:var(--text2);}
.toggle-row{display:flex;align-items:center;gap:10px;padding:9px 12px;
  border-radius:6px;border:1.5px solid var(--border);background:var(--surface);
  cursor:pointer;transition:all .15s;user-select:none;}
.toggle-row.on{border-color:#1a6b3a30;background:#f0f8f3;}
.toggle-row:hover{border-color:var(--accent);}
.pill{width:34px;height:18px;border-radius:9px;background:var(--border);
  position:relative;transition:background .2s;flex-shrink:0;}
.pill.on{background:var(--green);}
.pill::after{content:'';width:12px;height:12px;border-radius:50%;background:#fff;
  position:absolute;top:3px;left:3px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);}
.pill.on::after{left:19px;}
.tab-bar{display:flex;border-bottom:1px solid var(--border);background:var(--surface);}
.tab{flex:1;padding:12px 8px;background:transparent;border:none;
  font-family:'Geist',sans-serif;font-size:12px;font-weight:500;letter-spacing:.04em;
  text-transform:uppercase;color:var(--text2);cursor:pointer;transition:all .15s;
  border-bottom:2px solid transparent;margin-bottom:-1px;}
.tab.active{color:var(--accent);border-bottom-color:var(--accent);}
.tab:hover:not(.active){color:var(--text);}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:18px 20px;box-shadow:var(--shadow);}
.table{width:100%;border-collapse:collapse;}
.table th{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
  color:var(--text2);padding:10px 14px;text-align:left;border-bottom:1px solid var(--border);}
.table td{padding:12px 14px;font-size:13px;border-bottom:1px solid var(--surface2);vertical-align:middle;}
.table tr:hover td{background:var(--surface2);}
.table tr:last-child td{border-bottom:none;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.fade-up{animation:fadeUp .3s ease;}
.fade-in{animation:fadeIn .2s ease;}
.scan-zone{border:2px dashed var(--border);border-radius:12px;padding:48px 24px;
  text-align:center;cursor:pointer;transition:all .2s;background:var(--surface2);}
.scan-zone:hover{border-color:var(--accent);background:var(--surface);}
.scan-zone.active{border-color:var(--green);background:#f0f8f3;}
.sidebar{width:220px;background:var(--surface);border-right:1px solid var(--border);
  min-height:100vh;display:flex;flex-direction:column;}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 16px;
  font-size:13px;font-weight:500;color:var(--text2);cursor:pointer;
  transition:all .15s;border-radius:6px;margin:1px 8px;}
.nav-item:hover{background:var(--surface2);color:var(--text);}
.nav-item.active{background:var(--accent);color:#fff;}
@media(max-width:640px){
  .sidebar{display:none;}
  .table-scroll{overflow-x:auto;}
}
`;

// ─── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    user: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
    building: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22V12h6v10M8 7h1M8 11h1M15 7h1M15 11h1" /></>,
    qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M17 17v3h3M14 20h3" /></>,
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
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [tipo, setTipo] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    setLoading(true); setError("");
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", form.email)
      .eq("senha", form.senha)
      .single();
    if (error || !data) { setError("E-mail ou senha incorretos."); setLoading(false); return; }
    Session.save(data);
    onLogin(data);
  };

  const handleRegister = async () => {
    setLoading(true); setError("");
    if (!form.email || !form.senha) { setError("Preencha e-mail e senha."); setLoading(false); return; }
    if (form.senha.length < 6) { setError("Senha mínima de 6 caracteres."); setLoading(false); return; }
    const newUser = {
      id: `u${Date.now()}`, tipo, email: form.email, senha: form.senha,
      ...(tipo === "cliente"
        ? { nome: form.nome || "", sobrenome: form.sobrenome || "", cpf: "", rg: "", nascimento: "", telefone: "", cep: "", endereco: "", cidade: "", estado: "", compartilhar: { nome: true, sobrenome: true, cpf: true, rg: false, nascimento: true, telefone: true, email: true, cep: false, endereco: false, cidade: true, estado: true } }
        : { nome_empresa: form.nomeEmpresa || "", cnpj: form.cnpj || "", segmento: form.segmento || "outro", plano: "free" }),
    };
    const { data, error } = await supabase.from("users").insert([newUser]).select().single();
    if (error) { setError(error.message.includes("duplicate") ? "E-mail já cadastrado." : "Erro ao criar conta."); setLoading(false); return; }
    Session.save(data);
    onLogin(data);
  };

  if (mode === "login") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38, letterSpacing: "-.5px" }}>
            Ficha<span style={{ color: "var(--accent2)" }}>ID</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 8 }}>Identidade portátil para o mercado brasileiro</div>
        </div>
        <div className="card fade-up" style={{ padding: 28 }}>
          <div style={{ marginBottom: 16 }}>
            <label className="label">E-mail</label>
            <input className="input" type="email" placeholder="seu@email.com" value={form.email || ""} onChange={e => set("email", e.target.value)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Senha</label>
            <input className="input" type="password" placeholder="••••••••" value={form.senha || ""} onChange={e => set("senha", e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          {error && <div style={{ background: "#fef2f0", border: "1px solid #f8d5cd", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "var(--accent2)", marginBottom: 16 }}>{error}</div>}
          <button className="btn btn-dark btn-full" onClick={handleLogin} disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text2)" }}>
            Não tem conta?{" "}
            <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 500 }} onClick={() => setMode("choose")}>Cadastrar</span>
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
            { t: "cliente", icon: "user", title: "Sou Cliente", desc: "Pessoa física que quer gerenciar seus dados e compartilhá-los facilmente." },
            { t: "empresa", icon: "building", title: "Sou Empresa", desc: "Negócio que quer coletar e gerenciar cadastros de clientes." },
          ].map(({ t, icon, title, desc }) => (
            <div key={t} className="card fade-up" style={{ padding: 22, cursor: "pointer", border: tipo === t ? "2px solid var(--accent)" : undefined }}
              onClick={() => { setTipo(t); setMode("register"); }}>
              <div style={{ marginBottom: 10 }}><Icon name={icon} size={22} /></div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text2)" }}>
          Já tem conta?{" "}
          <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 500 }} onClick={() => { setMode("login"); setTipo(null); }}>Entrar</span>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="label">Nome</label><input className="input" value={form.nome || ""} onChange={e => set("nome", e.target.value)} /></div>
              <div><label className="label">Sobrenome</label><input className="input" value={form.sobrenome || ""} onChange={e => set("sobrenome", e.target.value)} /></div>
            </div>
          ) : (
            <>
              <div><label className="label">Nome da empresa</label><input className="input" value={form.nomeEmpresa || ""} onChange={e => set("nomeEmpresa", e.target.value)} /></div>
              <div><label className="label">CNPJ</label><input className="input" placeholder="00.000.000/0001-00" value={form.cnpj || ""} onChange={e => set("cnpj", e.target.value)} /></div>
              <div>
                <label className="label">Segmento</label>
                <select className="input" value={form.segmento || ""} onChange={e => set("segmento", e.target.value)}>
                  <option value="">Selecionar...</option>
                  {SEGMENTOS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </>
          )}
          <div><label className="label">E-mail</label><input className="input" type="email" value={form.email || ""} onChange={e => set("email", e.target.value)} /></div>
          <div><label className="label">Senha</label><input className="input" type="password" placeholder="mínimo 6 caracteres" value={form.senha || ""} onChange={e => set("senha", e.target.value)} /></div>
          {error && <div style={{ background: "#fef2f0", border: "1px solid #f8d5cd", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "var(--accent2)" }}>{error}</div>}
          <button className="btn btn-dark btn-full" onClick={handleRegister} disabled={loading}>{loading ? "Criando..." : "Criar conta"}</button>
          <button className="btn btn-ghost btn-full" onClick={() => setMode("choose")}>← Voltar</button>
        </div>
      </div>
    </div>
  );

  return null;
}

// ─── CLIENTE APP ───────────────────────────────────────────────────────────────
function ClienteApp({ user, onLogout, onUpdateUser }) {
  const [tab, setTab] = useState("perfil");
  const [perfil, setPerfil] = useState({ ...user });
  const [compartilhar, setCompartilhar] = useState(user.compartilhar || {});
  const [qrData, setQrData] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const camposShared = FIELDS.filter(f => compartilhar[f.key] && perfil[f.key]);

  const salvar = async () => {
    setSaving(true);
    const { error } = await supabase.from("users").update({ ...perfil, compartilhar }).eq("id", user.id);
    if (!error) {
      const updatedUser = { ...user, ...perfil, compartilhar };
      Session.save(updatedUser);
      onUpdateUser(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const gerarQR = () => {
    const dados = { _uid: user.id };
    FIELDS.forEach(f => { if (compartilhar[f.key] && perfil[f.key]) dados[f.key] = perfil[f.key]; });
    setQrData(JSON.stringify(dados));
    setTab("qr");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>Ficha<span style={{ color: "var(--accent2)" }}>ID</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>{user.nome || user.email}</div>
          <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={onLogout}>
            <Icon name="logout" size={14} /> Sair
          </button>
        </div>
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="tab-bar">
            {[["perfil", "Meu Perfil"], ["qr", "Meu QR"], ["privacidade", "Privacidade"]].map(([id, label]) => (
              <button key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
          <div style={{ padding: 24 }}>

            {tab === "perfil" && (
              <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label className="label">Nome *</label><input className="input" value={perfil.nome || ""} onChange={e => setPerfil(p => ({ ...p, nome: e.target.value }))} /></div>
                  <div><label className="label">Sobrenome *</label><input className="input" value={perfil.sobrenome || ""} onChange={e => setPerfil(p => ({ ...p, sobrenome: e.target.value }))} /></div>
                </div>
                {[
                  { key: "cpf", label: "CPF *", ph: "000.000.000-00" },
                  { key: "rg", label: "RG", ph: "00.000.000-0" },
                  { key: "nascimento", label: "Data de Nascimento", type: "date" },
                  { key: "telefone", label: "Telefone", ph: "(00) 00000-0000" },
                  { key: "email", label: "E-mail de contato", type: "email" },
                  { key: "cep", label: "CEP", ph: "00000-000" },
                  { key: "endereco", label: "Endereço" },
                ].map(({ key, label, ph, type }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input className="input" type={type || "text"} placeholder={ph || ""} value={perfil[key] || ""} onChange={e => setPerfil(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }}>
                  <div><label className="label">Cidade</label><input className="input" value={perfil.cidade || ""} onChange={e => setPerfil(p => ({ ...p, cidade: e.target.value }))} /></div>
                  <div><label className="label">Estado</label><input className="input" value={perfil.estado || ""} onChange={e => setPerfil(p => ({ ...p, estado: e.target.value }))} /></div>
                </div>
                <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                  <button className="btn btn-dark" style={{ flex: 1 }} onClick={salvar} disabled={saving}>
                    {saved ? <><Icon name="check" size={14} /> Salvo!</> : saving ? "Salvando..." : "Salvar dados"}
                  </button>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={gerarQR} disabled={!perfil.nome || !perfil.cpf}>Gerar QR →</button>
                </div>
              </div>
            )}

            {tab === "qr" && (
              <div className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                {!qrData ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
                    <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 16 }}>Salve seus dados para gerar o QR</div>
                    <button className="btn btn-dark" onClick={() => setTab("perfil")}>← Ir para Perfil</button>
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
                        {camposShared.map(f => <span key={f.key} className="badge badge-green">{f.label}</span>)}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-full" onClick={() => setTab("privacidade")}>Editar o que compartilhar</button>
                  </>
                )}
              </div>
            )}

            {tab === "privacidade" && (
              <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Controle de privacidade</div>
                  <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>Escolha quais dados aparecem no seu QR code.</div>
                </div>
                {FIELDS.map(f => (
                  <div key={f.key} className={`toggle-row ${compartilhar[f.key] ? "on" : ""}`} onClick={() => setCompartilhar(c => ({ ...c, [f.key]: !c[f.key] }))}>
                    <div className={`pill ${compartilhar[f.key] ? "on" : ""}`} />
                    <span style={{ flex: 1, fontSize: 13, color: compartilhar[f.key] ? "var(--text)" : "var(--text2)" }}>{f.label}</span>
                    {perfil[f.key] ? <span className="badge badge-green" style={{ fontSize: 10 }}>preenchido</span> : <span className="badge badge-gray" style={{ fontSize: 10 }}>vazio</span>}
                  </div>
                ))}
                <button className="btn btn-dark btn-full" style={{ marginTop: 8 }} onClick={() => { salvar(); gerarQR(); }}>
                  Salvar e atualizar QR →
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EMPRESA APP ───────────────────────────────────────────────────────────────
function EmpresaApp({ user, onLogout }) {
  const [nav, setNav] = useState("dashboard");
  const [records, setRecords] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [savedScan, setSavedScan] = useState(false);
  const [busca, setBusca] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("registros").select("*").eq("empresa_id", user.id)
      .order("criado_em", { ascending: false })
      .then(({ data }) => { setRecords(data || []); setLoading(false); });
  }, [user.id]);

  const handleScanResult = (raw) => {
    setShowScanner(false);
    try {
      const dados = JSON.parse(raw);
      setScanResult(dados);
      setNav("scanner");
    } catch {
      alert("QR code inválido.");
    }
  };

  const salvarRegistro = async () => {
    const novo = {
      id: `r${Date.now()}`,
      empresa_id: user.id,
      ...Object.fromEntries(Object.entries(scanResult).filter(([k]) => !k.startsWith("_"))),
      criado_em: new Date().toISOString(),
    };
    const { data } = await supabase.from("registros").insert([novo]).select().single();
    if (data) {
      setRecords(prev => [data, ...prev]);
      setSavedScan(true);
      setTimeout(() => { setSavedScan(false); setScanResult(null); setNav("clientes"); }, 1500);
    }
  };

  const filtrados = records.filter(r => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return ((r.nome || "") + " " + (r.sobrenome || "") + (r.email || "") + (r.cpf || "") + (r.telefone || "")).toLowerCase().includes(q);
  });

  const hoje = records.filter(r => new Date(r.criado_em).toDateString() === new Date().toDateString()).length;
  const semana = records.filter(r => Date.now() - new Date(r.criado_em) < 7 * 86400000).length;
  const cidades = [...new Set(records.map(r => r.cidade).filter(Boolean))].length;

  const NavItem = ({ id, icon, label }) => (
    <div className={`nav-item ${nav === id ? "active" : ""}`} onClick={() => setNav(id)}>
      <Icon name={icon} size={16} /> {label}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      {showScanner && <Scanner onResult={handleScanResult} onClose={() => setShowScanner(false)} />}

      <div className="sidebar">
        <div style={{ padding: "20px 16px 12px" }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>Ficha<span style={{ color: "var(--accent2)" }}>ID</span></div>
          <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>Empresa</div>
        </div>
        <div style={{ padding: "8px 0", flex: 1 }}>
          <NavItem id="dashboard" icon="chart" label="Dashboard" />
          <NavItem id="scanner" icon="scan" label="Scanner QR" />
          <NavItem id="clientes" icon="users" label="Clientes" />
          <NavItem id="config" icon="settings" label="Configurações" />
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{user.nome_empresa || user.email}</div>
          <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>{user.segmento}</div>
          <button className="btn btn-ghost" style={{ marginTop: 10, width: "100%", fontSize: 12, padding: "7px 12px" }} onClick={onLogout}>
            <Icon name="logout" size={13} /> Sair
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "28px", maxWidth: 900 }}>

          {nav === "dashboard" && (
            <div className="fade-up">
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, marginBottom: 4 }}>Olá, {user.nome_empresa || "Empresa"}</h1>
                <div style={{ fontSize: 14, color: "var(--text2)" }}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Total de clientes", value: records.length },
                  { label: "Hoje", value: hoje },
                  { label: "Essa semana", value: semana },
                  { label: "Cidades", value: cidades },
                ].map(({ label, value }) => (
                  <div key={label} className="stat-card">
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 8 }}>{label}</div>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, lineHeight: 1 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 14 }}>Últimos cadastros</div>
                {loading ? (
                  <div style={{ padding: 32, textAlign: "center", color: "var(--text2)" }}>Carregando...</div>
                ) : records.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: "var(--text2)", fontSize: 14 }}>Nenhum cadastro ainda. Use o Scanner para começar.</div>
                ) : (
                  <div className="table-scroll">
                    <table className="table">
                      <thead><tr><th>Nome</th><th>Cidade</th><th>Telefone</th><th>Data</th></tr></thead>
                      <tbody>
                        {records.slice(0, 5).map(r => (
                          <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedRecord(r); setNav("clientes"); }}>
                            <td><div style={{ fontWeight: 500 }}>{r.nome} {r.sobrenome}</div><div style={{ fontSize: 11, color: "var(--text2)" }}>{r.email}</div></td>
                            <td>{r.cidade || "—"}</td>
                            <td>{r.telefone || "—"}</td>
                            <td style={{ fontSize: 12, color: "var(--text2)" }}>{new Date(r.criado_em).toLocaleDateString("pt-BR")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <button className="btn btn-dark" onClick={() => setShowScanner(true)}><Icon name="camera" size={14} /> Escanear cliente</button>
            </div>
          )}

          {nav === "scanner" && (
            <div className="fade-up" style={{ maxWidth: 480 }}>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, marginBottom: 4 }}>Scanner QR</h1>
              <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 24 }}>Leia o QR code do cliente para cadastrá-lo automaticamente.</div>
              {!scanResult ? (
                <div>
                  <div className="scan-zone" onClick={() => setShowScanner(true)}>
                    <div style={{ marginBottom: 12, color: "var(--text2)" }}><Icon name="camera" size={36} /></div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Abrir câmera</div>
                    <div style={{ fontSize: 13, color: "var(--text2)" }}>Aponte para o QR code do cliente</div>
                  </div>
                  <div style={{ marginTop: 20, background: "var(--surface2)", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
                    <strong style={{ color: "var(--text)" }}>Como funciona:</strong> O cliente abre o FichaID no celular, exibe o QR, e a empresa escaneia. Os dados chegam preenchidos automaticamente — sem papel, sem erros.
                  </div>
                </div>
              ) : (
                <div className="fade-up">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "12px 16px", background: "#e8f5ee", borderRadius: 8, border: "1px solid #c0e0cc" }}>
                    <Icon name="check" size={16} />
                    <div><div style={{ fontWeight: 600, fontSize: 13 }}>QR lido com sucesso</div><div style={{ fontSize: 11, color: "var(--green)" }}>{Object.keys(scanResult).filter(k => !k.startsWith("_")).length} campos recebidos</div></div>
                  </div>
                  <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Dados do cliente</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {Object.entries(scanResult).filter(([k]) => !k.startsWith("_")).map(([key, val]) => (
                        <div key={key} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid var(--surface2)" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--text2)" }}>{FIELDS.find(f => f.key === key)?.label || key}</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {savedScan ? (
                    <div style={{ padding: "14px 20px", background: "#e8f5ee", borderRadius: 8, textAlign: "center", fontWeight: 600, color: "var(--green)" }}>✓ Salvo no CRM!</div>
                  ) : (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setScanResult(null)}>← Cancelar</button>
                      <button className="btn btn-dark" style={{ flex: 2 }} onClick={salvarRegistro}>Salvar no CRM →</button>
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
                <button className="btn btn-dark" onClick={() => setShowScanner(true)}><Icon name="camera" size={14} /> Escanear</button>
              </div>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }}><Icon name="search" size={14} /></div>
                <input className="input" style={{ paddingLeft: 36 }} placeholder="Buscar por nome, e-mail, CPF..." value={busca} onChange={e => setBusca(e.target.value)} />
              </div>
              {selectedRecord ? (
                <div className="fade-up">
                  <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setSelectedRecord(null)}>← Voltar</button>
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, marginBottom: 4 }}>{selectedRecord.nome} {selectedRecord.sobrenome}</div>
                    <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 20 }}>Cadastrado em {new Date(selectedRecord.criado_em).toLocaleString("pt-BR")}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      {FIELDS.filter(f => selectedRecord[f.key]).map(f => (
                        <div key={f.key} style={{ background: "var(--surface2)", borderRadius: 8, padding: "12px 14px" }}>
                          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 4 }}>{f.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedRecord[f.key]}</div>
                        </div>
                      ))}
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
                          {filtrados.map(r => (
                            <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setSelectedRecord(r)}>
                              <td><div style={{ fontWeight: 500 }}>{r.nome} {r.sobrenome}</div><div style={{ fontSize: 11, color: "var(--text2)" }}>{r.email}</div></td>
                              <td style={{ fontSize: 12, fontFamily: "monospace" }}>{r.cpf || "—"}</td>
                              <td style={{ fontSize: 12 }}>{r.telefone || "—"}</td>
                              <td style={{ fontSize: 12 }}>{r.cidade || "—"}</td>
                              <td style={{ fontSize: 11, color: "var(--text2)" }}>{new Date(r.criado_em).toLocaleDateString("pt-BR")}</td>
                              <td><Icon name="arrow" size={14} /></td>
                            </tr>
                          ))}
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
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, marginBottom: 24 }}>Configurações</h1>
              <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label className="label">Nome da empresa</label><input className="input" defaultValue={user.nome_empresa} /></div>
                <div><label className="label">CNPJ</label><input className="input" defaultValue={user.cnpj} /></div>
                <div>
                  <label className="label">Segmento</label>
                  <select className="input" defaultValue={user.segmento}>
                    {SEGMENTOS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div><label className="label">E-mail</label><input className="input" defaultValue={user.email} type="email" /></div>
                <div style={{ paddingTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Plano atual</div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>{user.plano === "pro" ? "Pro — ilimitado" : "Free — até 50 clientes"}</div>
                  </div>
                  <span className={`badge ${user.plano === "pro" ? "badge-green" : "badge-orange"}`}>{user.plano?.toUpperCase()}</span>
                </div>
                <button className="btn btn-dark btn-full">Salvar alterações</button>
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
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const session = Session.get();
    if (session) setUser(session);
    setBooting(false);
  }, []);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { Session.clear(); setUser(null); };
  const handleUpdateUser = (u) => { Session.save(u); setUser(u); };

  if (booting) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f2ec" }}>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}>Ficha<span style={{ color: "#c8401a" }}>ID</span></div>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      {!user
        ? <AuthScreen onLogin={handleLogin} />
        : user.tipo === "cliente"
          ? <ClienteApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
          : <EmpresaApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
      }
    </>
  );
}
