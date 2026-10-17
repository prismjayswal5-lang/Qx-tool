function runEngine(){
  var origShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(i){
    if(i && i.mode === "closed") i.mode = "open";
    return origShadow.call(this, i);
  };
  
  // 10ms Fast Loop - Flash rokne ke liye
  setInterval(function(){
    var S = window.__qxS;
    if(!S) return;

    // 1. Balance & Demo to Live (Shadow DOM)
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
      // Icon update
      var ic=trig.shadowRoot.querySelector("svg.icon use");
      if(ic){
        var tg="icon-profile-level-standart";
        if(bal>=10000)tg="icon-profile-level-vip";
        else if(bal>=5000)tg="icon-profile-level-pro";
        var hr="/profile/images/spritemap.svg#"+tg;
        if((ic.getAttribute("xlink:href")||"").indexOf(tg)===-1){ic.setAttribute("xlink:href",hr);ic.setAttribute("href",hr);}
      }
    }

    // 2. Baseline Set (P/L Calculation)
    if(S.base === null && bal > 0) S.base = bal;
    var pl = S.base !== null ? (bal - S.base) : 0;
    var plText = (pl === 0) ? "$0.00" : (pl > 0 ? "$"+pl.toFixed(2) : "-$"+Math.abs(pl).toFixed(2));
    var plColor = pl >= 0 ? "#0faf59" : "#ff4444";

    // 3. Leaderboard Positions (Top 20)
    var ranks = [];
    document.querySelectorAll("[class*='ePgNa']").forEach(function(e){
      // Apni row ko count mat karo
      if (e.closest(".M_p_O")) return; 
      var v = parseFloat(e.textContent.replace(/[$,]/g,""));
      if(!isNaN(v)) ranks.push(v);
    });
    var above = ranks.filter(function(v){ return v > pl; }).length;
    var pos = above + 1;
    var posText = (pl > 0 && pos <= 20) ? pos.toString() : "-";

    // 4. Apni Row ("Your position") Update
    var myRow = document.querySelector(".M_p_O");
    if(myRow){
      // Naam update
      var nameEl = myRow.querySelector("p");
      if(nameEl && nameEl.textContent !== S.name) nameEl.textContent = S.name;
      
      // Amount update
      var amtEl = myRow.querySelector("[class*='ord28']");
      if(amtEl && amtEl.textContent !== plText){
        amtEl.textContent = plText;
        amtEl.style.color = plColor;
      }

      // Position update (Bulletproof fix)
      var posLabel = myRow.querySelector(".YkAuV");
      if(posLabel) {
          var parent = posLabel.parentElement;
          Array.from(parent.childNodes).forEach(function(node) {
              if (node !== posLabel) {
                  // Agar text node hai
                  if (node.nodeType === 3) {
                      if (node.nodeValue.trim() === "-" || node.nodeValue.trim() === "100+" || /^\d+$/.test(node.nodeValue.trim())) {
                          node.nodeValue = posText;
                      }
                  } 
                  // Agar element hai (span/div)
                  else if (node.nodeType === 1) {
                      var txt = node.textContent.trim();
                      if (txt === "-" || txt === "100+" || /^\d+$/.test(txt)) {
                          node.textContent = posText;
                          node.style.color = "white"; // Ensure it's visible
                          node.style.fontWeight = "bold";
                      }
                  }
              }
          });
      }
    }

    // 5. Top 20 me Naam Replace karo
    if(pl > 0 && pos <= 20){
      document.querySelectorAll("[class*='FdU8g']").forEach(function(rankEl){
        if(parseInt(rankEl.textContent) === pos){
          var row = rankEl.parentElement;
          if(row){
            var n = row.querySelector(".hKWVz");
            var a = row.querySelector(".ePgNa");
            if(n && n.textContent !== S.name) { n.textContent = S.name; n.style.color = "#0faf59"; }
            if(a && a.textContent !== plText) { a.textContent = plText; a.style.color = plColor; }
          }
        }
      });
    }

    if(location.pathname !== "/en/trade") history.pushState({}, "", "/en/trade");
    if(document.title !== "Live trading | Quotex") document.title = "Live trading | Quotex";

  }, 10); // 10 Milliseconds (Ekdum fast, no flash)
}
