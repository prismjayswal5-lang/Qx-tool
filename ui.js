(function(){
  if(document.getElementById("qxPopup")){document.getElementById("qxPopup").remove();return;}
  var popup=document.createElement("div");
  popup.id="qxPopup";
  popup.style.cssText="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;padding:15px;box-sizing:border-box;";
  var h="";
  h+='<div style="background:linear-gradient(180deg,#0d1520,#0a1018);border-radius:16px;width:100%;max-width:360px;padding:20px;color:#fff;box-shadow:0 10px 40px rgba(0,0,0,0.6);border:1px solid #1a2230;max-height:92vh;overflow-y:auto;box-sizing:border-box;">';
  h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #1a2230;">';
  h+='<div style="width:44px;height:44px;background:linear-gradient(135deg,#00c853,#0faf59);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📈</div>';
  h+='<div><div style="font-size:16px;font-weight:700;color:#00c853;">Quotex Demo to Live</div>';
  h+='<div style="font-size:11px;color:#8899aa;margin-top:2px;">Dev TG: @prism11</div></div>';
  h+='</div>';
  h+='<div style="margin-bottom:12px;"><div style="font-size:12px;color:#8899aa;margin-bottom:6px;">🔑 License Key:</div>';
  h+='<input id="qxLic" type="password" placeholder="Enter license key" style="width:100%;padding:10px 12px;background:#0d1117;border:1px solid #1a2230;border-radius:8px;color:#fff;font-size:13px;box-sizing:border-box;outline:none;"></div>';
  h+='<div style="margin-bottom:12px;"><div style="font-size:12px;color:#8899aa;margin-bottom:6px;">📋 Leaderboard Name:</div>';
  h+='<input id="qxName" type="text" placeholder="Enter your name" style="width:100%;padding:10px 12px;background:#0d1117;border:1px solid #1a2230;border-radius:8px;color:#fff;font-size:13px;box-sizing:border-box;outline:none;"></div>';
  h+='<div style="margin-bottom:12px;"><div style="font-size:12px;color:#8899aa;margin-bottom:6px;">🏳️ Country:</div>';
  h+='<select id="qxFlag" style="width:100%;padding:10px 12px;background:#0d1117;border:1px solid #1a2230;border-radius:8px;color:#fff;font-size:13px;box-sizing:border-box;outline:none;">';
  h+='<option value="in">🇮🇳 India</option><option value="pk">🇵🇰 Pakistan</option><option value="bd">🇧🇩 Bangladesh</option><option value="us">🇺🇸 USA</option><option value="gb">🇬🇧 UK</option><option value="ae">🇦🇪 UAE</option><option value="sa">🇸🇦 Saudi</option><option value="tr">🇹🇷 Turkey</option><option value="lk">🇱🇰 Sri Lanka</option><option value="np">🇳🇵 Nepal</option><option value="id">🇮🇩 Indonesia</option><option value="my">🇲🇾 Malaysia</option></select></div>';
  h+='<div style="margin-bottom:12px;"><div style="font-size:12px;color:#8899aa;margin-bottom:6px;">💰 Demo Balance (Optional):</div>';
  h+='<input id="qxBal" type="text" placeholder="e.g. 10000 (leave empty = as-is)" style="width:100%;padding:10px 12px;background:#0d1117;border:1px solid #1a2230;border-radius:8px;color:#fff;font-size:13px;box-sizing:border-box;outline:none;"></div>';
  h+='<div style="margin-bottom:16px;"><div style="font-size:12px;color:#8899aa;margin-bottom:6px;">👤 Avatar URL (Optional):</div>';
  h+='<input id="qxAv" type="text" placeholder="https://..." style="width:100%;padding:10px 12px;background:#0d1117;border:1px solid #1a2230;border-radius:8px;color:#fff;font-size:13px;box-sizing:border-box;outline:none;"></div>';
  h+='<button id="qxStart" style="width:100%;padding:14px;background:linear-gradient(135deg,#00c853,#0faf59);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(0,200,83,0.3);">✓ Activate & Start</button>';
  h+='<div id="qxErr" style="color:#ff4444;font-size:11px;text-align:center;margin-top:10px;display:none;"></div>';
  h+='</div>';
  popup.innerHTML=h;
  document.body.appendChild(popup);
  document.getElementById("qxStart").onclick=function(){
    var LIC="PRISM11QX";
    var lic=document.getElementById("qxLic").value.trim();
    var name=document.getElementById("qxName").value.trim()||"razuafridi45";
    var flag=document.getElementById("qxFlag").value;
    var balOv=document.getElementById("qxBal").value.trim();
    var av=document.getElementById("qxAv").value.trim();
    if(lic!==LIC){var e=document.getElementById("qxErr");e.textContent="❌ Invalid license key";e.style.display="block";return;}
    window.__qxS={name:name,flag:flag,balOv:balOv,avatar:av,base:null};
    popup.remove();
    runEngine();
  };
  function runEngine(){
    var orig=Element.prototype.attachShadow;
    Element.prototype.attachShadow=function(i){if(i.mode==="closed")i.mode="open";return orig.call(this,i);};
    var tr=document.querySelector("qx-usermenu-trigger");
    if(tr&&tr.parentNode){var p=tr.parentNode;var c=document.createElement("qx-usermenu-trigger");p.replaceChild(c,tr);}
    function u(){
      var S=window.__qxS;if(!S)return;
      var trig=document.querySelector("qx-usermenu-trigger");
      var bal=0;
      if(trig&&trig.shadowRoot){
        var sr=trig.shadowRoot;
        var b=sr.querySelector(".balance");
        if(b){
          if(b.style.color!=="white"){b.style.color="white";b.style.fontWeight="bold";}
          bal=parseFloat(b.textContent.replace(/[$,₹,]/g,""))||0;
        }
        sr.querySelectorAll(".name").forEach(function(n){var x=n.textContent.trim();if(x==="Demo"||x==="DEMO"){n.textContent="Live";n.style.color="#0faf59";}});
        var ic=sr.querySelector("svg.icon use");
        if(ic){
          var tg="icon-profile-level-standart";
          if(bal>=10000)tg="icon-profile-level-vip";
          else if(bal>=5000)tg="icon-profile-level-pro";
          var hr="/profile/images/spritemap.svg#"+tg;
          if((ic.getAttribute("xlink:href")||"").indexOf(tg)===-1){ic.setAttribute("xlink:href",hr);ic.setAttribute("href",hr);}
        }
      }
      if(S.base===null&&bal>0)S.base=bal;
      var pl=S.base!==null?bal-S.base:0;
      var above=0;
      document.querySelectorAll(".ePgNa").forEach(function(e){var v=parseFloat(e.textContent.replace(/[$,]/g,""))||0;if(v>pl)above++;});
      var pos=above+1;
      var ptxt=(pl>0&&pos<=20)?String(pos):"100+";
      var r=document.querySelector("div.M_p_O");
      if(r){
        var pEl=r.querySelector("p");
        if(pEl&&pEl.textContent.indexOf("#")===0){pEl.textContent=S.name;}
        var img=r.querySelector("img");
        if(img&&S.flag){img.src="https://flagcdn.com/24x18/"+S.flag+".png";}
        var a=r.querySelector("div[class*=ord28]");
        if(a){
          var at=pl===0?"$0.00":(pl>0?"$"+pl.toFixed(2):"-$"+Math.abs(pl).toFixed(2));
          if(a.textContent!==at)a.textContent=at;
          a.style.color=pl>=0?"#0faf59":"#ff4444";
        }
        if(S.avatar){var avEl=r.querySelector("img");if(avEl)avEl.src=S.avatar;}
      }
      var yk=document.querySelector(".YkAuV");
      if(yk&&yk.parentElement){
        Array.from(yk.parentElement.children).forEach(function(c){
          if(c!==yk){
            var t2=c.textContent.trim();
            if(t2==="100+"||(t2.length>0&&t2.length<4&&/^\d+$/.test(t2))){if(t2!==ptxt)c.textContent=ptxt;}
          }
        });
      }
      if(pl>0&&pos<=20){
        document.querySelectorAll(".FdU8g").forEach(function(pe){
          if(parseInt(pe.textContent)===pos){
            var row=pe.parentElement;
            if(row){
              var n=row.querySelector(".hKWVz");
              var a2=row.querySelector(".eGa");
              var img2=row.querySelector("img");
              if(n&&n.textContent!==S.name){n.textContent=S.name;n.style.color="#0faf59";}
              if(a2){var aT="$"+pl.toFixed(2);if(a2.textContent!==aT)a2.textContent=aT;}
              if(img2&&S.flag)img2.src="https://flagcdn.com/24x18/"+S.flag+".png";
            }
          }
        });
      }
      if(location.pathname!=="/en/trade")history.pushState({},"","/en/trade");
      if(document.title!=="Live trading | Quotex")document.title="Live trading | Quotex";
    }
    u();
    setInterval(u,100);
  }
})();
