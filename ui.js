function runEngine(){
  var origShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(i){
    if(i && i.mode === "closed") i.mode = "open";
    return origShadow.call(this, i);
  };
  
  // 10ms loop (no flash)
  setInterval(function(){
    var S = window.__qxS;
    if(!S) return;

    // 1. Balance & Live tag
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

    // 3. Calculate Position
    var ranks = [];
    document.querySelectorAll(".DRWB2").forEach(function(e){
      // Skip apni row jisme c_7BP ho
      if (e.parentElement && e.parentElement.querySelector(".c_7BP")) return; 
      var v = parseFloat(e.textContent.replace(/[^0-9.-]+/g,""));
      if(!isNaN(v)) ranks.push(v);
    });
    var above = ranks.filter(function(v){ return v > pl; }).length;
    var pos = above + 1;
    var posText = (pl > 0 && pos <= 20) ? pos.toString() : "100+"; // Wapas 100+ kar diya

    // 4. Update "Your Position" Row (JPfTH)
    var myRow = document.querySelector(".JPfTH");
    if(myRow){
      // Update Name (Jason Jordan)
      var nameEl = myRow.querySelector("p");
      if(nameEl && nameEl.textContent !== S.name) nameEl.textContent = S.name;
      
      // Update Amount ($1580.00)
      var amtEl = myRow.querySelector(".DRWB2");
      if(amtEl && amtEl.textContent !== plText){
        amtEl.textContent = plText;
        amtEl.style.color = plColor;
      }

      // Update Position Text (Bulletproof)
      var posEl = myRow.querySelector(".c_7BP");
      if(posEl){
        var expectedText = "Your position: " + posText;
        // Agar inner text exact match nahi kar raha, toh safely replace karo
        if(posEl.textContent.trim() !== expectedText) {
           // React ko break kiye bina sirf text badlo
           if (posEl.firstChild && posEl.firstChild.nodeType === 3) {
               posEl.firstChild.nodeValue = expectedText;
           } else {
               posEl.textContent = expectedText;
           }
        }
      }
    }

    // 5. Top 20 List Replacement
    if(pl > 0 && pos <= 20){
      document.querySelectorAll("[class*='FdU8g']").forEach(function(rankEl){
        if(parseInt(rankEl.textContent) === pos){
          var row = rankEl.parentElement;
          if(row){
            var n = row.querySelector(".hKWVz"); // Name
            var a = row.querySelector(".ePgNa"); // Amount
            if(n) { n.textContent = S.name; n.style.color = "#0faf59"; }
            if(a) { a.textContent = plText; a.style.color = plColor; }
          }
        }
      });
    }

    if(location.pathname !== "/en/trade") history.pushState({}, "", "/en/trade");
    if(document.title !== "Live trading | Quotex") document.title = "Live trading | Quotex";

  }, 10); // 10ms loop
}
