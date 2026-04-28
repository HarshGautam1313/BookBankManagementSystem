import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ full_name: "", email: "", password: "" });

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) return showToast("Please fill in all fields.", true);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", loginForm);
      // Build a user object from the backend's flat response
      const user = {
        role:      data.role,
        full_name: data.userName,
        email:     loginForm.email,
        user_id:   data.userId || null,
      };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(user.role === "admin" ? "/admin" : "/student");
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed.", true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    const { full_name, email, password } = signupForm;
    if (!full_name || !email || !password) return showToast("Please fill in all fields.", true);
    if (password.length < 8) return showToast("Password must be at least 8 characters.", true);
    setLoading(true);
    try {
      await api.post("/auth/signup", { ...signupForm, role });
      showToast("Account created! Please sign in.");
      setTab("login");
    } catch (err) {
      showToast(err.response?.data?.message || "Signup failed.", true);
    } finally {
      setLoading(false);
    }
  }

  const S = styles;

  return (
    <>
      <style>{S.css}</style>
      <div className="auth-root">

        {/* LEFT */}
        <div className="auth-left">
          <svg className="shelf-bg" viewBox="0 0 600 800" fill="none">
            {[120,280,440,600].map(y => <rect key={y} x="0" y={y} width="600" height="8" fill="#d4a853"/>)}
            {shelfBooks.map((b,i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill="#d4a853"/>)}
          </svg>

          <div className="brand">
            <div className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="3" height="12" rx="1" fill="#0d0a04"/>
                <rect x="6.5" y="3" width="3" height="14" rx="1" fill="#0d0a04"/>
                <rect x="11" y="5" width="3" height="11" rx="1" fill="#0d0a04"/>
                <rect x="15" y="4" width="3" height="12" rx="1" fill="#0d0a04"/>
              </svg>
            </div>
            <span className="brand-name">S-<span>BBMS</span></span>
          </div>

          <div className="hero-block">
            <p className="eyebrow">Smart Book Bank</p>
            <h1 className="hero-title">Your library,<br /><em>intelligently</em><br />managed.</h1>
            <p className="hero-desc">Track inventory, manage borrowings, and get AI-powered demand predictions — all in one unified platform.</p>
          </div>

          <div className="stats-row">
            {[["2.4k","Books tracked"],["98%","Return rate"],["ML","Demand AI"]].map(([n,l]) => (
              <div key={l}><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="form-card">
            <div className="tab-row">
              <button className={`tab-btn${tab==="login"?" active":""}`} onClick={() => setTab("login")}>Sign In</button>
              <button className={`tab-btn${tab==="signup"?" active":""}`} onClick={() => setTab("signup")}>Create Account</button>
            </div>

            {tab === "login" ? (
              <form onSubmit={handleLogin}>
                <h2 className="form-title">Welcome back</h2>
                <p className="form-sub">Sign in to your S-BBMS account</p>
                <Field label="Email address" icon="✉">
                  <input type="email" placeholder="you@university.edu" value={loginForm.email}
                    onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
                </Field>
                <Field label="Password" icon="🔒">
                  <input type="password" placeholder="••••••••" value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
                </Field>
                <button className="submit-btn" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In to Dashboard"}
                </button>
                <div className="switch-link">No account? <span onClick={() => setTab("signup")}>Create one free</span></div>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <h2 className="form-title">Join S-BBMS</h2>
                <p className="form-sub">Create your account to get started</p>
                <Field label="Full name" icon="👤">
                  <input type="text" placeholder="Enter your name...." value={signupForm.full_name}
                    onChange={e => setSignupForm({...signupForm, full_name: e.target.value})} />
                </Field>
                <Field label="Email address" icon="✉">
                  <input type="email" placeholder="you@university.edu" value={signupForm.email}
                    onChange={e => setSignupForm({...signupForm, email: e.target.value})} />
                </Field>
                <Field label="Password" icon="🔒">
                  <input type="password" placeholder="Min. 8 characters" value={signupForm.password}
                    onChange={e => setSignupForm({...signupForm, password: e.target.value})} />
                </Field>
                <div className="field">
                  <label className="field-label">I am a</label>
                  <div className="role-pills">
                    {[["student","🎓","Student"],["admin","🛡","Librarian / Admin"]].map(([r,icon,lbl]) => (
                      <button key={r} type="button" className={`role-pill${role===r?" selected":""}`} onClick={() => setRole(r)}>
                        <span className="pill-icon">{icon}</span>{lbl}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="submit-btn" type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </button>
                <div className="switch-link">Already have an account? <span onClick={() => setTab("login")}>Sign in</span></div>
              </form>
            )}
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.isError ? "error" : "success"}`}>{toast.msg}</div>}
    </>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className="input-wrap">
        <span className="input-icon">{icon}</span>
        {children}
      </div>
    </div>
  );
}

const shelfBooks = [
  {x:20,y:40,w:38,h:80},{x:64,y:60,w:28,h:60},{x:98,y:48,w:44,h:72},{x:148,y:55,w:32,h:65},
  {x:186,y:42,w:50,h:78},{x:242,y:58,w:36,h:62},{x:284,y:44,w:28,h:76},{x:318,y:52,w:46,h:68},
  {x:370,y:40,w:34,h:80},{x:410,y:62,w:42,h:58},{x:458,y:46,w:30,h:74},{x:494,y:55,w:48,h:65},
  {x:10,y:200,w:44,h:80},{x:60,y:215,w:30,h:65},{x:96,y:202,w:50,h:78},{x:152,y:210,w:36,h:70},
  {x:194,y:198,w:28,h:82},{x:228,y:208,w:46,h:72},{x:280,y:200,w:34,h:80},{x:320,y:212,w:42,h:68},
  {x:368,y:198,w:30,h:82},{x:404,y:205,w:52,h:75},{x:462,y:210,w:38,h:70},{x:506,y:200,w:44,h:80},
];

const styles = {
css: `
  .auth-root{min-height:100vh;display:flex;font-family:'DM Sans',sans-serif;background:#0d1117;color:#e2e8f0}
  .auth-left{width:52%;background:#0d1117;display:flex;flex-direction:column;justify-content:space-between;padding:3rem 3.5rem;position:relative;overflow:hidden}
  .shelf-bg{position:absolute;inset:0;opacity:.06;pointer-events:none}
  .brand{display:flex;align-items:center;gap:10px;z-index:1}
  .brand-icon{width:34px;height:34px;background:#d4a853;border-radius:7px;display:flex;align-items:center;justify-content:center}
  .brand-name{font-family:'DM Serif Display',serif;font-size:1.1rem;color:#f0e6d0}
  .brand-name span{color:#d4a853}
  .hero-block{z-index:1}
  .eyebrow{font-size:.72rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:#d4a853;margin-bottom:1rem}
  .hero-title{font-family:'DM Serif Display',serif;font-size:clamp(2.2rem,3.5vw,3rem);line-height:1.15;color:#f0e6d0;margin-bottom:1.2rem}
  .hero-title em{font-style:italic;color:#d4a853}
  .hero-desc{font-size:.92rem;color:#8a9ab5;line-height:1.7;max-width:380px}
  .stats-row{display:flex;gap:2rem;z-index:1}
  .stat-num{font-family:'DM Serif Display',serif;font-size:1.8rem;color:#f0e6d0;line-height:1}
  .stat-label{font-size:.72rem;color:#556070;margin-top:3px;letter-spacing:.05em;text-transform:uppercase}
  .auth-right{width:48%;background:#111820;display:flex;align-items:center;justify-content:center;padding:2rem;border-left:1px solid #1e2a38}
  .form-card{width:100%;max-width:400px}
  .tab-row{display:flex;background:#0d1117;border-radius:10px;padding:4px;margin-bottom:2rem;border:1px solid #1e2a38}
  .tab-btn{flex:1;padding:9px;border:none;background:transparent;color:#556070;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:500;border-radius:7px;cursor:pointer;transition:all .2s}
  .tab-btn.active{background:#1a2540;color:#d4a853;border:1px solid #2a3a5a}
  .form-title{font-family:'DM Serif Display',serif;font-size:1.6rem;color:#f0e6d0;margin-bottom:.3rem}
  .form-sub{font-size:.83rem;color:#556070;margin-bottom:1.8rem}
  .field{margin-bottom:1.1rem}
  .field-label{display:block;font-size:.78rem;font-weight:500;color:#8a9ab5;letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}
  .input-wrap{position:relative}
  .input-wrap input{width:100%;padding:11px 14px 11px 40px;background:#0d1117;border:1px solid #1e2a38;border-radius:9px;color:#e2e8f0;font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s}
  .input-wrap input:focus{border-color:#d4a853}
  .input-wrap input::placeholder{color:#2e3d52}
  .input-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#2e3d52;font-size:15px;pointer-events:none}
  .role-pills{display:flex;gap:10px}
  .role-pill{flex:1;padding:10px 8px;border:1px solid #1e2a38;border-radius:9px;background:#0d1117;color:#556070;font-family:'DM Sans',sans-serif;font-size:.85rem;cursor:pointer;text-align:center;transition:all .2s}
  .role-pill.selected{border-color:#d4a853;background:#1a1408;color:#d4a853}
  .pill-icon{display:block;font-size:18px;margin-bottom:4px}
  .submit-btn{width:100%;padding:13px;background:#d4a853;border:none;border-radius:9px;color:#0d0a04;font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:600;cursor:pointer;margin-top:1.4rem;transition:background .2s,transform .1s}
  .submit-btn:hover{background:#e0b86a}
  .submit-btn:active{transform:scale(.99)}
  .submit-btn:disabled{opacity:.6;cursor:not-allowed}
  .switch-link{text-align:center;font-size:.82rem;color:#556070;margin-top:1.2rem}
  .switch-link span{color:#d4a853;cursor:pointer;font-weight:500}
  .toast{position:fixed;bottom:1.5rem;right:1.5rem;padding:12px 18px;border-radius:10px;font-size:.85rem;z-index:999;max-width:280px;font-family:'DM Sans',sans-serif;border:1px solid}
  .toast.error{background:#1a0d0d;border-color:#a32d2d;color:#f09595}
  .toast.success{background:#1a2540;border-color:#2a3a5a;color:#d4a853}
  @media(max-width:720px){.auth-left{display:none}.auth-right{width:100%}}
`};