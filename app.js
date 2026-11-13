// Datos provisionales. Más adelante se podrán cargar desde una base de datos.
const events = {
  "2026-11-16": [
    { type: "exam", subject: "Matemáticas", title: "Examen de funciones", description: "Tema 3 · Funciones y gráficas" }
  ],
  "2026-11-18": [
    { type: "task", subject: "Historia", title: "Entregar comentario de texto", description: "Entrega en clase" }
  ],
  "2026-11-20": [
    { type: "exam", subject: "Inglés", title: "Examen Unit 4", description: "Grammar + Vocabulary" }
  ],
  "2026-11-24": [
    { type: "other", subject: "Física", title: "Práctica de laboratorio", description: "Llevar el cuaderno de prácticas" }
  ]
};

const subjects = [
  { name: "Matemáticas", optional: false },
  { name: "Lengua", optional: false },
  { name: "Inglés", optional: false },
  { name: "Historia", optional: false },
  { name: "Física", optional: true },
  { name: "Química", optional: true },
  { name: "Economía", optional: true },
  { name: "Informática", optional: true }
];

// Horario de muestra. Los nombres deben coincidir con subjects para aplicar el filtro.
const schedule = [
  { time: "08:00", lunes: "Matemáticas", martes: "Lengua", miercoles: "Inglés", jueves: "Historia", viernes: "Matemáticas" },
  { time: "09:00", lunes: "Historia", martes: "Matemáticas", miercoles: "Física", jueves: "Lengua", viernes: "Inglés" },
  { time: "10:00", lunes: "Inglés", martes: "Física", miercoles: "Matemáticas", jueves: "Inglés", viernes: "Historia" },
  { time: "11:30", lunes: "Química", martes: "Economía", miercoles: "Lengua", jueves: "Informática", viernes: "Física" }
];

const days = ["lunes", "martes", "miercoles", "jueves", "viernes"];
const icons = { exam: "✎", task: "▤", other: "◇" };
const typeLabels = { exam: "Examen", task: "Entrega", other: "Actividad" };

let currentDate = new Date();
currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
let selectedDate = formatDate(new Date());
let deferredPrompt = null;

const $ = id => document.getElementById(id);
const calendarEl = $("calendar");

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getSelectedSubjects() {
  try {
    const saved = JSON.parse(localStorage.getItem("selectedSubjects"));
    return Array.isArray(saved) ? saved : subjects.filter(s => s.optional).map(s => s.name);
  } catch {
    return subjects.filter(s => s.optional).map(s => s.name);
  }
}

function isSubjectVisible(name) {
  const subject = subjects.find(s => s.name === name);
  return !subject || !subject.optional || getSelectedSubjects().includes(name);
}

function visibleEvents(dateString) {
  return (events[dateString] || []).filter(event => isSubjectVisible(event.subject));
}

function renderCalendar() {
  calendarEl.replaceChildren();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  $("monthTitle").textContent = currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Celdas vacías antes del primer día del mes.
  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day outside";
    calendarEl.append(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const key = formatDate(date);
    const dayEvents = visibleEvents(key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.setAttribute("aria-label", `${day} ${date.toLocaleDateString("es-ES", { month: "long" })}, ${dayEvents.length} eventos`);
    if (key === formatDate(new Date())) button.classList.add("today");
    if (key === selectedDate) button.classList.add("selected");

    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = day;
    const dots = document.createElement("span");
    dots.className = "day-dots";
    dayEvents.slice(0, 3).forEach(event => {
      const dot = document.createElement("i");
      dot.className = `dot dot-${event.type === "exam" ? "exam" : event.type === "task" ? "task" : "class"}`;
      dots.append(dot);
    });
    button.append(number, dots);
    button.addEventListener("click", () => {
      selectedDate = key;
      renderCalendar();
      renderDayEvents();
    });
    calendarEl.append(button);
  }
}

function renderDayEvents() {
  const date = new Date(`${selectedDate}T12:00:00`);
  $("selectedDate").textContent = date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const list = visibleEvents(selectedDate);
  $("eventCount").textContent = `${list.length} ${list.length === 1 ? "evento" : "eventos"}`;
  const container = $("dayEvents");
  container.replaceChildren();

  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No hay tareas ni exámenes para este día.";
    container.append(empty);
    return;
  }

  list.forEach(event => {
    const card = document.createElement("article");
    card.className = `event-card ${event.type}`;
    const symbol = document.createElement("div");
    symbol.className = "event-symbol";
    symbol.textContent = icons[event.type] || "•";
    const info = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = event.title;
    const description = document.createElement("p");
    description.textContent = event.description || "";
    const meta = document.createElement("p");
    meta.className = "event-meta";
    meta.textContent = `${event.subject} · ${typeLabels[event.type] || "Evento"}`;
    info.append(title, description, meta);
    card.append(symbol, info);
    container.append(card);
  });
}

function renderSchedule() {
  const container = $("schedule");
  container.replaceChildren();
  const selected = getSelectedSubjects();
  const header = ["Hora", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  header.forEach((label, index) => {
    const cell = document.createElement("div");
    cell.className = "schedule-cell header-cell";
    cell.textContent = label;
    container.append(cell);
  });

  schedule.forEach(row => {
    const time = document.createElement("div");
    time.className = "schedule-cell time-cell";
    time.textContent = row.time;
    container.append(time);

    days.forEach(day => {
      const cell = document.createElement("div");
      cell.className = "schedule-cell";
      const name = row[day];
      if (name && (!subjects.some(s => s.name === name && s.optional) || selected.includes(name))) {
        const subject = document.createElement("span");
        subject.className = "schedule-subject";
        subject.textContent = name;
        cell.append(subject);
      } else {
        cell.textContent = "—";
        cell.style.color = "var(--muted)";
      }
      container.append(cell);
    });
  });
}

function renderSubjects() {
  const container = $("subjects");
  container.replaceChildren();
  const selected = getSelectedSubjects();

  subjects.forEach(subject => {
    const label = document.createElement("label");
    label.className = "subject-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !subject.optional || selected.includes(subject.name);
    checkbox.disabled = !subject.optional;
    checkbox.addEventListener("change", () => {
      const next = getSelectedSubjects();
      const updated = checkbox.checked
        ? [...new Set([...next, subject.name])]
        : next.filter(name => name !== subject.name);
      localStorage.setItem("selectedSubjects", JSON.stringify(updated));
      renderSubjects();
      renderSchedule();
      renderCalendar();
      renderDayEvents();
    });
    const name = document.createElement("span");
    name.textContent = subject.name;
    label.append(checkbox, name);
    if (subject.optional) {
      const tag = document.createElement("span");
      tag.className = "subject-tag";
      tag.textContent = "Optativa";
      label.append(tag);
    }
    container.append(label);
  });
}

function changeMonth(amount) {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1);
  renderCalendar();
}

$("prevMonth").addEventListener("click", () => changeMonth(-1));
$("nextMonth").addEventListener("click", () => changeMonth(1));

$("todayLabel").textContent = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
renderSubjects();
renderSchedule();
renderCalendar();
renderDayEvents();

// Permiso de notificaciones locales. Para avisos programados con la app cerrada
// habrá que añadir un servidor que envíe Web Push a las suscripciones.
$("notificationBtn").addEventListener("click", async () => {
  const status = $("notificationStatus");
  if (!("Notification" in window)) {
    status.textContent = "Este navegador no admite notificaciones.";
    return;
  }
  if (!("serviceWorker" in navigator)) {
    status.textContent = "Este navegador no admite Service Workers.";
    return;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      status.textContent = "Permiso concedido en este dispositivo. Falta configurar el envío automático Web Push.";
      $("notificationBtn").textContent = "Avisos permitidos";
      $("notificationBtn").disabled = true;
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification("Calendario de clase", {
        body: "Las notificaciones están activadas en este dispositivo.",
        icon: "./icons/icon-192.png"
      });
    } else {
      status.textContent = permission === "denied"
        ? "Has bloqueado las notificaciones. Puedes habilitarlas desde los ajustes del navegador."
        : "No se ha concedido permiso para notificaciones.";
    }
  } catch (error) {
    status.textContent = "No se pudo activar el permiso de notificaciones.";
    console.error(error);
  }
});

// Instalación PWA.
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredPrompt = event;
  $("installBtn").classList.remove("hidden");
});
$("installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $("installBtn").classList.add("hidden");
});
window.addEventListener("appinstalled", () => $("installBtn").classList.add("hidden"));

// Service Worker.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => console.error("Error registrando SW:", error));
  });
}
