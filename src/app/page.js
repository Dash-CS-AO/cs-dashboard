'use client';

import { useState, useEffect } from 'react';
import { getTodaysAgents, getCycleInfo, AGENTS } from './data/agents';

function initials(name) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}
function getSerhantSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return <div className="toast">{message}</div>;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  const nav = [
    { id: 'overview', label: 'Overview', icon: 'ti-layout-dashboard' },
    { id: 'outreach', label: 'Agent Outreach', icon: 'ti-phone-outgoing' },
    { id: 'consultations', label: 'Consultations', icon: 'ti-calendar-event' },
    { id: 'top5', label: 'Top 5 Users', icon: 'ti-trophy' },
    { id: 'feedback', label: 'Feedback Survey', icon: 'ti-clipboard-text' },
    { id: 'mau', label: 'MAU Tracker', icon: 'ti-users' },
    { id: 'eom', label: 'EOM Report', icon: 'ti-chart-bar' },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="wordmark">S.MPLE</div>
        <div className="sub">CS Command Center</div>
      </div>
      <span className="nav-section-label">Workflows</span>
      {nav.map(n => (
        <button key={n.id} className={`nav-item${active === n.id ? ' active' : ''}`} onClick={() => setActive(n.id)}>
          <i className={`ti ${n.icon}`} aria-hidden="true" />
          {n.label}
        </button>
      ))}
      <div className="sidebar-footer">
        <div className="avatar-row">
          <div className="avatar">AO</div>
          <div>
            <div className="name">Asha Oakley</div>
            <div className="role">Client Success Advisor</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview({ setActive }) {
  const today = new Date();
  const todayKey = today.toDateString();
  const dayOfWeek = today.getDay();
  const isWedOrThu = dayOfWeek === 3 || dayOfWeek === 4;
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const isLastDay = today.getDate() === lastDayOfMonth;
  const daysUntilEOM = lastDayOfMonth - today.getDate();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const contacted = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('contacted_' + todayKey) || '[]' : '[]');
  const mauEntries = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('mau_entries') || '{"Week 1":[],"Week 2":[],"Week 3":[],"Week 4":[]}' : '{"Week 1":[],"Week 2":[],"Week 3":[],"Week 4":[]}');
  const feedbackItems = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('feedback_items') || '[]' : '[]');
  const mauConfirmed = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('mau_confirmed') || '[]' : '[]');

  const totalMAU = Object.values(mauEntries).flat().length;
  const totalMAUTarget = 20;
  const mauPct = totalMAUTarget > 0 ? Math.round((totalMAU / totalMAUTarget) * 100) : 0;

  const pendingMAU = Object.entries(mauEntries).flatMap(([week, names]) =>
    names.map(name => ({ name, week }))
  ).filter(e => !mauConfirmed.includes(e.name));

  const statCards = [
    { label: 'Agents contacted', value: `${contacted.length}/5`, sub: 'today', color: contacted.length >= 5 ? '#1A7A4A' : '#7A3F3F', bg: contacted.length >= 5 ? '#EAF7EE' : '#FAF0EE' },
    { label: 'Low feedback scores', value: feedbackItems.length, sub: 'flagged', color: feedbackItems.length > 0 ? '#8C5A00' : '#1A7A4A', bg: feedbackItems.length > 0 ? '#FEF6E4' : '#EAF7EE' },
    { label: 'MAU this month', value: `${mauPct}%`, sub: `${totalMAU} of ${totalMAUTarget} target`, color: '#7A3F3F', bg: '#F7E8E3' },
    { label: 'EOM countdown', value: isLastDay ? 'Today!' : `${daysUntilEOM}d`, sub: 'until report', color: daysUntilEOM <= 2 ? '#8C5A00' : '#7A3F3F', bg: daysUntilEOM <= 2 ? '#FEF6E4' : '#FAF0EE' },
  ];

  const todayTasks = [
    { label: 'Agent outreach', detail: `${contacted.length}/5 agents contacted`, done: contacted.length >= 5, id: 'outreach' },
    { label: 'Feedback survey check', detail: feedbackItems.length > 0 ? `${feedbackItems.length} low score${feedbackItems.length > 1 ? 's' : ''} flagged` : 'No low scores today', done: feedbackItems.length === 0, id: 'feedback' },
    { label: 'MAU Tracker update', detail: `${totalMAU} names added this month`, done: totalMAU > 0, id: 'mau' },
  ];

  const weekTasks = [
    { label: 'Agent consultations', detail: isWedOrThu ? 'Today is a consultation day — check your calendar' : 'Next check: Wednesday & Thursday', due: 'Wed & Thu', urgent: isWedOrThu, id: 'consultations' },
    { label: 'EOM Report', detail: isLastDay ? 'Due today!' : `${daysUntilEOM} days until end of month`, due: `${lastDayOfMonth}th`, urgent: isLastDay || daysUntilEOM <= 2, id: 'eom' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--muted)' }}>{formatDate(today)}</div>
      <div className="stat-row">
        {statCards.map(s => (
          <div key={s.label} className="stat" style={{ background: s.bg }}>
            <div className="stat-n" style={{ color: s.color, fontSize: 20 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.color, marginBottom: 1 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: s.color, opacity: 0.7 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>Due today</p>
          {todayTasks.map(t => (
            <div key={t.label} onClick={() => setActive(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#FAF0EE', borderRadius: 10, marginBottom: 6, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5E4DF'}
              onMouseLeave={e => e.currentTarget.style.background = '#FAF0EE'}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: t.done ? '#EAF7EE' : '#F7E8E3', border: `1.5px solid ${t.done ? '#1A7A4A' : '#C9836A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {t.done && <i className="ti ti-check" style={{ fontSize: 11, color: '#1A7A4A' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#3D1F1F' }}>{t.label}</div>
                <div style={{ fontSize: 11, color: '#7A5A58' }}>{t.detail}</div>
              </div>
              <i className="ti ti-chevron-right" style={{ fontSize: 14, color: '#B89098' }} />
            </div>
          ))}
        </div>

        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>This week</p>
          {weekTasks.map(t => (
            <div key={t.label} onClick={() => setActive(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: t.urgent ? '#FEF6E4' : '#FAF0EE', borderRadius: 10, marginBottom: 6, cursor: 'pointer', border: t.urgent ? '0.5px solid #C9836A' : '0.5px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: t.urgent ? '#FAEEDA' : '#F7E8E3', border: `1.5px solid ${t.urgent ? '#8C5A00' : '#C9836A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {t.urgent && <i className="ti ti-alert-triangle" style={{ fontSize: 10, color: '#8C5A00' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#3D1F1F' }}>{t.label}</div>
                <div style={{ fontSize: 11, color: '#7A5A58' }}>{t.detail}</div>
              </div>
              <span style={{ fontSize: 11, color: t.urgent ? '#8C5A00' : '#B89098', fontWeight: 500, background: t.urgent ? '#FAEEDA' : '#F7E8E3', padding: '2px 8px', borderRadius: 20 }}>{t.due}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="section-label" style={{ marginBottom: 8 }}>MAU tracker — {monthName} · agents pending confirmation</p>
      {pendingMAU.length === 0
        ? <div style={{ padding: '12px 14px', background: '#EAF7EE', borderRadius: 10, fontSize: 13, color: '#1A7A4A' }}>
            <i className="ti ti-check" style={{ marginRight: 6 }} />All agents confirmed for this month
          </div>
        : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {pendingMAU.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: '#FAF0EE', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#3D1F1F' }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: '#7A5A58' }}>{e.week}</div>
                </div>
                <span style={{ fontSize: 11, background: '#F7E8E3', color: '#7A3F3F', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>pending</span>
              </div>
            ))}
          </div>
      }
      <div style={{ marginTop: 16, padding: '10px 14px', background: '#FAF0EE', borderRadius: 10, fontSize: 12, color: '#7A5A58' }}>
        <i className="ti ti-info-circle" style={{ marginRight: 6 }} />
        Stats update as you work through each section. Click any task to jump straight to it.
      </div>
    </div>
  );
}

// ── Agent Outreach ────────────────────────────────────────────────────────────
function AgentOutreach() {
  const today = new Date();
  const todayKey = today.toDateString();
  const [agents] = useState(() => getTodaysAgents(5));
  const [cycleInfo] = useState(() => getCycleInfo());
  const [contacted, setContacted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('contacted_' + new Date().toDateString()) || '[]'); }
    catch { return []; }
  });
  const [toast, setToast] = useState(null);

  function markContacted(email) {
    const updated = contacted.includes(email) ? contacted : [...contacted, email];
    setContacted(updated);
    localStorage.setItem('contacted_' + todayKey, JSON.stringify(updated));
    setToast('Marked as contacted ✓');
  }

  function markAll() {
    const all = agents.map(a => a.email);
    setContacted(all);
    localStorage.setItem('contacted_' + todayKey, JSON.stringify(all));
    setToast('All 5 marked as contacted ✓');
  }

  return (
    <div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      <div className="stat-row">
        <div className="stat"><div className="stat-n">{cycleInfo.totalAgents.toLocaleString()}</div><div className="stat-l">Total onboarded</div></div>
        <div className="stat"><div className="stat-n">{cycleInfo.cycleDay}/45</div><div className="stat-l">Day in cycle</div></div>
        <div className="stat"><div className="stat-n">~30</div><div className="stat-l">Agents/day pace</div></div>
        <div className="stat"><div className="stat-n">{contacted.length}/5</div><div className="stat-l">Contacted today</div></div>
      </div>
      <p className="section-label">Today's queue — {formatDate(today)}</p>
      <div className="info-box">Outreach via phone, text, or a message in the Dash. Click "SERHANT page" to check for new listings before you reach out.</div>
      {agents.map(agent => {
        const done = contacted.includes(agent.email);
        const slug = getSerhantSlug(agent.name);
        return (
          <div key={agent.email} className={`agent-item${done ? ' contacted' : ''}`}>
            <div className="agent-avatar">{initials(agent.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="agent-name">{agent.name}{done && <span style={{ color: 'var(--green)', fontSize: 11, marginLeft: 6 }}>✓ contacted</span>}</div>
              <div className="agent-email">{agent.email}</div>
            </div>
            <div className="agent-action-row">
              <a href={`https://www.serhant.com/agents/${slug}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-xs">SERHANT page ↗</button>
              </a>
              <a href="https://dash.serhantsimple.com/requests?groupBy=status" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-xs">Dash ↗</button>
              </a>
              <button className={`btn-xs${done ? ' done' : ''}`} onClick={() => markContacted(agent.email)}>{done ? '✓ Done' : 'Mark done'}</button>
            </div>
          </div>
        );
      })}
      <div className="card-footer" style={{ borderRadius: 'var(--radius-lg)', marginTop: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Queue resets automatically each morning</span>
        <button className="btn btn-ghost" onClick={markAll}>Mark all contacted</button>
      </div>
    </div>
  );
}

// ── Consultations ─────────────────────────────────────────────────────────────
function Consultations() {
  const [tab, setTab] = useState('upcoming');
  return (
    <div>
      <div className="info-box">Checks your Outlook calendar every Wednesday and Thursday for booked agent consultations. After calls, pull your Fathom transcript for an auto-generated recap.</div>
      <div className="tab-row">
        <button className={`tab${tab === 'upcoming' ? ' active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button className={`tab${tab === 'recap' ? ' active' : ''}`} onClick={() => setTab('recap')}>Post-call recaps</button>
      </div>
      {tab === 'upcoming' && (
        <div>
          <div className="empty"><i className="ti ti-calendar" />No consultations synced yet</div>
          <a href="https://outlook.office.com/calendar/view/workweek" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}><i className="ti ti-external-link" /> Open Outlook calendar</button>
          </a>
        </div>
      )}
      {tab === 'recap' && (
        <div>
          <div className="empty"><i className="ti ti-notes" />No recaps yet — run one after your next call</div>
          <a href="https://app.fathom.video" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="btn btn-navy" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}><i className="ti ti-external-link" /> Open Fathom for transcripts</button>
          </a>
        </div>
      )}
    </div>
  );
}

// ── Top 5 ─────────────────────────────────────────────────────────────────────
function Top5() {
  const [agents, setAgents] = useState([]);
  const [lastPulled, setLastPulled] = useState(null);
  const [form, setForm] = useState({ name: '', count: '' });
  const maxCount = agents[0]?.count || 1;

  function addAgent() {
    if (!form.name.trim()) return;
    setAgents(prev => [...prev, { name: form.name.trim(), count: parseInt(form.count) || 0 }].sort((a, b) => b.count - a.count).slice(0, 7));
    setForm({ name: '', count: '' });
    setLastPulled(new Date().toLocaleDateString());
  }

  return (
    <div>
      <div className="info-box">Pull from Metabase on the last day of each month. Shows the first 7 agents by number of requests — your Top 5 come from this list.</div>
      <a href="https://metabase.serhant.dev/question/506-top-20-agents-by-number-of-requests" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
        <button className="btn btn-gold" style={{ marginBottom: 16 }}><i className="ti ti-external-link" /> Open Metabase report</button>
      </a>
      {agents.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p className="section-label">This month's top agents</p>
          {agents.map((a, i) => (
            <div className="rank-item" key={i}>
              <span className={`rank-num${i < 3 ? ' gold' : ''}`}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="rank-name">{a.name}</div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.round((a.count / maxCount) * 100)}%` }} /></div>
              </div>
              <span className="rank-count">{a.count} requests</span>
            </div>
          ))}
          {lastPulled && <p style={{ fontSize: 11, color: 'var(--hint)', marginTop: 8 }}>Last updated {lastPulled}</p>}
        </div>
      )}
      <p className="section-label" style={{ marginBottom: 8 }}>Add agents from Metabase</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input type="text" placeholder="Agent name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          style={{ flex: 2, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', fontSize: 13, fontFamily: 'Inter,sans-serif' }} />
        <input type="number" placeholder="# requests" value={form.count} onChange={e => setForm(f => ({ ...f, count: e.target.value }))}
          style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', fontSize: 13, fontFamily: 'Inter,sans-serif' }} />
        <button className="btn btn-navy" onClick={addAgent}>Add</button>
      </div>
      <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setAgents([])}>Clear list</button>
    </div>
  );
}

// ── Feedback Survey ───────────────────────────────────────────────────────────
function FeedbackSurvey() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('feedback_items') || '[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ name: '', score: '', comment: '' });
  const [toast, setToast] = useState(null);

  function saveItems(updated) {
    setItems(updated);
    localStorage.setItem('feedback_items', JSON.stringify(updated));
  }

  function addItem() {
    if (!form.name || !form.score) return;
    const score = parseInt(form.score);
    if (score >= 7) { setToast('Score is 7 or above — only flagging under 7'); return; }
    const updated = [...items, { name: form.name.trim(), score, comment: form.comment.trim(), id: Date.now() }];
    saveItems(updated);
    setForm({ name: '', score: '', comment: '' });
    setToast('Score flagged ✓');
  }

  return (
    <div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      <div className="info-box">Check the SharePoint Excel daily. Any score under 7 gets flagged here for follow-up outreach.</div>
      <a href="https://teamserhant-my.sharepoint.com/:x:/r/personal/aoakley_serhant_com/_layouts/15/Doc.aspx?sourcedoc=%7B8A04A924-DF1F-41AD-97E1-01B7FE5A8C40%7D&file=NEW%20SERHANT.%20S.MPLE%20Feedback%20Survey.xlsx&action=default&mobileredirect=true" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
        <button className="btn btn-gold" style={{ marginBottom: 16 }}><i className="ti ti-external-link" /> Open feedback Excel</button>
      </a>
      {items.length === 0
        ? <div className="empty"><i className="ti ti-mood-happy" />No low scores flagged</div>
        : items.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--surface2)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 8 }}>
            <div className="score-pill score-low">{item.score}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.name}</div>
              {item.comment && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.comment}</div>}
            </div>
            <button className="btn-xs" onClick={() => saveItems(items.filter(i => i.id !== item.id))}>Dismiss</button>
          </div>
        ))
      }
      <p className="section-label" style={{ marginTop: 16, marginBottom: 8 }}>Log a low score</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" placeholder="Agent name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={{ flex: 2, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', fontSize: 13, fontFamily: 'Inter,sans-serif' }} />
          <input type="number" placeholder="Score (0–6)" min={0} max={6} value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
            style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', fontSize: 13, fontFamily: 'Inter,sans-serif' }} />
        </div>
        <input type="text" placeholder="Their comment (optional)" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', fontSize: 13, fontFamily: 'Inter,sans-serif' }} />
        <button className="btn btn-navy" style={{ alignSelf: 'flex-start' }} onClick={addItem}>Flag this score</button>
      </div>
    </div>
  );
}

// ── MAU Tracker ───────────────────────────────────────────────────────────────
function MAUTracker() {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mau_entries') || '{"Week 1":[],"Week 2":[],"Week 3":[],"Week 4":[]}'); }
    catch { return { 'Week 1': [], 'Week 2': [], 'Week 3': [], 'Week 4': [] }; }
  });
  const [confirmed, setConfirmed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mau_confirmed') || '[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ name: '', week: 'Week 1' });
  const [toast, setToast] = useState(null);

  function saveEntries(updated) { setEntries(updated); localStorage.setItem('mau_entries', JSON.stringify(updated)); }
  function toggleConfirm(name) {
    const updated = confirmed.includes(name) ? confirmed.filter(n => n !== name) : [...confirmed, name];
    setConfirmed(updated);
    localStorage.setItem('mau_confirmed', JSON.stringify(updated));
  }

  function addEntry() {
    if (!form.name.trim()) return;
    const updated = { ...entries, [form.week]: [...entries[form.week], form.name.trim()] };
    saveEntries(updated);
    setToast(`${form.name.trim()} added to ${form.week} ✓`);
    setForm(f => ({ ...f, name: '' }));
  }

  const totalMAU = Object.values(entries).flat().length;
  const confirmedCount = confirmed.length;
  const mauPct = totalMAU > 0 ? Math.round((confirmedCount / totalMAU) * 100) : 0;

  return (
    <div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      <div className="info-box">Drop attendee names from the S.MPLE onboarding Slack channel into the correct week. Toggle the checkmark when an agent has a confirmed "yes" in the tracker.</div>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat"><div className="stat-n">{totalMAU}</div><div className="stat-l">Total added</div></div>
        <div className="stat"><div className="stat-n">{confirmedCount}</div><div className="stat-l">Confirmed yes</div></div>
        <div className="stat"><div className="stat-n">{totalMAU - confirmedCount}</div><div className="stat-l">Pending</div></div>
        <div className="stat"><div className="stat-n">{mauPct}%</div><div className="stat-l">Confirmation rate</div></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <a href="https://serhant.enterprise.slack.com/archives/C07TQHNPKCG" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <button className="btn btn-gold"><i className="ti ti-brand-slack" /> Onboarding Slack</button>
        </a>
        <a href="https://teamserhant.sharepoint.com/:x:/r/sites/S.MPLEDept/_layouts/15/Doc.aspx?sourcedoc=%7BF3D1BDE9-25F4-4EF4-A49F-FAD9B17D8488%7D" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <button className="btn btn-ghost"><i className="ti ti-external-link" /> MAU Tracker Excel</button>
        </a>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {weeks.map(week => (
          <div className="card" key={week}>
            <div className="card-header" style={{ padding: '8px 12px' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{week}</span>
              <span className="badge badge-navy" style={{ marginLeft: 'auto', fontSize: 11 }}>{entries[week].length}</span>
            </div>
            <div className="card-body" style={{ padding: '10px 12px', minHeight: 60 }}>
              {entries[week].length === 0
                ? <span style={{ fontSize: 12, color: 'var(--hint)' }}>No names yet</span>
                : entries[week].map((name, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <button onClick={() => toggleConfirm(name)}
                        style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${confirmed.includes(name) ? '#1A7A4A' : '#C9836A'}`, background: confirmed.includes(name) ? '#EAF7EE' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {confirmed.includes(name) && <i className="ti ti-check" style={{ fontSize: 10, color: '#1A7A4A' }} />}
                      </button>
                      <span style={{ fontSize: 13, color: 'var(--text)', textDecoration: confirmed.includes(name) ? 'line-through' : 'none', opacity: confirmed.includes(name) ? 0.6 : 1 }}>{name}</span>
                    </div>
                    <button className="btn-xs" onClick={() => saveEntries({ ...entries, [week]: entries[week].filter((_, j) => j !== i) })}>×</button>
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>

      <p className="section-label" style={{ marginBottom: 8 }}>Add attendee</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="text" placeholder="Attendee name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && addEntry()}
          style={{ flex: 2, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', fontSize: 13, fontFamily: 'Inter,sans-serif' }} />
        <select value={form.week} onChange={e => setForm(f => ({ ...f, week: e.target.value }))}
          style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', fontSize: 13, fontFamily: 'Inter,sans-serif', background: 'var(--surface)' }}>
          {weeks.map(w => <option key={w}>{w}</option>)}
        </select>
        <button className="btn btn-navy" onClick={addEntry}>Add</button>
      </div>
    </div>
  );
}

// ── EOM Report ────────────────────────────────────────────────────────────────
function EOMReport() {
  const markets = [
    { name: 'Miami', priority: false }, { name: 'Delray Beach', priority: false },
    { name: 'Jupiter', priority: false }, { name: 'Palm Beach', priority: false },
    { name: 'Fort Lauderdale', priority: true }, { name: 'Naples', priority: false },
  ];
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = Math.ceil((lastDay - today) / 86400000);
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="info-box">Runs on the last day of each month. Covers all South Florida markets — Fort Lauderdale is flagged as the top activation priority due to zero activity.</div>
      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat"><div className="stat-n">{daysLeft}</div><div className="stat-l">Days until EOM</div></div>
        <div className="stat"><div className="stat-n">6</div><div className="stat-l">Markets covered</div></div>
        <div className="stat"><div className="stat-n">1</div><div className="stat-l" style={{ color: 'var(--red)' }}>Activation priority</div></div>
      </div>
      <p className="section-label" style={{ marginBottom: 8 }}>Markets — {monthName}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 16 }}>
        {markets.map(m => (
          <span key={m.name} className={`market-pill${m.priority ? ' priority' : ''}`}>
            {m.priority && <i className="ti ti-alert-triangle" style={{ fontSize: 11 }} />}
            {m.name}{m.priority && ' — 0 activity'}
          </span>
        ))}
      </div>
      <a href="https://metabase.serhant.dev/dashboard/16" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}>
        <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}><i className="ti ti-external-link" /> Open Metabase dashboard</button>
      </a>
      <button className="btn btn-navy" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.open('https://claude.ai', '_blank')}>
        <i className="ti ti-sparkles" /> Run {monthName} report in Claude
      </button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const SECTIONS = {
  overview: { title: 'Overview', sub: "Today's status & what's due", icon: 'ti-layout-dashboard', color: '#F7E8E3', iconColor: '#7A3F3F' },
  outreach: { title: 'Agent Outreach', sub: '45-day rotation · 3–5 agents selected daily', icon: 'ti-phone-outgoing', color: '#F7E8E3', iconColor: '#7A3F3F' },
  consultations: { title: 'Agent Consultations', sub: 'Wed & Thu calendar checks', icon: 'ti-calendar-event', color: '#FAE8E8', iconColor: '#8B3A3A' },
  top5: { title: 'Top 5 Monthly Users', sub: 'Pull from Metabase on last day of month', icon: 'ti-trophy', color: '#F5E0DB', iconColor: '#914040' },
  feedback: { title: 'Feedback Survey Outreach', sub: 'Flags scores under 7 daily', icon: 'ti-clipboard-text', color: '#FAF0EE', iconColor: '#A05050' },
  mau: { title: 'MAU Tracker', sub: 'Slack → correct week in Excel', icon: 'ti-users', color: '#F7E8E3', iconColor: '#7A3F3F' },
  eom: { title: 'EOM Report', sub: 'South Florida · runs end of month', icon: 'ti-chart-bar', color: '#F5E0DB', iconColor: '#914040' },
};

const COMPONENTS = { overview: Overview, outreach: AgentOutreach, consultations: Consultations, top5: Top5, feedback: FeedbackSurvey, mau: MAUTracker, eom: EOMReport };

export default function App() {
  const [active, setActive] = useState('overview');
  const section = SECTIONS[active];
  const Component = COMPONENTS[active];

  return (
    <div className="app-shell">
      <Sidebar active={active} setActive={setActive} />
      <main className="main-content">
        <div className="page-header">
          <h1>{section.title}</h1>
          <p className="page-date">{section.sub}</p>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: section.color }}>
              <i className={`ti ${section.icon}`} style={{ color: section.iconColor, fontSize: 17 }} aria-hidden="true" />
            </div>
            <div>
              <div className="card-title">{section.title}</div>
              <div className="card-sub">{section.sub}</div>
            </div>
          </div>
          <div className="card-body">
            <Component setActive={setActive} />
          </div>
        </div>
      </main>
    </div>
  );
}
