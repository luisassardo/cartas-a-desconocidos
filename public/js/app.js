// ══════════════════════════════════════════════════════
//  Cartas a Desconocidos — Frontend SPA
// ══════════════════════════════════════════════════════

const App = (() => {
  let config = {};
  let currentView = 'home';

  // ── API Helper ─────────────────────────────────────
  async function api(url, opts = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error del servidor');
    return data;
  }

  // ── Router ─────────────────────────────────────────
  function navigate(view) {
    currentView = view;
    window.scrollTo(0, 0);
    render();
  }

  // ── SVG Icons ──────────────────────────────────────
  const icons = {
    mail: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    shield: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    heart: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>',
    arrowLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
    refresh: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
    alertCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
    lock: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    shuffle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>',
    eye: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
    server: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>',
    github: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>',
    upload: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
    download: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
    edit: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>',
  };

  function ic(name, size) {
    let svg = icons[name] || '';
    if (size) svg = svg.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`);
    return svg;
  }

  // ── Config ─────────────────────────────────────────
  function c(key) { return config[key] || ''; }

  // ── Load Config ────────────────────────────────────
  async function loadConfig() {
    try { config = await api('/api/config'); } catch (e) { console.error(e); }
  }

  // ══════════════════════════════════════════════════
  //  VIEWS
  // ══════════════════════════════════════════════════

  function renderHome() {
    return `
    <div class="page-bg">
      <section class="section" style="padding-top:5rem;padding-bottom:3rem;">
        <div class="container-md text-center fade-in">
          <div class="icon-circle icon-circle-xl bg-indigo" style="margin:0 auto 2rem;">${ic('mail',40)}</div>
          <h1>${c('hero_title')}</h1>
          <p style="color:var(--gray-600);max-width:600px;margin:1.5rem auto;font-size:1.1rem;">${c('hero_subtitle')}</p>
          <div class="flex justify-center gap-4" style="margin-top:2rem;flex-wrap:wrap;">
            <button class="btn btn-primary btn-lg" onclick="App.navigate('register')">${c('cta_button')}</button>
            <button class="btn btn-outline btn-lg" onclick="App.navigate('about')">${c('cta_secondary')}</button>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:2rem;">
        <div class="container grid grid-3">
          <div class="card slide-up" style="animation-delay:0.1s">
            <div class="card-body">
              <div class="icon-circle bg-purple" style="margin-bottom:1rem;">${ic('shield')}</div>
              <h3>${c('feature1_title')}</h3>
              <p style="color:var(--gray-600);margin-top:0.5rem;font-size:0.95rem;">${c('feature1_text')}</p>
            </div>
          </div>
          <div class="card slide-up" style="animation-delay:0.2s">
            <div class="card-body">
              <div class="icon-circle bg-pink" style="margin-bottom:1rem;">${ic('heart')}</div>
              <h3>${c('feature2_title')}</h3>
              <p style="color:var(--gray-600);margin-top:0.5rem;font-size:0.95rem;">${c('feature2_text')}</p>
            </div>
          </div>
          <div class="card slide-up" style="animation-delay:0.3s">
            <div class="card-body">
              <div class="icon-circle bg-indigo" style="margin-bottom:1rem;">${ic('users')}</div>
              <h3>${c('feature3_title')}</h3>
              <p style="color:var(--gray-600);margin-top:0.5rem;font-size:0.95rem;">${c('feature3_text')}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-white">
        <div class="container-md">
          <h2 class="text-center" style="margin-bottom:3rem;">${c('howit_title')}</h2>
          <div class="grid grid-4 text-center">
            ${[1,2,3,4].map(i => `
              <div>
                <div class="step-circle">${i}</div>
                <h3>${c('step'+i+'_title')}</h3>
                <p style="font-size:0.9rem;color:var(--gray-600);margin-top:0.25rem;">${c('step'+i+'_desc')}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container-sm text-center">
          <h2 style="margin-bottom:0.75rem;">${c('cta2_title')}</h2>
          <p style="color:var(--gray-600);margin-bottom:2rem;">${c('cta2_text')}</p>
          <button class="btn btn-primary btn-lg" onclick="App.navigate('register')">Comenzar Ahora</button>
        </div>
      </section>

      <footer class="footer">
        <div class="container flex justify-between items-center" style="flex-wrap:wrap;gap:1rem;">
          <p>${c('footer_text')}</p>
          <div class="flex gap-6">
            <button onclick="App.navigate('privacy')">Política de Privacidad</button>
            <button onclick="App.navigate('admin')">Administrador</button>
          </div>
        </div>
      </footer>
    </div>`;
  }

  // ── Register View ──────────────────────────────────
  function renderRegister() {
    return `
    <div class="page-bg" style="padding:3rem 1.5rem;">
      <div class="container-sm">
        <button class="btn btn-ghost" onclick="App.navigate('home')" style="margin-bottom:1.5rem;">${ic('arrowLeft')} Atrás</button>
        <div class="card" id="register-card">
          <div class="card-body-lg">
            <h2 style="margin-bottom:0.25rem;">Elige Tu Seudónimo</h2>
            <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1.5rem;">Este será tu identidad anónima en el intercambio.</p>
            <div id="reg-alert"></div>
            <div id="reg-step-pseudo">
              <div class="checkbox-row" style="margin-bottom:1.25rem;">
                <input type="checkbox" id="use-custom" onchange="App.toggleCustomPseudo()">
                <label for="use-custom">Quiero elegir mi propio seudónimo</label>
              </div>
              <div id="pseudo-generated">
                <div class="pseudonym-display">
                  <p style="color:var(--gray-600);font-size:0.9rem;">Tu seudónimo generado:</p>
                  <p class="pseudo-value" id="gen-pseudo"></p>
                </div>
                <button class="btn btn-outline btn-block" style="margin-top:1rem;" onclick="App.newPseudo()">${ic('refresh')} Generar Nuevo</button>
              </div>
              <div id="pseudo-custom" class="hidden">
                <div class="form-group">
                  <label class="form-label">Tu Seudónimo</label>
                  <input class="form-input form-input-lg" id="custom-pseudo" placeholder="Ingresa un seudónimo único">
                  <span class="form-hint">Debe ser único y tener al menos 3 caracteres</span>
                </div>
              </div>
              <button class="btn btn-primary btn-block btn-lg" style="margin-top:1.5rem;" onclick="App.submitPseudo()" id="pseudo-submit">Continuar</button>
            </div>
            <div id="reg-step-details" class="hidden"></div>
            <div id="reg-step-success" class="hidden"></div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ── About View ─────────────────────────────────────
  function renderAbout() {
    const paragraphs = c('about_story').split('\n').filter(p => p.trim()).map(p => `<p style="color:var(--gray-600);margin-bottom:1rem;">${p}</p>`).join('');
    return `
    <div class="page-bg" style="padding:3rem 1.5rem;">
      <div class="container-md">
        <button class="btn btn-ghost" onclick="App.navigate('home')" style="margin-bottom:2rem;">${ic('arrowLeft')} Atrás</button>
        <div class="text-center" style="margin-bottom:3rem;">
          <h1>${c('about_title')}</h1>
          <p style="color:var(--gray-600);max-width:600px;margin:1rem auto;font-size:1.05rem;">${c('about_subtitle')}</p>
        </div>
        <div class="card" style="margin-bottom:2rem;"><div class="card-body-lg">
          <h2 style="margin-bottom:1rem;">Nuestra Historia</h2>
          ${paragraphs}
        </div></div>

        <h2 style="margin-bottom:1.5rem;">Cómo Funciona</h2>
        <div class="grid grid-2" style="margin-bottom:2.5rem;">
          ${[
            {t:'Regístrate con un Seudónimo', d:'Elige tu propio seudónimo único o déjanos generar uno para ti.'},
            {t:'Espera el Lote', d:'Recolectamos participantes hasta alcanzar un umbral, luego creamos emparejamientos aleatorios.'},
            {t:'Recibe Tu Emparejamiento', d:'Recibirás un correo con el seudónimo y dirección de tu destinatario.'},
            {t:'Escribe y Envía', d:'Escribe tu carta, fírmala con tu seudónimo y envíala por correo.'},
          ].map((item,i) => `
            <div class="card"><div class="card-body flex gap-4">
              <div class="icon-circle bg-indigo" style="flex-shrink:0;"><span style="font-weight:700;">${i+1}</span></div>
              <div><h3>${item.t}</h3><p style="color:var(--gray-600);font-size:0.9rem;margin-top:0.25rem;">${item.d}</p></div>
            </div></div>
          `).join('')}
        </div>

        <div class="cta-gradient" style="margin-bottom:2rem;">
          ${ic('github')}
          <h2 style="margin-top:1rem;">Código Abierto y Gratuito</h2>
          <p style="margin:1rem auto;max-width:500px;">Este proyecto es completamente de código abierto. Creemos en la transparencia.</p>
          <div class="flex justify-center gap-4" style="flex-wrap:wrap;margin-top:1.5rem;">
            <button class="btn" style="background:var(--white);color:var(--gray-900);" onclick="App.navigate('register')">Unirme al Intercambio</button>
            <button class="btn" style="border:2px solid rgba(255,255,255,0.5);color:var(--white);" onclick="App.navigate('privacy')">Leer Política de Privacidad</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ── Privacy View ───────────────────────────────────
  function renderPrivacy() {
    return `
    <div class="page-bg" style="padding:3rem 1.5rem;">
      <div class="container-md">
        <button class="btn btn-ghost" onclick="App.navigate('home')" style="margin-bottom:2rem;">${ic('arrowLeft')} Atrás</button>
        <div class="text-center" style="margin-bottom:3rem;">
          <h1>Privacidad y Seguridad</h1>
          <p style="color:var(--gray-600);max-width:600px;margin:1rem auto;">Tu privacidad es nuestra máxima prioridad. Aprende cómo protegemos tus datos.</p>
        </div>
        <div class="grid grid-2" style="margin-bottom:2.5rem;">
          ${[
            {icon:'lock',bg:'bg-indigo',t:'Encriptación',d:'Toda la información personal está encriptada antes de almacenarla. Solo el sistema de emparejamiento puede desencriptarla.'},
            {icon:'eye',bg:'bg-purple',t:'Seudonimización',d:'Tu identidad real nunca se comparte. Solo tu seudónimo aparece en el sistema.'},
            {icon:'server',bg:'bg-pink',t:'Minimización de Datos',d:'Solo recolectamos lo necesario: correo para notificaciones, dirección para el envío. Sin rastreo.'},
            {icon:'mail',bg:'bg-green',t:'Compartición Única',d:'Tu dirección se comparte exactamente una vez — con tu escritor asignado.'},
          ].map(s => `
            <div class="card"><div class="card-body flex gap-4">
              <div class="icon-circle ${s.bg}">${ic(s.icon)}</div>
              <div><h3>${s.t}</h3><p style="color:var(--gray-600);font-size:0.9rem;margin-top:0.25rem;">${s.d}</p></div>
            </div></div>
          `).join('')}
        </div>
        <div class="card" style="margin-bottom:2rem;"><div class="card-body-lg">
          <h2 style="margin-bottom:1.5rem;">Política de Privacidad</h2>
          <div style="color:var(--gray-600);font-size:0.9rem;line-height:1.7;">
            <h3 style="color:var(--gray-900);margin:1.5rem 0 0.5rem;">Información que Recolectamos</h3>
            <p>Correo electrónico (solo notificaciones), seudónimo, dirección postal (encriptada), nombre real (encriptado, nunca compartido).</p>
            <h3 style="color:var(--gray-900);margin:1.5rem 0 0.5rem;">Seguridad de Datos</h3>
            <p>Datos sensibles encriptados en reposo, conexiones TLS/SSL, acceso restringido solo a administradores autorizados.</p>
            <h3 style="color:var(--gray-900);margin:1.5rem 0 0.5rem;">Retención de Datos</h3>
            <p>Tus datos se retienen solo mientras sea necesario para la ronda actual. Después puedes solicitar su eliminación.</p>
            <h3 style="color:var(--gray-900);margin:1.5rem 0 0.5rem;">Tus Derechos</h3>
            <p>Acceder a tus datos, solicitar correcciones, solicitar eliminación, retirarte antes del emparejamiento.</p>
          </div>
        </div></div>
        <div class="text-center" style="margin-bottom:2rem;">
          <button class="btn btn-primary btn-lg" onclick="App.navigate('register')">Unirme al Intercambio</button>
        </div>
      </div>
    </div>`;
  }

  // ── Admin View ─────────────────────────────────────
  function renderAdmin() {
    return `
    <div class="page-bg" style="padding:3rem 1.5rem;">
      <div class="container-sm" id="admin-login-wrapper">
        <button class="btn btn-ghost" onclick="App.navigate('home')" style="margin-bottom:1.5rem;">${ic('arrowLeft')} Atrás</button>
        <div class="card"><div class="card-body-lg text-center">
          <div class="icon-circle bg-indigo" style="margin:0 auto 1rem;">${ic('lock')}</div>
          <h2>Acceso Administrador</h2>
          <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1.5rem;">Ingresa la contraseña para acceder</p>
          <div id="admin-alert"></div>
          <div class="form-group" style="margin-bottom:1rem;">
            <input class="form-input form-input-lg" type="password" id="admin-pass" placeholder="Contraseña" onkeydown="if(event.key==='Enter')App.adminLogin()">
          </div>
          <button class="btn btn-primary btn-block btn-lg" onclick="App.adminLogin()">Entrar</button>
        </div></div>
      </div>
      <div class="container hidden" id="admin-dashboard"></div>
    </div>`;
  }

  // ══════════════════════════════════════════════════
  //  INTERACTIVE LOGIC
  // ══════════════════════════════════════════════════

  let regPseudonym = '';

  async function initRegister() {
    try {
      const data = await api('/api/pseudonym');
      regPseudonym = data.pseudonym;
      const el = document.getElementById('gen-pseudo');
      if (el) el.textContent = regPseudonym;
    } catch(e) {}
  }

  function toggleCustomPseudo() {
    const custom = document.getElementById('use-custom').checked;
    document.getElementById('pseudo-generated').classList.toggle('hidden', custom);
    document.getElementById('pseudo-custom').classList.toggle('hidden', !custom);
  }

  async function newPseudo() {
    try {
      const data = await api('/api/pseudonym');
      regPseudonym = data.pseudonym;
      document.getElementById('gen-pseudo').textContent = regPseudonym;
    } catch(e) {}
  }

  function showRegAlert(msg, type='error') {
    document.getElementById('reg-alert').innerHTML = msg ? `<div class="alert alert-${type}">${type==='error'?ic('alertCircle'):ic('check','16')} <span>${msg}</span></div>` : '';
  }

  async function submitPseudo() {
    const custom = document.getElementById('use-custom').checked;
    const pseudo = custom ? document.getElementById('custom-pseudo').value.trim() : regPseudonym;
    if (!pseudo || pseudo.length < 3) { showRegAlert('El seudónimo debe tener al menos 3 caracteres'); return; }

    const btn = document.getElementById('pseudo-submit');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Verificando...';
    showRegAlert('');

    try {
      const res = await api('/api/pseudonym/check/' + encodeURIComponent(pseudo));
      if (!res.available) { showRegAlert('Este seudónimo ya está en uso'); btn.disabled = false; btn.textContent = 'Continuar'; return; }
      regPseudonym = pseudo;
      showDetailsStep();
    } catch(e) { showRegAlert(e.message); }
    btn.disabled = false; btn.textContent = 'Continuar';
  }

  function showDetailsStep() {
    document.getElementById('reg-step-pseudo').classList.add('hidden');
    document.querySelector('#register-card h2').textContent = 'Completa el Registro';
    document.querySelector('#register-card p').textContent = 'Tu información está encriptada y se mantiene privada.';
    const details = document.getElementById('reg-step-details');
    details.classList.remove('hidden');
    details.innerHTML = `
      <div id="reg-alert"></div>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <div class="form-group">
          <label class="form-label">Correo Electrónico *</label>
          <input class="form-input" type="email" id="reg-email" placeholder="tu@correo.com" required>
          <span class="form-hint">Te notificaremos cuando tengas una asignación</span>
        </div>
        <div class="form-group">
          <label class="form-label">Tu Nombre Real *</label>
          <input class="form-input" id="reg-name" placeholder="Esto se mantiene privado">
          <span class="form-hint">Solo para nuestros registros, nunca se comparte</span>
        </div>
        <div class="form-group">
          <label class="form-label">Dirección *</label>
          <input class="form-input" id="reg-address" placeholder="Calle Principal 123, Depto 4B">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          <div class="form-group"><label class="form-label">Ciudad *</label><input class="form-input" id="reg-city"></div>
          <div class="form-group"><label class="form-label">Código Postal *</label><input class="form-input" id="reg-postal"></div>
        </div>
        <div class="form-group">
          <label class="form-label">País *</label>
          <input class="form-input" id="reg-country">
        </div>
        <div class="checkbox-row"><input type="checkbox" id="reg-hospice" onchange="document.getElementById('hospice-field').classList.toggle('hidden',!this.checked)"><label for="reg-hospice">Esta es una dirección de hospicio/destinatario</label></div>
        <div id="hospice-field" class="hidden form-group"><label class="form-label">Nombre del Hospicio</label><input class="form-input" id="reg-hospice-name" placeholder="Hogar de Cuidado Sunshine"></div>
        <div class="checkbox-row" style="margin-top:0.5rem;"><input type="checkbox" id="reg-terms"><label for="reg-terms" style="line-height:1.5;">Acepto la política de privacidad y entiendo que mi dirección solo será compartida con mi escritor asignado.</label></div>
        <button class="btn btn-primary btn-block btn-lg" style="margin-top:0.5rem;" onclick="App.submitRegistration()" id="reg-submit-btn">Completar Registro</button>
      </div>
    `;
  }

  async function submitRegistration() {
    const email = document.getElementById('reg-email')?.value?.trim();
    const name = document.getElementById('reg-name')?.value?.trim();
    const address = document.getElementById('reg-address')?.value?.trim();
    const city = document.getElementById('reg-city')?.value?.trim();
    const postal = document.getElementById('reg-postal')?.value?.trim();
    const country = document.getElementById('reg-country')?.value?.trim();
    const terms = document.getElementById('reg-terms')?.checked;
    const isHospice = document.getElementById('reg-hospice')?.checked;
    const hospiceName = document.getElementById('reg-hospice-name')?.value?.trim();

    if (!terms) { showRegAlert('Por favor acepta los términos y la política de privacidad'); return; }
    if (!email || !name || !address || !city || !postal || !country) { showRegAlert('Todos los campos marcados son obligatorios'); return; }

    const btn = document.getElementById('reg-submit-btn');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Registrando...';
    showRegAlert('');

    try {
      await api('/api/register', {
        method: 'POST',
        body: JSON.stringify({ pseudonym: regPseudonym, email, name, address, city, postal_code: postal, country, is_hospice: isHospice, hospice_name: hospiceName }),
      });
      // Show success
      document.getElementById('reg-step-details').classList.add('hidden');
      const success = document.getElementById('reg-step-success');
      success.classList.remove('hidden');
      success.innerHTML = `
        <div class="text-center fade-in" style="padding:1rem 0;">
          <div class="icon-circle bg-green" style="margin:0 auto 1.5rem;width:4rem;height:4rem;">${ic('check',32)}</div>
          <h2>¡Registro Exitoso!</h2>
          <p style="color:var(--gray-600);margin:1rem 0;">Gracias por unirte al Intercambio Anónimo de Cartas. Recibirás un correo cuando se hagan las asignaciones.</p>
          <p style="font-size:0.9rem;color:var(--gray-500);margin-bottom:2rem;">Tu seudónimo: <span class="font-mono" style="color:var(--indigo-600);font-weight:700;">${regPseudonym}</span></p>
          <button class="btn btn-primary" onclick="App.navigate('home')">Volver al Inicio</button>
        </div>
      `;
      document.querySelector('#register-card h2').textContent = '';
      document.querySelector('#register-card > div > p')?.remove();
    } catch(e) {
      showRegAlert(e.message);
      btn.disabled = false; btn.textContent = 'Completar Registro';
    }
  }

  // ── Admin Logic ────────────────────────────────────
  async function adminLogin() {
    const pass = document.getElementById('admin-pass').value;
    const alertEl = document.getElementById('admin-alert');
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: pass }) });
      document.getElementById('admin-login-wrapper').classList.add('hidden');
      const dash = document.getElementById('admin-dashboard');
      dash.classList.remove('hidden');
      loadAdminDashboard();
    } catch(e) {
      alertEl.innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>Contraseña incorrecta</span></div>`;
    }
  }

  async function checkAdminAuth() {
    try {
      await api('/api/admin/check');
      document.getElementById('admin-login-wrapper').classList.add('hidden');
      const dash = document.getElementById('admin-dashboard');
      dash.classList.remove('hidden');
      loadAdminDashboard();
    } catch(e) { /* not logged in, show login form */ }
  }

  let adminData = { stats: {}, participants: [], matches: [], pendingMatches: [], images: [] };

  async function loadAdminDashboard() {
    const dash = document.getElementById('admin-dashboard');
    dash.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--gray-500);">Cargando...</p>';
    try {
      const [stats, participants, matches, images] = await Promise.all([
        api('/api/admin/stats'), api('/api/admin/participants'), api('/api/admin/matches'), api('/api/images'),
      ]);
      adminData = { stats, participants, matches, pendingMatches: [], images };
      renderAdminDashboard();
    } catch(e) {
      dash.innerHTML = `<div class="alert alert-error">${e.message}</div>`;
    }
  }

  function renderAdminDashboard() {
    const { stats: s, participants: p, matches: m, images } = adminData;
    const dash = document.getElementById('admin-dashboard');
    dash.innerHTML = `
      <div class="flex justify-between items-center" style="margin-bottom:2rem;flex-wrap:wrap;gap:1rem;">
        <div class="flex items-center gap-4">
          <button class="btn btn-ghost" onclick="App.navigate('home')">${ic('arrowLeft')} Inicio</button>
          <h2 style="margin:0;">Panel de Administración</h2>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-outline btn-sm" onclick="App.loadAdminDashboard()">${ic('refresh')} Actualizar</button>
          <button class="btn btn-outline btn-sm" onclick="App.adminExport()">${ic('download')} Exportar</button>
          <button class="btn btn-ghost btn-sm" onclick="App.adminLogout()">Salir</button>
        </div>
      </div>

      <div class="grid grid-4" style="margin-bottom:2rem;">
        <div class="card stat-card"><div class="card-body flex justify-between items-center">
          <div><p class="stat-label">Total</p><p class="stat-value">${s.total}</p></div>
          <div style="color:var(--indigo-400);">${ic('users',32)}</div>
        </div></div>
        <div class="card stat-card"><div class="card-body flex justify-between items-center">
          <div><p class="stat-label">Sin Emparejar</p><p class="stat-value" style="color:var(--amber-600);">${s.unmatched}</p></div>
          <div class="icon-circle" style="background:var(--amber-100);color:var(--amber-600);width:2rem;height:2rem;font-size:0.8rem;font-weight:700;">?</div>
        </div></div>
        <div class="card stat-card"><div class="card-body flex justify-between items-center">
          <div><p class="stat-label">Emparejados</p><p class="stat-value" style="color:var(--green-600);">${s.matched}</p></div>
          <div style="color:var(--green-400);">${ic('check',32)}</div>
        </div></div>
        <div class="card stat-card"><div class="card-body flex justify-between items-center">
          <div><p class="stat-label">Hospicio</p><p class="stat-value" style="color:var(--pink-600);">${s.hospice}</p></div>
          <div class="icon-circle" style="background:var(--pink-100);color:var(--pink-600);width:2rem;height:2rem;font-size:0.8rem;">♥</div>
        </div></div>
      </div>

      <div class="tabs" style="margin-bottom:1.5rem;">
        <button class="tab-btn active" onclick="App.switchTab('participants',this)">Participantes</button>
        <button class="tab-btn" onclick="App.switchTab('matching',this)">Emparejamiento</button>
        <button class="tab-btn" onclick="App.switchTab('matches',this)">Emparejamientos</button>
        <button class="tab-btn" onclick="App.switchTab('editor',this)">Editor de Textos</button>
        <button class="tab-btn" onclick="App.switchTab('images',this)">Imágenes</button>
        <button class="tab-btn" onclick="App.switchTab('settings',this)">Configuración</button>
      </div>

      <div class="tab-panel active" id="tab-participants">${renderTabParticipants()}</div>
      <div class="tab-panel" id="tab-matching">${renderTabMatching()}</div>
      <div class="tab-panel" id="tab-matches">${renderTabMatches()}</div>
      <div class="tab-panel" id="tab-editor">${renderTabEditor()}</div>
      <div class="tab-panel" id="tab-images">${renderTabImages()}</div>
      <div class="tab-panel" id="tab-settings">${renderTabSettings()}</div>
    `;
  }

  function switchTab(name, btn) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    btn.classList.add('active');
  }

  function renderTabParticipants() {
    const { participants: p } = adminData;
    if (!p.length) return '<div class="card"><div class="card-body text-center" style="color:var(--gray-500);padding:2rem;">No hay participantes registrados aún.</div></div>';
    return `<div class="card"><div class="card-body">
      <h3 style="margin-bottom:1rem;">${p.length} Participantes</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>Seudónimo</th><th>Email</th><th>Nombre</th><th>Ciudad</th><th>Estado</th><th>Tipo</th><th></th></tr></thead>
        <tbody>${p.map(r => `<tr>
          <td class="font-mono">${esc(r.pseudonym)}</td>
          <td>${esc(r.email)}</td>
          <td>${esc(r.name)}</td>
          <td>${esc(r.city)}</td>
          <td>${r.matched ? '<span class="badge badge-green">Emparejado</span>' : '<span class="badge badge-amber">Esperando</span>'}</td>
          <td>${r.is_hospice ? '<span class="badge badge-pink">Hospicio</span>' : '-'}</td>
          <td><button class="btn btn-ghost btn-sm" style="color:var(--red-600);" onclick="App.deleteParticipant('${r.id}')">${ic('trash')}</button></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div></div>`;
  }

  function renderTabMatching() {
    return `<div class="card"><div class="card-body">
      <h3 style="margin-bottom:0.5rem;">Generar Emparejamientos</h3>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1.5rem;">${adminData.stats.unmatched} participantes sin emparejar disponibles</p>
      <div id="matching-alert"></div>
      <div class="flex gap-4" style="margin-bottom:1.5rem;">
        <button class="btn btn-primary" onclick="App.generateMatches()" ${adminData.stats.unmatched < 2 ? 'disabled' : ''}>${ic('shuffle')} Generar Aleatorio</button>
        <button class="btn btn-outline hidden" id="save-matches-btn" onclick="App.saveMatches()">${ic('check','16')} Guardar</button>
      </div>
      <div id="match-preview"></div>
    </div></div>`;
  }

  function renderTabMatches() {
    const { matches: m } = adminData;
    return `<div class="card"><div class="card-body">
      <div class="flex justify-between items-center" style="margin-bottom:1rem;">
        <h3>${m.length} Emparejamientos</h3>
        <button class="btn btn-outline btn-sm" onclick="App.sendEmails()" ${m.filter(x=>!x.emails_sent).length === 0 ? 'disabled' : ''}>${ic('mail','16')} Marcar Emails Enviados</button>
      </div>
      ${m.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Remitente</th><th></th><th>Destinatario</th><th>Fecha</th><th>Emails</th></tr></thead>
        <tbody>${m.map(r => `<tr>
          <td class="font-mono">${esc(r.sender_pseudonym)}</td><td>→</td>
          <td class="font-mono">${esc(r.receiver_pseudonym)}</td>
          <td style="font-size:0.85rem;color:var(--gray-500);">${new Date(r.created_at).toLocaleDateString()}</td>
          <td>${r.emails_sent ? '<span class="badge badge-green">Enviado</span>' : '<span class="badge badge-amber">Pendiente</span>'}</td>
        </tr>`).join('')}</tbody>
      </table></div>` : '<p style="color:var(--gray-500);text-align:center;padding:1rem;">No hay emparejamientos aún.</p>'}
    </div></div>`;
  }

  function renderTabEditor() {
    const groups = [
      { title: 'Hero / Inicio', keys: ['hero_title','hero_subtitle','cta_button','cta_secondary'] },
      { title: 'Características', keys: ['feature1_title','feature1_text','feature2_title','feature2_text','feature3_title','feature3_text'] },
      { title: 'Cómo Funciona', keys: ['howit_title','step1_title','step1_desc','step2_title','step2_desc','step3_title','step3_desc','step4_title','step4_desc'] },
      { title: 'CTA & Footer', keys: ['cta2_title','cta2_text','footer_text'] },
      { title: 'Página Acerca de', keys: ['about_title','about_subtitle','about_story'] },
    ];

    return `<div class="card"><div class="card-body-lg">
      <h3 style="margin-bottom:0.5rem;">Editor de Contenido</h3>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1.5rem;">Edita los textos del sitio web. Los cambios se reflejan inmediatamente.</p>
      <div id="editor-alert"></div>
      ${groups.map(g => `
        <h3 style="margin:1.5rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid var(--gray-200);">${g.title}</h3>
        <div class="editor-grid">
          ${g.keys.map(k => {
            const isLong = k.includes('text') || k.includes('subtitle') || k.includes('story');
            return `<div class="form-group">
              <label class="form-label">${k.replace(/_/g,' ')}</label>
              ${isLong
                ? `<textarea class="form-input" id="cfg-${k}" rows="${k.includes('story')?6:3}">${esc(c(k))}</textarea>`
                : `<input class="form-input" id="cfg-${k}" value="${esc(c(k))}">`
              }
            </div>`;
          }).join('')}
        </div>
      `).join('')}
      <button class="btn btn-primary" style="margin-top:2rem;" onclick="App.saveConfig()" id="save-config-btn">${ic('check','16')} Guardar Cambios</button>
    </div></div>`;
  }

  function renderTabImages() {
    const { images } = adminData;
    return `<div class="card"><div class="card-body-lg">
      <h3 style="margin-bottom:0.5rem;">Gestión de Imágenes</h3>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1.5rem;">Sube y gestiona imágenes del sitio.</p>
      <div style="border:2px dashed var(--gray-200);border-radius:var(--radius);padding:2rem;text-align:center;margin-bottom:1.5rem;">
        <div style="margin-bottom:1rem;color:var(--gray-400);">${ic('upload')}</div>
        <p style="color:var(--gray-600);margin-bottom:0.5rem;">Arrastra o selecciona una imagen</p>
        <input type="file" id="img-file" accept="image/*" style="display:none;" onchange="App.previewImage()">
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('img-file').click()">Seleccionar Archivo</button>
        <div id="img-preview" style="margin-top:1rem;"></div>
        <div class="flex gap-4 justify-center hidden" style="margin-top:1rem;" id="img-upload-controls">
          <input class="form-input" id="img-name" placeholder="Nombre de la imagen" style="max-width:200px;">
          <select class="form-input" id="img-section" style="max-width:150px;">
            <option value="general">General</option><option value="hero">Hero</option><option value="about">Acerca de</option><option value="features">Características</option>
          </select>
          <button class="btn btn-primary btn-sm" onclick="App.uploadImage()" id="img-upload-btn">${ic('upload')} Subir</button>
        </div>
      </div>
      <div id="img-alert"></div>
      ${images.length ? `<div class="img-gallery">${images.map(img => `
        <div class="img-card">
          <img src="/uploads/${esc(img.filename)}" alt="${esc(img.name)}" loading="lazy">
          <div class="img-overlay">
            <span>${esc(img.name)}</span>
            <span style="font-size:0.7rem;opacity:0.7;">${img.section || 'general'}</span>
            <button class="btn btn-sm" style="color:var(--white);padding:0.2rem;margin-top:0.25rem;" onclick="App.deleteImage('${img.id}')">${ic('trash')} Eliminar</button>
          </div>
        </div>
      `).join('')}</div>` : '<p style="color:var(--gray-500);text-align:center;">No hay imágenes subidas.</p>'}
    </div></div>`;
  }

  function renderTabSettings() {
    return `<div class="card"><div class="card-body-lg">
      <h3 style="color:var(--red-600);margin-bottom:0.5rem;">Zona de Peligro</h3>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1.5rem;">Estas acciones no se pueden deshacer.</p>
      <div id="danger-zone">
        <button class="btn btn-danger" onclick="App.showClearConfirm()">${ic('trash')} Borrar Todos los Datos</button>
      </div>
    </div></div>`;
  }

  // ── Admin Actions ──────────────────────────────────
  async function generateMatches() {
    try {
      const data = await api('/api/admin/generate-matches', { method: 'POST' });
      adminData.pendingMatches = data.matches;
      document.getElementById('matching-alert').innerHTML = `<div class="alert alert-success">${ic('check','16')} <span>Se generaron ${data.count} emparejamientos</span></div>`;
      document.getElementById('save-matches-btn').classList.remove('hidden');
      document.getElementById('match-preview').innerHTML = `
        <h4 style="margin-bottom:0.75rem;">Vista previa (${data.count} emparejamientos)</h4>
        <div class="table-wrap"><table><thead><tr><th>Remitente</th><th></th><th>Destinatario</th></tr></thead>
        <tbody>${data.matches.map(m => `<tr><td class="font-mono">${esc(m.sender_pseudonym)}</td><td>→</td><td class="font-mono">${esc(m.receiver_pseudonym)}</td></tr>`).join('')}</tbody></table></div>`;
    } catch(e) {
      document.getElementById('matching-alert').innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>${e.message}</span></div>`;
    }
  }

  async function saveMatches() {
    if (!adminData.pendingMatches.length) return;
    try {
      await api('/api/admin/save-matches', { method: 'POST', body: JSON.stringify({ matches: adminData.pendingMatches }) });
      document.getElementById('matching-alert').innerHTML = `<div class="alert alert-success">${ic('check','16')} <span>Emparejamientos guardados</span></div>`;
      adminData.pendingMatches = [];
      document.getElementById('save-matches-btn').classList.add('hidden');
      document.getElementById('match-preview').innerHTML = '';
      loadAdminDashboard();
    } catch(e) {
      document.getElementById('matching-alert').innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>${e.message}</span></div>`;
    }
  }

  async function sendEmails() {
    try {
      await api('/api/admin/send-emails', { method: 'POST' });
      loadAdminDashboard();
    } catch(e) { alert(e.message); }
  }

  async function deleteParticipant(id) {
    if (!confirm('¿Eliminar este participante y sus emparejamientos?')) return;
    try { await api('/api/admin/participants/' + id, { method: 'DELETE' }); loadAdminDashboard(); } catch(e) { alert(e.message); }
  }

  function showClearConfirm() {
    document.getElementById('danger-zone').innerHTML = `
      <div class="danger-zone">
        <p>¿Estás seguro? Esto eliminará TODOS los participantes y emparejamientos.</p>
        <div class="flex gap-4">
          <button class="btn btn-danger" onclick="App.clearAll()">Sí, Borrar Todo</button>
          <button class="btn btn-outline" onclick="App.loadAdminDashboard()">Cancelar</button>
        </div>
      </div>`;
  }

  async function clearAll() {
    try { await api('/api/admin/clear-all', { method: 'POST' }); loadAdminDashboard(); } catch(e) { alert(e.message); }
  }

  async function saveConfig() {
    const btn = document.getElementById('save-config-btn');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Guardando...';
    const updates = {};
    document.querySelectorAll('[id^="cfg-"]').forEach(el => {
      const key = el.id.replace('cfg-', '');
      updates[key] = el.value;
    });
    try {
      await api('/api/admin/config', { method: 'PUT', body: JSON.stringify(updates) });
      config = { ...config, ...updates };
      document.getElementById('editor-alert').innerHTML = `<div class="alert alert-success">${ic('check','16')} <span>Cambios guardados exitosamente</span></div>`;
      setTimeout(() => { const a = document.getElementById('editor-alert'); if(a) a.innerHTML = ''; }, 3000);
    } catch(e) {
      document.getElementById('editor-alert').innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>${e.message}</span></div>`;
    }
    btn.disabled = false; btn.innerHTML = `${ic('check','16')} Guardar Cambios`;
  }

  function previewImage() {
    const file = document.getElementById('img-file').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('img-preview').innerHTML = `<img src="${e.target.result}" style="max-height:120px;border-radius:0.5rem;margin-top:0.5rem;">`;
      document.getElementById('img-upload-controls')?.classList?.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  async function uploadImage() {
    const file = document.getElementById('img-file').files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', document.getElementById('img-name').value || file.name);
    formData.append('section', document.getElementById('img-section').value);
    const btn = document.getElementById('img-upload-btn');
    btn.disabled = true;
    try {
      const res = await fetch('/api/admin/images', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      document.getElementById('img-alert').innerHTML = `<div class="alert alert-success">${ic('check','16')} <span>Imagen subida exitosamente</span></div>`;
      const imgs = await api('/api/images');
      adminData.images = imgs;
      // Re-render images tab
      document.getElementById('tab-images').innerHTML = renderTabImages();
    } catch(e) {
      document.getElementById('img-alert').innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>${e.message}</span></div>`;
    }
    btn.disabled = false;
  }

  async function deleteImage(id) {
    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      await api('/api/admin/images/' + id, { method: 'DELETE' });
      adminData.images = adminData.images.filter(i => i.id !== id);
      document.getElementById('tab-images').innerHTML = renderTabImages();
    } catch(e) { alert(e.message); }
  }

  async function adminExport() {
    try {
      const data = await api('/api/admin/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `cartas-export-${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
    } catch(e) { alert(e.message); }
  }

  async function adminLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    navigate('home');
  }

  // ── Utility ────────────────────────────────────────
  function esc(str) { if (!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

  // ── Render ─────────────────────────────────────────
  function render() {
    const root = document.getElementById('app');
    switch(currentView) {
      case 'home': root.innerHTML = renderHome(); break;
      case 'register': root.innerHTML = renderRegister(); initRegister(); break;
      case 'about': root.innerHTML = renderAbout(); break;
      case 'privacy': root.innerHTML = renderPrivacy(); break;
      case 'admin': root.innerHTML = renderAdmin(); checkAdminAuth(); break;
    }
  }

  // ── Init ───────────────────────────────────────────
  async function init() {
    await loadConfig();
    render();
  }

  // Public API
  return {
    init, navigate, toggleCustomPseudo, newPseudo, submitPseudo, submitRegistration,
    adminLogin, loadAdminDashboard, switchTab, generateMatches, saveMatches, sendEmails,
    deleteParticipant, showClearConfirm, clearAll, saveConfig, previewImage, uploadImage,
    deleteImage, adminExport, adminLogout,
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
