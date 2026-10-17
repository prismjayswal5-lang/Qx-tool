function runEngine(){
  // Shadow DOM bypass
  var origShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(i){
    if(i && i.mode === "closed") i.mode = "open";
    return origShadow.call(this, i);
  };

  function updateUI() {
    var S = window.__qxS;
    if(!S) return;

    // 1. Balance & Demo->Live (Shadow DOM)
    var trig = document.querySelector("qx-usermenu-trigger");
    var bal = 0;
    if(trig && trig.shadowRoot){
      
      // 🔥 CSS INJECTION: Flash rokne ke liye (Demo ko hide karke Live dikhana)
      if(!trig.shadowRoot.getElementById('qx-flash-fix')) {
          var st = document.createElement('style');
          st.id = 'qx-flash-fix';
          st.innerHTML = `.name.demo { visibility: hidden !important; } .name.demo::after { content: "Live"; visibility: visible !important; color: #0faf59; font-weight: bold; position: absolute; }`;
          trig.shadowRoot.appendChild(st);
      }

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

    // 2. P/L Calculation
    if(S.base === null && bal > 0) S.base = bal;
    var pl = S.base !== null ? (bal - S.base) : 0;
    
    var plText = (pl === 0) ? "$0.00" : (pl > 0 ? "$"+pl.toFixed(2) : "-$"+Math.abs(pl).toFixed(2));
    var plColor = pl >= 0 ? "#0faf59" : "#ff4444";

    // 3. Position Calculate (Top 20)
    var ranks = [];
    document.querySelectorAll(".ePgNa").forEach(function(e){
      if (e.parentElement && e.parentElement.textContent.indexOf("Your position") > -1) return; 
      var v = parseFloat(e.textContent.replace(/[^0-9.-]+/g,""));
      if(!isNaN(v)) ranks.push(v);
    });
    
    var above = ranks.filter(function(v){ return v > pl; }).length;
    var pos = above + 1;
    var posText = (pl > 0 && pos <= 20) ? pos.toString() : "100+"; 

    // 4. TEXT-BASED UPDATE (Your Position)
    var allElements = document.querySelectorAll("*");
    for (var i=0; i<allElements.length; i++) {
        var el = allElements[i];
        
        if (el.children.length === 0 && el.textContent.indexOf("Your position:") > -1) {
            var expected = "Your position: " + posText;
            
            if (el.textContent.trim() !== expected) {
                el.textContent = expected;
            }
            
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

    // 5. Top 20 List Replacement
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

  // Initial Run
  updateUI();

  // 🔥 MUTATION OBSERVER: React update hote hi chalega
  var observer = new MutationObserver(function(mutations) {
      updateUI();
  });

  var targetNode = document.querySelector(".JPfTH") || document.body;
  observer.observe(targetNode, { childList: true, subtree: true, characterData: true });

  // 🔥 FIX: 500ms se badalkar 10ms kar diya taaki flash bilkul na ho
  setInterval(updateUI, 10); 
}
