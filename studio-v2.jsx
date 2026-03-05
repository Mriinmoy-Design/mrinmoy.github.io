import { useState, useEffect, useRef, useCallback } from "react";

const KEY_MAP = [
  { note:"C4",  key:"a", type:"white", freq:261.63 },
  { note:"D4",  key:"s", type:"white", freq:293.66 },
  { note:"E4",  key:"d", type:"white", freq:329.63 },
  { note:"F4",  key:"f", type:"white", freq:349.23 },
  { note:"G4",  key:"g", type:"white", freq:392.00 },
  { note:"A4",  key:"h", type:"white", freq:440.00 },
  { note:"B4",  key:"j", type:"white", freq:493.88 },
  { note:"C5",  key:"k", type:"white", freq:523.25 },
  { note:"D5",  key:"l", type:"white", freq:587.33 },
  { note:"E5",  key:";", type:"white", freq:659.25 },
  { note:"F5",  key:"'", type:"white", freq:698.46 },
  { note:"C#4", key:"w", type:"black", freq:277.18, after:"C4" },
  { note:"D#4", key:"e", type:"black", freq:311.13, after:"D4" },
  { note:"F#4", key:"t", type:"black", freq:369.99, after:"F4" },
  { note:"G#4", key:"y", type:"black", freq:415.30, after:"G4" },
  { note:"A#4", key:"u", type:"black", freq:466.16, after:"A4" },
  { note:"C#5", key:"o", type:"black", freq:554.37, after:"C5" },
  { note:"D#5", key:"p", type:"black", freq:622.25, after:"D5" },
];
const WHITE_KEYS = KEY_MAP.filter(k=>k.type==="white");
const BLACK_KEYS = KEY_MAP.filter(k=>k.type==="black");

const DRUM_MAP = [
  { name:"Kick",    key:"a", color:"#ef4444", icon:"🥁" },
  { name:"Snare",   key:"s", color:"#f97316", icon:"🪘" },
  { name:"Hi-Hat",  key:"d", color:"#eab308", icon:"🔔" },
  { name:"Open HH", key:"f", color:"#84cc16", icon:"🎶" },
  { name:"Crash",   key:"g", color:"#06b6d4", icon:"💥" },
  { name:"Tom Hi",  key:"h", color:"#8b5cf6", icon:"🥁" },
  { name:"Tom Lo",  key:"j", color:"#ec4899", icon:"🥁" },
  { name:"Clap",    key:"k", color:"#f59e0b", icon:"👏" },
  { name:"Rim",     key:"l", color:"#10b981", icon:"🎵" },
  { name:"Cowbell", key:";", color:"#6366f1", icon:"🔔" },
];

const STYLES = {
  piano:      {
    label:"Grand Piano", icon:"🎹",
    bg:"linear-gradient(160deg,#0a0a14 0%,#0d0d1a 100%)",
    accent:"#a78bfa", accent2:"#7c3aed",
    keyboardBg:"linear-gradient(180deg,#1e1a2e,#13101e)",
    whiteKey:"linear-gradient(180deg,#f0ece8,#e0dcd4 50%,#cec9be)",
    blackKey:"linear-gradient(180deg,#1e1825,#120f1a)",
    stickers:["🌙","⭐","🎵","✨","🦋","🌸","💜","🎶"],
    font:"Georgia, serif",
    waveform:"triangle", attack:0.01, release:0.7, detune:0,
    filterType:null,
  },
  electronic: {
    label:"Electronic", icon:"⚡",
    bg:"linear-gradient(160deg,#020c08 0%,#030f0a 100%)",
    accent:"#00ff88", accent2:"#00cc66",
    keyboardBg:"linear-gradient(180deg,#051a10,#03100a)",
    whiteKey:"linear-gradient(180deg,#e8f5e8,#d0e8d0 50%,#b8d4b8)",
    blackKey:"linear-gradient(180deg,#051a10,#020d07)",
    stickers:["⚡","💚","🔋","📡","🤖","🟢","⚙️","🌿"],
    font:"'Courier New', monospace",
    waveform:"sawtooth", attack:0.005, release:0.2, detune:8,
    filterType:"highpass",
  },
  pop:        {
    label:"Pop Star", icon:"🎤",
    bg:"linear-gradient(160deg,#1a0518 0%,#200620 100%)",
    accent:"#f472b6", accent2:"#db2777",
    keyboardBg:"linear-gradient(180deg,#2a0a22,#1a0516)",
    whiteKey:"linear-gradient(180deg,#fce8f8,#f0d0ea 50%,#e0b8d8)",
    blackKey:"linear-gradient(180deg,#3a0a2e,#200618)",
    stickers:["🎤","💖","⭐","🌟","💋","🦄","🩷","🎀"],
    font:"Georgia, serif",
    waveform:"sine", attack:0.02, release:0.5, detune:0,
    filterType:null,
  },
  lofi:       {
    label:"Lo-Fi Chill", icon:"☕",
    bg:"linear-gradient(160deg,#0f0a06 0%,#140d08 100%)",
    accent:"#d4a96a", accent2:"#a07840",
    keyboardBg:"linear-gradient(180deg,#2a1e10,#1a1008)",
    whiteKey:"linear-gradient(180deg,#f5ead0,#e8d8b0 50%,#d8c898)",
    blackKey:"linear-gradient(180deg,#2e1e08,#1a1004)",
    stickers:["☕","📻","🍂","🌿","📖","🎧","🍵","🌙"],
    font:"Georgia, serif",
    waveform:"triangle", attack:0.04, release:0.9, detune:-12,
    filterType:"lowpass",
  },
  drumkit:    {
    label:"Drum Kit", icon:"🥁",
    bg:"linear-gradient(160deg,#0a0505 0%,#100808 100%)",
    accent:"#ef4444", accent2:"#b91c1c",
    keyboardBg:null,
    stickers:["🥁","🔥","💥","🎸","🤘","⚡","💢","🎵"],
    font:"'Courier New', monospace",
    waveform:null,
  },
  synth:      {
    label:"Synth Wave", icon:"🌊",
    bg:"linear-gradient(160deg,#02060f 0%,#030810 100%)",
    accent:"#38bdf8", accent2:"#0284c7",
    keyboardBg:"linear-gradient(180deg,#041828,#021018)",
    whiteKey:"linear-gradient(180deg,#e0f4ff,#c8e8f8 50%,#b0d8ef)",
    blackKey:"linear-gradient(180deg,#042030,#021018)",
    stickers:["🌊","🔵","💎","❄️","🌌","🔷","🫧","⚡"],
    font:"'Courier New', monospace",
    waveform:"sawtooth", attack:0.08, release:0.5, detune:6,
    filterType:"bandpass",
  },
};

// ── Famous Song Tutorials ──────────────────────────────────────────────────────
const SONGS = {
  "Twinkle Twinkle": {
    bpm: 100,
    steps: [
      {key:"a",note:"C4",label:"Twin-"},{key:"a",note:"C4",label:"-kle"},
      {key:"g",note:"G4",label:"Twin-"},{key:"g",note:"G4",label:"-kle"},
      {key:"h",note:"A4",label:"lit-"},{key:"h",note:"A4",label:"-tle"},
      {key:"g",note:"G4",label:"star"},
      {key:"f",note:"F4",label:"How"},{key:"f",note:"F4",label:"I"},
      {key:"d",note:"E4",label:"won-"},{key:"d",note:"E4",label:"-der"},
      {key:"s",note:"D4",label:"what"},{key:"s",note:"D4",label:"you"},
      {key:"a",note:"C4",label:"are"},
    ]
  },
  "Happy Birthday": {
    bpm: 90,
    steps: [
      {key:"a",note:"C4",label:"Hap-"},{key:"a",note:"C4",label:"-py"},
      {key:"s",note:"D4",label:"birth-"},{key:"a",note:"C4",label:"-day"},
      {key:"f",note:"F4",label:"to"},{key:"d",note:"E4",label:"you"},
      {key:"a",note:"C4",label:"Hap-"},{key:"a",note:"C4",label:"-py"},
      {key:"s",note:"D4",label:"birth-"},{key:"a",note:"C4",label:"-day"},
      {key:"g",note:"G4",label:"to"},{key:"f",note:"F4",label:"you"},
    ]
  },
  "Ode to Joy": {
    bpm: 110,
    steps: [
      {key:"d",note:"E4",label:"Joy-"},{key:"d",note:"E4",label:"-ful"},
      {key:"f",note:"F4",label:"joy-"},{key:"g",note:"G4",label:"-ful"},
      {key:"g",note:"G4",label:"joy"},{key:"f",note:"F4",label:"joy"},
      {key:"d",note:"E4",label:"joy"},{key:"s",note:"D4",label:"joy"},
      {key:"a",note:"C4",label:"O-"},{key:"a",note:"C4",label:"-de"},
      {key:"s",note:"D4",label:"to"},{key:"s",note:"D4",label:"joy"},
      {key:"d",note:"E4",label:"joy"},{key:"a",note:"C4",label:"joy"},
    ]
  },
  "Fur Elise (Intro)": {
    bpm: 95,
    steps: [
      {key:"d",note:"E4",label:"E"},{key:"w",note:"C#4",label:"C#"},
      {key:"d",note:"E4",label:"E"},{key:"w",note:"C#4",label:"C#"},
      {key:"d",note:"E4",label:"E"},{key:"j",note:"B4",label:"B"},
      {key:"s",note:"D4",label:"D"},{key:"a",note:"C4",label:"C"},
      {key:"h",note:"A4",label:"A"},
    ]
  },
  "Pirates of Caribbean": {
    bpm: 120,
    steps: [
      {key:"h",note:"A4",label:"He's"},{key:"h",note:"A4",label:"a"},
      {key:"h",note:"A4",label:"pi-"},{key:"g",note:"G4",label:"-rate"},
      {key:"f",note:"F4",label:"bold"},{key:"d",note:"E4",label:"cap-"},
      {key:"f",note:"F4",label:"-tain"},{key:"h",note:"A4",label:"sail"},
      {key:"j",note:"B4",label:"on"},{key:"h",note:"A4",label:"the"},
      {key:"f",note:"F4",label:"sea"},
    ]
  },
  "Jingle Bells": {
    bpm: 130,
    steps: [
      {key:"d",note:"E4",label:"Jin-"},{key:"d",note:"E4",label:"-gle"},
      {key:"d",note:"E4",label:"bells"},{key:"d",note:"E4",label:"jin-"},
      {key:"d",note:"E4",label:"-gle"},{key:"d",note:"E4",label:"bells"},
      {key:"d",note:"E4",label:"jin-"},{key:"g",note:"G4",label:"-gle"},
      {key:"a",note:"C4",label:"all"},{key:"s",note:"D4",label:"the"},
      {key:"d",note:"E4",label:"way"},
    ]
  },
};

// ── Audio Engine ───────────────────────────────────────────────────────────────
function useAudio() {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const reverbRef = useRef(null);
  const activeRef = useRef({});

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const g = ctx.createGain(); g.gain.value = 0.7;
      g.connect(ctx.destination);
      masterRef.current = g;
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const getReverb = useCallback((ctx) => {
    if (!reverbRef.current) {
      const conv = ctx.createConvolver();
      const len = ctx.sampleRate * 2.5;
      const buf = ctx.createBuffer(2,len,ctx.sampleRate);
      for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.2);}
      conv.buffer=buf; conv.connect(masterRef.current);
      reverbRef.current=conv;
    }
    return reverbRef.current;
  },[]);

  const playNote = useCallback((keyObj, styleCfg, octave, useReverb, vol) => {
    const ctx = getCtx();
    if (activeRef.current[keyObj.key]) return;
    masterRef.current.gain.value = vol;
    const freq = keyObj.freq * Math.pow(2, octave);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = styleCfg.waveform || "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (styleCfg.detune) osc.detune.value = styleCfg.detune;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + (styleCfg.attack||0.01));
    osc.connect(gain);
    let endpoint = masterRef.current;
    if (styleCfg.filterType) {
      const f = ctx.createBiquadFilter();
      f.type = styleCfg.filterType;
      f.frequency.value = styleCfg.filterType==="lowpass"?2200:styleCfg.filterType==="highpass"?800:1500;
      gain.connect(f); f.connect(useReverb?getReverb(ctx):masterRef.current);
    } else {
      gain.connect(useReverb ? getReverb(ctx) : masterRef.current);
    }
    osc.start();
    activeRef.current[keyObj.key] = {osc,gain};
  },[getCtx,getReverb]);

  const stopNote = useCallback((keyObj, styleCfg) => {
    const n = activeRef.current[keyObj.key]; if(!n) return;
    const ctx = getCtx();
    const r = styleCfg.release || 0.4;
    n.gain.gain.setValueAtTime(n.gain.gain.value, ctx.currentTime);
    n.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+r);
    n.osc.stop(ctx.currentTime+r+0.05);
    delete activeRef.current[keyObj.key];
  },[getCtx]);

  const playDrum = useCallback((drum, vol) => {
    const ctx = getCtx(); masterRef.current.gain.value = vol;
    const t = ctx.currentTime;
    const g = ctx.createGain(); g.connect(masterRef.current);
    const noise=(sec)=>{const b=ctx.createBuffer(1,ctx.sampleRate*sec,ctx.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=ctx.createBufferSource();s.buffer=b;return s;};
    if(drum.name==="Kick"){const o=ctx.createOscillator();o.connect(g);o.frequency.setValueAtTime(55,t);o.frequency.exponentialRampToValueAtTime(0.001,t+0.5);g.gain.setValueAtTime(1,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.5);o.start(t);o.stop(t+0.5);}
    else if(drum.name==="Snare"){const s=noise(0.2);const f=ctx.createBiquadFilter();f.type="highpass";f.frequency.value=1000;s.connect(f);f.connect(g);g.gain.setValueAtTime(0.8,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.2);s.start(t);s.stop(t+0.2);}
    else if(drum.name==="Hi-Hat"){const s=noise(0.06);const f=ctx.createBiquadFilter();f.type="highpass";f.frequency.value=8000;s.connect(f);f.connect(g);g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.06);s.start(t);s.stop(t+0.06);}
    else if(drum.name==="Open HH"){const s=noise(0.3);const f=ctx.createBiquadFilter();f.type="highpass";f.frequency.value=6000;s.connect(f);f.connect(g);g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.3);s.start(t);s.stop(t+0.3);}
    else if(drum.name==="Crash"){const s=noise(1.5);const f=ctx.createBiquadFilter();f.type="bandpass";f.frequency.value=5000;f.Q.value=0.5;s.connect(f);f.connect(g);g.gain.setValueAtTime(0.7,t);g.gain.exponentialRampToValueAtTime(0.001,t+1.5);s.start(t);s.stop(t+1.5);}
    else if(drum.name==="Tom Hi"){const o=ctx.createOscillator();o.connect(g);o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(55,t+0.3);g.gain.setValueAtTime(0.8,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.3);o.start(t);o.stop(t+0.3);}
    else if(drum.name==="Tom Lo"){const o=ctx.createOscillator();o.connect(g);o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(30,t+0.4);g.gain.setValueAtTime(0.8,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.4);o.start(t);o.stop(t+0.4);}
    else if(drum.name==="Clap"){[0,0.01,0.02].forEach(d=>{const s=noise(0.1);const f=ctx.createBiquadFilter();f.type="bandpass";f.frequency.value=1200;s.connect(f);f.connect(g);s.start(t+d);s.stop(t+d+0.1);});g.gain.setValueAtTime(0.6,t);}
    else if(drum.name==="Rim"){const o=ctx.createOscillator();o.type="square";o.frequency.value=800;o.connect(g);g.gain.setValueAtTime(0.4,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.06);o.start(t);o.stop(t+0.06);}
    else if(drum.name==="Cowbell"){const o=ctx.createOscillator();o.type="square";o.frequency.value=562;o.connect(g);g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.4);o.start(t);o.stop(t+0.4);}
  },[getCtx]);

  const getDestination = useCallback(() => {
    const ctx = getCtx();
    const dest = ctx.createMediaStreamDestination();
    masterRef.current.connect(dest);
    return dest;
  },[getCtx]);

  return { playNote, stopNote, playDrum, ctxRef, getDestination };
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function Studio() {
  const [style, setStyle] = useState("piano");
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [octave, setOctave] = useState(0);
  const [useReverb, setUseReverb] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [bpm, setBpm] = useState(120);
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [recentNotes, setRecentNotes] = useState([]);
  const [tab, setTab] = useState("play"); // play | tutorial | settings
  const [selectedSong, setSelectedSong] = useState("Twinkle Twinkle");
  const [tutStep, setTutStep] = useState(-1);
  const [tutPlaying, setTutPlaying] = useState(false);
  const [showStickers, setShowStickers] = useState(true);
  const [stickerSlots, setStickerSlots] = useState({});
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const tutRef = useRef(null);
  const { playNote, stopNote, playDrum, getDestination } = useAudio();
  const cfg = STYLES[style];
  const isDrum = style === "drumkit";

  // Init sticker slots per style
  useEffect(() => {
    const slots = {};
    const stickers = cfg.stickers || [];
    WHITE_KEYS.forEach((k, i) => { slots[k.key] = stickers[i % stickers.length]; });
    setStickerSlots(slots);
  }, [style]);

  const startRec = () => {
    const dest = getDestination();
    const rec = new MediaRecorder(dest.stream);
    chunksRef.current = [];
    rec.ondataavailable = e => { if(e.data.size>0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, {type:"audio/webm"});
      const url = URL.createObjectURL(blob);
      setRecordings(prev=>[...prev,{id:Date.now(),url,time:new Date().toLocaleTimeString(),dur:0,label:`Take ${prev.length+1}`}]);
    };
    rec.start(); recorderRef.current = rec;
    setIsRecording(true); setRecTime(0);
    timerRef.current = setInterval(()=>setRecTime(t=>t+1),1000);
  };
  const stopRec = () => {
    recorderRef.current?.stop(); setIsRecording(false);
    clearInterval(timerRef.current);
  };
  const deleteRec = (id) => setRecordings(prev=>prev.filter(r=>r.id!==id));

  const triggerKey = useCallback((keyId, down) => {
    if (isDrum) {
      const drum = DRUM_MAP.find(d=>d.key===keyId); if(!drum) return;
      if (down) { playDrum(drum,volume); setActiveKeys(p=>new Set([...p,keyId])); setRecentNotes(p=>[drum.name,...p].slice(0,7)); }
      else { setTimeout(()=>setActiveKeys(p=>{const n=new Set(p);n.delete(keyId);return n;}),120); }
    } else {
      const k = KEY_MAP.find(k=>k.key===keyId); if(!k) return;
      if (down) { playNote(k,cfg,octave,useReverb,volume); setActiveKeys(p=>new Set([...p,keyId])); setRecentNotes(p=>[k.note,...p].slice(0,7)); }
      else { stopNote(k,cfg); setActiveKeys(p=>{const n=new Set(p);n.delete(keyId);return n;}); }
    }
  },[isDrum,playNote,stopNote,playDrum,cfg,octave,useReverb,volume]);

  useEffect(()=>{
    const validKeys = isDrum ? DRUM_MAP.map(d=>d.key) : KEY_MAP.map(k=>k.key);
    const dn=e=>{if(e.repeat||e.metaKey||e.ctrlKey)return;const k=e.key.toLowerCase();if(validKeys.includes(k)){e.preventDefault();triggerKey(k,true);}};
    const up=e=>{const k=e.key.toLowerCase();if(validKeys.includes(k))triggerKey(k,false);};
    window.addEventListener("keydown",dn); window.addEventListener("keyup",up);
    return()=>{window.removeEventListener("keydown",dn);window.removeEventListener("keyup",up);};
  },[triggerKey,isDrum]);

  // Tutorial autoplay
  const playTutorial = useCallback(() => {
    const song = SONGS[selectedSong]; if(!song) return;
    setTutPlaying(true); setTutStep(0);
    let i=0;
    const interval = (60000/bpm)*0.9;
    const tick = () => {
      if(i>=song.steps.length){setTutPlaying(false);setTutStep(-1);return;}
      setTutStep(i);
      const step = song.steps[i];
      const k = KEY_MAP.find(km=>km.key===step.key);
      if(k){ playNote(k,cfg,octave,false,volume); setTimeout(()=>stopNote(k,cfg),interval*0.7); }
      setActiveKeys(new Set([step.key]));
      setTimeout(()=>setActiveKeys(new Set()),interval*0.7);
      i++;
      tutRef.current = setTimeout(tick, interval);
    };
    tick();
  },[selectedSong,bpm,cfg,octave,volume,playNote,stopNote]);

  const stopTutorial = () => {
    clearTimeout(tutRef.current); setTutPlaying(false); setTutStep(-1); setActiveKeys(new Set());
  };

  const fmtTime = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const song = SONGS[selectedSong];
  const beatMs = 60000/bpm;

  return (
    <div style={{
      minHeight:"100vh", background:cfg.bg, color:"#f0ece4",
      fontFamily:cfg.font, display:"flex", flexDirection:"column",
      alignItems:"center", padding:"16px 12px 48px",
      position:"relative", overflowX:"hidden",
    }}>
      {/* Ambient glow */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
        background:`radial-gradient(ellipse 80% 60% at 50% 85%, ${cfg.accent}18 0%, transparent 70%)`,
        transition:"background 0.8s"}}/>

      {/* ── HEADER ── */}
      <div style={{width:"100%",maxWidth:860,zIndex:1,marginBottom:14,display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:9,letterSpacing:5,color:cfg.accent+"66",textTransform:"uppercase",marginBottom:4,fontFamily:"monospace"}}>Studio</div>
          <div style={{fontSize:24,letterSpacing:2,fontWeight:"normal",
            background:`linear-gradient(90deg,${cfg.accent},${cfg.accent2},#fff6)`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {cfg.icon} {cfg.label}
          </div>
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center",height:24,minWidth:180}}>
          {recentNotes.map((n,i)=>(
            <span key={i} style={{fontSize:10,color:cfg.accent,opacity:Math.max(0.1,1-i*0.14),fontFamily:"monospace",transition:"all 0.3s"}}>{n}</span>
          ))}
        </div>
      </div>

      {/* ── STYLE SELECTOR ── */}
      <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap",justifyContent:"center",zIndex:1}}>
        {Object.entries(STYLES).map(([k,v])=>(
          <button key={k} onClick={()=>{setStyle(k);setActiveKeys(new Set());setTutPlaying(false);setTutStep(-1);}}
            style={{
              background:style===k?`${v.accent}25`:"rgba(255,255,255,0.03)",
              border:`1px solid ${style===k?v.accent:"rgba(255,255,255,0.07)"}`,
              color:style===k?v.accent:"#444",
              padding:"6px 13px",borderRadius:7,cursor:"pointer",
              fontFamily:"monospace",fontSize:11,letterSpacing:0.5,
              transition:"all 0.2s",
              boxShadow:style===k?`0 0 16px ${v.accent}33`:"none",
            }}>{v.icon} {v.label}</button>
        ))}
      </div>

      {/* ── TAB BAR ── */}
      <div style={{display:"flex",gap:0,marginBottom:16,border:`1px solid rgba(255,255,255,0.07)`,borderRadius:9,overflow:"hidden",zIndex:1}}>
        {[["play","🎹 Play"],["tutorial","🎵 Tutorial"],["settings","⚙️ Settings"],["recordings","⏺ Recordings"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            background:tab===t?`${cfg.accent}22`:"transparent",
            border:"none",color:tab===t?cfg.accent:"#444",
            padding:"7px 16px",cursor:"pointer",fontFamily:"monospace",fontSize:11,
            borderRight:"1px solid rgba(255,255,255,0.06)",
            transition:"all 0.2s",letterSpacing:0.5,
          }}>{l}</button>
        ))}
      </div>

      {/* ═══ PLAY TAB ════════════════════════════════════════════════════════ */}
      {tab==="play" && (
        <div style={{width:"100%",maxWidth:860,zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
          {/* Controls */}
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
            {!isDrum && (
              <>
                <div style={{display:"flex",border:`1px solid rgba(255,255,255,0.08)`,borderRadius:7,overflow:"hidden"}}>
                  {[-1,0,1].map(o=>(
                    <button key={o} onClick={()=>setOctave(o)} style={{
                      background:octave===o?`${cfg.accent}22`:"transparent",
                      border:"none",color:octave===o?cfg.accent:"#444",
                      padding:"6px 12px",cursor:"pointer",fontFamily:"monospace",fontSize:11,
                      borderRight:o<1?"1px solid rgba(255,255,255,0.07)":"none",
                    }}>{o===0?"OCT":o>0?"+1":"-1"}</button>
                  ))}
                </div>
                <button onClick={()=>setUseReverb(r=>!r)} style={{
                  background:useReverb?`${cfg.accent}22`:"transparent",
                  border:`1px solid ${useReverb?cfg.accent:"rgba(255,255,255,0.08)"}`,
                  color:useReverb?cfg.accent:"#444",
                  padding:"6px 13px",borderRadius:7,cursor:"pointer",fontFamily:"monospace",fontSize:11,
                }}>REVERB</button>
              </>
            )}
            <button onClick={()=>setShowStickers(s=>!s)} style={{
              background:showStickers?`${cfg.accent}22`:"transparent",
              border:`1px solid ${showStickers?cfg.accent:"rgba(255,255,255,0.08)"}`,
              color:showStickers?cfg.accent:"#444",
              padding:"6px 13px",borderRadius:7,cursor:"pointer",fontFamily:"monospace",fontSize:11,
            }}>STICKERS {showStickers?"ON":"OFF"}</button>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{color:"#333",fontSize:10,fontFamily:"monospace"}}>VOL</span>
              <input type="range" min="0" max="1" step="0.01" value={volume}
                onChange={e=>setVolume(parseFloat(e.target.value))}
                style={{width:65,accentColor:cfg.accent,cursor:"pointer"}}/>
            </div>
            <button onClick={isRecording?stopRec:startRec} style={{
              background:isRecording?"rgba(255,30,30,0.18)":"rgba(255,255,255,0.04)",
              border:`1px solid ${isRecording?"#ff3030":"rgba(255,255,255,0.08)"}`,
              color:isRecording?"#ff4444":"#555",
              padding:"6px 14px",borderRadius:7,cursor:"pointer",fontFamily:"monospace",fontSize:11,
              display:"flex",alignItems:"center",gap:6,
              boxShadow:isRecording?"0 0 14px rgba(255,0,0,0.25)":"none",
            }}>
              <span style={{
                width:7,height:7,borderRadius:"50%",
                background:isRecording?"#ff4444":"#444",
                boxShadow:isRecording?"0 0 6px #ff4444":"none",
                display:"inline-block",
                animation:isRecording?"blink 1s infinite":"none",
              }}/>
              {isRecording?`REC ${fmtTime(recTime)}`:"REC"}
            </button>
          </div>

          {/* Instrument */}
          {isDrum
            ? <DrumKit activeKeys={activeKeys} onTrigger={triggerKey} cfg={cfg} showStickers={showStickers}/>
            : <PianoKeys activeKeys={activeKeys} onTrigger={triggerKey} cfg={cfg} showStickers={showStickers} stickerSlots={stickerSlots} tutStep={tutStep} song={song}/>
          }

          {/* Key guide */}
          <div style={{textAlign:"center",marginTop:4}}>
            <div style={{fontSize:9,color:"#2a2a3a",letterSpacing:2,textTransform:"uppercase",marginBottom:3,fontFamily:"monospace"}}>Keyboard</div>
            {isDrum
              ? <div style={{fontSize:10,color:"#333",fontFamily:"monospace"}}>A S D F G H J K L ; — Drums</div>
              : <div style={{display:"flex",gap:14,justifyContent:"center",fontSize:10,color:"#333",fontFamily:"monospace"}}>
                  <span>White: A S D F G H J K L ; '</span>
                  <span>Black: W E T Y U O P</span>
                </div>
            }
          </div>
        </div>
      )}

      {/* ═══ TUTORIAL TAB ════════════════════════════════════════════════════ */}
      {tab==="tutorial" && (
        <div style={{width:"100%",maxWidth:860,zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            {Object.keys(SONGS).map(s=>(
              <button key={s} onClick={()=>{setSelectedSong(s);stopTutorial();}} style={{
                background:selectedSong===s?`${cfg.accent}25`:"rgba(255,255,255,0.03)",
                border:`1px solid ${selectedSong===s?cfg.accent:"rgba(255,255,255,0.07)"}`,
                color:selectedSong===s?cfg.accent:"#555",
                padding:"7px 14px",borderRadius:8,cursor:"pointer",fontFamily:"monospace",fontSize:11,
                transition:"all 0.2s",
              }}>{s}</button>
            ))}
          </div>

          {/* Song steps */}
          <div style={{
            background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.07)`,
            borderRadius:12,padding:"18px 20px",width:"100%",boxSizing:"border-box",
          }}>
            <div style={{fontSize:10,color:"#444",fontFamily:"monospace",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>
              Notes — {selectedSong}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {song.steps.map((step,i)=>(
                <div key={i} style={{
                  background:tutStep===i?`${cfg.accent}44`:tutStep>i?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.04)",
                  border:`1px solid ${tutStep===i?cfg.accent:tutStep>i?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.05)"}`,
                  borderRadius:6,padding:"8px 10px",textAlign:"center",minWidth:44,
                  transition:"all 0.15s",
                  boxShadow:tutStep===i?`0 0 14px ${cfg.accent}55`:"none",
                  transform:tutStep===i?"scale(1.12)":"scale(1)",
                }}>
                  <div style={{fontSize:14,fontWeight:"bold",color:tutStep===i?cfg.accent:tutStep>i?cfg.accent+"88":"#555",fontFamily:"monospace"}}>{step.key.toUpperCase()}</div>
                  <div style={{fontSize:9,color:tutStep===i?"#ccc":"#444",marginTop:2,fontFamily:"monospace"}}>{step.note}</div>
                  <div style={{fontSize:9,color:tutStep===i?cfg.accent+"cc":"#333",fontFamily:"monospace"}}>{step.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* BPM control */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:"#555",fontSize:11,fontFamily:"monospace"}}>BPM</span>
            <button onClick={()=>setBpm(b=>Math.max(40,b-5))} style={smallBtn(cfg)}>−</button>
            <span style={{
              color:cfg.accent,fontSize:22,fontFamily:"monospace",
              minWidth:60,textAlign:"center",fontWeight:"bold",
            }}>{bpm}</span>
            <button onClick={()=>setBpm(b=>Math.min(220,b+5))} style={smallBtn(cfg)}>+</button>
            <input type="range" min="40" max="220" value={bpm} onChange={e=>setBpm(Number(e.target.value))}
              style={{width:100,accentColor:cfg.accent,cursor:"pointer"}}/>
            <span style={{color:"#333",fontSize:10,fontFamily:"monospace"}}>{Math.round(beatMs)}ms/beat</span>
          </div>

          <div style={{display:"flex",gap:10}}>
            <button onClick={tutPlaying?stopTutorial:playTutorial} style={{
              background:tutPlaying?`rgba(255,60,60,0.15)`:`${cfg.accent}22`,
              border:`1px solid ${tutPlaying?"#ff4444":cfg.accent}`,
              color:tutPlaying?"#ff5555":cfg.accent,
              padding:"10px 28px",borderRadius:9,cursor:"pointer",fontFamily:"monospace",fontSize:13,
              boxShadow:tutPlaying?"0 0 14px rgba(255,0,0,0.2)":`0 0 14px ${cfg.accent}33`,
              letterSpacing:1,
            }}>{tutPlaying?"⏹ STOP":"▶ PLAY TUTORIAL"}</button>
          </div>

          {/* Mini piano for tutorial */}
          {!isDrum && (
            <PianoKeys activeKeys={activeKeys} onTrigger={triggerKey} cfg={cfg} showStickers={false} stickerSlots={{}} tutStep={tutStep} song={song}/>
          )}
        </div>
      )}

      {/* ═══ SETTINGS TAB ════════════════════════════════════════════════════ */}
      {tab==="settings" && (
        <div style={{width:"100%",maxWidth:600,zIndex:1,display:"flex",flexDirection:"column",gap:14}}>
          <SectionLabel>BPM</SectionLabel>
          <div style={{display:"flex",flexDirection:"column",gap:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>setBpm(b=>Math.max(40,b-1))} style={smallBtn(cfg)}>−</button>
              <span style={{color:cfg.accent,fontSize:28,fontFamily:"monospace",fontWeight:"bold",minWidth:70,textAlign:"center"}}>{bpm}</span>
              <button onClick={()=>setBpm(b=>Math.min(220,b+1))} style={smallBtn(cfg)}>+</button>
              <input type="range" min="40" max="220" value={bpm} onChange={e=>setBpm(Number(e.target.value))}
                style={{flex:1,accentColor:cfg.accent,cursor:"pointer"}}/>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[60,80,100,120,140,160,180].map(b=>(
                <button key={b} onClick={()=>setBpm(b)} style={{
                  background:bpm===b?`${cfg.accent}22`:"rgba(255,255,255,0.04)",
                  border:`1px solid ${bpm===b?cfg.accent:"rgba(255,255,255,0.07)"}`,
                  color:bpm===b?cfg.accent:"#555",
                  padding:"5px 12px",borderRadius:6,cursor:"pointer",fontFamily:"monospace",fontSize:11,
                }}>{b}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[["Largo","44"],["Adagio","66"],["Andante","80"],["Moderato","108"],["Allegro","132"],["Presto","180"]].map(([name,val])=>(
                <button key={name} onClick={()=>setBpm(Number(val))} style={{
                  background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",
                  color:"#555",padding:"4px 11px",borderRadius:6,cursor:"pointer",fontFamily:"monospace",fontSize:10,
                }}>{name} <span style={{color:"#333"}}>{val}</span></button>
              ))}
            </div>
          </div>

          <SectionLabel>Volume & FX</SectionLabel>
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"16px 18px",display:"flex",flexDirection:"column",gap:12}}>
            <Row label="Master Volume" accent={cfg.accent}>
              <input type="range" min="0" max="1" step="0.01" value={volume}
                onChange={e=>setVolume(parseFloat(e.target.value))}
                style={{flex:1,accentColor:cfg.accent,cursor:"pointer"}}/>
              <span style={{color:cfg.accent,fontFamily:"monospace",fontSize:12,minWidth:38}}>{Math.round(volume*100)}%</span>
            </Row>
            {!isDrum && (
              <>
                <Row label="Reverb" accent={cfg.accent}>
                  <Toggle val={useReverb} onToggle={()=>setUseReverb(r=>!r)} accent={cfg.accent}/>
                </Row>
                <Row label="Octave Shift" accent={cfg.accent}>
                  <div style={{display:"flex",gap:5}}>
                    {[-1,0,1].map(o=>(
                      <button key={o} onClick={()=>setOctave(o)} style={{
                        background:octave===o?`${cfg.accent}22`:"rgba(255,255,255,0.03)",
                        border:`1px solid ${octave===o?cfg.accent:"rgba(255,255,255,0.07)"}`,
                        color:octave===o?cfg.accent:"#444",
                        padding:"4px 12px",borderRadius:5,cursor:"pointer",fontFamily:"monospace",fontSize:11,
                      }}>{o===0?"Normal":o>0?"+1 Octave":"-1 Octave"}</button>
                    ))}
                  </div>
                </Row>
              </>
            )}
          </div>

          <SectionLabel>Stickers & Visual</SectionLabel>
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"16px 18px",display:"flex",flexDirection:"column",gap:12}}>
            <Row label="Show Stickers" accent={cfg.accent}>
              <Toggle val={showStickers} onToggle={()=>setShowStickers(s=>!s)} accent={cfg.accent}/>
            </Row>
            <div>
              <div style={{fontSize:10,color:"#444",fontFamily:"monospace",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Sticker Pack</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {cfg.stickers.map((s,i)=>(
                  <span key={i} style={{
                    fontSize:20,padding:"6px 8px",
                    background:"rgba(255,255,255,0.05)",
                    borderRadius:7,cursor:"default",
                    border:`1px solid rgba(255,255,255,0.07)`,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          <SectionLabel>Style Info</SectionLabel>
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"16px 18px"}}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {Object.entries(STYLES).map(([k,v])=>(
                <div key={k} onClick={()=>setStyle(k)} style={{
                  padding:"8px 14px",borderRadius:8,cursor:"pointer",
                  background:style===k?`${v.accent}20`:"rgba(255,255,255,0.02)",
                  border:`1px solid ${style===k?v.accent:"rgba(255,255,255,0.06)"}`,
                  color:style===k?v.accent:"#555",fontFamily:"monospace",fontSize:11,
                }}>{v.icon} {v.label}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ RECORDINGS TAB ══════════════════════════════════════════════════ */}
      {tab==="recordings" && (
        <div style={{width:"100%",maxWidth:860,zIndex:1,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:10,color:"#444",fontFamily:"monospace",letterSpacing:2,textTransform:"uppercase"}}>
              {recordings.length} Recording{recordings.length!==1?"s":""}
            </div>
            <button onClick={isRecording?stopRec:startRec} style={{
              background:isRecording?"rgba(255,30,30,0.18)":"rgba(255,255,255,0.04)",
              border:`1px solid ${isRecording?"#ff3030":cfg.accent}`,
              color:isRecording?"#ff4444":cfg.accent,
              padding:"8px 18px",borderRadius:8,cursor:"pointer",fontFamily:"monospace",fontSize:11,
              display:"flex",alignItems:"center",gap:7,
              boxShadow:isRecording?"0 0 14px rgba(255,0,0,0.3)":`0 0 10px ${cfg.accent}33`,
            }}>
              <span style={{
                width:8,height:8,borderRadius:"50%",background:isRecording?"#ff4444":cfg.accent,
                display:"inline-block",animation:isRecording?"blink 1s infinite":"none",
                boxShadow:isRecording?"0 0 8px #ff4444":""
              }}/>
              {isRecording?`● Recording ${fmtTime(recTime)}`:"● New Recording"}
            </button>
          </div>

          {recordings.length===0 && (
            <div style={{textAlign:"center",padding:"50px 0",color:"#333",fontFamily:"monospace",fontSize:13}}>
              <div style={{fontSize:36,marginBottom:10}}>🎙</div>
              No recordings yet. Switch to Play tab and hit REC!
            </div>
          )}

          {recordings.map((r,i)=>(
            <div key={r.id} style={{
              background:"rgba(255,255,255,0.03)",
              border:`1px solid rgba(255,255,255,0.07)`,
              borderLeft:`3px solid ${cfg.accent}`,
              borderRadius:10,padding:"14px 18px",
              display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",
            }}>
              <div style={{
                width:36,height:36,borderRadius:"50%",
                background:`${cfg.accent}22`,border:`1px solid ${cfg.accent}44`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"monospace",fontSize:14,color:cfg.accent,fontWeight:"bold",flexShrink:0,
              }}>{i+1}</div>
              <div style={{flex:1,minWidth:120}}>
                <div style={{color:"#ccc",fontFamily:"monospace",fontSize:12,marginBottom:2}}>{r.label}</div>
                <div style={{color:"#444",fontFamily:"monospace",fontSize:10}}>{r.time}</div>
              </div>
              <audio controls src={r.url} style={{height:32,maxWidth:220,flex:"2 1 160px"}}/>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <a href={r.url} download={`${r.label.replace(" ","-")}.webm`} style={{
                  color:cfg.accent,fontSize:11,textDecoration:"none",fontFamily:"monospace",
                  border:`1px solid ${cfg.accent}44`,padding:"6px 12px",borderRadius:6,
                  transition:"all 0.15s",
                }}>↓ Save</a>
                <button onClick={()=>deleteRec(r.id)} style={{
                  background:"rgba(255,60,60,0.08)",border:"1px solid rgba(255,60,60,0.2)",
                  color:"#ff6b6b",padding:"6px 12px",borderRadius:6,cursor:"pointer",
                  fontFamily:"monospace",fontSize:11,transition:"all 0.15s",
                }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        input[type=range]{height:4px;outline:none}
        audio{outline:none}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}

// ── Piano Keys Component ───────────────────────────────────────────────────────
function PianoKeys({ activeKeys, onTrigger, cfg, showStickers, stickerSlots, tutStep, song }) {
  const totalW = WHITE_KEYS.length * 52;
  const tutKeyNow = tutStep >= 0 && song ? song.steps[tutStep]?.key : null;

  return (
    <div style={{position:"relative",width:totalW,height:210,
      background:cfg.keyboardBg||"linear-gradient(180deg,#18181f,#0f0f14)",
      borderRadius:"6px 6px 14px 14px",
      border:`1px solid ${cfg.accent}22`,
      boxShadow:`0 20px 60px rgba(0,0,0,0.7),0 0 40px ${cfg.accent}11`,
      overflow:"visible",
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:14,
        background:`linear-gradient(180deg,${cfg.accent}22,transparent)`,
        borderRadius:"6px 6px 0 0",zIndex:10}}/>

      {WHITE_KEYS.map((k,i)=>{
        const active=activeKeys.has(k.key);
        const isTut=tutKeyNow===k.key;
        return (
          <div key={k.key}
            onMouseDown={()=>onTrigger(k.key,true)}
            onMouseUp={()=>onTrigger(k.key,false)}
            onMouseLeave={()=>active&&onTrigger(k.key,false)}
            onTouchStart={e=>{e.preventDefault();onTrigger(k.key,true);}}
            onTouchEnd={()=>onTrigger(k.key,false)}
            style={{
              position:"absolute",left:i*52,top:14,width:49,height:196,
              background:active
                ?`linear-gradient(180deg,${cfg.accent}55,${cfg.accent}22 60%,${cfg.accent}66)`
                :isTut?`linear-gradient(180deg,${cfg.accent}33,${cfg.accent}11)`
                :cfg.whiteKey||"linear-gradient(180deg,#f0ece8,#ddd8cc)",
              border:active?`1px solid ${cfg.accent}99`:isTut?`1px solid ${cfg.accent}66`:"1px solid #aaa",
              borderTop:"none",borderRadius:"0 0 7px 7px",
              cursor:"pointer",zIndex:1,userSelect:"none",
              transition:"all 0.06s",
              transform:active?"translateY(2px)":"none",
              boxShadow:active?`0 4px 22px ${cfg.accent}66,inset 0 -3px 6px rgba(0,0,0,0.1)`:isTut?`0 0 12px ${cfg.accent}44`:"0 5px 10px rgba(0,0,0,0.4)",
              display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",paddingBottom:9,gap:2,
            }}>
            {showStickers && stickerSlots[k.key] && (
              <span style={{fontSize:14,marginBottom:3,opacity:active?1:0.5,transition:"opacity 0.1s"}}>{stickerSlots[k.key]}</span>
            )}
            <span style={{fontSize:10,fontWeight:"bold",color:active?cfg.accent:isTut?cfg.accent+"cc":"#aaa",fontFamily:"monospace",transition:"color 0.05s"}}>
              {k.key.toUpperCase()}
            </span>
          </div>
        );
      })}

      {BLACK_KEYS.map(k=>{
        const afterIdx=WHITE_KEYS.findIndex(w=>w.note===k.after);
        const left=afterIdx*52+34;
        const active=activeKeys.has(k.key);
        const isTut=tutKeyNow===k.key;
        return (
          <div key={k.key}
            onMouseDown={e=>{e.stopPropagation();onTrigger(k.key,true);}}
            onMouseUp={()=>onTrigger(k.key,false)}
            onMouseLeave={()=>active&&onTrigger(k.key,false)}
            onTouchStart={e=>{e.preventDefault();onTrigger(k.key,true);}}
            onTouchEnd={()=>onTrigger(k.key,false)}
            style={{
              position:"absolute",left,top:14,width:34,height:126,
              background:active?`linear-gradient(180deg,${cfg.accent}ee,${cfg.accent}99)`:isTut?`linear-gradient(180deg,${cfg.accent}66,${cfg.accent}33)`:cfg.blackKey||"linear-gradient(180deg,#1a1a22,#0f0f14)",
              border:active?`1px solid ${cfg.accent}`:isTut?`1px solid ${cfg.accent}88`:"1px solid #080810",
              borderTop:"none",borderRadius:"0 0 5px 5px",
              cursor:"pointer",zIndex:3,userSelect:"none",
              transition:"all 0.06s",
              transform:active?"translateY(2px)":"none",
              boxShadow:active?`0 0 22px ${cfg.accent}88,0 6px 16px rgba(0,0,0,0.6)`:isTut?`0 0 12px ${cfg.accent}44`:"0 6px 16px rgba(0,0,0,0.8)",
              display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",paddingBottom:6,
            }}>
            <span style={{fontSize:9,color:active?"#fff":isTut?cfg.accent:"#444",fontFamily:"monospace",fontWeight:"bold"}}>{k.key.toUpperCase()}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Drum Kit ───────────────────────────────────────────────────────────────────
function DrumKit({ activeKeys, onTrigger, cfg, showStickers }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,width:"100%",maxWidth:620}}>
      {DRUM_MAP.map((drum,i)=>{
        const active=activeKeys.has(drum.key);
        const sticker=cfg.stickers?.[i%cfg.stickers.length];
        return (
          <button key={drum.key}
            onMouseDown={()=>onTrigger(drum.key,true)}
            onMouseUp={()=>onTrigger(drum.key,false)}
            onMouseLeave={()=>active&&onTrigger(drum.key,false)}
            onTouchStart={e=>{e.preventDefault();onTrigger(drum.key,true);}}
            onTouchEnd={()=>onTrigger(drum.key,false)}
            style={{
              background:active?`${drum.color}33`:"rgba(255,255,255,0.03)",
              border:`2px solid ${active?drum.color:"rgba(255,255,255,0.07)"}`,
              borderRadius:14,padding:"18px 10px",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              transition:"all 0.06s",transform:active?"scale(0.95)":"scale(1)",
              boxShadow:active?`0 0 24px ${drum.color}55`:"none",userSelect:"none",
            }}>
            <span style={{fontSize:22}}>{showStickers&&sticker?sticker:drum.icon}</span>
            <span style={{fontSize:11,color:active?drum.color:"#444",fontFamily:"monospace"}}>{drum.name}</span>
            <span style={{
              fontSize:12,fontWeight:"bold",color:active?drum.color:"#2a2a2a",
              background:active?`${drum.color}22`:"rgba(255,255,255,0.04)",
              border:`1px solid ${active?drum.color+"55":"rgba(255,255,255,0.05)"}`,
              borderRadius:5,padding:"2px 8px",fontFamily:"monospace",
            }}>{drum.key.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const smallBtn = (cfg) => ({
  background:`${cfg.accent}18`,border:`1px solid ${cfg.accent}44`,
  color:cfg.accent,width:32,height:32,borderRadius:6,cursor:"pointer",
  fontFamily:"monospace",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",
});

function SectionLabel({children}){
  return <div style={{fontSize:9,color:"#444",fontFamily:"monospace",letterSpacing:3,textTransform:"uppercase",paddingLeft:2}}>{children}</div>;
}
function Row({label,accent,children}){
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <span style={{fontSize:11,color:"#555",fontFamily:"monospace",minWidth:110,letterSpacing:0.5}}>{label}</span>
      {children}
    </div>
  );
}
function Toggle({val,onToggle,accent}){
  return (
    <div onClick={onToggle} style={{
      width:44,height:24,borderRadius:12,cursor:"pointer",position:"relative",
      background:val?`${accent}55`:"rgba(255,255,255,0.08)",
      border:`1px solid ${val?accent:"rgba(255,255,255,0.1)"}`,
      transition:"all 0.2s",
    }}>
      <div style={{
        position:"absolute",top:3,left:val?22:3,width:16,height:16,borderRadius:"50%",
        background:val?accent:"#444",transition:"all 0.2s",
        boxShadow:val?`0 0 6px ${accent}88`:"none",
      }}/>
    </div>
  );
}
