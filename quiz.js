/* ===========================================================
   Shared quiz engine — every quiz links this one file.
   Edit here to change how ALL quizzes behave.

   Each quiz page just defines, before loading this script:
     window.QUIZ = {
       storeKey: "y8-negatives",          // unique per quiz
       questions: [
         { q:"-6 × 4", answer:"-24",
           options:["-24","24","-2","10"],
           why:"short explanation shown after answering" },
         ...
       ]
     };

   Optional per question — a data table rendered below the
   question text. First row and first column are headers.
   Use "?" for a highlighted missing cell.
     { q:"What goes in the highlighted cell?",
       table:[["","Sat","Sun"],["Alan","20","22"],["Total","?","37"]],
       ... }

   Optional per question — a simple chart (SVG, drawn here):
     { q:"What was the range?",
       chart:{ type:"line",            // or "bar"
               labels:["Mon","Tue"],   // x-axis categories
               values:[31,33],         // one value per label
               xLabel:"Day", yLabel:"Speed (knots)" },
       ... }
   =========================================================== */
(function(){
  "use strict";
  function run(){
    var CFG = window.QUIZ || {questions:[]};
    var DATA = CFG.questions || [];
    var STORE_KEY = "quizbest-" + (CFG.storeKey || "default");
    var TOTAL = DATA.length;
    var KEYS = ["A","B","C","D","E","F"];
    var order=[], idx=0, score=0, locked=false;

    var el = {
      quiz:g("quiz"), counter:g("counter"), running:g("runningScore"), bar:g("barFill"),
      qnum:g("qnum"), question:g("question"), options:g("options"),
      feedback:g("feedback"), verdict:g("verdict"), why:g("why"), next:g("nextBtn"),
      result:g("result"), finalScore:g("finalScore"), resultMsg:g("resultMsg"),
      bestLine:g("bestLine"), again:g("againBtn"), outOf:g("outOf")
    };
    function g(id){return document.getElementById(id);}

    function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
    function getBest(){try{var v=localStorage.getItem(STORE_KEY);return v===null?null:parseInt(v,10);}catch(e){return null;}}
    function setBest(v){try{localStorage.setItem(STORE_KEY,String(v));}catch(e){}}

    function renderTable(item){
      var old=g("qtable");
      if(old)old.parentNode.removeChild(old);
      if(!item.table)return;
      var wrap=document.createElement("div");
      wrap.id="qtable";wrap.className="qtable-wrap";
      var t=document.createElement("table");t.className="qtable";
      item.table.forEach(function(row,r){
        var tr=document.createElement("tr");
        row.forEach(function(cell,c){
          var cellEl=document.createElement((r===0||c===0)?"th":"td");
          if(cell==="?")cellEl.className="missing";
          cellEl.textContent=cell;
          tr.appendChild(cellEl);
        });
        t.appendChild(tr);
      });
      wrap.appendChild(t);
      el.question.insertAdjacentElement("afterend",wrap);
    }

    function renderChart(item){
      var old=g("qchart");
      if(old)old.parentNode.removeChild(old);
      if(!item.chart)return;
      var c=item.chart;
      var W=560,H=320,L=56,R=14,T=18,B=64;
      var iw=W-L-R, ih=H-T-B;
      var vals=c.values, labels=c.labels;
      var maxV=Math.max.apply(null,vals);
      var stp=1, found=false;
      for(var p=0;p<7&&!found;p++){
        var mults=[1,2,5];
        for(var mi=0;mi<3;mi++){
          var st=mults[mi]*Math.pow(10,p);
          if(maxV/st<=6){stp=st;found=true;break;}
        }
      }
      var yMax=Math.ceil(maxV/stp)*stp;
      function yPix(v){return T+ih-(v/yMax)*ih;}
      var NS="http://www.w3.org/2000/svg";
      var svg=document.createElementNS(NS,"svg");
      svg.setAttribute("viewBox","0 0 "+W+" "+H);
      svg.setAttribute("class","qchart");
      svg.setAttribute("role","img");
      function add(tag,attrs,text){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;svg.appendChild(e);return e;}
      for(var v=0;v<=yMax+stp/1000;v+=stp){
        var y=yPix(v);
        add("line",{x1:L,y1:y,x2:W-R,y2:y,"class":"grid"});
        add("text",{x:L-8,y:y+4,"text-anchor":"end","class":"tick"},String(v));
      }
      var slot=iw/labels.length;
      if(c.type==="bar"){
        var bw=slot*0.6;
        vals.forEach(function(val,i){
          add("rect",{x:L+slot*i+(slot-bw)/2,y:yPix(val),width:bw,height:(T+ih-yPix(val)),rx:3,"class":"barfill"});
        });
      }else{
        var pts=vals.map(function(val,i){return (L+slot*i+slot/2)+","+yPix(val);}).join(" ");
        add("polyline",{points:pts,"class":"lineplot"});
        vals.forEach(function(val,i){
          add("circle",{cx:L+slot*i+slot/2,cy:yPix(val),r:4,"class":"dot"});
        });
      }
      labels.forEach(function(lb,i){
        add("text",{x:L+slot*i+slot/2,y:T+ih+18,"text-anchor":"middle","class":"tick"},lb);
      });
      if(c.xLabel)add("text",{x:L+iw/2,y:H-8,"text-anchor":"middle","class":"axis"},c.xLabel);
      if(c.yLabel)add("text",{x:14,y:T+ih/2,"text-anchor":"middle","class":"axis",transform:"rotate(-90 14 "+(T+ih/2)+")"},c.yLabel);
      add("line",{x1:L,y1:T,x2:L,y2:T+ih,"class":"axisline"});
      add("line",{x1:L,y1:T+ih,x2:W-R,y2:T+ih,"class":"axisline"});
      var wrap=document.createElement("div");
      wrap.id="qchart";wrap.className="qchart-wrap";
      wrap.appendChild(svg);
      var anchor=g("qtable")||el.question;
      anchor.insertAdjacentElement("afterend",wrap);
    }

    function start(){order=shuffle(DATA);idx=0;score=0;locked=false;el.result.classList.remove("show");el.quiz.style.display="";render();}

    function render(){
      locked=false;var item=order[idx];
      el.counter.textContent="Question "+(idx+1)+" of "+TOTAL;
      el.running.textContent="Score: "+score;
      el.bar.style.width=(idx/TOTAL*100)+"%";
      el.qnum.textContent="Question "+(idx+1);
      el.question.textContent=item.q+(CFG.appendEquals===false?"":" =");
      renderTable(item);
      renderChart(item);
      el.feedback.classList.remove("show");el.verdict.className="verdict";
      el.next.classList.remove("show");
      el.next.textContent=(idx===TOTAL-1)?"See results →":"Next question →";
      el.options.innerHTML="";
      shuffle(item.options).forEach(function(opt,i){
        var b=document.createElement("button");b.className="opt";
        b.innerHTML='<span class="key">'+KEYS[i]+'</span><span>'+opt+'</span>';
        b.addEventListener("click",function(){choose(b,opt,item);});
        el.options.appendChild(b);
      });
    }

    function choose(btn,chosen,item){
      if(locked)return;locked=true;
      var correct=(chosen===item.answer);if(correct)score++;
      el.options.querySelectorAll(".opt").forEach(function(b){
        b.disabled=true;var label=b.querySelector("span:last-child").textContent;
        if(label===item.answer)b.classList.add("correct");
        else if(b===btn)b.classList.add("wrong");
        else b.classList.add("dim");
      });
      el.running.textContent="Score: "+score;
      el.verdict.textContent=correct?"Correct!":"Not quite";
      el.verdict.classList.add(correct?"right":"nope");
      el.why.textContent=item.why||"";
      el.feedback.classList.add("show");el.next.classList.add("show");el.next.focus();
    }

    function nextQ(){if(idx<TOTAL-1){idx++;render();window.scrollTo({top:0,behavior:"smooth"});}else{finish();}}

    function finish(){
      el.bar.style.width="100%";el.quiz.style.display="none";
      el.finalScore.textContent=score;
      if(el.outOf)el.outOf.textContent="/"+TOTAL;
      var pct=TOTAL?score/TOTAL:0, msg;
      if(pct===1)msg="Perfect score! 🎉";
      else if(pct>=0.8)msg="Great work!";
      else if(pct>=0.5)msg="Good effort — keep practising.";
      else msg="Keep going, you'll get there.";
      el.resultMsg.textContent=msg;
      var prevBest=getBest();
      if(prevBest===null||score>prevBest){setBest(score);el.bestLine.textContent="New best score!";}
      else{el.bestLine.textContent="Your best so far: "+prevBest+"/"+TOTAL;}
      el.result.classList.add("show");window.scrollTo({top:0,behavior:"smooth"});
    }

    el.next.addEventListener("click",nextQ);
    el.again.addEventListener("click",start);
    start();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);
  else run();
})();
