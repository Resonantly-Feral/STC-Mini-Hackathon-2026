/* Tests for conservative outcome classification and saved-plan handling. */
var DryRunTests = (function () {
  var results = [];
  function check(name, actual, expected) { results.push({name:name,pass:JSON.stringify(actual)===JSON.stringify(expected),actual:JSON.stringify(actual),expected:JSON.stringify(expected)}); }
  function answer(extra) { return Object.assign({primary:'WhatsApp',backup:'Telegram',assessment:'',reason:''},extra); }
  check('missing answer is a gap',DryRun.scoreAnswer().result,'GAP');
  check('missing primary is a gap',DryRun.scoreAnswer(answer({primary:''})).reason,'no-primary');
  check('missing backup is a gap',DryRun.scoreAnswer(answer({backup:'  '})).reason,'no-backup');
  check('same backup ignores case and spaces',DryRun.scoreAnswer(answer({backup:' WHATSAPP '})).reason,'same-as-primary');
  check('different messaging apps are not automatically validated',DryRun.scoreAnswer(answer()).result,'CHECK');
  check('yes without an explanation needs checking',DryRun.scoreAnswer(answer({assessment:'yes',reason:'  '})).result,'CHECK');
  check('uncertain answer needs checking even with explanation',DryRun.scoreAnswer(answer({assessment:'unsure',reason:'Both need internet'})).result,'CHECK');
  check('self-reported failure is a gap',DryRun.scoreAnswer(answer({assessment:'no',reason:'Both need internet'})).reason,'self-reported-gap');
  check('explained yes only records a named backup',DryRun.scoreAnswer(answer({assessment:'yes',reason:'We think it works'})),{result:'BACKUP',reason:'self-reported-backup'});
  check('yes cannot override missing backup',DryRun.scoreAnswer(answer({backup:'',assessment:'yes',reason:'It will work'})).result,'GAP');
  check('yes cannot override identical backup',DryRun.scoreAnswer(answer({backup:'WhatsApp',assessment:'yes',reason:'It will work'})).result,'GAP');
  check('invalid assessment needs checking',DryRun.scoreAnswer(answer({assessment:'safe',reason:'verified'})).result,'CHECK');
  check('summary distinguishes all outcomes',DryRun.summary([answer({backup:''}),answer(),answer({assessment:'yes',reason:'Named'})]),{GAP:1,CHECK:1,BACKUP:1});
  var previous=answer({assessment:'yes',reason:'Agreed arrangement'});
  check('editing backup invalidates old reflection',DryRun.revise(previous,'WhatsApp','Radio').assessment,'');
  check('editing primary clears old explanation',DryRun.revise(previous,'Phone','Telegram').reason,'');
  check('unchanged answers retain reflection',DryRun.revise(previous,' WhatsApp ','Telegram').reason,'Agreed arrangement');
  check('legacy positional answers are not mapped to flood topics',DryRun.cleanPlan([previous],[{id:'warnings'}]),[{primary:'',backup:'',assessment:'',reason:''}]);
  check('saved flood topic IDs restore correctly',DryRun.cleanPlan({warnings:previous},[{id:'warnings'}])[0],previous);
  check('malformed saved fields are discarded',DryRun.cleanPlan({warnings:{primary:23,backup:{},assessment:'safe',reason:null}},[{id:'warnings'}]),[{primary:'',backup:'',assessment:'',reason:''}]);
  check('oversized saved text is bounded',DryRun.cleanPlan({warnings:{primary:'x'.repeat(900)}},[{id:'warnings'}])[0].primary.length,600);
  return results;
})();
if(typeof document !== 'undefined') {
  DryRunTests.forEach(function(t){var li=document.createElement('li');li.className=t.pass?'pass':'fail';li.textContent=(t.pass?'PASS ':'FAIL ')+t.name+(t.pass?'':' expected '+t.expected+' got '+t.actual);document.getElementById('results').appendChild(li);});
  document.getElementById('summary').textContent=DryRunTests.filter(function(t){return t.pass;}).length+' of '+DryRunTests.length+' passed';
}
if(typeof module !== 'undefined' && module.exports) module.exports=DryRunTests;
