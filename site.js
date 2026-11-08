const API="https://api.jolpi.ca/ergast/f1/2026";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function get(url){const r=await fetch(url);if(!r.ok)throw Error(r.status);return r.json();}
async function home(){
  try{
    const d=await get(`${API}.json`), races=d.MRData.RaceTable.Races||[];
    const now=new Date(), next=races.find(r=>new Date(r.date+"T23:59:59")>=now)||races[0];
    if(next){document.querySelector("#nextRace").textContent=next.raceName.replace("Grand Prix","GP");document.querySelector("#nextRaceMeta").textContent=`${next.date} · ${next.Circuit?.Location?.locality||""}, ${next.Circuit?.Location?.country||""}`;document.querySelector("#tickerText").textContent=`Prossimo appuntamento: ${next.raceName} · ${next.date}`;}
  }catch(e){document.querySelector("#tickerText").textContent="F1 365 · dati del calendario temporaneamente non disponibili";}
  try{
    const d=await get(`${API}/driverstandings.json`), x=d.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings?.[0];
    if(x){document.querySelector("#leaderDriver").textContent=`${x.Driver.givenName} ${x.Driver.familyName}`;document.querySelector("#leaderPoints").textContent=x.points;}
  }catch(e){}
  try{
    const d=await get(`${API}/constructorstandings.json`), x=d.MRData.StandingsTable.StandingsLists?.[0]?.ConstructorStandings?.[0];
    if(x){document.querySelector("#leaderTeam").textContent=x.Constructor.name;document.querySelector("#teamPoints").textContent=x.points;}
  }catch(e){}
}
async function page(){
 const p=location.pathname.split("/").pop();
 const cfg={ "calendar.html":["Calendario","calendar"],"results.html":["Risultati","results"],"standings.html":["Classifiche","standings"],"drivers.html":["Piloti","drivers"],"teams.html":["Team","teams"],"news.html":["News","news"],"live.html":["F1 Live","live"]}[p];
 if(!cfg)return;
 const main=document.querySelector("main");
 main.innerHTML=`<section class="page-hero"><p class="eyebrow">F1 365</p><h1>${cfg[0]}</h1><p class="lead">Dati e contenuti della Formula 1 in un'unica pagina.</p></section><div id="data" class="cards"><article class="card"><h2>Caricamento…</h2><p class="muted">Sto recuperando i dati.</p></article></div>`;
 const data=document.querySelector("#data");
 try{
  if(cfg[1]==="news"){data.innerHTML=`<article class="card"><div class="feature-tag">FONTI UFFICIALI</div><h2>News Formula 1</h2><p class="muted">Segui le ultime comunicazioni direttamente dalle fonti ufficiali.</p><p><a class="btn" href="https://www.formula1.com/" target="_blank">Formula1.com</a></p></article><article class="card"><div class="feature-tag">FIA</div><h2>Comunicati ufficiali</h2><p class="muted">Documenti e comunicazioni della Federazione.</p><p><a class="btn outline" href="https://www.fia.com/" target="_blank">FIA</a></p></article>`;return;}
  if(cfg[1]==="live"){data.innerHTML=`<article class="card"><div class="feature-tag">LIVE</div><h2>F1 Live</h2><p class="muted">Il servizio è pronto per mostrare lo stato delle sessioni. Per i dati live ufficiali apri Formula1.com.</p><a class="btn" href="https://www.formula1.com/" target="_blank">Apri Formula1.com</a></article>`;return;}
  let d,items=[];
  if(cfg[1]==="calendar"){d=await get(`${API}.json`);items=d.MRData.RaceTable.Races||[];data.className="cards";data.innerHTML=items.map((r,i)=>`<article class="card"><div class="feature-tag">${String(i+1).padStart(2,"0")} · ${esc(r.date)}</div><h2>${esc(r.raceName)}</h2><p class="muted">${esc(r.Circuit?.circuitName)} · ${esc(r.Circuit?.Location?.locality)}, ${esc(r.Circuit?.Location?.country)}</p></article>`).join("");return;}
  if(cfg[1]==="results"){d=await get(`${API}/last/results.json`);items=d.MRData.RaceTable.Races||[];data.innerHTML=items.length?items.map(r=>`<article class="card"><div class="feature-tag">${esc(r.date)}</div><h2>${esc(r.raceName)}</h2><p>Vincitore: <strong>${esc(r.Results?.[0]?.Driver?.givenName)} ${esc(r.Results?.[0]?.Driver?.familyName)}</strong></p><p class="muted">${esc(r.Results?.[0]?.Constructor?.name||"")}</p></article>`).join(""):`<article class="card"><h2>Nessun risultato</h2></article>`;return;}
  if(cfg[1]==="standings"){d=await get(`${API}/driverstandings.json`);items=d.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings||[];data.className="table-wrap";data.innerHTML=`<table><thead><tr><th>#</th><th>Pilota</th><th>Team</th><th>Punti</th></tr></thead><tbody>${items.map(x=>`<tr><td>${esc(x.position)}</td><td>${esc(x.Driver.givenName)} ${esc(x.Driver.familyName)}</td><td>${esc(x.Constructors?.[0]?.name||"")}</td><td>${esc(x.points)}</td></tr>`).join("")}</tbody></table>`;return;}
  if(cfg[1]==="drivers"){d=await get(`${API}/driverstandings.json`);items=d.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings||[];data.innerHTML=items.map(x=>`<article class="card"><div class="feature-tag">#${esc(x.position)} · ${esc(x.points)} PUNTI</div><h2>${esc(x.Driver.givenName)} ${esc(x.Driver.familyName)}</h2><p class="muted">${esc(x.Constructors?.[0]?.name||"")}</p></article>`).join("");return;}
  if(cfg[1]==="teams"){d=await get(`${API}/constructorstandings.json`);items=d.MRData.StandingsTable.StandingsLists?.[0]?.ConstructorStandings||[];data.innerHTML=items.map(x=>`<article class="card"><div class="feature-tag">#${esc(x.position)} · ${esc(x.points)} PUNTI</div><h2>${esc(x.Constructor.name)}</h2><p class="muted">${esc(x.Constructor.nationality)}</p></article>`).join("");return;}
 }catch(e){data.innerHTML=`<article class="card"><h2>Dati temporaneamente non disponibili</h2><p class="muted">Il sito è online, ma il servizio dati non ha risposto. Ricarica la pagina tra poco.</p></article>`;}
}
document.addEventListener("DOMContentLoaded",()=>{if(document.querySelector("#nextRace"))home();else page();});
