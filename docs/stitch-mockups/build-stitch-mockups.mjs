import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const outDir = fileURLToPath(new URL('.', import.meta.url));

const css = String.raw`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Orbitron:wght@600;700;800&display=swap');
*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:Inter,system-ui,sans-serif;color:#f7fbff;background:#070815;letter-spacing:0}a{text-decoration:none;color:inherit}button,input,select,textarea{font:inherit}button{cursor:pointer}
.screen{min-height:100vh;position:relative;overflow:hidden;background:radial-gradient(circle at 18% 12%,rgba(79,195,255,.28),transparent 30%),radial-gradient(circle at 82% 72%,rgba(214,93,177,.22),transparent 32%),linear-gradient(135deg,#070815 0%,#11102c 52%,#090816 100%)}.screen:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.9),rgba(0,0,0,.25));pointer-events:none}.content{position:relative;z-index:1}
.login{display:grid;grid-template-rows:auto 1fr auto;padding:26px clamp(18px,4vw,52px);gap:24px}.topbar,.admin-header,.hud{display:flex;align-items:center;justify-content:space-between;gap:16px}.brand,.teacher-brand{display:flex;align-items:center;gap:12px}.brand img,.teacher-brand img{width:46px;height:46px}.brand-title,.logo-title{font-family:Orbitron,sans-serif;font-weight:800}.brand-sub,.muted,small{color:#9fb0c8}.chip,.icon-btn{border:1px solid rgba(145,222,255,.3);background:rgba(10,18,42,.64);color:#dff7ff;border-radius:8px;padding:10px 13px;display:inline-flex;align-items:center;gap:8px}.hero{display:grid;grid-template-columns:minmax(0,1.05fr) 430px;align-items:center;gap:42px}.eyebrow{margin:0 0 8px;color:#6ee7ff;text-transform:uppercase;font:700 12px Orbitron,sans-serif;letter-spacing:.08em}.hero h1{margin:0;font:800 clamp(46px,8vw,96px)/.9 Orbitron,sans-serif}.accent{color:#ff67c8;text-shadow:0 0 28px rgba(255,103,200,.55)}.subtitle{font-size:18px;color:#c8d3e7}.dialogue,.panel,.card,.admin-card{border:1px solid rgba(145,222,255,.18);background:linear-gradient(180deg,rgba(14,23,52,.82),rgba(10,10,28,.72));box-shadow:0 22px 70px rgba(0,0,0,.36);border-radius:8px}.dialogue{max-width:560px;padding:18px;margin-top:26px}.portal,.panel,.admin-card{padding:22px}.portal{position:relative;border:1px solid rgba(255,103,200,.35);background:rgba(8,9,24,.82);box-shadow:0 0 44px rgba(255,103,200,.18);border-radius:8px}.portal h2,.page-title h2,.admin-page-title h2{margin:0;font:800 30px Orbitron,sans-serif}.field,label{display:grid;gap:8px;color:#dce9ff;font-weight:700}.field input,input,select,textarea{width:100%;border:1px solid rgba(145,222,255,.25);background:rgba(3,8,24,.74);color:#f7fbff;border-radius:8px;padding:12px 13px}textarea{min-height:92px;resize:vertical}.primary,.ghost,.danger{border-radius:8px;border:1px solid transparent;padding:12px 15px;font-weight:800}.primary{background:linear-gradient(135deg,#35d7ff,#ff67c8);color:#06101d}.ghost{background:rgba(10,18,42,.55);border-color:rgba(145,222,255,.25);color:#dff7ff}.danger{background:rgba(255,68,102,.1);border-color:rgba(255,68,102,.45);color:#ff6b8a}.demo{margin-top:16px;padding:12px;border:1px dashed rgba(145,222,255,.24);border-radius:8px;color:#b9c6da}.stats{display:flex;gap:12px;flex-wrap:wrap}.stat{min-width:160px;padding:14px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);border-radius:8px}.stat strong{display:block;font:800 24px Orbitron,sans-serif;color:#6ee7ff}
.app{position:relative;z-index:1;display:grid;grid-template-columns:280px 1fr;min-height:100vh}.sidebar{padding:24px;border-right:1px solid rgba(145,222,255,.16);background:rgba(5,8,22,.78);backdrop-filter:blur(16px);display:flex;flex-direction:column;gap:24px}.nav{display:grid;gap:8px}.nav a{display:flex;align-items:center;gap:10px;padding:12px;border-radius:8px;color:#aebdd2}.nav a.active,.nav a:hover{background:rgba(79,195,255,.12);color:#fff;border:1px solid rgba(79,195,255,.25)}.main{padding:24px clamp(18px,3vw,34px);overflow:auto}.hud{margin-bottom:22px;padding:16px 18px;border:1px solid rgba(145,222,255,.18);background:rgba(7,12,30,.68);border-radius:8px}.hud h1{margin:2px 0;font:800 24px Orbitron,sans-serif}.xp{width:190px;height:10px;background:#172039;border-radius:99px;overflow:hidden}.xp span,.progress span{display:block;height:100%;background:linear-gradient(90deg,#39ff96,#35d7ff,#ff67c8)}.page-title,.admin-page-title{margin-bottom:20px}.page-title p,.admin-page-title p{color:#aebdd2}.grid4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.metric{padding:18px}.metric span{color:#9fb0c8}.metric strong{display:block;margin-top:8px;font:800 34px Orbitron,sans-serif;color:#6ee7ff}.list{display:grid;gap:10px}.item{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:13px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.045);border-radius:8px}.badge{display:inline-flex;align-items:center;border:1px solid rgba(145,222,255,.25);border-radius:99px;padding:5px 9px;color:#dff7ff;font:700 11px Orbitron,sans-serif;text-transform:uppercase}.ok{color:#39ff96}.bad{color:#ff6b8a}.warn{color:#ffd166}.success{border-color:rgba(57,255,150,.38);color:#39ff96}.gold{border-color:rgba(255,209,102,.45);color:#ffd166}.form-grid{display:grid;gap:14px}.form-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.tabs{display:flex;gap:8px;margin-bottom:16px;padding:6px;border:1px solid rgba(145,222,255,.16);border-radius:8px;background:rgba(5,8,22,.45)}.tabs button{background:transparent;border:1px solid transparent;color:#9fb0c8;border-radius:8px;padding:10px 14px;font-weight:800}.tabs button.active{border-color:#ff67c8;color:#ff9bdc;background:rgba(255,103,200,.09)}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:13px;border-bottom:1px solid rgba(255,255,255,.08)}th{color:#6ee7ff;font:700 12px Orbitron,sans-serif;text-transform:uppercase}td{color:#dbe8fb}.table-wrap{overflow:auto}.checklist{display:grid;gap:9px;padding:14px;border:1px solid rgba(145,222,255,.16);border-radius:8px;background:rgba(5,8,22,.42)}.check{display:flex;gap:10px;align-items:flex-start}.student-home{padding:24px clamp(18px,5vw,60px)}.student-flow{margin:16px 0}.group-card{display:grid;gap:10px;text-align:left;min-height:160px}.guide{position:fixed;right:28px;bottom:28px;width:260px;padding:16px;border:1px solid rgba(255,103,200,.26);background:rgba(12,10,28,.82);border-radius:8px;box-shadow:0 22px 60px rgba(0,0,0,.42)}.guide img{height:138px;display:block;margin:auto}.onboarding{display:grid;place-items:center;min-height:100vh;padding:30px}.cinema{width:min(980px,100%)}.steps{display:flex;gap:8px;margin:18px 0}.step{padding:9px 13px;border:1px solid rgba(145,222,255,.2);border-radius:99px;color:#9fb0c8}.step.active{background:rgba(79,195,255,.15);color:#fff}.avatar-row{display:flex;align-items:center;gap:18px}.avatar{width:120px;height:120px;border-radius:8px;background:linear-gradient(135deg,#2b3bff,#ff67c8);display:grid;place-items:center;font:800 34px Orbitron}.game-root{min-height:100vh;position:relative;background:radial-gradient(circle at center,#17315c 0,#101632 42%,#070815 100%);overflow:hidden}.map{position:absolute;inset:0;background:linear-gradient(30deg,rgba(79,195,255,.08),transparent),repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 1px,transparent 1px 80px),repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 80px)}.zone{position:absolute;width:130px;height:130px;border-radius:999px;border:2px solid rgba(110,231,255,.58);display:grid;place-items:center;text-align:center;background:rgba(79,195,255,.11);box-shadow:0 0 36px rgba(79,195,255,.25)}.player{position:absolute;left:43%;top:60%;width:58px;height:80px;border-radius:28px 28px 14px 14px;background:linear-gradient(#ffd7b5,#7856ff 48%,#35d7ff);box-shadow:0 0 28px rgba(53,215,255,.45)}.game-hud{position:absolute;z-index:2;top:18px;left:18px;right:18px;display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid rgba(145,222,255,.2);background:rgba(5,8,22,.72);border-radius:8px}.overlay{position:absolute;z-index:3;inset:0;display:grid;place-items:center;background:rgba(2,4,12,.54)}.cutscene{width:min(620px,92vw);padding:26px}.wheel{position:absolute;z-index:3;left:50%;top:50%;transform:translate(-50%,-50%);width:520px;height:520px;border-radius:999px;border:1px solid rgba(145,222,255,.18);display:grid;place-items:center;background:rgba(5,8,22,.52)}.slot{position:absolute;width:220px;padding:14px;border-radius:8px;border:1px solid rgba(255,103,200,.35);background:rgba(12,10,28,.9);color:#fff}.slot:nth-child(1){top:20px}.slot:nth-child(2){right:0}.slot:nth-child(3){bottom:20px}.slot:nth-child(4){left:0}
.admin-app{background:#05070f}.admin-sidebar{background:#070a16}.admin-brand h1{margin:0;font:800 20px Orbitron;color:#f7fbff}.admin-brand p{margin:4px 0;color:#6ee7ff}.admin-search{display:flex;align-items:center;gap:10px;min-width:360px}.admin-search input{height:42px}.admin-profile{display:flex;align-items:center;gap:10px}.admin-avatar{width:38px;height:38px;border-radius:999px;background:linear-gradient(135deg,#6ee7ff,#ff67c8)}.node-row{display:grid;gap:8px;padding:13px;border-bottom:1px solid rgba(255,255,255,.08)}.progress{height:8px;background:#172039;border-radius:99px;overflow:hidden}.logs{font-family:ui-monospace,Consolas,monospace;color:#a8ffcf;background:#030712;max-height:300px;overflow:auto}.fab{position:fixed;right:28px;bottom:28px;width:54px;height:54px;border-radius:999px;background:linear-gradient(135deg,#35d7ff,#ff67c8);display:grid;place-items:center;color:#06101d;font:800 28px Orbitron}
@media(max-width:980px){.app{grid-template-columns:1fr}.sidebar{position:relative}.hero,.grid2,.grid3,.grid4{grid-template-columns:1fr}.guide{position:static;width:auto;margin:18px}.admin-search{min-width:0}.topbar,.admin-header,.hud{align-items:flex-start;flex-direction:column}.main{padding:18px}}
`;

const teacherNav = (active) => String.raw`
<aside class="sidebar">
  <div class="teacher-brand"><img src="../../public/psych-simulator-logo.svg" alt=""><div><p class="eyebrow">Neural Lab &middot; Profesor</p><div class="logo-title">MIND-SPHERE</div></div></div>
  <nav class="nav">
    ${nav('/teacher/resumen','dashboard','Resumen',active==='resumen')}
    ${nav('/teacher/casos','psychology','Casos psicologicos',active==='casos')}
    ${nav('/teacher/grupos','groups','Grupos',active==='grupos')}
    ${nav('/teacher/estudiantes','school','Estudiantes',active==='estudiantes')}
    ${nav('/teacher/tareas','assignment','Tareas',active==='tareas')}
    ${nav('/teacher/resultados','monitoring','Resultados',active==='resultados')}
  </nav>
  <button class="ghost">Cerrar sesion</button>
</aside>`;

const adminNav = (active) => String.raw`
<aside class="sidebar admin-sidebar">
  <div class="admin-brand"><h1>MIND-SPHERE</h1><p>Command Center v4.0</p></div>
  <nav class="nav">
    ${nav('/admin/resumen','hub','Neural Sync',active==='resumen')}
    ${nav('/admin/usuarios','group','Usuarios y permisos',active==='usuarios')}
    ${nav('/admin/licencias','verified','Licencias',active==='licencias')}
    ${nav('/admin/reportes','analytics','Reportes',active==='reportes')}
    ${nav('/admin/logs','terminal','System Logs',active==='logs')}
    ${nav('/admin/ayuda','help','Help Center',active==='ayuda')}
  </nav>
  <button class="danger">EMERGENCY LOCKOUT</button>
  <button class="ghost">Cerrar sesion</button>
</aside>`;

function nav(href, icon, label, active) {
  return `<a href="${href}" class="${active ? 'active' : ''}"><span class="material-symbols-outlined">${icon}</span>${label}</a>`;
}

function teacherPage(active, title, body) {
  return page(title, `<div class="screen"><div class="app content">${teacherNav(active)}<main class="main"><section class="hud"><div><p class="eyebrow">Profesor &middot; MIND-SPHERE</p><h1>Maestro Demo</h1><small>Disena casos, gestiona estudiantes y monitorea progreso</small></div><div><small>LVL 12</small><div class="xp"><span style="width:72%"></span></div></div><button class="ghost">Salir</button></section>${body}</main></div></div>`);
}

function adminPage(active, title, body) {
  return page(title, `<div class="screen admin-app"><div class="app content">${adminNav(active)}<main class="main"><header class="admin-header"><label class="admin-search"><span class="material-symbols-outlined">search</span><input type="search" placeholder="Search parameters..."></label><div class="admin-profile"><div class="admin-avatar"></div><div><strong>Superadmin Demo</strong><small>Chief Game Master</small></div><button class="ghost">Salir</button></div></header>${body}<footer class="muted" style="margin-top:24px">MIND-SPHERE SYSTEMS &middot; SIMULATION VER 4.0.2</footer></main></div></div>`);
}

function page(title, body) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
  <style>${css}</style>
</head>
<body>${body}</body>
</html>`;
}

const files = {
  '00-login.html': page('Login - MIND-SPHERE', String.raw`
<div class="screen login content">
  <header class="topbar">
    <a class="brand"><img src="../../public/psych-simulator-logo.svg" alt=""><div><span class="brand-title">MIND-SPHERE</span><br><span class="brand-sub">Neural Mind Engine</span></div></a>
    <div><button class="chip"><span class="material-symbols-outlined">volume_up</span>SFX</button> <button class="chip"><span class="material-symbols-outlined">language</span>ES</button></div>
  </header>
  <section class="hero">
    <div>
      <p class="eyebrow">Simulador psicologico academico</p>
      <h1>ENTRA A<br><span class="accent">MIND-SPHERE</span></h1>
      <p class="subtitle">Casos clinicos &middot; Retroalimentacion &middot; Progreso gamificado</p>
      <div class="dialogue"><span class="badge gold">GARY &middot; Guia neural</span><p>Bienvenido al laboratorio mental. Ingresa tus credenciales y preparare tu ruta segun tu rol.</p></div>
      <div class="stats" style="margin-top:22px"><div class="stat"><strong>1,284</strong><small>Jugadores activos</small></div><div class="stat"><strong>99.9%</strong><small>Uptime neural</small></div><div class="stat"><strong>v4.0.2</strong><small>Build estable</small></div></div>
    </div>
    <article class="portal">
      <span class="badge success">ONLINE</span><h2>Iniciar sesion</h2><p class="muted">Un solo acceso. El sistema detecta tu rol automaticamente.</p>
      <form class="form-grid"><label>Correo institucional<input placeholder="nombre@institucion.edu"></label><label>Contrasena<input type="password" placeholder="••••••••"></label><button class="primary" type="button"><span class="material-symbols-outlined">play_arrow</span> JUGAR AHORA</button></form>
      <div class="demo"><strong>Demo</strong><br>superadmin@demo.edu &middot; maestro@demo.edu &middot; estudiante@demo.edu<br>Contrasena: demo123</div>
    </article>
  </section>
  <footer class="topbar muted"><span>System Status: Optimal</span><span>2026 NEURAL LABS INC.</span></footer>
</div>`),

  '01-student-onboarding.html': page('Estudiante - Onboarding', String.raw`
<div class="screen onboarding content"><section class="cinema">
  <header class="page-title"><p class="eyebrow">Creacion de personaje</p><h2>Tu identidad en MIND-SPHERE</h2></header>
  <nav class="steps"><span class="step">Briefing</span><span class="step active">Heroe</span><span class="step">Nickname</span></nav>
  <article class="panel">
    <h2>Selecciona tu heroe</h2>
    <div class="avatar-row"><div class="avatar">N1</div><div><span class="muted">Clase neural</span><h3>Explorador Cognitivo</h3><small>Agilidad, lectura emocional y decisiones eticas</small></div></div>
    <div class="grid3" style="margin:18px 0"><button class="ghost">Neural-01</button><button class="ghost">Focus-02</button><button class="ghost">Empathy-03</button></div>
    <div class="form-grid"><label>Nickname<input placeholder="NeuralExplorer"></label><p class="badge success">Nickname disponible</p><div><button class="ghost">Atras</button> <button class="primary">Entrar a MIND-SPHERE</button></div></div>
  </article>
</section></div>`),

  '02-student-groups.html': page('Estudiante - Grupos', String.raw`
<div class="screen student-home content">
  <section class="hud"><div><p class="eyebrow">Estudiante &middot; Mis grupos</p><h1>Estudiante Demo</h1><small>Hola Estudiante Demo, selecciona tu grupo de entrenamiento.</small></div><div><small>LVL 7</small><div class="xp"><span style="width:45%"></span></div></div><button class="ghost">Salir</button></section>
  <nav class="student-flow"><button class="primary">Grupos</button></nav>
  <header class="page-title"><p class="eyebrow">Menu de grupos</p><h2>Grupos inscritos</h2><p>Selecciona un grupo para ver las tareas que tu profesor asigno.</p></header>
  <section class="grid3"><button class="panel group-card"><strong>Grupo PAP y rutas de atencion</strong><span class="muted">Modulo inicial para practicar decisiones de respuesta institucional.</span><small>1 tarea asignada &middot; 1 pendiente</small></button><button class="panel group-card"><strong>Intervencion en crisis</strong><span class="muted">Simulaciones de contencion, derivacion y escucha segura.</span><small>2 tareas asignadas</small></button><button class="panel group-card"><strong>Etica aplicada</strong><span class="muted">Dilemas profesionales en contextos clinicos y educativos.</span><small>0 pendientes</small></button></section>
  <aside class="guide"><img src="../../public/assets/guide/nexa-bust.webp" alt=""><strong>GARY</strong><p class="muted">Elige un grupo para abrir sus misiones.</p></aside>
</div>`),

  '03-student-tasks.html': page('Estudiante - Tareas', String.raw`
<div class="screen student-home content">
  <section class="hud"><div><p class="eyebrow">Estudiante &middot; Tareas del grupo</p><h1>Estudiante Demo</h1><small>Elige una mision pendiente para entrar al simulador.</small></div><div><small>LVL 7</small><div class="xp"><span style="width:45%"></span></div></div><button class="ghost">Salir</button></section>
  <header class="page-title"><p class="eyebrow">Grupo seleccionado</p><h2>Grupo PAP y rutas de atencion</h2><button class="ghost">Volver a grupos</button></header>
  <article class="panel"><h2>Misiones del grupo</h2><div class="list"><button class="item"><span><strong>Caso situacional: violencia domestica y tentativa de feminicidio</strong><small>2 zonas &middot; 2 decisiones</small></span><span><div class="xp"><span style="width:0%"></span></div><small>Pendiente 0%</small></span></button><button class="item"><span><strong>Ruta de apoyo psicosocial inicial</strong><small>3 zonas &middot; 5 decisiones</small></span><span><div class="xp"><span style="width:68%"></span></div><small>Pendiente 68%</small></span></button></div></article>
  <aside class="guide"><img src="../../public/assets/guide/nexa-bust.webp" alt=""><strong>GARY</strong><p class="muted">Entra a una mision y explora el mapa mental.</p></aside>
</div>`),

  '04-student-mission.html': page('Estudiante - Mision Clinica', String.raw`
<div class="game-root"><div class="map"></div><div class="zone" style="left:18%;top:30%">Atencion<br>Hospital</div><div class="zone" style="right:20%;top:34%">Comisaria<br>Familia</div><div class="player"></div>
  <header class="game-hud"><div><span class="badge">MIND-SPHERE</span><br><strong>Grupo PAP y rutas de atencion</strong></div><div><small>Energia mental</small><div class="xp"><span style="width:40%"></span></div></div><div><button class="ghost">Pista</button> <button class="danger">Abortar</button></div></header>
  <div class="overlay"><article class="panel cutscene"><span class="badge gold">Mision &middot; INTERMEDIATE</span><h2>Caso situacional: violencia domestica y tentativa de feminicidio</h2><p class="muted">Explora zonas mentales, analiza el contexto y toma decisiones sin revictimizar.</p><div class="item"><span class="material-symbols-outlined">flag</span> Reconocer acciones iniciales eticas, tecnicas y psicosociales.</div><br><button class="primary">Entrar al mundo mental</button></article></div>
</div>`),

  '05-teacher-overview.html': teacherPage('resumen','Profesor - Resumen', String.raw`
<header class="page-title"><p class="eyebrow">Centro de comando neural</p><h2>Dashboard del Profesor</h2><p>Gestiona casos clinicos, estudiantes y monitorea la actividad de MIND-SPHERE.</p></header>
<section class="grid4"><article class="panel metric"><span>Casos activos</span><strong>1</strong><small>0 borradores</small></article><article class="panel metric"><span>Estudiantes</span><strong>1</strong></article><article class="panel metric"><span>Grupos</span><strong>1</strong></article><article class="panel metric"><span>Tareas asignadas</span><strong>1</strong></article></section>
<section class="grid2" style="margin-top:16px"><article class="panel"><h3>Actividad reciente</h3><div class="list"><a class="item"><span><strong>Caso situacional: violencia domestica y tentativa de feminicidio</strong><small>Crisis &middot; INTERMEDIATE</small></span><span class="badge success">Activo</span></a></div></article><article class="panel"><h3>Accesos rapidos</h3><div class="grid2"><button class="ghost">Ver casos</button><button class="ghost">Estudiantes</button><button class="ghost">Asignar tareas</button><button class="ghost">Resultados</button></div></article></section>`),

  '06-teacher-cases.html': teacherPage('casos','Profesor - Casos', String.raw`
<header class="page-title"><p class="eyebrow">Laboratorio de casos</p><h2>Casos psicologicos</h2><p>Crea, edita y habilita simulaciones para tus estudiantes.</p><button class="primary">+ Crear caso</button></header>
<section class="grid3"><article class="panel"><div class="topbar"><span class="badge success">Habilitado</span><span class="eyebrow">Crisis</span></div><h3>Caso situacional: violencia domestica y tentativa de feminicidio</h3><p class="muted">Simulacion pedagogica para analizar decisiones de atencion, proteccion y acompanamiento.</p><p class="muted">2 escenarios &middot; 2 preguntas &middot; INTERMEDIATE</p><button class="ghost">Editar</button> <button class="ghost">Deshabilitar</button> <button class="danger">Eliminar</button></article><article class="panel"><div class="topbar"><span class="badge">Borrador</span><span class="eyebrow">Etica</span></div><h3>Consentimiento informado en contexto escolar</h3><p class="muted">Caso para practicar limites de confidencialidad y orientacion.</p><p class="muted">3 escenarios &middot; 5 preguntas &middot; BASIC</p><button class="ghost">Editar</button></article></section>`),

  '07-teacher-case-editor.html': teacherPage('casos','Profesor - Editor de Caso', String.raw`
<header class="page-title"><p class="eyebrow">Constructor de simulacion</p><h2>Nuevo caso psicologico</h2><button class="ghost">Volver a casos</button></header>
<nav class="tabs"><button class="active">1. Caso</button><button>2. Escenarios</button><button>3. Preguntas</button></nav>
<section class="grid2"><article class="panel"><h3>Informacion del caso</h3><form class="form-grid"><label>Titulo<input value="Caso de intervencion en crisis"></label><label>Descripcion<textarea>Simulacion pedagogica para analizar decisiones clinicas iniciales.</textarea></label><label>Contexto psicologico<textarea>Persona llega en estado de alta activacion emocional...</textarea></label><label>Objetivo de aprendizaje<textarea>Priorizar seguridad, contencion y rutas de atencion.</textarea></label><div class="form-row"><label>Categoria<select><option>Clinico</option></select></label><label>Dificultad<select><option>Intermedia</option></select></label></div><button class="primary">Guardar borrador</button></form></article><article class="panel"><h3>Vista del flujo</h3><div class="list"><div class="item"><strong>1. Caso</strong><span class="badge success">Listo</span></div><div class="item"><strong>2. Escenarios</strong><span class="badge">Pendiente</span></div><div class="item"><strong>3. Preguntas</strong><span class="badge">Pendiente</span></div></div></article></section>`),

  '08-teacher-groups.html': teacherPage('grupos','Profesor - Grupos', String.raw`
<header class="page-title"><p class="eyebrow">Celulas de aprendizaje</p><h2>Grupos</h2><p>Organiza estudiantes en grupos para asignar simulaciones.</p></header>
<section class="grid2"><article class="panel"><h3>Crear grupo</h3><form class="form-grid"><label>Nombre<input value="Grupo PAP y rutas de atencion"></label><label>Descripcion<textarea>Modulo inicial para practicar decisiones de respuesta institucional.</textarea></label><button class="primary">Crear grupo</button></form></article><article class="panel"><h3>Mis grupos</h3><div class="list"><div class="item"><span><strong>Grupo PAP y rutas de atencion</strong><small>Modulo inicial para practicar decisiones.</small></span><b>1</b><button class="ghost">Editar</button></div><div class="item"><span><strong>Intervencion en crisis</strong><small>Practicas avanzadas.</small></span><b>8</b><button class="ghost">Editar</button></div></div></article></section><article class="panel" style="margin-top:16px"><h3>Estudiantes en Grupo PAP y rutas de atencion</h3><div class="item"><span><strong>Estudiante Demo</strong><small>estudiante@demo.edu</small></span><button class="danger">Quitar</button></div></article>`),

  '09-teacher-students.html': teacherPage('estudiantes','Profesor - Estudiantes', String.raw`
<header class="page-title"><p class="eyebrow">Red neural de aprendices</p><h2>Estudiantes</h2><p>Crea credenciales, gestiona acceso y asigna estudiantes a grupos.</p></header>
<section class="grid2"><article class="panel"><h3>Crear estudiante</h3><form class="form-grid"><label>Nombre<input></label><label>Correo<input type="email"></label><label>Contrasena<input value="demo123"></label><label>Codigo<input></label><button class="primary">Crear estudiante</button></form></article><article class="panel"><h3>Asignar a grupo</h3><form class="form-grid"><label>Grupo<select><option>Grupo PAP y rutas de atencion</option></select></label><label>Estudiante<select><option>Estudiante Demo - estudiante@demo.edu</option></select></label><button class="primary">Asignar estudiante</button></form></article></section><article class="panel" style="margin-top:16px"><h3>Estudiantes registrados</h3><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Codigo</th><th>Estado</th><th>Progreso</th><th>Acciones</th></tr></thead><tbody><tr><td>Estudiante Demo</td><td>estudiante@demo.edu</td><td>EST-001</td><td><span class="badge success">Activo</span></td><td>0% promedio</td><td><button class="ghost">Editar</button> <button class="danger">Desactivar</button></td></tr></tbody></table></div></article>`),

  '10-teacher-tasks.html': teacherPage('tareas','Profesor - Tareas', String.raw`
<header class="page-title"><p class="eyebrow">Misiones de simulacion</p><h2>Asignar tareas</h2><p>Selecciona casos habilitados, escenarios y preguntas para cada grupo.</p></header>
<article class="panel"><h3>Constructor de tarea - checklist</h3><form class="form-grid"><label>Grupo destino<select><option>Grupo PAP y rutas de atencion</option></select></label><div class="checklist"><h4>1. Caso psicologico</h4><label class="check"><input type="radio" checked> <span><strong>Caso situacional: violencia domestica y tentativa de feminicidio</strong><small>INTERMEDIATE - Simulacion pedagogica.</small></span></label></div><div class="checklist"><h4>2. Escenarios</h4><label class="check"><input type="checkbox" checked> Atencion en Hospital</label><label class="check"><input type="checkbox" checked> Comisaria de Familia</label></div><div class="checklist"><h4>3. Preguntas</h4><label class="check"><input type="checkbox" checked> Prioridad inicial del equipo</label><label class="check"><input type="checkbox" checked> Accion que evita revictimizacion</label></div><button class="primary">Asignar tarea al grupo</button></form></article><article class="panel" style="margin-top:16px"><h3>Tareas del grupo seleccionado</h3><div class="item"><span><strong>Caso situacional: violencia domestica y tentativa de feminicidio</strong><small>2 escenarios &middot; 2 preguntas &middot; 01/06/2026</small></span></div></article>`),

  '11-teacher-results.html': teacherPage('resultados','Profesor - Resultados', String.raw`
<header class="page-title"><p class="eyebrow">Telemetria neural</p><h2>Resultados</h2><p>Monitorea avance, respuestas correctas y pendientes por estudiante.</p></header>
<section class="grid4"><article class="panel metric"><span>Estudiantes evaluados</span><strong>1</strong></article><article class="panel metric"><span>Avance promedio</span><strong>0%</strong></article><article class="panel metric"><span>Correctas</span><strong>0</strong></article><article class="panel metric"><span>Pendientes</span><strong>2</strong></article></section>
<article class="panel" style="margin-top:16px"><label>Grupo<select><option>Grupo PAP y rutas de atencion</option></select></label><div class="table-wrap"><table><thead><tr><th>Estudiante</th><th>Caso / Tarea</th><th>Avance</th><th>Correctas</th><th>Incorrectas</th><th>Pendientes</th></tr></thead><tbody><tr><td><strong>Estudiante Demo</strong><small>estudiante@demo.edu</small></td><td>Caso situacional: violencia domestica y tentativa de feminicidio</td><td><span class="badge">0%</span></td><td class="ok">0</td><td class="bad">0</td><td>2</td></tr></tbody></table></div></article>`),

  '12-admin-dashboard.html': adminPage('resumen','Admin - Dashboard', String.raw`
<header class="admin-page-title"><p class="eyebrow">Metricas de plataforma</p><h2>Panel administrativo</h2><p>Monitoreo de red neuronal y estado administrativo global.</p></header>
<section class="grid4"><article class="admin-card metric"><span>Nodos activos</span><strong>12</strong><span class="badge success">Estable</span></article><article class="admin-card metric"><span>Gestion de usuarios</span><strong>1,284</strong><span class="badge success">+18%</span></article><article class="admin-card metric"><span>Licencias activas</span><strong>42</strong></article><article class="admin-card metric"><span>Alertas de sincronia</span><strong>2</strong><span class="badge warn">Alerta</span></article></section>
<section class="grid2" style="margin-top:16px"><article class="admin-card"><h3>Estado de nodos del servidor</h3><div class="node-row"><div class="topbar"><strong>Bogota Neural Node</strong><span class="badge success">online</span></div><small>Bogota &middot; 24ms &middot; Carga 62%</small><div class="progress"><span style="width:62%"></span></div></div><div class="node-row"><div class="topbar"><strong>Andes Backup</strong><span class="badge warn">maintenance</span></div><small>Medellin &middot; 44ms &middot; Carga 37%</small><div class="progress"><span style="width:37%"></span></div></div></article><article class="admin-card"><h3>Control de licencias</h3><p class="badge warn">7 licencias vencen pronto</p><p class="muted">Total emitidas</p><p style="font:800 44px Orbitron">128</p><button class="ghost">Gestionar vales de acceso</button></article></section><section class="grid2" style="margin-top:16px"><article class="admin-card"><h3>Reportes de uso institucional</h3><table><tr><th>Institucion</th><th>Sesiones</th><th>Eficiencia</th><th>Estado</th></tr><tr><td>Universidad Demo</td><td>834</td><td>91%</td><td><span class="badge success">Full</span></td></tr></table></article><article class="admin-card logs"><h3>System Logs v4.0</h3><div>[08:10:03] Sync completed</div><div>[08:12:44] License warning emitted</div><div>[08:14:01] Teacher permissions updated</div></article></section><a class="fab">+</a>`),

  '13-admin-users.html': adminPage('usuarios','Admin - Usuarios', String.raw`
<header class="admin-page-title"><p class="eyebrow">REQ-01</p><h2>Gestion de usuarios y permisos</h2><p>Crea perfiles y asigna el flag de creador de casos a docentes autorizados.</p></header>
<section class="grid2"><article class="admin-card"><h3>Crear docente</h3><form class="form-grid"><label>Nombre<input></label><label>Correo<input type="email"></label><label>Contrasena<input type="password"></label><label>Institucion<input></label><label>Area<input></label><label class="check"><input type="checkbox"> Autorizado como creador de casos</label><button class="primary">Registrar docente</button></form></article><article class="admin-card"><h3>Crear estudiante</h3><form class="form-grid"><label>Nombre<input></label><label>Correo<input type="email"></label><label>Contrasena<input type="password"></label><label>Codigo academico<input></label><button class="primary">Registrar estudiante</button></form></article></section><article class="admin-card" style="margin-top:16px"><h3>Usuarios registrados</h3><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Creador de casos</th><th>Acciones</th></tr></thead><tbody><tr><td>Maestro Demo</td><td>maestro@demo.edu</td><td>Docente</td><td><span class="badge success">ACTIVE</span></td><td><button class="ghost">Revocar</button></td><td><button class="ghost">Desactivar</button></td></tr><tr><td>Estudiante Demo</td><td>estudiante@demo.edu</td><td>Estudiante</td><td><span class="badge success">ACTIVE</span></td><td>-</td><td><button class="ghost">Desactivar</button></td></tr></tbody></table></article>`),

  '14-admin-licenses.html': adminPage('licencias','Admin - Licencias', String.raw`
<header class="admin-page-title"><p class="eyebrow">Plataforma</p><h2>Control de licencias</h2></header><article class="admin-card"><p class="badge warn">7 licencias vencen en los proximos 15 dias</p><p class="muted" style="margin-top:18px">Total emitidas: <strong>128</strong></p><p class="muted">Integracion pendiente con backend de facturacion / vales de acceso.</p><section class="grid3" style="margin-top:18px"><div class="panel metric"><span>Activas</span><strong>42</strong></div><div class="panel metric"><span>Prueba</span><strong>16</strong></div><div class="panel metric"><span>Vencidas</span><strong>7</strong></div></section><button class="primary" style="margin-top:18px">Gestionar vales de acceso</button></article>`),

  '15-admin-reports.html': adminPage('reportes','Admin - Reportes', String.raw`
<header class="admin-page-title"><p class="eyebrow">Instituciones</p><h2>Reportes de uso institucional</h2></header><article class="admin-card"><table><thead><tr><th>Institucion</th><th>Sesiones</th><th>Eficiencia</th><th>Estado</th></tr></thead><tbody><tr><td>Universidad Demo</td><td>834</td><td>91%</td><td><span class="badge success">Full</span></td></tr><tr><td>Instituto Andino</td><td>412</td><td>76%</td><td><span class="badge warn">Trial</span></td></tr><tr><td>Clinica Norte</td><td>1,204</td><td>88%</td><td><span class="badge gold">Premium</span></td></tr></tbody></table></article>`),

  '16-admin-logs.html': adminPage('logs','Admin - Logs', String.raw`
<header class="admin-page-title"><p class="eyebrow">Auditoria</p><h2>System Logs v4.0</h2></header><article class="admin-card logs" style="min-height:420px"><div>[2026-06-01 08:10:03] INFO Neural sync completed</div><div>[2026-06-01 08:12:44] WARN License expiration threshold reached</div><div>[2026-06-01 08:14:01] INFO Teacher permission flag updated</div><div>[2026-06-01 08:16:22] INFO Store API persisted academy data</div><div>[2026-06-01 08:18:39] ERROR Remote node heartbeat delayed</div></article>`),

  '17-admin-help.html': adminPage('ayuda','Admin - Ayuda', String.raw`
<header class="admin-page-title"><p class="eyebrow">Soporte</p><h2>Help Center</h2></header><article class="admin-card"><h3>Documentacion del proyecto</h3><ul class="muted" style="line-height:1.9"><li><code>docs/admin/FASE-1-ESPECIFICACION.md</code> - requisitos y arquitectura admin</li><li><code>docs/notion/export/Requisitos Funcionales csv</code> - matriz REQ-01...15</li><li><code>docs/figma/admin-dashboard-neo.png</code> - referencia visual</li></ul><p class="muted">REQ-01: solo administradores gestionan roles; solo docentes con flag creador de casos pueden formular casos (REQ-02).</p></article>`)
};

mkdirSync(outDir, { recursive: true });
for (const [name, html] of Object.entries(files)) {
  writeFileSync(join(outDir, name), html, 'utf8');
}

writeFileSync(join(outDir, 'README.md'), `# Stitch mockups\n\nHTML estaticos generados desde las vistas Angular actuales.\n\n- 00-login.html\n- 01-student-onboarding.html\n- 02-student-groups.html\n- 03-student-tasks.html\n- 04-student-mission.html\n- 05-teacher-overview.html\n- 06-teacher-cases.html\n- 07-teacher-case-editor.html\n- 08-teacher-groups.html\n- 09-teacher-students.html\n- 10-teacher-tasks.html\n- 11-teacher-results.html\n- 12-admin-dashboard.html\n- 13-admin-users.html\n- 14-admin-licenses.html\n- 15-admin-reports.html\n- 16-admin-logs.html\n- 17-admin-help.html\n`, 'utf8');
