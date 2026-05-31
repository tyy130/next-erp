#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(not(debug_assertions))]
            {
                let resource_path = app
                    .path()
                    .resource_dir()
                    .expect("failed to get resource dir");

                let server_js = resource_path
                    .join("standalone-server")
                    .join("app")
                    .join("server.js");

                if !server_js.exists() {
                    eprintln!("[NextERP] server.js not found at {:?}", server_js);
                    std::process::exit(1);
                }

                let node_cmd = if cfg!(target_os = "windows") {
                    "node.exe"
                } else {
                    "node"
                };

                println!(
                    "[NextERP] Starting server from {:?}",
                    server_js.parent().unwrap()
                );

                let _child = Command::new(node_cmd)
                    .arg("server.js")
                    .current_dir(server_js.parent().unwrap())
                    .env("PORT", "3000")
                    .env("HOSTNAME", "127.0.0.1")
                    .env("NODE_ENV", "production")
                    .spawn()
                    .expect("[NextERP] Failed to start server. Ensure Node.js is installed.");

                println!("[NextERP] Server started on http://127.0.0.1:3000");

                if let Some(window) = app.get_webview_window("main") {
                    std::thread::sleep(std::time::Duration::from_secs(2));
                    let _ = window.navigate("http://127.0.0.1:3000".parse().unwrap());
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running NextERP");
}
