// ============================================================
// CETA - RESERVAS DE AULAS Y LABORATORIOS
// PANEL ADMINISTRADOR
// ============================================================

"use strict";


// ============================================================
// 1. CONFIGURACIÓN GENERAL
// ============================================================

const HORARIOS_AULAS = [
    "09:00-12:00",
    "14:00-17:00",
    "19:00-21:30"
];


const DIAS_AULAS = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes"
};


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


// ============================================================
// 2. ESTADO DEL PANEL
// ============================================================

let usuarioActual = null;
let perfilActual = null;

let espaciosAulas = [];
let gestionesAulas = [];
let docentesAulas = [];
let asignacionesAulas = [];
let observacionesAulas = [];

let gestionSeleccionadaId = null;

let lunesSemanaActual = null;


// ============================================================
// 3. ACCESO RÁPIDO A ELEMENTOS
// ============================================================

function elemento(id) {

    return document.getElementById(id);

}



// ============================================================
// 4. ESCAPAR HTML
//
// Evita insertar directamente texto procedente de la base
// de datos dentro del HTML.
// ============================================================

function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }


    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}



// ============================================================
// 5. FECHAS
// ============================================================

function fechaLocalISO(fecha) {

    const anio =
        fecha.getFullYear();

    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            fecha.getDate()
        ).padStart(2, "0");


    return `${anio}-${mes}-${dia}`;

}


function crearFechaLocal(fechaISO) {

    if (!fechaISO) {
        return null;
    }


    const partes =
        fechaISO.split("-");


    if (partes.length !== 3) {
        return null;
    }


    const anio =
        Number(partes[0]);

    const mes =
        Number(partes[1]) - 1;

    const dia =
        Number(partes[2]);


    return new Date(
        anio,
        mes,
        dia,
        12,
        0,
        0
    );

}


function sumarDias(fecha, cantidad) {

    const nueva =
        new Date(fecha);


    nueva.setDate(
        nueva.getDate() + cantidad
    );


    return nueva;

}


function obtenerLunes(fecha) {

    const resultado =
        new Date(fecha);


    resultado.setHours(
        12,
        0,
        0,
        0
    );


    const dia =
        resultado.getDay();


    const diferencia =
        dia === 0
            ? -6
            : 1 - dia;


    resultado.setDate(
        resultado.getDate() + diferencia
    );


    return resultado;

}


function formatearFecha(fechaISO) {

    const fecha =
        crearFechaLocal(fechaISO);


    if (!fecha) {
        return "—";
    }


    return (
        String(fecha.getDate())
            .padStart(2, "0")
        +
        "/"
        +
        String(fecha.getMonth() + 1)
            .padStart(2, "0")
        +
        "/"
        +
        fecha.getFullYear()
    );

}


function formatearFechaLarga(fechaISO) {

    const fecha =
        crearFechaLocal(fechaISO);


    if (!fecha) {
        return "—";
    }


    return (
        `${fecha.getDate()} de `
        +
        `${MESES_AULAS[fecha.getMonth()]} de `
        +
        `${fecha.getFullYear()}`
    );

}


function obtenerFechasSemana() {

    if (!lunesSemanaActual) {

        lunesSemanaActual =
            obtenerLunes(
                new Date()
            );

    }


    return [
        new Date(lunesSemanaActual),
        sumarDias(lunesSemanaActual, 1),
        sumarDias(lunesSemanaActual, 2),
        sumarDias(lunesSemanaActual, 3),
        sumarDias(lunesSemanaActual, 4)
    ];

}



// ============================================================
// 6. NOMBRES Y FORMATOS
// ============================================================

function nombreTipoEspacio(tipo) {

    if (tipo === "laboratorio") {
        return "Laboratorio";
    }


    return "Aula";

}


function nombreDia(numeroDia) {

    return (
        DIAS_AULAS[
            Number(numeroDia)
        ]
        ||
        "—"
    );

}


function formatoHorario(horario) {

    if (!horario) {
        return "—";
    }


    return horario.replace(
        "-",
        " - "
    );

}



// ============================================================
// 7. MENSAJES DE FORMULARIOS
// ============================================================

function mostrarMensajeFormulario(
    idElemento,
    mensaje,
    tipo = "error"
) {

    const destino =
        elemento(idElemento);


    if (!destino) {
        return;
    }


    destino.textContent =
        mensaje || "";


    destino.className =
        "mensaje-formulario";


    if (!mensaje) {
        return;
    }


    destino.classList.add(
        `mensaje-${tipo}`
    );

}



// ============================================================
// 8. MENSAJE GLOBAL
// ============================================================

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


    contenedor.textContent =
        mensaje;


    contenedor.className =
        `mensaje-global visible mensaje-global-${tipo}`;


    temporizadorMensajeGlobal =
        setTimeout(
            () => {

                contenedor.classList.remove(
                    "visible"
                );

            },
            3500
        );

}



// ============================================================
// 9. CARGANDO GLOBAL
// ============================================================

function mostrarCargando(
    mostrar = true
) {

    const cargando =
        elemento("cargandoGlobal");


    if (!cargando) {
        return;
    }


    if (mostrar) {

        cargando.classList.remove(
            "oculto"
        );

    }
    else {

        cargando.classList.add(
            "oculto"
        );

    }

}



// ============================================================
// 10. MODALES
// ============================================================

function abrirModal(idModal) {

    const modal =
        elemento(idModal);


    if (!modal) {
        return;
    }


    modal.classList.add(
        "abierto"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-abierto"
    );

}


function cerrarModal(idModal) {

    const modal =
        elemento(idModal);


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "abierto"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    const algunModalAbierto =
        document.querySelector(
            ".modal.abierto"
        );


    if (!algunModalAbierto) {

        document.body.classList.remove(
            "modal-abierto"
        );

    }

}


function configurarCierreModales() {

    document
        .querySelectorAll(
            "[data-cerrar-modal]"
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        const idModal =
                            boton.dataset
                                .cerrarModal;


                        cerrarModal(
                            idModal
                        );

                    }
                );

            }
        );


    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Escape") {
                return;
            }


            document
                .querySelectorAll(
                    ".modal.abierto"
                )
                .forEach(
                    (modal) => {

                        cerrarModal(
                            modal.id
                        );

                    }
                );

        }
    );

}



// ============================================================
// 11. COMPROBAR SESIÓN Y PERFIL
// ============================================================

async function comprobarAdministrador() {

    const {
        data: sessionData,
        error: sessionError
    } = await supabaseClient.auth
        .getSession();


    if (
        sessionError ||
        !sessionData?.session?.user
    ) {

        window.location.href =
            "index.html";

        return false;

    }


    usuarioActual =
        sessionData.session.user;


    const {
        data: perfil,
        error: perfilError
    } = await supabaseClient
        .from("perfiles")
        .select(
            `
            id,
            usuario,
            nombre,
            rol,
            activo
            `
        )
        .eq(
            "id",
            usuarioActual.id
        )
        .single();


    if (
        perfilError ||
        !perfil
    ) {

        console.error(
            "Error obteniendo perfil:",
            perfilError
        );


        await supabaseClient.auth
            .signOut();


        window.location.href =
            "index.html";

        return false;

    }


    if (
        perfil.activo !== true ||
        perfil.rol !== "administrador"
    ) {

        await supabaseClient.auth
            .signOut();


        window.location.href =
            "index.html";

        return false;

    }


    perfilActual =
        perfil;


    const nombreAdministrador =
        elemento(
            "nombreAdministrador"
        );


    if (nombreAdministrador) {

        nombreAdministrador.textContent =
            perfil.nombre
            ||
            perfil.usuario
            ||
            "Administrador";

    }


    return true;

}



// ============================================================
// 12. CERRAR SESIÓN
// ============================================================

async function cerrarSesion() {

    const boton =
        elemento("btnCerrarSesion");


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "Cerrando...";

    }


    try {

        await supabaseClient.auth
            .signOut();

    }
    catch (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );

    }


    window.location.href =
        "index.html";

}



// ============================================================
// 13. PESTAÑAS
// ============================================================

function activarTab(nombreTab) {

    document
        .querySelectorAll(
            ".btn-tab"
        )
        .forEach(
            (boton) => {

                boton.classList.toggle(
                    "activo",
                    boton.dataset.tab ===
                    nombreTab
                );

            }
        );


    document
        .querySelectorAll(
            ".seccion-tab"
        )
        .forEach(
            (seccion) => {

                seccion.classList.remove(
                    "activa"
                );

            }
        );


    const seccion =
        elemento(
            `tab-${nombreTab}`
        );


    if (seccion) {

        seccion.classList.add(
            "activa"
        );

    }


    // --------------------------------------------------------
    // RECARGAR DATOS SEGÚN PESTAÑA
    // --------------------------------------------------------

    if (nombreTab === "reservas") {

        cargarVistaSemanal()
            .catch(
                (error) => {

                    console.error(error);

                    mostrarMensajeGlobal(
                        error.message,
                        "error"
                    );

                }
            );

    }


    if (nombreTab === "espacios") {

        cargarEspacios()
            .catch(
                (error) => {

                    console.error(error);

                    mostrarMensajeGlobal(
                        error.message,
                        "error"
                    );

                }
            );

    }


    if (nombreTab === "gestion") {

        cargarDatosGestion()
            .catch(
                (error) => {

                    console.error(error);

                    mostrarMensajeGlobal(
                        error.message,
                        "error"
                    );

                }
            );

    }


    if (nombreTab === "observaciones") {

        cargarObservaciones()
            .catch(
                (error) => {

                    console.error(error);

                    mostrarMensajeGlobal(
                        error.message,
                        "error"
                    );

                }
            );

    }

}


function configurarTabs() {

    document
        .querySelectorAll(
            ".btn-tab[data-tab]"
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        activarTab(
                            boton.dataset.tab
                        );

                    }
                );

            }
        );

}



// ============================================================
// 14. MODO OSCURO
// ============================================================

function actualizarIconoModo() {

    const boton =
        elemento("btnModoOscuro");


    if (!boton) {
        return;
    }


    const oscuro =
        document.body.classList
            .contains(
                "modo-oscuro"
            );


    boton.textContent =
        oscuro
            ? "☀️"
            : "🌙";


    boton.title =
        oscuro
            ? "Activar modo claro"
            : "Activar modo oscuro";

}


function cargarModoGuardado() {

    const modo =
        localStorage.getItem(
            "ceta-aulas-modo"
        );


    if (modo === "oscuro") {

        document.body.classList.add(
            "modo-oscuro"
        );

    }


    actualizarIconoModo();

}


function alternarModoOscuro() {

    const oscuro =
        document.body.classList
            .toggle(
                "modo-oscuro"
            );


    localStorage.setItem(
        "ceta-aulas-modo",
        oscuro
            ? "oscuro"
            : "claro"
    );


    actualizarIconoModo();

}



// ============================================================
// 15. CONFIGURAR SEMANA INICIAL
// ============================================================

function configurarSemanaInicial() {

    lunesSemanaActual =
        obtenerLunes(
            new Date()
        );


    const fechaSemana =
        elemento("fechaSemana");


    if (fechaSemana) {

        fechaSemana.value =
            fechaLocalISO(
                lunesSemanaActual
            );

    }


    actualizarTextoSemana();

}


function actualizarTextoSemana() {

    if (!lunesSemanaActual) {
        return;
    }


    const viernes =
        sumarDias(
            lunesSemanaActual,
            4
        );


    const texto =
        elemento("textoSemana");


    if (texto) {

        texto.textContent =
            `${formatearFechaLarga(
                fechaLocalISO(
                    lunesSemanaActual
                )
            )} — ${formatearFechaLarga(
                fechaLocalISO(
                    viernes
                )
            )}`;

    }


    actualizarCabecerasSemana();

}



// ============================================================
// 16. CABECERAS DE LAS TABLAS
// ============================================================

function actualizarCabecerasSemana() {

    const fechas =
        obtenerFechasSemana();


    const configuracion = [

        {
            prefijo: "manana",
            nombres: [
                "lunes",
                "martes",
                "miercoles",
                "jueves",
                "viernes"
            ]
        },

        {
            prefijo: "tarde",
            nombres: [
                "lunes",
                "martes",
                "miercoles",
                "jueves",
                "viernes"
            ]
        },

        {
            prefijo: "noche",
            nombres: [
                "lunes",
                "martes",
                "miercoles",
                "jueves",
                "viernes"
            ]
        }

    ];


    configuracion.forEach(
        (grupo) => {

            grupo.nombres.forEach(
                (nombre, indice) => {

                    const cabecera =
                        elemento(
                            `cabecera-${grupo.prefijo}-${nombre}`
                        );


                    if (!cabecera) {
                        return;
                    }


                    const fecha =
                        fechas[indice];


                    cabecera.innerHTML =
                        `
                        <span>
                            ${nombreDia(indice + 1)}
                        </span>

                        <small>
                            ${String(
                                fecha.getDate()
                            ).padStart(2, "0")}/${String(
                                fecha.getMonth() + 1
                            ).padStart(2, "0")}
                        </small>
                        `;

                }
            );

        }
    );

}



// ============================================================
// 17. EVENTOS DE SEMANA
// ============================================================

function configurarEventosSemana() {

    elemento(
        "btnSemanaAnterior"
    )?.addEventListener(
        "click",
        async () => {

            lunesSemanaActual =
                sumarDias(
                    lunesSemanaActual,
                    -7
                );


            elemento(
                "fechaSemana"
            ).value =
                fechaLocalISO(
                    lunesSemanaActual
                );


            actualizarTextoSemana();

            await cargarVistaSemanal();

        }
    );


    elemento(
        "btnSemanaSiguiente"
    )?.addEventListener(
        "click",
        async () => {

            lunesSemanaActual =
                sumarDias(
                    lunesSemanaActual,
                    7
                );


            elemento(
                "fechaSemana"
            ).value =
                fechaLocalISO(
                    lunesSemanaActual
                );


            actualizarTextoSemana();

            await cargarVistaSemanal();

        }
    );


    elemento(
        "btnSemanaActual"
    )?.addEventListener(
        "click",
        async () => {

            lunesSemanaActual =
                obtenerLunes(
                    new Date()
                );


            elemento(
                "fechaSemana"
            ).value =
                fechaLocalISO(
                    lunesSemanaActual
                );


            actualizarTextoSemana();

            await cargarVistaSemanal();

        }
    );


    elemento(
        "fechaSemana"
    )?.addEventListener(
        "change",
        async (event) => {

            if (!event.target.value) {
                return;
            }


            const fecha =
                crearFechaLocal(
                    event.target.value
                );


            if (!fecha) {
                return;
            }


            lunesSemanaActual =
                obtenerLunes(
                    fecha
                );


            event.target.value =
                fechaLocalISO(
                    lunesSemanaActual
                );


            actualizarTextoSemana();

            await cargarVistaSemanal();

        }
    );


    elemento(
        "btnActualizarReservas"
    )?.addEventListener(
        "click",
        async () => {

            await cargarVistaSemanal();

        }
    );


    elemento(
        "btnRecargarListadoReservas"
    )?.addEventListener(
        "click",
        async () => {

            await cargarReservasSemana();

        }
    );

}



// ============================================================
// 18. CONTROL DE ERRORES DE SUPABASE
// ============================================================

function mensajeErrorSupabase(
    error,
    mensajeAlternativo =
        "Ocurrió un error."
) {

    console.error(
        "Supabase:",
        error
    );


    if (!error) {
        return mensajeAlternativo;
    }


    if (error.message) {

        return error.message;

    }


    return mensajeAlternativo;

}



// ============================================================
// 19. CONFIGURAR EVENTOS GENERALES
// ============================================================

function configurarEventosGenerales() {

    elemento(
        "btnCerrarSesion"
    )?.addEventListener(
        "click",
        cerrarSesion
    );


    elemento(
        "btnModoOscuro"
    )?.addEventListener(
        "click",
        alternarModoOscuro
    );


    configurarTabs();

    configurarCierreModales();

    configurarEventosSemana();

}



// ============================================================
// 20. INICIO DEL PANEL
//
// La función iniciarPanelAdministrador() se completará
// al final del archivo después de incorporar todos los
// módulos.
// ============================================================
// ============================================================
// 21. CARGAR ESPACIOS
// ============================================================

async function cargarEspacios() {

    const {
        data,
        error
    } = await supabaseClient
        .from("espacios_aulas")
        .select(
            `
            id,
            tipo,
            nombre,
            activo,
            created_at,
            updated_at
            `
        )
        .order(
            "tipo",
            {
                ascending: true
            }
        )
        .order(
            "nombre",
            {
                ascending: true
            }
        );


    if (error) {

        throw new Error(
            mensajeErrorSupabase(
                error,
                "No se pudieron cargar las aulas y laboratorios."
            )
        );

    }


    espaciosAulas =
        Array.isArray(data)
            ? data
            : [];


    renderizarEspacios();

    actualizarResumenEspacios();

    llenarSelectoresEspacios();

    llenarFiltroObservacionesEspacios();

}



// ============================================================
// 22. RENDERIZAR TABLA DE ESPACIOS
// ============================================================

function renderizarEspacios() {

    const tabla =
        elemento("tablaEspacios");


    if (!tabla) {
        return;
    }


    if (espaciosAulas.length === 0) {

        tabla.innerHTML =
            `
            <tr>
                <td
                    colspan="4"
                    class="tabla-vacia"
                >
                    No existen aulas o laboratorios registrados.
                </td>
            </tr>
            `;

        return;

    }


    tabla.innerHTML =
        espaciosAulas
            .map(
                (espacio) => {

                    const tipo =
                        nombreTipoEspacio(
                            espacio.tipo
                        );


                    const icono =
                        espacio.tipo ===
                        "laboratorio"
                            ? "🔬"
                            : "🏫";


                    const estado =
                        espacio.activo
                            ? "Habilitado"
                            : "Deshabilitado";


                    const claseEstado =
                        espacio.activo
                            ? "estado-activo"
                            : "estado-inactivo";


                    return `
                        <tr>

                            <td>

                                <div class="celda-tipo-espacio">

                                    <span>
                                        ${icono}
                                    </span>

                                    <strong>
                                        ${escaparHTML(tipo)}
                                    </strong>

                                </div>

                            </td>


                            <td>

                                <strong>
                                    ${escaparHTML(
                                        espacio.nombre
                                    )}
                                </strong>

                            </td>


                            <td>

                                <span
                                    class="estado-badge ${claseEstado}"
                                >
                                    ${estado}
                                </span>

                            </td>


                            <td>

                                <div class="acciones-tabla">

                                    <button
                                        type="button"
                                        class="btn-tabla btn-editar"
                                        data-accion="editar-espacio"
                                        data-id="${espacio.id}"
                                    >
                                        Editar
                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;

                }
            )
            .join("");


    tabla
        .querySelectorAll(
            '[data-accion="editar-espacio"]'
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        abrirEdicionEspacio(
                            Number(
                                boton.dataset.id
                            )
                        );

                    }
                );

            }
        );

}



// ============================================================
// 23. RESUMEN DE ESPACIOS
// ============================================================

function actualizarResumenEspacios() {

    const totalAulas =
        espaciosAulas.filter(
            (espacio) =>
                espacio.tipo === "aula"
        ).length;


    const totalLaboratorios =
        espaciosAulas.filter(
            (espacio) =>
                espacio.tipo ===
                "laboratorio"
        ).length;


    const totalActivos =
        espaciosAulas.filter(
            (espacio) =>
                espacio.activo === true
        ).length;


    if (elemento("totalAulas")) {

        elemento(
            "totalAulas"
        ).textContent =
            String(totalAulas);

    }


    if (elemento("totalLaboratorios")) {

        elemento(
            "totalLaboratorios"
        ).textContent =
            String(totalLaboratorios);

    }


    if (elemento("totalEspaciosActivos")) {

        elemento(
            "totalEspaciosActivos"
        ).textContent =
            String(totalActivos);

    }

}



// ============================================================
// 24. LLENAR SELECTORES DE ESPACIOS
// ============================================================

function llenarSelectoresEspacios() {

    const espaciosActivos =
        espaciosAulas.filter(
            (espacio) =>
                espacio.activo === true
        );


    const opciones =
        espaciosActivos
            .map(
                (espacio) => {

                    const tipo =
                        nombreTipoEspacio(
                            espacio.tipo
                        );


                    return `
                        <option value="${espacio.id}">
                            ${escaparHTML(
                                espacio.nombre
                            )} — ${tipo}
                        </option>
                    `;

                }
            )
            .join("");


    // --------------------------------------------------------
    // NUEVA ASIGNACIÓN
    // --------------------------------------------------------

    const asignacionEspacio =
        elemento(
            "asignacionEspacio"
        );


    if (asignacionEspacio) {

        const valorAnterior =
            asignacionEspacio.value;


        asignacionEspacio.innerHTML =
            `
            <option value="">
                Seleccione un espacio
            </option>
            ${opciones}
            `;


        if (
            valorAnterior &&
            espaciosActivos.some(
                (espacio) =>
                    String(espacio.id) ===
                    String(valorAnterior)
            )
        ) {

            asignacionEspacio.value =
                valorAnterior;

        }

    }


    // --------------------------------------------------------
    // EDITAR ASIGNACIÓN
    // --------------------------------------------------------

    const editarAsignacionEspacio =
        elemento(
            "editarAsignacionEspacio"
        );


    if (editarAsignacionEspacio) {

        const valorAnterior =
            editarAsignacionEspacio.value;


        editarAsignacionEspacio.innerHTML =
            `
            <option value="">
                Seleccione un espacio
            </option>
            ${opciones}
            `;


        if (
            valorAnterior &&
            espaciosActivos.some(
                (espacio) =>
                    String(espacio.id) ===
                    String(valorAnterior)
            )
        ) {

            editarAsignacionEspacio.value =
                valorAnterior;

        }

    }


    // --------------------------------------------------------
    // EDITAR RESERVA
    // --------------------------------------------------------

    const editarReservaEspacio =
        elemento(
            "editarReservaEspacio"
        );


    if (editarReservaEspacio) {

        const valorAnterior =
            editarReservaEspacio.value;


        editarReservaEspacio.innerHTML =
            `
            <option value="">
                Seleccione un espacio
            </option>
            ${opciones}
            `;


        if (
            valorAnterior &&
            espaciosActivos.some(
                (espacio) =>
                    String(espacio.id) ===
                    String(valorAnterior)
            )
        ) {

            editarReservaEspacio.value =
                valorAnterior;

        }

    }

}



// ============================================================
// 25. FILTRO DE ESPACIOS PARA OBSERVACIONES
// ============================================================

function llenarFiltroObservacionesEspacios() {

    const select =
        elemento(
            "filtroObservacionEspacio"
        );


    if (!select) {
        return;
    }


    const valorAnterior =
        select.value;


    select.innerHTML =
        `
        <option value="">
            Todos los espacios
        </option>
        `;


    espaciosAulas.forEach(
        (espacio) => {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                String(espacio.id);


            opcion.textContent =
                espacio.nombre;


            select.appendChild(
                opcion
            );

        }
    );


    if (
        valorAnterior &&
        espaciosAulas.some(
            (espacio) =>
                String(espacio.id) ===
                String(valorAnterior)
        )
    ) {

        select.value =
            valorAnterior;

    }

}



// ============================================================
// 26. CREAR ESPACIO
// ============================================================

async function crearEspacio(event) {

    event.preventDefault();


    const tipo =
        elemento(
            "nuevoEspacioTipo"
        ).value;


    const nombre =
        elemento(
            "nuevoEspacioNombre"
        ).value.trim();


    if (!nombre) {

        mostrarMensajeFormulario(
            "mensajeNuevoEspacio",
            "Ingrese el nombre del aula o laboratorio.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnCrearEspacio"
        );


    boton.disabled = true;

    boton.textContent =
        "Creando...";


    mostrarMensajeFormulario(
        "mensajeNuevoEspacio",
        ""
    );


    try {

        const {
            error
        } = await supabaseClient
            .rpc(
                "crear_espacio_aula",
                {
                    p_tipo:
                        tipo,

                    p_nombre:
                        nombre
                }
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudo crear el espacio."
                )
            );

        }


        elemento(
            "formNuevoEspacio"
        ).reset();


        elemento(
            "nuevoEspacioTipo"
        ).value =
            "aula";


        mostrarMensajeFormulario(
            "mensajeNuevoEspacio",
            "Espacio creado correctamente.",
            "exito"
        );


        mostrarMensajeGlobal(
            "Aula o laboratorio creado correctamente."
        );


        await cargarEspacios();


        // La nueva aula debe aparecer también
        // inmediatamente en la vista semanal.
        await cargarVistaSemanal();

    }
    catch (error) {

        console.error(error);


        mostrarMensajeFormulario(
            "mensajeNuevoEspacio",
            error.message ||
            "No se pudo crear el espacio.",
            "error"
        );

    }
    finally {

        boton.disabled = false;

        boton.textContent =
            "Crear espacio";

    }

}



// ============================================================
// 27. ABRIR EDICIÓN DE ESPACIO
// ============================================================

function abrirEdicionEspacio(
    espacioId
) {

    const espacio =
        espaciosAulas.find(
            (item) =>
                Number(item.id) ===
                Number(espacioId)
        );


    if (!espacio) {

        mostrarMensajeGlobal(
            "No se encontró el espacio seleccionado.",
            "error"
        );

        return;

    }


    elemento(
        "editarEspacioId"
    ).value =
        String(espacio.id);


    elemento(
        "editarEspacioTipo"
    ).value =
        espacio.tipo;


    elemento(
        "editarEspacioNombre"
    ).value =
        espacio.nombre;


    elemento(
        "editarEspacioActivo"
    ).value =
        espacio.activo
            ? "true"
            : "false";


    mostrarMensajeFormulario(
        "mensajeEditarEspacio",
        ""
    );


    abrirModal(
        "modalEditarEspacio"
    );

}



// ============================================================
// 28. GUARDAR EDICIÓN DE ESPACIO
// ============================================================

async function guardarEdicionEspacio(
    event
) {

    event.preventDefault();


    const espacioId =
        Number(
            elemento(
                "editarEspacioId"
            ).value
        );


    const tipo =
        elemento(
            "editarEspacioTipo"
        ).value;


    const nombre =
        elemento(
            "editarEspacioNombre"
        ).value.trim();


    const activo =
        elemento(
            "editarEspacioActivo"
        ).value === "true";


    if (
        !espacioId ||
        !nombre
    ) {

        mostrarMensajeFormulario(
            "mensajeEditarEspacio",
            "Revise los datos del espacio.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnGuardarEspacio"
        );


    boton.disabled = true;

    boton.textContent =
        "Guardando...";


    mostrarMensajeFormulario(
        "mensajeEditarEspacio",
        ""
    );


    try {

        const {
            error
        } = await supabaseClient
            .rpc(
                "editar_espacio_aula",
                {
                    p_espacio_id:
                        espacioId,

                    p_tipo:
                        tipo,

                    p_nombre:
                        nombre,

                    p_activo:
                        activo
                }
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudo editar el espacio."
                )
            );

        }


        await cargarEspacios();


        cerrarModal(
            "modalEditarEspacio"
        );


        mostrarMensajeGlobal(
            "Espacio actualizado correctamente."
        );


        await cargarVistaSemanal();

    }
    catch (error) {

        console.error(error);


        mostrarMensajeFormulario(
            "mensajeEditarEspacio",
            error.message ||
            "No se pudo editar el espacio.",
            "error"
        );

    }
    finally {

        boton.disabled = false;

        boton.textContent =
            "Guardar cambios";

    }

}



// ============================================================
// 29. BUSCAR ESPACIO POR ID
// ============================================================

function obtenerEspacioPorId(
    espacioId
) {

    return (
        espaciosAulas.find(
            (espacio) =>
                Number(espacio.id) ===
                Number(espacioId)
        )
        ||
        null
    );

}



// ============================================================
// 30. ORDENAR ESPACIOS
// ============================================================

function ordenarEspacios(
    lista
) {

    return [
        ...lista
    ].sort(
        (a, b) => {

            // Primero aulas
            if (
                a.tipo !== b.tipo
            ) {

                if (a.tipo === "aula") {
                    return -1;
                }


                if (b.tipo === "aula") {
                    return 1;
                }

            }


            return String(
                a.nombre
            ).localeCompare(
                String(
                    b.nombre
                ),
                "es",
                {
                    numeric: true,
                    sensitivity: "base"
                }
            );

        }
    );

}



// ============================================================
// 31. ACTUALIZAR ORDEN DE ESPACIOS EN MEMORIA
// ============================================================

function normalizarOrdenEspacios() {

    espaciosAulas =
        ordenarEspacios(
            espaciosAulas
        );

}



// ============================================================
// 32. EVENTOS DEL MÓDULO DE ESPACIOS
// ============================================================

function configurarEventosEspacios() {

    elemento(
        "formNuevoEspacio"
    )?.addEventListener(
        "submit",
        crearEspacio
    );


    elemento(
        "formEditarEspacio"
    )?.addEventListener(
        "submit",
        guardarEdicionEspacio
    );


    elemento(
        "btnActualizarEspacios"
    )?.addEventListener(
        "click",
        async () => {

            try {

                await cargarEspacios();


                mostrarMensajeGlobal(
                    "Listado de espacios actualizado."
                );

            }
            catch (error) {

                console.error(error);


                mostrarMensajeGlobal(
                    error.message,
                    "error"
                );

            }

        }
    );

}



// ============================================================
// 33. CARGAR ESPACIOS SIN RENDERIZADO EXTRA
//
// Esta función será útil cuando otros módulos necesiten
// asegurarse de que los espacios están disponibles en memoria.
// ============================================================

async function asegurarEspaciosCargados() {

    if (
        Array.isArray(
            espaciosAulas
        )
        &&
        espaciosAulas.length > 0
    ) {

        return;

    }


    await cargarEspacios();

}



// ============================================================
// 34. ESPACIOS ACTIVOS
// ============================================================

function obtenerEspaciosActivos() {

    return ordenarEspacios(
        espaciosAulas.filter(
            (espacio) =>
                espacio.activo === true
        )
    );

}



// ============================================================
// 35. ESTADO VACÍO DE ESPACIOS
// ============================================================

function existenEspaciosActivos() {

    return obtenerEspaciosActivos()
        .length > 0;

}



// ============================================================
// 36. PREPARAR MÓDULO DE ESPACIOS
// ============================================================

async function prepararModuloEspacios() {

    await cargarEspacios();


    normalizarOrdenEspacios();


    renderizarEspacios();

    actualizarResumenEspacios();

    llenarSelectoresEspacios();

    llenarFiltroObservacionesEspacios();

}
// ============================================================
// 37. CARGAR GESTIONES
// ============================================================

async function cargarGestiones() {

    const {
        data,
        error
    } = await supabaseClient
        .from("gestiones_aulas")
        .select(
            `
            id,
            nombre,
            fecha_inicio,
            fecha_fin,
            activa,
            created_at,
            updated_at
            `
        )
        .order(
            "fecha_inicio",
            {
                ascending: false
            }
        );


    if (error) {

        throw new Error(
            mensajeErrorSupabase(
                error,
                "No se pudieron cargar las gestiones."
            )
        );

    }


    gestionesAulas =
        Array.isArray(data)
            ? data
            : [];


    llenarSelectorGestiones();

}



// ============================================================
// 38. LLENAR SELECTOR DE GESTIONES
// ============================================================

function llenarSelectorGestiones() {

    const select =
        elemento("selectGestion");


    if (!select) {
        return;
    }


    const seleccionAnterior =
        gestionSeleccionadaId;


    select.innerHTML =
        `
        <option value="">
            Seleccione una gestión
        </option>
        `;


    gestionesAulas.forEach(
        (gestion) => {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                String(gestion.id);


            opcion.textContent =
                `${gestion.nombre} ${
                    gestion.activa
                        ? "— Activa"
                        : "— Inactiva"
                }`;


            select.appendChild(
                opcion
            );

        }
    );


    // --------------------------------------------------------
    // CONSERVAR GESTIÓN SELECCIONADA
    // --------------------------------------------------------

    if (
        seleccionAnterior &&
        gestionesAulas.some(
            (gestion) =>
                Number(gestion.id) ===
                Number(seleccionAnterior)
        )
    ) {

        gestionSeleccionadaId =
            Number(
                seleccionAnterior
            );


        select.value =
            String(
                gestionSeleccionadaId
            );

    }

    else {

        // ----------------------------------------------------
        // SI NO HAY SELECCIÓN:
        // BUSCAR PRIMERO UNA GESTIÓN ACTIVA
        // ----------------------------------------------------

        const gestionActiva =
            gestionesAulas.find(
                (gestion) =>
                    gestion.activa === true
            );


        if (gestionActiva) {

            gestionSeleccionadaId =
                Number(
                    gestionActiva.id
                );


            select.value =
                String(
                    gestionSeleccionadaId
                );

        }

        else {

            gestionSeleccionadaId =
                null;

            select.value =
                "";

        }

    }


    actualizarInfoGestionSeleccionada();

}



// ============================================================
// 39. OBTENER GESTIÓN SELECCIONADA
// ============================================================

function obtenerGestionSeleccionada() {

    if (!gestionSeleccionadaId) {
        return null;
    }


    return (
        gestionesAulas.find(
            (gestion) =>
                Number(gestion.id) ===
                Number(
                    gestionSeleccionadaId
                )
        )
        ||
        null
    );

}



// ============================================================
// 40. MOSTRAR INFORMACIÓN DE GESTIÓN
// ============================================================

function actualizarInfoGestionSeleccionada() {

    const contenedor =
        elemento(
            "infoGestionSeleccionada"
        );


    const botonEditar =
        elemento(
            "btnEditarGestion"
        );


    const gestion =
        obtenerGestionSeleccionada();


    if (!gestion) {

        if (contenedor) {

            contenedor.innerHTML =
                `
                <div class="info-gestion-vacia">
                    Seleccione una gestión.
                </div>
                `;

        }


        if (botonEditar) {

            botonEditar.disabled =
                true;

        }


        return;

    }


    if (botonEditar) {

        botonEditar.disabled =
            false;

    }


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML =
        `
        <div class="info-gestion-contenido">

            <div class="info-gestion-principal">

                <span>
                    Gestión
                </span>

                <strong>
                    ${escaparHTML(
                        gestion.nombre
                    )}
                </strong>

            </div>


            <div class="info-gestion-fechas">

                <div>

                    <span>
                        Inicio
                    </span>

                    <strong>
                        ${formatearFecha(
                            gestion.fecha_inicio
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Finalización
                    </span>

                    <strong>
                        ${formatearFecha(
                            gestion.fecha_fin
                        )}
                    </strong>

                </div>

            </div>


            <div>

                <span
                    class="estado-badge ${
                        gestion.activa
                            ? "estado-activo"
                            : "estado-inactivo"
                    }"
                >
                    ${
                        gestion.activa
                            ? "Activa"
                            : "Inactiva"
                    }
                </span>

            </div>

        </div>
        `;

}



// ============================================================
// 41. CREAR GESTIÓN
// ============================================================

async function crearGestion(
    event
) {

    event.preventDefault();


    const nombre =
        elemento(
            "nuevaGestionNombre"
        ).value.trim();


    const fechaInicio =
        elemento(
            "nuevaGestionInicio"
        ).value;


    const fechaFin =
        elemento(
            "nuevaGestionFin"
        ).value;


    if (
        !nombre ||
        !fechaInicio ||
        !fechaFin
    ) {

        mostrarMensajeFormulario(
            "mensajeNuevaGestion",
            "Complete todos los datos de la gestión.",
            "error"
        );

        return;

    }


    if (
        fechaFin <
        fechaInicio
    ) {

        mostrarMensajeFormulario(
            "mensajeNuevaGestion",
            "La fecha final no puede ser anterior a la fecha inicial.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnCrearGestion"
        );


    boton.disabled =
        true;


    boton.textContent =
        "Creando...";


    mostrarMensajeFormulario(
        "mensajeNuevaGestion",
        ""
    );


    try {

        const {
            data,
            error
        } = await supabaseClient
            .rpc(
                "crear_gestion_aulas",
                {
                    p_nombre:
                        nombre,

                    p_fecha_inicio:
                        fechaInicio,

                    p_fecha_fin:
                        fechaFin
                }
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudo crear la gestión."
                )
            );

        }


        if (data) {

            gestionSeleccionadaId =
                Number(data);

        }


        elemento(
            "formNuevaGestion"
        ).reset();


        mostrarMensajeFormulario(
            "mensajeNuevaGestion",
            "Gestión creada correctamente.",
            "exito"
        );


        await cargarGestiones();


        await cargarAsignaciones();


        mostrarMensajeGlobal(
            "Gestión académica creada correctamente."
        );

    }
    catch (error) {

        console.error(error);


        mostrarMensajeFormulario(
            "mensajeNuevaGestion",
            error.message ||
            "No se pudo crear la gestión.",
            "error"
        );

    }
    finally {

        boton.disabled =
            false;


        boton.textContent =
            "Crear gestión";

    }

}



// ============================================================
// 42. ABRIR EDICIÓN DE GESTIÓN
// ============================================================

function abrirEdicionGestion() {

    const gestion =
        obtenerGestionSeleccionada();


    if (!gestion) {

        mostrarMensajeGlobal(
            "Seleccione una gestión.",
            "error"
        );

        return;

    }


    elemento(
        "editarGestionId"
    ).value =
        String(
            gestion.id
        );


    elemento(
        "editarGestionNombre"
    ).value =
        gestion.nombre;


    elemento(
        "editarGestionInicio"
    ).value =
        gestion.fecha_inicio;


    elemento(
        "editarGestionFin"
    ).value =
        gestion.fecha_fin;


    elemento(
        "editarGestionActiva"
    ).value =
        gestion.activa
            ? "true"
            : "false";


    mostrarMensajeFormulario(
        "mensajeEditarGestion",
        ""
    );


    abrirModal(
        "modalEditarGestion"
    );

}



// ============================================================
// 43. GUARDAR EDICIÓN DE GESTIÓN
// ============================================================

async function guardarEdicionGestion(
    event
) {

    event.preventDefault();


    const gestionId =
        Number(
            elemento(
                "editarGestionId"
            ).value
        );


    const nombre =
        elemento(
            "editarGestionNombre"
        ).value.trim();


    const fechaInicio =
        elemento(
            "editarGestionInicio"
        ).value;


    const fechaFin =
        elemento(
            "editarGestionFin"
        ).value;


    const activa =
        elemento(
            "editarGestionActiva"
        ).value === "true";


    if (
        !gestionId ||
        !nombre ||
        !fechaInicio ||
        !fechaFin
    ) {

        mostrarMensajeFormulario(
            "mensajeEditarGestion",
            "Revise los datos de la gestión.",
            "error"
        );

        return;

    }


    if (
        fechaFin <
        fechaInicio
    ) {

        mostrarMensajeFormulario(
            "mensajeEditarGestion",
            "La fecha final no puede ser anterior a la fecha inicial.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnGuardarGestion"
        );


    boton.disabled =
        true;


    boton.textContent =
        "Guardando...";


    mostrarMensajeFormulario(
        "mensajeEditarGestion",
        ""
    );


    try {

        const {
            error
        } = await supabaseClient
            .rpc(
                "editar_gestion_aulas",
                {
                    p_gestion_id:
                        gestionId,

                    p_nombre:
                        nombre,

                    p_fecha_inicio:
                        fechaInicio,

                    p_fecha_fin:
                        fechaFin,

                    p_activa:
                        activa
                }
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudo editar la gestión."
                )
            );

        }


        gestionSeleccionadaId =
            gestionId;


        await cargarGestiones();


        await cargarAsignaciones();


        cerrarModal(
            "modalEditarGestion"
        );


        mostrarMensajeGlobal(
            "Gestión actualizada correctamente."
        );


        await cargarVistaSemanal();

    }
    catch (error) {

        console.error(error);


        mostrarMensajeFormulario(
            "mensajeEditarGestion",
            error.message ||
            "No se pudo editar la gestión.",
            "error"
        );

    }
    finally {

        boton.disabled =
            false;


        boton.textContent =
            "Guardar cambios";

    }

}



// ============================================================
// 44. CARGAR DOCENTES
// ============================================================

async function cargarDocentes() {

    const {
        data,
        error
    } = await supabaseClient
        .rpc(
            "obtener_docentes_aulas"
        );


    if (error) {

        throw new Error(
            mensajeErrorSupabase(
                error,
                "No se pudo cargar la lista de docentes."
            )
        );

    }


    docentesAulas =
        Array.isArray(data)
            ? data
            : [];


    docentesAulas.sort(
        (a, b) =>
            String(
                a.nombre || ""
            ).localeCompare(
                String(
                    b.nombre || ""
                ),
                "es",
                {
                    sensitivity: "base"
                }
            )
    );


    llenarSelectoresDocentes();

}



// ============================================================
// 45. LLENAR SELECTORES DE DOCENTES
// ============================================================

function llenarSelectoresDocentes() {

    const opciones =
        docentesAulas
            .map(
                (docente) => {

                    return `
                        <option value="${escaparHTML(
                            docente.id
                        )}">
                            ${escaparHTML(
                                docente.nombre ||
                                "Docente"
                            )}
                        </option>
                    `;

                }
            )
            .join("");


    // --------------------------------------------------------
    // NUEVA ASIGNACIÓN
    // --------------------------------------------------------

    const nuevo =
        elemento(
            "asignacionDocente"
        );


    if (nuevo) {

        const anterior =
            nuevo.value;


        nuevo.innerHTML =
            `
            <option value="">
                Seleccione un docente
            </option>
            ${opciones}
            `;


        if (
            anterior &&
            docentesAulas.some(
                (docente) =>
                    String(docente.id) ===
                    String(anterior)
            )
        ) {

            nuevo.value =
                anterior;

        }

    }


    // --------------------------------------------------------
    // EDITAR ASIGNACIÓN
    // --------------------------------------------------------

    const editar =
        elemento(
            "editarAsignacionDocente"
        );


    if (editar) {

        const anterior =
            editar.value;


        editar.innerHTML =
            `
            <option value="">
                Seleccione un docente
            </option>
            ${opciones}
            `;


        if (
            anterior &&
            docentesAulas.some(
                (docente) =>
                    String(docente.id) ===
                    String(anterior)
            )
        ) {

            editar.value =
                anterior;

        }

    }

}



// ============================================================
// 46. BUSCAR DOCENTE
// ============================================================

function obtenerDocentePorId(
    usuarioId
) {

    return (
        docentesAulas.find(
            (docente) =>
                String(docente.id) ===
                String(usuarioId)
        )
        ||
        null
    );

}



// ============================================================
// 47. CAMBIAR GESTIÓN SELECCIONADA
// ============================================================

async function cambiarGestionSeleccionada(
    event
) {

    const valor =
        event.target.value;


    gestionSeleccionadaId =
        valor
            ? Number(valor)
            : null;


    actualizarInfoGestionSeleccionada();


    try {

        await cargarAsignaciones();

    }
    catch (error) {

        console.error(error);


        mostrarMensajeGlobal(
            error.message ||
            "No se pudieron cargar las asignaciones.",
            "error"
        );

    }

}



// ============================================================
// 48. CARGAR DATOS DEL MÓDULO GESTIÓN
// ============================================================

async function cargarDatosGestion() {

    await Promise.all([
        cargarEspacios(),
        cargarDocentes(),
        cargarGestiones()
    ]);


    await cargarAsignaciones();

}



// ============================================================
// 49. EVENTOS DE GESTIÓN
// ============================================================

function configurarEventosGestion() {

    elemento(
        "formNuevaGestion"
    )?.addEventListener(
        "submit",
        crearGestion
    );


    elemento(
        "formEditarGestion"
    )?.addEventListener(
        "submit",
        guardarEdicionGestion
    );


    elemento(
        "selectGestion"
    )?.addEventListener(
        "change",
        cambiarGestionSeleccionada
    );


    elemento(
        "btnEditarGestion"
    )?.addEventListener(
        "click",
        abrirEdicionGestion
    );


    elemento(
        "btnActualizarGestiones"
    )?.addEventListener(
        "click",
        async () => {

            try {

                await cargarGestiones();

                await cargarAsignaciones();


                mostrarMensajeGlobal(
                    "Gestiones actualizadas."
                );

            }
            catch (error) {

                console.error(error);


                mostrarMensajeGlobal(
                    error.message,
                    "error"
                );

            }

        }
    );

}



// ============================================================
// 50. VALIDAR QUE EXISTA GESTIÓN PARA ASIGNAR
// ============================================================

function validarGestionParaAsignacion() {

    const gestion =
        obtenerGestionSeleccionada();


    if (!gestion) {

        mostrarMensajeFormulario(
            "mensajeNuevaAsignacion",
            "Primero seleccione una gestión.",
            "error"
        );


        return false;

    }


    if (gestion.activa !== true) {

        mostrarMensajeFormulario(
            "mensajeNuevaAsignacion",
            "La gestión seleccionada se encuentra inactiva.",
            "error"
        );


        return false;

    }


    return true;

}



// ============================================================
// 51. DATOS DE GESTIÓN PARA EL RESTO DEL PANEL
// ============================================================

function obtenerGestionParaFecha(
    fechaISO
) {

    if (!fechaISO) {
        return null;
    }


    return (
        gestionesAulas.find(
            (gestion) =>

                gestion.activa === true

                &&

                fechaISO >=
                gestion.fecha_inicio

                &&

                fechaISO <=
                gestion.fecha_fin
        )
        ||
        null
    );

}



// ============================================================
// 52. COMPROBAR SI UNA FECHA ESTÁ EN ALGUNA GESTIÓN
// ============================================================

function fechaTieneGestionActiva(
    fechaISO
) {

    return (
        obtenerGestionParaFecha(
            fechaISO
        ) !== null
    );

}



// ============================================================
// 53. MOSTRAR PERIODO DE GESTIÓN
// ============================================================

function textoPeriodoGestion(
    gestion
) {

    if (!gestion) {
        return "—";
    }


    return (
        `${formatearFecha(
            gestion.fecha_inicio
        )} - ${formatearFecha(
            gestion.fecha_fin
        )}`
    );

}



// ============================================================
// 54. PREPARAR DATOS BÁSICOS DE GESTIÓN
// ============================================================

async function prepararModuloGestion() {

    await cargarDatosGestion();

}
// ============================================================
// 55. CARGAR ASIGNACIONES FIJAS
// ============================================================

async function cargarAsignaciones() {

    const tabla =
        elemento("tablaAsignaciones");


    if (!gestionSeleccionadaId) {

        asignacionesAulas = [];


        if (tabla) {

            tabla.innerHTML =
                `
                <tr>
                    <td
                        colspan="6"
                        class="tabla-vacia"
                    >
                        Seleccione una gestión.
                    </td>
                </tr>
                `;

        }


        return;

    }


    const {
        data,
        error
    } = await supabaseClient
        .from("asignaciones_aulas")
        .select(
            `
            id,
            gestion_id,
            espacio_id,
            usuario_id,
            dia_semana,
            horario,
            created_at,
            updated_at
            `
        )
        .eq(
            "gestion_id",
            gestionSeleccionadaId
        )
        .order(
            "dia_semana",
            {
                ascending: true
            }
        )
        .order(
            "horario",
            {
                ascending: true
            }
        );


    if (error) {

        throw new Error(
            mensajeErrorSupabase(
                error,
                "No se pudieron cargar las asignaciones fijas."
            )
        );

    }


    asignacionesAulas =
        Array.isArray(data)
            ? data
            : [];


    renderizarAsignaciones();

}



// ============================================================
// 56. OBTENER ASIGNACIONES FILTRADAS
// ============================================================

function obtenerAsignacionesFiltradas() {

    const filtroDia =
        elemento(
            "filtroAsignacionDia"
        )?.value || "";


    const filtroHorario =
        elemento(
            "filtroAsignacionHorario"
        )?.value || "";


    return asignacionesAulas.filter(
        (asignacion) => {

            const coincideDia =
                !filtroDia
                ||
                Number(
                    asignacion.dia_semana
                ) ===
                Number(
                    filtroDia
                );


            const coincideHorario =
                !filtroHorario
                ||
                asignacion.horario ===
                filtroHorario;


            return (
                coincideDia &&
                coincideHorario
            );

        }
    );

}



// ============================================================
// 57. RENDERIZAR ASIGNACIONES
// ============================================================

function renderizarAsignaciones() {

    const tabla =
        elemento(
            "tablaAsignaciones"
        );


    if (!tabla) {
        return;
    }


    if (!gestionSeleccionadaId) {

        tabla.innerHTML =
            `
            <tr>
                <td
                    colspan="6"
                    class="tabla-vacia"
                >
                    Seleccione una gestión.
                </td>
            </tr>
            `;

        return;

    }


    const lista =
        obtenerAsignacionesFiltradas();


    if (lista.length === 0) {

        tabla.innerHTML =
            `
            <tr>
                <td
                    colspan="6"
                    class="tabla-vacia"
                >
                    No existen asignaciones fijas
                    para los filtros seleccionados.
                </td>
            </tr>
            `;

        return;

    }


    tabla.innerHTML =
        lista
            .map(
                (asignacion) => {

                    const espacio =
                        obtenerEspacioPorId(
                            asignacion.espacio_id
                        );


                    const docente =
                        obtenerDocentePorId(
                            asignacion.usuario_id
                        );


                    const nombreEspacio =
                        espacio?.nombre ||
                        "Espacio no disponible";


                    const tipoEspacio =
                        espacio
                            ? nombreTipoEspacio(
                                espacio.tipo
                            )
                            : "—";


                    const nombreDocente =
                        docente?.nombre ||
                        "Docente";


                    return `
                        <tr>

                            <td>

                                <strong>
                                    ${escaparHTML(
                                        nombreEspacio
                                    )}
                                </strong>

                            </td>


                            <td>

                                ${escaparHTML(
                                    tipoEspacio
                                )}

                            </td>


                            <td>

                                ${escaparHTML(
                                    nombreDocente
                                )}

                            </td>


                            <td>

                                <strong>
                                    ${escaparHTML(
                                        nombreDia(
                                            asignacion.dia_semana
                                        )
                                    )}
                                </strong>

                            </td>


                            <td>

                                ${escaparHTML(
                                    formatoHorario(
                                        asignacion.horario
                                    )
                                )}

                            </td>


                            <td>

                                <div class="acciones-tabla">

                                    <button
                                        type="button"
                                        class="btn-tabla btn-editar"
                                        data-accion="editar-asignacion"
                                        data-id="${asignacion.id}"
                                    >
                                        Editar
                                    </button>


                                    <button
                                        type="button"
                                        class="btn-tabla btn-eliminar"
                                        data-accion="eliminar-asignacion"
                                        data-id="${asignacion.id}"
                                    >
                                        Eliminar
                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;

                }
            )
            .join("");


    // --------------------------------------------------------
    // BOTONES EDITAR
    // --------------------------------------------------------

    tabla
        .querySelectorAll(
            '[data-accion="editar-asignacion"]'
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        abrirEdicionAsignacion(
                            Number(
                                boton.dataset.id
                            )
                        );

                    }
                );

            }
        );


    // --------------------------------------------------------
    // BOTONES ELIMINAR
    // --------------------------------------------------------

    tabla
        .querySelectorAll(
            '[data-accion="eliminar-asignacion"]'
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        abrirEliminarAsignacion(
                            Number(
                                boton.dataset.id
                            )
                        );

                    }
                );

            }
        );

}



// ============================================================
// 58. BUSCAR ASIGNACIÓN POR ID
// ============================================================

function obtenerAsignacionPorId(
    asignacionId
) {

    return (
        asignacionesAulas.find(
            (asignacion) =>
                Number(asignacion.id) ===
                Number(asignacionId)
        )
        ||
        null
    );

}



// ============================================================
// 59. CREAR ASIGNACIÓN FIJA
// ============================================================

async function crearAsignacion(
    event
) {

    event.preventDefault();


    if (
        !validarGestionParaAsignacion()
    ) {

        return;

    }


    const espacioId =
        Number(
            elemento(
                "asignacionEspacio"
            ).value
        );


    const docenteId =
        elemento(
            "asignacionDocente"
        ).value;


    const dia =
        Number(
            elemento(
                "asignacionDia"
            ).value
        );


    const horario =
        elemento(
            "asignacionHorario"
        ).value;


    if (
        !espacioId ||
        !docenteId ||
        !dia ||
        !horario
    ) {

        mostrarMensajeFormulario(
            "mensajeNuevaAsignacion",
            "Complete todos los datos de la asignación.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnCrearAsignacion"
        );


    boton.disabled =
        true;


    boton.textContent =
        "Creando...";


    mostrarMensajeFormulario(
        "mensajeNuevaAsignacion",
        ""
    );


    try {

        const {
            error
        } = await supabaseClient
            .rpc(
                "crear_asignacion_aula",
                {
                    p_gestion_id:
                        gestionSeleccionadaId,

                    p_espacio_id:
                        espacioId,

                    p_usuario_id:
                        docenteId,

                    p_dia_semana:
                        dia,

                    p_horario:
                        horario
                }
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudo crear la asignación."
                )
            );

        }


        elemento(
            "formNuevaAsignacion"
        ).reset();


        mostrarMensajeFormulario(
            "mensajeNuevaAsignacion",
            "Asignación fija creada correctamente.",
            "exito"
        );


        await cargarAsignaciones();


        await cargarVistaSemanal();


        mostrarMensajeGlobal(
            "Asignación fija creada correctamente."
        );

    }
    catch (error) {

        console.error(error);


        mostrarMensajeFormulario(
            "mensajeNuevaAsignacion",
            error.message ||
            "No se pudo crear la asignación.",
            "error"
        );

    }
    finally {

        boton.disabled =
            false;


        boton.textContent =
            "Crear asignación fija";

    }

}



// ============================================================
// 60. ABRIR EDICIÓN DE ASIGNACIÓN
// ============================================================

function abrirEdicionAsignacion(
    asignacionId
) {

    const asignacion =
        obtenerAsignacionPorId(
            asignacionId
        );


    if (!asignacion) {

        mostrarMensajeGlobal(
            "No se encontró la asignación seleccionada.",
            "error"
        );

        return;

    }


    // --------------------------------------------------------
    // RECARGAR OPCIONES
    // --------------------------------------------------------

    llenarSelectoresEspacios();

    llenarSelectoresDocentes();


    // --------------------------------------------------------
    // COLOCAR DATOS
    // --------------------------------------------------------

    elemento(
        "editarAsignacionId"
    ).value =
        String(
            asignacion.id
        );


    elemento(
        "editarAsignacionEspacio"
    ).value =
        String(
            asignacion.espacio_id
        );


    elemento(
        "editarAsignacionDocente"
    ).value =
        String(
            asignacion.usuario_id
        );


    elemento(
        "editarAsignacionDia"
    ).value =
        String(
            asignacion.dia_semana
        );


    elemento(
        "editarAsignacionHorario"
    ).value =
        asignacion.horario;


    mostrarMensajeFormulario(
        "mensajeEditarAsignacion",
        ""
    );


    abrirModal(
        "modalEditarAsignacion"
    );

}



// ============================================================
// 61. GUARDAR EDICIÓN DE ASIGNACIÓN
// ============================================================

async function guardarEdicionAsignacion(
    event
) {

    event.preventDefault();


    const asignacionId =
        Number(
            elemento(
                "editarAsignacionId"
            ).value
        );


    const espacioId =
        Number(
            elemento(
                "editarAsignacionEspacio"
            ).value
        );


    const docenteId =
        elemento(
            "editarAsignacionDocente"
        ).value;


    const dia =
        Number(
            elemento(
                "editarAsignacionDia"
            ).value
        );


    const horario =
        elemento(
            "editarAsignacionHorario"
        ).value;


    if (
        !asignacionId ||
        !espacioId ||
        !docenteId ||
        !dia ||
        !horario
    ) {

        mostrarMensajeFormulario(
            "mensajeEditarAsignacion",
            "Complete todos los datos.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnGuardarAsignacion"
        );


    boton.disabled =
        true;


    boton.textContent =
        "Guardando...";


    mostrarMensajeFormulario(
        "mensajeEditarAsignacion",
        ""
    );


    try {

        const {
            error
        } = await supabaseClient
            .rpc(
                "editar_asignacion_aula",
                {
                    p_asignacion_id:
                        asignacionId,

                    p_espacio_id:
                        espacioId,

                    p_usuario_id:
                        docenteId,

                    p_dia_semana:
                        dia,

                    p_horario:
                        horario
                }
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudo editar la asignación."
                )
            );

        }


        await cargarAsignaciones();


        cerrarModal(
            "modalEditarAsignacion"
        );


        await cargarVistaSemanal();


        mostrarMensajeGlobal(
            "Asignación actualizada correctamente."
        );

    }
    catch (error) {

        console.error(error);


        mostrarMensajeFormulario(
            "mensajeEditarAsignacion",
            error.message ||
            "No se pudo editar la asignación.",
            "error"
        );

    }
    finally {

        boton.disabled =
            false;


        boton.textContent =
            "Guardar cambios";

    }

}



// ============================================================
// 62. ABRIR CONFIRMACIÓN PARA ELIMINAR ASIGNACIÓN
// ============================================================

function abrirEliminarAsignacion(
    asignacionId
) {

    const asignacion =
        obtenerAsignacionPorId(
            asignacionId
        );


    if (!asignacion) {

        mostrarMensajeGlobal(
            "No se encontró la asignación.",
            "error"
        );

        return;

    }


    const espacio =
        obtenerEspacioPorId(
            asignacion.espacio_id
        );


    const docente =
        obtenerDocentePorId(
            asignacion.usuario_id
        );


    elemento(
        "eliminarAsignacionId"
    ).value =
        String(
            asignacion.id
        );


    elemento(
        "infoEliminarAsignacion"
    ).innerHTML =
        `
        <strong>
            ${escaparHTML(
                espacio?.nombre ||
                "Espacio"
            )}
        </strong>

        <span>
            ${escaparHTML(
                nombreDia(
                    asignacion.dia_semana
                )
            )}
            ·
            ${escaparHTML(
                formatoHorario(
                    asignacion.horario
                )
            )}
        </span>

        <span>
            ${escaparHTML(
                docente?.nombre ||
                "Docente"
            )}
        </span>
        `;


    mostrarMensajeFormulario(
        "mensajeEliminarAsignacion",
        ""
    );


    abrirModal(
        "modalEliminarAsignacion"
    );

}



// ============================================================
// 63. CONFIRMAR ELIMINACIÓN DE ASIGNACIÓN
// ============================================================

async function eliminarAsignacion() {

    const asignacionId =
        Number(
            elemento(
                "eliminarAsignacionId"
            ).value
        );


    if (!asignacionId) {

        mostrarMensajeFormulario(
            "mensajeEliminarAsignacion",
            "Asignación no válida.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnConfirmarEliminarAsignacion"
        );


    boton.disabled =
        true;


    boton.textContent =
        "Eliminando...";


    try {

        const {
            error
        } = await supabaseClient
            .rpc(
                "eliminar_asignacion_aula",
                {
                    p_asignacion_id:
                        asignacionId
                }
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudo eliminar la asignación."
                )
            );

        }


        cerrarModal(
            "modalEliminarAsignacion"
        );


        await cargarAsignaciones();


        await cargarVistaSemanal();


        mostrarMensajeGlobal(
            "Asignación fija eliminada correctamente."
        );

    }
    catch (error) {

        console.error(error);


        mostrarMensajeFormulario(
            "mensajeEliminarAsignacion",
            error.message ||
            "No se pudo eliminar la asignación.",
            "error"
        );

    }
    finally {

        boton.disabled =
            false;


        boton.textContent =
            "Eliminar asignación";

    }

}



// ============================================================
// 64. FILTRAR ASIGNACIONES
// ============================================================

function aplicarFiltrosAsignaciones() {

    renderizarAsignaciones();

}



// ============================================================
// 65. ACTUALIZAR ASIGNACIONES MANUALMENTE
// ============================================================

async function actualizarAsignacionesManual() {

    try {

        await cargarAsignaciones();


        mostrarMensajeGlobal(
            "Asignaciones actualizadas."
        );

    }
    catch (error) {

        console.error(error);


        mostrarMensajeGlobal(
            error.message ||
            "No se pudieron actualizar las asignaciones.",
            "error"
        );

    }

}



// ============================================================
// 66. EVENTOS DE ASIGNACIONES
// ============================================================

function configurarEventosAsignaciones() {

    elemento(
        "formNuevaAsignacion"
    )?.addEventListener(
        "submit",
        crearAsignacion
    );


    elemento(
        "formEditarAsignacion"
    )?.addEventListener(
        "submit",
        guardarEdicionAsignacion
    );


    elemento(
        "btnConfirmarEliminarAsignacion"
    )?.addEventListener(
        "click",
        eliminarAsignacion
    );


    elemento(
        "btnActualizarAsignaciones"
    )?.addEventListener(
        "click",
        actualizarAsignacionesManual
    );


    elemento(
        "filtroAsignacionDia"
    )?.addEventListener(
        "change",
        aplicarFiltrosAsignaciones
    );


    elemento(
        "filtroAsignacionHorario"
    )?.addEventListener(
        "change",
        aplicarFiltrosAsignaciones
    );

}



// ============================================================
// 67. COMPROBAR ASIGNACIÓN EN MEMORIA
//
// Se utilizará también como apoyo visual.
// La validación real de disponibilidad siempre la realiza
// Supabase.
// ============================================================

function buscarAsignacionLocal(
    espacioId,
    diaSemana,
    horario
) {

    return (
        asignacionesAulas.find(
            (asignacion) =>

                Number(
                    asignacion.espacio_id
                ) ===
                Number(
                    espacioId
                )

                &&

                Number(
                    asignacion.dia_semana
                ) ===
                Number(
                    diaSemana
                )

                &&

                asignacion.horario ===
                horario
        )
        ||
        null
    );

}



// ============================================================
// 68. CONTAR ASIGNACIONES DE LA GESTIÓN
// ============================================================

function contarAsignacionesGestion() {

    return asignacionesAulas.length;

}



// ============================================================
// 69. OBTENER ASIGNACIONES POR DÍA
// ============================================================

function obtenerAsignacionesPorDia(
    diaSemana
) {

    return asignacionesAulas.filter(
        (asignacion) =>
            Number(
                asignacion.dia_semana
            ) ===
            Number(
                diaSemana
            )
    );

}



// ============================================================
// 70. OBTENER ASIGNACIONES POR HORARIO
// ============================================================

function obtenerAsignacionesPorHorario(
    horario
) {

    return asignacionesAulas.filter(
        (asignacion) =>
            asignacion.horario ===
            horario
    );

}



// ============================================================
// 71. PREPARAR MÓDULO DE ASIGNACIONES
// ============================================================

async function prepararModuloAsignaciones() {

    if (!gestionSeleccionadaId) {
        return;
    }


    await cargarAsignaciones();

}
// ============================================================
// 72. CARGAR VISTA SEMANAL COMPLETA
// ============================================================

async function cargarVistaSemanal() {

    actualizarTextoSemana();


    try {

        await asegurarEspaciosCargados();


        // ----------------------------------------------------
        // CARGAR LAS 15 COMBINACIONES:
        //
        // 5 días × 3 horarios
        // ----------------------------------------------------

        const fechas =
            obtenerFechasSemana();


        const resultados =
            await Promise.all(

                HORARIOS_AULAS.flatMap(
                    (horario) =>

                        fechas.map(
                            async (fecha) => {

                                const fechaISO =
                                    fechaLocalISO(
                                        fecha
                                    );


                                try {

                                    const {
                                        data,
                                        error
                                    } =
                                        await supabaseClient
                                            .rpc(
                                                "obtener_disponibilidad_aulas",
                                                {
                                                    p_fecha:
                                                        fechaISO,

                                                    p_horario:
                                                        horario
                                                }
                                            );


                                    if (error) {

                                        // --------------------------------
                                        // Una semana puede quedar fuera
                                        // de una gestión académica.
                                        // No detenemos toda la tabla.
                                        // --------------------------------

                                        return {
                                            fecha:
                                                fechaISO,

                                            horario:
                                                horario,

                                            data:
                                                [],

                                            error:
                                                error
                                        };

                                    }


                                    return {
                                        fecha:
                                            fechaISO,

                                        horario:
                                            horario,

                                        data:
                                            Array.isArray(
                                                data
                                            )
                                                ? data
                                                : [],

                                        error:
                                            null
                                    };

                                }
                                catch (error) {

                                    return {
                                        fecha:
                                            fechaISO,

                                        horario:
                                            horario,

                                        data:
                                            [],

                                        error:
                                            error
                                    };

                                }

                            }
                        )

                )

            );


        // ----------------------------------------------------
        // ORGANIZAR RESULTADOS
        // ----------------------------------------------------

        const mapa =
            new Map();


        resultados.forEach(
            (resultado) => {

                const clave =
                    `${resultado.fecha}|${resultado.horario}`;


                mapa.set(
                    clave,
                    resultado
                );

            }
        );


        // ----------------------------------------------------
        // RENDERIZAR LAS 3 TABLAS
        // ----------------------------------------------------

        renderizarTablaDisponibilidad(
            "tablaManana",
            "09:00-12:00",
            fechas,
            mapa
        );


        renderizarTablaDisponibilidad(
            "tablaTarde",
            "14:00-17:00",
            fechas,
            mapa
        );


        renderizarTablaDisponibilidad(
            "tablaNoche",
            "19:00-21:30",
            fechas,
            mapa
        );


        // ----------------------------------------------------
        // LISTADO DE RESERVAS PUNTUALES
        // ----------------------------------------------------

        await cargarReservasSemana();

    }
    catch (error) {

        console.error(
            "Error cargando vista semanal:",
            error
        );


        mostrarMensajeGlobal(
            error.message ||
            "No se pudo cargar la disponibilidad semanal.",
            "error"
        );

    }

}



// ============================================================
// 73. RENDERIZAR TABLA DE DISPONIBILIDAD
// ============================================================

function renderizarTablaDisponibilidad(
    idTabla,
    horario,
    fechas,
    mapa
) {

    const tabla =
        elemento(idTabla);


    if (!tabla) {
        return;
    }


    const espacios =
        obtenerEspaciosActivos();


    if (espacios.length === 0) {

        tabla.innerHTML =
            `
            <tr>

                <td
                    colspan="6"
                    class="tabla-vacia"
                >
                    No existen aulas o laboratorios habilitados.
                </td>

            </tr>
            `;

        return;

    }


    tabla.innerHTML =
        espacios
            .map(
                (espacio) => {

                    const icono =
                        espacio.tipo ===
                        "laboratorio"
                            ? "🔬"
                            : "🏫";


                    const celdas =
                        fechas
                            .map(
                                (fecha) => {

                                    const fechaISO =
                                        fechaLocalISO(
                                            fecha
                                        );


                                    const clave =
                                        `${fechaISO}|${horario}`;


                                    const resultado =
                                        mapa.get(
                                            clave
                                        );


                                    return construirCeldaDisponibilidad(
                                        espacio,
                                        fechaISO,
                                        horario,
                                        resultado
                                    );

                                }
                            )
                            .join("");


                    return `
                        <tr>

                            <th
                                scope="row"
                                class="celda-nombre-espacio"
                            >

                                <span class="espacio-icono-tabla">
                                    ${icono}
                                </span>

                                <div>

                                    <strong>
                                        ${escaparHTML(
                                            espacio.nombre
                                        )}
                                    </strong>

                                    <small>
                                        ${escaparHTML(
                                            nombreTipoEspacio(
                                                espacio.tipo
                                            )
                                        )}
                                    </small>

                                </div>

                            </th>

                            ${celdas}

                        </tr>
                    `;

                }
            )
            .join("");

}



// ============================================================
// 74. CONSTRUIR CELDA DE DISPONIBILIDAD
// ============================================================

function construirCeldaDisponibilidad(
    espacio,
    fechaISO,
    horario,
    resultado
) {

    // --------------------------------------------------------
    // SIN GESTIÓN / ERROR
    // --------------------------------------------------------

    if (
        !resultado ||
        resultado.error
    ) {

        return `
            <td class="celda-disponibilidad celda-sin-gestion">

                <div class="estado-disponibilidad">

                    <strong>
                        SIN GESTIÓN
                    </strong>

                    <small>
                        ${formatearFecha(
                            fechaISO
                        )}
                    </small>

                </div>

            </td>
        `;

    }


    // --------------------------------------------------------
    // BUSCAR ESTE ESPACIO EN EL RPC
    // --------------------------------------------------------

    const disponibilidad =
        resultado.data.find(
            (item) =>
                Number(item.espacio_id) ===
                Number(espacio.id)
        );


    if (!disponibilidad) {

        return `
            <td class="celda-disponibilidad celda-sin-gestion">

                <div class="estado-disponibilidad">

                    <strong>
                        NO DISPONIBLE
                    </strong>

                </div>

            </td>
        `;

    }


    // --------------------------------------------------------
    // LIBRE
    // --------------------------------------------------------

    if (
        disponibilidad.disponible === true
    ) {

        return `
            <td class="celda-disponibilidad celda-libre">

                <div class="estado-disponibilidad">

                    <strong>
                        LIBRE
                    </strong>

                    <small>
                        Disponible
                    </small>

                </div>

            </td>
        `;

    }


    // --------------------------------------------------------
    // ASIGNACIÓN FIJA
    // --------------------------------------------------------

    if (
        disponibilidad.tipo_ocupacion ===
        "asignacion"
    ) {

        return `
            <td class="celda-disponibilidad celda-asignacion">

                <div class="estado-disponibilidad">

                    <strong>
                        ASIGNACIÓN FIJA
                    </strong>

                    <span class="docente-disponibilidad">
                        ${escaparHTML(
                            disponibilidad.docente_nombre ||
                            "Docente"
                        )}
                    </span>

                </div>

            </td>
        `;

    }


    // --------------------------------------------------------
    // RESERVA PUNTUAL
    // --------------------------------------------------------

    if (
        disponibilidad.tipo_ocupacion ===
        "reserva"
    ) {

        return `
            <td class="celda-disponibilidad celda-reservada">

                <div class="estado-disponibilidad">

                    <strong>
                        RESERVADO
                    </strong>

                    <span class="docente-disponibilidad">
                        ${escaparHTML(
                            disponibilidad.docente_nombre ||
                            "Docente"
                        )}
                    </span>

                </div>

            </td>
        `;

    }


    // --------------------------------------------------------
    // OCUPACIÓN NO IDENTIFICADA
    // --------------------------------------------------------

    return `
        <td class="celda-disponibilidad celda-ocupada">

            <div class="estado-disponibilidad">

                <strong>
                    OCUPADO
                </strong>

                <span class="docente-disponibilidad">
                    ${escaparHTML(
                        disponibilidad.docente_nombre ||
                        ""
                    )}
                </span>

            </div>

        </td>
    `;

}



// ============================================================
// 75. CARGAR RESERVAS PUNTUALES DE LA SEMANA
// ============================================================

async function cargarReservasSemana() {

    const tabla =
        elemento(
            "tablaReservasAdmin"
        );


    if (!tabla) {
        return;
    }


    if (!lunesSemanaActual) {

        lunesSemanaActual =
            obtenerLunes(
                new Date()
            );

    }


    const viernes =
        sumarDias(
            lunesSemanaActual,
            4
        );


    const fechaInicio =
        fechaLocalISO(
            lunesSemanaActual
        );


    const fechaFin =
        fechaLocalISO(
            viernes
        );


    tabla.innerHTML =
        `
        <tr>

            <td
                colspan="6"
                class="tabla-cargando"
            >
                Cargando reservas...
            </td>

        </tr>
        `;


    const {
        data,
        error
    } = await supabaseClient
        .from("reservas_aulas")
        .select(
            `
            id,
            gestion_id,
            espacio_id,
            usuario_id,
            fecha,
            horario,
            estado,
            created_at,
            updated_at
            `
        )
        .gte(
            "fecha",
            fechaInicio
        )
        .lte(
            "fecha",
            fechaFin
        )
        .order(
            "fecha",
            {
                ascending: true
            }
        )
        .order(
            "horario",
            {
                ascending: true
            }
        );


    if (error) {

        tabla.innerHTML =
            `
            <tr>

                <td
                    colspan="6"
                    class="tabla-error"
                >
                    No se pudieron cargar las reservas.
                </td>

            </tr>
            `;


        throw new Error(
            mensajeErrorSupabase(
                error,
                "No se pudieron cargar las reservas."
            )
        );

    }


    const reservas =
        Array.isArray(data)
            ? data
            : [];


    renderizarReservasSemana(
        reservas
    );

}



// ============================================================
// 76. RENDERIZAR RESERVAS PUNTUALES
// ============================================================

function renderizarReservasSemana(
    reservas
) {

    const tabla =
        elemento(
            "tablaReservasAdmin"
        );


    if (!tabla) {
        return;
    }


    if (
        !Array.isArray(reservas) ||
        reservas.length === 0
    ) {

        tabla.innerHTML =
            `
            <tr>

                <td
                    colspan="6"
                    class="tabla-vacia"
                >
                    No existen reservas puntuales
                    durante esta semana.
                </td>

            </tr>
            `;

        return;

    }


    tabla.innerHTML =
        reservas
            .map(
                (reserva) => {

                    const espacio =
                        obtenerEspacioPorId(
                            reserva.espacio_id
                        );


                    // ----------------------------------------
                    // El nombre del docente puede obtenerse
                    // de los docentes cargados.
                    // ----------------------------------------

                    const docente =
                        obtenerDocentePorId(
                            reserva.usuario_id
                        );


                    const estado =
                        reserva.estado ===
                        "cancelada"
                            ? "Cancelada"
                            : "Reservada";


                    const claseEstado =
                        reserva.estado ===
                        "cancelada"
                            ? "estado-inactivo"
                            : "estado-reservado";


                    const acciones =
                        reserva.estado ===
                        "reservada"
                            ? `
                                <div class="acciones-tabla">

                                    <button
                                        type="button"
                                        class="btn-tabla btn-editar"
                                        data-accion="editar-reserva"
                                        data-reserva='${escaparHTML(
                                            JSON.stringify(
                                                reserva
                                            )
                                        )}'
                                    >
                                        Editar
                                    </button>


                                    <button
                                        type="button"
                                        class="btn-tabla btn-eliminar"
                                        data-accion="cancelar-reserva"
                                        data-reserva='${escaparHTML(
                                            JSON.stringify(
                                                reserva
                                            )
                                        )}'
                                    >
                                        Cancelar
                                    </button>

                                </div>
                            `
                            : `
                                <span class="texto-secundario">
                                    Sin acciones
                                </span>
                            `;


                    return `
                        <tr>

                            <td>
                                <strong>
                                    ${formatearFecha(
                                        reserva.fecha
                                    )}
                                </strong>
                            </td>


                            <td>
                                ${escaparHTML(
                                    formatoHorario(
                                        reserva.horario
                                    )
                                )}
                            </td>


                            <td>
                                ${escaparHTML(
                                    espacio?.nombre ||
                                    "Espacio"
                                )}
                            </td>


                            <td>
                                ${escaparHTML(
                                    docente?.nombre ||
                                    "Docente"
                                )}
                            </td>


                            <td>

                                <span
                                    class="estado-badge ${claseEstado}"
                                >
                                    ${estado}
                                </span>

                            </td>


                            <td>
                                ${acciones}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");


    // --------------------------------------------------------
    // EDITAR RESERVA
    // --------------------------------------------------------

    tabla
        .querySelectorAll(
            '[data-accion="editar-reserva"]'
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        try {

                            const reserva =
                                JSON.parse(
                                    boton.dataset.reserva
                                );


                            abrirEdicionReserva(
                                reserva
                            );

                        }
                        catch (error) {

                            console.error(error);


                            mostrarMensajeGlobal(
                                "No se pudo abrir la reserva.",
                                "error"
                            );

                        }

                    }
                );

            }
        );


    // --------------------------------------------------------
    // CANCELAR RESERVA
    // --------------------------------------------------------

    tabla
        .querySelectorAll(
            '[data-accion="cancelar-reserva"]'
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        try {

                            const reserva =
                                JSON.parse(
                                    boton.dataset.reserva
                                );


                            abrirCancelarReserva(
                                reserva
                            );

                        }
                        catch (error) {

                            console.error(error);


                            mostrarMensajeGlobal(
                                "No se pudo abrir la reserva.",
                                "error"
                            );

                        }

                    }
                );

            }
        );

}



// ============================================================
// 77. ABRIR EDICIÓN DE RESERVA
// ============================================================

function abrirEdicionReserva(
    reserva
) {

    if (!reserva?.id) {

        mostrarMensajeGlobal(
            "Reserva no válida.",
            "error"
        );

        return;

    }


    llenarSelectoresEspacios();


    elemento(
        "editarReservaId"
    ).value =
        String(
            reserva.id
        );


    elemento(
        "editarReservaEspacio"
    ).value =
        String(
            reserva.espacio_id
        );


    elemento(
        "editarReservaFecha"
    ).value =
        reserva.fecha;


    elemento(
        "editarReservaHorario"
    ).value =
        reserva.horario;


    const docente =
        obtenerDocentePorId(
            reserva.usuario_id
        );


    elemento(
        "editarReservaDocenteInfo"
    ).textContent =
        `Docente: ${
            docente?.nombre ||
            "Docente"
        }`;


    mostrarMensajeFormulario(
        "mensajeEditarReserva",
        ""
    );


    abrirModal(
        "modalEditarReserva"
    );

}



// ============================================================
// 78. GUARDAR EDICIÓN DE RESERVA
// ============================================================

async function guardarEdicionReserva(
    event
) {

    event.preventDefault();


    const reservaId =
        Number(
            elemento(
                "editarReservaId"
            ).value
        );


    const espacioId =
        Number(
            elemento(
                "editarReservaEspacio"
            ).value
        );


    const fecha =
        elemento(
            "editarReservaFecha"
        ).value;


    const horario =
        elemento(
            "editarReservaHorario"
        ).value;


    if (
        !reservaId ||
        !espacioId ||
        !fecha ||
        !horario
    ) {

        mostrarMensajeFormulario(
            "mensajeEditarReserva",
            "Complete todos los datos.",
            "error"
        );

        return;

    }


    const fechaObjeto =
        crearFechaLocal(
            fecha
        );


    if (
        !fechaObjeto ||
        fechaObjeto.getDay() === 0 ||
        fechaObjeto.getDay() === 6
    ) {

        mostrarMensajeFormulario(
            "mensajeEditarReserva",
            "Las reservas solo pueden realizarse de lunes a viernes.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnGuardarReserva"
        );


    boton.disabled =
        true;


    boton.textContent =
        "Guardando...";


    mostrarMensajeFormulario(
        "mensajeEditarReserva",
        ""
    );


    try {

        const {
            error
        } = await supabaseClient
            .rpc(
                "editar_reserva_aula",
                {
                    p_reserva_id:
                        reservaId,

                    p_espacio_id:
                        espacioId,

                    p_fecha:
                        fecha,

                    p_horario:
                        horario
                }
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudo editar la reserva."
                )
            );

        }


        cerrarModal(
            "modalEditarReserva"
        );


        mostrarMensajeGlobal(
            "Reserva actualizada correctamente."
        );


        await cargarVistaSemanal();

    }
    catch (error) {

        console.error(error);


        mostrarMensajeFormulario(
            "mensajeEditarReserva",
            error.message ||
            "No se pudo editar la reserva.",
            "error"
        );

    }
    finally {

        boton.disabled =
            false;


        boton.textContent =
            "Guardar cambios";

    }

}



// ============================================================
// 79. ABRIR CANCELACIÓN DE RESERVA
// ============================================================

function abrirCancelarReserva(
    reserva
) {

    if (!reserva?.id) {

        mostrarMensajeGlobal(
            "Reserva no válida.",
            "error"
        );

        return;

    }


    const espacio =
        obtenerEspacioPorId(
            reserva.espacio_id
        );


    const docente =
        obtenerDocentePorId(
            reserva.usuario_id
        );


    elemento(
        "cancelarReservaId"
    ).value =
        String(
            reserva.id
        );


    elemento(
        "infoCancelarReserva"
    ).innerHTML =
        `
        <strong>
            ${escaparHTML(
                espacio?.nombre ||
                "Espacio"
            )}
        </strong>

        <span>
            ${formatearFecha(
                reserva.fecha
            )}
            ·
            ${escaparHTML(
                formatoHorario(
                    reserva.horario
                )
            )}
        </span>

        <span>
            ${escaparHTML(
                docente?.nombre ||
                "Docente"
            )}
        </span>
        `;


    mostrarMensajeFormulario(
        "mensajeCancelarReserva",
        ""
    );


    abrirModal(
        "modalCancelarReserva"
    );

}



// ============================================================
// 80. CONFIRMAR CANCELACIÓN DE RESERVA
// ============================================================

async function cancelarReserva() {

    const reservaId =
        Number(
            elemento(
                "cancelarReservaId"
            ).value
        );


    if (!reservaId) {

        mostrarMensajeFormulario(
            "mensajeCancelarReserva",
            "Reserva no válida.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnConfirmarCancelarReserva"
        );


    boton.disabled =
        true;


    boton.textContent =
        "Cancelando...";


    mostrarMensajeFormulario(
        "mensajeCancelarReserva",
        ""
    );


    try {

        const {
            error
        } = await supabaseClient
            .rpc(
                "cancelar_reserva_aula",
                {
                    p_reserva_id:
                        reservaId
                }
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudo cancelar la reserva."
                )
            );

        }


        cerrarModal(
            "modalCancelarReserva"
        );


        mostrarMensajeGlobal(
            "Reserva cancelada correctamente."
        );


        await cargarVistaSemanal();

    }
    catch (error) {

        console.error(error);


        mostrarMensajeFormulario(
            "mensajeCancelarReserva",
            error.message ||
            "No se pudo cancelar la reserva.",
            "error"
        );

    }
    finally {

        boton.disabled =
            false;


        boton.textContent =
            "Sí, cancelar reserva";

    }

}



// ============================================================
// 81. EVENTOS DE RESERVAS ADMINISTRATIVAS
// ============================================================

function configurarEventosReservas() {

    elemento(
        "formEditarReserva"
    )?.addEventListener(
        "submit",
        guardarEdicionReserva
    );


    elemento(
        "btnConfirmarCancelarReserva"
    )?.addEventListener(
        "click",
        cancelarReserva
    );

}



// ============================================================
// 82. OBTENER DISPONIBILIDAD DE UNA FECHA
//
// Se deja como función auxiliar para reutilizar posteriormente.
// ============================================================

async function obtenerDisponibilidadFecha(
    fecha,
    horario
) {

    const {
        data,
        error
    } = await supabaseClient
        .rpc(
            "obtener_disponibilidad_aulas",
            {
                p_fecha:
                    fecha,

                p_horario:
                    horario
            }
        );


    if (error) {

        throw new Error(
            mensajeErrorSupabase(
                error,
                "No se pudo consultar la disponibilidad."
            )
        );

    }


    return Array.isArray(data)
        ? data
        : [];

}



// ============================================================
// 83. COMPROBAR DISPONIBILIDAD DE UN ESPACIO
// ============================================================

async function espacioDisponible(
    espacioId,
    fecha,
    horario
) {

    const disponibilidad =
        await obtenerDisponibilidadFecha(
            fecha,
            horario
        );


    const espacio =
        disponibilidad.find(
            (item) =>
                Number(item.espacio_id) ===
                Number(espacioId)
        );


    return (
        espacio?.disponible === true
    );

}



// ============================================================
// 84. PREPARAR MÓDULO DE RESERVAS
// ============================================================

async function prepararModuloReservas() {

    configurarSemanaInicial();


    await cargarVistaSemanal();

}
// ============================================================
// 85. CARGAR OBSERVACIONES
// ============================================================

async function cargarObservaciones() {

    const contenedor =
        elemento("listaObservaciones");


    if (contenedor) {

        contenedor.innerHTML =
            `
            <div class="estado-vacio">
                Cargando observaciones...
            </div>
            `;

    }


    try {

        await asegurarEspaciosCargados();


        const {
            data,
            error
        } = await supabaseClient
            .rpc(
                "obtener_observaciones_aulas_admin"
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudieron cargar las observaciones."
                )
            );

        }


        observacionesAulas =
            Array.isArray(data)
                ? data
                : [];


        actualizarResumenObservaciones();

        renderizarObservaciones();

    }
    catch (error) {

        console.error(
            "Error cargando observaciones:",
            error
        );


        if (contenedor) {

            contenedor.innerHTML =
                `
                <div class="estado-vacio estado-error">
                    ${escaparHTML(
                        error.message ||
                        "No se pudieron cargar las observaciones."
                    )}
                </div>
                `;

        }


        throw error;

    }

}



// ============================================================
// 86. ACTUALIZAR RESUMEN DE OBSERVACIONES
// ============================================================

function actualizarResumenObservaciones() {

    const pendientes =
        observacionesAulas.filter(
            (observacion) =>
                observacion.estado ===
                "pendiente"
        ).length;


    const atendidas =
        observacionesAulas.filter(
            (observacion) =>
                observacion.estado ===
                "atendida"
        ).length;


    const total =
        observacionesAulas.length;


    if (
        elemento(
            "totalObservacionesPendientes"
        )
    ) {

        elemento(
            "totalObservacionesPendientes"
        ).textContent =
            String(pendientes);

    }


    if (
        elemento(
            "totalObservacionesAtendidas"
        )
    ) {

        elemento(
            "totalObservacionesAtendidas"
        ).textContent =
            String(atendidas);

    }


    if (
        elemento(
            "totalObservaciones"
        )
    ) {

        elemento(
            "totalObservaciones"
        ).textContent =
            String(total);

    }


    actualizarContadorObservaciones(
        pendientes
    );

}



// ============================================================
// 87. CONTADOR DE OBSERVACIONES PENDIENTES
// ============================================================

function actualizarContadorObservaciones(
    cantidad
) {

    const contador =
        elemento(
            "contadorObservaciones"
        );


    if (!contador) {
        return;
    }


    contador.textContent =
        String(cantidad);


    if (cantidad > 0) {

        contador.classList.remove(
            "oculto"
        );

    }
    else {

        contador.classList.add(
            "oculto"
        );

    }

}



// ============================================================
// 88. FILTRAR OBSERVACIONES
// ============================================================

function obtenerObservacionesFiltradas() {

    const estado =
        elemento(
            "filtroObservacionEstado"
        )?.value || "";


    const espacioId =
        elemento(
            "filtroObservacionEspacio"
        )?.value || "";


    return observacionesAulas.filter(
        (observacion) => {

            const coincideEstado =
                !estado
                ||
                observacion.estado ===
                estado;


            const coincideEspacio =
                !espacioId
                ||
                Number(
                    observacion.espacio_id
                ) ===
                Number(
                    espacioId
                );


            return (
                coincideEstado &&
                coincideEspacio
            );

        }
    );

}



// ============================================================
// 89. RENDERIZAR OBSERVACIONES
// ============================================================

function renderizarObservaciones() {

    const contenedor =
        elemento(
            "listaObservaciones"
        );


    if (!contenedor) {
        return;
    }


    const lista =
        obtenerObservacionesFiltradas();


    if (lista.length === 0) {

        contenedor.innerHTML =
            `
            <div class="estado-vacio">

                No existen observaciones
                para los filtros seleccionados.

            </div>
            `;

        return;

    }


    contenedor.innerHTML =
        lista
            .map(
                (observacion) => {

                    const pendiente =
                        observacion.estado ===
                        "pendiente";


                    const claseEstado =
                        pendiente
                            ? "observacion-pendiente"
                            : "observacion-atendida";


                    const textoEstado =
                        pendiente
                            ? "Pendiente"
                            : "Atendida";


                    const icono =
                        pendiente
                            ? "⚠️"
                            : "✅";


                    const respuesta =
                        observacion.respuesta_admin
                            ? `
                                <div class="respuesta-observacion">

                                    <span>
                                        Respuesta administrativa
                                    </span>

                                    <p>
                                        ${escaparHTML(
                                            observacion.respuesta_admin
                                        )}
                                    </p>

                                </div>
                            `
                            : "";


                    return `
                        <article
                            class="tarjeta-observacion ${claseEstado}"
                        >

                            <div class="observacion-cabecera">

                                <div class="observacion-titulo">

                                    <span class="observacion-icono">
                                        ${icono}
                                    </span>


                                    <div>

                                        <span class="observacion-tipo">
                                            ${escaparHTML(
                                                nombreTipoEspacio(
                                                    observacion.espacio_tipo
                                                )
                                            )}
                                        </span>

                                        <h3>
                                            ${escaparHTML(
                                                observacion.espacio_nombre ||
                                                "Espacio"
                                            )}
                                        </h3>

                                    </div>

                                </div>


                                <span
                                    class="estado-badge ${
                                        pendiente
                                            ? "estado-pendiente"
                                            : "estado-activo"
                                    }"
                                >
                                    ${textoEstado}
                                </span>

                            </div>


                            <div class="observacion-datos">

                                <div>

                                    <span>
                                        Docente
                                    </span>

                                    <strong>
                                        ${escaparHTML(
                                            observacion.docente_nombre ||
                                            "Docente"
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Fecha del reporte
                                    </span>

                                    <strong>
                                        ${formatearFechaHora(
                                            observacion.created_at
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div class="observacion-contenido">

                                <span>
                                    Observación
                                </span>

                                <p>
                                    ${escaparHTML(
                                        observacion.observacion
                                    )}
                                </p>

                            </div>


                            ${respuesta}


                            <div class="observacion-acciones">

                                <button
                                    type="button"
                                    class="btn-secundario"
                                    data-accion="gestionar-observacion"
                                    data-id="${observacion.observacion_id}"
                                >
                                    ${
                                        pendiente
                                            ? "Atender"
                                            : "Ver / editar"
                                    }
                                </button>


                                <button
                                    type="button"
                                    class="btn-peligro-suave"
                                    data-accion="eliminar-observacion"
                                    data-id="${observacion.observacion_id}"
                                >
                                    Eliminar
                                </button>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");


    // --------------------------------------------------------
    // GESTIONAR
    // --------------------------------------------------------

    contenedor
        .querySelectorAll(
            '[data-accion="gestionar-observacion"]'
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        abrirGestionObservacion(
                            Number(
                                boton.dataset.id
                            )
                        );

                    }
                );

            }
        );


    // --------------------------------------------------------
    // ELIMINAR
    // --------------------------------------------------------

    contenedor
        .querySelectorAll(
            '[data-accion="eliminar-observacion"]'
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        abrirEliminarObservacion(
                            Number(
                                boton.dataset.id
                            )
                        );

                    }
                );

            }
        );

}



// ============================================================
// 90. FORMATEAR FECHA Y HORA
// ============================================================

function formatearFechaHora(
    fechaValor
) {

    if (!fechaValor) {
        return "—";
    }


    const fecha =
        new Date(
            fechaValor
        );


    if (
        Number.isNaN(
            fecha.getTime()
        )
    ) {

        return "—";

    }


    return fecha.toLocaleString(
        "es-BO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}



// ============================================================
// 91. BUSCAR OBSERVACIÓN POR ID
// ============================================================

function obtenerObservacionPorId(
    observacionId
) {

    return (
        observacionesAulas.find(
            (observacion) =>
                Number(
                    observacion.observacion_id
                ) ===
                Number(
                    observacionId
                )
        )
        ||
        null
    );

}



// ============================================================
// 92. ABRIR OBSERVACIÓN
// ============================================================

function abrirGestionObservacion(
    observacionId
) {

    const observacion =
        obtenerObservacionPorId(
            observacionId
        );


    if (!observacion) {

        mostrarMensajeGlobal(
            "No se encontró la observación.",
            "error"
        );

        return;

    }


    elemento(
        "observacionId"
    ).value =
        String(
            observacion.observacion_id
        );


    elemento(
        "observacionEspacio"
    ).textContent =
        observacion.espacio_nombre ||
        "—";


    elemento(
        "observacionDocente"
    ).textContent =
        observacion.docente_nombre ||
        "Docente";


    elemento(
        "observacionFecha"
    ).textContent =
        formatearFechaHora(
            observacion.created_at
        );


    elemento(
        "observacionTexto"
    ).textContent =
        observacion.observacion ||
        "—";


    elemento(
        "observacionEstado"
    ).value =
        observacion.estado;


    elemento(
        "observacionRespuesta"
    ).value =
        observacion.respuesta_admin ||
        "";


    mostrarMensajeFormulario(
        "mensajeObservacion",
        ""
    );


    abrirModal(
        "modalObservacion"
    );

}



// ============================================================
// 93. GUARDAR OBSERVACIÓN
// ============================================================

async function guardarObservacion(
    event
) {

    event.preventDefault();


    const observacionId =
        Number(
            elemento(
                "observacionId"
            ).value
        );


    const estado =
        elemento(
            "observacionEstado"
        ).value;


    const respuesta =
        elemento(
            "observacionRespuesta"
        ).value.trim();


    if (!observacionId) {

        mostrarMensajeFormulario(
            "mensajeObservacion",
            "Observación no válida.",
            "error"
        );

        return;

    }


    if (
        ![
            "pendiente",
            "atendida"
        ].includes(
            estado
        )
    ) {

        mostrarMensajeFormulario(
            "mensajeObservacion",
            "Seleccione un estado válido.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnGuardarObservacion"
        );


    boton.disabled =
        true;


    boton.textContent =
        "Guardando...";


    mostrarMensajeFormulario(
        "mensajeObservacion",
        ""
    );


    try {

        const {
            error
        } = await supabaseClient
            .rpc(
                "actualizar_observacion_aula",
                {
                    p_observacion_id:
                        observacionId,

                    p_estado:
                        estado,

                    p_respuesta_admin:
                        respuesta || null
                }
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudo actualizar la observación."
                )
            );

        }


        cerrarModal(
            "modalObservacion"
        );


        await cargarObservaciones();


        mostrarMensajeGlobal(
            estado === "atendida"
                ? "Observación marcada como atendida."
                : "Observación actualizada correctamente."
        );

    }
    catch (error) {

        console.error(error);


        mostrarMensajeFormulario(
            "mensajeObservacion",
            error.message ||
            "No se pudo actualizar la observación.",
            "error"
        );

    }
    finally {

        boton.disabled =
            false;


        boton.textContent =
            "Guardar";

    }

}



// ============================================================
// 94. ABRIR ELIMINAR OBSERVACIÓN
// ============================================================

function abrirEliminarObservacion(
    observacionId
) {

    const observacion =
        obtenerObservacionPorId(
            observacionId
        );


    if (!observacion) {

        mostrarMensajeGlobal(
            "No se encontró la observación.",
            "error"
        );

        return;

    }


    elemento(
        "eliminarObservacionId"
    ).value =
        String(
            observacion.observacion_id
        );


    mostrarMensajeFormulario(
        "mensajeEliminarObservacion",
        ""
    );


    abrirModal(
        "modalEliminarObservacion"
    );

}



// ============================================================
// 95. ELIMINAR OBSERVACIÓN
// ============================================================

async function eliminarObservacion() {

    const observacionId =
        Number(
            elemento(
                "eliminarObservacionId"
            ).value
        );


    if (!observacionId) {

        mostrarMensajeFormulario(
            "mensajeEliminarObservacion",
            "Observación no válida.",
            "error"
        );

        return;

    }


    const boton =
        elemento(
            "btnConfirmarEliminarObservacion"
        );


    boton.disabled =
        true;


    boton.textContent =
        "Eliminando...";


    try {

        const {
            error
        } = await supabaseClient
            .rpc(
                "eliminar_observacion_aula",
                {
                    p_observacion_id:
                        observacionId
                }
            );


        if (error) {

            throw new Error(
                mensajeErrorSupabase(
                    error,
                    "No se pudo eliminar la observación."
                )
            );

        }


        cerrarModal(
            "modalEliminarObservacion"
        );


        await cargarObservaciones();


        mostrarMensajeGlobal(
            "Observación eliminada correctamente."
        );

    }
    catch (error) {

        console.error(error);


        mostrarMensajeFormulario(
            "mensajeEliminarObservacion",
            error.message ||
            "No se pudo eliminar la observación.",
            "error"
        );

    }
    finally {

        boton.disabled =
            false;


        boton.textContent =
            "Eliminar";

    }

}



// ============================================================
// 96. FILTROS DE OBSERVACIONES
// ============================================================

function aplicarFiltrosObservaciones() {

    renderizarObservaciones();

}



// ============================================================
// 97. ACTUALIZAR OBSERVACIONES MANUALMENTE
// ============================================================

async function actualizarObservacionesManual() {

    try {

        await cargarObservaciones();


        mostrarMensajeGlobal(
            "Observaciones actualizadas."
        );

    }
    catch (error) {

        console.error(error);


        mostrarMensajeGlobal(
            error.message ||
            "No se pudieron actualizar las observaciones.",
            "error"
        );

    }

}



// ============================================================
// 98. EVENTOS DE OBSERVACIONES
// ============================================================

function configurarEventosObservaciones() {

    elemento(
        "btnActualizarObservaciones"
    )?.addEventListener(
        "click",
        actualizarObservacionesManual
    );


    elemento(
        "filtroObservacionEstado"
    )?.addEventListener(
        "change",
        aplicarFiltrosObservaciones
    );


    elemento(
        "filtroObservacionEspacio"
    )?.addEventListener(
        "change",
        aplicarFiltrosObservaciones
    );


    elemento(
        "formActualizarObservacion"
    )?.addEventListener(
        "submit",
        guardarObservacion
    );


    elemento(
        "btnConfirmarEliminarObservacion"
    )?.addEventListener(
        "click",
        eliminarObservacion
    );

}



// ============================================================
// 99. CARGAR CONTADOR DE OBSERVACIONES AL INICIAR
//
// Permite mostrar el número de pendientes aunque el
// administrador todavía no haya abierto esa pestaña.
// ============================================================

async function cargarContadorInicialObservaciones() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .rpc(
                "obtener_observaciones_aulas_admin"
            );


        if (error) {

            console.error(
                "No se pudo cargar contador de observaciones:",
                error
            );

            return;

        }


        observacionesAulas =
            Array.isArray(data)
                ? data
                : [];


        actualizarResumenObservaciones();

    }
    catch (error) {

        console.error(
            "Error contador observaciones:",
            error
        );

    }

}



// ============================================================
// 100. PREPARAR MÓDULO DE OBSERVACIONES
// ============================================================

async function prepararModuloObservaciones() {

    await cargarObservaciones();

}
// ============================================================
// 101. CONFIGURAR TODOS LOS EVENTOS DEL PANEL
// ============================================================

function configurarTodosLosEventos() {

    configurarEventosGenerales();

    configurarEventosEspacios();

    configurarEventosGestion();

    configurarEventosAsignaciones();

    configurarEventosReservas();

    configurarEventosObservaciones();

}



// ============================================================
// 102. PREPARAR INTERFAZ INICIAL
// ============================================================

function prepararInterfazInicial() {

    // --------------------------------------------------------
    // MODO OSCURO
    // --------------------------------------------------------

    cargarModoGuardado();


    // --------------------------------------------------------
    // SEMANA ACTUAL
    // --------------------------------------------------------

    configurarSemanaInicial();


    // --------------------------------------------------------
    // PESTAÑA INICIAL
    // --------------------------------------------------------

    document
        .querySelectorAll(
            ".seccion-tab"
        )
        .forEach(
            (seccion) => {

                seccion.classList.remove(
                    "activa"
                );

            }
        );


    const reservas =
        elemento(
            "tab-reservas"
        );


    if (reservas) {

        reservas.classList.add(
            "activa"
        );

    }


    document
        .querySelectorAll(
            ".btn-tab[data-tab]"
        )
        .forEach(
            (boton) => {

                boton.classList.toggle(
                    "activo",
                    boton.dataset.tab ===
                    "reservas"
                );

            }
        );

}



// ============================================================
// 103. CARGAR DATOS BÁSICOS DEL PANEL
// ============================================================

async function cargarDatosInicialesAdministrador() {

    // --------------------------------------------------------
    // Primero cargamos espacios y docentes.
    //
    // Estos datos son utilizados por prácticamente todo
    // el panel.
    // --------------------------------------------------------

    await Promise.all([
        cargarEspacios(),
        cargarDocentes(),
        cargarGestiones()
    ]);


    // --------------------------------------------------------
    // Cargar asignaciones de la gestión seleccionada
    // --------------------------------------------------------

    await cargarAsignaciones();


    // --------------------------------------------------------
    // Cargar disponibilidad semanal
    // --------------------------------------------------------

    await cargarVistaSemanal();


    // --------------------------------------------------------
    // Cargar contador de observaciones pendientes
    // --------------------------------------------------------

    await cargarContadorInicialObservaciones();

}



// ============================================================
// 104. CONTROLAR CAMBIOS DE AUTENTICACIÓN
// ============================================================

function configurarControlAutenticacion() {

    supabaseClient.auth
        .onAuthStateChange(
            (
                evento,
                sesion
            ) => {

                if (
                    evento ===
                    "SIGNED_OUT"
                ) {

                    window.location.href =
                        "index.html";

                    return;

                }


                if (
                    !sesion &&
                    evento !==
                    "INITIAL_SESSION"
                ) {

                    window.location.href =
                        "index.html";

                }

            }
        );

}



// ============================================================
// 105. MOSTRAR ERROR CRÍTICO
// ============================================================

function mostrarErrorCritico(
    error
) {

    console.error(
        "Error crítico del panel:",
        error
    );


    mostrarMensajeGlobal(
        error?.message ||
        "No se pudo iniciar correctamente el panel.",
        "error"
    );


    const tablas =
        [
            "tablaManana",
            "tablaTarde",
            "tablaNoche"
        ];


    tablas.forEach(
        (idTabla) => {

            const tabla =
                elemento(
                    idTabla
                );


            if (
                tabla &&
                tabla.children.length === 0
            ) {

                tabla.innerHTML =
                    `
                    <tr>

                        <td
                            colspan="6"
                            class="tabla-error"
                        >
                            No se pudo cargar la información.
                        </td>

                    </tr>
                    `;

            }

        }
    );

}



// ============================================================
// 106. INICIAR PANEL ADMINISTRADOR
// ============================================================

async function iniciarPanelAdministrador() {

    mostrarCargando(
        true
    );


    try {

        // ----------------------------------------------------
        // 1. VERIFICAR SESIÓN Y ROL
        // ----------------------------------------------------

        const autorizado =
            await comprobarAdministrador();


        if (!autorizado) {

            return;

        }


        // ----------------------------------------------------
        // 2. PREPARAR INTERFAZ
        // ----------------------------------------------------

        prepararInterfazInicial();


        // ----------------------------------------------------
        // 3. CONECTAR EVENTOS
        // ----------------------------------------------------

        configurarTodosLosEventos();


        // ----------------------------------------------------
        // 4. CONTROLAR SESIÓN
        // ----------------------------------------------------

        configurarControlAutenticacion();


        // ----------------------------------------------------
        // 5. CARGAR DATOS DE SUPABASE
        // ----------------------------------------------------

        await cargarDatosInicialesAdministrador();


        console.log(
            "Panel de reservas de aulas iniciado correctamente."
        );

    }
    catch (error) {

        mostrarErrorCritico(
            error
        );

    }
    finally {

        mostrarCargando(
            false
        );

    }

}



// ============================================================
// 107. INICIAR CUANDO EL HTML ESTÉ LISTO
// ============================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarPanelAdministrador
    );

}
else {

    iniciarPanelAdministrador();

}


// ============================================================
// FIN DE js/admin.js
// CETA - RESERVAS DE AULAS Y LABORATORIOS
// ============================================================
