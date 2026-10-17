function runEngine(){
  // 1. Shadow DOM bypass
  var origShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(i){
    if(i && i.mode === "closed") i.mode = "open";
    var sr = origShadow.call(this, i);
    
    // 🔥 CSS INJECTION (Flash Rokne Ka Asli Tarika)
    // Jaise hi Shadow DOM bane, hum turant usme CSS daal denge
    try {
        if(!sr.getElementById('qx-css-godmode')) {
            var st = document.createElement('style');
            st.id = 'qx-css-godmode';
            st.innerHTML = `
              /* Demo text ko 0px ka kar do (invisible) */
              .name.demo { font-size: 0px !important; }
              /* Uski jagah CSS se Live print kar do */
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

  // 2. TEXT INTERCEPTOR (Backup ke liye)
  if(!window.__qxTextHooked) {
    window.__qxTextHooked = true;
    var nvDesc = Object.getOwnPropertyDescriptor(Node.prototype, 'nodeValue');
    Object.defineProperty(Node.prototype, 'nodeValue', {
        set: function(val) {
            if ((val === 'Demo' || val === 'DEMO') && this.parentElement && String(this.parentElement.className).indexOf('name') > -1) {
                val = 'Live';
            }
            return nvDesc.set.call(this, val);
        },
        get: function() { return nvDesc.get.call(this); }
    });
  }

  function updateUI() {
    var S = window.__qxS;
    if(!S) return;

    var trig = document.querySelector("qx-usermenu-trigger");
    var bal = 0;
    if(trig && trig.shadowRoot){
      
      // Shadow DOM me purana 'Demo' text hai toh badal do
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

      // VIP Icon logic
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
  setInterval(updateUI, 10); 
}
