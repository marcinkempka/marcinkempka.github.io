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

    function start(){order=shuffle(DATA);idx=0;score=0;locked=false;el.result.classList.remove("show");el.quiz.style.display="";render();}

    function render(){
      locked=false;var item=order[idx];
      el.counter.textContent="Question "+(idx+1)+" of "+TOTAL;
      el.running.textContent="Score: "+score;
      el.bar.style.width=(idx/TOTAL*100)+"%";
      el.qnum.textContent="Question "+(idx+1);
      el.question.textContent=item.q+(CFG.appendEquals===false?"":" =");
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
