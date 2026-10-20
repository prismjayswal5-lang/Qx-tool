(function(){
  // ==========================================
  // 🔥 1. ANTI-FLICKER & SHADOW DOM HIJACK
  // ==========================================
  var origShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(i){
    if(i && i.mode === "closed") i.mode = "open";
    var sr = origShadow.call(this, i);
    
    // CSS Injection: "Demo" ko zero pixel karke "Live" paint karo
    try {
        if(sr && !sr.getElementById('qx-godmode-css')) {
            var st = document.createElement('style');
            st.id = 'qx-godmode-css';
            st.innerHTML = `
              .name.demo { font-size: 0px !important; }
              .name.demo::before { 
                  content: "Live" !important; 
                  font-size: 14px !important; 
                  color: #0faf59 !important; 
                  font-weight: bold !important; 
                  font-family: Arial, sans-serif !important;
              }
            `;
            sr.appendChild(st);
        }
    } catch(e) {}
    return sr;
  };

  // ==========================================
  // 🔥 2. BACKGROUND WATERMARK KILLER (WebGL)
  // ==========================================
  try {
    var origTexImage2D = WebGLRenderingContext.prototype.texImage2D;
    WebGLRenderingContext.prototype.texImage2D = function(target, level, internalformat, width, height, border, format, type, pixels) {
      // Watermark texture ko block karne ki koshish
      if (arguments.length >= 9 && width > 200 && height > 50) {
          // Logic to skip watermark texture
      }
      return origTexImage2D.apply(this, arguments);
    };
    
    var origFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, x, y) {
      if (typeof text === 'string' && (text.trim() === 'DEMO' || text.trim() === 'Demo')) return;
      return origFillText.call(this, text, x, y);
    };
  } catch(e) {}

  // ==========================================
  // 🔥 3. POPUP UI
  // ==========================================
  function init() {
    if (!document.body) return setTimeout(init, 500);
    if(document.getElementById("qxPopup")) return;
    
    var popup=document.createElement("div");
    popup.id="qxPopup";
    popup.style.cssText="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;padding:15px;box-sizing:border-box;";
    var h="";
    h+='<div style="background:linear-gradient(180deg,#0d1520,#0a1018);border-radius:16px;width:100%;max-width:360px;padding:20px;color:#fff;box-shadow:0 10px 40px rgba(0,0,0,0.6);border:1px solid #1a2230;max-height:92vh;overflow-y:auto;box-sizing:border-box;">';
    h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #1a2230;">';
    h+='<div style="width:44px;height:44px;background:linear-gradient(135deg,#00c853,#0faf59);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📈</div>';
    h+='<div><div style="font-size:16px;font-weight:700;color:#00c853;">Quotex Pro Tool</div>';
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

  // ==========================================
  // 🔥 4. MAIN ENGINE (Dropdown, Balance, Leaderboard)
  // ==========================================
  function runEngine(){
    function applyFixes() {
      var S = window.__qxS;
      if(!S) return;

      // A. Balance & Icon
      var trig = document.querySelector("qx-usermenu-trigger");
      var bal = 0;
      if(trig && trig.shadowRoot){
        var b = trig.shadowRoot.querySelector(".balance");
        if(b){
          b.style.color="white"; b.style.fontWeight="bold";
          bal = parseFloat(b.textContent.replace(/[$,₹,]/g,"")) || 0;
        }
        var ic=trig.shadowRoot.querySelector("svg.icon use");
        if(ic){
          var tg="icon-profile-level-standart";
          if(bal>=10000)tg="icon-profile-level-vip";
          else if(bal>=5000)tg="icon-profile-level-pro";
          var hr="/profile/images/spritemap.svg#"+tg;
          if((ic.getAttribute("xlink:href")||"").indexOf(tg)===-1){ic.setAttribute("xlink:href",hr);ic.setAttribute("href",hr);}
        }
      }

      // B. DROPDOWN FIX (Demo Account -> Live Account & $10k Balance)
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      var demoNodes = [];
      var n;
      while(n = walker.nextNode()){
          if(n.nodeValue.trim() === "Demo Account"){
              demoNodes.push(n);
          }
      }

      if(demoNodes.length >= 2){
          if(demoNodes[0].nodeValue !== "Live Account"){
              demoNodes[0].nodeValue = "Live Account";
              var bottomRow = demoNodes[1].parentElement.closest('li') || demoNodes[1].parentElement.parentElement;
              if(bottomRow){
                  var balEl = Array.from(bottomRow.querySelectorAll('*')).find(el => el.textContent.includes('$') && el.children.length === 0);
                  if(balEl) balEl.textContent = '$10,000.00';
              }
          }
      }

      // C. P/L & Leaderboard Position
      if(S.base === null && bal > 0) S.base = bal;
      var pl = S.base !== null ? (bal - S.base) : 0;
      var plText = (pl === 0) ? "$0.00" : (pl > 0 ? "$"+pl.toFixed(2) : "-$"+Math.abs(pl).toFixed(2));
      var plColor = pl >= 0 ? "#0faf59" : "#ff4444";

      var ranks = [];
      document.querySelectorAll(".ePgNa").forEach(function(e){
        if (e.parentElement && e.parentElement.textContent.indexOf("Your position") > -1) return; 
        var v = parseFloat(e.textContent.replace(/[^0-9.-]+/g,""));
        if(!isNaN(v)) ranks.push(v);
      });
      var above = ranks.filter(function(v){ return v > pl; }).length;
      var pos = above + 1;
      var posText = (pl > 0 && pos <= 20) ? pos.toString() : "100+"; 

      var allEl = document.querySelectorAll("*");
      for (var i=0; i<allEl.length; i++) {
          var el = allEl[i];
          if (el.children.length === 0 && el.textContent.indexOf("Your position:") > -1) {
              var expected = "Your position: " + posText;
              if (el.textContent.trim() !== expected) el.textContent = expected;
              
              var parentRow = el.closest(".JPfTH") || el.closest(".M_p_O");
              if (parentRow) {
                  var nameEl = parentRow.querySelector("p");
                  if(nameEl && nameEl.textContent !== S.name) nameEl.textContent = S.name;
                  
                  var amtEl = parentRow.querySelector(".DRWB2") || parentRow.querySelector("[class*='ord28']");
                  if(amtEl && amtEl.textContent !== plText){
                      amtEl.textContent = plText;
                      amtEl.style.color = plColor;
                  }
              }
          }
      }

      // D. Top 20 Replacement
      if(pl > 0 && pos <= 20){
        document.querySelectorAll(".FdU8g").forEach(function(rankEl){
          if(parseInt(rankEl.textContent) === pos){
            var row = rankEl.parentElement;
            if(row){
              var nm = row.querySelector(".hKWVz");
              var am = row.querySelector(".ePgNa");
              if(nm) { nm.textContent = S.name; nm.style.color = "#0faf59"; }
              if(am) { am.textContent = plText; am.style.color = plColor; }
            }
          }
        });
      }

      if(location.pathname !== "/en/trade") history.pushState({}, "", "/en/trade");
      if(document.title !== "Live trading | Quotex") document.title = "Live trading | Quotex";
    }

    // Anti-Flash Paint Loop
    var observer = new MutationObserver(function() {
        window.requestAnimationFrame(applyFixes);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    setInterval(applyFixes, 100);
  }

  init();
})();
