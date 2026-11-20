
// ==================================
// CONEXIÓN CON SUPABASE
// ==================================

const SUPABASE_URL = "https://snpslziuaxmstivjeahd.supabase.co";

const SUPABASE_KEY = "sb_publishable_z8p71G6FH4uWz14YyFYy7w_lDv_HoZW";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ==================================
// CONFIGURACIÓN DEL FORMULARIO
// ==================================

const formulario = document.getElementById("formReserva");
const fechaInput = document.getElementById("fecha");
const mensaje = document.getElementById("mensaje-reserva");

// Evitar seleccionar fechas pasadas
const hoy = new Date();
const anio = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2, "0");
const dia = String(hoy.getDate()).padStart(2, "0");

fechaInput.min = `${anio}-${mes}-${dia}`;

// Precios de los servicios
const precios = {
    "Corte clásico": 20,
    "Fade / Degradado": 25,
    "Corte + Barba": 35
};

// ==================================
// PROCESAR SOLICITUD DE RESERVA
// ==================================

formulario.addEventListener("submit", async function(event) {
    event.preventDefault();

    const servicio = document.getElementById("servicio").value;
    const fecha = fechaInput.value;
    const hora = document.getElementById("hora").value;
    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    // Validar celular peruano
    if (!/^9\d{8}$/.test(telefono)) {
        mensaje.innerHTML = `
            <p style="color:#ff7777;">
                Ingresa un celular válido de 9 dígitos.
            </p>
        `;
        return;
    }

    if (!precios[servicio]) {
        mensaje.innerHTML = `<p style="color:#ff7777;">Selecciona un servicio válido.</p>`;
        return;
    }

    const precio = precios[servicio];

    // Evitar doble envío
    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = "GUARDANDO RESERVA...";

    mensaje.innerHTML = "";

    try {
        // Guardar reserva en Supabase
        const { data, error } = await supabaseClient
            .from("reservas")
            .insert([{
                nombre: nombre,
                telefono: telefono,
                servicio: servicio,
                precio: precio,
                fecha: fecha,
                hora: hora,
                estado: "pendiente"
            }])
            .select();

        if (error) {
            if (error.code === "23505") {
                throw new Error("Ese horario ya está reservado. Elige otra hora.");
            }
            throw error;
        }

        const fechaBonita = fecha.split("-").reverse().join("/");

        mensaje.innerHTML = `
            <div style="
                background:#191919;
                border:1px solid #c8a45d;
                border-radius:10px;
                padding:25px;
                margin-top:20px;
                text-align:left;
            ">
                <h3 style="color:#d5ad65;">
                    ¡Reserva registrada!
                </h3>

                <p>✂️ Servicio: ${servicio}</p>
                <p>💰 Precio: S/ ${precio}</p>
                <p>📅 Fecha: ${fechaBonita}</p>
                <p>🕒 Hora: ${hora}</p>
                <p>👤 Cliente: ${nombre}</p>
                <p>📱 Celular: ${telefono}</p>

                <p style="color:#d5ad65; margin-top:18px;">
                    Tu solicitud fue guardada correctamente.
                    Está pendiente de confirmación.
                </p>
            </div>
        `;

        formulario.reset();

    } catch (error) {
        console.error("Error al guardar reserva:", error);

        mensaje.innerHTML = `
            <p style="color:#ff7777;">
                ${error.message || "No se pudo guardar la reserva. Inténtalo nuevamente."}
            </p>
        `;
    } finally {
        boton.disabled = false;
        boton.textContent = "CONFIRMAR RESERVA";
    }

    mensaje.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});
    