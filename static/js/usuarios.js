// =========================
// 👤 USUARIOS / VENDEDOR
// =========================

function abrirUsuarios() {

    const vendedorGuardado = localStorage.getItem("vendedor") || "Vendedor 1";

    const html = `
        <h2 class="text-xl font-bold mb-4">Usuarios</h2>

        <div class="flex flex-col gap-3">

            <button onclick="cambiarVendedor('Vendedor 1')" 
                class="p-3 rounded border ${
                    vendedorGuardado === "Vendedor 1" ? "bg-black text-white" : "bg-white"
                }">
                Vendedor 1
            </button>

            <button onclick="cambiarVendedor('Vendedor 2')" 
                class="p-3 rounded border ${
                    vendedorGuardado === "Vendedor 2" ? "bg-black text-white" : "bg-white"
                }">
                Vendedor 2
            </button>

        </div>

        <button onclick="cerrarModal()" 
            class="mt-4 bg-gray-300 p-2 rounded">
            Cerrar
        </button>
    `;

    abrirModal(html);
}


// =========================
// 🔄 CAMBIAR VENDEDOR
// =========================

function cambiarVendedor(nombre) {

    // 💾 guardar
    localStorage.setItem("vendedor", nombre);

    // 🔥 actualizar variable global en ventas.js
    if (window.setVendedorActual) {
        window.setVendedorActual(nombre);
    }

    // 🆕 actualizar navbar en tiempo real
    actualizarNavbarVendedor();

    // 🔁 refrescar modal
    abrirUsuarios();
}


// =========================
// 🆕 NAVBAR
// =========================

function actualizarNavbarVendedor() {
    const el = document.getElementById("vendedorActual");
    const vendedor = localStorage.getItem("vendedor") || "Vendedor 1";

    if (el) {
        el.innerText = vendedor;
    }
}


// =========================
// 🚀 INIT
// =========================

window.addEventListener("load", () => {
    actualizarNavbarVendedor();
});


// =========================
// 🌍 GLOBAL
// =========================

window.abrirUsuarios = abrirUsuarios;
window.cambiarVendedor = cambiarVendedor;