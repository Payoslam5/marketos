// =========================
// 📜 ABRIR HISTORIAL
// =========================

function abrirHistorial() {
    const html = `
        <h2 class="text-xl font-bold mb-4">Historial de ventas</h2>

        <!-- 🆕 BOTÓN PDF -->
        <button onclick="exportarPDF()" 
            class="bg-black text-white px-4 py-2 rounded mb-4 hover:bg-gray-800">
            Exportar a PDF
        </button>

        <div id="listaVentas" class="flex flex-col gap-3 text-sm">
            Cargando...
        </div>

        <button onclick="cerrarModal()" 
            class="mt-4 bg-gray-300 p-2 rounded">
            Cerrar
        </button>
    `;

    abrirModal(html);

    setTimeout(() => {
        cargarHistorial();
    }, 50);
}


// =========================
// 📥 CARGAR HISTORIAL
// =========================

function cargarHistorial() {
    fetch("/api/ventas")
        .then(res => res.json())
        .then(data => {
            const contenedor = document.getElementById("listaVentas");

            if (!contenedor) return;

            if (!data.length) {
                contenedor.innerHTML = "<p>No hay ventas registradas</p>";
                return;
            }

            let html = "";

            data.forEach(v => {

                let productosHTML = "";

                if (v.productos && v.productos.length) {
                    v.productos.forEach(p => {
                        productosHTML += `
                            <div class="text-xs text-gray-600 ml-2">
                                • ${p.nombre} x${p.cantidad} ($${p.precio})
                            </div>
                        `;
                    });
                }

                html += `
                    <div class="border p-3 rounded bg-white shadow-sm">
                        <div class="font-semibold">
                            Venta #${v.id} - $${v.total}
                        </div>

                        <div class="text-xs text-gray-500 mb-1">
                            Vendedor: ${v.vendedor || "N/A"}
                        </div>

                        ${productosHTML}
                    </div>
                `;
            });

            contenedor.innerHTML = html;
        })
        .catch(err => {
            console.error("Error cargando historial:", err);
        });
}


// =========================
// 📄 EXPORTAR A PDF
// =========================

function exportarPDF() {
    fetch("/api/ventas")
        .then(res => res.json())
        .then(data => {

            if (!window.jspdf) {
                alert("Error: jsPDF no está cargado");
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            let y = 10;

            doc.setFontSize(16);
            doc.text("Historial de Ventas - MarketOS", 10, y);
            y += 10;

            if (!data.length) {
                doc.setFontSize(12);
                doc.text("No hay ventas registradas", 10, y);
            } else {

                data.forEach(v => {

                    // 🧾 CABECERA VENTA
                    doc.setFontSize(12);
                    doc.text(`Venta #${v.id} - Total: $${v.total}`, 10, y);
                    y += 6;

                    // 🆕 VENDEDOR
                    doc.setFontSize(10);
                    doc.text(`Vendedor: ${v.vendedor || "N/A"}`, 10, y);
                    y += 6;

                    // 📦 PRODUCTOS
                    if (v.productos && v.productos.length) {
                        v.productos.forEach(p => {
                            doc.text(
                                `- ${p.nombre} x${p.cantidad} ($${p.precio})`,
                                15,
                                y
                            );
                            y += 5;
                        });
                    }

                    y += 6;

                    // 🔄 SALTO DE PÁGINA
                    if (y > 270) {
                        doc.addPage();
                        y = 10;
                    }
                });
            }

            doc.save("historial_ventas.pdf");
        })
        .catch(err => {
            console.error("Error generando PDF:", err);
        });
}


// =========================
// 🌍 GLOBAL
// =========================

window.exportarPDF = exportarPDF;
window.abrirHistorial = abrirHistorial;