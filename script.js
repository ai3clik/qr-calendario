(function () {
  var params = new URLSearchParams(window.location.search);
  var k = params.get('k') || '';

  function mostrar(id) {
    ['redirigiendo', 'mensaje', 'generador'].forEach(function (s) {
      document.getElementById(s).hidden = (s !== id);
    });
  }
  function mensaje(texto) {
    document.getElementById('mensajeTexto').textContent = texto;
    mostrar('mensaje');
  }
  function pedirDestino(clave) {
    return fetch(AS_URL_BASE + '?k=' + encodeURIComponent(clave))
      .then(function (r) { return r.text(); })
      .then(function (t) { return t.trim(); });
  }
  function esWeb(t) { return /^https?:\/\//i.test(t); }

  if (k) {
    // Modo lectura: alguien escaneo el QR
    mostrar('redirigiendo');
    pedirDestino(k)
      .then(function (destino) {
        if (esWeb(destino)) {
          window.location.replace(destino);
        } else {
          mensaje('Ahora mismo no hay ningun destino activo para este codigo QR.');
        }
      })
      .catch(function () {
        mensaje('No se pudo cargar el destino. Intentalo de nuevo en unos segundos.');
      });
    return;
  }

  // Modo generador
  mostrar('generador');
  document.getElementById('urlWS').textContent = AS_URL_BASE;
  var qr = null;
  var base = window.location.origin + window.location.pathname;
  var enlaceActual = '';

  function generar() {
    var calId = document.getElementById('calId').value.trim();
    if (!calId) { return; }
    enlaceActual = base + '?k=' + encodeURIComponent(calId);
    var caja = document.getElementById('qrcode');
    caja.innerHTML = '';
    qr = new QRCode(caja, { text: enlaceActual, width: 256, height: 256, correctLevel: QRCode.CorrectLevel.M });
    var a = document.getElementById('enlaceQR');
    a.textContent = enlaceActual;
    document.getElementById('btnDescargar').hidden = false;
    document.getElementById('btnProbar').hidden = false;
    document.getElementById('resultadoPrueba').textContent = '';
  }

  document.getElementById('btnGenerar').addEventListener('click', generar);
  document.getElementById('calId').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { generar(); }
  });

  document.getElementById('btnDescargar').addEventListener('click', function () {
    var canvas = document.querySelector('#qrcode canvas');
    var img = document.querySelector('#qrcode img');
    var src = canvas ? canvas.toDataURL('image/png') : (img ? img.src : '');
    if (!src) { return; }
    var a = document.createElement('a');
    a.href = src;
    a.download = 'qr-calendario.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  document.getElementById('btnProbar').addEventListener('click', function () {
    var calId = document.getElementById('calId').value.trim();
    var out = document.getElementById('resultadoPrueba');
    out.textContent = 'Consultando...';
    pedirDestino(calId)
      .then(function (d) {
        out.textContent = esWeb(d) ? ('Destino activo ahora: ' + d) : 'Ahora mismo no hay ningun evento activo con una direccion web en la descripcion.';
      })
      .catch(function () { out.textContent = 'No se pudo consultar el servicio. Revisa la URL de config.js.'; });
  });
})();
