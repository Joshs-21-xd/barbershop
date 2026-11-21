
 // ==================================
 // CONEXIÓN CON SUPABASE
 // ==================================

const SUPABASE_URL = "https://snpslziuaxmstivjeahd.supabase.co";

const SUPABASE_KEY = "sb_publishable_z8p71G6FH4uWz14YyFYy7w_lDv_HoZW";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================
// HORARIOS DISPONIBLES AUTOMÁTICAMENTE
// =====================================

(() => {
    const fechaInput = document.getElementById("fecha");
    const horaSelect = document.getElementById("hora");

    const listaHorarios = [
        { valor: "09:00", texto: "09:00 AM" },
        { valor: "10:00", texto: "10:00 AM" },
        { valor: "11:00", texto: "11:00 AM" },
        { valor: "12:00", texto: "12:00 PM" },
        { valor: "13:00", texto: "01:00 PM" },
        { valor: "14:00", texto: "02:00 PM" },
        { valor: "15:00", texto: "03:00 PM" },
        { valor: "16:00", texto: "04:00 PM" },
        { valor: "17:00", texto: "05:00 PM" },
        { valor: "18:00", texto: "06:00 PM" },
        { valor: "19:00", texto: "07:00 PM" },
        { valor: "20:00", texto: "08:00 PM" },
        { valor: "21:00", texto: "09:00 PM" },
        { valor: "22:00", texto: "10:00 PM" }
    ];

    // Obtener fecha actual local
    function obtenerFechaHoy() {
        const ahora = new Date();

        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    }

    // Mostrar únicamente horarios disponibles
    function mostrarHorarios(ocupados = []) {
        horaSelect.innerHTML = "";

        const inicio = document.createElement("option");
        inicio.value = "";
        inicio.textContent = "Selecciona una hora";
        horaSelect.appendChild(inicio);

        const ahora = new Date();
        const fechaHoy = obtenerFechaHoy();

        const minutosActuales =
            ahora.getHours() * 60 + ahora.getMinutes();

        const disponibles = listaHorarios.filter(horario => {

            // Comprobar si el horario está ocupado
            const estaOcupado = ocupados.includes(horario.valor);

            // Convertir horario a minutos
            const [hora, minutos] = horario.valor.split(":").map(Number);

            const minutosHorario = hora * 60 + minutos;

            // Comprobar si la hora ya pasó hoy
            const yaPaso =
                fechaInput.value === fechaHoy &&
                minutosHorario <= minutosActuales;

            return !estaOcupado && !yaPaso;
        });

        disponibles.forEach(horario => {
            const opcion = document.createElement("option");

            opcion.value = horario.valor;
            opcion.textContent = horario.texto;

            horaSelect.appendChild(opcion);
        });

        if (disponibles.length === 0) {
            const opcion = document.createElement("option");

            opcion.value = "";
            opcion.textContent = "No hay horarios disponibles";

            horaSelect.appendChild(opcion);
        }
    }

    let consultaActual = 0;

    // Consultar horarios cuando se selecciona una fecha
    fechaInput.addEventListener("change", async () => {

        const fechaSeleccionada = fechaInput.value;
        const consulta = ++consultaActual;

        if (!fechaSeleccionada) {
            mostrarHorarios();
            horaSelect.disabled = false;
            return;
        }

        horaSelect.disabled = true;

        horaSelect.innerHTML =
            '<option value="">Consultando horarios...</option>';

        try {
            const { data, error } = await supabaseClient
                .from("reservas")
                .select("hora")
                .eq("fecha", fechaSeleccionada)
                .neq("estado", "cancelada")
                .neq("estado", "atendida");

            if (error) throw error;

            if (consulta !== consultaActual) return;

            const ocupados = data.map(reserva =>
                String(reserva.hora).slice(0, 5)
            );

            mostrarHorarios(ocupados);

            horaSelect.disabled = false;

        } catch (error) {
            console.error("Error consultando horarios:", error);

            if (consulta !== consultaActual) return;

            horaSelect.innerHTML =
                '<option value="">Error al consultar horarios</option>';

            horaSelect.disabled = true;

            alert(
                "No se pudieron consultar los horarios. Intenta nuevamente."
            );
        }
    });

    // Mostrar horarios iniciales
    mostrarHorarios();

})();


// ==================================
// CONFIGURACIÓN DEL FORMULARIO
// ==================================

const formulario = document.getElementById("formReserva");
const fechaInput = document.getElementById("fecha");
const mensaje = document.getElementById("mensaje-reserva");

// Evitar seleccionar fechas pasadas
function obtenerFechaActual() {
    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

fechaInput.min = obtenerFechaActual();


// ==================================
// PRECIOS DE LOS SERVICIOS
// ==================================

const precios = {
    "Corte clásico": 20,
    "Fade / Degradado": 25,
    "Corte + Barba": 35
};


// ==================================
// PROCESAR SOLICITUD DE RESERVA
// ==================================

formulario.addEventListener("submit", async function(event) {

    console.log("FORMULARIO ENVIADO CORRECTAMENTE");

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

    // Validar servicio
    if (!precios[servicio]) {
        mensaje.innerHTML = `
            <p style="color:#ff7777;">
                Selecciona un servicio válido.
            </p>
        `;
        return;
    }

    // Validar fecha y hora
    if (!fecha || !hora) {
        mensaje.innerHTML = `
            <p style="color:#ff7777;">
                Selecciona una fecha y un horario disponible.
            </p>
        `;
        return;
    }

    // Evitar fechas pasadas
    const fechaHoy = obtenerFechaActual();

    if (fecha < fechaHoy) {
        mensaje.innerHTML = `
            <p style="color:#ff7777;">
                No puedes reservar en una fecha pasada.
            </p>
        `;
        return;
    }

    // Evitar reservar horas que ya pasaron hoy
    if (fecha === fechaHoy) {

        const ahora = new Date();

        const [horaReserva, minutoReserva] =
            hora.split(":").map(Number);

        const minutosReserva =
            horaReserva * 60 + minutoReserva;

        const minutosActuales =
            ahora.getHours() * 60 + ahora.getMinutes();

        if (minutosReserva <= minutosActuales) {
            mensaje.innerHTML = `
                <p style="color:#ff7777;">
                    Ese horario ya pasó.
                    Selecciona otra hora disponible.
                </p>
            `;
            return;
        }
    }

    const precio = precios[servicio];

    // Evitar doble envío
    const boton = formulario.querySelector(
        'button[type="submit"]'
    );

    boton.disabled = true;
    boton.textContent = "GUARDANDO RESERVA...";

    mensaje.innerHTML = "";

    try {

        // Guardar reserva en Supabase
        const { error } = await supabaseClient
            .from("reservas")
            .insert([{
                nombre,
                telefono,
                servicio,
                precio,
                fecha,
                hora,
                estado: "pendiente"
            }]);

        if (error) {

            if (error.code === "23505") {
                throw new Error(
                    "Ese horario ya está reservado. Elige otra hora."
                );
            }

            throw error;
        }

        const fechaBonita =
            fecha.split("-").reverse().join("/");

        // Mostrar confirmación
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

        // Limpiar formulario
        formulario.reset();

    } catch (error) {

        console.error("Error al guardar reserva:", error);

        mensaje.innerHTML = `
            <p style="color:#ff7777;">
                ${error.message ||
                "No se pudo guardar la reserva. Inténtalo nuevamente."}
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
