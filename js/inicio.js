document.addEventListener('DOMContentLoaded', () => {
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuMovil = document.getElementById('menuPrincipal');
  const botonMenu = document.getElementById('menuToggle');
  const botonCerrarMenu = menuMovil?.querySelector('[data-menu-close]');

  if (menuMovil && botonMenu) {
    const anchoMovil = window.matchMedia('(max-width: 991.98px)');
    let menuAbierto = false;
    const actualizarMenu = () => {
      const visible = !anchoMovil.matches || menuAbierto;
      menuMovil.classList.toggle('is-open', anchoMovil.matches && menuAbierto);
      menuMovil.setAttribute('aria-hidden', String(!visible));
      menuMovil.inert = !visible;
      botonMenu.setAttribute('aria-expanded', String(visible));
      botonMenu.setAttribute('aria-label', visible ? 'Cerrar menú' : 'Abrir menú');
    };
    const cerrarMenu = (devolverFoco = false) => {
      menuAbierto = false;
      actualizarMenu();
      if (devolverFoco && anchoMovil.matches) botonMenu.focus();
    };

    botonMenu.addEventListener('click', () => {
      if (!anchoMovil.matches) return;
      menuAbierto = !menuAbierto;
      actualizarMenu();
      if (menuAbierto) botonCerrarMenu?.focus();
    });
    botonCerrarMenu?.addEventListener('click', () => cerrarMenu(true));
    menuMovil.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (anchoMovil.matches) cerrarMenu();
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && anchoMovil.matches && menuAbierto) cerrarMenu(true);
    });
    anchoMovil.addEventListener('change', () => {
      menuAbierto = false;
      actualizarMenu();
    });
    actualizarMenu();
  }

  const mezclar = (lista) => {
    const resultado = [...lista];
    for (let i = resultado.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
  };

  // El HTML ya contiene todas las diapositivas; aquí solo se eligen las ocho que se muestran.
  const carrusel = document.getElementById('miCarrusel');
  if (carrusel) {
    const inner = carrusel.querySelector('.carousel-inner');
    const indicators = carrusel.querySelector('.carousel-indicators');
    const slidesById = new Map([...inner.querySelectorAll('.carousel-item')].map((slide) => [slide.dataset.productId, slide]));
    const indicatorsById = new Map([...indicators.querySelectorAll('button')].map((button) => [button.dataset.productId, button]));
    const elegidos = mezclar([...slidesById.keys()]).slice(0, 8);

    inner.replaceChildren(...elegidos.map((id, index) => {
      const slide = slidesById.get(id);
      slide.classList.toggle('active', index === 0);
      return slide;
    }));
    indicators.replaceChildren(...elegidos.map((id, index) => {
      const button = indicatorsById.get(id);
      button.dataset.bsSlideTo = String(index);
      button.classList.toggle('active', index === 0);
      if (index === 0) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
      return button;
    }));

    if (movimientoReducido) carrusel.removeAttribute('data-bs-ride');
    bootstrap.Carousel.getOrCreateInstance(carrusel, {
      interval: movimientoReducido ? false : 5000,
      ride: movimientoReducido ? false : 'carousel',
      pause: false,
      wrap: true
    });
    if (!movimientoReducido) bootstrap.Carousel.getInstance(carrusel).cycle();
  }

  // Los productos están escritos en index.html; el script solo alterna qué ocho aparecen.
  const destacados = document.getElementById('destacados');
  if (destacados) {
    const productos = [...destacados.children];
    const porVez = 8;
    const cadaMs = 10000;
    const fadeMs = 500;
    let cola = [];

    const siguientes = () => {
      const grupo = [];
      while (grupo.length < porVez && grupo.length < productos.length) {
        if (!cola.length) cola = mezclar(productos);
        const producto = cola.pop();
        if (!grupo.includes(producto)) grupo.push(producto);
      }
      return grupo;
    };
    const pintar = () => {
      const visibles = new Set(siguientes());
      productos.forEach((producto) => { producto.hidden = !visibles.has(producto); });
    };

    pintar();
    if (!movimientoReducido) {
      window.setInterval(() => {
        destacados.classList.add('fade-out');
        window.setTimeout(() => {
          pintar();
          destacados.classList.remove('fade-out');
        }, fadeMs);
      }, cadaMs);
    }
  }

  const obtenerCarrito = () => {
    try {
      const carrito = JSON.parse(localStorage.getItem('carrito'));
      return Array.isArray(carrito) ? carrito : [];
    } catch {
      return [];
    }
  };
  const actualizarContador = () => {
    const total = obtenerCarrito().reduce((suma, producto) => suma + (producto.cantidad || 0), 0);
    const badge = document.getElementById('contador-carrito');
    if (badge) badge.textContent = total;
  };
  const mostrarToast = (nombre) => {
    const mensaje = document.getElementById('toast-mensaje');
    const toast = document.getElementById('liveToast');
    if (!mensaje || !toast) return;
    mensaje.textContent = `¡${nombre} se agregó al carrito!`;
    bootstrap.Toast.getOrCreateInstance(toast, { delay: 3000 }).show();
  };

  actualizarContador();
  document.addEventListener('click', (event) => {
    const boton = event.target.closest('.btn-agregar-carrito');
    if (!boton) return;
    const carrito = obtenerCarrito();
    const id = boton.dataset.id;
    const item = carrito.find((producto) => String(producto.id) === id);
    if (item) item.cantidad += 1;
    else carrito.push({ id, nombre: boton.dataset.nombre, precio: Number(boton.dataset.precio), cantidad: 1 });
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContador();
    mostrarToast(boton.dataset.nombre);
  });
});
