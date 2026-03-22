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
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    fileText: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    mapPin: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
    toggle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="16" cy="12" r="2"/></svg>',
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
            <button class="btn btn-outline btn-lg" onclick="App.navigate('status')">${ic('search',18)} Consultar Estado</button>
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
          ${c('hospice_enabled') === 'true' ? `<div class="card slide-up" style="animation-delay:0.2s">
            <div class="card-body">
              <div class="icon-circle bg-pink" style="margin-bottom:1rem;">${ic('heart')}</div>
              <h3>${c('feature2_title')}</h3>
              <p style="color:var(--gray-600);margin-top:0.5rem;font-size:0.95rem;">${c('feature2_text')}</p>
            </div>
          </div>` : ''}
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
            <button onclick="App.navigate('status')">Consultar Estado</button>
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

  // ── Status View (check your match) ─────────────────
  function renderStatus() {
    return `
    <div class="page-bg" style="padding:3rem 1.5rem;">
      <div class="container-sm">
        <button class="btn btn-ghost" onclick="App.navigate('home')" style="margin-bottom:1.5rem;">${ic('arrowLeft')} Atrás</button>
        <div class="card">
          <div class="card-body-lg">
            <div class="text-center" style="margin-bottom:1.5rem;">
              <div class="icon-circle bg-indigo" style="margin:0 auto 1rem;">${ic('search')}</div>
              <h2>Consultar Tu Estado</h2>
              <p style="color:var(--gray-500);font-size:0.9rem;">Ingresa tu seudónimo y correo para ver si ya fuiste emparejado.</p>
            </div>
            <div id="status-alert"></div>
            <div id="status-form">
              <div class="form-group" style="margin-bottom:1rem;">
                <label class="form-label">Tu Seudónimo</label>
                <input class="form-input form-input-lg" id="status-pseudo" placeholder="Ej: GentleWriter123">
              </div>
              <div class="form-group" style="margin-bottom:1.5rem;">
                <label class="form-label">Tu Correo Electrónico</label>
                <input class="form-input form-input-lg" type="email" id="status-email" placeholder="tu@correo.com" onkeydown="if(event.key==='Enter')App.checkStatus()">
              </div>
              <button class="btn btn-primary btn-block btn-lg" onclick="App.checkStatus()" id="status-btn">${ic('search',18)} Consultar</button>
            </div>
            <div id="status-result" class="hidden"></div>
          </div>
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
        ${c('hospice_enabled') === 'true' ? `
        <div class="checkbox-row"><input type="checkbox" id="reg-hospice" onchange="document.getElementById('hospice-field').classList.toggle('hidden',!this.checked)"><label for="reg-hospice">Esta es una dirección de hospicio/destinatario</label></div>
        <div id="hospice-field" class="hidden form-group"><label class="form-label">Nombre del Hospicio</label><input class="form-input" id="reg-hospice-name" placeholder="Hogar de Cuidado Sunshine"></div>
      ` : '<input type="hidden" id="reg-hospice"><input type="hidden" id="reg-hospice-name">'}
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
          <p style="font-size:0.9rem;color:var(--gray-500);margin-bottom:1rem;">Tu seudónimo: <span class="font-mono" style="color:var(--indigo-600);font-weight:700;">${regPseudonym}</span></p>
          <p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:2rem;">Puedes volver en cualquier momento a <strong>Consultar Estado</strong> para ver si ya fuiste emparejado y obtener los datos de tu destinatario.</p>
          <div class="flex gap-4 justify-center">
            <button class="btn btn-primary" onclick="App.navigate('home')">Volver al Inicio</button>
            <button class="btn btn-outline" onclick="App.navigate('status')">Consultar Estado</button>
          </div>
        </div>
      `;
      document.querySelector('#register-card h2').textContent = '';
      document.querySelector('#register-card > div > p')?.remove();
    } catch(e) {
      showRegAlert(e.message);
      btn.disabled = false; btn.textContent = 'Completar Registro';
    }
  }

  // ── Status Logic ─────────────────────────────────
  async function checkStatus() {
    const pseudo = document.getElementById('status-pseudo')?.value?.trim();
    const email = document.getElementById('status-email')?.value?.trim();
    const alertEl = document.getElementById('status-alert');
    const resultEl = document.getElementById('status-result');

    if (!pseudo || !email) {
      alertEl.innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>Ingresa tu seudónimo y correo electrónico</span></div>`;
      return;
    }

    const btn = document.getElementById('status-btn');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Consultando...';
    alertEl.innerHTML = '';

    try {
      const data = await api('/api/status', {
        method: 'POST',
        body: JSON.stringify({ pseudonym: pseudo, email }),
      });

      document.getElementById('status-form').classList.add('hidden');
      resultEl.classList.remove('hidden');

      if (data.matched && data.match) {
        const m = data.match;
        const hospiceNote = m.receiver_is_hospice && m.receiver_hospice_name
          ? `<div class="alert alert-success" style="margin-top:1rem;">${ic('heart','16')} <span>Tu destinatario es un residente de hospicio en: <strong>${esc(m.receiver_hospice_name)}</strong>. Una carta amable significará mucho.</span></div>` : '';

        resultEl.innerHTML = `
          <div class="fade-in">
            <div class="text-center" style="margin-bottom:1.5rem;">
              <div class="icon-circle bg-green" style="margin:0 auto 1rem;width:4rem;height:4rem;">${ic('check',32)}</div>
              <h2 style="color:var(--green-700);">¡Tienes un emparejamiento!</h2>
              <p style="color:var(--gray-500);font-size:0.9rem;">Emparejado el ${new Date(m.matched_at).toLocaleDateString('es')}</p>
            </div>
            <div class="card" style="background:var(--indigo-50);box-shadow:none;margin-bottom:1rem;">
              <div class="card-body">
                <p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:0.75rem;">Escribe tu carta a:</p>
                <h3 class="font-mono" style="color:var(--indigo-700);font-size:1.3rem;margin-bottom:1rem;">${esc(m.receiver_pseudonym)}</h3>
                <div style="background:var(--white);border-radius:0.5rem;padding:1rem;font-size:0.95rem;line-height:1.7;">
                  <div class="flex gap-2 items-center" style="margin-bottom:0.25rem;">${ic('mapPin','16')} <span>${esc(m.receiver_address)}</span></div>
                  <div style="padding-left:1.5rem;">${esc(m.receiver_city)}, ${esc(m.receiver_postal_code)}</div>
                  <div style="padding-left:1.5rem;font-weight:600;">${esc(m.receiver_country)}</div>
                </div>
              </div>
            </div>
            ${hospiceNote}
            <div class="card" style="background:var(--amber-100);box-shadow:none;margin-bottom:1.5rem;">
              <div class="card-body" style="font-size:0.85rem;color:var(--gray-700);">
                <strong>Recuerda:</strong> No incluyas tu nombre real ni dirección de remitente. Firma con tu seudónimo: <strong class="font-mono">${esc(data.pseudonym)}</strong>
              </div>
            </div>
            <div class="text-center">
              <button class="btn btn-outline" onclick="App.navigate('home')">Volver al Inicio</button>
            </div>
          </div>`;
      } else {
        resultEl.innerHTML = `
          <div class="fade-in text-center">
            <div class="icon-circle" style="margin:0 auto 1rem;width:4rem;height:4rem;background:var(--amber-100);color:var(--amber-600);">${ic('clock')}</div>
            <h2>Aún no emparejado</h2>
            <p style="color:var(--gray-600);margin:1rem 0;">Tu registro como <span class="font-mono" style="color:var(--indigo-600);font-weight:700;">${esc(data.pseudonym)}</span> está activo desde el ${new Date(data.registered_at).toLocaleDateString('es')}.</p>
            <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:2rem;">Estamos esperando a que se registren más participantes para hacer los emparejamientos. Te notificaremos por correo cuando ocurra.</p>
            <div class="flex gap-4 justify-center">
              <button class="btn btn-outline" onclick="App.navigate('home')">Volver al Inicio</button>
              <button class="btn btn-ghost" onclick="resultEl=document.getElementById('status-result');resultEl.classList.add('hidden');document.getElementById('status-form').classList.remove('hidden');">Consultar otro</button>
            </div>
          </div>`;
      }
    } catch(e) {
      alertEl.innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>${e.message}</span></div>`;
    }

    btn.disabled = false; btn.innerHTML = `${ic('search',18)} Consultar`;
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
    if (name === 'settings') loadSmtpStatus();
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
    const pendingCount = m.filter(x => !x.emails_sent).length;
    return `<div class="card"><div class="card-body">
      <div class="flex justify-between items-center" style="margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
        <h3>${m.length} Emparejamientos</h3>
        <div class="flex gap-2" style="flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="App.exportCSV()" ${!m.length ? 'disabled' : ''}>${ic('fileText')} CSV</button>
          <button class="btn btn-outline btn-sm" onclick="App.sendEmails()" ${pendingCount === 0 ? 'disabled' : ''}>Marcar como enviados</button>
        </div>
      </div>
      <div id="email-status-bar" style="margin-bottom:1rem;"></div>
      ${pendingCount > 0 ? `
      <div style="background:var(--indigo-50);border-radius:0.5rem;padding:1.25rem;margin-bottom:1.25rem;">
        <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:0.75rem;">
          <div>
            <strong style="font-size:0.95rem;">${ic('mail','16')} ${pendingCount} correo${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''}</strong>
            <p style="font-size:0.85rem;color:var(--gray-600);margin-top:0.25rem;">Envía las notificaciones con la dirección del destinatario a cada remitente.</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm" onclick="App.previewFirstEmail()">Vista previa</button>
            <button class="btn btn-primary btn-sm" onclick="App.sendAllEmails()" id="send-all-btn">${ic('mail','16')} Enviar todos</button>
          </div>
        </div>
      </div>` : ''}
      <div id="send-results"></div>
      ${m.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Remitente</th><th></th><th>Destinatario</th><th>Fecha</th><th>Email</th><th></th></tr></thead>
        <tbody>${m.map(r => `<tr>
          <td class="font-mono">${esc(r.sender_pseudonym)}</td><td>→</td>
          <td class="font-mono">${esc(r.receiver_pseudonym)}</td>
          <td style="font-size:0.85rem;color:var(--gray-500);">${new Date(r.created_at).toLocaleDateString()}</td>
          <td>${r.emails_sent ? '<span class="badge badge-green">Enviado</span>' : '<span class="badge badge-amber">Pendiente</span>'}</td>
          <td class="flex gap-2" style="justify-content:flex-end;">
            <button class="btn btn-ghost btn-sm" onclick="App.previewEmail('${r.id}')" title="Vista previa">${ic('eye','14')}</button>
            ${!r.emails_sent ? `<button class="btn btn-ghost btn-sm" onclick="App.sendOneEmail('${r.id}')" title="Enviar">${ic('mail','14')}</button>` : ''}
          </td>
        </tr>`).join('')}</tbody>
      </table></div>` : '<p style="color:var(--gray-500);text-align:center;padding:1rem;">No hay emparejamientos aún.</p>'}
    </div></div>
    <div id="email-preview-modal" class="hidden"></div>`;
  }

  function renderTabEditor() {
    const groups = [
      { title: 'Hero / Inicio', keys: ['hero_title','hero_subtitle','cta_button','cta_secondary'] },
      { title: 'Características', keys: ['feature1_title','feature1_text','feature2_title','feature2_text','feature3_title','feature3_text'] },
      { title: 'Cómo Funciona', keys: ['howit_title','step1_title','step1_desc','step2_title','step2_desc','step3_title','step3_desc','step4_title','step4_desc'] },
      { title: 'CTA & Footer', keys: ['cta2_title','cta2_text','footer_text'] },
      { title: 'Página Acerca de', keys: ['about_title','about_subtitle','about_story'] },
      { title: 'Plantilla de Email', keys: ['email_subject','email_body'] },
    ];

    return `<div class="card"><div class="card-body-lg">
      <h3 style="margin-bottom:0.5rem;">Editor de Contenido</h3>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1.5rem;">Edita los textos del sitio web. Los cambios se reflejan inmediatamente.</p>
      <div id="editor-alert"></div>
      ${groups.map(g => `
        <h3 style="margin:1.5rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid var(--gray-200);">${g.title}</h3>
        <div class="editor-grid">
          ${g.keys.map(k => {
            const isLong = k.includes('text') || k.includes('subtitle') || k.includes('story') || k === 'email_body';
            const rows = k === 'email_body' ? 12 : k.includes('story') ? 6 : 3;
            const hint = k === 'email_body' ? '<span class="form-hint" style="margin-top:0.25rem;">Variables: {{sender_pseudonym}}, {{receiver_pseudonym}}, {{receiver_address}}, {{receiver_city}}, {{receiver_postal_code}}, {{receiver_country}}, {{hospice_note}}, {{site_url}}</span>' : '';
            return `<div class="form-group">
              <label class="form-label">${k.replace(/_/g,' ')}</label>
              ${isLong
                ? `<textarea class="form-input" id="cfg-${k}" rows="${rows}">${esc(c(k))}</textarea>${hint}`
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
    const hospiceOn = c('hospice_enabled') === 'true';
    return `
    <div class="card" style="margin-bottom:1.5rem;"><div class="card-body-lg">
      <h3 style="margin-bottom:0.5rem;">Configuración de Email (SMTP)</h3>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1.25rem;">Estado de la conexión para envío de correos.</p>
      <div id="smtp-status" style="margin-bottom:1rem;">
        <p style="color:var(--gray-400);font-size:0.9rem;">Cargando estado SMTP...</p>
      </div>
      <div id="smtp-test-result"></div>
    </div></div>
    <div class="card" style="margin-bottom:1.5rem;"><div class="card-body-lg">
      <h3 style="margin-bottom:0.5rem;">Opciones del Sitio</h3>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1.5rem;">Activa o desactiva funcionalidades del sitio público.</p>
      <div id="settings-alert"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem;background:${hospiceOn ? 'var(--pink-50)' : 'var(--gray-50)'};border-radius:0.5rem;border:1px solid ${hospiceOn ? 'var(--pink-100)' : 'var(--gray-200)'};">
        <div style="flex:1;">
          <div class="flex items-center gap-2" style="margin-bottom:0.25rem;">
            ${ic('heart','16')}
            <strong style="font-size:0.95rem;">Programa de Hospicio</strong>
          </div>
          <p style="font-size:0.85rem;color:var(--gray-500);">Permite que los participantes se registren como destinatarios de hospicio. Si se desactiva, la opción no aparece en el formulario de registro ni en la página principal.</p>
        </div>
        <button class="btn ${hospiceOn ? 'btn-primary' : 'btn-outline'} btn-sm" style="margin-left:1rem;min-width:100px;" onclick="App.toggleHospice()">
          ${hospiceOn ? '✓ Activado' : 'Desactivado'}
        </button>
      </div>
    </div></div>
    <div class="card"><div class="card-body-lg">
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
    if (!confirm('¿Marcar todos los pendientes como enviados sin enviar correos reales?')) return;
    try {
      await api('/api/admin/send-emails', { method: 'POST' });
      loadAdminDashboard();
    } catch(e) { alert(e.message); }
  }

  // ── Email Actions ──────────────────────────────────
  async function previewEmail(matchId) {
    try {
      const data = await api('/api/admin/email/preview/' + matchId);
      const modal = document.getElementById('send-results') || document.getElementById('email-status-bar');
      if (modal) modal.innerHTML = `
        <div class="card" style="margin-bottom:1rem;background:var(--gray-50);box-shadow:none;">
          <div class="card-body">
            <div class="flex justify-between items-center" style="margin-bottom:0.75rem;">
              <h3 style="font-size:0.95rem;">Vista previa del correo</h3>
              <button class="btn btn-ghost btn-sm" onclick="this.closest('.card').remove()">✕</button>
            </div>
            <div style="font-size:0.85rem;margin-bottom:0.5rem;"><strong>Para:</strong> ${esc(data.to)}</div>
            <div style="font-size:0.85rem;margin-bottom:0.75rem;"><strong>Asunto:</strong> ${esc(data.subject)}</div>
            <pre style="background:var(--white);border:1px solid var(--gray-200);border-radius:0.5rem;padding:1rem;font-size:0.85rem;white-space:pre-wrap;font-family:'DM Sans',sans-serif;line-height:1.6;max-height:300px;overflow-y:auto;">${esc(data.body)}</pre>
          </div>
        </div>`;
    } catch(e) { alert(e.message); }
  }

  async function previewFirstEmail() {
    const pending = adminData.matches.find(m => !m.emails_sent);
    if (pending) previewEmail(pending.id);
    else alert('No hay correos pendientes');
  }

  async function sendOneEmail(matchId) {
    if (!confirm('¿Enviar este correo ahora?')) return;
    try {
      const data = await api('/api/admin/email/send/' + matchId, { method: 'POST' });
      const bar = document.getElementById('email-status-bar');
      if (bar) bar.innerHTML = `<div class="alert alert-success">${ic('check','16')} <span>Correo enviado a ${esc(data.to)}</span></div>`;
      loadAdminDashboard();
    } catch(e) {
      const bar = document.getElementById('email-status-bar');
      if (bar) bar.innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>${e.message}</span></div>`;
    }
  }

  async function sendAllEmails() {
    const pending = adminData.matches.filter(m => !m.emails_sent).length;
    if (!confirm(`¿Enviar ${pending} correo${pending > 1 ? 's' : ''} ahora?\n\nCada correo incluirá la dirección del destinatario para que el remitente pueda enviar su carta.`)) return;

    const btn = document.getElementById('send-all-btn');
    const resultsDiv = document.getElementById('send-results');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Enviando...'; }
    if (resultsDiv) resultsDiv.innerHTML = `<div style="background:var(--indigo-50);border-radius:0.5rem;padding:1rem;text-align:center;margin-bottom:1rem;">
      <p style="color:var(--indigo-600);font-weight:600;">Enviando ${pending} correos...</p>
      <p style="color:var(--gray-500);font-size:0.85rem;margin-top:0.25rem;">Esto puede tardar unos momentos. No cierres esta página.</p>
    </div>`;

    try {
      const data = await api('/api/admin/email/send-all', { method: 'POST' });

      let html = `<div class="card" style="margin-bottom:1rem;box-shadow:none;border:1px solid ${data.failed ? 'var(--amber-100)' : 'var(--green-100)'};">
        <div class="card-body">
          <div class="flex justify-between items-center" style="margin-bottom:0.75rem;">
            <h3 style="font-size:0.95rem;">${data.failed ? '⚠️' : '✅'} Resultado del envío</h3>
            <button class="btn btn-ghost btn-sm" onclick="this.closest('.card').remove()">✕</button>
          </div>
          <div class="flex gap-4" style="margin-bottom:0.75rem;">
            <span class="badge badge-green">${data.sent} enviados</span>
            ${data.failed ? `<span class="badge badge-amber">${data.failed} fallidos</span>` : ''}
          </div>
          <div class="table-wrap"><table style="font-size:0.8rem;">
            <thead><tr><th>Seudónimo</th><th>Destino</th><th>Estado</th></tr></thead>
            <tbody>${data.results.map(r => `<tr>
              <td class="font-mono">${esc(r.pseudonym)}</td>
              <td>${esc(r.to || '-')}</td>
              <td>${r.status === 'sent'
                ? '<span class="badge badge-green">Enviado</span>'
                : `<span class="badge badge-amber" title="${esc(r.error || '')}">Error</span>`
              }</td>
            </tr>`).join('')}</tbody>
          </table></div>
        </div>
      </div>`;

      if (resultsDiv) resultsDiv.innerHTML = html;
      // Refresh dashboard data but preserve results
      const [stats, participants, matches, images] = await Promise.all([
        api('/api/admin/stats'), api('/api/admin/participants'), api('/api/admin/matches'), api('/api/images'),
      ]);
      adminData = { ...adminData, stats, participants, matches, images };
    } catch(e) {
      if (resultsDiv) resultsDiv.innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>${e.message}</span></div>`;
    }
    if (btn) { btn.disabled = false; btn.innerHTML = `${ic('mail','16')} Enviar todos`; }
  }

  async function loadSmtpStatus() {
    try {
      const data = await api('/api/admin/email/status');
      const el = document.getElementById('smtp-status');
      if (!el) return;
      if (data.configured) {
        el.innerHTML = `
          <div style="display:flex;align-items:center;gap:0.75rem;padding:1rem;background:var(--green-50);border:1px solid var(--green-100);border-radius:0.5rem;">
            <div style="color:var(--green-600);">${ic('check','20')}</div>
            <div style="flex:1;">
              <strong style="font-size:0.9rem;color:var(--green-700);">SMTP Configurado</strong>
              <p style="font-size:0.8rem;color:var(--gray-500);margin-top:0.15rem;">Servidor: ${esc(data.host)} · Usuario: ${esc(data.user)} · From: ${esc(data.from)}</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="App.testSmtp()">Probar conexión</button>
          </div>`;
      } else {
        el.innerHTML = `
          <div style="padding:1rem;background:var(--amber-100);border:1px solid var(--amber-600);border-radius:0.5rem;">
            <strong style="font-size:0.9rem;color:var(--amber-600);">SMTP No Configurado</strong>
            <p style="font-size:0.8rem;color:var(--gray-600);margin-top:0.35rem;line-height:1.5;">
              Agrega estas variables al archivo <code>.env</code> y reinicia el servidor:
            </p>
            <pre style="background:var(--white);border-radius:0.375rem;padding:0.75rem;margin-top:0.5rem;font-size:0.8rem;line-height:1.6;overflow-x:auto;">SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM="Cartas a Desconocidos &lt;tu-correo@gmail.com&gt;"
SITE_URL=https://tudominio.com</pre>
            <p style="font-size:0.78rem;color:var(--gray-500);margin-top:0.5rem;">Para Gmail: activa la verificación en 2 pasos y genera una <a href="https://myaccount.google.com/apppasswords" target="_blank" style="color:var(--indigo-600);text-decoration:underline;">contraseña de aplicación</a>.</p>
          </div>`;
      }
    } catch(e) {
      const el = document.getElementById('smtp-status');
      if (el) el.innerHTML = `<div class="alert alert-error">${e.message}</div>`;
    }
  }

  async function testSmtp() {
    const el = document.getElementById('smtp-test-result');
    if (el) el.innerHTML = '<p style="color:var(--gray-500);font-size:0.85rem;">Probando conexión...</p>';
    try {
      const data = await api('/api/admin/email/test', { method: 'POST' });
      if (el) el.innerHTML = `<div class="alert alert-success" style="margin-top:0.75rem;">${ic('check','16')} <span>${data.message}</span></div>`;
      setTimeout(() => { if(el) el.innerHTML = ''; }, 5000);
    } catch(e) {
      if (el) el.innerHTML = `<div class="alert alert-error" style="margin-top:0.75rem;">${ic('alertCircle')} <span>${e.message}</span></div>`;
    }
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

  // ── Email Actions ───────────────────────────────────
  async function loadSmtpStatus() {
    const el = document.getElementById('smtp-status');
    if (!el) return;
    try {
      const data = await api('/api/admin/email/status');
      if (data.configured) {
        el.innerHTML = `
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
            <span style="width:10px;height:10px;border-radius:50%;background:var(--green-600);display:inline-block;"></span>
            <strong style="color:var(--green-700);font-size:0.9rem;">SMTP Configurado</strong>
          </div>
          <div style="font-size:0.85rem;color:var(--gray-600);background:var(--gray-50);padding:0.75rem;border-radius:0.5rem;">
            <div><strong>Servidor:</strong> ${esc(data.host)}</div>
            <div><strong>Usuario:</strong> ${esc(data.user)}</div>
            <div><strong>Remitente:</strong> ${esc(data.from)}</div>
          </div>
          <button class="btn btn-outline btn-sm" style="margin-top:0.75rem;" onclick="App.testSmtp()">Probar conexión</button>`;
      } else {
        el.innerHTML = `
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
            <span style="width:10px;height:10px;border-radius:50%;background:var(--amber-600);display:inline-block;"></span>
            <strong style="color:var(--amber-600);font-size:0.9rem;">SMTP No Configurado</strong>
          </div>
          <div style="font-size:0.85rem;color:var(--gray-600);background:var(--amber-100);padding:1rem;border-radius:0.5rem;">
            <p style="margin-bottom:0.5rem;">Para enviar correos, configura las variables SMTP en el archivo <code>.env</code> del servidor y reinicia:</p>
            <pre style="background:var(--gray-900);color:#e5e7eb;padding:0.75rem;border-radius:0.375rem;overflow-x:auto;font-size:0.8rem;margin-top:0.5rem;">SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
SMTP_FROM="Cartas a Desconocidos &lt;tu-correo@gmail.com&gt;"</pre>
            <p style="margin-top:0.75rem;font-size:0.8rem;">Para Gmail: activa verificación en 2 pasos y genera una <a href="https://myaccount.google.com/apppasswords" target="_blank" style="color:var(--indigo-600);text-decoration:underline;">contraseña de aplicación</a>.</p>
          </div>
          <p style="font-size:0.85rem;color:var(--gray-500);margin-top:0.75rem;">Mientras tanto, puedes exportar el CSV e importarlo en tu herramienta de email favorita.</p>`;
      }
    } catch(e) { el.innerHTML = `<div class="alert alert-error">${e.message}</div>`; }
  }

  async function testSmtp() {
    const el = document.getElementById('smtp-test-result');
    el.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;"><span class="spinner" style="border-color:var(--gray-300);border-top-color:var(--indigo-600);"></span> Probando conexión...</p>';
    try {
      const data = await api('/api/admin/email/test', { method: 'POST' });
      el.innerHTML = `<div class="alert alert-success">${ic('check','16')} <span>${data.message}</span></div>`;
    } catch(e) {
      el.innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>${e.message}</span></div>`;
    }
  }

  async function previewEmail(matchId) {
    try {
      const data = await api('/api/admin/email/preview/' + matchId);
      showEmailModal(data);
    } catch(e) { alert(e.message); }
  }

  async function previewFirstEmail() {
    const pending = adminData.matches.find(m => !m.emails_sent);
    if (pending) previewEmail(pending.id);
  }

  function showEmailModal(data) {
    const modal = document.getElementById('email-preview-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;display:flex;align-items:center;justify-content:center;padding:1rem;" onclick="if(event.target===this)this.parentElement.classList.add('hidden')">
        <div class="card" style="max-width:600px;width:100%;max-height:90vh;overflow-y:auto;" onclick="event.stopPropagation()">
          <div class="card-body-lg">
            <div class="flex justify-between items-center" style="margin-bottom:1rem;">
              <h3>Vista Previa del Email</h3>
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('email-preview-modal').classList.add('hidden')">✕</button>
            </div>
            <div style="font-size:0.85rem;margin-bottom:1rem;">
              <div style="padding:0.5rem 0;border-bottom:1px solid var(--gray-200);"><strong>Para:</strong> ${esc(data.to)}</div>
              <div style="padding:0.5rem 0;border-bottom:1px solid var(--gray-200);"><strong>Asunto:</strong> ${esc(data.subject)}</div>
              <div style="padding:0.5rem 0;"><strong>De:</strong> ${esc(data.sender_pseudonym)} → ${esc(data.receiver_pseudonym)}</div>
            </div>
            <div style="background:var(--gray-50);border-radius:0.5rem;padding:1.25rem;font-family:'JetBrains Mono',monospace;font-size:0.8rem;white-space:pre-wrap;line-height:1.6;color:var(--gray-700);max-height:400px;overflow-y:auto;">${esc(data.body)}</div>
            <div class="flex gap-2 justify-end" style="margin-top:1.25rem;">
              <button class="btn btn-outline btn-sm" onclick="document.getElementById('email-preview-modal').classList.add('hidden')">Cerrar</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  async function sendOneEmail(matchId) {
    if (!confirm('¿Enviar este correo ahora?')) return;
    const statusEl = document.getElementById('email-status-bar');
    statusEl.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;"><span class="spinner" style="border-color:var(--gray-300);border-top-color:var(--indigo-600);"></span> Enviando...</p>';
    try {
      const data = await api('/api/admin/email/send/' + matchId, { method: 'POST' });
      statusEl.innerHTML = `<div class="alert alert-success">${ic('check','16')} <span>Email enviado a ${esc(data.to)}</span></div>`;
      loadAdminDashboard();
    } catch(e) {
      statusEl.innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>${e.message}</span></div>`;
    }
  }

  async function sendAllEmails() {
    const pending = adminData.matches.filter(m => !m.emails_sent).length;
    if (!confirm(`¿Enviar ${pending} correo${pending > 1 ? 's' : ''} ahora? Se enviará uno por uno con una pausa entre cada envío para evitar límites.`)) return;

    const btn = document.getElementById('send-all-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Enviando...'; }
    const statusEl = document.getElementById('email-status-bar');
    statusEl.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;"><span class="spinner" style="border-color:var(--gray-300);border-top-color:var(--indigo-600);"></span> Enviando correos... esto puede tomar unos minutos.</p>';

    try {
      const data = await api('/api/admin/email/send-all', { method: 'POST' });

      // Show results
      const resultsEl = document.getElementById('send-results');
      let html = `<div style="margin-bottom:1.25rem;">`;
      if (data.sent > 0) html += `<div class="alert alert-success">${ic('check','16')} <span><strong>${data.sent}</strong> correo${data.sent > 1 ? 's' : ''} enviado${data.sent > 1 ? 's' : ''} exitosamente</span></div>`;
      if (data.failed > 0) html += `<div class="alert alert-error">${ic('alertCircle')} <span><strong>${data.failed}</strong> correo${data.failed > 1 ? 's' : ''} fallido${data.failed > 1 ? 's' : ''}</span></div>`;

      if (data.results && data.results.length > 0) {
        html += `<details style="font-size:0.85rem;margin-top:0.5rem;"><summary style="cursor:pointer;color:var(--gray-600);font-weight:500;">Ver detalle de envío</summary>
          <div class="table-wrap" style="margin-top:0.5rem;"><table>
            <thead><tr><th>Seudónimo</th><th>Email</th><th>Estado</th></tr></thead>
            <tbody>${data.results.map(r => `<tr>
              <td class="font-mono">${esc(r.pseudonym)}</td>
              <td>${esc(r.to || '-')}</td>
              <td>${r.status === 'sent' ? '<span class="badge badge-green">Enviado</span>' : '<span class="badge badge-amber" title="' + esc(r.error || '') + '">Error</span>'}</td>
            </tr>`).join('')}</tbody>
          </table></div>
        </details>`;
      }
      html += '</div>';
      if (resultsEl) resultsEl.innerHTML = html;
      statusEl.innerHTML = '';
      loadAdminDashboard();
    } catch(e) {
      statusEl.innerHTML = `<div class="alert alert-error">${ic('alertCircle')} <span>${e.message}</span></div>`;
      if (btn) { btn.disabled = false; btn.innerHTML = `${ic('mail','16')} Enviar todos`; }
    }
  }

  async function toggleHospice() {
    const current = c('hospice_enabled') === 'true';
    const newVal = current ? 'false' : 'true';
    try {
      await api('/api/admin/config', { method: 'PUT', body: JSON.stringify({ hospice_enabled: newVal }) });
      config.hospice_enabled = newVal;
      document.getElementById('tab-settings').innerHTML = renderTabSettings();
      const alertEl = document.getElementById('settings-alert');
      if (alertEl) alertEl.innerHTML = `<div class="alert alert-success">${ic('check','16')} <span>Programa de hospicio ${newVal === 'true' ? 'activado' : 'desactivado'}</span></div>`;
      setTimeout(() => { const a = document.getElementById('settings-alert'); if(a) a.innerHTML = ''; }, 3000);
    } catch(e) { alert(e.message); }
  }

  function exportCSV() {
    window.location.href = '/api/admin/export-csv';
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
      case 'status': root.innerHTML = renderStatus(); break;
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
    checkStatus, adminLogin, loadAdminDashboard, switchTab, generateMatches, saveMatches,
    sendEmails, deleteParticipant, showClearConfirm, clearAll, saveConfig, previewImage,
    uploadImage, deleteImage, adminExport, adminLogout, toggleHospice, exportCSV,
    loadSmtpStatus, testSmtp, previewEmail, previewFirstEmail, sendOneEmail, sendAllEmails,
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
