import englishMessages from 'ra-language-english';

export const es = {
    ...englishMessages,
    wg: {
        demo:{
            msg: "Parece que has hecho clic en un enlace que creará el proyecto de demostración. ¿Deseas continuar con la demo o comenzar un nuevo proyecto?",
            start_new: "Comenzar Nuevo",
            start_demo: "Generar Demo",
            settings_title: "Configuración Avanzada",
        },
        create: {
            "desc": "Crea tu sistema describiéndolo en el prompt.",
            "advanced_title": "Configuración Avanzada",
            "business_logic": "Lógica de Negocio",
            "logic_prompt": "Prompt de Lógica",
            "prompt_label": 'Describe tu aplicación, por ejemplo "concesionario de autos"',
            "data_model_size": "Tamaño del Modelo de Datos",
            "create_landing_page": "Crear Página de Inicio",
            "push_to_github": "Subir a Github",
            "create_update_timestamping": "Crear y Actualizar Marcas de Tiempo",
            "optimistic_locking": "Bloqueo Optimista",
            "authentication_authorization": "Autenticación y Autorización",
            "show_more": "Mostrar Más",
            "log_files": "Archivos de Registro",
            "project_name": "Nombre del Proyecto",
            "domain_logic_help": "Lógica de dominio, seguridad, tamaño del modelo, etc.",
            "example_prompt": "Ejemplo: \"lista de tareas\", o \"planificador de vacaciones\".",
            "documentation_link_text": "Documentación",
            "log_summary": "Resumen de Registros",
            "logs": "Registros",
            "reset_settings": "Restablecer Configuración",
            "create_project": "Crear Proyecto",

            
            "push_github": "Subir a Github",
            "timestamping": "Crear y actualizar marcas de tiempo",
            "build_ontimize": "Construir Cliente Angular Ontimize",

            "create_landing": "Crear Página de Inicio",
            "enable_defaults": "Habilitar Valores Predeterminados",
        },
        show: {
            // Tab names
            "overview": "Vista General",
            "logic": "Lógica",
            "iterations": "Iteraciones",
            
            // Buttons
            "open_app": "Abrir App",
            "start_app": "Iniciar App",
            "download": "Descargar",
            "manager": "Administrador",
            
            // Loading states  
            "loading": "Cargando...",
            "error": "Error:",
            "user": "Usuario:",
            
            // Project details
            "run_project": "Ejecutar proyecto en contenedor",
            "github_repository": "Repositorio Github",
            "data_model": "Modelo de Datos",
            "created_at": "Creado El",
            
            // Status
            "running": "En Ejecución",
            "stopped": "Detenido",
        
            // Labels
            "name": "Nombre",
            "status": "Estado",
            "description": "Descripción",

            "log_summary": "Resumen del Registro",
            "log_files": "Archivos de Registro",
        },
        logic: {
            // Rules management
            "rule_prompt": "Prompt de Regla",
            "suggest_rules": "Sugerir Reglas",
            "update_model": "Actualizar Modelo",
            "rules_count": "Reglas ({count}/{total})",
            "no_rules_found": "No se encontraron reglas {status}",
            "loading": "Cargando",
            
            // Notifications
            "rule_accepted": "Regla aceptada, activando...",
            "rule_activated": "Regla activada",
            "rule_activated_errors": "Regla activada con errores",
            "wait_operation": "Por favor espere a que la operación actual se complete",
            "rule_activation_model_update": "La activación de la regla requiere actualización del modelo",
            
            // Warnings and errors
            "model_update_required": "Se requiere actualización del modelo para activar las reglas",
            "no_project_record": "No se encontró el registro del proyecto",
            "failed_create_rule": "Error al crear la regla:",
            "failed_fetch_rules": "Error al obtener las reglas:",
            
            // Confirmation dialogs
            "delete_rule_title": "Eliminar regla \"{description}\"",
            "delete_rule_content": "¿Está seguro que desea desactivar esta regla?"
        }

    },
};

export default es;