<?php
/**
 * Plugin Name:       Progress-Aware Table of Contents
 * Plugin URI:        https://avonstreetmedia.com
 * Description:       A sticky table of contents block that highlights the current section as you scroll, with automatic semantic ID generation.
 * Version:           2.5
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Avon Street Media
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       patoc
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define plugin constants
define( 'PATOC_VERSION', '2.5' );
define( 'PATOC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'PATOC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Convert hex color to rgba format
 *
 * @param string $hex     Hex color code
 * @param float  $opacity Opacity value (0-1)
 * @return string RGBA color string
 */
function patoc_hex_to_rgba( $hex, $opacity ) {
    $hex = ltrim( $hex, '#' );
    $r = hexdec( substr( $hex, 0, 2 ) );
    $g = hexdec( substr( $hex, 2, 2 ) );
    $b = hexdec( substr( $hex, 4, 2 ) );
    return "rgba($r, $g, $b, $opacity)";
}

/**
 * Renders the block's HTML on the front-end
 *
 * @param array $attributes The block's attributes
 * @return string The HTML output for the TOC container
 */
function patoc_render_block( $attributes ) {
    // Get the headings settings with defaults
    $headings_to_include = isset( $attributes['headings'] ) ? $attributes['headings'] : array(
        'h1' => false,
        'h2' => true,
        'h3' => true,
        'h4' => false,
        'h5' => false,
    );

    // Typography settings
    $font_size = isset( $attributes['fontSize'] ) ? intval( $attributes['fontSize'] ) : 14;
    $font_weight = isset( $attributes['fontWeight'] ) ? sanitize_text_field( $attributes['fontWeight'] ) : 'normal';
    $font_family = isset( $attributes['fontFamily'] ) ? sanitize_text_field( $attributes['fontFamily'] ) : 'inherit';
    $line_height = isset( $attributes['lineHeight'] ) ? floatval( $attributes['lineHeight'] ) : 1.5;
    $title_font_size = isset( $attributes['titleFontSize'] ) ? intval( $attributes['titleFontSize'] ) : 18;
    $title_font_weight = isset( $attributes['titleFontWeight'] ) ? sanitize_text_field( $attributes['titleFontWeight'] ) : 'bold';

    // Color settings
    $text_color = isset( $attributes['textColor'] ) ? sanitize_hex_color( $attributes['textColor'] ) : '#555555';
    $active_color = isset( $attributes['activeColor'] ) ? sanitize_hex_color( $attributes['activeColor'] ) : '#ef3e42';
    $background_color = isset( $attributes['backgroundColor'] ) ? sanitize_hex_color( $attributes['backgroundColor'] ) : '#f8f9fa';
    $background_opacity = isset( $attributes['backgroundOpacity'] ) ? floatval( $attributes['backgroundOpacity'] ) : 0.95;

    // Layout & spacing settings
    $border_radius = isset( $attributes['borderRadius'] ) ? intval( $attributes['borderRadius'] ) : 8;
    $padding = isset( $attributes['padding'] ) ? intval( $attributes['padding'] ) : 20;
    $vertical_spacing = isset( $attributes['verticalSpacing'] ) ? intval( $attributes['verticalSpacing'] ) : 12;

    // Border settings
    $show_border = isset( $attributes['showBorder'] ) ? (bool) $attributes['showBorder'] : false;
    $border_color = isset( $attributes['borderColor'] ) ? sanitize_hex_color( $attributes['borderColor'] ) : '#e1e5e9';
    $border_width = isset( $attributes['borderWidth'] ) ? intval( $attributes['borderWidth'] ) : 1;

    // Hierarchy settings
    $enable_indentation = isset( $attributes['enableIndentation'] ) ? (bool) $attributes['enableIndentation'] : true;
    $indent_amount = isset( $attributes['indentAmount'] ) ? intval( $attributes['indentAmount'] ) : 15;

    // Effects settings
    $show_shadow = isset( $attributes['showShadow'] ) ? (bool) $attributes['showShadow'] : true;
    $show_scrollbars = isset( $attributes['showScrollbars'] ) ? (bool) $attributes['showScrollbars'] : false;

    // Convert background color to rgba
    $background_rgba = patoc_hex_to_rgba( $background_color, $background_opacity );

    // Encode the settings as JSON for JavaScript
    $headings_json = htmlspecialchars( wp_json_encode( $headings_to_include ), ENT_QUOTES, 'UTF-8' );
    
    // Generate unique ID for this TOC instance
    $unique_id = 'patoc-' . wp_generate_uuid4();

    // Build scrollbar styles
    $scrollbar_styles = $show_scrollbars ? 
        'max-height: calc(100vh - 120px); overflow-y: auto;' : 
        'overflow-y: hidden;';

    // Build border styles
    $border_styles = $show_border ? 
        "border: {$border_width}px solid {$border_color};" : 
        'border: none;';
    
    // Build custom CSS for this instance
    $custom_css = "
        #{$unique_id} {
            background: {$background_rgba};
            border-radius: {$border_radius}px;
            padding: {$padding}px;
            {$border_styles}
            box-shadow: " . ( $show_shadow ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none' ) . ";
            {$scrollbar_styles}
            font-family: {$font_family};
        }
        #{$unique_id} h3 {
            font-size: {$title_font_size}px;
            font-weight: {$title_font_weight};
            font-family: {$font_family};
            color: {$text_color};
            margin: 0 0 {$vertical_spacing}px 0;
        }
        #{$unique_id} ul {
            font-family: {$font_family};
            margin: 0;
        }
        #{$unique_id} li {
            margin-bottom: " . floor( $vertical_spacing * 0.75 ) . "px;
        }
        #{$unique_id} li a {
            font-size: {$font_size}px;
            font-weight: {$font_weight};
            line-height: {$line_height};
            color: {$text_color};
        }
        #{$unique_id} li a.active {
            color: {$active_color};
        }
        #{$unique_id} ul::before {
            background-color: #a5acaf !important;
        }
        #{$unique_id} ul::after {
            background-color: {$active_color};
        }
        #{$unique_id} .patoc-progress-dot {
            background-color: {$active_color};
        }";

    // Add hierarchy indentation styles if enabled
    if ( $enable_indentation ) {
        $custom_css .= "
        #{$unique_id} li[data-level='h3'] a {
            padding-left: {$indent_amount}px;
        }
        #{$unique_id} li[data-level='h4'] a {
            padding-left: " . ( $indent_amount * 2 ) . "px;
        }
        #{$unique_id} li[data-level='h5'] a {
            padding-left: " . ( $indent_amount * 3 ) . "px;
        }
        #{$unique_id} li[data-level='h6'] a {
            padding-left: " . ( $indent_amount * 4 ) . "px;
        }";
    }

    // Add scrollbar hiding styles if needed
    if ( ! $show_scrollbars ) {
        $custom_css .= "
        #{$unique_id}::-webkit-scrollbar {
            width: 0;
            height: 0;
        }";
    }

    // Build the HTML output
    ob_start();
    ?>
    <style><?php echo $custom_css; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></style>
    <nav class="patoc-toc" id="<?php echo esc_attr( $unique_id ); ?>" data-headings="<?php echo $headings_json; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" data-indent="<?php echo $enable_indentation ? 'true' : 'false'; ?>">
        <h3><?php esc_html_e( 'Table of Contents', 'patoc' ); ?></h3>
        <ul class="patoc-list"></ul>
    </nav>
    <?php
    return ob_get_clean();
}

/**
 * Registers the block and all its assets
 */
function patoc_register_block() {
    // Register the block editor script
    wp_register_script(
        'patoc-block-editor-script',
        PATOC_PLUGIN_URL . 'block.js',
        array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-components', 'wp-block-editor' ),
        PATOC_VERSION,
        false
    );

    // Register the block editor style
    wp_register_style(
        'patoc-block-editor-style',
        PATOC_PLUGIN_URL . 'editor.css',
        array( 'wp-edit-blocks' ),
        PATOC_VERSION
    );

    // Register the frontend script
    wp_register_script(
        'patoc-frontend-script',
        PATOC_PLUGIN_URL . 'script.js',
        array(),
        PATOC_VERSION,
        true
    );

    // Register the frontend style
    wp_register_style(
        'patoc-frontend-style',
        PATOC_PLUGIN_URL . 'style.css',
        array(),
        PATOC_VERSION
    );

    // Register the block type
    register_block_type(
        'patoc/progress-aware-toc',
        array(
            'editor_script'   => 'patoc-block-editor-script',
            'editor_style'    => 'patoc-block-editor-style',
            'script'          => 'patoc-frontend-script',
            'style'           => 'patoc-frontend-style',
            'render_callback' => 'patoc_render_block',
            'attributes'      => array(
                'headings' => array(
                    'type'    => 'object',
                    'default' => array(
                        'h1' => false,
                        'h2' => true,
                        'h3' => true,
                        'h4' => false,
                        'h5' => false,
                    ),
                ),
                // Typography
                'fontSize'         => array( 'type' => 'number', 'default' => 14 ),
                'fontWeight'       => array( 'type' => 'string', 'default' => 'normal' ),
                'fontFamily'       => array( 'type' => 'string', 'default' => 'inherit' ),
                'lineHeight'       => array( 'type' => 'number', 'default' => 1.5 ),
                'titleFontSize'    => array( 'type' => 'number', 'default' => 18 ),
                'titleFontWeight'  => array( 'type' => 'string', 'default' => 'bold' ),
                // Colors
                'textColor'        => array( 'type' => 'string', 'default' => '#555555' ),
                'activeColor'      => array( 'type' => 'string', 'default' => '#ef3e42' ),
                'backgroundColor'  => array( 'type' => 'string', 'default' => '#f8f9fa' ),
                'backgroundOpacity' => array( 'type' => 'number', 'default' => 0.95 ),
                // Layout & Spacing
                'borderRadius'     => array( 'type' => 'number', 'default' => 8 ),
                'padding'          => array( 'type' => 'number', 'default' => 20 ),
                'verticalSpacing'  => array( 'type' => 'number', 'default' => 12 ),
                // Border
                'showBorder'       => array( 'type' => 'boolean', 'default' => false ),
                'borderColor'      => array( 'type' => 'string', 'default' => '#e1e5e9' ),
                'borderWidth'      => array( 'type' => 'number', 'default' => 1 ),
                // Hierarchy
                'enableIndentation' => array( 'type' => 'boolean', 'default' => true ),
                'indentAmount'     => array( 'type' => 'number', 'default' => 15 ),
                // Effects
                'showShadow'       => array( 'type' => 'boolean', 'default' => true ),
                'showScrollbars'   => array( 'type' => 'boolean', 'default' => false ),
            ),
        )
    );
}
add_action( 'init', 'patoc_register_block' );

/**
 * Enqueue frontend assets when block is present
 * 
 * This ensures scripts load properly even with aggressive caching
 */
function patoc_enqueue_frontend_assets() {
    // Only load on singular posts/pages
    if ( ! is_singular() ) {
        return;
    }

    // Check if the current post has the TOC block
    if ( has_block( 'patoc/progress-aware-toc' ) ) {
        wp_enqueue_script( 'patoc-frontend-script' );
        wp_enqueue_style( 'patoc-frontend-style' );
    }
}
add_action( 'wp_enqueue_scripts', 'patoc_enqueue_frontend_assets' );

/**
 * Add async attribute to frontend script for better performance
 *
 * @param string $tag    The script tag
 * @param string $handle The script handle
 * @return string Modified script tag
 */
function patoc_add_async_attribute( $tag, $handle ) {
    if ( 'patoc-frontend-script' !== $handle ) {
        return $tag;
    }
    return str_replace( ' src', ' defer src', $tag );
}
add_filter( 'script_loader_tag', 'patoc_add_async_attribute', 10, 2 );
