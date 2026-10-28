document.addEventListener('DOMContentLoaded', () => {
  const claveCarrito = 'carrito';
  const tabla = document.getElementById('cart-items');
  const plantilla = document.getElementById('cart-row-template');
  const vistaVacia = document.getElementById('cart-empty');
  const vistaCarrito = document.getElementById('cart-content');
  const totalCarrito = document.getElementById('cart-total');
  const contador = document.getElementById('contador-carrito');

  const leerCarrito = () => {
    try {
      const productos = JSON.parse(localStorage.getItem(claveCarrito));
      return Array.isArray(productos) ? productos : [];
    } catch {
      return [];
    }
  };
  const guardarCarrito = (productos) => localStorage.setItem(claveCarrito, JSON.stringify(productos));
  const formatoPrecio = (precio) => `$${Number(precio || 0).toLocaleString('es-CL')}`;

  const renderizarCarrito = () => {
    const productos = leerCarrito();
    const cantidadTotal = productos.reduce((suma, producto) => suma + Number(producto.cantidad || 0), 0);
    const precioTotal = productos.reduce((suma, producto) => suma + Number(producto.precio || 0) * Number(producto.cantidad || 0), 0);

    contador.textContent = cantidadTotal;
    vistaVacia.hidden = productos.length > 0;
    vistaCarrito.hidden = productos.length === 0;
    totalCarrito.textContent = formatoPrecio(precioTotal);
    tabla.replaceChildren();

    productos.forEach((producto, indice) => {
      const fila = plantilla.content.firstElementChild.cloneNode(true);
      fila.querySelector('.cart-product-name').textContent = producto.nombre || 'Producto Anthe';
      fila.querySelector('.cart-unit-price').textContent = formatoPrecio(producto.precio);
      fila.querySelector('.quantity').textContent = producto.cantidad || 1;
      fila.querySelector('.cart-line-total').textContent = formatoPrecio(Number(producto.precio || 0) * Number(producto.cantidad || 1));
      fila.querySelectorAll('[data-cart-action]').forEach((boton) => { boton.dataset.indice = indice; });
      botonQuitarLabel(fila, producto.nombre);
      tabla.append(fila);
    });
  };

  const botonQuitarLabel = (fila, nombre) => {
    fila.querySelector('[data-cart-action="remove"]').setAttribute('aria-label', `Quitar ${nombre || 'producto'}`);
  };

  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-cart-action]');
    if (!boton) return;

    const accion = boton.dataset.cartAction;
    const productos = leerCarrito();
    if (accion === 'clear') {
      guardarCarrito([]);
      renderizarCarrito();
      return;
    }

    const indice = Number(boton.dataset.indice);
    if (!Number.isInteger(indice) || !productos[indice]) return;
    if (accion === 'increase') productos[indice].cantidad = Number(productos[indice].cantidad || 1) + 1;
    if (accion === 'decrease') {
      productos[indice].cantidad = Number(productos[indice].cantidad || 1) - 1;
      if (productos[indice].cantidad <= 0) productos.splice(indice, 1);
    }
    if (accion === 'remove') productos.splice(indice, 1);

    guardarCarrito(productos);
    renderizarCarrito();
  });

  window.addEventListener('storage', (evento) => {
    if (evento.key === claveCarrito) renderizarCarrito();
  });

  renderizarCarrito();
});
