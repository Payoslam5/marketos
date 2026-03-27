import os
import psycopg2
from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv
from pathlib import Path

# =========================
# 🔐 CONFIG
# =========================

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

# 🧪 DEBUG (ver si carga bien)
print("DATABASE_URL:", DATABASE_URL)

def get_db():
    return psycopg2.connect(DATABASE_URL)

app = Flask(__name__)


# =========================
# 🏠 RUTA PRINCIPAL
# =========================

@app.route("/")
def home():
    return render_template("index.html")


# =========================
# 🔹 STOCK
# =========================

@app.route("/api/stock", methods=["GET"])
def obtener_stock():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, nombre, precio, cantidad, codigo
        FROM productos
        ORDER BY id DESC
    """)

    productos = []
    for r in cur.fetchall():
        productos.append({
            "id": r[0],
            "nombre": r[1],
            "precio": float(r[2]),
            "cantidad": r[3],
            "codigo": r[4]
        })

    cur.close()
    conn.close()

    return jsonify(productos)


@app.route("/api/stock", methods=["POST"])
def agregar_producto():
    data = request.json

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO productos (nombre, precio, cantidad, codigo)
        VALUES (%s, %s, %s, %s)
        RETURNING id
    """, (
        data.get("nombre"),
        float(data.get("precio", 0)),
        int(data.get("cantidad", 0)),
        str(data.get("codigo", ""))
    ))

    new_id = cur.fetchone()[0]

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"id": new_id})


@app.route("/api/stock/<int:id>", methods=["PUT"])
def editar_producto(id):
    data = request.json

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        UPDATE productos
        SET nombre=%s, precio=%s, cantidad=%s, codigo=%s
        WHERE id=%s
    """, (
        data.get("nombre"),
        float(data.get("precio")),
        int(data.get("cantidad")),
        str(data.get("codigo")),
        id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": "ok"})


@app.route("/api/stock/<int:id>", methods=["DELETE"])
def eliminar_producto(id):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("DELETE FROM productos WHERE id = %s", (id,))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": "ok"})


# =========================
# 🔍 BUSCAR POR CÓDIGO
# =========================

@app.route("/api/stock/codigo/<codigo>", methods=["GET"])
def buscar_por_codigo(codigo):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, nombre, precio, cantidad, codigo
        FROM productos
        WHERE codigo = %s
    """, (codigo,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Producto no encontrado"}), 404

    return jsonify({
        "id": row[0],
        "nombre": row[1],
        "precio": float(row[2]),
        "cantidad": row[3],
        "codigo": row[4]
    })


# =========================
# 🔹 VENTAS
# =========================

@app.route("/api/ventas", methods=["GET"])
def obtener_ventas():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, total, vendedor, fecha
        FROM ventas
        WHERE DATE(fecha) = CURRENT_DATE
        ORDER BY id DESC
    """)

    ventas = []

    for v in cur.fetchall():
        venta_id = v[0]

        cur.execute("""
            SELECT p.nombre, vp.cantidad, vp.precio
            FROM venta_productos vp
            JOIN productos p ON p.id = vp.producto_id
            WHERE vp.venta_id = %s
        """, (venta_id,))

        productos = []
        for p in cur.fetchall():
            productos.append({
                "nombre": p[0],
                "cantidad": p[1],
                "precio": float(p[2])
            })

        ventas.append({
            "id": venta_id,
            "total": float(v[1]),
            "vendedor": v[2],
            "fecha": str(v[3]),
            "productos": productos
        })

    cur.close()
    conn.close()

    return jsonify(ventas)


@app.route("/api/ventas", methods=["POST"])
def crear_venta():
    data = request.json

    productos = data.get("productos", [])
    total = data.get("total", 0)
    vendedor = data.get("vendedor", "Vendedor 1")

    conn = get_db()
    cur = conn.cursor()

    try:
        # 🧾 Crear venta
        cur.execute("""
            INSERT INTO ventas (total, vendedor)
            VALUES (%s, %s)
            RETURNING id
        """, (total, vendedor))

        venta_id = cur.fetchone()[0]

        for item in productos:

            # 🔍 validar stock
            cur.execute("SELECT cantidad FROM productos WHERE id = %s", (item["id"],))
            stock = cur.fetchone()

            if not stock:
                raise Exception(f"Producto {item['id']} no existe")

            if stock[0] < item["cantidad"]:
                raise Exception(f"Stock insuficiente para producto {item['id']}")

            # ➖ descontar stock
            cur.execute("""
                UPDATE productos
                SET cantidad = cantidad - %s
                WHERE id = %s
            """, (item["cantidad"], item["id"]))

            # 🧾 detalle
            cur.execute("""
                INSERT INTO venta_productos (venta_id, producto_id, cantidad, precio)
                VALUES (%s, %s, %s, %s)
            """, (
                venta_id,
                item["id"],
                item["cantidad"],
                item["precio"]
            ))

        conn.commit()

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": str(e)}), 400

    cur.close()
    conn.close()

    return jsonify({
        "id": venta_id,
        "productos": productos,
        "total": total,
        "vendedor": vendedor
    })


# =========================
# 🔹 USUARIOS (FIJO)
# =========================

@app.route("/api/usuarios", methods=["GET"])
def obtener_usuarios():
    return jsonify([
        {"id": 1, "usuario": "Vendedor 1"},
        {"id": 2, "usuario": "Vendedor 2"}
    ])


# =========================
# 🚀 RUN
# =========================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)