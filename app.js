// ── EmailJS Configuration ──
// To enable email notifications:
// 1. Create a free account at https://www.emailjs.com
// 2. Create a service (e.g. Gmail) and note the Service ID
// 3. Create an email template and note the Template ID
// 4. Copy your Public Key from the EmailJS dashboard
// 5. Replace the placeholder values below
const EMAILJS_CONFIG = {
  publicKey: 'vVS2o8DXEc-QF-YpM',
  serviceId: 'service_kf7levo',
  templateId: 'template_tcu939f',          // registration template
  feedbackTemplateId: 'template_vogfb5m'
};
// Template variables expected: student_name, school_name, grade, session_type, courses, parent_name, parent_email, phone, location, notes
const OWNER_EMAIL = 'gargashu94@gmail.com';
const OWNER_WHATSAPP = '+916283335390';

// ── Data Store (localStorage) ──
const DB = {
  get(key) { return JSON.parse(localStorage.getItem('atz_' + key) || '[]'); },
  set(key, val) { localStorage.setItem('atz_' + key, JSON.stringify(val)); },
  nextId(key) {
    const items = this.get(key);
    return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
  }
};

// ── Navigation ──
document.querySelectorAll('.nav-links li').forEach(li => {
  li.addEventListener('click', () => {
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    li.classList.add('active');
    document.getElementById('page-' + li.dataset.page).classList.add('active');
    const page = li.dataset.page;
    if (page === 'dashboard') renderDashboard();
    if (page === 'teachers') renderTeachers();
    if (page === 'students') renderStudents();
    if (page === 'courses') renderCourses();
    if (page === 'schedule') renderSchedule();
    if (page === 'billing') renderBilling();
    if (page === 'registration') renderRegistrations();
  });
});

// ── Toast ──
let toastTimeoutId = null;

function showToast(msg, type = '', { html = false, duration = 3000 } = {}) {
  const t = document.getElementById('toast');
  if (toastTimeoutId) clearTimeout(toastTimeoutId);
  if (html) { t.innerHTML = msg; } else { t.textContent = msg; }
  t.className = 'toast show ' + type;
  toastTimeoutId = setTimeout(() => { t.className = 'toast'; t.textContent = ''; toastTimeoutId = null; }, duration);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ── Modal ──
let currentModal = null;
let editingId = null;

function openModal(type, id = null) {
  currentModal = type;
  editingId = id;
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('modal-form');

  const existing = id ? DB.get(type + 's').find(i => i.id === id) : null;

  if (type === 'teacher') {
    title.textContent = id ? 'Edit Teacher' : 'Add Teacher';
    form.innerHTML = buildTeacherForm(existing);
  } else if (type === 'student') {
    title.textContent = id ? 'Edit Student' : 'Add Student';
    form.innerHTML = buildStudentForm(existing);
  } else if (type === 'course') {
    title.textContent = id ? 'Edit Course' : 'Add Course';
    form.innerHTML = buildCourseForm(existing);
  } else if (type === 'session') {
    title.textContent = id ? 'Edit Session' : 'Add Session';
    form.innerHTML = buildSessionForm(existing);
  }

  overlay.classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('modal-overlay').classList.remove('open');
  currentModal = null;
  editingId = null;
}

// ── Form Builders ──
function buildTeacherForm(data) {
  const d = data || {};
  return `
    <div class="form-group">
      <label>Full Name</label>
      <input name="name" required value="${d.name || ''}" placeholder="e.g. Ashish Garg">
    </div>
    <div class="form-group">
      <label>Email</label>
      <input name="email" type="email" required value="${d.email || ''}" placeholder="teacher@email.com">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Phone</label>
        <input name="phone" value="${d.phone || ''}" placeholder="+91 6283335390">
      </div>
      <div class="form-group">
        <label>Specialization</label>
        <select name="specialization">
          <option value="Chemistry" ${d.specialization === 'Chemistry' ? 'selected' : ''}>Chemistry</option>
          <option value="Physics" ${d.specialization === 'Physics' ? 'selected' : ''}>Physics</option>
          <option value="Mathematics" ${d.specialization === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
          <option value="Biology" ${d.specialization === 'Biology' ? 'selected' : ''}>Biology</option>
          <option value="Statistics" ${d.specialization === 'Statistics' ? 'selected' : ''}>Statistics</option>
          <option value="Organic Chemistry" ${d.specialization === 'Organic Chemistry' ? 'selected' : ''}>Organic Chemistry</option>
          <option value="Computer Science" ${d.specialization === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Hourly Rate - 1-on-1 ($)</label>
        <input name="rate1on1" type="number" value="${d.rate1on1 || 28}" placeholder="28">
      </div>
      <div class="form-group">
        <label>Hourly Rate - Group/student ($)</label>
        <input name="rateGroup" type="number" value="${d.rateGroup || 15}" placeholder="15">
      </div>
    </div>
    <div class="form-group">
      <label>Qualifications</label>
      <textarea name="qualifications" rows="2" placeholder="e.g. M.Sc Chemistry, IIT Roorkee">${d.qualifications || ''}</textarea>
    </div>
    <div class="form-group">
      <label>TeacherOn Profile URL</label>
      <input name="profileUrl" value="${d.profileUrl || ''}" placeholder="https://www.teacheron.com/tutor/...">
    </div>
    <div class="form-group">
      <label>Status</label>
      <select name="status">
        <option value="active" ${d.status === 'active' ? 'selected' : ''}>Active</option>
        <option value="inactive" ${d.status === 'inactive' ? 'selected' : ''}>Inactive</option>
      </select>
    </div>
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">${data ? 'Update' : 'Add'} Teacher</button>
    </div>`;
}

function buildStudentForm(data) {
  const d = data || {};
  return `
    <div class="form-group">
      <label>Student Name</label>
      <input name="name" required value="${d.name || ''}" placeholder="Student full name">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Parent/Guardian Name</label>
        <input name="parent" value="${d.parent || ''}" placeholder="Parent name">
      </div>
      <div class="form-group">
        <label>Parent Email</label>
        <input name="parentEmail" type="email" value="${d.parentEmail || ''}" placeholder="parent@email.com">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Phone</label>
        <input name="phone" value="${d.phone || ''}" placeholder="+1 (555) 000-0000">
      </div>
      <div class="form-group">
        <label>Grade Level</label>
        <select name="grade">
          <option value="">Select grade</option>
          ${[8,9,10,11,12].map(g => `<option value="${g}" ${d.grade == g ? 'selected' : ''}>Grade ${g}</option>`).join('')}
          <option value="college" ${d.grade === 'college' ? 'selected' : ''}>College</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Enrolled Courses</label>
      <select name="courses" multiple style="height:120px">
        ${DB.get('courses').map(c => `<option value="${c.id}" ${(d.courses || []).includes(c.id) ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
      <small style="color:var(--gray-500)">Hold Ctrl/Cmd to select multiple</small>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Session Type</label>
        <select name="sessionType">
          <option value="1on1" ${d.sessionType === '1on1' ? 'selected' : ''}>1-on-1 ($25-28/hr)</option>
          <option value="group" ${d.sessionType === 'group' ? 'selected' : ''}>Group of 3-4 ($15/student/hr)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          <option value="active" ${d.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${d.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea name="notes" rows="2" placeholder="Any special notes...">${d.notes || ''}</textarea>
    </div>
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">${data ? 'Update' : 'Add'} Student</button>
    </div>`;
}

function buildCourseForm(data) {
  const d = data || {};
  return `
    <div class="form-group">
      <label>Course Name</label>
      <input name="name" required value="${d.name || ''}" placeholder="e.g. AP Chemistry">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Category</label>
        <select name="category">
          <option value="ap" ${d.category === 'ap' ? 'selected' : ''}>AP Level ($28/hr)</option>
          <option value="foundation" ${d.category === 'foundation' ? 'selected' : ''}>Foundation ($25/hr)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Subject Area</label>
        <select name="subject">
          <option value="Chemistry" ${d.subject === 'Chemistry' ? 'selected' : ''}>Chemistry</option>
          <option value="Physics" ${d.subject === 'Physics' ? 'selected' : ''}>Physics</option>
          <option value="Mathematics" ${d.subject === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
          <option value="Biology" ${d.subject === 'Biology' ? 'selected' : ''}>Biology</option>
          <option value="Statistics" ${d.subject === 'Statistics' ? 'selected' : ''}>Statistics</option>
          <option value="Organic Chemistry" ${d.subject === 'Organic Chemistry' ? 'selected' : ''}>Organic Chemistry</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Total Hours</label>
        <input name="totalHours" type="number" value="${d.totalHours || 45}" placeholder="45">
      </div>
      <div class="form-group">
        <label>Assigned Teacher</label>
        <select name="teacherId">
          <option value="">Select teacher</option>
          ${DB.get('teachers').map(t => `<option value="${t.id}" ${d.teacherId == t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>1-on-1 Rate ($/hr)</label>
        <input name="rate1on1" type="number" value="${d.rate1on1 || (d.category === 'foundation' ? 25 : 28)}" placeholder="28">
      </div>
      <div class="form-group">
        <label>Group Rate ($/student/hr)</label>
        <input name="rateGroup" type="number" value="${d.rateGroup || 15}" placeholder="15">
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea name="description" rows="2" placeholder="Course description...">${d.description || ''}</textarea>
    </div>
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">${data ? 'Update' : 'Add'} Course</button>
    </div>`;
}

function buildSessionForm(data) {
  const d = data || {};
  return `
    <div class="form-group">
      <label>Course</label>
      <select name="courseId" required>
        <option value="">Select course</option>
        ${DB.get('courses').map(c => `<option value="${c.id}" ${d.courseId == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Teacher</label>
      <select name="teacherId" required>
        <option value="">Select teacher</option>
        ${DB.get('teachers').map(t => `<option value="${t.id}" ${d.teacherId == t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Students</label>
      <select name="studentIds" multiple style="height:80px">
        ${DB.get('students').map(s => `<option value="${s.id}" ${(d.studentIds || []).includes(s.id) ? 'selected' : ''}>${s.name}</option>`).join('')}
      </select>
      <small style="color:var(--gray-500)">Hold Ctrl/Cmd to select multiple</small>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Date</label>
        <input name="date" type="date" required value="${d.date || ''}">
      </div>
      <div class="form-group">
        <label>Time</label>
        <input name="time" type="time" required value="${d.time || ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Duration (hours)</label>
        <input name="duration" type="number" step="0.5" value="${d.duration || 1}" min="0.5" max="4">
      </div>
      <div class="form-group">
        <label>Session Type</label>
        <select name="type">
          <option value="1on1" ${d.type === '1on1' ? 'selected' : ''}>1-on-1</option>
          <option value="group" ${d.type === 'group' ? 'selected' : ''}>Group (3-4 kids)</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea name="notes" rows="2" placeholder="Session topic or notes...">${d.notes || ''}</textarea>
    </div>
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">${data ? 'Update' : 'Add'} Session</button>
    </div>`;
}

// ── Form Submit ──
function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const data = {};

  for (const [k, v] of fd.entries()) {
    if (k === 'studentIds' || k === 'courses') {
      if (!data[k]) data[k] = [];
      data[k].push(Number(v));
    } else {
      data[k] = v;
    }
  }

  const multiSelects = form.querySelectorAll('select[multiple]');
  multiSelects.forEach(sel => {
    data[sel.name] = Array.from(sel.selectedOptions).map(o => Number(o.value));
  });

  const key = currentModal + 's';
  const items = DB.get(key);

  if (editingId) {
    const idx = items.findIndex(i => i.id === editingId);
    items[idx] = { ...items[idx], ...data };
    DB.set(key, items);
    showToast(`${currentModal} updated successfully`, 'success');
    logActivity(`Updated ${currentModal}: ${data.name || ''}`);
  } else {
    data.id = DB.nextId(key);
    data.createdAt = new Date().toISOString();
    items.push(data);
    DB.set(key, items);
    showToast(`${currentModal} added successfully`, 'success');
    logActivity(`Added new ${currentModal}: ${data.name || ''}`);
  }

  closeModal();
  refreshCurrentPage();
}

function deleteItem(type, id) {
  if (!confirm(`Delete this ${type}?`)) return;
  const key = type + 's';
  const items = DB.get(key).filter(i => i.id !== id);
  DB.set(key, items);
  showToast(`${type} deleted`, 'error');
  logActivity(`Deleted ${type} #${id}`);
  refreshCurrentPage();
}

function logActivity(msg) {
  const log = DB.get('activity');
  log.unshift({ msg, time: new Date().toISOString() });
  if (log.length > 50) log.length = 50;
  DB.set('activity', log);
}

function refreshCurrentPage() {
  const active = document.querySelector('.nav-links li.active');
  if (active) active.click();
}

// ── Registration Handler ──
function handleRegistration(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const data = {
    studentName: fd.get('studentName'),
    schoolName: fd.get('schoolName'),
    grade: fd.get('grade'),
    sessionType: fd.get('sessionType'),
    parentName: fd.get('parentName'),
    parentEmail: fd.get('parentEmail'),
    phone: fd.get('phone'),
    location: fd.get('location'),
    notes: fd.get('notes'),
    courses: fd.getAll('courses'),
    registeredAt: new Date().toISOString()
  };

  const regs = DB.get('registrations');
  data.id = regs.length ? Math.max(...regs.map(r => r.id)) + 1 : 1;
  regs.push(data);
  DB.set('registrations', regs);

  // Create a student record so courses, schedule, and billing can reference them
  const allCourses = DB.get('courses');
  const courseIds = data.courses
    .map(name => { const c = allCourses.find(x => x.name === name); return c ? c.id : null; })
    .filter(Boolean);
  const student = {
    id: DB.nextId('students'),
    name: data.studentName,
    parent: data.parentName,
    parentEmail: data.parentEmail,
    phone: data.phone,
    grade: data.grade,
    courses: courseIds,
    sessionType: data.sessionType,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  const students = DB.get('students');
  students.push(student);
  DB.set('students', students);

  logActivity(`New registration: ${escapeHtml(data.studentName)} (${escapeHtml(data.schoolName)}) - ${data.courses.join(', ')}`);

  // Send email notification to owner via EmailJS
  if (EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
      to_email: OWNER_EMAIL,
      student_name: data.studentName,
      school_name: data.schoolName,
      grade: data.grade,
      session_type: data.sessionType === 'group' ? 'Group of 3-4 Kids' : 'One to One',
      courses: data.courses.join(', ') || 'Not selected',
      parent_name: data.parentName,
      parent_email: data.parentEmail,
      phone: data.phone,
      location: data.location || 'Not provided',
      notes: data.notes || 'None'
    }).catch(err => console.error('EmailJS error:', err));
  }

  // Show WhatsApp welcome link for student
  const welcomeMsg = encodeURIComponent(
    `Hello! Thank you for registering with A to Z Online Tutors. We will contact you soon. - Ashish Garg`
  );
  const cleanPhone = data.phone.replace(/\D/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${welcomeMsg}`;
  const safeName = escapeHtml(data.studentName);
  showToast(
    `${safeName} registered! <a href="${waLink}" target="_blank" style="color:#fff;text-decoration:underline;margin-left:8px">Send Welcome WhatsApp &#128172;</a>`,
    'success',
    { html: true, duration: 8000 }
  );

  form.reset();
  renderRegistrations();
}

function renderRegistrations() {
  const regs = DB.get('registrations').slice().reverse();
  const el = document.getElementById('registrations-list');
  if (!el) return;

  if (regs.length === 0) {
    el.innerHTML = '<div class="empty-state"><p>No registrations yet</p></div>';
    return;
  }
  // Only show student name and school name — no personal data visible to anyone else
  el.innerHTML = regs.map(r => `
    <div class="list-item">
      <div class="list-item-left">
        <span class="list-item-title">${r.studentName}</span>
        <span class="list-item-sub">${r.schoolName || ''}</span>
      </div>
      <div class="list-item-right">
        ${timeAgo(r.registeredAt)}
      </div>
    </div>`).join('');
}

// ── Render: Dashboard ──
function renderDashboard() {
  document.getElementById('stat-courses').textContent = DB.get('courses').length;
  document.getElementById('stat-registrations').textContent = DB.get('registrations').length;
  const reviews = DB.get('feedback');
  document.getElementById('stat-reviews').textContent = reviews.length;
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';
  document.getElementById('stat-rating').textContent = avg === '—' ? '—' : avg + ' ★';
  renderReviews();
  initStarRating();
}

// ── Render: Teachers ──
function renderTeachers() {
  const q = (document.getElementById('search-teachers').value || '').toLowerCase();
  let teachers = DB.get('teachers');
  if (q) teachers = teachers.filter(t => t.name.toLowerCase().includes(q) || (t.specialization || '').toLowerCase().includes(q));

  const el = document.getElementById('teachers-list');
  if (teachers.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9733;</div><p>No teachers yet. Add your first teacher!</p></div>';
    return;
  }
  el.innerHTML = `<table>
    <thead><tr><th>Name</th><th>Specialization</th><th>Rate (1:1 / Group)</th><th>Profile</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${teachers.map(t => `<tr>
      <td><strong>${t.name}</strong><br><small style="color:var(--gray-500)">${t.email || ''}</small><br><small style="color:var(--gray-500)">${t.phone || ''}</small></td>
      <td>${t.specialization || '-'}</td>
      <td>$${t.rate1on1 || 28} / $${t.rateGroup || 15}</td>
      <td>${t.profileUrl ? `<a href="${t.profileUrl}" target="_blank" style="color:var(--primary)">View</a>` : '-'}</td>
      <td><span class="badge badge-${t.status || 'active'}">${t.status || 'active'}</span></td>
      <td class="actions">
        <button class="action-btn edit" onclick="openModal('teacher', ${t.id})">Edit</button>
        <button class="action-btn delete" onclick="deleteItem('teacher', ${t.id})">Del</button>
      </td>
    </tr>`).join('')}</tbody>
  </table>`;
}

// ── Render: Students ──
function renderStudents() {
  const q = (document.getElementById('search-students').value || '').toLowerCase();
  let students = DB.get('students');
  if (q) students = students.filter(s => s.name.toLowerCase().includes(q) || (s.parent || '').toLowerCase().includes(q));

  const courses = DB.get('courses');
  const el = document.getElementById('students-list');
  if (students.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9679;</div><p>No students yet. Add your first student!</p></div>';
    return;
  }
  el.innerHTML = `<table>
    <thead><tr><th>Student</th><th>Parent</th><th>Grade</th><th>Courses</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${students.map(s => {
      const enrolled = (s.courses || []).map(cid => { const c = courses.find(x => x.id === cid); return c ? c.name : ''; }).filter(Boolean).join(', ');
      return `<tr>
        <td><strong>${s.name}</strong></td>
        <td>${s.parent || '-'}<br><small style="color:var(--gray-500)">${s.parentEmail || ''}</small></td>
        <td>${s.grade || '-'}</td>
        <td><small>${enrolled || '-'}</small></td>
        <td><span class="badge badge-${s.sessionType || '1on1'}">${s.sessionType === 'group' ? 'Group' : '1-on-1'}</span></td>
        <td><span class="badge badge-${s.status || 'active'}">${s.status || 'active'}</span></td>
        <td class="actions">
          <button class="action-btn edit" onclick="openModal('student', ${s.id})">Edit</button>
          <button class="action-btn delete" onclick="deleteItem('student', ${s.id})">Del</button>
        </td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

// ── Render: Courses ──
function waLink(courseName) {
  const phone = OWNER_WHATSAPP.replace(/\D/g, '');
  const msg = encodeURIComponent('Hi! I am interested in ' + courseName + '. Could you share the pricing details?');
  return 'https://wa.me/' + phone + '?text=' + msg;
}

let courseFilter = 'all';
function filterCourses(filter, btn) {
  courseFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCourses();
}

function renderCourses() {
  let courses = DB.get('courses');
  if (courseFilter !== 'all') courses = courses.filter(c => c.category === courseFilter);

  const teachers = DB.get('teachers');
  const students = DB.get('students');
  const el = document.getElementById('courses-list');

  if (courses.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9830;</div><p>No courses available yet.</p></div>';
    return;
  }

  el.innerHTML = courses.map(c => {
    const teacher = teachers.find(t => t.id == c.teacherId);
    const enrolled = students.filter(s => (s.courses || []).includes(c.id)).length;
    return `<div class="course-card ${c.category === 'foundation' ? 'foundation' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <h4>${c.name}</h4>
        <span class="badge badge-${c.category}">${c.category === 'ap' ? 'AP Level' : 'Foundation'}</span>
      </div>
      <div class="course-meta">${teacher ? teacher.name : 'Unassigned'} &middot; ${c.subject || ''} &middot; ${c.totalHours || 45}hrs</div>
      ${c.description ? `<p style="font-size:13px;color:var(--gray-500);margin-bottom:12px">${c.description}</p>` : ''}
      <div class="course-stats">
        <span>${enrolled} student(s)</span>
        <a href="${waLink(c.name)}" target="_blank" class="course-wa-btn">&#128172; Ask on WhatsApp +91 6283335390</a>
      </div>
    </div>`;
  }).join('');
}

// ── Render: Schedule ──
let currentWeekStart = getMonday(new Date());

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function changeWeek(dir) {
  currentWeekStart.setDate(currentWeekStart.getDate() + dir * 7);
  renderSchedule();
}

function renderSchedule() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const sessions = DB.get('sessions');
  const courses = DB.get('courses');
  const teachers = DB.get('teachers');
  const today = new Date().toDateString();

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    weekDates.push(d);
  }

  const startStr = formatDate(weekDates[0].toISOString().split('T')[0]);
  const endStr = formatDate(weekDates[6].toISOString().split('T')[0]);
  document.getElementById('week-label').textContent = `${startStr} - ${endStr}`;

  const grid = document.getElementById('schedule-grid');
  grid.innerHTML = weekDates.map((date, i) => {
    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.toDateString() === today;
    const daySessions = sessions.filter(s => s.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));

    return `<div class="schedule-day">
      <div class="schedule-day-header ${isToday ? 'today' : ''}">
        ${days[i]}<br>${date.getDate()}
      </div>
      ${daySessions.map(s => {
        const course = courses.find(c => c.id == s.courseId);
        const teacher = teachers.find(t => t.id == s.teacherId);
        const isGroup = s.type === 'group';
        return `<div class="session-block ${isGroup ? 'group-session' : ''}" onclick="openModal('session', ${s.id})">
          <div class="session-time">${s.time}</div>
          <div class="session-info">${course ? course.name : 'N/A'}</div>
          <div class="session-info">${teacher ? teacher.name : ''}</div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

// ── Render: Billing ──
function renderBilling() {
  const invoices = DB.get('invoices');

  let total = 0, pending = 0, paid = 0;
  invoices.forEach(inv => {
    total += inv.amount;
    if (inv.status === 'paid') paid += inv.amount;
    else pending += inv.amount;
  });

  document.getElementById('billing-total').textContent = '$' + total.toFixed(0);
  document.getElementById('billing-pending').textContent = '$' + pending.toFixed(0);
  document.getElementById('billing-paid').textContent = '$' + paid.toFixed(0);

  const students = DB.get('students');
  const el = document.getElementById('billing-list');
  if (invoices.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">$</div><p>No invoices yet. Click "Generate Invoices" to create them from scheduled sessions.</p></div>';
    return;
  }

  el.innerHTML = `<table>
    <thead><tr><th>Invoice #</th><th>Student</th><th>Sessions</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${invoices.map(inv => {
      const student = students.find(s => s.id === inv.studentId);
      return `<tr>
        <td>#${String(inv.id).padStart(4, '0')}</td>
        <td>${student ? student.name : 'Unknown'}</td>
        <td>${inv.sessionCount} sessions</td>
        <td><strong>$${inv.amount.toFixed(2)}</strong></td>
        <td><span class="badge badge-${inv.status}">${inv.status}</span></td>
        <td class="actions">
          <button class="action-btn edit" onclick="toggleInvoiceStatus(${inv.id})">${inv.status === 'paid' ? 'Mark Pending' : 'Mark Paid'}</button>
        </td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

function generateInvoices() {
  const sessions = DB.get('sessions');
  const courses = DB.get('courses');

  if (sessions.length === 0) {
    showToast('No sessions to invoice', 'error');
    return;
  }

  const studentSessions = {};
  sessions.forEach(s => {
    (s.studentIds || []).forEach(sid => {
      if (!studentSessions[sid]) studentSessions[sid] = [];
      studentSessions[sid].push(s);
    });
  });

  const invoices = DB.get('invoices');
  let count = 0;

  Object.entries(studentSessions).forEach(([sid, sess]) => {
    sid = Number(sid);
    const existing = invoices.find(inv => inv.studentId === sid && inv.status === 'pending');
    if (existing) return;

    let amount = 0;
    sess.forEach(s => {
      const course = courses.find(c => c.id == s.courseId);
      const rate = s.type === 'group' ? (course ? Number(course.rateGroup) : 15) : (course ? Number(course.rate1on1) : 28);
      amount += rate * (Number(s.duration) || 1);
    });

    invoices.push({
      id: invoices.length ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
      studentId: sid,
      sessionCount: sess.length,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    count++;
  });

  DB.set('invoices', invoices);
  showToast(`Generated ${count} invoice(s)`, 'success');
  renderBilling();
}

function toggleInvoiceStatus(id) {
  const invoices = DB.get('invoices');
  const inv = invoices.find(i => i.id === id);
  if (inv) {
    inv.status = inv.status === 'paid' ? 'pending' : 'paid';
    DB.set('invoices', invoices);
    renderBilling();
    showToast(`Invoice #${String(id).padStart(4, '0')} marked as ${inv.status}`, 'success');
  }
}

// ── Helpers ──
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  return days + 'd ago';
}

// ── Feedback ──
const FEEDBACK_TAGS = {
  student: ['Clear explanations', 'Fun & engaging', 'Great practice problems', 'Very patient', 'Improved my grades', 'Well organized'],
  parent:  ['Regular progress updates', 'Easy to reach', 'Great value', 'My child improved', 'Professional', 'Flexible scheduling']
};
const RATING_LABELS = ['', 'Not good', 'Could be better', 'It was okay', 'Really good!', 'Absolutely loved it! '];

let feedbackRole = 'student';
let feedbackRating = 0;
let selectedTags = [];

function setFeedbackRole(role, btn) {
  feedbackRole = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFeedbackTags();
}

function renderFeedbackTags() {
  selectedTags = [];
  const el = document.getElementById('feedback-tags');
  el.innerHTML = FEEDBACK_TAGS[feedbackRole].map(tag =>
    `<span class="tag-chip" onclick="toggleTag(this, '${tag}')">${tag}</span>`
  ).join('');
}

function toggleTag(el, tag) {
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) {
    selectedTags.push(tag);
  } else {
    selectedTags = selectedTags.filter(t => t !== tag);
  }
}

let starRatingInitialized = false;

function initStarRating() {
  if (starRatingInitialized) return;
  starRatingInitialized = true;

  const stars = document.querySelectorAll('.star');
  const hint = document.getElementById('rating-hint');

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = Number(star.dataset.value);
      stars.forEach(s => s.classList.toggle('hovered', Number(s.dataset.value) <= val));
      hint.textContent = RATING_LABELS[val];
      hint.classList.add('rated');
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hovered'));
      hint.textContent = feedbackRating ? RATING_LABELS[feedbackRating] : 'Tap a star to rate';
      hint.classList.toggle('rated', feedbackRating > 0);
    });
    star.addEventListener('click', () => {
      feedbackRating = Number(star.dataset.value);
      document.getElementById('rating-value').value = feedbackRating;
      stars.forEach(s => {
        s.classList.toggle('selected', Number(s.dataset.value) <= feedbackRating);
        s.classList.remove('hovered');
      });
      hint.textContent = RATING_LABELS[feedbackRating];
      hint.classList.add('rated');
      // Reveal rest of form progressively
      ['tags-section', 'course-section', 'comment-section', 'name-section', 'feedback-submit-area']
        .forEach(id => { document.getElementById(id).style.display = ''; });
      renderFeedbackTags();
    });
  });
}

function handleFeedback(e) {
  e.preventDefault();
  if (!feedbackRating) { showToast('Please select a rating', 'error'); return; }

  const fd = new FormData(e.target);
  const entry = {
    id: Date.now(),
    role: feedbackRole,
    rating: feedbackRating,
    tags: [...selectedTags],
    course: fd.get('course') || '',
    comment: (fd.get('comment') || '').trim(),
    name: (fd.get('submitter_name') || '').trim() || 'Anonymous',
    submittedAt: new Date().toISOString()
  };

  const reviews = DB.get('feedback');
  reviews.unshift(entry);
  DB.set('feedback', reviews);

  // Email notification
  if (EMAILJS_CONFIG.feedbackTemplateId !== 'YOUR_FEEDBACK_TEMPLATE_ID') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.feedbackTemplateId, {
      to_email: OWNER_EMAIL,
      reviewer_name: entry.name,
      reviewer_role: entry.role.charAt(0).toUpperCase() + entry.role.slice(1),
      rating: '★'.repeat(entry.rating) + '☆'.repeat(5 - entry.rating),
      rating_number: entry.rating + ' / 5',
      course: entry.course || 'General',
      tags: entry.tags.join(', ') || 'None selected',
      comment: entry.comment || 'No comment left'
    }).catch(err => console.error('EmailJS feedback error:', err));
  }

  // Refresh stat cards
  const allReviews = DB.get('feedback');
  document.getElementById('stat-reviews').textContent = allReviews.length;
  const newAvg = (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1);
  document.getElementById('stat-rating').textContent = newAvg + ' ★';
  showToast('Thank you for your feedback!', 'success');
  e.target.reset();
  feedbackRating = 0;
  selectedTags = [];
  document.querySelectorAll('.star').forEach(s => s.classList.remove('selected', 'hovered'));
  document.getElementById('rating-hint').textContent = 'Tap a star to rate';
  document.getElementById('rating-hint').classList.remove('rated');
  ['tags-section', 'course-section', 'comment-section', 'name-section', 'feedback-submit-area']
    .forEach(id => { document.getElementById(id).style.display = 'none'; });
  renderReviews();
}

function renderReviews() {
  const reviews = DB.get('feedback');
  const el = document.getElementById('reviews-list');
  const avgEl = document.getElementById('reviews-avg');
  if (!el) return;

  if (reviews.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128172;</div><p>No reviews yet. Be the first!</p></div>';
    if (avgEl) avgEl.style.display = 'none';
    return;
  }

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  document.getElementById('avg-score').textContent = avg;
  document.getElementById('avg-stars').textContent = '★'.repeat(Math.round(avg));
  document.getElementById('avg-count').textContent = reviews.length + ' review' + (reviews.length > 1 ? 's' : '');
  if (avgEl) avgEl.style.display = '';

  el.innerHTML = reviews.map(r => `
    <div class="review-item">
      <div class="review-top">
        <span class="review-name">${r.name} <span style="font-weight:400;color:var(--gray-500);font-size:12px">&middot; ${r.role}</span></span>
        <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <div class="review-meta">${r.course || 'General'} &middot; ${timeAgo(r.submittedAt)}</div>
      ${r.tags.length ? `<div class="review-tags">${r.tags.map(t => `<span class="review-tag">${t}</span>`).join('')}</div>` : ''}
      ${r.comment ? `<div class="review-comment">"${r.comment}"</div>` : ''}
    </div>`).join('');
}

function renderFeedbackPage() {
  renderReviews();
  initStarRating();
}

// ── Seed Data ──
function seedDefaults() {
  if (DB.get('teachers').length === 0) {
    DB.set('teachers', [{
      id: 1, name: 'Ashish Garg', email: 'gargashu94@gmail.com',
      phone: '+91 6283335390', specialization: 'Chemistry', status: 'active',
      createdAt: new Date().toISOString()
    }]);
  }
  if (DB.get('courses').length === 0) {
    DB.set('courses', [
      { id: 1, name: 'AP Chemistry', subject: 'Chemistry', category: 'ap', teacherId: 1, totalHours: 45, rate1on1: 28, rateGroup: 15, description: 'Complete AP Chemistry preparation - Summer 2026' },
      { id: 2, name: 'AP Physics', subject: 'Physics', category: 'ap', teacherId: 1, totalHours: 45, rate1on1: 28, rateGroup: 15, description: 'AP Physics 1 & 2 summer intensive' },
      { id: 3, name: 'AP Calculus', subject: 'Mathematics', category: 'ap', teacherId: 1, totalHours: 40, rate1on1: 28, rateGroup: 15, description: 'AP Calculus AB/BC summer course' },
      { id: 4, name: 'AP Biology', subject: 'Biology', category: 'ap', teacherId: 1, totalHours: 45, rate1on1: 28, rateGroup: 15, description: 'AP Biology complete preparation' },
      { id: 5, name: 'AP Statistics', subject: 'Statistics', category: 'ap', teacherId: 1, totalHours: 35, rate1on1: 28, rateGroup: 15, description: 'AP Statistics summer prep' },
      { id: 6, name: 'Organic Chemistry', subject: 'Organic Chemistry', category: 'ap', teacherId: 1, totalHours: 40, rate1on1: 28, rateGroup: 15, description: 'Organic Chemistry fundamentals to advanced' },
      { id: 7, name: 'Honors Chemistry', subject: 'Chemistry', category: 'foundation', teacherId: 1, totalHours: 35, rate1on1: 25, rateGroup: 15, description: 'Foundation honors chemistry course' },
      { id: 8, name: 'Pre-Calculus', subject: 'Mathematics', category: 'foundation', teacherId: 1, totalHours: 35, rate1on1: 25, rateGroup: 15, description: 'Pre-calculus fundamentals & preparation' },
      { id: 9, name: 'Trigonometry', subject: 'Mathematics', category: 'foundation', teacherId: 1, totalHours: 30, rate1on1: 25, rateGroup: 15, description: 'Trigonometry foundations' },
      { id: 10, name: 'Algebra', subject: 'Mathematics', category: 'foundation', teacherId: 1, totalHours: 30, rate1on1: 25, rateGroup: 15, description: 'Algebra I & II fundamentals' }
    ]);
  }
}
seedDefaults();

// ── Init ──
renderDashboard();
