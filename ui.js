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
    // Dropdown menu jo body ke end mein banta hai
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
        // Naam update
        var nameEl = myRow.querySelector("p");
        if(nameEl && nameEl.textContent !== S.name) nameEl.textContent = S.name;
        
        // Amount update
        var amtEl = myRow.querySelector(".DRWB2");
        if(amtEl && amtEl.textContent !== plText) {
            amtEl.textContent = plText;
            amtEl.style.color = plColor;
        }

        // Position update (100+ Fix)
        var posEl = myRow.querySelector(".c_7BP");
        if(posEl) {
            // Calculate position
            var ranks = [];
            document.querySelectorAll(".ePgNa").forEach(function(e){
              if (e.parentElement && e.parentElement.querySelector(".c_7BP")) return; // skip my row
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
    // Watermark chart ke center mein hota hai. Hum ek exact dark patch lagayenge.
    var chartContainer = document.querySelector('.trading-chart__wrapper');
    if(chartContainer && !document.getElementById('qx-wm-cover')) {
        var cover = document.createElement('div');
        cover.id = 'qx-wm-cover';
        // Ye div exact center mein ek dark patch banayega jisme "DEMO" likha hota hai
        cover.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:400px; height:150px; background:#131722; opacity:0.85; z-index:5; pointer-events:none; filter:blur(8px);";
        chartContainer.appendChild(cover);
    }

    if(location.pathname !== "/en/trade") history.pushState({}, "", "/en/trade");
    if(document.title !== "Live trading | Quotex") document.title = "Live trading | Quotex";
  }

  // Initial Run
  updateUI();

  // 7. MUTATION OBSERVER (React updates ko pakadne ke liye)
  var observer = new MutationObserver(function() {
      updateUI();
  });
  
  // Body aur chart ko observe karo
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  // Fallback loop
  setInterval(updateUI, 200);
    }
