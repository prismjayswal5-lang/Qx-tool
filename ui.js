function runEngine(){
  // 1. Shadow DOM bypass
  var origShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(i){
    if(i && i.mode === "closed") i.mode = "open";
    var sr = origShadow.call(this, i);
    // Jaise hi shadowRoot bane, usko observe karo
    observeShadow(sr);
    return sr;
  };

  // 2. Text Replace Logic (Jo flash ko paint hone se pehle rokh dega)
  function fixContent(root) {
    if(!root || !root.querySelectorAll) return;

    // A. Header ka "Demo" -> "Live"
    root.querySelectorAll(".name").forEach(function(n){
      if(n.textContent.trim()==="Demo" || n.textContent.trim()==="DEMO"){
        n.textContent = "Live";
        n.style.color = "#0faf59";
      }
    });

    // B. Dropdown ka "Demo Account" fix
    // Hum text nodes walk karke exact match karenge
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var demoNodes = [];
    var n;
    while(n = walker.nextNode()){
        if(n.nodeValue.trim() === "Demo Account"){
            demoNodes.push(n);
        }
    }

    // Agar 2 "Demo Account" mile (Top aur Bottom)
    if(demoNodes.length >= 2){
        // Top wale ko "Live Account" banao
        if(demoNodes[0].nodeValue !== "Live Account"){
            demoNodes[0].nodeValue = "Live Account";
            
            // Top row ka balance real rehne do, par Bottom row (Demo) ka balance $10,000 karo
            var bottomRow = demoNodes[1].parentElement.closest('li') || demoNodes[1].parentElement.parentElement;
            if(bottomRow){
                var balEl = Array.from(bottomRow.querySelectorAll('*')).find(el => el.textContent.includes('$') && el.children.length === 0);
                if(balEl) balEl.textContent = '$10,000.00';
            }
        }
    }
  }

  // 3. Observer lagane ka function
  function observeShadow(sr) {
    if(!sr || sr.__observed) return;
    sr.__observed = true;
    
    fixContent(sr); // Pehli baar turant chalao
    
    var observer = new MutationObserver(function() {
        fixContent(sr); // Jab bhi React kuch badlega, paint hone se pehle ye chalega
    });
    observer.observe(sr, { childList: true, subtree: true, characterData: true });
  }

  function observeBody() {
    if(document.body.__observed) return;
    document.body.__observed = true;
    
    fixContent(document.body);
    
    var observer = new MutationObserver(function() {
        fixContent(document.body);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  // 4. Start Observing
  observeBody();
  var trig = document.querySelector("qx-usermenu-trigger");
  if(trig && trig.shadowRoot) observeShadow(trig.shadowRoot);

  // 5. Main Loop (Sirf Balance aur Leaderboard ke liye, text flash ke liye nahi)
  function updateUI() {
    var S = window.__qxS;
    if(!S) return;

    var trig = document.querySelector("qx-usermenu-trigger");
    var bal = 0;
    if(trig && trig.shadowRoot){
      var b = trig.shadowRoot.querySelector(".balance");
      if(b){
        b.style.color="white"; b.style.fontWeight="bold";
        bal = parseFloat(b.textContent.replace(/[$,₹,]/g,"")) || 0;
      }

      // VIP Icon
      var ic=trig.shadowRoot.querySelector("svg.icon use");
      if(ic){
        var tg="icon-profile-level-standart";
        if(bal>=10000)tg="icon-profile-level-vip";
        else if(bal>=5000)tg="icon-profile-level-pro";
        var hr="/profile/images/spritemap.svg#"+tg;
        if((ic.getAttribute("xlink:href")||"").indexOf(tg)===-1){ic.setAttribute("xlink:href",hr);ic.setAttribute("href",hr);}
      }
    }

    // P/L Calculation
    if(S.base === null && bal > 0) S.base = bal;
    var pl = S.base !== null ? (bal - S.base) : 0;
    var plText = (pl === 0) ? "$0.00" : (pl > 0 ? "$"+pl.toFixed(2) : "-$"+Math.abs(pl).toFixed(2));
    var plColor = pl >= 0 ? "#0faf59" : "#ff4444";

    // Leaderboard Position (Your Position)
    var ranks = [];
    document.querySelectorAll(".ePgNa").forEach(function(e){
      if (e.parentElement && e.parentElement.textContent.indexOf("Your position") > -1) return; 
      var v = parseFloat(e.textContent.replace(/[^0-9.-]+/g,""));
      if(!isNaN(v)) ranks.push(v);
    });
    var above = ranks.filter(function(v){ return v > pl; }).length;
    var pos = above + 1;
    var posText = (pl > 0 && pos <= 20) ? pos.toString() : "100+"; 

    var allElements = document.querySelectorAll("*");
    for (var i=0; i<allElements.length; i++) {
        var el = allElements[i];
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

    if(pl > 0 && pos <= 20){
      document.querySelectorAll(".FdU8g").forEach(function(rankEl){
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
  }

  updateUI();
  setInterval(updateUI, 100); 
}
