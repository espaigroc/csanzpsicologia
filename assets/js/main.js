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

  // Preguntas frecuentes: solo una abierta a la vez, y el contenido se despliega con animación
  var preguntas = document.querySelectorAll('.faq details');
  var reduceMov = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  preguntas.forEach(function (d) {
    var resumen = d.querySelector('summary');
    var cuerpo = document.createElement('div');
    cuerpo.className = 'faq__cuerpo';
    Array.prototype.slice.call(d.children).forEach(function (h) { if (h !== resumen) cuerpo.appendChild(h); });
    d.appendChild(cuerpo);
    var animando = false;
    var abrir = function () {
      preguntas.forEach(function (otra) { if (otra !== d && otra.open) cerrar(otra); });
      d.open = true;
      if (reduceMov) return;
      var alto = cuerpo.scrollHeight;
      animando = true;
      cuerpo.animate([{ height: '0px', opacity: 0 }, { height: alto + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.22,.61,.36,1)' })
        .onfinish = function () { animando = false; };
    };
    var cerrar = function (det) {
      var cu = det.querySelector('.faq__cuerpo');
      if (reduceMov || !cu) { det.open = false; return; }
      var alto = cu.scrollHeight;
      cu.animate([{ height: alto + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'ease' })
        .onfinish = function () { det.open = false; };
    };
    resumen.addEventListener('click', function (e) {
      e.preventDefault();
      if (animando) return;
      if (d.open) cerrar(d); else abrir();
    });
  });

  // Aparición suave de títulos y tarjetas al entrar en pantalla
  var revelables = document.querySelectorAll(
    'main .centrado, main .area, main .tarjeta, main .tarifa, main .datos-tarjetas li, main .paso, main .reserva__opcion, ' +
    'main .faq details, main .proceso, main .espacio, main .sobre-intro > *, main .trayectoria__lado, main .legal'
  );
  if (revelables.length && !reduceMov && 'IntersectionObserver' in window) {
    var obsRevela = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); obsRevela.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revelables.forEach(function (el) {
      // Escalonado entre hermanos del mismo bloque, hasta 4
      var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.classList.add('revela');
      el.setAttribute('data-retardo', String(Math.min(3, idx)));
      obsRevela.observe(el);
    });
  }

  // Botón flotante de reserva (móvil): visible tras el hero, oculto en el cierre y en bloques con elemento fijo propio
  var ctaFlotante = document.querySelector('.cta-flotante');
  if (ctaFlotante) {
    var hero = document.querySelector('main > section');
    var bloqueaCta = document.querySelectorAll('.cierre, .enfoque-scroll, .apilado, footer');
    var ocultoPor = 0;
    var pintarCta = function () {
      var pasadoHero = hero ? hero.getBoundingClientRect().bottom < 80 : window.scrollY > 500;
      ctaFlotante.classList.toggle('visible', pasadoHero && ocultoPor === 0);
    };
    if ('IntersectionObserver' in window && bloqueaCta.length) {
      var obsCta = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) { ocultoPor += e.isIntersecting ? 1 : -1; });
        ocultoPor = Math.max(0, ocultoPor); pintarCta();
      }, { threshold: 0.05 });
      bloqueaCta.forEach(function (b) { obsCta.observe(b); });
    }
    window.addEventListener('scroll', pintarCta, { passive: true });
    pintarCta();
  }

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
          // La línea va del centro de la primera ficha al centro de la última
          var f0 = listaPasos[0].querySelector('.ficha').getBoundingClientRect();
          var fN = listaPasos[listaPasos.length - 1].querySelector('.ficha').getBoundingClientRect();
          var inicio = f0.top + f0.height / 2 - r.top, fin = fN.top + fN.height / 2 - r.top;
          bloquePasos.style.setProperty('--linea-inicio', Math.round(inicio) + 'px');
          bloquePasos.style.setProperty('--linea-alto', Math.round(fin - inicio) + 'px');
          var pv = (linea - r.top - inicio) / (fin - inicio);
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
        // Al completarse se quita el dasharray: con el trazo escalado, el guion de longitud 1 se quedaba corto
        // y la línea no llegaba al borde derecho
        if (progreso >= 1) { nudo.style.strokeDasharray = 'none'; nudo.style.strokeDashoffset = 0; }
        else { nudo.style.strokeDasharray = ''; nudo.style.strokeDashoffset = (1 - progreso).toFixed(3); }
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

  // Tarjetas apiladas (Terapia): en móvil cada tarjeta se fija a una altura que permita verla entera
  var cartas = document.querySelectorAll('.apilado .carta');
  if (cartas.length) {
    var mqCartas = window.matchMedia('(max-width: 1000px)');
    var ajustarCartas = function () {
      if (!mqCartas.matches) { cartas.forEach(function (c) { c.style.removeProperty('--top-movil'); }); return; }
      cartas.forEach(function (c, i) {
        var top = Math.min(84 + i * 14, window.innerHeight - c.offsetHeight - 28);
        c.style.setProperty('--top-movil', Math.round(top) + 'px');
      });
    };
    window.addEventListener('resize', ajustarCartas);
    window.addEventListener('load', ajustarCartas);
    ajustarCartas();
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
    // Límites de cada tramo en unidades "dibujadas desde el final" (cerebro, ovillo, remolino+flecha).
    // Son fracciones fijas del trazado, medidas una vez: recorrer el path con getPointAtLength en cada carga
    // costaba varios segundos de CPU en móvil y retrasaba el primer pintado.
    var limites = [L * 0.5501, L * 0.8283, L];
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
