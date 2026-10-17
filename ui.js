(function(){
  // Watermark block (optional, but keeping it)
  try {
    var origGL = WebGLRenderingContext.prototype.shaderSource;
    WebGLRenderingContext.prototype.shaderSource = function(shader, source) {
      if(source && source.indexOf("DEMO") > -1) { source = source.replace(/DEMO/g, "    "); }
      return origGL.call(this, shader, source);
    };
  } catch(e) {}

  if(window.top !== window.self) return;
  if(window.__qxExtLoaded) return;
  window.__qxExtLoaded = true;

  function init() {
    if (!document.body) return setTimeout(init, 500);
    if(document.getElementById("qxPopup")) return;
    
    // Popup UI
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
    h+='<button id="qxStart" style="width:100%;padding:14px;background:linear-gradient(135deg,#00c853,#0faf59);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(0,200,83,0.3);">✓ Activate & Start</button>';
    h+='<div id="qxErr" style="color:#ff4444;font-size:11px;text-align:center;margin-top:10px;display:none;"></div>';
    h+='</div>';
    popup.innerHTML=h;
    document.body.appendChild(popup);
    
    document.getElementById("qxStart").onclick=function(){
      var LIC="PRISM11QX";
      var lic=document.getElementById("qxLic").value.trim();
      var name=document.getElementById("qxName").value.trim()||"razuafridi45";
      if(lic!==LIC){var e=document.getElementById("qxErr");e.textContent="❌ Invalid license key";e.style.display="block";return;}
      window.__qxS={name:name,base:null};
      popup.remove();
      runEngine();
    };
  }

  function runEngine(){
    var origShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(i){
      if(i && i.mode === "closed") i.mode = "open";
      return origShadow.call(this, i);
    };
    
    // 200ms loop for live updates
    setInterval(function(){
      var S = window.__qxS;
      if(!S) return;

      // 1. Balance Update (Shadow DOM)
      var trig = document.querySelector("qx-usermenu-trigger");
      var bal = 0;
      if(trig && trig.shadowRoot){
        var b = trig.shadowRoot.querySelector(".balance");
        if(b){
          b.style.color="white"; b.style.fontWeight="bold";
          bal = parseFloat(b.textContent.replace(/[$,₹,]/g,"")) || 0;
        }
        trig.shadowRoot.querySelectorAll(".name").forEach(function(n){
          if(n.textContent.trim()==="Demo"||n.textContent.trim()==="DEMO"){
            n.textContent="Live"; n.style.color="#0faf59";
          }
        });
        // Icon Update
        var ic=trig.shadowRoot.querySelector("svg.icon use");
        if(ic){
          var tg="icon-profile-level-standart";
          if(bal>=10000)tg="icon-profile-level-vip";
          else if(bal>=5000)tg="icon-profile-level-pro";
          var hr="/profile/images/spritemap.svg#"+tg;
          if((ic.getAttribute("xlink:href")||"").indexOf(tg)===-1){ic.setAttribute("xlink:href",hr);ic.setAttribute("href",hr);}
        }
      }

      // 2. Baseline set karo (sirf pehli baar)
      if(S.base === null && bal > 0) S.base = bal;
      var pl = S.base !== null ? (bal - S.base) : 0;

      // 3. Leaderboard Calculate karo
      var ranks = [];
      document.querySelectorAll("[class*='ePgNa']").forEach(function(e){
        var v = parseFloat(e.textContent.replace(/[$,]/g,""));
        if(!isNaN(v)) ranks.push(v);
      });
      
      var above = ranks.filter(function(v){ return v > pl; }).length;
      var pos = above + 1;
      var posText = (pl > 0 && pos <= 20) ? pos.toString() : "100+";
      var plText = (pl === 0) ? "$0.00" : (pl > 0 ? "$"+pl.toFixed(2) : "-$"+Math.abs(pl).toFixed(2));
      var plColor = pl >= 0 ? "#0faf59" : "#ff4444";

      // 4. Apni Row (Your position) update karo
      var myRow = null;
      var allDivs = document.querySelectorAll("div");
      for(var i=0; i<allDivs.length; i++){
        if(allDivs[i].children.length === 1 && allDivs[i].textContent.indexOf("Your position:") > -1){
          myRow = allDivs[i].parentNode;
          break;
        }
      }

      if(myRow){
        var nameEl = myRow.querySelector("p");
        if(nameEl && nameEl.textContent !== S.name) nameEl.textContent = S.name;
        
        var amtEl = myRow.querySelector("[class*='ord28']");
        if(amtEl && amtEl.textContent !== plText){
          amtEl.textContent = plText;
          amtEl.style.color = plColor;
        }

        var posLabel = myRow.querySelector("[class*='YkAuV']");
        if(posLabel && posLabel.nextElementSibling){
          if(posLabel.nextElementSibling.textContent !== posText){
            posLabel.nextElementSibling.textContent = posText;
          }
        }
      }

      // 5. Top 20 me Replace karo
      if(pl > 0 && pos <= 20){
        document.querySelectorAll("[class*='FdU8g']").forEach(function(rankEl){
          if(parseInt(rankEl.textContent) === pos){
            var row = rankEl.parentElement;
            if(row){
              var n = row.querySelector(".hKWVz");
              var a = row.querySelector(".ePgNa");
              if(n) { n.textContent = S.name; n.style.color = "#0faf59"; }
              if(a) { a.textContent = plText; a.style.color = plColor; }
            }
          }
        });
      }

      if(location.pathname !== "/en/trade") history.pushState({}, "", "/en/trade");
      if(document.title !== "Live trading | Quotex") document.title = "Live trading | Quotex";

    }, 200); 
  }

  init();
})();
