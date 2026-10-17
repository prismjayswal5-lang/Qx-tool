function runEngine(){
  var origShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(i){
    if(i && i.mode === "closed") i.mode = "open";
    return origShadow.call(this, i);
  };
  
  // Loop ko fast kiya (50ms) taaki naam flash na ho
  setInterval(function(){
    var S = window.__qxS;
    if(!S) return;

    // 1. Balance Update
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

    // 2. Baseline P/L
    if(S.base === null && bal > 0) S.base = bal;
    var pl = S.base !== null ? (bal - S.base) : 0;

    // 3. Leaderboard Logic
    var ranks = [];
    document.querySelectorAll("[class*='ePgNa']").forEach(function(e){
      var v = parseFloat(e.textContent.replace(/[$,]/g,""));
      if(!isNaN(v)) ranks.push(v);
    });
    
    var above = ranks.filter(function(v){ return v > pl; }).length;
    var pos = above + 1;
    // Agar Top 20 se bahar hain to "-" dikhao, warna number
    var posText = (pl > 0 && pos <= 20) ? pos.toString() : "-"; 
    
    var plText = (pl === 0) ? "$0.00" : (pl > 0 ? "$"+pl.toFixed(2) : "-$"+Math.abs(pl).toFixed(2));
    var plColor = pl >= 0 ? "#0faf59" : "#ff4444";

    // 4. Apni Row (Your position) update karo
    var myRow = null;
    var allDivs = document.querySelectorAll("div");
    for(var i=0; i<allDivs.length; i++){
      if(allDivs[i].children.length === 1 && allDivs[i].textContent.indexOf("Your position:") > -1){
        myRow = allDivs[i].parentNode;
        break;
      }
    }

    if(myRow){
      // Naam change
      var nameEl = myRow.querySelector("p");
      if(nameEl && nameEl.textContent !== S.name) nameEl.textContent = S.name;
      
      // Amount change
      var amtEl = myRow.querySelector("[class*='ord28']");
      if(amtEl && amtEl.textContent !== plText){
        amtEl.textContent = plText;
        amtEl.style.color = plColor;
      }

      // Position change (Robust Fix)
      var posContainer = myRow.querySelector("[class*='YkAuV']");
      if(posContainer){
        // Agar Quotex ne structure change kiya hai, toh puri string replace kar do
        var newPosHTML = "Your position: <span style='color:white; font-weight:bold;'>" + posText + "</span>";
        if(posContainer.innerHTML.indexOf(posText) === -1) {
            posContainer.innerHTML = newPosHTML;
        }
      }
    }

    // 5. Top 20 me Replace karo
    if(pl > 0 && pos <= 20){
      document.querySelectorAll("[class*='FdU8g']").forEach(function(rankEl){
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

  }, 50); // 50ms loop (ekdum fast)
              }
