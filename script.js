
// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');
const backTop = document.getElementById('back-top');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 50);
  backTop.classList.toggle('visible', y > 400);

  // Active nav
  let current = '';
  sections.forEach(s => {
    if (y >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});
function closeMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }});
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => io.observe(el));

// ── FAQ ──
function toggleFaq(el) {
  const answer = el.nextElementSibling;
  const allQ = document.querySelectorAll('.faq-question');
  const allA = document.querySelectorAll('.faq-answer');
  allQ.forEach(q => { if (q !== el) q.classList.remove('open'); });
  allA.forEach(a => { if (a !== answer) a.classList.remove('open'); });
  el.classList.toggle('open');
  answer.classList.toggle('open');
}

// ── BOOKING FLOW ──
let currentStep = 1;
const totalSteps = 6;
const bookingState = { service: '', doctor: '', date: '', time: '', patient: {} };

function selectOption(el, type) {
  if (el.classList.contains('unavailable')) return;
  const siblings = el.parentElement.querySelectorAll('.' + el.className.split(' ')[0]);
  siblings.forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  if (type === 'service') bookingState.service = el.querySelector('.opt-label')?.textContent || el.textContent.trim();
  if (type === 'doctor') bookingState.doctor = el.querySelector('div > div:first-child')?.textContent.trim();
  if (type === 'time') bookingState.time = el.textContent.trim();
}

function goToStep(n) {
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('step-' + n) || document.getElementById('step-success');
  if (target) target.classList.add('active');

  const items = document.querySelectorAll('#stepProgress .step-item');
  items.forEach((item, i) => {
    item.classList.remove('active', 'completed');
    if (i + 1 < n) item.classList.add('completed');
    else if (i + 1 === n) item.classList.add('active');
  });

  if (n === 6) buildConfirmSummary();
}

function nextStep() {
  if (currentStep < totalSteps) { currentStep++; goToStep(currentStep); }
}
function prevStep() {
  if (currentStep > 1) { currentStep--; goToStep(currentStep); }
}

function buildConfirmSummary() {
  const fn = document.getElementById('firstName')?.value || '—';
  const ln = document.getElementById('lastName')?.value || '';
  const ph = document.getElementById('phone')?.value || '—';
  const em = document.getElementById('email')?.value || '—';
  bookingState.patient = { name: fn + ' ' + ln, phone: ph, email: em };

  const box = document.getElementById('confirmSummary');
  const rows = [
    ['Service', bookingState.service || 'Not selected'],
    ['Doctor', bookingState.doctor || 'Not selected'],
    ['Date', bookingState.date || 'Not selected'],
    ['Time', bookingState.time || 'Not selected'],
    ['Patient', bookingState.patient.name],
    ['Contact', bookingState.patient.phone],
  ];
  box.innerHTML = rows.map(r => `<div class="confirm-row"><span class="confirm-key">${r[0]}</span><span class="confirm-val">${r[1]}</span></div>`).join('');
}

function confirmBooking() {
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-success').classList.add('active');
  document.getElementById('stepProgress').style.opacity = '0';
  const ss = document.getElementById('successSummary');
  ss.innerHTML = `<span class="confirm-key">Appointment</span><span class="confirm-val">${bookingState.service || 'Dental Consultation'} — ${bookingState.date || 'TBC'} ${bookingState.time || ''}</span>`;
}

function resetBooking() {
  currentStep = 1;
  bookingState.service = bookingState.doctor = bookingState.date = bookingState.time = '';
  document.querySelectorAll('.option-btn, .doctor-option, .time-slot, .cal-day').forEach(e => e.classList.remove('selected'));
  document.getElementById('stepProgress').style.opacity = '1';
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-1').classList.add('active');
  goToStep(1);
}

// ── CALENDAR ──
let calYear, calMonth;
function initCalendar() {
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
  renderCalendar();
}
function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
}
function renderCalendar() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('calMonthLabel').textContent = months[calMonth] + ' ' + calYear;
  const grid = document.getElementById('calGrid');
  const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const today = new Date();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  let html = days.map(d => `<div class="cal-header">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calYear, calMonth, d);
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isTodayDate = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
    const cls = `cal-day${isPast ? ' disabled' : ''}${isTodayDate ? ' today' : ''}`;
    const dateStr = `${d} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][calMonth]} ${calYear}`;
    html += `<div class="${cls}" onclick="selectCal(this,'${dateStr}')">${d}</div>`;
  }
  grid.innerHTML = html;
}
function selectCal(el, dateStr) {
  if (el.classList.contains('disabled')) return;
  document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
  bookingState.date = dateStr;
}
initCalendar();
