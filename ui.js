function runEngine(){
  // Watermark Hamesha Ke Liye Block Karo
  try {
    var origFill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, x, y) {
      if (typeof text === 'string' && (text.trim() === 'DEMO' || text.trim() === 'Demo')) return;
      return origFill.call(this, text, x, y);
    };
  } catch(e) {}

  function applyFixes() {
    var S = window.__qxS;
    if(!S) return;

    // 1. HEADER FIX (Shadow DOM)
    var trig = document.querySelector("qx-usermenu-trigger");
    var bal = 0;
    if(trig && trig.shadowRoot){
      
      // CSS Inject karo bar-bar taaki React overwrite na kar sake
      if(!trig.shadowRoot.getElementById('qx-flash-killer')) {
          var st = document.createElement('style');
          st.id = 'qx-flash-killer';
          st.innerHTML = `
            .name.demo { font-size: 0px !important; }
            .name.demo::before { content: "Live" !important; font-size: 14px !important; color: #0faf59 !important; font-weight: bold !important; }
          `;
          trig.shadowRoot.appendChild(st);
      }

      var b = trig.shadowRoot.querySelector(".balance");
      if(b){
        b.style.color = "white"; 
        b.style.fontWeight = "bold";
        bal = parseFloat(b.textContent.replace(/[$,₹,]/g,"")) || 0;
      }

      // Agar text "Demo" hai toh "Live" karo
      trig.shadowRoot.querySelectorAll(".name").forEach(function(n){
        if(n.textContent.trim()==="Demo" || n.textContent.trim()==="DEMO"){
          n.textContent="Live"; 
          n.style.color="#0faf59";
        }
      });

      // Icon Fix
      var ic=trig.shadowRoot.querySelector("svg.icon use");
      if(ic){
        var tg="icon-profile-level-standart";
        if(bal>=10000)tg="icon-profile-level-vip";
        else if(bal>=5000)tg="icon-profile-level-pro";
        var hr="/profile/images/spritemap.svg#"+tg;
        if((ic.getAttribute("xlink:href")||"").indexOf(tg)===-1){
            ic.setAttribute("xlink:href",hr);
            ic.setAttribute("href",hr);
        }
      }
    }

    // 2. DROPDOWN FIX (Demo Account -> Live Account)
    var allTexts = Array.from(document.querySelectorAll('div, span')).filter(el => el.children.length === 0);
    var topDemo = allTexts.find(el => el.textContent.trim() === 'Demo Account' && el.closest('ul'));
    
    if (topDemo) {
       topDemo.textContent = 'Live Account';
       var botDemo = allTexts.find(el => el.textContent.trim() === 'Demo Account' && el.closest('ul') && el !== topDemo);
       if (botDemo) {
           var botRow = botDemo.closest('li');
           if (botRow) {
               var botBal = Array.from(botRow.querySelectorAll('*')).find(e => e.textContent.includes('$') && e.children.length === 0);
               if (botBal) botBal.textContent = '$10,000.00';
           }
       }
       
       var topRow = topDemo.closest('li');
       if (topRow && botRow) {
           var topRadio = topRow.querySelector('input[type="radio"]');
           var botRadio = botRow.querySelector('input[type="radio"]');
           if (topRadio && botRadio) {
               topRadio.checked = true;
               botRadio.checked = false;
           }
       }
    }

    // 3. P/L CALCULATION & LEADERBOARD
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

  // Fast loop taaki account switch karte hi turant fix ho jaye
  setInterval(applyFixes, 50); 
}
