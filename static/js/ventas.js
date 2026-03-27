// =========================
// 🛒 VARIABLES
// =========================

let productos = [];
let carrito = [];
let numeroTicket = 1;

// 🔥 CARGAR VENDEDOR DESDE STORAGE (clave del fix)
let vendedorActual = localStorage.getItem("vendedor") || "Vendedor 1";


// =========================
// 📦 CARGAR PRODUCTOS
// =========================

function cargarProductos() {
    fetch("/api/stock")
        .then(res => res.json())
        .then(data => {
            productos = data;
            renderProductos(productos);
        })
        .catch(err => console.error("Error cargando productos:", err));
}


// =========================
// 🔍 BUSCADOR (CON ENTER)
// =========================

function inicializarBuscador() {
    const buscador = document.getElementById("buscador");

    if (!buscador) {
        setTimeout(inicializarBuscador, 200);
        return;
    }

    buscador.focus(); // 🎯 listo para vender

    let resultadosFiltrados = [];

    buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase();

        resultadosFiltrados = productos.filter(p =>
            p.nombre.toLowerCase().includes(texto)
        );

        renderProductos(resultadosFiltrados);
    });

    buscador.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && resultadosFiltrados.length > 0) {
            agregarAlCarrito(resultadosFiltrados[0].id);
            buscador.value = "";
            renderProductos(productos);
        }
    });
}


// =========================
// 📡 ESCÁNER CÓDIGO BARRAS
// =========================

function inicializarScanner() {
    let buffer = "";
    let timeout = null;

    document.addEventListener("keydown", (e) => {

        if (e.key.length > 1 && e.key !== "Enter") return;

        if (timeout) clearTimeout(timeout);

        if (e.key === "Enter") {
            if (buffer.length > 3) {
                buscarPorCodigo(buffer);
            }
            buffer = "";
            return;
        }

        buffer += e.key;

        timeout = setTimeout(() => {
            buffer = "";
        }, 100);
    });
}


// =========================
// 🔍 BUSCAR POR CÓDIGO
// =========================

function buscarPorCodigo(codigo) {
    fetch(`/api/stock/codigo/${codigo}`)
        .then(res => {
            if (!res.ok) throw new Error("No encontrado");
            return res.json();
        })
        .then(producto => {
            agregarAlCarrito(producto.id);
        })
        .catch(() => {
            console.warn("Código no encontrado:", codigo);
        });
}


// =========================
// ⌨️ ATAJOS DE TECLADO
// =========================

function inicializarAtajosTeclado() {
    document.addEventListener("keydown", (e) => {

        // ➕ Siempre completa venta (incluso escribiendo)
        if (e.code === "NumpadAdd" || e.key === "+") {
            e.preventDefault();
            guardarVenta();
        }
    });
}


// =========================
// 🚀 INIT
// =========================

window.addEventListener("load", () => {

    // 🔥 asegurar vendedor actualizado siempre
    vendedorActual = localStorage.getItem("vendedor") || "Vendedor 1";

    cargarProductos();
    inicializarBuscador();
    inicializarAtajosTeclado();
    inicializarScanner();
});


// =========================
// 🧾 RENDER PRODUCTOS
// =========================

function renderProductos(lista) {
    const contenedor = document.getElementById("listaProductos");
    if (!contenedor) return;

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = "<p>No hay productos</p>";
        return;
    }

    let html = "";

    lista.forEach(p => {
        html += `
            <div class="flex justify-between items-center border p-2 rounded">
                <div>
                    <div class="font-semibold">${p.nombre}</div>
                    <div class="text-xs text-gray-500">
                        $${p.precio} | Stock: ${p.cantidad}
                    </div>
                </div>

                <button onclick="agregarAlCarrito(${p.id})"
                    class="bg-green-500 text-white px-3 py-1 rounded">
                    +
                </button>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}


// =========================
// ➕ AGREGAR AL CARRITO
// =========================

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);

    if (!producto || producto.cantidad <= 0) {
        alert("Sin stock");
        return;
    }

    let cantidad = prompt("Cantidad:", "1");
    if (cantidad === null) return;

    cantidad = parseInt(cantidad);

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Cantidad inválida");
        return;
    }

    if (cantidad > producto.cantidad) {
        alert("Stock insuficiente");
        return;
    }

    producto.cantidad -= cantidad;

    const existente = carrito.find(p => p.id === id);

    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidad
        });
    }

    actualizarUI();
}


// =========================
// ➖ RESTAR
// =========================

function quitarDelCarrito(id) {
    const item = carrito.find(p => p.id === id);
    const producto = productos.find(p => p.id === id);

    if (!item) return;

    item.cantidad--;
    producto.cantidad++;

    if (item.cantidad <= 0) {
        carrito = carrito.filter(p => p.id !== id);
    }

    actualizarUI();
}


// =========================
// 🔄 UI
// =========================

function actualizarUI() {
    renderProductos(productos);
    renderCarrito();
    actualizarTotal();
}


// =========================
// 🛒 CARRITO
// =========================

function renderCarrito() {
    const contenedor = document.getElementById("carritoLista");
    if (!contenedor) return;

    if (!carrito.length) {
        contenedor.innerHTML = "<p>Vacío</p>";
        return;
    }

    let html = "";

    carrito.forEach(p => {
        html += `
            <div class="flex justify-between items-center border p-2 rounded">
                <div>
                    ${p.nombre}
                    <div class="text-xs">
                        $${p.precio} x ${p.cantidad}
                    </div>
                </div>

                <div class="flex gap-2">
                    <button onclick="quitarDelCarrito(${p.id})">-</button>
                    <button onclick="agregarAlCarrito(${p.id})">+</button>
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}


// =========================
// 💰 TOTAL
// =========================

function actualizarTotal() {
    const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    const el = document.getElementById("total");
    if (el) el.innerText = `$${total}`;
}


// =========================
// 🧾 FORMATO
// =========================

function formatearLinea(nombre, cantidad, precio) {
    const total = cantidad * precio;

    let nombreCorto = nombre.substring(0, 14);
    let col1 = nombreCorto.padEnd(14, " ");
    let col2 = `${cantidad}x${precio}`.padStart(8, " ");
    let col3 = `${total}`.padStart(8, " ");

    return `${col1}${col2}${col3}`;
}


// =========================
// 🖨️ IMPRIMIR
// =========================

function imprimirTicket(venta) {

    numeroTicket++;

    const ancho = 26;

    // 🔥 SIEMPRE LEER VENDEDOR ACTUAL
    vendedorActual = localStorage.getItem("vendedor") || "Vendedor 1";

    let texto = "";

    texto += "      MarketOS\n";
    texto += "--------------------------\n";

    texto += `Ticket: ${numeroTicket}\n`;
    texto += `Vendedor: ${venta.vendedor || vendedorActual}\n`;

    const fecha = new Date().toLocaleString();
    const espacios = Math.floor((ancho - fecha.length) / 2);
    texto += " ".repeat(Math.max(0, espacios)) + fecha + "\n";

    texto += "--------------------------\n";

    venta.productos.forEach(p => {
        texto += formatearLinea(p.nombre, p.cantidad, p.precio) + "\n";
    });

    texto += "--------------------------\n";
    texto += `TOTAL: $${venta.total}\n`;
    texto += "--------------------------\n";
    texto += "   Gracias por su compra\n\n\n";

    const ventana = window.open("", "_blank");

    ventana.document.write(`
        <html>
        <head>
            <title></title>
            <style>
                @page { margin: 0; }
                body {
                    margin: 0;
                    font-family: monospace;
                    font-size: 12px;
                }
                pre {
                    margin: 0;
                    padding: 10px;
                }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            <pre>${texto}</pre>
        </body>
        </html>
    `);

    ventana.document.close();
}


// =========================
// 💾 GUARDAR VENTA
// =========================

function guardarVenta() {
    if (!carrito.length) {
        alert("Carrito vacío");
        return;
    }

    // 🔥 SIEMPRE TOMAR VENDEDOR ACTUAL
    vendedorActual = localStorage.getItem("vendedor") || "Vendedor 1";

    const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

    fetch("/api/ventas", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            productos: carrito,
            total,
            vendedor: vendedorActual
        })
    })
    .then(res => res.json())
    .then((data) => {
        imprimirTicket(data);
        carrito = [];
        cargarProductos();
        actualizarUI();
    });
}


// =========================
// 🌍 GLOBAL
// =========================

window.agregarAlCarrito = agregarAlCarrito;
window.quitarDelCarrito = quitarDelCarrito;
window.guardarVenta = guardarVenta;