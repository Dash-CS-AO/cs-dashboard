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
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, []);
  return <div className="toast">{message}</div>;
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  const nav = [
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
        <button
          key={n.id}
          className={`nav-item${active === n.id ? ' active' : ''}`}
          onClick={() => setActive(n.id)}
        >
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

      <div className="info-box">
        Outreach via phone, text, or a message in the Dash. Click "SERHANT page" to check for new listings before you reach out.
      </div>

      {agents.map(agent => {
        const done = contacted.includes(agent.email);
        const slug = getSerhantSlug(agent.name);
        return (
          <div key={agent.email} className={`agent-item${done ? ' contacted' : ''}`}>
            <div className="agent-avatar">{initials(agent.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="agent-name">
                {agent.name}
                {done && <span style={{ color: 'var(--green)', fontSize: 11, marginLeft: 6 }}>✓ contacted</span>}
              </div>
              <div className="agent-email">{agent.email}</div>
            </div>
            <div className="agent-action-row">
              <a
                href={`https://www.serhant.com/agents/${slug}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button className="btn-xs">SERHANT page ↗</button>
              </a>
              <a
                href={`https://dash.serhantsimple.com/requests?groupBy=status`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button className="btn-xs">Dash ↗</button>
              </a>
              <button
                className={`btn-xs${done ? ' done' : ''}`}
                onClick={() => markContacted(agent.email)}
              >
                {done ? '✓ Done' : 'Mark done'}
              </button>
            </div>
          </div>
        );
      })}

      <div className="card-footer" style={{ borderRadius: 'var(--radius-lg)', marginTop: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          Queue resets automatically each morning
        </span>
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
      <div className="info-box">
        Checks your Outlook calendar every Wednesday and Thursday for booked agent consultations. After calls, pull your Fathom transcript for an auto-generated recap.
      </div>
      <div className="tab-row">
        <button className={`tab${tab === 'upcoming' ? ' active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button className={`tab${tab === 'recap' ? ' active' : ''}`} onClick={() => setTab('recap')}>Post-call recaps</button>
      </div>
      {tab === 'upcoming' && (
        <div>
          <div className="empty">
            <i className="ti ti-calendar" />
            No consultations synced yet
          </div>
          <a href="https://outlook.office.com/calendar/view/workweek" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
              <i className="ti ti-external-link" /> Open Outlook calendar
            </button>
          </a>
        </div>
      )}
      {tab === 'recap' && (
        <div>
          <div className="empty">
            <i className="ti ti-notes" />
            No recaps yet — run one after your next call
          </div>
          <a href="https://app.fathom.video" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="btn btn-navy" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              <i className="ti ti-external-link" /> Open Fathom for transcripts
            </button>
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

  function addAgent(name, count) {
    if (!name.trim()) return;
    setAgents(prev => [...prev, { name: name.trim(), count: parseInt(count) || 0 }]
      .sort((a, b) => b.count - a.count)
      .slice(0, 7)
    );
  }

  const [form, setForm] = useState({ name: '', count: '' });
  const maxCount = agents[0]?.count || 1;

  return (
    <div>
      <div className="info-box">
        Pull from Metabase on the last day of each month. Shows the first 7 agents by number of requests — your Top 5 come from this list.
      </div>

      <a href="https://metabase.serhant.dev/question/506-top-20-agents-by-number-of-requests" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
        <button className="btn btn-gold" style={{ marginBottom: 16 }}>
          <i className="ti ti-external-link" /> Open Metabase report
        </button>
      </a>

      {agents.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p className="section-label">This month's top agents</p>
          {agents.map((a, i) => (
            <div className="rank-item" key={a.email || i}>
              <span className={`rank-num${i < 3 ? ' gold' : ''}`}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="rank-name">{a.name}</div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.round((a.count / maxCount) * 100)}%` }} />
                </div>
              </div>
              <span className="rank-count">{a.count} requests</span>
            </div>
          ))}
          {lastPulled && <p style={{ fontSize: 11, color: 'var(--hint)', marginTop: 8 }}>Last updated {lastPulled}</p>}
        </div>
      )}

      <p className="section-label" style={{ marginBottom: 8 }}>Add agents from Metabase</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Agent name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          style={{ flex: 2, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', fontSize: 13, fontFamily: 'Inter,sans-serif' }}
        />
        <input
          type="number"
          placeholder="# requests"
          value={form.count}
          onChange={e => setForm(f => ({ ...f, count: e.target.value }))}
          style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', fontSize: 13, fontFamily: 'Inter,sans-serif' }}
        />
        <button className="btn btn-navy" onClick={() => { addAgent(form.name, form.count); setForm({ name: '', count: '' }); setLastPulled(new Date().toLocaleDateString()); }}>
          Add
        </button>
      </div>
      <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setAgents([])}>Clear list</button>
    </div>
  );
}

// ── Feedback Survey ───────────────────────────────────────────────────────────
function FeedbackSurvey() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', score: '', comment: '' });
  const [toast, setToast] = useState(null);

  function addItem() {
    if (!form.name || !form.score) return;
    const score = parseInt(form.score);
    if (score >= 7) { setToast('Score is 7 or above — only flagging under 7'); return; }
    setItems(prev => [...prev, { name: form.name.trim(), score, comment: form.comment.trim(), id: Date.now() }]);
    setForm({ name: '', score: '', comment: '' });
  }

  return (
    <div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      <div className="info-box">
        Check the SharePoint Excel daily. Any score under 7 gets flagged here for follow-up outreach.
      </div>

      <a href="https://teamserhant-my.sharepoint.com/:x:/r/personal/aoakley_serhant_com/_layouts/15/Doc.aspx?sourcedoc=%7B8A04A924-DF1F-41AD-97E1-01B7FE5A8C40%7D&file=NEW%20SERHANT.%20S.MPLE%20Feedback%20Survey.xlsx&action=default&mobileredirect=true" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
        <button className="btn btn-gold" style={{ marginBottom: 16 }}>
          <i className="ti ti-external-link" /> Open feedback Excel
        </button>
      </a>

      {items.length === 0
        ? <div className="empty"><i className="ti ti-mood-happy" />No low scores flagged</div>
        : items.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--surface2)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 8 }}>
            <div className={`score-pill score-low`}>{item.score}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.name}</div>
              {item.comment && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.comment}</div>}
            </div>
            <button className="btn-xs" onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}>Dismiss</button>
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
  const [entries, setEntries] = useState({ 'Week 1': [], 'Week 2': [], 'Week 3': [], 'Week 4': [] });
  const [form, setForm] = useState({ name: '', week: 'Week 1' });
  const [toast, setToast] = useState(null);

  function addEntry() {
    if (!form.name.trim()) return;
    setEntries(prev => ({ ...prev, [form.week]: [...prev[form.week], form.name.trim()] }));
    setForm(f => ({ ...f, name: '' }));
    setToast(`${form.name.trim()} added to ${form.week} ✓`);
  }

  return (
    <div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      <div className="info-box">
        Drop attendee names from the S.MPLE onboarding Slack channel into the correct week below. Links directly to your MAU Tracker Excel.
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
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{name}</span>
                    <button className="btn-xs" onClick={() => setEntries(prev => ({ ...prev, [week]: prev[week].filter((_, j) => j !== i) }))}>×</button>
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
    { name: 'Miami', priority: false },
    { name: 'Delray Beach', priority: false },
    { name: 'Jupiter', priority: false },
    { name: 'Palm Beach', priority: false },
    { name: 'Fort Lauderdale', priority: true },
    { name: 'Naples', priority: false },
  ];

  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = Math.ceil((lastDay - today) / 86400000);
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="info-box">
        Runs on the last day of each month. Covers all South Florida markets — Fort Lauderdale is flagged as the top activation priority due to zero activity.
      </div>

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
            {m.name}
            {m.priority && ' — 0 activity'}
          </span>
        ))}
      </div>

      <a
        href="https://metabase.serhant.dev/dashboard/16"
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}
      >
        <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
          <i className="ti ti-external-link" /> Open Metabase dashboard
        </button>
      </a>
      <button
        className="btn btn-navy"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={() => window.open('https://claude.ai', '_blank')}
      >
        <i className="ti ti-sparkles" /> Run {monthName} report in Claude
      </button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const SECTIONS = {
  outreach: { title: 'Agent Outreach', sub: '45-day rotation · 3–5 agents selected daily', icon: 'ti-phone-outgoing', color: '#F7E8E3', iconColor: '#7A3F3F', component: AgentOutreach },
  consultations: { title: 'Agent Consultations', sub: 'Wed & Thu calendar checks', icon: 'ti-calendar-event', color: '#FAE8E8', iconColor: '#8B3A3A', component: Consultations },
  top5: { title: 'Top 5 Monthly Users', sub: 'Pull from Metabase on last day of month', icon: 'ti-trophy', color: '#F5E0DB', iconColor: '#914040', component: Top5 },
  feedback: { title: 'Feedback Survey Outreach', sub: 'Flags scores under 7 daily', icon: 'ti-clipboard-text', color: '#FAF0EE', iconColor: '#A05050', component: FeedbackSurvey },
  mau: { title: 'MAU Tracker', sub: 'Slack → correct week in Excel', icon: 'ti-users', color: '#F7E8E3', iconColor: '#7A3F3F', component: MAUTracker },
  eom: { title: 'EOM Report', sub: 'South Florida · runs end of month', icon: 'ti-chart-bar', color: '#F5E0DB', iconColor: '#914040', component: EOMReport },
};

export default function App() {
  const [active, setActive] = useState('outreach');
  const section = SECTIONS[active];
  const Component = section.component;

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
            <Component />
          </div>
        </div>
      </main>
    </div>
  );
}
