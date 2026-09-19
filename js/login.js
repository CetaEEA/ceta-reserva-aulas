// ============================================================
// CETA - RESERVAS DE AULAS Y LABORATORIOS
// LOGIN
// ============================================================


// ------------------------------------------------------------
// ELEMENTOS
// ------------------------------------------------------------

const formLogin =
    document.getElementById("formLogin");

const inputUsuario =
    document.getElementById("usuario");

const inputPassword =
    document.getElementById("password");

const btnIngresar =
    document.getElementById("btnIngresar");

const mensajeLogin =
    document.getElementById("mensajeLogin");

const btnMostrarPassword =
    document.getElementById("btnMostrarPassword");



// ============================================================
// MOSTRAR MENSAJE
// ============================================================

function mostrarMensajeLogin(
    mensaje,
    tipo = "error"
) {

    mensajeLogin.textContent = mensaje;

    mensajeLogin.className =
        `mensaje-login mensaje-${tipo}`;

}



// ============================================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ============================================================

btnMostrarPassword.addEventListener(
    "click",
    () => {

        const oculto =
            inputPassword.type === "password";


        inputPassword.type =
            oculto
                ? "text"
                : "password";


        btnMostrarPassword.textContent =
            oculto
                ? "🙈"
                : "👁";

    }
);



// ============================================================
// OBTENER PERFIL
// ============================================================

async function obtenerPerfil(usuarioId) {

    const {
        data,
        error
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
            usuarioId
        )
        .single();


    if (error) {

        console.error(
            "Error obteniendo perfil:",
            error
        );

        throw new Error(
            "No se pudo obtener el perfil del usuario."
        );

    }


    return data;

}



// ============================================================
// REDIRECCIONAR SEGÚN ROL
// ============================================================

function redireccionarSegunRol(perfil) {

    if (!perfil) {

        throw new Error(
            "No se encontró el perfil del usuario."
        );

    }


    if (perfil.activo !== true) {

        throw new Error(
            "El usuario se encuentra deshabilitado."
        );

    }


    if (perfil.rol === "administrador") {

        window.location.href =
            "admin.html";

        return;

    }


    if (perfil.rol === "docente") {

        window.location.href =
            "docente.html";

        return;

    }


    throw new Error(
        "El usuario no tiene un rol autorizado."
    );

}



// ============================================================
// LOGIN
// ============================================================

formLogin.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const usuario =
            inputUsuario.value
                .trim()
                .toLowerCase();


        const password =
            inputPassword.value;


        if (!usuario) {

            mostrarMensajeLogin(
                "Ingrese su usuario."
            );

            inputUsuario.focus();

            return;

        }


        if (!password) {

            mostrarMensajeLogin(
                "Ingrese su contraseña."
            );

            inputPassword.focus();

            return;

        }


        btnIngresar.disabled = true;

        btnIngresar.textContent =
            "Ingresando...";


        mostrarMensajeLogin(
            "Verificando usuario...",
            "info"
        );


        try {

            // ------------------------------------------------
            // MISMO SISTEMA DE USUARIOS CETA
            // ------------------------------------------------

            const emailInterno =
                `${usuario}@ceta.internal`;


            const {
                data,
                error
            } = await supabaseClient.auth
                .signInWithPassword({

                    email:
                        emailInterno,

                    password:
                        password

                });


            if (error) {

                console.error(
                    "Error login:",
                    error
                );

                throw new Error(
                    "Usuario o contraseña incorrectos."
                );

            }


            if (
                !data ||
                !data.user
            ) {

                throw new Error(
                    "No se pudo iniciar sesión."
                );

            }


            // ------------------------------------------------
            // OBTENER PERFIL
            // ------------------------------------------------

            const perfil =
                await obtenerPerfil(
                    data.user.id
                );


            // ------------------------------------------------
            // VALIDAR QUE EL NOMBRE DE USUARIO COINCIDA
            // ------------------------------------------------

            if (
                perfil.usuario &&
                perfil.usuario
                    .toLowerCase() !== usuario
            ) {

                await supabaseClient.auth
                    .signOut();

                throw new Error(
                    "El perfil no corresponde al usuario ingresado."
                );

            }


            mostrarMensajeLogin(
                `Bienvenido, ${perfil.nombre || usuario}.`,
                "exito"
            );


            // ------------------------------------------------
            // REDIRECCIONAR
            // ------------------------------------------------

            redireccionarSegunRol(
                perfil
            );

        }

        catch (error) {

            console.error(error);


            mostrarMensajeLogin(
                error.message ||
                "No se pudo iniciar sesión."
            );


            btnIngresar.disabled = false;

            btnIngresar.textContent =
                "Ingresar";

        }

    }
);



// ============================================================
// COMPROBAR SI YA EXISTE SESIÓN
//
// Si el usuario vuelve al index teniendo una sesión activa,
// no será necesario volver a ingresar contraseña.
// ============================================================

async function comprobarSesionExistente() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth
            .getSession();


        if (error) {

            console.error(
                "Error comprobando sesión:",
                error
            );

            return;

        }


        const session =
            data?.session;


        if (!session?.user) {

            return;

        }


        const perfil =
            await obtenerPerfil(
                session.user.id
            );


        redireccionarSegunRol(
            perfil
        );

    }

    catch (error) {

        console.error(
            "No se pudo recuperar la sesión:",
            error
        );

    }

}



// ============================================================
// INICIAR
// ============================================================

comprobarSesionExistente();
