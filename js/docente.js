/* ============================================================
   PANEL DOCENTE
   RESERVA DE AULAS Y LABORATORIOS - CETA
   ============================================================ */


/* ============================================================
   1. CONSTANTES
   ============================================================ */

const HORARIOS_AULAS = {
    MANANA: "09:00-12:00",
    TARDE: "14:00-17:00",
    NOCHE: "19:00-21:30"
};


const INFORMACION_TURNOS = {

    "09:00-12:00": {
        nombre: "Turno mañana",
        horario: "09:00 - 12:00",
        icono: "☀️"
    },

    "14:00-17:00": {
        nombre: "Turno tarde",
        horario: "14:00 - 17:00",
        icono: "🌤️"
    },

    "19:00-21:30": {
        nombre: "Turno noche",
        horario: "19:00 - 21:30",
        icono: "🌙"
    }

};


const DIAS_AULAS = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes"
];


const MESES_AULAS = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"
];



/* ============================================================
   2. ESTADO GENERAL
   ============================================================ */

let usuarioActual = null;

let perfilActual = null;

let espaciosAulas = [];

let misReservas = [];

let disponibilidadSemana = {};

let lunesSemanaActual = null;

let turnoActual = HORARIOS_AULAS.MANANA;


/*
    Aquí guardaremos temporalmente la celda que el docente
    acaba de seleccionar para realizar una reserva rápida.
*/
let reservaRapidaSeleccionada = null;



/* ============================================================
   3. ELEMENTOS
   ============================================================ */

function elemento(id) {

    return document.getElementById(id);

}



/* ============================================================
   4. ESCAPAR HTML
   ============================================================ */

function escaparHTML(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}



/* ============================================================
   5. FECHA LOCAL A YYYY-MM-DD
   ============================================================ */

function fechaLocalISO(fecha) {

    const anio = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;

}



/* ============================================================
   6. CREAR FECHA LOCAL DESDE YYYY-MM-DD
   ============================================================ */

function crearFechaLocal(fechaISO) {

    if (!fechaISO) {
        return null;
    }

    const partes = fechaISO.split("-");

    if (partes.length !== 3) {
        return null;
    }

    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

}



/* ============================================================
   7. SUMAR DÍAS
   ============================================================ */

function sumarDias(fecha, cantidad) {

    const nuevaFecha = new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate()
    );

    nuevaFecha.setDate(
        nuevaFecha.getDate() + cantidad
    );

    return nuevaFecha;

}



/* ============================================================
   8. OBTENER LUNES DE UNA SEMANA
   ============================================================ */

function obtenerLunes(fecha) {

    const resultado = new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate()
    );

    const dia = resultado.getDay();

    /*
        JavaScript:
        Domingo = 0
        Lunes   = 1
        ...
        Sábado = 6
    */

    const diferencia =
        dia === 0
            ? -6
            : 1 - dia;

    resultado.setDate(
        resultado.getDate() + diferencia
    );

    return resultado;

}



/* ============================================================
   9. OBTENER FECHAS DE LUNES A VIERNES
   ============================================================ */

function obtenerFechasSemana() {

    if (!lunesSemanaActual) {
        return [];
    }

    const fechas = [];

    for (let i = 0; i < 5; i++) {

        fechas.push(
            sumarDias(
                lunesSemanaActual,
                i
            )
        );

    }

    return fechas;

}



/* ============================================================
   10. FORMATEAR FECHA
   ============================================================ */

function formatearFecha(fechaISO) {

    const fecha = crearFechaLocal(fechaISO);

    if (!fecha) {
        return "-";
    }

    return (
        String(fecha.getDate()).padStart(2, "0")
        + "/"
        + String(fecha.getMonth() + 1).padStart(2, "0")
        + "/"
        + fecha.getFullYear()
    );

}



/* ============================================================
   11. FORMATEAR FECHA LARGA
   ============================================================ */

function formatearFechaLarga(fechaISO) {

    const fecha = crearFechaLocal(fechaISO);

    if (!fecha) {
        return "-";
    }

    const nombreDia = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado"
    ][fecha.getDay()];


    return (
        nombreDia.charAt(0).toUpperCase()
        + nombreDia.slice(1)
        + " "
        + fecha.getDate()
        + " de "
        + MESES_AULAS[fecha.getMonth()]
        + " de "
        + fecha.getFullYear()
    );

}



/* ============================================================
   12. FECHA DE HOY
   ============================================================ */

function obtenerFechaHoyISO() {

    return fechaLocalISO(
        new Date()
    );

}



/* ============================================================
   13. COMPROBAR SI UNA FECHA YA PASÓ
   ============================================================ */

function fechaYaPaso(fechaISO) {

    return fechaISO < obtenerFechaHoyISO();

}



/* ============================================================
   14. NOMBRE DEL TIPO DE ESPACIO
   ============================================================ */

function nombreTipoEspacio(tipo) {

    if (tipo === "laboratorio") {
        return "Laboratorio";
    }

    return "Aula";

}



/* ============================================================
   15. NOMBRE DEL HORARIO
   ============================================================ */

function nombreHorario(horario) {

    const info =
        INFORMACION_TURNOS[horario];

    if (!info) {
        return horario || "-";
    }

    return info.horario;

}



/* ============================================================
   16. MOSTRAR MENSAJE EN FORMULARIO
   ============================================================ */

function mostrarMensajeFormulario(
    id,
    mensaje,
    tipo = "error"
) {

    const contenedor = elemento(id);

    if (!contenedor) {
        return;
    }


    contenedor.textContent = mensaje;

    contenedor.classList.remove(
        "oculto",
        "exito",
        "error"
    );

    contenedor.classList.add(tipo);

}



/* ============================================================
   17. LIMPIAR MENSAJE DE FORMULARIO
   ============================================================ */

function limpiarMensajeFormulario(id) {

    const contenedor = elemento(id);

    if (!contenedor) {
        return;
    }

    contenedor.textContent = "";

    contenedor.classList.add("oculto");

    contenedor.classList.remove(
        "exito",
        "error"
    );

}



/* ============================================================
   18. MENSAJE GLOBAL
   ============================================================ */

let temporizadorMensajeGlobal = null;


function mostrarMensajeGlobal(
    mensaje,
    tipo = "exito"
) {

    const contenedor =
        elemento("mensajeGlobal");

    if (!contenedor) {
        return;
    }


    if (temporizadorMensajeGlobal) {

        clearTimeout(
            temporizadorMensajeGlobal
        );

    }


    contenedor.textContent = mensaje;

    contenedor.classList.remove(
        "exito",
        "error",
        "visible"
    );

    contenedor.classList.add(
        tipo,
        "visible"
    );


    temporizadorMensajeGlobal =
        setTimeout(() => {

            contenedor.classList.remove(
                "visible"
            );

        }, 3500);

}



/* ============================================================
   19. CARGA GLOBAL
   ============================================================ */

function mostrarCargando(
    mostrar,
    texto = "Procesando..."
) {

    const cargando =
        elemento("cargandoGlobal");

    const textoCargando =
        elemento("textoCargandoGlobal");


    if (!cargando) {
        return;
    }


    if (textoCargando) {

        textoCargando.textContent =
            texto;

    }


    if (mostrar) {

        cargando.classList.remove(
            "oculto"
        );

    } else {

        cargando.classList.add(
            "oculto"
        );

    }

}



/* ============================================================
   20. ABRIR MODAL
   ============================================================ */

function abrirModal(id) {

    const modal = elemento(id);

    if (!modal) {
        return;
    }


    modal.classList.add("activo");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-abierto"
    );

}



/* ============================================================
   21. CERRAR MODAL
   ============================================================ */

function cerrarModal(id) {

    const modal = elemento(id);

    if (!modal) {
        return;
    }


    modal.classList.remove("activo");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
        Quitamos modal-abierto únicamente si
        no queda ningún otro modal abierto.
    */

    const otroModalAbierto =
        document.querySelector(
            ".modal.activo"
        );


    if (!otroModalAbierto) {

        document.body.classList.remove(
            "modal-abierto"
        );

    }

}



/* ============================================================
   22. EVENTOS GENERALES DE MODALES
   ============================================================ */

function configurarEventosModales() {

    document
        .querySelectorAll(
            "[data-cerrar-modal]"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    const idModal =
                        boton.dataset
                            .cerrarModal;

                    cerrarModal(idModal);

                }
            );

        });


    document.addEventListener(
        "keydown",
        evento => {

            if (evento.key !== "Escape") {
                return;
            }


            document
                .querySelectorAll(
                    ".modal.activo"
                )
                .forEach(modal => {

                    cerrarModal(
                        modal.id
                    );

                });

        }
    );

}



/* ============================================================
   23. MENSAJE DE ERROR SUPABASE
   ============================================================ */

function mensajeErrorSupabase(error) {

    if (!error) {
        return "Ha ocurrido un error.";
    }


    /*
        Los mensajes generados por nuestras RPC
        son suficientemente claros para mostrarlos
        al docente.
    */

    if (error.message) {
        return error.message;
    }


    return "Ha ocurrido un error al comunicarse con el servidor.";

}



/* ============================================================
   24. COMPROBAR DOCENTE
   ============================================================ */

async function comprobarDocente() {

    const {
        data: {
            session
        },
        error: errorSesion
    } =
        await supabaseClient.auth
            .getSession();


    if (
        errorSesion
        || !session
        || !session.user
    ) {

        window.location.href =
            "index.html";

        return false;

    }


    usuarioActual =
        session.user;


    const {
        data: perfil,
        error
    } =
        await supabaseClient
            .from("perfiles")
            .select(
                "id,usuario,nombre,rol,activo"
            )
            .eq(
                "id",
                usuarioActual.id
            )
            .single();


    if (
        error
        || !perfil
        || perfil.activo !== true
        || perfil.rol !== "docente"
    ) {

        await supabaseClient.auth
            .signOut();

        window.location.href =
            "index.html";

        return false;

    }


    perfilActual =
        perfil;


    const nombreDocente =
        elemento("nombreDocente");


    if (nombreDocente) {

        nombreDocente.textContent =
            perfil.nombre
            || perfil.usuario
            || "Docente";

    }


    return true;

}



/* ============================================================
   25. CERRAR SESIÓN
   ============================================================ */

async function cerrarSesion() {

    try {

        mostrarCargando(
            true,
            "Cerrando sesión..."
        );


        await supabaseClient.auth
            .signOut();


        window.location.href =
            "index.html";

    } catch (error) {

        mostrarCargando(false);

        mostrarMensajeGlobal(
            "No se pudo cerrar la sesión.",
            "error"
        );

    }

}



/* ============================================================
   26. PESTAÑAS PRINCIPALES
   ============================================================ */

function activarTab(nombreTab) {

    document
        .querySelectorAll(".btn-tab")
        .forEach(boton => {

            boton.classList.toggle(
                "activo",
                boton.dataset.tab
                    === nombreTab
            );

        });


    document
        .querySelectorAll(".seccion-tab")
        .forEach(seccion => {

            seccion.classList.toggle(
                "activa",
                seccion.id
                    === `tab-${nombreTab}`
            );

        });


    /*
        Actualizamos los datos correspondientes
        al entrar en cada pestaña.
    */

    if (nombreTab === "reservar") {

        cargarDisponibilidadSemana();

    }


    if (nombreTab === "mis-reservas") {

        cargarMisReservas();

    }


    if (nombreTab === "observaciones") {

        cargarEspacios();

    }

}



/* ============================================================
   27. CONFIGURAR PESTAÑAS PRINCIPALES
   ============================================================ */

function configurarPestanasPrincipales() {

    document
        .querySelectorAll(".btn-tab")
        .forEach(boton => {

            /*
                El botón de modo oscuro también está dentro
                de la navegación, pero no tiene data-tab.
            */

            if (!boton.dataset.tab) {
                return;
            }


            boton.addEventListener(
                "click",
                () => {

                    activarTab(
                        boton.dataset.tab
                    );

                }
            );

        });

}



/* ============================================================
   28. MODO OSCURO
   ============================================================ */

function aplicarModoGuardado() {

    const modo =
        localStorage.getItem(
            "ceta-aulas-modo"
        );


    if (modo === "oscuro") {

        document.body.classList.add(
            "modo-oscuro"
        );

        const boton =
            elemento("btnModoOscuro");

        if (boton) {
            boton.textContent = "☀️";
        }

    }

}



/* ============================================================
   29. CAMBIAR MODO OSCURO
   ============================================================ */

function cambiarModoOscuro() {

    document.body.classList.toggle(
        "modo-oscuro"
    );


    const oscuro =
        document.body.classList.contains(
            "modo-oscuro"
        );


    localStorage.setItem(
        "ceta-aulas-modo",
        oscuro
            ? "oscuro"
            : "claro"
    );


    const boton =
        elemento("btnModoOscuro");


    if (boton) {

        boton.textContent =
            oscuro
                ? "☀️"
                : "🌙";

    }

}



/* ============================================================
   30. INICIALIZAR SEMANA
   ============================================================ */

function inicializarSemana() {

    const hoy =
        new Date();


    lunesSemanaActual =
        obtenerLunes(hoy);


    actualizarInterfazSemana();

}



/* ============================================================
   31. ACTUALIZAR INTERFAZ DE SEMANA
   ============================================================ */

function actualizarInterfazSemana() {

    if (!lunesSemanaActual) {
        return;
    }


    const viernes =
        sumarDias(
            lunesSemanaActual,
            4
        );


    const fechaSemana =
        elemento("fechaSemana");


    if (fechaSemana) {

        fechaSemana.value =
            fechaLocalISO(
                lunesSemanaActual
            );

    }


    const textoSemana =
        elemento("textoSemana");


    if (textoSemana) {

        /*
            Ejemplo:
            21 - 25 de septiembre de 2026
        */

        if (
            lunesSemanaActual.getMonth()
            === viernes.getMonth()
        ) {

            textoSemana.textContent =
                `${lunesSemanaActual.getDate()} - `
                + `${viernes.getDate()} de `
                + `${MESES_AULAS[viernes.getMonth()]} de `
                + `${viernes.getFullYear()}`;

        } else {

            textoSemana.textContent =
                `${lunesSemanaActual.getDate()} de `
                + `${MESES_AULAS[lunesSemanaActual.getMonth()]}`
                + " - "
                + `${viernes.getDate()} de `
                + `${MESES_AULAS[viernes.getMonth()]} de `
                + `${viernes.getFullYear()}`;

        }

    }


    actualizarCabecerasDias();

}



/* ============================================================
   32. ACTUALIZAR FECHAS EN CABECERA
   ============================================================ */

function actualizarCabecerasDias() {

    const fechas =
        obtenerFechasSemana();


    const ids = [
        "cabeceraLunes",
        "cabeceraMartes",
        "cabeceraMiercoles",
        "cabeceraJueves",
        "cabeceraViernes"
    ];


    ids.forEach(
        (id, indice) => {

            const cabecera =
                elemento(id);

            const fecha =
                fechas[indice];


            if (
                !cabecera
                || !fecha
            ) {
                return;
            }


            cabecera.innerHTML =
                `${DIAS_AULAS[indice]}`
                + `<br>`
                + `<small>`
                + `${String(fecha.getDate()).padStart(2, "0")}/`
                + `${String(fecha.getMonth() + 1).padStart(2, "0")}`
                + `</small>`;

        }
    );

}



/* ============================================================
   33. CAMBIAR SEMANA
   ============================================================ */

function cambiarSemana(cantidadDias) {

    lunesSemanaActual =
        sumarDias(
            lunesSemanaActual,
            cantidadDias
        );


    /*
        Al cambiar semana descartamos el caché anterior.
    */

    disponibilidadSemana = {};


    actualizarInterfazSemana();

    cargarDisponibilidadSemana();

}



/* ============================================================
   34. VOLVER A SEMANA ACTUAL
   ============================================================ */

function irSemanaActual() {

    lunesSemanaActual =
        obtenerLunes(
            new Date()
        );


    disponibilidadSemana = {};


    actualizarInterfazSemana();

    cargarDisponibilidadSemana();

}



/* ============================================================
   35. CAMBIO MANUAL DE FECHA
   ============================================================ */

function cambiarFechaSemana() {

    const input =
        elemento("fechaSemana");


    if (
        !input
        || !input.value
    ) {
        return;
    }


    const fecha =
        crearFechaLocal(
            input.value
        );


    if (!fecha) {
        return;
    }


    lunesSemanaActual =
        obtenerLunes(fecha);


    disponibilidadSemana = {};


    actualizarInterfazSemana();

    cargarDisponibilidadSemana();

}



/* ============================================================
   36. CAMBIAR TURNO
   ============================================================ */

function cambiarTurno(horario) {

    if (!INFORMACION_TURNOS[horario]) {
        return;
    }


    turnoActual =
        horario;


    document
        .querySelectorAll(".btn-turno")
        .forEach(boton => {

            boton.classList.toggle(
                "activo",
                boton.dataset.turno
                    === horario
            );

        });


    const informacion =
        INFORMACION_TURNOS[horario];


    const icono =
        elemento("iconoTurnoActual");

    const nombre =
        elemento("nombreTurnoActual");

    const textoHorario =
        elemento("horarioTurnoActual");


    if (icono) {

        icono.textContent =
            informacion.icono;

    }


    if (nombre) {

        nombre.textContent =
            informacion.nombre;

    }


    if (textoHorario) {

        textoHorario.textContent =
            informacion.horario;

    }


    /*
        Aquí está la ventaja del diseño:
        no consultamos Supabase nuevamente.

        Simplemente mostramos los datos del turno
        que ya fueron descargados.
    */

    renderizarDisponibilidadTurno();

}



/* ============================================================
   37. CONFIGURAR EVENTOS DE TURNOS
   ============================================================ */

function configurarEventosTurnos() {

    document
        .querySelectorAll(".btn-turno")
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    cambiarTurno(
                        boton.dataset.turno
                    );

                }
            );

        });

}



/* ============================================================
   38. EVENTOS DEL SELECTOR DE SEMANA
   ============================================================ */

function configurarEventosSemana() {

    elemento("btnSemanaAnterior")
        ?.addEventListener(
            "click",
            () => cambiarSemana(-7)
        );


    elemento("btnSemanaSiguiente")
        ?.addEventListener(
            "click",
            () => cambiarSemana(7)
        );


    elemento("btnSemanaActual")
        ?.addEventListener(
            "click",
            irSemanaActual
        );


    elemento("btnActualizarDisponibilidad")
        ?.addEventListener(
            "click",
            () => {

                disponibilidadSemana = {};

                cargarDisponibilidadSemana();

            }
        );


    elemento("fechaSemana")
        ?.addEventListener(
            "change",
            cambiarFechaSemana
        );

}



/* ============================================================
   39. EVENTOS GENERALES
   ============================================================ */

function configurarEventosGenerales() {

    elemento("btnCerrarSesion")
        ?.addEventListener(
            "click",
            cerrarSesion
        );


    elemento("btnModoOscuro")
        ?.addEventListener(
            "click",
            cambiarModoOscuro
        );

}
/* ============================================================
   40. CARGAR ESPACIOS
   ============================================================ */

async function cargarEspacios() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("espacios_aulas")
                .select(
                    "id,tipo,nombre,activo"
                )
                .eq(
                    "activo",
                    true
                )
                .order(
                    "nombre",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        espaciosAulas =
            data || [];


        llenarSelectoresEspacios();


        return espaciosAulas;

    } catch (error) {

        console.error(
            "Error cargando espacios:",
            error
        );


        mostrarMensajeGlobal(
            mensajeErrorSupabase(error),
            "error"
        );


        return [];

    }

}



/* ============================================================
   41. LLENAR SELECTORES DE ESPACIOS
   ============================================================ */

function llenarSelectoresEspacios() {

    const selectObservacion =
        elemento("observacionEspacio");

    const selectEditar =
        elemento(
            "editarReservaDocenteEspacio"
        );


    const opciones =
        espaciosAulas
            .map(espacio => {

                return `
                    <option value="${espacio.id}">
                        ${escaparHTML(espacio.nombre)}
                        — ${escaparHTML(nombreTipoEspacio(espacio.tipo))}
                    </option>
                `;

            })
            .join("");


    if (selectObservacion) {

        const valorAnterior =
            selectObservacion.value;


        selectObservacion.innerHTML =
            `
                <option value="">
                    Seleccionar espacio
                </option>
            `
            + opciones;


        if (
            valorAnterior
            && espaciosAulas.some(
                espacio =>
                    String(espacio.id)
                    === String(valorAnterior)
            )
        ) {

            selectObservacion.value =
                valorAnterior;

        }

    }


    if (selectEditar) {

        const valorAnterior =
            selectEditar.value;


        selectEditar.innerHTML =
            `
                <option value="">
                    Seleccionar espacio
                </option>
            `
            + opciones;


        if (
            valorAnterior
            && espaciosAulas.some(
                espacio =>
                    String(espacio.id)
                    === String(valorAnterior)
            )
        ) {

            selectEditar.value =
                valorAnterior;

        }

    }

}



/* ============================================================
   42. CLAVE PARA GUARDAR DISPONIBILIDAD
   ============================================================ */

function claveDisponibilidad(
    fechaISO,
    horario
) {

    return `${fechaISO}|${horario}`;

}



/* ============================================================
   43. MOSTRAR TABLA CARGANDO
   ============================================================ */

function mostrarTablaDisponibilidadCargando() {

    const tbody =
        elemento(
            "tablaDisponibilidadDocente"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="tabla-cargando"
            >
                Cargando disponibilidad...
            </td>
        </tr>
    `;

}



/* ============================================================
   44. CARGAR DISPONIBILIDAD DE TODA LA SEMANA
   ============================================================ */

async function cargarDisponibilidadSemana() {

    if (!lunesSemanaActual) {
        return;
    }


    mostrarTablaDisponibilidadCargando();


    const fechas =
        obtenerFechasSemana();


    /*
        Consultamos los 3 turnos de lunes a viernes.

        Son 15 combinaciones:
        5 días x 3 horarios.

        Luego guardamos todo en memoria para que cambiar
        de Mañana a Tarde o Noche sea instantáneo.
    */

    const consultas = [];


    for (const fecha of fechas) {

        const fechaISO =
            fechaLocalISO(fecha);


        for (
            const horario
            of Object.values(HORARIOS_AULAS)
        ) {

            consultas.push(
                cargarDisponibilidadDiaHorario(
                    fechaISO,
                    horario
                )
            );

        }

    }


    try {

        await Promise.all(consultas);


        renderizarDisponibilidadTurno();

    } catch (error) {

        console.error(
            "Error cargando disponibilidad:",
            error
        );


        renderizarDisponibilidadTurno();

    }

}



/* ============================================================
   45. CARGAR DISPONIBILIDAD DE UN DÍA Y HORARIO
   ============================================================ */

async function cargarDisponibilidadDiaHorario(
    fechaISO,
    horario
) {

    const clave =
        claveDisponibilidad(
            fechaISO,
            horario
        );


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "obtener_disponibilidad_aulas",
                {
                    p_fecha:
                        fechaISO,

                    p_horario:
                        horario
                }
            );


        if (error) {
            throw error;
        }


        disponibilidadSemana[clave] = {
            correcto: true,
            datos: data || [],
            error: null
        };


        return data || [];

    } catch (error) {

        /*
            No detenemos toda la semana porque una fecha
            concreta no tenga gestión o tenga otro problema.
        */

        console.error(
            `Disponibilidad ${fechaISO} ${horario}:`,
            error
        );


        disponibilidadSemana[clave] = {
            correcto: false,
            datos: [],
            error:
                mensajeErrorSupabase(error)
        };


        return [];

    }

}



/* ============================================================
   46. BUSCAR DISPONIBILIDAD DE UN ESPACIO
   ============================================================ */

function obtenerDisponibilidadEspacio(
    espacioId,
    fechaISO,
    horario
) {

    const clave =
        claveDisponibilidad(
            fechaISO,
            horario
        );


    const bloque =
        disponibilidadSemana[clave];


    if (!bloque) {
        return null;
    }


    if (!bloque.correcto) {

        return {
            errorConsulta: true,
            mensaje:
                bloque.error
                || "No disponible"
        };

    }


    const registro =
        bloque.datos.find(
            item =>
                String(item.espacio_id)
                === String(espacioId)
        );


    return registro || null;

}



/* ============================================================
   47. OBTENER ESPACIOS PARA LA TABLA
   ============================================================ */

function obtenerEspaciosTabla() {

    /*
        Normalmente espaciosAulas ya está cargado.

        Sin embargo, la RPC de disponibilidad también devuelve
        nombre y tipo. Si por alguna razón el listado todavía
        estuviera vacío, podemos reconstruirlo con los datos
        descargados.
    */

    if (espaciosAulas.length > 0) {

        return [...espaciosAulas]
            .sort(
                (a, b) =>
                    a.nombre.localeCompare(
                        b.nombre,
                        "es",
                        {
                            numeric: true
                        }
                    )
            );

    }


    const mapa =
        new Map();


    Object.values(
        disponibilidadSemana
    ).forEach(bloque => {

        if (
            !bloque
            || !bloque.correcto
        ) {
            return;
        }


        bloque.datos.forEach(item => {

            if (
                !mapa.has(
                    String(item.espacio_id)
                )
            ) {

                mapa.set(
                    String(item.espacio_id),
                    {
                        id:
                            item.espacio_id,

                        tipo:
                            item.tipo,

                        nombre:
                            item.nombre,

                        activo:
                            true
                    }
                );

            }

        });

    });


    return Array.from(
        mapa.values()
    ).sort(
        (a, b) =>
            a.nombre.localeCompare(
                b.nombre,
                "es",
                {
                    numeric: true
                }
            )
    );

}



/* ============================================================
   48. RENDERIZAR DISPONIBILIDAD DEL TURNO ACTUAL
   ============================================================ */

function renderizarDisponibilidadTurno() {

    const tbody =
        elemento(
            "tablaDisponibilidadDocente"
        );


    if (!tbody) {
        return;
    }


    const fechas =
        obtenerFechasSemana();


    const espacios =
        obtenerEspaciosTabla();


    if (espacios.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="tabla-vacia"
                >
                    No existen aulas o laboratorios disponibles.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        espacios
            .map(espacio => {

                const celdas =
                    fechas
                        .map(fecha => {

                            const fechaISO =
                                fechaLocalISO(
                                    fecha
                                );


                            const disponibilidad =
                                obtenerDisponibilidadEspacio(
                                    espacio.id,
                                    fechaISO,
                                    turnoActual
                                );


                            return construirCeldaDisponibilidadDocente(
                                espacio,
                                fechaISO,
                                turnoActual,
                                disponibilidad
                            );

                        })
                        .join("");


                return `
                    <tr>

                        <th
                            scope="row"
                            class="celda-espacio"
                        >

                            <strong>
                                ${escaparHTML(espacio.nombre)}
                            </strong>

                            <small>
                                ${escaparHTML(
                                    nombreTipoEspacio(
                                        espacio.tipo
                                    )
                                )}
                            </small>

                        </th>

                        ${celdas}

                    </tr>
                `;

            })
            .join("");

}



/* ============================================================
   49. CONSTRUIR CELDA DE DISPONIBILIDAD
   ============================================================ */

function construirCeldaDisponibilidadDocente(
    espacio,
    fechaISO,
    horario,
    disponibilidad
) {

    /*
        Si la consulta concreta falló, no permitimos
        reservar. Mostramos que no está disponible.
    */

    if (
        disponibilidad
        && disponibilidad.errorConsulta
    ) {

        return `
            <td class="celda-no-disponible">

                <div class="estado-disponibilidad">

                    <strong>
                        SIN GESTIÓN
                    </strong>

                    <small>
                        No disponible
                    </small>

                </div>

            </td>
        `;

    }


    /*
        Si todavía no tenemos datos.
    */

    if (!disponibilidad) {

        return `
            <td class="celda-no-disponible">

                <div class="estado-disponibilidad">

                    <strong>
                        -
                    </strong>

                </div>

            </td>
        `;

    }


    /*
        --------------------------------------------------------
        LIBRE
        --------------------------------------------------------
    */

    if (
        disponibilidad.disponible === true
        || disponibilidad.tipo_ocupacion === "libre"
    ) {

        /*
            No permitimos reservar fechas que ya pasaron.

            El día de hoy SÍ se puede reservar.
        */

        if (fechaYaPaso(fechaISO)) {

            return `
                <td class="celda-no-disponible">

                    <div class="estado-disponibilidad">

                        <strong>
                            LIBRE
                        </strong>

                        <small>
                            Fecha pasada
                        </small>

                    </div>

                </td>
            `;

        }


        return `
            <td class="celda-libre">

                <div class="estado-disponibilidad">

                    <strong>
                        LIBRE
                    </strong>

                    <button
                        type="button"
                        class="btn-reservar-rapido"
                        data-accion="reservar-rapido"
                        data-espacio-id="${espacio.id}"
                        data-fecha="${fechaISO}"
                        data-horario="${horario}"
                    >
                        Reservar
                    </button>

                </div>

            </td>
        `;

    }


    /*
        --------------------------------------------------------
        ASIGNACIÓN FIJA
        --------------------------------------------------------
    */

    if (
        disponibilidad.tipo_ocupacion
        === "asignacion"
    ) {

        const esMia =
            usuarioActual
            && disponibilidad.usuario_id
            && String(
                disponibilidad.usuario_id
            )
            === String(
                usuarioActual.id
            );


        return `
            <td class="celda-asignacion">

                <div class="estado-disponibilidad">

                    <strong>
                        ${
                            esMia
                                ? "MI ASIGNACIÓN"
                                : "ASIGNACIÓN FIJA"
                        }
                    </strong>

                    <small>
                        ${escaparHTML(
                            disponibilidad.docente_nombre
                            || "Docente"
                        )}
                    </small>

                </div>

            </td>
        `;

    }


    /*
        --------------------------------------------------------
        RESERVA PUNTUAL
        --------------------------------------------------------
    */

    if (
        disponibilidad.tipo_ocupacion
        === "reserva"
    ) {

        const esMiReserva =
            usuarioActual
            && disponibilidad.usuario_id
            && String(
                disponibilidad.usuario_id
            )
            === String(
                usuarioActual.id
            );


        /*
            Si es nuestra reserva, permitimos acceder
            rápidamente a las opciones mientras la fecha
            no haya pasado.
        */

        if (esMiReserva) {

            const puedeModificar =
                !fechaYaPaso(
                    fechaISO
                );


            return `
                <td class="celda-mi-reserva">

                    <div class="estado-disponibilidad">

                        <strong>
                            MI RESERVA
                        </strong>

                        <small>
                            ${escaparHTML(
                                disponibilidad.docente_nombre
                                || perfilActual?.nombre
                                || "Docente"
                            )}
                        </small>

                        ${
                            puedeModificar
                                ? `
                                    <button
                                        type="button"
                                        class="btn-reservar-rapido"
                                        data-accion="abrir-mi-reserva"
                                        data-reserva-id="${disponibilidad.reserva_id}"
                                    >
                                        Opciones
                                    </button>
                                `
                                : ""
                        }

                    </div>

                </td>
            `;

        }


        return `
            <td class="celda-reservada">

                <div class="estado-disponibilidad">

                    <strong>
                        RESERVADO
                    </strong>

                    <small>
                        ${escaparHTML(
                            disponibilidad.docente_nombre
                            || "Docente"
                        )}
                    </small>

                </div>

            </td>
        `;

    }


    /*
        Fallback de seguridad.
    */

    return `
        <td class="celda-no-disponible">

            <div class="estado-disponibilidad">

                <strong>
                    OCUPADO
                </strong>

            </div>

        </td>
    `;

}



/* ============================================================
   50. EVENTOS DE LA TABLA DE DISPONIBILIDAD
   ============================================================ */

function configurarEventosTablaDisponibilidad() {

    const tabla =
        elemento(
            "tablaDisponibilidadDocente"
        );


    if (!tabla) {
        return;
    }


    /*
        Usamos delegación de eventos.

        Así no necesitamos volver a registrar eventos
        cada vez que la tabla se vuelve a dibujar.
    */

    tabla.addEventListener(
        "click",
        evento => {

            const boton =
                evento.target.closest(
                    "[data-accion]"
                );


            if (!boton) {
                return;
            }


            const accion =
                boton.dataset.accion;


            if (
                accion
                === "reservar-rapido"
            ) {

                abrirReservaRapida(
                    boton.dataset.espacioId,
                    boton.dataset.fecha,
                    boton.dataset.horario
                );

                return;

            }


            if (
                accion
                === "abrir-mi-reserva"
            ) {

                abrirMiReservaDesdeTabla(
                    boton.dataset.reservaId
                );

            }

        }
    );

}



/* ============================================================
   51. ABRIR RESERVA RÁPIDA
   ============================================================ */

function abrirReservaRapida(
    espacioId,
    fechaISO,
    horario
) {

    if (fechaYaPaso(fechaISO)) {

        mostrarMensajeGlobal(
            "No puedes reservar una fecha que ya pasó.",
            "error"
        );

        return;

    }


    const espacio =
        espaciosAulas.find(
            item =>
                String(item.id)
                === String(espacioId)
        );


    if (!espacio) {

        mostrarMensajeGlobal(
            "No se pudo identificar el aula o laboratorio.",
            "error"
        );

        return;

    }


    reservaRapidaSeleccionada = {
        espacioId:
            Number(espacioId),

        fecha:
            fechaISO,

        horario:
            horario
    };


    const campoEspacio =
        elemento(
            "reservaRapidaEspacio"
        );

    const campoFecha =
        elemento(
            "reservaRapidaFecha"
        );

    const campoHorario =
        elemento(
            "reservaRapidaHorario"
        );


    if (campoEspacio) {

        campoEspacio.textContent =
            espacio.nombre;

    }


    if (campoFecha) {

        campoFecha.textContent =
            formatearFechaLarga(
                fechaISO
            );

    }


    if (campoHorario) {

        campoHorario.textContent =
            nombreHorario(
                horario
            );

    }


    limpiarMensajeFormulario(
        "mensajeReservaRapida"
    );


    abrirModal(
        "modalReservaRapida"
    );

}



/* ============================================================
   52. CONFIRMAR RESERVA RÁPIDA
   ============================================================ */

async function confirmarReservaRapida() {

    if (!reservaRapidaSeleccionada) {

        mostrarMensajeFormulario(
            "mensajeReservaRapida",
            "No se pudo identificar la reserva.",
            "error"
        );

        return;

    }


    const {
        espacioId,
        fecha,
        horario
    } =
        reservaRapidaSeleccionada;


    if (fechaYaPaso(fecha)) {

        mostrarMensajeFormulario(
            "mensajeReservaRapida",
            "No puedes reservar una fecha que ya pasó.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnConfirmarReservaRapida"
        );


    try {

        if (boton) {

            boton.disabled = true;

            boton.textContent =
                "Reservando...";

        }


        limpiarMensajeFormulario(
            "mensajeReservaRapida"
        );


        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "crear_reserva_aula",
                {
                    p_espacio_id:
                        espacioId,

                    p_fecha:
                        fecha,

                    p_horario:
                        horario
                }
            );


        if (error) {
            throw error;
        }


        /*
            Invalidamos el caché porque la disponibilidad
            cambió después de crear la reserva.
        */

        disponibilidadSemana = {};


        reservaRapidaSeleccionada =
            null;


        cerrarModal(
            "modalReservaRapida"
        );


        mostrarMensajeGlobal(
            "Reserva realizada correctamente.",
            "exito"
        );


        /*
            Actualizamos tanto disponibilidad como
            las reservas personales.
        */

        await Promise.all([
            cargarDisponibilidadSemana(),
            cargarMisReservas()
        ]);


        return data;

    } catch (error) {

        console.error(
            "Error creando reserva:",
            error
        );


        /*
            Si otro docente reservó la misma aula unos
            segundos antes, la RPC de Supabase lo rechazará
            y aquí veremos ese mensaje.
        */

        mostrarMensajeFormulario(
            "mensajeReservaRapida",
            mensajeErrorSupabase(error),
            "error"
        );

    } finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "Confirmar reserva";

        }

    }

}



/* ============================================================
   53. BUSCAR MI RESERVA POR ID
   ============================================================ */

async function obtenerMiReservaPorId(
    reservaId
) {

    /*
        Primero intentamos encontrarla en el caché
        de "Mis reservas".
    */

    let reserva =
        misReservas.find(
            item =>
                String(item.id)
                === String(reservaId)
        );


    if (reserva) {
        return reserva;
    }


    /*
        Si todavía no hemos abierto la pestaña Mis reservas,
        hacemos una consulta puntual.
    */

    const {
        data,
        error
    } =
        await supabaseClient
            .from("reservas_aulas")
            .select(
                "id,gestion_id,espacio_id,usuario_id,fecha,horario,estado,created_at,updated_at"
            )
            .eq(
                "id",
                reservaId
            )
            .eq(
                "usuario_id",
                usuarioActual.id
            )
            .single();


    if (error) {
        throw error;
    }


    return data;

}



/* ============================================================
   54. ABRIR MI RESERVA DESDE LA TABLA
   ============================================================ */

async function abrirMiReservaDesdeTabla(
    reservaId
) {

    try {

        mostrarCargando(
            true,
            "Cargando reserva..."
        );


        const reserva =
            await obtenerMiReservaPorId(
                reservaId
            );


        mostrarCargando(false);


        if (!reserva) {

            mostrarMensajeGlobal(
                "No se encontró la reserva.",
                "error"
            );

            return;

        }


        /*
            Al tocar "Opciones" desde la tabla abrimos
            directamente la edición.

            Desde "Mis reservas" también tendrá
            Editar y Cancelar por separado.
        */

        abrirEditarReservaDocente(
            reserva
        );

    } catch (error) {

        mostrarCargando(false);


        console.error(
            "Error cargando reserva:",
            error
        );


        mostrarMensajeGlobal(
            mensajeErrorSupabase(error),
            "error"
        );

    }

}



/* ============================================================
   55. EVENTOS DE RESERVA RÁPIDA
   ============================================================ */

function configurarEventosReservaRapida() {

    elemento(
        "btnConfirmarReservaRapida"
    )?.addEventListener(
        "click",
        confirmarReservaRapida
    );

}
/* ============================================================
   56. CARGAR MIS RESERVAS
   ============================================================ */

async function cargarMisReservas() {

    if (
        !usuarioActual
        || !usuarioActual.id
    ) {
        return;
    }


    const tbody =
        elemento("tablaMisReservas");


    if (tbody) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="tabla-cargando"
                >
                    Cargando tus reservas...
                </td>
            </tr>
        `;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("reservas_aulas")
                .select(
                    "id,gestion_id,espacio_id,usuario_id,fecha,horario,estado,created_at,updated_at"
                )
                .eq(
                    "usuario_id",
                    usuarioActual.id
                )
                .order(
                    "fecha",
                    {
                        ascending: false
                    }
                )
                .order(
                    "horario",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        misReservas =
            data || [];


        /*
            Necesitamos los nombres de las aulas/laboratorios
            para mostrar correctamente la tabla.
        */

        if (espaciosAulas.length === 0) {

            await cargarEspacios();

        }


        renderizarMisReservas();


        return misReservas;

    } catch (error) {

        console.error(
            "Error cargando mis reservas:",
            error
        );


        if (tbody) {

            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="tabla-vacia"
                    >
                        No se pudieron cargar tus reservas.
                    </td>
                </tr>
            `;

        }


        mostrarMensajeGlobal(
            mensajeErrorSupabase(error),
            "error"
        );


        return [];

    }

}



/* ============================================================
   57. BUSCAR ESPACIO POR ID
   ============================================================ */

function obtenerEspacioPorId(
    espacioId
) {

    return espaciosAulas.find(
        espacio =>
            String(espacio.id)
            === String(espacioId)
    ) || null;

}



/* ============================================================
   58. RENDERIZAR MIS RESERVAS
   ============================================================ */

function renderizarMisReservas() {

    const tbody =
        elemento("tablaMisReservas");


    if (!tbody) {
        return;
    }


    if (misReservas.length === 0) {

        tbody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="tabla-vacia"
                >
                    Todavía no realizaste ninguna reserva.
                </td>

            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        misReservas
            .map(reserva => {

                const espacio =
                    obtenerEspacioPorId(
                        reserva.espacio_id
                    );


                const nombreEspacio =
                    espacio
                        ? espacio.nombre
                        : `Espacio #${reserva.espacio_id}`;


                const tipoEspacio =
                    espacio
                        ? nombreTipoEspacio(
                            espacio.tipo
                        )
                        : "-";


                const pasada =
                    fechaYaPaso(
                        reserva.fecha
                    );


                const activa =
                    reserva.estado
                    === "reservada";


                /*
                    El mismo día NO se considera pasado.
                    Por tanto puede editar/cancelar hoy.
                */

                const puedeModificar =
                    activa
                    && !pasada;


                let estadoHTML = "";


                if (
                    reserva.estado
                    === "cancelada"
                ) {

                    estadoHTML = `
                        <span class="estado-tabla estado-cancelado">
                            Cancelada
                        </span>
                    `;

                } else if (pasada) {

                    estadoHTML = `
                        <span class="estado-tabla estado-finalizado">
                            Finalizada
                        </span>
                    `;

                } else {

                    estadoHTML = `
                        <span class="estado-tabla estado-activo">
                            Reservada
                        </span>
                    `;

                }


                let accionesHTML = `
                    <span class="texto-sin-acciones">
                        -
                    </span>
                `;


                if (puedeModificar) {

                    accionesHTML = `
                        <div class="acciones-inline">

                            <button
                                type="button"
                                class="btn-secundario"
                                data-accion-reserva="editar"
                                data-reserva-id="${reserva.id}"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                class="btn-peligro"
                                data-accion-reserva="cancelar"
                                data-reserva-id="${reserva.id}"
                            >
                                Cancelar
                            </button>

                        </div>
                    `;

                }


                return `
                    <tr>

                        <td>
                            <strong>
                                ${escaparHTML(
                                    formatearFecha(
                                        reserva.fecha
                                    )
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escaparHTML(
                                nombreEspacio
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                tipoEspacio
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                nombreHorario(
                                    reserva.horario
                                )
                            )}
                        </td>

                        <td>
                            ${estadoHTML}
                        </td>

                        <td>
                            ${accionesHTML}
                        </td>

                    </tr>
                `;

            })
            .join("");

}



/* ============================================================
   59. OBTENER RESERVA DEL CACHÉ
   ============================================================ */

function obtenerReservaCache(
    reservaId
) {

    return misReservas.find(
        reserva =>
            String(reserva.id)
            === String(reservaId)
    ) || null;

}



/* ============================================================
   60. ABRIR EDICIÓN DE RESERVA
   ============================================================ */

async function abrirEditarReservaDocente(
    reserva
) {

    if (!reserva) {

        mostrarMensajeGlobal(
            "No se pudo identificar la reserva.",
            "error"
        );

        return;

    }


    if (
        reserva.estado
        !== "reservada"
    ) {

        mostrarMensajeGlobal(
            "Esta reserva ya no está activa.",
            "error"
        );

        return;

    }


    if (
        fechaYaPaso(
            reserva.fecha
        )
    ) {

        mostrarMensajeGlobal(
            "Una reserva pasada ya no puede modificarse.",
            "error"
        );

        return;

    }


    /*
        Nos aseguramos de tener disponibles
        los espacios activos.
    */

    if (espaciosAulas.length === 0) {

        await cargarEspacios();

    }


    llenarSelectoresEspacios();


    elemento(
        "editarReservaDocenteId"
    ).value =
        reserva.id;


    elemento(
        "editarReservaDocenteEspacio"
    ).value =
        reserva.espacio_id;


    elemento(
        "editarReservaDocenteFecha"
    ).value =
        reserva.fecha;


    elemento(
        "editarReservaDocenteHorario"
    ).value =
        reserva.horario;


    /*
        Impedimos elegir manualmente una fecha
        anterior a hoy desde el navegador.
    */

    elemento(
        "editarReservaDocenteFecha"
    ).min =
        obtenerFechaHoyISO();


    limpiarMensajeFormulario(
        "mensajeEditarReservaDocente"
    );


    abrirModal(
        "modalEditarReservaDocente"
    );

}



/* ============================================================
   61. GUARDAR EDICIÓN DE RESERVA
   ============================================================ */

async function guardarEdicionReservaDocente(
    evento
) {

    evento.preventDefault();


    const reservaId =
        elemento(
            "editarReservaDocenteId"
        )?.value;


    const espacioId =
        elemento(
            "editarReservaDocenteEspacio"
        )?.value;


    const fecha =
        elemento(
            "editarReservaDocenteFecha"
        )?.value;


    const horario =
        elemento(
            "editarReservaDocenteHorario"
        )?.value;


    if (
        !reservaId
        || !espacioId
        || !fecha
        || !horario
    ) {

        mostrarMensajeFormulario(
            "mensajeEditarReservaDocente",
            "Completa todos los datos de la reserva.",
            "error"
        );

        return;

    }


    if (fechaYaPaso(fecha)) {

        mostrarMensajeFormulario(
            "mensajeEditarReservaDocente",
            "No puedes mover la reserva a una fecha pasada.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnGuardarEdicionReservaDocente"
        );


    try {

        if (boton) {

            boton.disabled = true;

            boton.textContent =
                "Guardando...";

        }


        limpiarMensajeFormulario(
            "mensajeEditarReservaDocente"
        );


        const {
            error
        } =
            await supabaseClient.rpc(
                "editar_reserva_aula",
                {
                    p_reserva_id:
                        Number(reservaId),

                    p_espacio_id:
                        Number(espacioId),

                    p_fecha:
                        fecha,

                    p_horario:
                        horario
                }
            );


        if (error) {
            throw error;
        }


        cerrarModal(
            "modalEditarReservaDocente"
        );


        disponibilidadSemana = {};


        mostrarMensajeGlobal(
            "Reserva actualizada correctamente.",
            "exito"
        );


        /*
            Recargamos ambas vistas porque la reserva
            pudo cambiar de aula, fecha o turno.
        */

        await Promise.all([
            cargarMisReservas(),
            cargarDisponibilidadSemana()
        ]);

    } catch (error) {

        console.error(
            "Error editando reserva:",
            error
        );


        mostrarMensajeFormulario(
            "mensajeEditarReservaDocente",
            mensajeErrorSupabase(error),
            "error"
        );

    } finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "Guardar cambios";

        }

    }

}



/* ============================================================
   62. ABRIR CANCELACIÓN DE RESERVA
   ============================================================ */

function abrirCancelarReservaDocente(
    reserva
) {

    if (!reserva) {

        mostrarMensajeGlobal(
            "No se pudo identificar la reserva.",
            "error"
        );

        return;

    }


    if (
        reserva.estado
        !== "reservada"
    ) {

        mostrarMensajeGlobal(
            "Esta reserva ya está cancelada.",
            "error"
        );

        return;

    }


    if (
        fechaYaPaso(
            reserva.fecha
        )
    ) {

        mostrarMensajeGlobal(
            "Una reserva pasada ya no puede cancelarse.",
            "error"
        );

        return;

    }


    const espacio =
        obtenerEspacioPorId(
            reserva.espacio_id
        );


    const nombreEspacio =
        espacio
            ? espacio.nombre
            : `Espacio #${reserva.espacio_id}`;


    elemento(
        "cancelarReservaDocenteId"
    ).value =
        reserva.id;


    const detalle =
        elemento(
            "detalleCancelarReservaDocente"
        );


    if (detalle) {

        detalle.innerHTML = `

            <div class="detalle-reserva-rapida">

                <span>
                    Espacio
                </span>

                <strong>
                    ${escaparHTML(nombreEspacio)}
                </strong>

            </div>


            <div class="detalle-reserva-rapida">

                <span>
                    Fecha
                </span>

                <strong>
                    ${escaparHTML(
                        formatearFechaLarga(
                            reserva.fecha
                        )
                    )}
                </strong>

            </div>


            <div class="detalle-reserva-rapida">

                <span>
                    Horario
                </span>

                <strong>
                    ${escaparHTML(
                        nombreHorario(
                            reserva.horario
                        )
                    )}
                </strong>

            </div>
        `;

    }


    limpiarMensajeFormulario(
        "mensajeCancelarReservaDocente"
    );


    abrirModal(
        "modalCancelarReservaDocente"
    );

}



/* ============================================================
   63. CONFIRMAR CANCELACIÓN
   ============================================================ */

async function confirmarCancelarReservaDocente() {

    const reservaId =
        elemento(
            "cancelarReservaDocenteId"
        )?.value;


    if (!reservaId) {

        mostrarMensajeFormulario(
            "mensajeCancelarReservaDocente",
            "No se pudo identificar la reserva.",
            "error"
        );

        return;

    }


    const reserva =
        obtenerReservaCache(
            reservaId
        );


    /*
        Si está en caché hacemos también la validación
        en el navegador.

        La RPC volverá a comprobarlo en el servidor.
    */

    if (
        reserva
        && fechaYaPaso(
            reserva.fecha
        )
    ) {

        mostrarMensajeFormulario(
            "mensajeCancelarReservaDocente",
            "Una reserva pasada ya no puede cancelarse.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnConfirmarCancelarReservaDocente"
        );


    try {

        if (boton) {

            boton.disabled = true;

            boton.textContent =
                "Cancelando...";

        }


        limpiarMensajeFormulario(
            "mensajeCancelarReservaDocente"
        );


        const {
            error
        } =
            await supabaseClient.rpc(
                "cancelar_reserva_aula",
                {
                    p_reserva_id:
                        Number(reservaId)
                }
            );


        if (error) {
            throw error;
        }


        cerrarModal(
            "modalCancelarReservaDocente"
        );


        disponibilidadSemana = {};


        mostrarMensajeGlobal(
            "Reserva cancelada correctamente.",
            "exito"
        );


        await Promise.all([
            cargarMisReservas(),
            cargarDisponibilidadSemana()
        ]);

    } catch (error) {

        console.error(
            "Error cancelando reserva:",
            error
        );


        mostrarMensajeFormulario(
            "mensajeCancelarReservaDocente",
            mensajeErrorSupabase(error),
            "error"
        );

    } finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "Sí, cancelar reserva";

        }

    }

}



/* ============================================================
   64. EVENTOS DE LA TABLA MIS RESERVAS
   ============================================================ */

function configurarEventosMisReservas() {

    const tabla =
        elemento(
            "tablaMisReservas"
        );


    if (tabla) {

        tabla.addEventListener(
            "click",
            evento => {

                const boton =
                    evento.target.closest(
                        "[data-accion-reserva]"
                    );


                if (!boton) {
                    return;
                }


                const reserva =
                    obtenerReservaCache(
                        boton.dataset.reservaId
                    );


                if (!reserva) {

                    mostrarMensajeGlobal(
                        "No se pudo identificar la reserva.",
                        "error"
                    );

                    return;

                }


                const accion =
                    boton.dataset
                        .accionReserva;


                if (accion === "editar") {

                    abrirEditarReservaDocente(
                        reserva
                    );

                    return;

                }


                if (accion === "cancelar") {

                    abrirCancelarReservaDocente(
                        reserva
                    );

                }

            }
        );

    }


    elemento(
        "btnActualizarMisReservas"
    )?.addEventListener(
        "click",
        cargarMisReservas
    );


    elemento(
        "formEditarReservaDocente"
    )?.addEventListener(
        "submit",
        guardarEdicionReservaDocente
    );


    elemento(
        "btnConfirmarCancelarReservaDocente"
    )?.addEventListener(
        "click",
        confirmarCancelarReservaDocente
    );

}
/* ============================================================
   65. ENVIAR OBSERVACIÓN
   ============================================================ */

async function enviarObservacion(evento) {

    evento.preventDefault();


    const espacioId =
        elemento("observacionEspacio")
            ?.value;


    const texto =
        elemento("observacionTexto")
            ?.value
            ?.trim();


    /*
        Validaciones básicas.
    */

    if (!espacioId) {

        mostrarMensajeFormulario(
            "mensajeObservacion",
            "Selecciona un aula o laboratorio.",
            "error"
        );

        return;

    }


    if (!texto) {

        mostrarMensajeFormulario(
            "mensajeObservacion",
            "Escribe la observación que deseas enviar.",
            "error"
        );

        return;

    }


    if (texto.length > 1000) {

        mostrarMensajeFormulario(
            "mensajeObservacion",
            "La observación es demasiado larga.",
            "error"
        );

        return;

    }


    const boton =
        elemento("btnEnviarObservacion");


    try {

        if (boton) {

            boton.disabled = true;

            boton.textContent =
                "Enviando...";

        }


        limpiarMensajeFormulario(
            "mensajeObservacion"
        );


        /*
            La RPC identifica automáticamente al docente
            mediante auth.uid().

            Por tanto NO enviamos usuario_id desde
            el navegador.
        */

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "crear_observacion_aula",
                {
                    p_espacio_id:
                        Number(espacioId),

                    p_observacion:
                        texto
                }
            );


        if (error) {
            throw error;
        }


        /*
            Limpiamos el formulario.
        */

        const formulario =
            elemento("formObservacion");


        if (formulario) {

            formulario.reset();

        }


        mostrarMensajeFormulario(
            "mensajeObservacion",
            "Observación enviada correctamente.",
            "exito"
        );


        mostrarMensajeGlobal(
            "Observación enviada al administrador.",
            "exito"
        );


        return data;

    } catch (error) {

        console.error(
            "Error enviando observación:",
            error
        );


        mostrarMensajeFormulario(
            "mensajeObservacion",
            mensajeErrorSupabase(error),
            "error"
        );

    } finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "Enviar observación";

        }

    }

}



/* ============================================================
   66. EVENTOS DE OBSERVACIONES
   ============================================================ */

function configurarEventosObservaciones() {

    elemento(
        "formObservacion"
    )?.addEventListener(
        "submit",
        enviarObservacion
    );

}



/* ============================================================
   67. PREPARAR INTERFAZ INICIAL
   ============================================================ */

function prepararInterfazInicial() {

    /*
        Aplicamos primero el modo guardado para evitar
        que la página aparezca clara durante un instante
        y luego cambie a oscuro.
    */

    aplicarModoGuardado();


    /*
        Calculamos la semana actual.
    */

    inicializarSemana();


    /*
        Mañana será siempre el turno inicial.
    */

    turnoActual =
        HORARIOS_AULAS.MANANA;


    cambiarTurno(
        turnoActual
    );


    /*
        La pestaña inicial será Reservar.
    */

    document
        .querySelectorAll(".btn-tab")
        .forEach(boton => {

            if (!boton.dataset.tab) {
                return;
            }


            boton.classList.toggle(
                "activo",
                boton.dataset.tab
                    === "reservar"
            );

        });


    document
        .querySelectorAll(".seccion-tab")
        .forEach(seccion => {

            seccion.classList.toggle(
                "activa",
                seccion.id
                    === "tab-reservar"
            );

        });

}



/* ============================================================
   68. CONFIGURAR TODOS LOS EVENTOS
   ============================================================ */

function configurarTodosLosEventos() {

    configurarEventosGenerales();

    configurarPestanasPrincipales();

    configurarEventosTurnos();

    configurarEventosSemana();

    configurarEventosModales();

    configurarEventosTablaDisponibilidad();

    configurarEventosReservaRapida();

    configurarEventosMisReservas();

    configurarEventosObservaciones();

}



/* ============================================================
   69. CARGAR DATOS INICIALES
   ============================================================ */

async function cargarDatosInicialesDocente() {

    try {

        mostrarCargando(
            true,
            "Cargando aulas y laboratorios..."
        );


        /*
            Primero necesitamos los espacios porque son
            utilizados tanto por la tabla como por
            reservas y observaciones.
        */

        await cargarEspacios();


        /*
            Después cargamos en paralelo:
            - disponibilidad semanal
            - reservas personales
        */

        await Promise.all([

            cargarDisponibilidadSemana(),

            cargarMisReservas()

        ]);


        mostrarCargando(false);

    } catch (error) {

        mostrarCargando(false);


        console.error(
            "Error cargando panel docente:",
            error
        );


        mostrarMensajeGlobal(
            "No se pudieron cargar todos los datos del panel.",
            "error"
        );

    }

}



/* ============================================================
   70. CONTROLAR CAMBIOS DE AUTENTICACIÓN
   ============================================================ */

function configurarControlAutenticacion() {

    supabaseClient.auth
        .onAuthStateChange(
            (
                evento,
                sesion
            ) => {

                /*
                    Si la sesión desaparece mientras el usuario
                    tiene abierto el panel, regresamos al login.
                */

                if (
                    evento === "SIGNED_OUT"
                    || !sesion
                ) {

                    window.location.href =
                        "index.html";

                }

            }
        );

}



/* ============================================================
   71. MOSTRAR ERROR CRÍTICO
   ============================================================ */

function mostrarErrorCritico(error) {

    console.error(
        "Error crítico en panel docente:",
        error
    );


    mostrarCargando(false);


    const tbodyDisponibilidad =
        elemento(
            "tablaDisponibilidadDocente"
        );


    if (tbodyDisponibilidad) {

        tbodyDisponibilidad.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="tabla-vacia"
                >
                    No se pudo iniciar correctamente
                    el panel docente.
                </td>

            </tr>
        `;

    }


    mostrarMensajeGlobal(
        "No se pudo iniciar el panel docente.",
        "error"
    );

}



/* ============================================================
   72. INICIAR PANEL DOCENTE
   ============================================================ */

async function iniciarPanelDocente() {

    try {

        /*
            1. Verificamos primero que exista sesión y
               que realmente sea un docente activo.
        */

        const autorizado =
            await comprobarDocente();


        if (!autorizado) {
            return;
        }


        /*
            2. Preparamos interfaz.
        */

        prepararInterfazInicial();


        /*
            3. Registramos eventos.
        */

        configurarTodosLosEventos();


        /*
            4. Vigilamos la sesión.
        */

        configurarControlAutenticacion();


        /*
            5. Cargamos datos.
        */

        await cargarDatosInicialesDocente();


        console.log(
            "Panel docente de reservas de aulas iniciado correctamente."
        );

    } catch (error) {

        mostrarErrorCritico(
            error
        );

    }

}



/* ============================================================
   73. INICIO
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    iniciarPanelDocente
);
