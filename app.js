// Supabase compartirá los eventos entre todos los usuarios. Sin configurar,
// la web muestra datos locales de demostración.
const hasConfig = window.APP_CONFIG?.SUPABASE_URL && window.APP_CONFIG?.SUPABASE_PUBLISHABLE_KEY &&
  !window.APP_CONFIG.SUPABASE_URL.includes("TU_");
const db = hasConfig && window.supabase ? window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL,window.APP_CONFIG.SUPABASE_PUBLISHABLE_KEY) : null;
const demo = [
 {id:"demo1",date:"2026-11-16",type:"exam",subject:"Matemáticas",title:"Examen de funciones",description:"Tema 3 · Funciones y gráficas"},
 {id:"demo2",date:"2026-11-18",type:"task",subject:"Historia",title:"Entregar comentario de texto",description:"Entrega en clase."},
 {id:"demo3",date:"2026-11-20",type:"exam",subject:"Inglés",title:"Examen Unit 4",description:"Grammar + Vocabulary"}
];
let events=[...demo], currentDate=new Date(new Date().getFullYear(),new Date().getMonth(),1), selectedDate=fmt(new Date()), adminUser=null, deferredPrompt=null, janClicks=0, janTimer=null;
const $=id=>document.getElementById(id), days=["Lunes","Martes","Miércoles","Jueves","Viernes"];
const typeNames={exam:"Examen",task:"Entrega",other:"Actividad"}, icons={exam:"✎",task:"▤",other:"◇"};
// Transcripción del PDF: columnas de lunes a viernes, filas en orden de lectura.
// Las celdas con "/" se convierten en opciones independientes.
const timetable=[
 ["Valenciano (Carolina)/Valenciano (Pau)","Valenciano (Carolina)/Valenciano (Pau)","FyQ/Economía","Inglés","FyQ/Economía"],
 ["FOPP/Biología","Educación Física","Proyecto Interdisciplinar","FOPP/Biología","Inglés"],
 ["Tecnología/Latín","Mate A/Mate B","Tutoría","Mate A/Mate B","Geografía e Historia"],
 ["Inglés","Castellano Carolina/Castellano Gema","Castellano Carolina/Castellano Gema","Valenciano (Carolina)/Valenciano (Pau)","Castellano Carolina/Castellano Gema"],
 ["Mate A/Mate B","Geografía e Historia","Tecnología/Latín","Geografía e Historia","Mate A/Mate B"],
 ["FyQ/Economía","Proyecto Interdisciplinar","FOPP/Biología","Tecnología/Latín",""],
 ["","Religión","Educación Valores","Educación Física",""]
];
const breaksAfter=[1,4]; // P-A-T-I-O tras segunda y quinta fila de clase, según las dos filas del PDF.
const choiceGroups=[
 ["Valenciano (Carolina)","Valenciano (Pau)"],["FyQ","Economía"],["FOPP","Biología"],
 ["Tecnología","Latín"],["Mate A","Mate B"],["Castellano Carolina","Castellano Gema"]
];
const required=["Inglés","Educación Física","Proyecto Interdisciplinar","Tutoría","Geografía e Historia","Religión","Educación Valores"];
const allChoices=[...new Set(choiceGroups.flat())];
function fmt(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function choices(){try{const a=JSON.parse(localStorage.getItem("classChoices"));return Array.isArray(a)?a:[...allChoices]}catch{return [...allChoices]}}
function visibleSubject(s){return required.includes(s)||!allChoices.includes(s)||choices().includes(s)}
function forDate(date){return events.filter(e=>e.date===date&&visibleSubject(e.subject))}
function openModal(id){$(id).classList.remove("hidden")}function closeModal(id){$(id).classList.add("hidden")}
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
document.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelectorAll(".modal").forEach(m=>m.classList.add("hidden"))});

function renderCalendar(){
 const box=$("calendar");box.replaceChildren();const y=currentDate.getFullYear(),m=currentDate.getMonth();
 $("monthTitle").textContent=currentDate.toLocaleDateString("es-ES",{month:"long",year:"numeric"});
 const offset=(new Date(y,m,1).getDay()+6)%7,total=new Date(y,m+1,0).getDate();
 for(let i=0;i<offset;i++){const x=document.createElement("div");x.className="calendar-day outside";box.append(x)}
 for(let d=1;d<=total;d++){
  const date=new Date(y,m,d),key=fmt(date),list=forDate(key),b=document.createElement("button");b.type="button";b.className="calendar-day";
  if(key===fmt(new Date()))b.classList.add("today");if(key===selectedDate)b.classList.add("selected");
  b.setAttribute("aria-label",`${d} ${date.toLocaleDateString("es-ES",{month:"long"})}`);
  const n=document.createElement("span");n.className="day-number";n.textContent=d;const dots=document.createElement("span");dots.className="day-dots";
  list.slice(0,3).forEach(ev=>{const dot=document.createElement("i");dot.className=`dot dot-${ev.type}`;dots.append(dot)});b.append(n,dots);
  b.addEventListener("click",()=>{
   if(m===0&&d===15){janClicks++;clearTimeout(janTimer);janTimer=setTimeout(()=>janClicks=0,1800);if(janClicks>=5){janClicks=0;showAdminLogin()}}else janClicks=0;
   selectedDate=key;renderCalendar();renderDay();
  });box.append(b);
 }
}
function renderDay(){
 const date=new Date(`${selectedDate}T12:00:00`);$("selectedDate").textContent=date.toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"});
 const list=forDate(selectedDate),box=$("dayEvents");$("eventCount").textContent=`${list.length} ${list.length===1?"evento":"eventos"}`;box.replaceChildren();
 if(!list.length){const p=document.createElement("p");p.className="empty-state";p.textContent="No hay tareas ni exámenes para este día.";box.append(p);return}
 list.forEach(ev=>{
  const card=document.createElement("article");card.className=`event-card ${ev.type}`;const symbol=document.createElement("div");symbol.className="event-symbol";symbol.textContent=icons[ev.type]||"◇";
  const info=document.createElement("div"),title=document.createElement("h3"),desc=document.createElement("p"),meta=document.createElement("p");title.textContent=ev.title;desc.textContent=ev.description||"Sin explicación adicional.";meta.className="event-meta";meta.textContent=`${ev.subject} · ${typeNames[ev.type]}${ev.time?" · "+ev.time:""}`;
  const actions=document.createElement("div");actions.className="event-actions";const detail=document.createElement("button");detail.className="text-button";detail.textContent="Ver detalles";detail.addEventListener("click",()=>showDetails(ev));
  info.append(title,desc,meta);actions.append(detail);card.append(symbol,info,actions);box.append(card);
 });
}
function showDetails(ev){
 $("detailType").textContent=typeNames[ev.type]||"EVENTO";$("detailTitle").textContent=ev.title;
 const d=new Date(`${ev.date}T12:00:00`);$("detailMeta").textContent=`${ev.subject} · ${d.toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}${ev.time?" · "+ev.time:""}`;
 $("detailDescription").textContent=ev.description||"No se ha añadido una explicación para este evento.";openModal("detailModal");
}
function renderSubjects(){
 const box=$("subjects");box.replaceChildren();const selected=choices();
 choiceGroups.forEach(group=>group.forEach(name=>{
  const label=document.createElement("label");label.className="subject-option";const input=document.createElement("input");input.type="checkbox";input.checked=selected.includes(name);
  input.addEventListener("change",()=>{const next=choices();localStorage.setItem("classChoices",JSON.stringify(input.checked?[...new Set([...next,name])]:next.filter(x=>x!==name)));renderSubjects();renderSchedule();renderCalendar();renderDay()});
  const text=document.createElement("span");text.textContent=name;const tag=document.createElement("span");tag.className="subject-tag";tag.textContent="Optativa";label.append(input,text,tag);box.append(label);
 }));
 required.forEach(name=>{const label=document.createElement("label");label.className="subject-option";const input=document.createElement("input");input.type="checkbox";input.checked=true;input.disabled=true;const text=document.createElement("span");text.textContent=name;const tag=document.createElement("span");tag.className="subject-tag";tag.textContent="Obligatoria";label.append(input,text,tag);box.append(label)});
}
function renderSchedule(){
 const box=$("schedule");box.replaceChildren();["Hora",...days].forEach(t=>{const c=document.createElement("div");c.className="schedule-cell header-cell";c.textContent=t;box.append(c)});
 timetable.forEach((row,index)=>{
  const time=document.createElement("div");time.className="schedule-cell time-cell";time.textContent=`${index+1}ª clase`;box.append(time);
  row.forEach(raw=>{
   const c=document.createElement("div");c.className="schedule-cell";
   if(!raw){c.textContent="—";c.style.color="var(--muted)"}else{
    const names=raw.split("/");names.forEach(name=>{const s=document.createElement("span");s.className="schedule-subject";s.textContent=name;if(allChoices.includes(name))s.classList.add("schedule-choice");if(!visibleSubject(name))s.hidden=true;c.append(s)});
    if([...c.children].every(el=>el.hidden))c.textContent="—";
   }box.append(c);
  });
  if(index===1||index===4){const br=document.createElement("div");br.className="schedule-cell break-cell";br.style.gridColumn="1 / -1";br.textContent="PATIO";box.append(br);}
 });
}
$("prevMonth").addEventListener("click",()=>{currentDate=new Date(currentDate.getFullYear(),currentDate.getMonth()-1,1);renderCalendar()});
$("nextMonth").addEventListener("click",()=>{currentDate=new Date(currentDate.getFullYear(),currentDate.getMonth()+1,1);renderCalendar()});

// Acceso de administración: cinco pulsaciones rápidas en el 15 de enero.
function showAdminLogin(){$("loginMessage").textContent="";$("loginForm").reset();openModal("adminModal")}
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();const msg=$("loginMessage");if(!db){msg.textContent="Primero configura Supabase siguiendo README.md.";return}
 msg.textContent="Verificando…";const {data,error}=await db.auth.signInWithPassword({email:$("adminEmail").value.trim(),password:$("adminPassword").value});
 if(error){msg.textContent="Credenciales incorrectas o acceso no disponible.";return}
 const {data:admin,error:checkError}=await db.from("admin_users").select("user_id").eq("user_id",data.user.id).maybeSingle();
 if(checkError||!admin){await db.auth.signOut();msg.textContent="Esta cuenta no tiene permisos de administrador.";return}
 adminUser=data.user;closeModal("adminModal");openModal("editorModal");renderAdminList();
});
$("logoutBtn").addEventListener("click",async()=>{if(db)await db.auth.signOut();adminUser=null;closeModal("editorModal");resetForm()});
function openAdminList(){renderAdminList()}
function renderAdminList(){
 const box=$("adminEventList");box.replaceChildren();if(!events.length){const p=document.createElement("p");p.className="muted small";p.textContent="Todavía no hay eventos.";box.append(p);return}
 [...events].sort((a,b)=>a.date.localeCompare(b.date)).forEach(ev=>{
  const row=document.createElement("div");row.className="admin-event-row";const info=document.createElement("div"),title=document.createElement("strong"),meta=document.createElement("small");title.textContent=ev.title;meta.textContent=`${ev.date} · ${ev.subject} · ${typeNames[ev.type]}`;info.append(title,meta);
  const actions=document.createElement("div");actions.className="admin-row-actions";const edit=document.createElement("button");edit.className="text-button";edit.textContent="Editar";edit.addEventListener("click",()=>fillForm(ev));const del=document.createElement("button");del.className="text-button";del.textContent="Eliminar";del.addEventListener("click",()=>removeEvent(ev));actions.append(edit,del);row.append(info,actions);box.append(row);
 });
}
function fillForm(ev){$("eventId").value=ev.id;$("eventType").value=ev.type;$("eventDate").value=ev.date;$("eventTitle").value=ev.title;$("eventSubject").value=ev.subject;$("eventTime").value=ev.time||"";$("eventDescription").value=ev.description||"";$("editorTitle").textContent="Editar evento";$("cancelEditBtn").classList.remove("hidden");$("eventForm").scrollIntoView({behavior:"smooth",block:"start"})}
function resetForm(){$("eventForm").reset();$("eventId").value="";$("editorTitle").textContent="Administrar calendario";$("cancelEditBtn").classList.add("hidden")}
$("cancelEditBtn").addEventListener("click",resetForm);
$("eventForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!db||!adminUser){$("eventFormMessage").textContent="No hay una sesión de administrador.";return}
 const id=$("eventId").value,payload={type:$("eventType").value,event_date:$("eventDate").value,title:$("eventTitle").value.trim(),subject:$("eventSubject").value.trim(),event_time:$("eventTime").value||null,description:$("eventDescription").value.trim(),created_by:adminUser.id};
 $("eventFormMessage").textContent="Guardando…";
 const result=id?await db.from("class_events").update(payload).eq("id",id):await db.from("class_events").insert(payload);
 if(result.error){$("eventFormMessage").textContent="No se pudo guardar. Revisa la configuración de Supabase.";console.error(result.error);return}
 $("eventFormMessage").textContent="Publicado para toda la clase.";resetForm();await loadEvents();
});
async function removeEvent(ev){if(!confirm(`¿Eliminar «${ev.title}» para toda la clase?`))return;const {error}=await db.from("class_events").delete().eq("id",ev.id);if(error){alert("No se pudo eliminar.");return}await loadEvents()}
function mapRow(r){return{id:r.id,date:r.event_date,type:r.type,subject:r.subject,title:r.title,description:r.description||"",time:r.event_time||""}}
async function loadEvents(){
 if(!db)return;const {data,error}=await db.from("class_events").select("*").order("event_date");
 if(error){console.error(error);$("notificationStatus").textContent="Error al conectar con Supabase; revisa config.js y supabase-setup.sql.";return}
 events=(data||[]).map(mapRow);renderCalendar();renderDay();if(adminUser)renderAdminList();
}
if(db){loadEvents();db.channel("events-live").on("postgres_changes",{event:"*",schema:"public",table:"class_events"},loadEvents).subscribe()}

// Notificación local de prueba; los avisos programados necesitan Web Push en servidor.
$("notificationBtn").addEventListener("click",async()=>{
 const status=$("notificationStatus");if(!("Notification"in window)){status.textContent="Este navegador no admite notificaciones.";return}
 try{const permission=await Notification.requestPermission();if(permission==="granted"){const reg=await navigator.serviceWorker.ready;reg.showNotification("Calendario de clase",{body:"Has activado los avisos en este dispositivo.",icon:"./icons/icon-192.png"});status.textContent="Permiso concedido. Los recordatorios automáticos requieren configurar Web Push.";$("notificationBtn").textContent="Avisos permitidos"}else status.textContent="No se ha concedido permiso."}catch(err){status.textContent="No se pudo activar el permiso.";console.error(err)}
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden")});
$("installBtn").addEventListener("click",async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").classList.add("hidden")});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.error));
$("todayLabel").textContent=new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"});
renderSubjects();renderSchedule();renderCalendar();renderDay();
