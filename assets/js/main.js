/* Carlos Sanz Psicólogo · interacciones mínimas */
(function () {
  'use strict';

  // Cabecera: píldora con fondo solo cuando se hace scroll
  var cabecera = document.querySelector('.cabecera-fija');
  if (cabecera) {
    var alFondo = function () { cabecera.classList.toggle('con-fondo', window.scrollY > 24); };
    window.addEventListener('scroll', alFondo, { passive: true });
    alFondo();
  }

  // Ondas: sin movimiento si el sistema pide reducir animaciones
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.onda__anim').forEach(function (a) { a.remove(); });
  }

  // Menú móvil
  var toggle = document.querySelector('.menu__toggle');
  var menu = document.getElementById('menu-principal');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var abierto = menu.classList.toggle('abierto');
      toggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });

    // Cerrar al pulsar un enlace
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('abierto');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('abierto')) {
        menu.classList.remove('abierto');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Preguntas frecuentes: solo una abierta a la vez
  var preguntas = document.querySelectorAll('.faq details');
  preguntas.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      preguntas.forEach(function (otra) {
        if (otra !== d) otra.open = false;
      });
    });
  });

  // Cita que se revela palabra a palabra al hacer scroll
  var cita = document.querySelector('.cita-reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (cita && !reduce) {
    var texto = cita.textContent.trim();
    cita.setAttribute('aria-label', texto);
    cita.innerHTML = texto.split(/\s+/).map(function (w) {
      return '<span class="palabra" aria-hidden="true">' + w + '</span>';
    }).join(' ');
    var palabras = cita.querySelectorAll('.palabra');
    var pintar = function () {
      var r = cita.getBoundingClientRect();
      var alto = window.innerHeight;
      // 0 cuando la cita entra por abajo, 1 cuando su centro pasa el centro de la pantalla
      var progreso = (alto * 0.85 - r.top) / (alto * 0.85 - alto * 0.35 + r.height * 0.5);
      progreso = Math.max(0, Math.min(1, progreso));
      var n = Math.round(progreso * palabras.length);
      palabras.forEach(function (p, i) { p.classList.toggle('visible', i < n); });
    };
    window.addEventListener('scroll', pintar, { passive: true });
    window.addEventListener('resize', pintar);
    pintar();
  }

  // Hilo que une los tres pasos: se va trazando con el scroll
  var hiloPasos = document.querySelector('.pasos__hilo path');
  if (hiloPasos) {
    if (reduce) { hiloPasos.style.strokeDashoffset = 0; }
    else {
      var bloquePasos = hiloPasos.closest('.pasos');
      var listaPasos = bloquePasos.querySelectorAll('.paso');
      var mqPasos = window.matchMedia('(max-width: 760px)');
      var trazarPasos = function () {
        var r = bloquePasos.getBoundingClientRect();
        var alto = window.innerHeight;
        if (mqPasos.matches) {
          // Móvil: línea vertical que llega hasta el punto de la lista que está al 60 % de la pantalla
          var linea = alto * 0.6;
          var pv = (linea - r.top - 30) / (r.height - 60);
          pv = Math.max(0, Math.min(1, pv));
          bloquePasos.style.setProperty('--progreso', pv.toFixed(3));
          listaPasos.forEach(function (p) {
            var f = p.querySelector('.ficha').getBoundingClientRect();
            p.classList.toggle('alcanzado', f.top + f.height / 2 <= linea);
          });
          return;
        }
        // Empieza cuando el bloque asoma por abajo (95 % de la pantalla) y termina al llegar al 35 %
        var progreso = (alto * 0.95 - r.top) / (alto * 0.6);
        progreso = Math.max(0, Math.min(1, progreso));
        hiloPasos.style.strokeDashoffset = (1 - progreso).toFixed(3);
      };
      window.addEventListener('scroll', trazarPasos, { passive: true });
      window.addEventListener('resize', trazarPasos);
      trazarPasos();
    }
  }

  // Hilo vertical de los tipos de proceso (Terapia): se traza mientras recorres los tres bloques
  var hiloProcesos = document.querySelector('.procesos__hilo path');
  if (hiloProcesos) {
    if (reduce) { hiloProcesos.style.strokeDashoffset = 0; }
    else {
      var trazarProcesos = function () {
        var r = hiloProcesos.closest('.procesos').getBoundingClientRect();
        var alto = window.innerHeight;
        var progreso = (alto * 0.8 - r.top) / (r.height - alto * 0.25);
        progreso = Math.max(0, Math.min(1, progreso));
        hiloProcesos.style.strokeDashoffset = (1 - progreso).toFixed(3);
      };
      window.addEventListener('scroll', trazarProcesos, { passive: true });
      window.addEventListener('resize', trazarProcesos);
      trazarProcesos();
    }
  }

  // Nudo del cierre: se traza de izquierda a derecha con el scroll
  var nudo = document.querySelector('.nudo__trazo');
  if (nudo) {
    if (reduce) { nudo.style.strokeDashoffset = 0; }
    else {
      var trazarNudo = function () {
        var r = nudo.closest('.nudo').getBoundingClientRect();
        var alto = window.innerHeight;
        var progreso = (alto - r.top) / (alto * 0.42);
        progreso = Math.max(0, Math.min(1, progreso));
        nudo.style.strokeDashoffset = (1 - progreso).toFixed(3);
      };
      window.addEventListener('scroll', trazarNudo, { passive: true });
      window.addEventListener('resize', trazarNudo);
      trazarNudo();
    }
  }

  // Sobre mí: el hilo de la trayectoria se dibuja con el scroll y el hito que pasa por el centro se enciende
  var hitos = document.querySelectorAll('.hito');
  var hiloHitos = document.querySelector('.hitos__avance');
  var fotosHitos = document.querySelectorAll('.trayectoria__foto img');
  if (hitos.length) {
    if (reduce) {
      hitos.forEach(function (h) { h.classList.add('activo'); });
      if (hiloHitos) { hiloHitos.style.strokeDashoffset = 0; }
    } else {
      var puntoY = function (h, ref) {
        // Centro del punto de un hito, medido desde la parte superior de la lista
        var c = h.querySelector('.hito__cuerpo') || h;
        return c.getBoundingClientRect().top - ref.top + 20;
      };
      var ajustarHilo = function () {
        // Onda orgánica que va del primer punto al último pasando por cada uno. Cada tramo hace una S
        // con amplitud distinta y algo descentrada, para que no parezca una sinusoide perfecta.
        if (!hiloHitos) { return; }
        var svg = hiloHitos.parentNode, lista = svg.parentNode;
        var ref = lista.getBoundingClientRect();
        var ancho = 60, cx = 30;
        var amps = [20, 13, 24, 15, 18, 22];
        var ys = [];
        hitos.forEach(function (h) { ys.push(puntoY(h, ref)); });
        var y0 = ys[0];
        ys = ys.map(function (y) { return y - y0; });
        var altoTotal = Math.max(1, ys[ys.length - 1]);
        var d = 'M' + cx + ',0';
        for (var i = 1; i < ys.length; i++) {
          var a = ys[i - 1], b = ys[i], dist = b - a, A = amps[(i - 1) % amps.length];
          var mx = cx + A * 0.3, my = a + dist * 0.54;
          d += ' C' + (cx + A) + ',' + (a + dist * 0.2).toFixed(1) + ' ' + (cx + A * 0.85) + ',' + (a + dist * 0.42).toFixed(1) + ' ' + mx.toFixed(1) + ',' + my.toFixed(1);
          d += ' C' + (cx - A * 0.55) + ',' + (a + dist * 0.68).toFixed(1) + ' ' + (cx - A * 0.9) + ',' + (a + dist * 0.86).toFixed(1) + ' ' + cx + ',' + b.toFixed(1);
        }
        svg.setAttribute('viewBox', '0 0 ' + ancho + ' ' + altoTotal);
        svg.style.top = y0 + 'px';
        svg.style.height = altoTotal + 'px';
        svg.querySelectorAll('path').forEach(function (p) { p.setAttribute('d', d); });
      };
      var trazarHitos = function () {
        var alto = window.innerHeight;
        var linea = alto * 0.55;
        if (hiloHitos) {
          var r = hiloHitos.getBoundingClientRect();
          var progreso = (linea - r.top) / r.height;
          progreso = Math.max(0, Math.min(1, progreso));
          hiloHitos.style.strokeDashoffset = (1 - progreso).toFixed(3);
        }
        var activo = -1;
        hitos.forEach(function (h, i) { var c = h.querySelector('.hito__cuerpo') || h; if (c.getBoundingClientRect().top + 20 < linea) { activo = i; } });
        hitos.forEach(function (h, i) {
          h.classList.toggle('activo', i === activo);
          h.classList.toggle('pasado', i < activo);
        });
        // La foto de la izquierda cambia con el hito activo (antes del primero se muestra la primera)
        var fotoActiva = Math.max(0, activo);
        fotosHitos.forEach(function (f, i) { f.classList.toggle('activa', i === fotoActiva); });
      };
      window.addEventListener('scroll', trazarHitos, { passive: true });
      window.addEventListener('resize', function () { ajustarHilo(); trazarHitos(); });
      window.addEventListener('load', function () { ajustarHilo(); trazarHitos(); });
      ajustarHilo(); trazarHitos();
    }
  }

  // ===== Calendario de Cal.com (Contacto) =====
  // Pega aquí los enlaces de los dos eventos, con o sin el dominio (p. ej. "carlos-sanz/primera-sesion"
  // o "https://cal.com/carlos-sanz/primera-sesion"). Mientras estén vacíos se muestra el aviso.
  var CAL = {
    videollamada: 'https://cal.com/carlos-sanz-tdszlj/15min',
    sesion: 'https://cal.com/carlos-sanz-tdszlj/sesion-presencial'
  };
  var calendario = document.querySelector('.calendario');
  if (calendario) {
    var limpiar = function (v) { return (v || '').replace(/^https?:\/\/(app\.)?cal\.com\//, '').replace(/^\/+|\/+$/g, ''); };
    var enlaces = { videollamada: limpiar(CAL.videollamada), sesion: limpiar(CAL.sesion) };
    var hayEnlaces = enlaces.videollamada || enlaces.sesion;
    var pestanas = calendario.querySelector('.calendario__pestanas');
    var aviso = calendario.querySelector('.calendario__aviso');
    var iniciados = {};
    var cargarCal = function () {
      if (window.Cal) return;
      (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else { p(cal, ar); } return; } p(cal, ar); }; })(window, 'https://app.cal.com/embed/embed.js', 'init');
    };
    var mostrar = function (clave) {
      if (!enlaces[clave]) return;
      calendario.querySelectorAll('.calendario__pestana').forEach(function (b) {
        var activa = b.dataset.cal === clave;
        b.classList.toggle('activa', activa); b.setAttribute('aria-selected', activa ? 'true' : 'false');
      });
      calendario.querySelectorAll('.calendario__marco').forEach(function (mco) { mco.hidden = mco.dataset.calMarco !== clave; });
      if (!iniciados[clave]) {
        iniciados[clave] = true;
        cargarCal();
        window.Cal('init', clave, { origin: 'https://app.cal.com' });
        window.Cal.ns[clave]('inline', {
          elementOrSelector: '#cal-' + clave,
          calLink: enlaces[clave],
          config: { layout: 'month_view', theme: 'light' }
        });
        window.Cal.ns[clave]('ui', { theme: 'light', hideEventTypeDetails: false, layout: 'month_view', styles: { branding: { brandColor: '#AC5236' } }, cssVarsPerTheme: { light: { 'cal-brand': '#AC5236' } } });
      }
    };
    if (hayEnlaces) {
      aviso.hidden = true;
      pestanas.hidden = false;
      // Si solo hay un enlace, se oculta la pestaña del otro
      calendario.querySelectorAll('.calendario__pestana').forEach(function (b) {
        if (!enlaces[b.dataset.cal]) b.hidden = true;
        b.addEventListener('click', function () { mostrar(b.dataset.cal); });
      });
      var inicial = enlaces.videollamada ? 'videollamada' : 'sesion';
      // El calendario se carga cuando el bloque se acerca a la pantalla
      if ('IntersectionObserver' in window) {
        var obsCal = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { mostrar(inicial); obsCal.disconnect(); } });
        }, { rootMargin: '400px' });
        obsCal.observe(calendario);
      } else { mostrar(inicial); }
      // Los botones de las dos opciones preseleccionan su pestaña
      document.querySelectorAll('[data-cal-ir]').forEach(function (a) {
        a.addEventListener('click', function () { mostrar(a.dataset.calIr); });
      });
    }
  }

  // Tarjeta de formación: aparece al entrar en pantalla y tiene un parallax vertical suave
  var tarjeta = document.querySelector('.sobre__credenciales');
  if (tarjeta && !reduce && 'IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { tarjeta.classList.add('visible'); observador.disconnect(); }
      });
    }, { threshold: 0.35 });
    observador.observe(tarjeta);

    var parallax = function () {
      var r = tarjeta.parentElement.getBoundingClientRect();
      var centro = r.top + r.height / 2 - window.innerHeight / 2;
      // Se desplaza hasta 16px, más despacio que el resto del bloque
      var desplazamiento = Math.max(-16, Math.min(16, -centro * 0.06));
      tarjeta.style.setProperty('--parallax', desplazamiento.toFixed(1) + 'px');
    };
    window.addEventListener('scroll', parallax, { passive: true });
    window.addEventListener('resize', parallax);
    parallax();
  }

  // Enfoque: acordeón que se abre y cierra según el scroll, y el hilo que se dibuja a la vez
  var enfoque = document.querySelector('.enfoque-scroll');
  if (enfoque) {
    var items = enfoque.querySelectorAll('.enfoque__item');
    var hilo = enfoque.querySelector('.hilo__seg');
    var punta = enfoque.querySelector('.hilo__punta');
    var mq = window.matchMedia('(max-width: 1000px)');
    var actualPaso = -1, ultimaApertura = 0, centrosPaso = null;
    var L = hilo ? hilo.getTotalLength() : 0;
    if (hilo) { hilo.style.strokeDasharray = L + ' ' + L; hilo.style.strokeDashoffset = L; }
    // El trazado va de la flecha (inicio) al cerebro (final): se dibuja desde el final hacia atrás.
    // Límites medidos desde el arranque del trazo: fin del remolino (y>1420) y fin del ovillo (y>960).
    var limites = [L / 3, 2 * L / 3, L];
    if (hilo) {
      var l1 = 0, l2 = 0, minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (var l = 0; l <= L; l += 4) {
        var q = hilo.getPointAtLength(l);
        if (q.y > 1420) l1 = l;
        if (q.y > 960) l2 = l;
        if (q.x < minX) minX = q.x; if (q.x > maxX) maxX = q.x;
        if (q.y < minY) minY = q.y; if (q.y > maxY) maxY = q.y;
      }
      // En móvil el lienzo es una franja apaisada: se recorta el viewBox al trazo real para que quede centrado
      if (mq.matches && isFinite(minX)) {
        var aire = 30;
        hilo.ownerSVGElement.setAttribute('viewBox', (minX - aire) + ' ' + (minY - aire) + ' ' + (maxX - minX + aire * 2) + ' ' + (maxY - minY + aire * 2));
        // Centro (en el eje largo, que girado es el horizontal) del tramo dibujado en cada paso
        var centroTotal = (minY + maxY) / 2, altoVb = maxY - minY + aire * 2;
        centrosPaso = limites.map(function (lim) {
          var a = Infinity, b = -Infinity;
          for (var s = Math.max(0, L - lim); s <= L; s += 4) { var pt = hilo.getPointAtLength(s); if (pt.y < a) a = pt.y; if (pt.y > b) b = pt.y; }
          return { desvio: centroTotal - (a + b) / 2, altoVb: altoVb };
        });
      }
      // en unidades "dibujadas desde el final": cerebro, luego ovillo, luego remolino y flecha
      limites = [L - l2, L - l1, L];
    }
    var dibujar = function (progreso) {
      if (!hilo) return;
      var g = Math.min(2, Math.floor(progreso * 3));
      var pg = progreso * 3 - g;
      var ini = g === 0 ? 0 : limites[g - 1], fin = limites[g];
      var dibujado = ini + (fin - ini) * pg;
      hilo.style.strokeDashoffset = L + dibujado; // avanza desde el final del trazado
      if (punta) punta.classList.toggle('visible', progreso > 0.985);
    };
    var activar = function (i) {
      if (i === actualPaso) return;
      actualPaso = i;
      items.forEach(function (it, k) { it.classList.toggle('activa', k === i); });
      // En móvil el hilo se dibuja hasta el paso elegido (la transición CSS lo anima)
    };
    var pegajoso = enfoque.querySelector('.enfoque-sticky');
    var recorrido = function () { return enfoque.offsetHeight - (pegajoso ? pegajoso.offsetHeight : window.innerHeight); };
    var elegir = function () {
      if (reduce) { dibujar(1); return; }
      if (mq.matches) {
        // Móvil: cada paso se abre solo cuando su título sube por encima del 45 % de la pantalla y se queda
        // abierto (así el contenido que ya ha quedado arriba no cambia de alto y la página no salta).
        // El hilo se dibuja hasta el último paso abierto.
        // Solo se abre un paso nuevo por pasada y con 700 ms de margen: mientras uno se despliega, el
        // siguiente título aún no ha bajado y si no se abriría en cadena.
        var linea = window.innerHeight * 0.45, abiertos = 0, ahora = Date.now(), abrioUno = false;
        items.forEach(function (it, k) {
          var estaba = it.classList.contains('activa');
          var arriba = it.querySelector('.enfoque__titulo').getBoundingClientRect().top < linea;
          var abierto;
          if (k === 0) { abierto = true; }
          else if (estaba) { abierto = arriba; }
          else { abierto = arriba && items[k - 1].classList.contains('activa') && !abrioUno && (ahora - ultimaApertura > 700); }
          if (abierto && !estaba) { abrioUno = true; ultimaApertura = ahora; }
          it.classList.toggle('activa', abierto);
          if (abierto) abiertos = k + 1;
        });
        actualPaso = abiertos - 1;
        dibujar(abiertos / items.length);
        // Desplaza la franja para que el tramo dibujado quede centrado (girado, el eje largo es el horizontal)
        if (centrosPaso && hilo) {
          var svgEl = hilo.ownerSVGElement, c = centrosPaso[abiertos - 1];
          var escala = svgEl.getBoundingClientRect().width / c.altoVb;
          svgEl.style.setProperty('--dx', (c.desvio * escala).toFixed(1) + 'px');
        }
        return;
      }
      var r = enfoque.getBoundingClientRect();
      var rec = recorrido();
      var progreso = rec > 0 ? Math.max(0, Math.min(1, -r.top / rec)) : 0;
      // el trazo termina un poco antes del final para que se vea completo un rato
      dibujar(Math.min(1, progreso / 0.97));
      activar(Math.min(items.length - 1, Math.floor(progreso * items.length)));
    };
    window.addEventListener('scroll', elegir, { passive: true });
    window.addEventListener('resize', elegir);
    elegir();

    // Clic en un título: en escritorio lleva al punto del scroll; en móvil abre ese paso
    items.forEach(function (it, k) {
      it.querySelector('.enfoque__titulo button').addEventListener('click', function () {
        if (mq.matches) {
          // Móvil: lleva el título justo por encima de la línea de apertura
          var t = it.querySelector('.enfoque__titulo').getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.45 + 12;
          window.scrollTo({ top: t, behavior: 'smooth' });
          return;
        }
        var destino = enfoque.getBoundingClientRect().top + window.scrollY + (k / items.length + 0.04) * recorrido();
        window.scrollTo({ top: destino, behavior: 'smooth' });
      });
    });
  }

  // Texto en bucle sobre la onda: desplaza el texto a lo largo del trazado de forma continua
  var marquee = document.querySelector('.cinta textPath');
  if (marquee && !reduce) {
    var textoOnda = marquee.textContent;
    var unidades = 14;
    var largoUnidad = marquee.getComputedTextLength() / unidades;
    var desplazamiento = 0, ultimo = null, velocidad = 34; // unidades del viewBox por segundo
    var mover = function (t) {
      if (ultimo !== null) {
        desplazamiento -= (t - ultimo) / 1000 * velocidad;
        if (desplazamiento <= -largoUnidad) desplazamiento += largoUnidad;
        marquee.setAttribute('startOffset', desplazamiento.toFixed(2));
      }
      ultimo = t; requestAnimationFrame(mover);
    };
    requestAnimationFrame(mover);
  }

  // Marcar la página actual en el menú
  var actual = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#menu-principal a[href]').forEach(function (a) {
    if (a.getAttribute('href') === actual) a.setAttribute('aria-current', 'page');
  });
})();
