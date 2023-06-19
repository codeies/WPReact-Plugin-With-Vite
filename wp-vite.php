<?php

/**
 * Plugin Name: WP Vite And React
 * Description: WP Vite And React 
 * Author URI:  https://greatkhanjoy.me
 * Plugin URI:  https://greatkhanjoy.me
 * Version:     1.0.0
 * Author:      Greatkhanjoy
 * Text Domain: wp-vite-react
 * Domain Path: /i18n
 */

class WPViteReact
{
    function __construct()
    {
        // add_action('init',[$this,'initialize']);
        add_action('admin_enqueue_scripts', [$this, 'loadAssets']);
        add_action('wp_enqueue_scripts', [$this, 'loadAssets']);
        add_action('admin_menu', [$this, 'adminMenu']);
        add_filter('script_loader_tag', [$this, 'loadScriptAsModule'], 10, 3);
        add_filter('script_loader_tag', [$this, 'loadScriptAsModuleTwo'], 10, 3);
        add_shortcode('wp_vite_react', [$this, 'wp_vite_react_render_shortcode']);
    }

    // function shortocode render()
    public function wp_vite_react_render_shortcode()
    {
        return '<div id="wpvite-frontend"></div>';
    }

    // function load script as module
    function loadScriptAsModule($tag, $handle, $src)
    {
        if ('wp-vite-react-core' !== $handle) {
            return $tag;
        }
        $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
        return $tag;
    }

    // function load script as module
    function loadScriptAsModuleTwo($tag, $handle, $src)
    {
        if ('wp-vite-react-script' !== $handle) {
            return $tag;
        }
        $tag = '
        <script type="module" >
        import RefreshRuntime from "' . esc_url($src) . '";
        RefreshRuntime.injectIntoGlobalHook(window);
        window.$RefreshReg$ = () => {};
        window.$RefreshSig$ = () => (type) => type;
        window.__vite_plugin_react_preamble_installed__ = true;
        </script>';
        return $tag;
    }


    // Add admin menu
    function adminMenu()
    {
        add_menu_page('WPViteReact', 'WPViteReact', 'manage_options', 'admin/admin.php', [$this, 'loadAdminPage'], 'dashicons-tickets', 6);
    }

    // Admin page render
    function loadAdminPage()
    {
        $pluginUrl = plugin_dir_url(__FILE__);
        wp_localize_script('wp-vite-react-core', 'wpvitereact', [
            'url' => $pluginUrl,
            'nonce' => wp_create_nonce('wp_rest'),
        ]);
        include_once(plugin_dir_path(__FILE__) . "/inc/admin.php");
    }

    // Load assets  for admin and frontend
    function loadAssets()
    {

        wp_enqueue_script('wp-vite-react-core', 'http://localhost:5173/src/main.jsx', ['wp-vite-react-script'], time(), true);


        wp_enqueue_script(
            'wp-vite-react-script',
            'http://localhost:5173/@react-refresh',
            [],
            null,
            true
        );
    }
}

new WPViteReact();
