(function(){
  // Watermark block (Background)
  try {
    var origGL = WebGLRenderingContext.prototype.shaderSource;
    WebGLRenderingContext.prototype.shaderSource = function(shader, source) {
      if(source && source.indexOf("DEMO") > -1) { source = source.replace(/DEMO/g, "    "); }
      return origGL.call(this, shader, source);
    };
    var origFill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, x, y) {
      if (typeof text === 'string' && text.trim() === 'DEMO') return;
      return origFill.call(this, text, x, y);
    };
  } catch(e) {}

  if(window.top !== window.self) return;
  if(window.__qxExtLoaded) return;
  window.__qxExtLoaded = true;

  function init() {
    if (!document.body) return setTimeout(init, 500);
    if(document.getElementById("qxPopup")) return;
    
    // --- POPUP UI ---
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
    // 1. SHADOW DOM OVERRIDE (For Dropdown)
    var origShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(i){
      if(i && i.mode === "closed") i.mode = "open";
      return origShadow.call(this, i);
    };

    function updateUI() {
      var S = window.__qxS;
      if(!S) return;

      // 2. DROPDOWN FIX (Demo Account -> Live Account)
      var trigger = document.querySelector("qx-usermenu-trigger");
      if(trigger && trigger.shadowRoot){
        trigger.shadowRoot.querySelectorAll("div, span").forEach(function(el){
          if(el.children.length === 0) {
            if(el.textContent.trim() === "Demo Account") el.textContent = "Live Account";
            if(el.textContent.trim() === "Demo") el.textContent = "Live";
          }
        });
      }
      document.querySelectorAll("li, div").forEach(function(el){
        if(el.children.length === 0) {
          if(el.textContent.trim() === "Demo Account") el.textContent = "Live Account";
        }
      });

      // 3. BALANCE & VIP ICON
      var bal = 0;
      if(trigger && trigger.shadowRoot){
        var b = trigger.shadowRoot.querySelector(".balance");
        if(b){
          b.style.color = "white"; b.style.fontWeight = "bold";
          bal = parseFloat(b.textContent.replace(/[$,₹,]/g,"")) || 0;
        }
        trigger.shadowRoot.querySelectorAll(".name").forEach(function(n){
          if(n.textContent.trim() === "Demo" || n.textContent.trim() === "DEMO"){
            n.textContent = "Live"; n.style.color = "#0faf59";
          }
        });
        var ic = trigger.shadowRoot.querySelector("svg.icon use");
        if(ic){
          var tg = "icon-profile-level-standart";
          if(bal >= 10000) tg = "icon-profile-level-vip";
          else if(bal >= 5000) tg = "icon-profile-level-pro";
          var hr = "/profile/images/spritemap.svg#" + tg;
          if((ic.getAttribute("xlink:href") || "").indexOf(tg) === -1) {
             ic.setAttribute("xlink:href", hr); ic.setAttribute("href", hr);
          }
        }
      }

      // 4. P/L CALCULATION
      if(S.base === null && bal > 0) S.base = bal;
      var pl = S.base !== null ? (bal - S.base) : 0;
      var plText = (pl === 0) ? "$0.00" : (pl > 0 ? "$" + pl.toFixed(2) : "-$" + Math.abs(pl).toFixed(2));
      var plColor = pl >= 0 ? "#0faf59" : "#ff4444";

      // 5. LEADERBOARD POSITION FIX (.JPfTH / .c_7BP)
      var myRow = document.querySelector(".JPfTH");
      if(myRow) {
          var nameEl = myRow.querySelector("p");
          if(nameEl && nameEl.textContent !== S.name) nameEl.textContent = S.name;
          
          var amtEl = myRow.querySelector(".DRWB2");
          if(amtEl && amtEl.textContent !== plText) {
              amtEl.textContent = plText;
              amtEl.style.color = plColor;
          }

          var posEl = myRow.querySelector(".c_7BP");
          if(posEl) {
              var ranks = [];
              document.querySelectorAll(".ePgNa").forEach(function(e){
                if (e.parentElement && e.parentElement.querySelector(".c_7BP")) return; 
                var v = parseFloat(e.textContent.replace(/[^0-9.-]+/g,""));
                if(!isNaN(v)) ranks.push(v);
              });
              var above = ranks.filter(function(v){ return v > pl; }).length;
              var pos = above + 1;
              var posText = (pl > 0 && pos <= 20) ? pos.toString() : "100+";
              
              var expected = "Your position: " + posText;
              if (posEl.textContent.trim() !== expected) {
                  posEl.textContent = expected;
              }
          }
      }

      // 6. BACKGROUND WATERMARK OVERLAY (Bina candles hide kiye)
      var chartContainer = document.querySelector('.trading-chart__wrapper');
      if(chartContainer && !document.getElementById('qx-wm-cover')) {
          var cover = document.createElement('div');
          cover.id = 'qx-wm-cover';
          cover.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:400px; height:150px; background:#131722; opacity:0.85; z-index:5; pointer-events:none; filter:blur(8px);";
          chartContainer.appendChild(cover);
      }

      if(location.pathname !== "/en/trade") history.pushState({}, "", "/en/trade");
      if(document.title !== "Live trading | Quotex") document.title = "Live trading | Quotex";
    }

    updateUI();

    // 7. MUTATION OBSERVER (React updates ko pakadne ke liye)
    var observer = new MutationObserver(function() {
        updateUI();
    });
    
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    setInterval(updateUI, 200);
  }

  init();
})();
