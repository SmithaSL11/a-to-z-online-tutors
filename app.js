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
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.className = 'toast', 3000);
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

  // Also add as a student
  const students = DB.get('students');
  const courseMap = DB.get('courses');
  const enrolledIds = data.courses.map(cName => {
    const c = courseMap.find(x => x.name === cName);
    return c ? c.id : null;
  }).filter(Boolean);

  students.push({
    id: DB.nextId('students'),
    name: data.studentName,
    parent: data.parentName,
    parentEmail: data.parentEmail,
    phone: data.phone,
    grade: data.grade,
    courses: enrolledIds,
    sessionType: data.sessionType,
    status: 'active',
    notes: data.notes,
    createdAt: data.registeredAt
  });
  DB.set('students', students);

  showToast(`${data.studentName} registered successfully!`, 'success');
  logActivity(`New registration: ${data.studentName} - ${data.courses.join(', ')}`);
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
  el.innerHTML = regs.map(r => `
    <div class="list-item">
      <div class="list-item-left">
        <span class="list-item-title">${r.studentName}</span>
        <span class="list-item-sub">${r.courses.join(', ')}</span>
        <span class="list-item-sub">${r.parentName} &middot; ${r.phone}</span>
      </div>
      <div class="list-item-right">
        <span class="badge badge-${r.sessionType === 'group' ? 'group' : '1on1'}">${r.sessionType === 'group' ? 'Group' : '1-on-1'}</span>
        <br>${timeAgo(r.registeredAt)}
      </div>
    </div>`).join('');
}

// ── Render: Dashboard ──
function renderDashboard() {
  document.getElementById('stat-teachers').textContent = DB.get('teachers').length;
  document.getElementById('stat-students').textContent = DB.get('students').length;
  document.getElementById('stat-courses').textContent = DB.get('courses').length;
  document.getElementById('stat-sessions').textContent = DB.get('sessions').length;

  const sessions = DB.get('sessions')
    .filter(s => new Date(s.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    .slice(0, 5);

  const teachers = DB.get('teachers');
  const courses = DB.get('courses');

  const upEl = document.getElementById('upcoming-sessions');
  if (sessions.length === 0) {
    upEl.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9200;</div><p>No upcoming sessions</p></div>';
  } else {
    upEl.innerHTML = sessions.map(s => {
      const course = courses.find(c => c.id == s.courseId);
      const teacher = teachers.find(t => t.id == s.teacherId);
      return `<div class="list-item">
        <div class="list-item-left">
          <span class="list-item-title">${course ? course.name : 'Unknown'}</span>
          <span class="list-item-sub">${teacher ? teacher.name : ''} &middot; ${(s.studentIds || []).length} student(s)</span>
        </div>
        <div class="list-item-right">${formatDate(s.date)} ${s.time}</div>
      </div>`;
    }).join('');
  }

  const activity = DB.get('activity').slice(0, 8);
  const actEl = document.getElementById('recent-activity');
  if (activity.length === 0) {
    actEl.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9998;</div><p>No recent activity</p></div>';
  } else {
    actEl.innerHTML = activity.map(a => `
      <div class="list-item">
        <span class="list-item-title">${a.msg}</span>
        <span class="list-item-right">${timeAgo(a.time)}</span>
      </div>`).join('');
  }
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
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9830;</div><p>No courses yet. Add your first course!</p></div>';
    return;
  }

  el.innerHTML = courses.map(c => {
    const teacher = teachers.find(t => t.id == c.teacherId);
    const enrolled = students.filter(s => (s.courses || []).includes(c.id)).length;
    return `<div class="course-card ${c.category === 'foundation' ? 'foundation' : ''}" onclick="openModal('course', ${c.id})">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <h4>${c.name}</h4>
        <span class="badge badge-${c.category}">${c.category === 'ap' ? 'AP Level' : 'Foundation'}</span>
      </div>
      <div class="course-meta">${teacher ? teacher.name : 'Unassigned'} &middot; ${c.subject || ''} &middot; ${c.totalHours || 45}hrs</div>
      ${c.description ? `<p style="font-size:13px;color:var(--gray-500);margin-bottom:12px">${c.description}</p>` : ''}
      <div class="course-stats">
        <span>${enrolled} student(s)</span>
        <span>$${c.rate1on1}/hr (1:1) &middot; $${c.rateGroup}/hr (group)</span>
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

// ── Seed demo data ──
function seedIfEmpty() {
  if (DB.get('teachers').length > 0) return;

  DB.set('teachers', [
    {
      id: 1,
      name: 'Ashish Garg',
      email: 'gargashu94@gmail.com',
      phone: '+91 6283335390',
      specialization: 'Chemistry',
      rate1on1: 28,
      rateGroup: 15,
      qualifications: 'M.Sc Chemistry, IIT Roorkee (8.5 CGPA) | IIT JAM AIR 154, NET JRF AIR 51 | 9 years teaching experience',
      profileUrl: 'https://www.teacheron.com/tutor/2IDf',
      status: 'active',
      createdAt: '2026-03-01T00:00:00Z'
    }
  ]);

  DB.set('courses', [
    { id: 1, name: 'AP Chemistry', category: 'ap', subject: 'Chemistry', totalHours: 45, teacherId: 1, rate1on1: 28, rateGroup: 15, description: 'Complete AP Chemistry preparation - Summer 2026' },
    { id: 2, name: 'AP Physics', category: 'ap', subject: 'Physics', totalHours: 45, teacherId: 1, rate1on1: 28, rateGroup: 15, description: 'AP Physics 1 & 2 summer intensive' },
    { id: 3, name: 'AP Calculus', category: 'ap', subject: 'Mathematics', totalHours: 40, teacherId: 1, rate1on1: 28, rateGroup: 15, description: 'AP Calculus AB/BC summer course' },
    { id: 4, name: 'AP Biology', category: 'ap', subject: 'Biology', totalHours: 45, teacherId: 1, rate1on1: 28, rateGroup: 15, description: 'AP Biology complete preparation' },
    { id: 5, name: 'AP Statistics', category: 'ap', subject: 'Statistics', totalHours: 35, teacherId: 1, rate1on1: 28, rateGroup: 15, description: 'AP Statistics summer prep' },
    { id: 6, name: 'Organic Chemistry', category: 'ap', subject: 'Organic Chemistry', totalHours: 40, teacherId: 1, rate1on1: 28, rateGroup: 15, description: 'Organic Chemistry fundamentals to advanced' },
    { id: 7, name: 'Honors Chemistry', category: 'foundation', subject: 'Chemistry', totalHours: 35, teacherId: 1, rate1on1: 25, rateGroup: 15, description: 'Foundation honors chemistry course' },
    { id: 8, name: 'Pre-Calculus', category: 'foundation', subject: 'Mathematics', totalHours: 35, teacherId: 1, rate1on1: 25, rateGroup: 15, description: 'Pre-calculus fundamentals & preparation' },
    { id: 9, name: 'Trigonometry', category: 'foundation', subject: 'Mathematics', totalHours: 30, teacherId: 1, rate1on1: 25, rateGroup: 15, description: 'Trigonometry foundations' },
    { id: 10, name: 'Algebra', category: 'foundation', subject: 'Mathematics', totalHours: 30, teacherId: 1, rate1on1: 25, rateGroup: 15, description: 'Algebra I & II fundamentals' }
  ]);

  DB.set('students', [
    { id: 1, name: 'Emma Thompson', parent: 'Sarah Thompson', parentEmail: 'sarah.t@email.com', phone: '+1 555-0101', grade: '11', courses: [1, 3], sessionType: '1on1', status: 'active', createdAt: '2026-03-15T00:00:00Z' },
    { id: 2, name: 'James Wilson', parent: 'Robert Wilson', parentEmail: 'r.wilson@email.com', phone: '+1 555-0102', grade: '10', courses: [7, 8], sessionType: 'group', status: 'active', createdAt: '2026-03-16T00:00:00Z' },
    { id: 3, name: 'Sophia Chen', parent: 'Li Chen', parentEmail: 'li.chen@email.com', phone: '+1 555-0103', grade: '11', courses: [1, 4], sessionType: '1on1', status: 'active', createdAt: '2026-03-17T00:00:00Z' },
    { id: 4, name: 'Aiden Patel', parent: 'Priya Patel', parentEmail: 'priya.p@email.com', phone: '+1 555-0104', grade: '10', courses: [7, 10], sessionType: 'group', status: 'active', createdAt: '2026-03-18T00:00:00Z' },
    { id: 5, name: 'Olivia Martinez', parent: 'Carlos Martinez', parentEmail: 'carlos.m@email.com', phone: '+1 555-0105', grade: '12', courses: [5, 6], sessionType: '1on1', status: 'active', createdAt: '2026-03-20T00:00:00Z' }
  ]);

  // Seed sessions on alternate days
  const sessions = [];
  let sid = 1;
  const startDate = new Date('2026-06-01');
  for (let week = 0; week < 4; week++) {
    for (const dayOffset of [0, 2, 4]) { // Mon, Wed, Fri - alternate days
      const d = new Date(startDate);
      d.setDate(d.getDate() + week * 7 + dayOffset);
      const dateStr = d.toISOString().split('T')[0];
      sessions.push(
        { id: sid++, courseId: 1, teacherId: 1, studentIds: [1, 3], date: dateStr, time: '09:00', duration: 1, type: '1on1', notes: 'AP Chemistry' },
        { id: sid++, courseId: 7, teacherId: 1, studentIds: [2, 4], date: dateStr, time: '11:00', duration: 1, type: 'group', notes: 'Honors Chemistry - Group' },
        { id: sid++, courseId: 3, teacherId: 1, studentIds: [1], date: dateStr, time: '14:00', duration: 1, type: '1on1', notes: 'AP Calculus' },
        { id: sid++, courseId: 5, teacherId: 1, studentIds: [5], date: dateStr, time: '16:00', duration: 1, type: '1on1', notes: 'AP Statistics' }
      );
    }
  }
  DB.set('sessions', sessions);
  logActivity('Welcome to A to Z Online Tutors! Demo data loaded.');
  logActivity('Summer 2026 batch: June 1 - Aug 25 | 3 classes/week');
}

// ── Init ──
seedIfEmpty();
renderDashboard();
