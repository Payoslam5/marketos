// =========================
// 📦 STOCK
// =========================

function abrirStock() {

    const html = `
        <h2 class="text-xl font-bold mb-4">Stock</h2>

        <div class="flex flex-col gap-2">
            <input id="nombre" placeholder="Nombre producto" class="border p-2 rounded">
            <input id="codigo" placeholder="Código de barras" class="border p-2 rounded">
            <input id="precio" type="number" placeholder="Precio" class="border p-2 rounded">
            <input id="cantidad" type="number" placeholder="Cantidad" class="border p-2 rounded">

            <button onclick="agregarProducto()" class="bg-black text-white p-2 rounded">
                Agregar
            </button>
        </div>

        <hr class="my-4">

        <div id="listaStock" class="flex flex-col gap-2 text-sm">
            Cargando...
        </div>

        <button onclick="cerrarModal()" class="mt-4 bg-gray-300 p-2 rounded">
            Cerrar
        </button>
    `;

    abrirModal(html);

    setTimeout(() => {
        cargarStock();
        document.getElementById("nombre")?.focus();
    }, 50);
}


// =========================
// 📥 CARGAR STOCK
// =========================

function cargarStock() {
    fetch("/api/stock")
        .then(res => res.json())
        .then(data => {

            const contenedor = document.getElementById("listaStock");
            if (!contenedor) return;

            let html = "";

            data.forEach(p => {
                html += `
                    <div class="flex justify-between items-center border p-2 rounded">
                        <div>
                            <div class="font-semibold">${p.nombre}</div>
                            <div class="text-xs text-gray-500">
                                Cod: ${p.codigo || "-"} | $${p.precio} | Cant: ${p.cantidad}
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <button onclick="sumarStock(${p.id})" class="bg-green-600 text-white px-2 rounded">
                                +Stock
                            </button>

                            <button onclick="editarProducto(${p.id})" class="bg-blue-500 text-white px-2 rounded">
                                Editar
                            </button>

                            <button onclick="eliminarProducto(${p.id})" class="bg-red-500 text-white px-2 rounded">
                                X
                            </button>
                        </div>
                    </div>
                `;
            });

            contenedor.innerHTML = html;
        });
}


// =========================
// ➕ AGREGAR PRODUCTO
// =========================

function agregarProducto() {
    const nombre = document.getElementById("nombre").value.trim();
    const codigo = document.getElementById("codigo").value.trim();
    const precio = document.getElementById("precio").value;
    const cantidad = document.getElementById("cantidad").value;

    if (!nombre || !precio || !cantidad) {
        alert("Completá los campos");
        return;
    }

    fetch("/api/stock", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            nombre,
            codigo,
            precio: parseFloat(precio),
            cantidad: parseInt(cantidad)
        })
    })
    .then(() => {
        document.getElementById("nombre").value = "";
        document.getElementById("codigo").value = "";
        document.getElementById("precio").value = "";
        document.getElementById("cantidad").value = "";

        cargarStock();
    });
}


// =========================
// ➕ SUMAR STOCK
// =========================

function sumarStock(id) {
    const cantidad = prompt("Cantidad a agregar:");

    if (!cantidad) return;

    fetch(`/api/stock/${id}`)
        .then(res => res.json())
        .then(producto => {

            fetch(`/api/stock/${id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    ...producto,
                    cantidad: producto.cantidad + parseInt(cantidad)
                })
            })
            .then(() => cargarStock());
        });
}


// =========================
// ✏️ EDITAR
// =========================

function editarProducto(id) {
    const nombre = prompt("Nombre:");
    const codigo = prompt("Código:");
    const precio = prompt("Precio:");
    const cantidad = prompt("Cantidad:");

    if (!nombre || !precio || !cantidad) return;

    fetch(`/api/stock/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            nombre,
            codigo,
            precio: parseFloat(precio),
            cantidad: parseInt(cantidad)
        })
    })
    .then(() => cargarStock());
}


// =========================
// ❌ ELIMINAR
// =========================

function eliminarProducto(id) {
    if (!confirm("¿Eliminar producto?")) return;

    fetch(`/api/stock/${id}`, {
        method: "DELETE"
    })
    .then(() => cargarStock());
}