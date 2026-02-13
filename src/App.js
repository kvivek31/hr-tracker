import React, { useState, useRef, useCallback, useEffect } from "react";
// Local storage polyfill (replaces window.storage for local dev)
window.storage = {
  async get(key) {
    const val = localStorage.getItem(key);
    return val ? { value: val } : null;
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true };
  }
};
// =============================================
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL BELOW
// =============================================
const API_URL = "https://script.google.com/macros/s/AKfycbzYwaw9e0JKlI4HzANu4kcLBAvOkR0X1QcvsH3SuXJdZliQ9nWZoZViPkH6jgSTx71kbw/exec";
// DeployementID = "AKfycbzYwaw9e0JKlI4HzANu4kcLBAvOkR0X1QcvsH3SuXJdZliQ9nWZoZViPkH6jgSTx71kbw"
// Example: "https://script.google.com/macros/s/AKfycbx.../exec"

const STAGES = ["Initial Screening","First Machine Test","Second Machine Test","Final Discussion","Final Status"];
const STAGE_SHORT = ["Screening","Test 1","Test 2","Discussion","Final"];
const FINAL_STATUSES = ["Offer Released","On Hold","Rejected"];
const INT_MODES = ["Virtual","Face to Face"];
const DEF_POS = ["Frontend Developer","Backend Developer","Full Stack Developer","DevOps Engineer","QA Engineer","UI/UX Designer","Data Analyst","Project Manager","HR Executive","Mobile Developer"];
const SK = "hr-tracker-data";

const SC = {
  "Initial Screening":{bg:"#EEF2FF",br:"#6366F1",hd:"#4F46E5",bd:"#E0E7FF",ic:"🔍"},
  "First Machine Test":{bg:"#FFF7ED",br:"#F97316",hd:"#EA580C",bd:"#FFEDD5",ic:"⚡"},
  "Second Machine Test":{bg:"#F0FDF4",br:"#22C55E",hd:"#16A34A",bd:"#DCFCE7",ic:"🧪"},
  "Final Discussion":{bg:"#FDF4FF",br:"#A855F7",hd:"#9333EA",bd:"#F3E8FF",ic:"💬"},
  "Final Status":{bg:"#FEF2F2",br:"#EF4444",hd:"#DC2626",bd:"#FEE2E2",ic:"🏁"}
};
const FC = {
  "Offer Released":{bg:"#DCFCE7",tx:"#166534",br:"#22C55E",ic:"✅"},
  "On Hold":{bg:"#FEF9C3",tx:"#854D0E",br:"#EAB308",ic:"⏸️"},
  "Rejected":{bg:"#FEE2E2",tx:"#991B1B",br:"#EF4444",ic:"❌"}
};

const ef = () => ({name:"",email:"",phone:"",position:"",experience:"",location:"",noticePeriod:"",currentCTC:"",expectedCTC:"",finalOffer:"",dateOfJoining:"",stage:"Initial Screening",finalStatus:"",interviewDate:"",interviewTime:"",interviewMode:"Virtual"});

const api = {
  async get(action,params={}) {
    if(!API_URL) return null;
    const u = new URL(API_URL); u.searchParams.set("action",action);
    Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
    const r = await fetch(u.toString()); const d = await r.json();
    return d.success ? d.data : null;
  },
  async post(body) {
    if(!API_URL) return null;
    const r = await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify(body)});
    const d = await r.json(); return d.success ? d.data : null;
  }
};

const iS={width:"100%",padding:"12px 14px",border:"2px solid #E5E7EB",borderRadius:"12px",fontSize:"15px",outline:"none",boxSizing:"border-box",background:"#FAFAFA",WebkitAppearance:"none"};
const lS={display:"block",fontSize:"12px",fontWeight:700,color:"#6B7280",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.5px"};

const Inp=({l,v,onChange,type="text",ph="",req,step})=>(
  <div style={{marginBottom:"14px"}}>
    <label style={lS}>{l}{req&&<span style={{color:"#EF4444"}}> *</span>}</label>
    <input type={type} value={v} onChange={e=>onChange(e.target.value)} placeholder={ph} step={step} style={iS}
      onFocus={e=>e.target.style.borderColor="#6366F1"} onBlur={e=>e.target.style.borderColor="#E5E7EB"}/>
  </div>
);

const Sel=({l,v,onChange,opts,req})=>(
  <div style={{marginBottom:"14px"}}>
    <label style={lS}>{l}{req&&<span style={{color:"#EF4444"}}> *</span>}</label>
    <select value={v} onChange={e=>onChange(e.target.value)} style={{...iS,background:"#FAFAFA"}}>
      <option value="">Select...</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Sh=({show,onClose,title,children,full})=>{
  if(!show)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)"}} onClick={onClose}/>
      <div style={{position:"relative",background:"#fff",borderRadius:"24px 24px 0 0",maxHeight:full?"95vh":"85vh",display:"flex",flexDirection:"column",animation:"slideUp 0.3s ease",boxShadow:"0 -10px 40px rgba(0,0,0,0.15)"}}>
        <div style={{padding:"12px 20px 14px",borderBottom:"1px solid #F3F4F6",flexShrink:0}}>
          <div style={{width:40,height:4,background:"#D1D5DB",borderRadius:4,margin:"0 auto 12px"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <h2 style={{margin:0,fontSize:"18px",fontWeight:800,color:"#111827"}}>{title}</h2>
            <button onClick={onClose} style={{background:"#F3F4F6",border:"none",borderRadius:"50%",width:34,height:34,fontSize:"16px",color:"#6B7280",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
        </div>
        <div style={{overflowY:"auto",padding:"20px",flex:1,WebkitOverflowScrolling:"touch"}}>{children}</div>
      </div>
    </div>
  );
};

const Pip=({stage})=>(
  <div style={{display:"flex",gap:"3px",marginBottom:"6px"}}>
    {STAGES.map((s,i)=><div key={s} style={{flex:1,height:4,borderRadius:4,background:i<=STAGES.indexOf(stage)?SC[stage].br:"#E5E7EB"}}/>)}
  </div>
);

// =============================================
// AUTH: Credentials from environment variables
// =============================================
const AUTH_USERNAME = process.env.REACT_APP_USERNAME || "";
const AUTH_PASSWORD_HASH = process.env.REACT_APP_PASSWORD_HASH || "";
const AUTH_KEY = "hr-tracker-auth";

const sha256 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const hash = await sha256(password);
      if (username === AUTH_USERNAME && hash === AUTH_PASSWORD_HASH) {
        sessionStorage.setItem(AUTH_KEY, "true");
        onLogin();
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Authentication error");
    }
    setLoading(false);
  };

  return (
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 30%,#4F46E5 60%,#7C3AED 100%)",position:"relative",overflow:"hidden"}}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}input{font-family:inherit}`}</style>
      {/* Background decorations */}
      <div style={{position:"absolute",width:300,height:300,borderRadius:"50%",background:"rgba(124,58,237,0.15)",top:"-80px",right:"-60px",animation:"pulse 4s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:"rgba(99,102,241,0.1)",bottom:"-40px",left:"-40px",animation:"pulse 5s ease-in-out infinite 1s"}}/>
      <div style={{position:"absolute",width:150,height:150,borderRadius:"50%",background:"rgba(167,139,250,0.08)",top:"40%",left:"10%",animation:"pulse 6s ease-in-out infinite 2s"}}/>

      <div style={{animation:"fadeInUp 0.6s ease",width:"100%",maxWidth:380,padding:"0 24px",position:"relative",zIndex:1}}>
        {/* Logo & Title */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:72,height:72,borderRadius:24,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.1)"}}>👥</div>
          <h1 style={{margin:0,fontSize:28,fontWeight:800,color:"#fff",letterSpacing:"-0.5px"}}>HR Tracker</h1>
          <p style={{margin:"8px 0 0",fontSize:14,color:"rgba(255,255,255,0.6)",fontWeight:500}}>Sign in to manage candidates</p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleLogin} style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(24px)",borderRadius:24,padding:32,boxShadow:"0 20px 60px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.1)"}}>
          {/* Username */}
          <div style={{marginBottom:18}}>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.7)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>Username</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,opacity:0.5}}>👤</span>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username"
                style={{width:"100%",padding:"14px 14px 14px 42px",border:"2px solid rgba(255,255,255,0.1)",borderRadius:14,fontSize:15,outline:"none",boxSizing:"border-box",background:"rgba(255,255,255,0.06)",color:"#fff",transition:"border-color 0.2s"}}
                onFocus={e=>e.target.style.borderColor="rgba(167,139,250,0.6)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
            </div>
          </div>

          {/* Password */}
          <div style={{marginBottom:24}}>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.7)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>Password</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,opacity:0.5}}>🔒</span>
              <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password"
                style={{width:"100%",padding:"14px 48px 14px 42px",border:"2px solid rgba(255,255,255,0.1)",borderRadius:14,fontSize:15,outline:"none",boxSizing:"border-box",background:"rgba(255,255,255,0.06)",color:"#fff",transition:"border-color 0.2s"}}
                onFocus={e=>e.target.style.borderColor="rgba(167,139,250,0.6)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:16,cursor:"pointer",padding:4,opacity:0.5}}>{showPw?"🙈":"👁️"}</button>
            </div>
          </div>

          {/* Error */}
          {error&&<div style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,padding:"12px 16px",marginBottom:18,fontSize:13,color:"#FCA5A5",fontWeight:600,display:"flex",alignItems:"center",gap:8}}><span>⚠️</span>{error}</div>}

          {/* Submit */}
          <button type="submit" disabled={loading||!username||!password}
            style={{width:"100%",padding:"16px",border:"none",borderRadius:14,background:loading||!username||!password?"rgba(255,255,255,0.1)":"linear-gradient(135deg,#6366F1,#8B5CF6)",color:loading||!username||!password?"rgba(255,255,255,0.3)":"#fff",fontSize:16,fontWeight:700,cursor:loading||!username||!password?"not-allowed":"pointer",transition:"all 0.2s",boxShadow:loading||!username||!password?"none":"0 8px 24px rgba(99,102,241,0.4)",letterSpacing:"0.3px"}}>
            {loading?"⟳ Signing in...":"Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:24,fontWeight:500}}>🔐 Secured access · Session based</p>
      </div>
    </div>
  );
};

export default function App() {
  const [authed,setAuthed] = useState(()=>sessionStorage.getItem(AUTH_KEY)==="true");
  const logout = () => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); };

  const [cands,setCands] = useState([]);
  const [pos,setPos] = useState([...DEF_POS]);
  const [nid,setNid] = useState(1);
  const [loaded,setLoaded] = useState(false);
  const [sync,setSync] = useState(false);
  const [tab,setTab] = useState("board");
  const [aStage,setAStage] = useState(0);
  const [showAdd,setShowAdd] = useState(false);
  const [detail,setDetail] = useState(null);
  const [showPos,setShowPos] = useState(false);
  const [showMov,setShowMov] = useState(null);
  const [showData,setShowData] = useState(false);
  const [edit,setEdit] = useState(false);
  const [form,setForm] = useState(ef());
  const [sf,setSf] = useState({interviewDate:"",interviewTime:"",interviewMode:"Virtual"});
  const [pi,setPi] = useState("");
  const [fp,setFp] = useState("All");
  const [showFilt,setShowFilt] = useState(false);
  const [swS,setSwS] = useState(null);
  const [toast,setToast] = useState(null);
  const cr = useRef(null);

  const tt = (m,t="success") => { setToast({m,t}); setTimeout(()=>setToast(null),3000); };
  const sF = (k,v) => setForm(f=>({...f,[k]:v}));
  const filtered = cands.filter(c=>fp==="All"||c.position===fp);
  const byS = s => filtered.filter(c=>c.stage===s);
  const si = s => STAGES.indexOf(s);

  useEffect(()=>{
    (async()=>{
      if(API_URL){
        setSync(true);
        try{
          const [c,p]=await Promise.all([api.get("getAll"),api.get("getPositions")]);
          if(c)setCands(c); if(p)setPos(p);
          if(c?.length>0)setNid(Math.max(...c.map(x=>x.id))+1);
          tt("Synced with Google Sheets");
        }catch(e){
          tt("Sheets unavailable, using local","warn"); await loadLocal();
        }
        setSync(false);
      } else { await loadLocal(); }
      setLoaded(true);
    })();
  },[]);

  const loadLocal = async()=>{
    try{const r=await window.storage.get(SK);if(r?.value){const d=JSON.parse(r.value);setCands(d.candidates||[]);setPos(d.positions||[...DEF_POS]);setNid(d.nextId||1);}}catch(e){}
  };

  useEffect(()=>{
    if(!loaded)return;
    (async()=>{try{await window.storage.set(SK,JSON.stringify({candidates:cands,positions:pos,nextId:nid}));}catch(e){}})();
  },[cands,pos,nid,loaded]);

  const syncSheets = async()=>{
    if(!API_URL)return; setSync(true);
    try{const[c,p]=await Promise.all([api.get("getAll"),api.get("getPositions")]);if(c)setCands(c);if(p)setPos(p);if(c?.length>0)setNid(Math.max(...c.map(x=>x.id))+1);tt("Synced!");}
    catch(e){tt("Sync failed","error");}
    setSync(false);
  };

  const addCand = async()=>{
    if(!form.name||!form.position)return;
    const c={...form,id:nid,stageHistory:[{stage:form.stage,date:new Date().toISOString(),interviewDate:form.interviewDate,interviewTime:form.interviewTime,interviewMode:form.interviewMode}]};
    if(API_URL){setSync(true);try{const r=await api.post({action:"add",candidate:form});if(r?.id)c.id=r.id;tt("Saved to Sheets");}catch(e){tt("Saved locally","warn");}setSync(false);}
    setCands(p=>[...p,c]);setNid(n=>n+1);setForm(ef());setShowAdd(false);
  };

  const updCand = async()=>{
    if(!form.name||!form.position)return;
    if(API_URL){setSync(true);try{await api.post({action:"update",candidate:{...form,id:detail.id}});tt("Updated");}catch(e){tt("Updated locally","warn");}setSync(false);}
    setCands(p=>p.map(c=>c.id===detail.id?{...c,...form}:c));setDetail({...detail,...form});setEdit(false);
  };

  const moveCand = async(id,ns,fs="")=>{
    if(API_URL){setSync(true);try{await api.post({action:"move",id,stage:ns,finalStatus:fs,stageInfo:sf});tt("Moved");}catch(e){tt("Moved locally","warn");}setSync(false);}
    setCands(p=>p.map(c=>{
      if(c.id!==id)return c;
      const h=[...(c.stageHistory||[]),{stage:ns,date:new Date().toISOString(),...sf}];
      return{...c,stage:ns,finalStatus:fs||c.finalStatus,interviewDate:sf.interviewDate||c.interviewDate,interviewTime:sf.interviewTime||c.interviewTime,interviewMode:sf.interviewMode||c.interviewMode,stageHistory:h};
    }));
    setShowMov(null);setSf({interviewDate:"",interviewTime:"",interviewMode:"Virtual"});
  };

  const delCand = async(id)=>{
    if(API_URL){setSync(true);try{await api.post({action:"delete",id});tt("Deleted");}catch(e){}setSync(false);}
    setCands(p=>p.filter(c=>c.id!==id));setDetail(null);
  };

  const addPosFn = async()=>{const p=pi.trim();if(!p||pos.includes(p))return;if(API_URL){try{await api.post({action:"addPosition",position:p});}catch(e){}}setPos(ps=>[...ps,p]);setPi("");};
  const remPos = async(p)=>{if(API_URL){try{await api.post({action:"deletePosition",position:p});}catch(e){}}setPos(ps=>ps.filter(x=>x!==p));};

  const expJSON=()=>{const d=JSON.stringify({candidates:cands,positions:pos,nextId:nid,exportDate:new Date().toISOString()},null,2);const b=new Blob([d],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`hr-backup-${new Date().toISOString().split("T")[0]}.json`;a.click();URL.revokeObjectURL(u);setShowData(false);};
  const expCSV=()=>{const h=["ID","Name","Email","Phone","Position","Experience","Location","Notice Period","Current CTC","Expected CTC","Final Offer","DOJ","Stage","Final Status","Interview Date","Time","Mode"];const rows=cands.map(c=>[c.id,c.name,c.email,c.phone,c.position,c.experience,c.location,c.noticePeriod,c.currentCTC,c.expectedCTC,c.finalOffer,c.dateOfJoining,c.stage,c.finalStatus,c.interviewDate,c.interviewTime,c.interviewMode].map(v=>`"${(v||"").toString().replace(/"/g,'""')}"`).join(","));const csv=[h.join(","),...rows].join("\n");const b=new Blob([csv],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`hr-${new Date().toISOString().split("T")[0]}.csv`;a.click();URL.revokeObjectURL(u);setShowData(false);};
  const impJSON=()=>{const i=document.createElement("input");i.type="file";i.accept=".json";i.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);if(d.candidates)setCands(d.candidates);if(d.positions)setPos(d.positions);if(d.nextId)setNid(d.nextId);setShowData(false);tt("Imported!");}catch{alert("Invalid file");}};r.readAsText(f);};i.click();};
  const resetAll=async()=>{if(!window.confirm("Delete ALL data?"))return;setCands([]);setPos([...DEF_POS]);setNid(1);try{await window.storage.delete(SK);}catch(e){}setShowData(false);tt("Reset complete");};

  const hSwipe = useCallback(e=>{if(swS===null)return;const d=swS-e.changedTouches[0].clientX;if(Math.abs(d)>60){if(d>0&&aStage<4)setAStage(s=>s+1);if(d<0&&aStage>0)setAStage(s=>s-1);}setSwS(null);},[swS,aStage]);

  // If not authenticated, show login page (placed after all hooks)
  if(!authed) return <LoginPage onLogin={()=>setAuthed(true)}/>;

  const Card=({c})=>{
    const cl=SC[c.stage],fs=c.finalStatus?FC[c.finalStatus]:null;
    return(
      <div onClick={()=>{setDetail(c);setEdit(false);}} style={{background:"#fff",borderRadius:"16px",padding:"16px",marginBottom:"12px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",borderLeft:`4px solid ${cl.br}`,cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"10px"}}>
          <div style={{width:44,height:44,borderRadius:"14px",background:`linear-gradient(135deg,${cl.br},${cl.hd})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"18px",flexShrink:0}}>{c.name.charAt(0).toUpperCase()}</div>
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontWeight:700,fontSize:"16px",color:"#111827",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
            <div style={{fontSize:"13px",color:"#6B7280"}}>{c.position}</div>
          </div>
          <div style={{fontSize:"20px"}}>{cl.ic}</div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"8px"}}>
          {c.experience&&<span style={{fontSize:"11px",background:cl.bd,color:cl.hd,padding:"4px 10px",borderRadius:"20px",fontWeight:600}}>{c.experience} yrs</span>}
          {c.location&&<span style={{fontSize:"11px",background:"#F3F4F6",color:"#374151",padding:"4px 10px",borderRadius:"20px"}}>📍 {c.location}</span>}
          {c.interviewMode&&c.stage!=="Final Status"&&<span style={{fontSize:"11px",background:c.interviewMode==="Virtual"?"#DBEAFE":"#FEF3C7",color:c.interviewMode==="Virtual"?"#1E40AF":"#92400E",padding:"4px 10px",borderRadius:"20px"}}>{c.interviewMode==="Virtual"?"🖥️":"🏢"} {c.interviewMode}</span>}
        </div>
        {c.interviewDate&&c.stage!=="Final Status"&&<div style={{fontSize:"13px",color:"#6B7280",marginBottom:"6px"}}>📅 {c.interviewDate}{c.interviewTime?` at ${c.interviewTime}`:""}</div>}
        {c.stage==="Final Status"&&fs&&(
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"4px"}}>
            <span style={{fontSize:"12px",fontWeight:700,padding:"5px 12px",borderRadius:"20px",background:fs.bg,color:fs.tx,border:`1px solid ${fs.br}`}}>{fs.ic} {c.finalStatus}</span>
            {c.finalOffer&&<span style={{fontSize:"12px",color:"#059669",fontWeight:600}}>💰 ₹{c.finalOffer} LPA</span>}
          </div>
        )}
        <div style={{display:"flex",gap:"8px",marginTop:"12px"}}>
          {si(c.stage)>0&&<button onClick={e=>{e.stopPropagation();setShowMov({id:c.id,stage:STAGES[si(c.stage)-1]});setSf({interviewDate:"",interviewTime:"",interviewMode:"Virtual"});}} style={{flex:1,padding:"10px",border:"2px solid #E5E7EB",borderRadius:"12px",background:"#fff",fontSize:"13px",fontWeight:600,color:"#6B7280",cursor:"pointer"}}>← Back</button>}
          {si(c.stage)<4&&<button onClick={e=>{e.stopPropagation();setShowMov({id:c.id,stage:STAGES[si(c.stage)+1]});setSf({interviewDate:"",interviewTime:"",interviewMode:"Virtual"});}} style={{flex:1,padding:"10px",border:"none",borderRadius:"12px",background:`linear-gradient(135deg,${cl.br},${cl.hd})`,fontSize:"13px",fontWeight:600,color:"#fff",cursor:"pointer"}}>Next Stage →</button>}
        </div>
      </div>
    );
  };

  const cs=STAGES[aStage],cc=byS(cs),cl=SC[cs];

  return(
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",height:"100vh",display:"flex",flexDirection:"column",background:"#F3F4F6",maxWidth:"480px",margin:"0 auto",position:"relative",overflow:"hidden"}}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}*{-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{display:none}input,select{font-family:inherit}`}</style>

      {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:2000,padding:"12px 20px",borderRadius:"12px",fontSize:"14px",fontWeight:600,animation:"fadeIn 0.3s",boxShadow:"0 8px 24px rgba(0,0,0,0.15)",background:toast.t==="error"?"#FEE2E2":toast.t==="warn"?"#FEF3C7":"#DCFCE7",color:toast.t==="error"?"#DC2626":toast.t==="warn"?"#92400E":"#166534",maxWidth:"90%",textAlign:"center"}}>{toast.m}</div>}

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED)",padding:"12px 20px 0",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:"14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:38,height:38,borderRadius:"12px",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>👥</div>
            <div>
              <div style={{fontWeight:800,fontSize:"18px",color:"#fff"}}>HR Tracker</div>
              <div style={{fontSize:"11px",color:"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",gap:"6px"}}>
                {cands.length} candidate{cands.length!==1?"s":""}
                {sync&&<span>· ⟳ Syncing...</span>}
                {API_URL&&!sync&&<span style={{display:"inline-flex",alignItems:"center",gap:"3px"}}>· <span style={{width:6,height:6,borderRadius:"50%",background:"#4ADE80",display:"inline-block"}}/>Sheets</span>}
                {!API_URL&&<span>· 📱 Local</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>setShowFilt(!showFilt)} style={{background:fp!=="All"?"#fff":"rgba(255,255,255,0.2)",border:"none",borderRadius:"10px",width:38,height:38,fontSize:"16px",cursor:"pointer",color:fp!=="All"?"#4F46E5":"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>🔽</button>
            {API_URL&&<button onClick={syncSheets} disabled={sync} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"10px",width:38,height:38,fontSize:"16px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{sync?"⟳":"🔄"}</button>}
            <button onClick={()=>setShowData(true)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"10px",width:38,height:38,fontSize:"16px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>💾</button>
            <button onClick={()=>setShowPos(true)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"10px",width:38,height:38,fontSize:"16px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>⚙️</button>
            <button onClick={logout} title="Logout" style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"10px",width:38,height:38,fontSize:"16px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>🚪</button>
          </div>
        </div>
        {showFilt&&<div style={{paddingBottom:"12px"}}><select value={fp} onChange={e=>{setFp(e.target.value);setShowFilt(false);}} style={{width:"100%",padding:"10px 14px",borderRadius:"12px",border:"none",fontSize:"14px",background:"rgba(255,255,255,0.2)",color:"#fff",outline:"none"}}><option value="All" style={{color:"#111"}}>All Positions</option>{pos.map(p=><option key={p} value={p} style={{color:"#111"}}>{p}</option>)}</select></div>}
        {tab==="board"&&<div style={{display:"flex",overflow:"hidden",marginTop:"4px"}}>
          {STAGES.map((s,i)=>{const sc=SC[s],a=i===aStage,n=byS(s).length;return(
            <button key={s} onClick={()=>setAStage(i)} style={{flex:1,padding:"10px 4px 12px",border:"none",cursor:"pointer",background:a?"rgba(255,255,255,0.2)":"transparent",borderBottom:a?"3px solid #fff":"3px solid transparent",color:a?"#fff":"rgba(255,255,255,0.5)",fontSize:"11px",fontWeight:700,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
              <span style={{fontSize:"16px"}}>{sc.ic}</span><span>{STAGE_SHORT[i]}</span>
              <span style={{background:a?"#fff":"rgba(255,255,255,0.2)",color:a?"#4F46E5":"rgba(255,255,255,0.7)",fontSize:"10px",fontWeight:800,padding:"1px 7px",borderRadius:"10px",minWidth:"18px"}}>{n}</span>
            </button>);
          })}
        </div>}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #E5E7EB",flexShrink:0}}>
        {[{k:"board",l:"📋 Board"},{k:"list",l:"📊 List"},{k:"stats",l:"📈 Stats"}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,padding:"12px",border:"none",cursor:"pointer",background:tab===t.k?"#EEF2FF":"#fff",color:tab===t.k?"#4F46E5":"#9CA3AF",fontWeight:700,fontSize:"13px",borderBottom:tab===t.k?"2px solid #4F46E5":"2px solid transparent"}}>{t.l}</button>
        ))}
      </div>

      {/* Content */}
      <div ref={cr} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}
        onTouchStart={e=>tab==="board"&&setSwS(e.touches[0].clientX)}
        onTouchEnd={e=>tab==="board"&&hSwipe(e)}>

        {tab==="board"&&<div style={{padding:"16px"}}>
          <div style={{background:`linear-gradient(135deg,${cl.br}15,${cl.hd}08)`,borderRadius:"16px",padding:"14px 16px",marginBottom:"16px",border:`1px solid ${cl.br}30`}}>
            <div style={{fontSize:"14px",fontWeight:700,color:cl.hd,marginBottom:"4px"}}>{cl.ic} {cs}</div>
            <div style={{fontSize:"12px",color:"#6B7280"}}>{cc.length} candidate{cc.length!==1?"s":""} · Swipe ← → to navigate</div>
          </div>
          {cc.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:"#9CA3AF"}}><div style={{fontSize:"40px",marginBottom:"12px"}}>📭</div><div style={{fontSize:"15px",fontWeight:600}}>No candidates here</div></div>}
          {cc.map(c=><Card key={c.id} c={c}/>)}
        </div>}

        {tab==="list"&&<div style={{padding:"16px"}}>
          {filtered.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#9CA3AF"}}><div style={{fontSize:"40px",marginBottom:"12px"}}>📭</div><div style={{fontSize:"15px",fontWeight:600}}>No candidates</div></div>}
          {STAGES.map(s=>{const items=byS(s);if(!items.length)return null;const sc=SC[s];return(
            <div key={s} style={{marginBottom:"20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}><span style={{fontSize:"16px"}}>{sc.ic}</span><span style={{fontWeight:700,fontSize:"15px",color:sc.hd}}>{s}</span><span style={{fontSize:"12px",background:sc.bd,color:sc.hd,padding:"2px 8px",borderRadius:"10px",fontWeight:700}}>{items.length}</span></div>
              {items.map(c=>(
                <div key={c.id} onClick={()=>{setDetail(c);setEdit(false);}} style={{background:"#fff",borderRadius:"14px",padding:"14px",marginBottom:"8px",display:"flex",alignItems:"center",gap:"12px",boxShadow:"0 1px 6px rgba(0,0,0,0.05)",cursor:"pointer"}}>
                  <div style={{width:40,height:40,borderRadius:"12px",background:`linear-gradient(135deg,${sc.br},${sc.hd})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"16px",flexShrink:0}}>{c.name.charAt(0).toUpperCase()}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:"15px",color:"#111827"}}>{c.name}</div><div style={{fontSize:"12px",color:"#6B7280"}}>{c.position}{c.experience?` · ${c.experience} yrs`:""}</div></div>
                  {c.finalStatus&&<span style={{fontSize:"11px",padding:"4px 8px",borderRadius:"8px",background:FC[c.finalStatus]?.bg,color:FC[c.finalStatus]?.tx,fontWeight:600}}>{FC[c.finalStatus]?.ic}</span>}
                  <span style={{color:"#D1D5DB",fontSize:"18px"}}>›</span>
                </div>
              ))}
            </div>
          );})}
        </div>}

        {tab==="stats"&&<div style={{padding:"16px"}}>
          <div style={{background:"#fff",borderRadius:"16px",padding:"20px",marginBottom:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:"16px",fontWeight:800,color:"#111827",marginBottom:"16px"}}>Pipeline Overview</div>
            {STAGES.map(s=>{const sc=SC[s],n=byS(s).length,pct=cands.length?(n/cands.length)*100:0;return(
              <div key={s} style={{marginBottom:"14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"13px",fontWeight:600,color:"#374151"}}>{sc.ic} {s}</span><span style={{fontSize:"13px",fontWeight:700,color:sc.hd}}>{n}</span></div>
                <div style={{height:8,background:"#F3F4F6",borderRadius:8,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${sc.br},${sc.hd})`,borderRadius:8,transition:"width 0.5s"}}/></div>
              </div>
            );})}
          </div>
          <div style={{background:"#fff",borderRadius:"16px",padding:"20px",marginBottom:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:"16px",fontWeight:800,color:"#111827",marginBottom:"16px"}}>Final Outcomes</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px"}}>
              {FINAL_STATUSES.map(f=>{const fc=FC[f],n=cands.filter(c=>c.finalStatus===f).length;return(
                <div key={f} style={{textAlign:"center",padding:"16px 10px",borderRadius:"14px",background:fc.bg,border:`1px solid ${fc.br}30`}}>
                  <div style={{fontSize:"28px",fontWeight:800,color:fc.tx}}>{n}</div>
                  <div style={{fontSize:"11px",fontWeight:600,color:fc.tx,marginTop:"4px"}}>{fc.ic} {f}</div>
                </div>
              );})}
            </div>
          </div>
          <div style={{background:"#fff",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:"16px",fontWeight:800,color:"#111827",marginBottom:"16px"}}>By Position</div>
            {pos.filter(p=>cands.some(c=>c.position===p)).map(p=>{const n=cands.filter(c=>c.position===p).length;return(
              <div key={p} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #F3F4F6"}}><span style={{fontSize:"14px",color:"#374151"}}>{p}</span><span style={{fontSize:"14px",fontWeight:700,color:"#4F46E5",background:"#EEF2FF",padding:"3px 10px",borderRadius:"10px"}}>{n}</span></div>
            );})}
            {!pos.some(p=>cands.some(c=>c.position===p))&&<div style={{textAlign:"center",padding:"20px",color:"#9CA3AF",fontSize:"13px"}}>No data yet</div>}
          </div>
        </div>}
      </div>

      {/* FAB */}
      <button onClick={()=>{setForm(ef());setEdit(false);setShowAdd(true);}} style={{position:"absolute",bottom:24,right:20,width:60,height:60,borderRadius:"20px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"#fff",fontSize:"28px",boxShadow:"0 8px 24px rgba(79,70,229,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>+</button>

      {/* Add Sheet */}
      <Sh show={showAdd} onClose={()=>setShowAdd(false)} title="Add Candidate" full>
        <Inp l="Full Name" v={form.name} onChange={v=>sF("name",v)} ph="John Doe" req/>
        <Inp l="Email" v={form.email} onChange={v=>sF("email",v)} ph="john@email.com" type="email"/>
        <Inp l="Phone" v={form.phone} onChange={v=>sF("phone",v)} ph="+91 9876543210"/>
        <Sel l="Position" v={form.position} onChange={v=>sF("position",v)} opts={pos} req/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <Inp l="Experience (yrs)" v={form.experience} onChange={v=>sF("experience",v)} ph="5" type="number" step="0.01"/>
          <Inp l="Location" v={form.location} onChange={v=>sF("location",v)} ph="Bangalore"/>
          <Inp l="Notice Period" v={form.noticePeriod} onChange={v=>sF("noticePeriod",v)} ph="30 days"/>
          <Inp l="Current CTC (LPA)" v={form.currentCTC} onChange={v=>sF("currentCTC",v)} ph="12" type="number" step="0.01"/>
          <Inp l="Expected CTC (LPA)" v={form.expectedCTC} onChange={v=>sF("expectedCTC",v)} ph="18" type="number" step="0.01"/>
        </div>
        <Sel l="Starting Stage" v={form.stage} onChange={v=>sF("stage",v)} opts={STAGES}/>
        {form.stage!=="Final Status"&&<>
          <div style={{fontSize:"14px",fontWeight:700,color:"#374151",marginTop:"8px",marginBottom:"12px",paddingTop:"12px",borderTop:"1px solid #E5E7EB"}}>📅 Interview Details</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
            <Inp l="Date" v={form.interviewDate} onChange={v=>sF("interviewDate",v)} type="date"/>
            <Inp l="Time" v={form.interviewTime} onChange={v=>sF("interviewTime",v)} type="time"/>
          </div>
          <Sel l="Mode" v={form.interviewMode} onChange={v=>sF("interviewMode",v)} opts={INT_MODES}/>
        </>}
        {form.stage==="Final Status"&&<>
          <div style={{fontSize:"14px",fontWeight:700,color:"#374151",marginTop:"8px",marginBottom:"12px",paddingTop:"12px",borderTop:"1px solid #E5E7EB"}}>🏁 Final Details</div>
          <Sel l="Final Status" v={form.finalStatus} onChange={v=>sF("finalStatus",v)} opts={FINAL_STATUSES}/>
          {form.finalStatus==="Offer Released"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
            <Inp l="Final Offer (LPA)" v={form.finalOffer} onChange={v=>sF("finalOffer",v)} ph="16"/>
            <Inp l="Date of Joining" v={form.dateOfJoining} onChange={v=>sF("dateOfJoining",v)} type="date"/>
          </div>}
        </>}
        <button onClick={addCand} disabled={sync} style={{width:"100%",padding:"16px",border:"none",borderRadius:"14px",background:sync?"#9CA3AF":"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"#fff",fontSize:"16px",fontWeight:700,cursor:sync?"wait":"pointer",marginTop:"8px"}}>{sync?"⟳ Saving...":"Add Candidate"}</button>
      </Sh>

      {/* Move Sheet */}
      <Sh show={!!showMov} onClose={()=>setShowMov(null)} title={`Move to ${showMov?.stage}`}>
        {showMov?.stage==="Final Status"?
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <div style={{fontSize:"14px",color:"#6B7280",marginBottom:"4px"}}>Select final status:</div>
            {FINAL_STATUSES.map(f=>{const fc=FC[f];return(
              <button key={f} onClick={()=>moveCand(showMov.id,showMov.stage,f)} disabled={sync}
                style={{padding:"18px 20px",borderRadius:"14px",border:`2px solid ${fc.br}`,background:fc.bg,color:fc.tx,fontWeight:700,fontSize:"16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"10px",opacity:sync?0.6:1}}>
                <span style={{fontSize:"22px"}}>{fc.ic}</span>{f}
              </button>
            );})}
          </div>
        :<>
          <div style={{fontSize:"14px",color:"#6B7280",marginBottom:"12px"}}>Interview details for this stage:</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
            <Inp l="Date" v={sf.interviewDate} onChange={v=>setSf(f=>({...f,interviewDate:v}))} type="date"/>
            <Inp l="Time" v={sf.interviewTime} onChange={v=>setSf(f=>({...f,interviewTime:v}))} type="time"/>
          </div>
          <Sel l="Mode" v={sf.interviewMode} onChange={v=>setSf(f=>({...f,interviewMode:v}))} opts={INT_MODES}/>
          <button onClick={()=>moveCand(showMov.id,showMov.stage)} disabled={sync} style={{width:"100%",padding:"16px",border:"none",borderRadius:"14px",background:sync?"#9CA3AF":"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"#fff",fontSize:"16px",fontWeight:700,cursor:sync?"wait":"pointer"}}>{sync?"⟳ Moving...":"Confirm Move"}</button>
        </>}
      </Sh>

      {/* Detail Sheet */}
      <Sh show={!!detail} onClose={()=>{setDetail(null);setEdit(false);}} title={edit?"Edit Candidate":"Candidate Details"} full>
        {detail&&!edit&&(()=>{const c=detail,sc=SC[c.stage];return(<>
          <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"20px",padding:"16px",background:sc.bg,borderRadius:"16px",border:`1px solid ${sc.br}30`}}>
            <div style={{width:56,height:56,borderRadius:"18px",background:`linear-gradient(135deg,${sc.br},${sc.hd})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"24px"}}>{c.name.charAt(0).toUpperCase()}</div>
            <div><div style={{fontWeight:800,fontSize:"20px",color:"#111827"}}>{c.name}</div><div style={{fontSize:"14px",color:"#6B7280"}}>{c.position}</div></div>
          </div>
          <Pip stage={c.stage}/>
          <div style={{fontSize:"12px",color:"#9CA3AF",textAlign:"center",marginBottom:"20px"}}>Current: <strong style={{color:sc.hd}}>{c.stage}</strong>{c.finalStatus&&<> · <strong style={{color:FC[c.finalStatus]?.tx}}>{c.finalStatus}</strong></>}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"20px"}}>
            {[{l:"📧 Email",v:c.email},{l:"📱 Phone",v:c.phone},{l:"💼 Experience",v:c.experience?`${c.experience} yrs`:null},{l:"📍 Location",v:c.location},{l:"📋 Notice",v:c.noticePeriod?`${c.noticePeriod} days`:null},{l:"💰 Current CTC",v:c.currentCTC?`₹${c.currentCTC} LPA`:null},{l:"💸 Expected CTC",v:c.expectedCTC?`₹${c.expectedCTC} LPA`:null},{l:"🤝 Final Offer",v:c.finalOffer?`₹${c.finalOffer} LPA`:null},{l:"📅 Joining",v:c.dateOfJoining},{l:"🖥️ Mode",v:c.interviewMode}].filter(x=>x.v).map((x,i)=>(
              <div key={i} style={{padding:"12px",background:"#F9FAFB",borderRadius:"12px"}}><div style={{fontSize:"11px",color:"#9CA3AF",fontWeight:600,marginBottom:"4px"}}>{x.l}</div><div style={{fontSize:"14px",color:"#111827",fontWeight:600}}>{x.v}</div></div>
            ))}
          </div>
          {c.stageHistory?.length>0&&<div style={{marginBottom:"20px"}}>
            <div style={{fontSize:"15px",fontWeight:700,color:"#374151",marginBottom:"12px"}}>📜 Timeline</div>
            <div style={{paddingLeft:"20px",position:"relative"}}>
              <div style={{position:"absolute",left:7,top:8,bottom:8,width:2,background:"#E5E7EB"}}/>
              {c.stageHistory.map((h,i)=>{const hc=SC[h.stage];return(
                <div key={i} style={{position:"relative",marginBottom:"14px"}}>
                  <div style={{position:"absolute",left:-17,top:4,width:12,height:12,borderRadius:"50%",background:hc?.br||"#6B7280",border:"2px solid #fff"}}/>
                  <div style={{fontSize:"14px",fontWeight:600,color:"#374151"}}>{h.stage}</div>
                  <div style={{fontSize:"12px",color:"#9CA3AF"}}>{new Date(h.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}{h.interviewDate?` · 📅 ${h.interviewDate}`:""}{h.interviewTime?` ${h.interviewTime}`:""}{h.interviewMode?` · ${h.interviewMode}`:""}</div>
                </div>
              );})}
            </div>
          </div>}
          <div style={{display:"flex",gap:"10px"}}>
            <button onClick={()=>{setForm({...c});setEdit(true);}} style={{flex:1,padding:"14px",borderRadius:"14px",border:"2px solid #E5E7EB",background:"#fff",fontSize:"15px",fontWeight:700,color:"#374151",cursor:"pointer"}}>✏️ Edit</button>
            <button onClick={()=>delCand(c.id)} style={{flex:1,padding:"14px",borderRadius:"14px",border:"2px solid #FCA5A5",background:"#FEF2F2",fontSize:"15px",fontWeight:700,color:"#DC2626",cursor:"pointer"}}>🗑️ Delete</button>
          </div>
        </>);})()}
        {detail&&edit&&<>
          <Inp l="Full Name" v={form.name} onChange={v=>sF("name",v)} req/>
          <Inp l="Email" v={form.email} onChange={v=>sF("email",v)} type="email"/>
          <Inp l="Phone" v={form.phone} onChange={v=>sF("phone",v)}/>
          <Sel l="Position" v={form.position} onChange={v=>sF("position",v)} opts={pos} req/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
            <Inp l="Experience" v={form.experience} onChange={v=>sF("experience",v)} type="number" step="0.01"/>
            <Inp l="Location" v={form.location} onChange={v=>sF("location",v)}/>
            <Inp l="Notice Period" v={form.noticePeriod} onChange={v=>sF("noticePeriod",v)}/>
            <Inp l="Current CTC" v={form.currentCTC} onChange={v=>sF("currentCTC",v)} type="number" step="0.01"/>
            <Inp l="Expected CTC" v={form.expectedCTC} onChange={v=>sF("expectedCTC",v)} type="number" step="0.01"/>
            <Inp l="Final Offer" v={form.finalOffer} onChange={v=>sF("finalOffer",v)}/>
          </div>
          <Inp l="Date of Joining" v={form.dateOfJoining} onChange={v=>sF("dateOfJoining",v)} type="date"/>
          <div style={{display:"flex",gap:"10px",marginTop:"8px"}}>
            <button onClick={()=>setEdit(false)} style={{flex:1,padding:"14px",borderRadius:"14px",border:"2px solid #E5E7EB",background:"#fff",fontSize:"15px",fontWeight:700,color:"#6B7280",cursor:"pointer"}}>Cancel</button>
            <button onClick={updCand} disabled={sync} style={{flex:1,padding:"14px",borderRadius:"14px",border:"none",background:sync?"#9CA3AF":"linear-gradient(135deg,#4F46E5,#7C3AED)",fontSize:"15px",fontWeight:700,color:"#fff",cursor:"pointer"}}>{sync?"Saving...":"Save"}</button>
          </div>
        </>}
      </Sh>

      {/* Positions Sheet */}
      <Sh show={showPos} onClose={()=>setShowPos(false)} title="Manage Positions">
        <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
          <input value={pi} onChange={e=>setPi(e.target.value)} placeholder="New position..." onKeyDown={e=>e.key==="Enter"&&addPosFn()} style={{...iS,flex:1,marginBottom:0}}/>
          <button onClick={addPosFn} style={{padding:"12px 20px",border:"none",borderRadius:"12px",background:"#4F46E5",color:"#fff",fontWeight:700,fontSize:"14px",cursor:"pointer",flexShrink:0}}>Add</button>
        </div>
        {pos.map(p=>{const n=cands.filter(c=>c.position===p).length;return(
          <div key={p} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderRadius:"12px",marginBottom:"8px",background:"#F9FAFB",border:"1px solid #E5E7EB"}}>
            <div><div style={{fontSize:"14px",fontWeight:600,color:"#374151"}}>{p}</div><div style={{fontSize:"12px",color:"#9CA3AF"}}>{n} candidate{n!==1?"s":""}</div></div>
            <button onClick={()=>remPos(p)} style={{background:"#FEE2E2",border:"none",borderRadius:"10px",width:34,height:34,color:"#EF4444",fontSize:"16px",cursor:"pointer"}}>✕</button>
          </div>
        );})}
      </Sh>

      {/* Data Management Sheet */}
      <Sh show={showData} onClose={()=>setShowData(false)} title="Data Management">
        <div style={{marginBottom:"20px",padding:"16px",borderRadius:"14px",background:API_URL?"#F0FDF4":"#EEF2FF",border:`1px solid ${API_URL?"#BBF7D0":"#C7D2FE"}`}}>
          <div style={{fontSize:"14px",fontWeight:700,color:API_URL?"#166534":"#4338CA",marginBottom:"4px"}}>{API_URL?"✅ Google Sheets Connected":"📱 Local Storage Mode"}</div>
          <div style={{fontSize:"13px",color:API_URL?"#15803D":"#6366F1"}}>{API_URL?"Data syncs to your Google Sheet automatically.":"Data saved on this device. Connect Google Sheets for cloud backup."}</div>
        </div>

        {API_URL&&<button onClick={syncSheets} disabled={sync} style={{width:"100%",padding:"16px",borderRadius:"14px",border:"2px solid #E5E7EB",background:"#fff",fontSize:"15px",fontWeight:600,color:"#374151",cursor:"pointer",marginBottom:"10px",textAlign:"left",display:"flex",alignItems:"center",gap:"12px",opacity:sync?0.6:1}}>
          <span style={{fontSize:"22px"}}>🔄</span><div><div>Sync Now</div><div style={{fontSize:"12px",color:"#9CA3AF",fontWeight:400}}>Pull latest data from Google Sheets</div></div>
        </button>}

        <div style={{fontSize:"13px",fontWeight:700,color:"#6B7280",marginBottom:"10px",marginTop:"10px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Export</div>
        <button onClick={expJSON} style={{width:"100%",padding:"16px",borderRadius:"14px",border:"2px solid #E5E7EB",background:"#fff",fontSize:"15px",fontWeight:600,color:"#374151",cursor:"pointer",marginBottom:"10px",textAlign:"left",display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"22px"}}>📦</span><div><div>Export JSON</div><div style={{fontSize:"12px",color:"#9CA3AF",fontWeight:400}}>Full backup with history</div></div>
        </button>
        <button onClick={expCSV} style={{width:"100%",padding:"16px",borderRadius:"14px",border:"2px solid #E5E7EB",background:"#fff",fontSize:"15px",fontWeight:600,color:"#374151",cursor:"pointer",marginBottom:"20px",textAlign:"left",display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"22px"}}>📊</span><div><div>Export CSV</div><div style={{fontSize:"12px",color:"#9CA3AF",fontWeight:400}}>Open in Excel / Google Sheets</div></div>
        </button>

        <div style={{fontSize:"13px",fontWeight:700,color:"#6B7280",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Import</div>
        <button onClick={impJSON} style={{width:"100%",padding:"16px",borderRadius:"14px",border:"2px solid #E5E7EB",background:"#fff",fontSize:"15px",fontWeight:600,color:"#374151",cursor:"pointer",marginBottom:"20px",textAlign:"left",display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"22px"}}>📥</span><div><div>Import JSON</div><div style={{fontSize:"12px",color:"#9CA3AF",fontWeight:400}}>Restore from backup</div></div>
        </button>

        <div style={{fontSize:"13px",fontWeight:700,color:"#EF4444",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Danger</div>
        <button onClick={resetAll} style={{width:"100%",padding:"16px",borderRadius:"14px",border:"2px solid #FCA5A5",background:"#FEF2F2",fontSize:"15px",fontWeight:600,color:"#DC2626",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"22px"}}>🗑️</span><div><div>Reset All Data</div><div style={{fontSize:"12px",color:"#EF4444",fontWeight:400}}>Permanently delete everything</div></div>
        </button>
      </Sh>
    </div>
  );
}