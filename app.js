(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const canvas = $("stage"), ctx = canvas.getContext("2d");
  const state = {scene:null, image:null, playing:false, progress:0, speed:2, agents:8, trails:true, sound:false, tour:false, raf:0, last:0, startTime:0, particles:[], audio:null};
  const colors = ["#8a78ff","#4bdcff","#ff70aa","#ffd166","#59e3a7","#ff9068","#b18cff","#72a7ff"];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fitCanvas() {
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width*dpr));
    canvas.height = Math.max(1, Math.floor(rect.height*dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if (state.scene) render();
  }
  function sampleScene() {
    const w=1200,h=850, c=document.createElement("canvas"); c.width=w;c.height=h;
    const g=c.getContext("2d");
    const grad=g.createLinearGradient(0,0,w,h);grad.addColorStop(0,"#f6f5ff");grad.addColorStop(1,"#e7f5ff");g.fillStyle=grad;g.fillRect(0,0,w,h);
    g.fillStyle="#171a35";g.fillRect(0,0,w,88);g.fillStyle="#fff";g.font="bold 25px system-ui";g.fillText("NORTHSTAR",58,55);
    g.fillStyle="#c9c6e8";g.font="16px system-ui";g.fillText("PRODUCT  /  STUDIO  /  JOURNAL",790,52);
    g.fillStyle="#5145a8";g.font="bold 62px system-ui";g.fillText("Make room",65,225);g.fillText("for better ideas.",65,300);
    g.fillStyle="#5f627b";g.font="22px system-ui";g.fillText("Thoughtful tools for the way",68,365);g.fillText("people work and create.",68,398);
    g.fillStyle="#7566e8";roundRect(g,68,455,205,58,14);g.fillStyle="#fff";g.font="bold 18px system-ui";g.fillText("Explore the studio",88,491);
    const cards=[["01","Discover","#c9e6ff"],["02","Design","#dcd5ff"],["03","Deliver","#c9f0df"]];
    cards.forEach((v,i)=>{const x=65+i*365;g.fillStyle=v[2];roundRect(g,x,590,330,195,22);g.fillStyle="#5145a8";g.font="bold 17px system-ui";g.fillText(v[0],x+24,632);g.fillStyle="#242640";g.font="bold 28px system-ui";g.fillText(v[1],x+24,690);g.fillStyle="#686b80";g.font="15px system-ui";g.fillText("A clearer path from thought",x+24,730);});
    return c;
  }
  function roundRect(g,x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
  function setScene(source) {
    state.scene=source;state.progress=0;state.particles=[];
    $("workspace").hidden=false;$("intro").hidden=true;$("features").hidden=true;
    $("emptyHint").hidden=true;fitCanvas();resetAgents();render();
    $("status").textContent="SCENE READY";$("playBtn").textContent="▶ Play";
    $("workspace").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function resetAgents() {
    state.particles=Array.from({length:state.agents},(_,i)=>({x:Math.random()*canvas.clientWidth,y:Math.random()*canvas.clientHeight,tx:0,ty:0,color:colors[i%colors.length],phase:Math.random()*6.28,trail:[]}));
  }
  function render() {
    if(!state.scene)return;
    const w=canvas.clientWidth,h=canvas.clientHeight;
    ctx.clearRect(0,0,w,h);ctx.fillStyle="#080a12";ctx.fillRect(0,0,w,h);
    const iw=state.scene.width,ih=state.scene.height,scale=Math.min(w/iw,h/ih),dw=iw*scale,dh=ih*scale,ox=(w-dw)/2,oy=(h-dh)/2;
    const cols=30,rows=22,total=cols*rows,shown=Math.floor(state.progress*total);
    // Reveal image in shuffled-looking deterministic tile order.
    const order=tileOrder(cols,rows);
    for(let k=0;k<shown;k++){
      const idx=order[k],cx=idx%cols,cy=Math.floor(idx/cols);
      const sx=Math.floor(cx*iw/cols),sy=Math.floor(cy*ih/rows),sw=Math.ceil(iw/cols),sh=Math.ceil(ih/rows);
      const dx=ox+cx*dw/cols,dy=oy+cy*dh/rows;
      ctx.drawImage(state.scene,sx,sy,sw,sh,dx,dy,dw/cols+1,dh/rows+1);
    }
    state.particles.forEach((p,i)=>{
      const t=(state.progress*1.4+i/state.particles.length*.7)%1;
      p.tx=ox+dw*t;p.ty=oy+dh*((i*0.173+state.progress*.67)%1);
      p.x+=(p.tx-p.x)*.11;p.y+=(p.ty-p.y)*.11;
      if(state.trails){p.trail.push([p.x,p.y]);if(p.trail.length>10)p.trail.shift();ctx.beginPath();p.trail.forEach((v,j)=>j?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.strokeStyle=p.color+"66";ctx.lineWidth=1.5;ctx.stroke();}
      ctx.save();ctx.translate(p.x,p.y);ctx.shadowColor=p.color;ctx.shadowBlur=12;ctx.fillStyle=p.color;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,17);ctx.lineTo(5,12);ctx.lineTo(10,21);ctx.lineTo(14,18);ctx.lineTo(9,10);ctx.lineTo(17,9);ctx.closePath();ctx.fill();ctx.restore();
    });
    $("progressBar").style.width=(state.progress*100)+"%";$("percent").textContent=Math.floor(state.progress*100)+"%";
  }
  let orderCache=null;
  function tileOrder(cols,rows){if(orderCache&&orderCache.length===cols*rows)return orderCache;const a=Array.from({length:cols*rows},(_,i)=>i);a.sort((x,y)=>hash(x)-hash(y));orderCache=a;return a;}
  function hash(n){let x=(n*9301+49297)%233280;return x/233280;}
  function tick(now){
    if(!state.playing)return;
    const dt=state.last?Math.min(50,now-state.last):16;state.last=now;
    state.progress=Math.min(1,state.progress+dt*state.speed/8500);
    render();
    if(state.tour&&state.progress<1){const max=document.documentElement.scrollHeight-innerHeight;window.scrollTo(0,max*state.progress);}
    if(state.progress>=1){state.playing=false;$("status").textContent="REBUILD COMPLETE";$("playBtn").textContent="↻ Replay";tone(660,.15);return;}
    $("status").textContent="SWARM REBUILDING";state.raf=requestAnimationFrame(tick);
  }
  function play(){if(!state.scene)return;if(state.progress>=1)state.progress=0;state.playing=true;state.last=0;$("playBtn").textContent="Ⅱ Pause";$("status").textContent="SWARM REBUILDING";tone(420,.07);state.raf=requestAnimationFrame(tick);}
  function pause(){state.playing=false;cancelAnimationFrame(state.raf);$("playBtn").textContent="▶ Resume";$("status").textContent="PAUSED";}
  function replay(){pause();state.progress=0;state.particles.forEach(p=>p.trail=[]);window.scrollTo(0,0);render();play();}
  function tone(freq,duration){if(!state.sound)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;state.audio||=new AC();if(state.audio.state==="suspended")state.audio.resume();const o=state.audio.createOscillator(),g=state.audio.createGain();o.frequency.value=freq;g.gain.setValueAtTime(.0001,state.audio.currentTime);g.gain.exponentialRampToValueAtTime(.025,state.audio.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,state.audio.currentTime+duration);o.connect(g);g.connect(state.audio.destination);o.start();o.stop(state.audio.currentTime+duration+.02);}catch{}}
  $("sampleBtn").addEventListener("click",()=>setScene(sampleScene()));
  $("imageInput").addEventListener("change",e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith("image/")){alert("Please choose an image file.");return;}const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{const c=document.createElement("canvas");const max=2200,scale=Math.min(1,max/Math.max(img.width,img.height));c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);setScene(c);};img.onerror=()=>{URL.revokeObjectURL(url);alert("Could not read this image.");};img.src=url;});
  $("playBtn").addEventListener("click",()=>state.playing?pause():play());
  $("replayBtn").addEventListener("click",replay);
  $("resetBtn").addEventListener("click",()=>{pause();state.scene=null;$("workspace").hidden=true;$("intro").hidden=false;$("features").hidden=false;$("imageInput").value="";});
  $("speed").addEventListener("change",e=>state.speed=Number(e.target.value));
  $("agents").addEventListener("change",e=>{state.agents=Number(e.target.value);resetAgents();render();});
  $("trail").addEventListener("change",e=>{state.trails=e.target.checked;render();});
  $("soundBtn").addEventListener("click",()=>{state.sound=!state.sound;$("soundBtn").textContent=state.sound?"♫ On":"♫ Off";if(state.sound)tone(523,.1);});
  $("tourBtn").addEventListener("click",()=>{state.tour=!state.tour;$("tourBtn").textContent=state.tour?"Stop tour":"Tour";if(state.tour&&!state.playing)play();});
  $("helpBtn").addEventListener("click",()=>$("helpDialog").showModal());
  $("closeHelp").addEventListener("click",()=>$("helpDialog").close());
  window.addEventListener("resize",fitCanvas);
  if("serviceWorker" in navigator && location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  let installPrompt=null;
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("installBtn").classList.remove("hidden");});
  $("installBtn").addEventListener("click",async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("installBtn").classList.add("hidden");});
  fitCanvas();
})();