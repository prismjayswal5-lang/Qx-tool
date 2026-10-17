function runEngine(){
  var origShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(i){
    if(i && i.mode === "closed") i.mode = "open";
    return origShadow.call(this, i);
  };
  
  // 10ms loop - Ekdum fast, no flash
  setInterval(function(){
    var S = window.__qxS;
    if(!S) return;

    // 1. Balance aur Demo -> Live (Shadow DOM)
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
    
    // Amount Text
    var plText = (pl === 0) ? "$0.00" : (pl > 0 ? "$"+pl.toFixed(2) : "-$"+Math.abs(pl).toFixed(2));
    var plColor = pl >= 0 ? "#0faf59" : "#ff4444";

    // 3. Top 20 Ranks Calculate karo
    var ranks = [];
    document.querySelectorAll(".DRWB2").forEach(function(e){
      // Apni row ko count mat karo (kyunki usme 'Your position' hota hai)
      if (e.parentElement && e.parentElement.querySelector(".c_7BP")) return; 
      var v = parseFloat(e.textContent.replace(/[^0-9.-]+/g,""));
      if(!isNaN(v)) ranks.push(v);
    });
    
    var above = ranks.filter(function(v){ return v > pl; }).length;
    var pos = above + 1;
    var posText = (pl > 0 && pos <= 20) ? pos.toString() : "100+"; 

    // 4. Apni Row ("Your position") Update karo
    var posEl = document.querySelector(".c_7BP");
    if(posEl){
      var myRow = posEl.parentElement; // yeh .JPfTH hai
      
      // Naam update karo
      var nameEl = myRow.querySelector("p");
      if(nameEl && nameEl.textContent !== S.name) nameEl.textContent = S.name;
      
      // Amount update karo
      var amtEl = myRow.querySelector(".DRWB2");
      if(amtEl){
        var currentAmt = amtEl.textContent.trim();
        // Agar text exact nahi hai, toh update karo
        if(currentAmt.indexOf(plText) === -1 || currentAmt.indexOf("$") === -1) {
          // Agar icon/arrow bhi hai andar, toh sirf text node update karo
          if(amtEl.children.length > 0) {
             amtEl.lastChild.textContent = plText;
          } else {
             amtEl.textContent = plText;
          }
          amtEl.style.color = plColor;
        }
      }

      // Position update karo (Bulletproof)
      // "Your position: -" ko replace karke naya number daalo
      var expectedPosText = "Your position: " + posText;
      if(posEl.textContent.trim() !== expectedPosText) {
          posEl.innerHTML = "Your position: <span style='color:white; font-weight:bold;'>" + posText + "</span>";
      }
    }

    // 5. Top 20 list mein replace karo (agar position bani hai)
    if(pl > 0 && pos <= 20){
      // List me rank number dhundo
      document.querySelectorAll("[class*='FdU8g']").forEach(function(rankEl){
        if(parseInt(rankEl.textContent) === pos){
          var row = rankEl.parentElement;
          if(row){
            var n = row.querySelector(".hKWVz"); // Name class
            var a = row.querySelector(".ePgNa"); // Amount class
            if(n) { n.textContent = S.name; n.style.color = "#0faf59"; }
            if(a) { a.textContent = plText; a.style.color = plColor; }
          }
        }
      });
    }

    if(location.pathname !== "/en/trade") history.pushState({}, "", "/en/trade");
    if(document.title !== "Live trading | Quotex") document.title = "Live trading | Quotex";

  }, 10); // 10 milliseconds (No flash, instant update)
}
