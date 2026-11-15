/* Browser-only flood-plan rehearsal. No automated safety assessment. */
(function () {
  'use strict';
  var Q = DRY_RUN_QUESTIONS, app = document.getElementById('app');
  var KEY = 'dryrun.flood.v2', state, plan, run, storageFailed = false;
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }
  plan = DryRun.cleanPlan(state.answers, Q);
  var last = state.last && Array.isArray(state.last.outcomes) && state.last.outcomes.length === Q.length &&
    state.last.outcomes.every(function (s) { return ['GAP','CHECK','BACKUP'].indexOf(s) >= 0; }) ? state.last : null;
  var demoMode = false;
  var savedPlan = JSON.parse(JSON.stringify(plan)), savedLast = last;
  function freshPlan() { return DryRun.cleanPlan(null,Q); }
  function beginPersonal() { demoMode=false; plan=freshPlan(); last=null; planScreen(); }
  function continuePersonal() { demoMode=false; plan=JSON.parse(JSON.stringify(savedPlan)); last=savedLast; planScreen(); }
  function beginSample(openPlan) {
    demoMode=true; last=null; plan=DRY_RUN_EXAMPLE.map(function(a,i){return {primary:a.primary,backup:a.backup,assessment:DRY_RUN_REFLECTIONS[i].assessment,reason:DRY_RUN_REFLECTIONS[i].reason};});
    if(openPlan) planScreen(); else startDrill();
  }
  var labels = { GAP: 'Gap found', CHECK: 'Needs checking', BACKUP: 'Backup named' };
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else if (k.slice(0,2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function save() {
    if (demoMode) return;
    savedPlan=JSON.parse(JSON.stringify(plan)); savedLast=last;
    var answers = {};
    Q.forEach(function (q,i) { answers[q.id] = plan[i]; });
    try { localStorage.setItem(KEY, JSON.stringify({ answers: answers, last: last })); }
    catch (e) { storageFailed = true; }
  }
  function button(text, fn, cls, id) { return el('button', { type:'button', text:text, class:cls || 'btn-primary', id:id || '', onclick:fn }); }
  function show(nodes, screen) {
    setWater(0);
    app.className = screen === 'plan' ? 'plan-screen' : screen === 'results' ? 'results-screen' : screen === 'drill' ? 'drill-screen' : '';
    app.textContent = '';
    nodes.forEach(function (n) { if (n) app.appendChild(n); });
    if (storageFailed) app.appendChild(el('p',{class:'error',role:'status',text:'This browser could not save your plan. Keep this tab open and print or copy your answers before leaving.'}));
    window.scrollTo(0,0);
    var heading = app.querySelector('h1');
    if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
  }
  function setWater(gaps) {
    var water=document.getElementById('water');
    water.style.height=(Math.max(0,Math.min(Q.length,gaps))*9)+'vh';
    water.classList.toggle('empty',gaps===0);
  }
  function status(text) {
    return el('div',{class:'statusbar'},[
      button('DRY RUN',home,'brand','home'), el('span',{class:'status-label',text:(demoMode ? 'Sample · ' : '')+text})
    ]);
  }
  function note() { return el('p',{class:'small muted',text:'A short rehearsal, not a complete emergency plan or a safety rating. Follow current instructions from local authorities. No live warnings or shelter status are shown.'}); }
  function sources() {
    return el('section',{class:'panel sources'},[
      el('h2',{text:'Official information and preparation guidance'}),
      el('p',{class:'small muted',text:'These external links need internet. Check current official instructions; a saved destination may not be safe or open.'}),
      el('ul',{class:'list'}, DRY_RUN_SOURCES.map(function (s) { return el('li',{},[
        el('a',{href:s.url,target:'_blank',rel:'noopener noreferrer',text:s.name}),
        el('span',{class:'src-by',text:s.by}), el('span',{text:s.what})
      ]); })),
      el('p',{class:'small',text:'In an emergency, call 999.'})
    ]);
  }
  function home() {
    var town = DryRunTown.build({states:Q.map(function(){return 'idle';}),active:-1,water:0,label:'Illustration of a neighbourhood. Not a flood forecast or readiness assessment.'});
    town.el.className += ' town-hero';
    show([
      el('section',{class:'hero'},[
        el('p',{class:'eyebrow',text:'Flood preparedness rehearsal'}),
        el('h1',{class:'hero-title',text:'DRY RUN'}),
        el('p',{class:'tagline',text:'Find gaps in your flood plan before you need it.'}),
        town.el,
        el('p',{class:'lead',text:'Warnings. Evacuation. People. Communication. Essentials.'}),
        button('Write your flood plan',beginPersonal,'btn-primary','begin'),
        savedPlan.some(function(a){return a.primary || a.backup;})
          ? button('Continue saved plan',continuePersonal,'btn-ghost btn-demo','continue') : null,
        button('Try a sample drill',function(){beginSample(false);},'btn-ghost btn-demo','demo'),
        el('p',{class:'small muted',text:'Start blank, continue your saved plan, or explore a separate sample with example reflections. The sample never overwrites your plan.'})
      ]),
      el('ol',{class:'steps'},[
        ['01','Plan','Five practical topics. Name your first choice and a fallback.'],
        ['02','Rehearse','Face a disruption. Explain whether your backup would still work.'],
        ['03','Patch and replay','Record gaps, check assumptions and rehearse again.']
      ].map(function(s){return el('li',{},[el('span',{class:'step-no',text:s[0]}),el('div',{},[el('strong',{text:s[1]}),el('span',{class:'muted',text:s[2]})])]);})),
      note(), el('p',{class:'small muted',text:'Your answers stay in this browser. Earlier business-drill answers are not reused for these flood questions.'})
    ]);
  }
  function planScreen(focusIndex) {
    var pairs = [], error = el('p',{class:'error',role:'alert'}), count = el('div',{class:'progress',role:'status'});
    function read() {
      var before=JSON.stringify(plan);
      pairs.forEach(function(p,i){plan[i] = DryRun.revise(plan[i],p.primary.value,p.backup.value);});
      if(JSON.stringify(plan)!==before) save();
    }
    function refresh() {
      count.textContent = pairs.filter(function(p){return p.primary.value.trim();}).length + ' of 5 first choices entered · ' +
        pairs.filter(function(p){return p.backup.value.trim();}).length + ' of 5 backups named';
    }
    var cards = Q.map(function(q,i){
      var primary = el('textarea',{id:q.id+'-primary',rows:'3',maxlength:'600',placeholder:q.primaryHint});
      var backup = el('textarea',{id:q.id+'-backup',rows:'3',maxlength:'600',placeholder:q.backupHint});
      primary.value = plan[i].primary; backup.value = plan[i].backup;
      [primary,backup].forEach(function(n){n.addEventListener('input',function(){read();refresh();});});
      pairs.push({primary:primary,backup:backup});
      return el('section',{class:'panel q-card'},[
        el('div',{class:'q-head'},[el('span',{class:'q-no',text:'0'+(i+1)}),el('span',{'aria-hidden':'true',class:'q-emoji',text:q.emoji}),el('span',{class:'q-text',text:q.question})]),
        el('p',{class:'small muted question-help',text:q.check}),
        el('div',{class:'field primary'},[el('label',{for:q.id+'-primary',text:'First choice'}),primary]),
        el('div',{class:'field backup'},[el('label',{for:q.id+'-backup',text:'Backup (optional)'}),backup])
      ]);
    });
    refresh();
    show([
      status('Flood plan'),el('h1',{text:last ? 'Patch your flood plan' : 'Your flood plan'}),
      el('p',{class:'lead',text:'Be specific about people, places and arrangements. If you do not have a plan for a topic, write “not planned yet” so you can explore the gap.'}),
      el('p',{class:'small muted',text:demoMode ? 'Sample mode: fictional answers. Changes here are for practice and are not saved to your personal plan.' : 'Your plan starts blank. Edits save on this device; use Continue saved plan to return to them.'}),
      note(),count,el('div',{class:'plan-grid'},cards),error,
      el('div',{class:'plan-actions'},[
      button('Start the rehearsal',function(){
        read(); var missing = pairs.findIndex(function(p){return !p.primary.value.trim();});
        if(missing >= 0) {error.textContent='Enter a first choice for each topic, or write “not planned yet”.';pairs[missing].primary.focus();return;}
        startDrill();
      },'btn-primary','start'),
        button('Switch to sample plan',function(){beginSample(true);},'btn-ghost','example'),
        button('Back to home',function(){read();home();},'btn-ghost')
      ])
    ],'plan');
    if(typeof focusIndex === 'number' && pairs[focusIndex]) pairs[focusIndex].backup.focus();
  }
  function startDrill() {
    run = {previous:last,outcomes:[]};
    // Seed examples only when entering sample mode. revise() clears reflections
    // for changed plans; replay must never restore stale canned answers.
    save(); drill();
  }
  function explain(answer, score) {
    if(score.reason==='no-primary') return 'No first choice has been recorded.';
    if(score.reason==='no-backup') return 'No fallback is recorded. Identify one and check whether it can work.';
    if(score.reason==='same-as-primary') return 'The backup repeats the first choice. Identify an alternative or explain and revise the arrangement.';
    if(score.reason==='self-reported-gap') return 'You said this backup would not work in the scenario.';
    if(score.result==='CHECK') return 'A different name or method is not enough. Check availability, access and shared dependencies.';
    return 'You named a backup and explained why you think it could work. This is your assessment, not independent verification.';
  }
  function drill() {
    var error=el('p',{class:'error',role:'alert'}), fields=[];
    var count=el('p',{class:'progress',role:'status'});
    var waterNote=el('p',{class:'small muted water-note',role:'status'});
    function refresh() {
      var complete=fields.filter(function(f){return f.answer.assessment && f.why.value.trim();}).length;
      count.textContent=complete+' of 5 reflections ready'+(demoMode ? ' · sample reflections, editable' : '');
      var gaps=fields.filter(function(f){return f.answer.assessment && DryRun.scoreAnswer(f.answer).result==='GAP';}).length;
      setWater(gaps);
      waterNote.textContent='Rehearsal water: '+gaps+' of 5 topics with gaps so far. Illustration only—not flood depth or a safety score.';
    }
    var cards=Q.map(function(q,i){
      var answer=plan[i];
      var why=el('textarea',{id:q.id+'-reflection',rows:'2',maxlength:'600',placeholder:'Why? What needs checking?'});
      why.value=answer.reason;
      function fit(){why.style.height='auto';why.style.height=Math.max(92,why.scrollHeight+2)+'px';}
      why.addEventListener('input',function(){answer.reason=why.value;fit();save();refresh();});
      var radios=[];
      var choices=el('fieldset',{class:'reflection-choices'},[
        el('legend',{text:'Would your backup still work?'})
      ].concat([['yes','I think it could'],['no','No, there is a gap'],['unsure','I am not sure']].map(function(item){
        var radio=el('input',{type:'radio',name:'assessment-'+q.id,value:item[0],onchange:function(){answer.assessment=item[0];save();refresh();}});
        radio.checked=answer.assessment===item[0]; radios.push(radio);
        return el('label',{class:'choice'},[radio,el('span',{text:item[1]})]);
      })));
      fields.push({answer:answer,why:why,radios:radios,fit:fit});
      return el('section',{class:'panel rehearsal-card',id:q.id+'-scenario',tabindex:'-1','aria-label':q.topic+' scenario'},[
        el('h2',{text:q.emoji+' '+q.topic}),
        run.previous && !answer.assessment ? el('p',{class:'reassess-note',text:'Plan updated · reassess this scenario. Previous result: '+labels[run.previous.outcomes[i]]+'.'}) : null,
        el('div',{class:'scenario-summary'},[
          el('h3',{text:q.card})
        ]),
        el('details',{class:'scenario-guidance plan-detail'},[
          el('summary',{text:'Your plan & backup'}),
          el('p',{class:'small muted',text:'First choice: '+answer.primary}),
          el('p',{class:'small',text:'Backup: '+(answer.backup||'None recorded')})
        ]),
        el('details',{class:'scenario-guidance'},[el('summary',{text:'What to consider'}),el('p',{class:'small',text:q.prompt}),el('p',{class:'small muted',text:q.check})]),
        choices,el('label',{for:q.id+'-reflection',text:demoMode ? 'Example reflection' : 'Your reflection'}),why
      ]);
    });
    refresh();
    show([
      status('All five scenarios'),el('h1',{text:demoMode ? 'Explore the sample rehearsal' : 'Rehearse your flood plan'}),
      el('p',{class:'lead',text:'Imagine each disruption. Would your backup work? Choose, explain, then review.'}),
      el('p',{class:'small muted',text:demoMode ? 'Fictional sample · edit the example reflections to explore. Your personal plan stays separate.' : 'Your plan is under each card. These are your judgments; backups are not independently verified.'}),
      demoMode ? button('Demo shortcut: two apps, one network',function(){var card=document.getElementById('communication-scenario');card.querySelector('.plan-detail').open=true;card.scrollIntoView({block:'center'});card.focus({preventScroll:true});},'btn-ghost demo-shortcut') : null,
      count,el('div',{class:'rehearsal-grid'},cards),error,
      el('div',{class:'plan-actions'},[
        button('Review all five reflections',function(){
          var missing=fields.findIndex(function(f){return !f.answer.assessment || !f.why.value.trim();});
          if(missing>=0){error.textContent='Choose a response and add an explanation for '+Q[missing].topic.toLowerCase()+'.';
            if(!fields[missing].answer.assessment) fields[missing].radios[0].focus();else fields[missing].why.focus();return;}
          plan.forEach(function(a,i){a.reason=fields[i].why.value.trim();});
          run.outcomes=DryRun.scorePlan(plan).map(function(s){return s.result;});
          last={outcomes:run.outcomes.slice(),date:new Date().toISOString()};save();results();
        },'btn-primary','review'),
        button('Edit plan',function(){planScreen();},'btn-ghost','edit-plan')
      ]), waterNote, note()
    ],'drill');
    fields.forEach(function(f){f.fit();});
    refresh();
  }
  function results() {
    var scores=DryRun.scorePlan(plan), counts=DryRun.summary(plan);
    var panels=Q.map(function(q,i){var score=scores[i];return el('section',{class:'panel outcome topic-water '+score.result.toLowerCase(),'aria-label':q.topic+' result'},[
      el('div',{class:'topic-water-fill','aria-hidden':'true'},[el('div',{class:'topic-wave'})]),
      el('h2',{text:q.emoji+' '+q.topic}),el('span',{class:'chip',text:labels[score.result]}),
      run.previous ? el('p',{class:'result-change',text:labels[run.previous.outcomes[i]]+' → '+labels[score.result]+(run.previous.outcomes[i]!==score.result ? ' · reassessed' : ' · unchanged')}) : null,
      el('p',{text:explain(plan[i],score)}),
      el('p',{class:'small',text:'Backup: '+(plan[i].backup||'None recorded')}),
      el('p',{class:'small muted',text:'Your note: '+plan[i].reason}),
      button('Patch '+q.topic.toLowerCase(),function(){planScreen(i);},'btn-ghost')
    ]);});
    var compare=run.previous ? el('section',{class:'panel'},[
      el('h2',{text:'Before and after'}),
      el('p',{class:'small muted',text:'Changes in your recorded answers and judgments—not a measured improvement in safety.'}),
      el('ul',{class:'list'},Q.map(function(q,i){return el('li',{text:q.topic+': '+labels[run.previous.outcomes[i]]+' → '+labels[scores[i].result]});}))
    ]) : null;
    show([
      status('Rehearsal review'),el('h1',{text:demoMode ? 'Sample next steps' : 'Your next steps'}),
      el('p',{class:'lead',text:'Check the assumptions. Agree arrangements with the people involved. Then rehearse again.'}),
      el('div',{class:'review-counts'},Object.keys(labels).map(function(key){return el('section',{class:'panel outcome '+key.toLowerCase()},[
        el('div',{class:'tile-num',text:String(counts[key])}),el('p',{text:labels[key]})
      ]);})),
      el('p',{class:'small muted water-note',text:'Each topic has its own water level: high = gap found · medium = needs checking · low = backup named. Based on recorded answers, not flood depth or verified preparedness.'}),note(),compare
    ].concat([el('div',{class:'results-grid'},panels)]).concat([
      button('Patch and replay',function(){planScreen();},'btn-primary','patch'),
      button('Print my plan',function(){window.print();},'btn-ghost btn-demo','print'),
      sources(),printSheet()
    ]), 'results');
  }
  function printSheet() {
    return el('section',{id:'sheet'},[
      el('h1',{text:demoMode ? 'Sample flood rehearsal notes' : 'Our flood rehearsal notes'}),
      el('p',{text:'Recorded '+new Date().toLocaleDateString()+'. A discussion aid, not a complete plan or safety certification.'}),
      el('table',{},[
        el('thead',{},[el('tr',{},['Topic','First choice','Backup and follow-up'].map(function(t){return el('th',{scope:'col',text:t});}))]),
        el('tbody',{},Q.map(function(q,i){return el('tr',{},[
          el('th',{scope:'row',text:q.topic}),el('td',{text:plan[i].primary}),
          el('td',{text:(plan[i].backup||'Not yet named')+' — '+labels[DryRun.scoreAnswer(plan[i]).result]+'. '+plan[i].reason})
        ]);}))
      ]),
      el('p',{text:'Follow current instructions from local authorities. Confirm safe routes, destination availability and support arrangements. Never enter floodwater to retrieve supplies.'}),
      el('h2',{text:'Official information (internet required)'}),
      el('ul',{},DRY_RUN_SOURCES.map(function(s){return el('li',{text:s.name+': '+s.url});})),
      el('p',{text:'In an emergency, call 999.'})
    ]);
  }
  home();
  if(location.protocol==='https:' && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function(){});
})();
