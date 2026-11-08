
const API = "https://api.jolpi.ca/ergast/f1/2026";
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const fallbackNews = [
  {title:"Formula 1 — ultime notizie", source:"Formula1.com", url:"https://www.formula1.com/"},
  {title:"FIA — comunicati e aggiornamenti Formula 1", source:"FIA", url:"https://www.fia.com/"},
];

async function getJSON(url){
  const r = await fetch(url, {headers:{Accept:"application/json"}});
  if(!r.ok) throw new Error("HTTP "+r.status);
  return r.json();
}
function shell(title, body){ return `<div class="card"><h2>${title}</h2>${body}</div>`; }

async function renderCalendar(el){
  const d = await getJSON(`${API}.json`);
  const races = d.MRData.RaceTable.Races || [];
  el.innerHTML = races.length ? races.map((r,i)=>`<article class="card"><small>${String(i+1).padStart(2,"0")} · ${esc(r.date)}</small><h2>${esc(r.raceName)}</h2><p>${esc(r.Circuit?.circuitName)} · ${esc(r.Circuit?.Location?.locality)}, ${esc(r.Circuit?.Location?.country)}</p><a class="btn ghost" href="${esc(r.url || '#')}" target="_blank" rel="noopener">Dettagli</a></article>`).join("") : shell("Calendario non disponibile","<p>Riprova tra poco.</p>");
}
async function renderStandings(el){
  const d = await getJSON(`${API}/driverstandings.json`);
  const list = d.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings || [];
  const rows = list.map(x=>`<tr><td>${esc(x.position)}</td><td>${esc(x.Driver.givenName)} ${esc(x.Driver.familyName)}</td><td>${esc(x.Constructors?.[0]?.name || "")}</td><td>${esc(x.points)}</td></tr>`).join("");
  el.innerHTML = `<div class="card"><h2>Piloti</h2><table><thead><tr><th>#</th><th>Pilota</th><th>Team</th><th>Punti</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
async function renderConstructors(el){
  const d = await getJSON(`${API}/constructorstandings.json`);
  const list = d.MRData.StandingsTable.StandingsLists?.[0]?.ConstructorStandings || [];
  el.innerHTML = list.map(x=>`<article class="card"><small>${esc(x.position)} · ${esc(x.points)} punti</small><h2>${esc(x.Constructor.name)}</h2><p>${esc(x.Constructor.nationality)}</p></article>`).join("");
}
async function renderDrivers(el){
  const d = await getJSON(`${API}/driverstandings.json`);
  const list = d.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings || [];
  el.innerHTML = list.map(x=>`<article class="card"><small>#${esc(x.position)} · ${esc(x.points)} punti</small><h2>${esc(x.Driver.givenName)} ${esc(x.Driver.familyName)}</h2><p>${esc(x.Constructors?.[0]?.name || "")}</p></article>`).join("");
}
async function renderResults(el){
  const d = await getJSON(`${API}/last/results.json`);
  const list = d.MRData.RaceTable.Races || [];
  if(!list.length) throw new Error("Nessun risultato");
  const r = list[0];
  el.innerHTML = `<article class="card"><small>${esc(r.date)}</small><h2>${esc(r.raceName)}</h2><p>Vincitore: <strong>${esc(r.Results?.[0]?.Driver?.givenName)} ${esc(r.Results?.[0]?.Driver?.familyName)}</strong></p><p>Team: ${esc(r.Results?.[0]?.Constructor?.name || "")}</p></article>`;
}
async function renderNews(el){
  el.innerHTML = `<article class="card"><small>FONTI UFFICIALI</small><h2>Ultime News</h2><p>Per evitare feed non verificati, F1 365 collega direttamente alle fonti ufficiali.</p>
    <p><a class="btn" href="https://www.formula1.com/" target="_blank" rel="noopener">Formula1.com</a>
    <a class="btn ghost" href="https://www.fia.com/" target="_blank" rel="noopener">FIA</a></p></article>`;
}
async function renderLive(el){
  el.innerHTML = `<article class="card"><small>LIVE</small><h2>F1 Live</h2><p>La pagina è online. I dati live dipendono dalla disponibilità di un feed pubblico durante le sessioni.</p><p>Per risultati ufficiali in tempo reale consulta Formula1.com.</p><a class="btn" href="https://www.formula1.com/" target="_blank" rel="noopener">Apri Formula1.com</a></article>`;
}

async function boot(){
  const el = $("#content");
  if(!el) return;
  try{
    switch(window.F1_PAGE){
      case "calendar": await renderCalendar(el); break;
      case "results": await renderResults(el); break;
      case "standings": await renderStandings(el); break;
      case "drivers": await renderDrivers(el); break;
      case "teams": await renderConstructors(el); break;
      case "news": await renderNews(el); break;
      case "live": await renderLive(el); break;
      default: break;
    }
  }catch(e){
    el.innerHTML = shell("Dati temporaneamente non disponibili", `<p>La pagina è funzionante, ma il servizio dati non ha risposto. Riprova tra poco.</p><p><a class="btn" href="javascript:location.reload()">Ricarica</a></p>`);
  }
}
document.addEventListener("DOMContentLoaded", boot);
