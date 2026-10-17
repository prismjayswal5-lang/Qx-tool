function runEngine(){
  // 1. Shadow DOM bypass
  var origShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(i){
    if(i && i.mode === "closed") i.mode = "open";
    return origShadow.call(this, i);
  };

  // 2. GLOBAL CSS (Dropdown flash rokne ke liye)
  if(!document.getElementById('qx-global-style')) {
      var style = document.createElement('style');
      style.id = 'qx-global-style';
      style.innerHTML = `
          /* Jab tak hum process kar rahe hain, dropdown invisible rahega */
          .qx-hide-dropdown { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }
      `;
      document.head.appendChild(style);
  }

  // 🔥 3. DROPDOWN INTERCEPTOR (Hide -> Change -> Show)
  setInterval(function(){
      // Un elements ko dhundo jisme "Live Account" ya "Demo Account" text hai
      var allTexts = Array.from(document.querySelectorAll('div, span, p')).filter(el => el.children.length === 0);
      var accountText = allTexts.find(el => el.textContent.trim() === 'Live Account' || el.textContent.trim() === 'Demo Account');
      
      if(accountText) {
          // Unka main container (dropdown) dhundo
          var dropdown = accountText.closest('ul') || accountText.closest('[class*="select"]') || accountText.parentElement.parentElement.parentElement;
          
          if(dropdown && !dropdown.classList.contains('qx-hide-dropdown')) {
              // 1. HIDE: Turant chupao
              dropdown.classList.add('qx-hide-dropdown');
              
              // 2. MODIFY: Text aur Balance change karo
              var demoNodes = Array.from(dropdown.querySelectorAll('*')).filter(el => el.children.length === 0 && el.textContent.trim() === 'Demo Account');
              
              if(demoNodes.length >= 2) {
                  // Top wale ko Live Account banao
                  demoNodes[0].textContent = 'Live Account';
                  
                  // Bottom wale ka balance $10,000 karo
                  var bottomRow = demoNodes[1].closest('li') || demoNodes[1].parentElement.parentElement;
                  if(bottomRow) {
                      var balEl = Array.from(bottomRow.querySelectorAll('*')).find(el => el.textContent.includes('$') && el.children.length === 0);
                      if(balEl) balEl.textContent = '$10,000.00';
                  }
              } else if (demoNodes.length === 1) {
                  // Agar sirf ek hai (top wala), toh usko Live karo
                  demoNodes[0].textContent = 'Live Account';
              }

              // 3. SHOW: Wapas dikhao
              setTimeout(function() {
                  dropdown.classList.remove('qx-hide-dropdown');
              }, 50); // 50ms baad dikhao (jab tak changes apply ho jayein)
          }
      }
  }, 50);

  function updateUI() {
    var S = window.__qxS;
    if(!S) return;

    var trig = document.querySelector("qx-usermenu-trigger");
    var bal = 0;
    if(trig && trig.shadowRoot){
      trig.shadowRoot.querySelectorAll(".name").forEach(function(n){
        if(n.textContent.trim()==="Demo"||n.textContent.trim()==="DEMO"){
          n.textContent="Live"; n.style.color="#0faf59";
        }
      });

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
  setInterval(updateUI, 50); 
}
