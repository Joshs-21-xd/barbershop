
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

// ==================================
// PROCESAR SOLICITUD DE RESERVA
// ==================================

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const servicio = document.getElementById("servicio").value;
    const fecha = fechaInput.value;
    const hora = document.getElementById("hora").value;
    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    // Validar número de celular peruano
    if (!/^9\d{8}$/.test(telefono)) {
        mensaje.innerHTML = `
            <p style="color:#ff7777;">
                Ingresa un celular válido de 9 dígitos que comience con 9.
            </p>
        `;
        return;
    }

    // Mostrar resumen de la solicitud
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
            <h3 style="color:#d5ad65; margin-bottom:15px;">
                ¡Solicitud preparada!
            </h3>

            <p>✂️ Servicio: ${servicio}</p>
            <p>📅 Fecha: ${fechaBonita}</p>
            <p>🕒 Hora: ${hora}</p>
            <p>👤 Cliente: ${nombre}</p>
            <p>📱 Celular: ${telefono}</p>

            <p style="
                color:#d5ad65;
                margin-top:18px;
                font-size:13px;
            ">
                Esta es una vista previa. Tu cita todavía no está confirmada.
            </p>
        </div>
    `;

    mensaje.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});
