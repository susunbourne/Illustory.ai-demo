const steps = [
  {label:'STEP 01 · API CONTROL PLANE',title:'Accept a durable request',copy:'The API checks identity, workspace membership, billable-action permission, and the project revision. It writes an idempotent job with a pinned input snapshot, then responds with a durable job ID.',code:'202 Accepted → job: queued',failure:'A rejected or conflicting request never starts provider work.'},
  {label:'STEP 02 · WORKER LEASE',title:'Claim exactly the eligible work',copy:'A separate worker claims the queued PostgreSQL job with a time-limited lease. It records an attempt and renews the lease while work runs.',code:'queued → running · attempt recorded',failure:'If the worker disappears, the lease expires and bounded recovery can reclaim the job.'},
  {label:'STEP 03 · PROVIDER BOUNDARY',title:'Generate from pinned inputs',copy:'The worker calls the appropriate text, image, or remote GPU adapter. Provider output is an untrusted candidate until it passes the application’s validation.',code:'input snapshot → candidate output',failure:'Provider errors are recorded as attempt outcomes; retries are bounded.'},
  {label:'STEP 04 · VERSION PUBLICATION',title:'Verify, then publish',copy:'The worker stores media in private Blob Storage and verifies object provenance. A transaction creates an immutable asset version only when the worker still owns the lease and the project input revision is current.',code:'verified object → asset version v+1',failure:'Cancelled, stale, or lease-lost work cannot replace the current asset.'},
  {label:'STEP 05 · AUTHORIZED READ',title:'Show the current result',copy:'The browser checks job state through the API. The API rechecks workspace access before delivering the current project version and its private media.',code:'job: succeeded → authorized media',failure:'Another workspace cannot read the project or reuse its media capability.'}
];
const tabs=[...document.querySelectorAll('.flow-step')];
function activate(index,focus=false){
  tabs.forEach((tab,i)=>{const on=i===index;tab.classList.toggle('active',on);tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;});
  const step=steps[index];
  document.getElementById('step-panel').setAttribute('aria-labelledby',tabs[index].id);
  document.getElementById('detail-label').textContent=step.label;
  document.getElementById('detail-title').textContent=step.title;
  document.getElementById('detail-copy').textContent=step.copy;
  document.getElementById('detail-code').textContent=step.code;
  document.getElementById('detail-failure').textContent=step.failure;
  if(focus)tabs[index].focus();
}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activate(index));tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();activate(next,true);});});
