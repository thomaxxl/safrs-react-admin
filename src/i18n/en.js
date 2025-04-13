import englishMessages from 'ra-language-english';

export const en = {
    ...englishMessages,
    wg: {
        demo:{
            msg: "It seems you clicked on a link that will create the demo project. Would you like to continue with the demo prompt or start a new project?",
            start_new: "Start New",
            start_demo: "Generate Demo",
            settings_title: "Advanced Settings",
        },
        create: {
            "desc": "Create your system by describing it in the prompt.",
            "advanced_title": "Advanced Settings",
            "business_logic": "Business Logic",
            "logic_prompt": "Logic Prompt",
            "prompt_label": 'Describe your app, for example "car dealership"',
            "data_model_size": "Data Model Size",
            "create_landing_page": "Create Landing Page",
            "push_to_github": "Push to Github",
            "create_update_timestamping": "Create & Update Timestamping",
            "optimistic_locking": "Optimistic Locking",
            "authentication_authorization": "Authentication & Authorization",
            "show_more": "Show More",
            "log_files": "Log Files",
            "project_name": "Project Name",
            "domain_logic_help": "Domain logic, security, model size, etc.",
            "example_prompt": "Example: \"todo list\", or \"holiday planner\".",
            "documentation_link_text": "Documentation",
            "log_summary": "Log Summary",
            "logs": "Logs",
            "reset_settings": "Reset Settings",
            "create_project": "Create Project",

            "push_github": "Push to Github",
            "timestamping": "Create & update timestamping",
            "build_ontimize": "Build Ontimize Angular Client",

            "enable_defaults": "Enable Defaults",
        },
        show:{
            // Tab names
            "overview": "Overview",
            "logic": "Logic",
            "iterations": "Iterations",
            
            // Buttons
            "open_app": "Open App",
            "start_app": "Start App",
            "download": "Download",
            "manager": "Manager",
            
            // Loading states  
            "loading": "Loading...",
            "error": "Error:",
            "user": "User:",
          
            // Project details
            "run_project": "Run project in container",
            "github_repository": "Github Repository",
            "data_model": "Data Model",
            "created_at": "Created At",
          
            // Status
            "running": "Running",
            "stopped": "Stopped",

            // Labels
            "name": "Name",
            "status": "Status",
            "description": "Description",

            "log_summary": "Log Summary",
            "log_files": "Log Files",
          },

          logic: {
            // Rules management
            "rule_prompt": "Rule Prompt",
            "suggest_rules": "Suggest Rules",
            "update_model": "Update Model",
            "rules_count": "Rules ({count}/{total})",
            "no_rules_found": "No {status} rules found",
            "loading": "Loading",
            
            // Notifications
            "rule_accepted": "Rule accepted, activating...",
            "rule_activated": "Rule activated",
            "rule_activated_errors": "Rule activated with errors",
            "wait_operation": "Please wait for the current operation to complete",
            "rule_activation_model_update": "Rule activation requires model update",
            
            // Warnings and errors
            "model_update_required": "Model update required to activate rules",
            "no_project_record": "No project record found",
            "failed_create_rule": "Failed to create rule:",
            "failed_fetch_rules": "Failed to fetch rules:",
            
            // Confirmation dialogs
            "delete_rule_title": "Delete rule \"{description}\"",
            "delete_rule_content": "Are you sure you want to deactivate this rule?"
        }
    },
};

export default en;