// ============================================================
// CETA - RESERVAS DE AULAS Y LABORATORIOS
// CONEXIÓN A SUPABASE
// ============================================================


// ------------------------------------------------------------
// IMPORTANTE
//
// Utilizar la MISMA URL y la MISMA ANON / PUBLISHABLE KEY
// que utiliza el resto de sistemas CETA.
//
// NUNCA colocar aquí SERVICE_ROLE.
// ------------------------------------------------------------

const SUPABASE_URL = "https://cystgztmeyinsvmkkbji.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_4n5HfbFA8otKAg_X3ic8ig_VZzCqgH1";


// ------------------------------------------------------------
// CREAR CLIENTE
// ------------------------------------------------------------

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
