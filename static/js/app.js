// =========================
// 🪟 MODAL
// =========================

// Abrir modal
function abrirModal(html) {
    const overlay = document.getElementById("modalOverlay");
    const content = document.getElementById("modalContent");

    if (!overlay || !content) {
        console.error("Modal no encontrado en el HTML");
        return;
    }

    content.innerHTML = html;
    overlay.classList.remove("hidden");
}

// Cerrar modal
function cerrarModal() {
    const overlay = document.getElementById("modalOverlay");

    if (!overlay) {
        console.error("Modal no encontrado");
        return;
    }

    overlay.classList.add("hidden");
}


// =========================
// 🌍 EXPONER FUNCIONES GLOBALMENTE
// (para que funcionen los onclick del HTML)
// =========================

window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;

// Funciones de otros módulos
window.abrirStock = () => {
    if (typeof abrirStock === "function") abrirStock();
    else console.error("abrirStock no cargado");
};

window.abrirHistorial = () => {
    if (typeof abrirHistorial === "function") abrirHistorial();
    else console.error("abrirHistorial no cargado");
};

window.abrirUsuarios = () => {
    if (typeof abrirUsuarios === "function") abrirUsuarios();
    else console.error("abrirUsuarios no cargado");
};

window.abrirVentas = () => {
    if (typeof abrirVentas === "function") abrirVentas();
    else console.error("abrirVentas no cargado");
};

window.guardarVenta = () => {
    if (typeof guardarVenta === "function") guardarVenta();
    else console.error("guardarVenta no cargado");
};