/**
 * Progress-Aware Table of Contents - Block Editor
 * Version: 2.5
 */

(function (blocks, element, i18n, components, blockEditor) {
    const el = element.createElement;
    const { __ } = i18n;
    const { InspectorControls } = blockEditor;
    const { PanelBody, ToggleControl, RangeControl, SelectControl } = components;
    const { Fragment } = element;

    blocks.registerBlockType('patoc/progress-aware-toc', {
        title: __('Progress-Aware TOC', 'patoc'),
        description: __('A sticky table of contents with scroll progress tracking', 'patoc'),
        icon: 'list-view',
        category: 'widgets',
        keywords: [__('table of contents', 'patoc'), __('toc', 'patoc'), __('navigation', 'patoc')],
        supports: {
            html: false,
            multiple: false,
        },

        attributes: {
            headings: {
                type: 'object',
                default: {
                    h1: false,
                    h2: true,
                    h3: true,
                    h4: false,
                    h5: false,
                },
            },
            fontSize: {
                type: 'number',
                default: 14,
            },
            fontWeight: {
                type: 'string',
                default: 'normal',
            },
            fontFamily: {
                type: 'string',
                default: 'inherit',
            },
            lineHeight: {
                type: 'number',
                default: 1.5,
            },
            titleFontSize: {
                type: 'number',
                default: 18,
            },
            titleFontWeight: {
                type: 'string',
                default: 'bold',
            },
            backgroundColor: {
                type: 'string',
                default: '#ffffff',
            },
            backgroundOpacity: {
                type: 'number',
                default: 0.95,
            },
            borderRadius: {
                type: 'number',
                default: 8,
            },
            padding: {
                type: 'number',
                default: 16,
            },
            showShadow: {
                type: 'boolean',
                default: true,
            },
            showScrollbars: {
                type: 'boolean',
                default: false,
            },
        },

        edit: function (props) {
            const { attributes, setAttributes } = props;
            const { 
                headings, 
                fontSize, 
                fontWeight, 
                fontFamily, 
                lineHeight, 
                titleFontSize,
                titleFontWeight,
                backgroundColor,
                backgroundOpacity,
                borderRadius,
                padding,
                showShadow,
                showScrollbars
            } = attributes;

            // Handle heading level toggle changes
            const onToggleHeading = (level, newValue) => {
                const newHeadings = { ...headings };
                newHeadings[level] = newValue;
                setAttributes({ headings: newHeadings });
            };

            // Font family options
            const fontFamilyOptions = [
                { label: __('Inherit from theme', 'patoc'), value: 'inherit' },
                { label: __('Arial', 'patoc'), value: 'Arial, sans-serif' },
                { label: __('Helvetica', 'patoc'), value: 'Helvetica, Arial, sans-serif' },
                { label: __('Georgia', 'patoc'), value: 'Georgia, serif' },
                { label: __('Times New Roman', 'patoc'), value: '"Times New Roman", serif' },
                { label: __('Verdana', 'patoc'), value: 'Verdana, sans-serif' },
            ];

            // Font weight options
            const fontWeightOptions = [
                { label: __('Light', 'patoc'), value: '300' },
                { label: __('Normal', 'patoc'), value: 'normal' },
                { label: __('Medium', 'patoc'), value: '500' },
                { label: __('Bold', 'patoc'), value: 'bold' },
                { label: __('Extra Bold', 'patoc'), value: '800' },
            ];

            return el(
                Fragment,
                {},
                
                // Inspector Controls (sidebar settings)
                el(
                    InspectorControls,
                    {},
                    
                    // Heading Levels Panel
                    el(
                        PanelBody,
                        { title: __('Included Heading Levels', 'patoc'), initialOpen: true },
                        el(ToggleControl, {
                            label: __('H1', 'patoc'),
                            checked: headings.h1,
                            onChange: (value) => onToggleHeading('h1', value),
                        }),
                        el(ToggleControl, {
                            label: __('H2', 'patoc'),
                            checked: headings.h2,
                            onChange: (value) => onToggleHeading('h2', value),
                        }),
                        el(ToggleControl, {
                            label: __('H3', 'patoc'),
                            checked: headings.h3,
                            onChange: (value) => onToggleHeading('h3', value),
                        }),
                        el(ToggleControl, {
                            label: __('H4', 'patoc'),
                            checked: headings.h4,
                            onChange: (value) => onToggleHeading('h4', value),
                        }),
                        el(ToggleControl, {
                            label: __('H5', 'patoc'),
                            checked: headings.h5,
                            onChange: (value) => onToggleHeading('h5', value),
                        })
                    ),

                    // Typography Panel
                    el(
                        PanelBody,
                        { title: __('Typography', 'patoc'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Title Font Size (px)', 'patoc'),
                            value: titleFontSize,
                            onChange: (value) => setAttributes({ titleFontSize: value }),
                            min: 10,
                            max: 36,
                            step: 1,
                        }),
                        el(SelectControl, {
                            label: __('Title Font Weight', 'patoc'),
                            value: titleFontWeight,
                            options: fontWeightOptions,
                            onChange: (value) => setAttributes({ titleFontWeight: value }),
                        }),
                        el(SelectControl, {
                            label: __('Font Family', 'patoc'),
                            value: fontFamily,
                            options: fontFamilyOptions,
                            onChange: (value) => setAttributes({ fontFamily: value }),
                        }),
                        el(RangeControl, {
                            label: __('Link Font Size (px)', 'patoc'),
                            value: fontSize,
                            onChange: (value) => setAttributes({ fontSize: value }),
                            min: 8,
                            max: 24,
                            step: 1,
                        }),
                        el(SelectControl, {
                            label: __('Link Font Weight', 'patoc'),
                            value: fontWeight,
                            options: fontWeightOptions,
                            onChange: (value) => setAttributes({ fontWeight: value }),
                        }),
                        el(RangeControl, {
                            label: __('Line Height', 'patoc'),
                            value: lineHeight,
                            onChange: (value) => setAttributes({ lineHeight: value }),
                            min: 1,
                            max: 3,
                            step: 0.1,
                        })
                    ),

                    // Appearance Panel
                    el(
                        PanelBody,
                        { title: __('Appearance', 'patoc'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Background Opacity (%)', 'patoc'),
                            value: Math.round(backgroundOpacity * 100),
                            onChange: (value) => setAttributes({ backgroundOpacity: value / 100 }),
                            min: 0,
                            max: 100,
                            step: 5,
                        }),
                        el(RangeControl, {
                            label: __('Border Radius (px)', 'patoc'),
                            value: borderRadius,
                            onChange: (value) => setAttributes({ borderRadius: value }),
                            min: 0,
                            max: 50,
                            step: 1,
                        }),
                        el(RangeControl, {
                            label: __('Padding (px)', 'patoc'),
                            value: padding,
                            onChange: (value) => setAttributes({ padding: value }),
                            min: 0,
                            max: 50,
                            step: 2,
                        }),
                        el(ToggleControl, {
                            label: __('Show Shadow', 'patoc'),
                            checked: showShadow,
                            onChange: (value) => setAttributes({ showShadow: value }),
                        }),
                        el(ToggleControl, {
                            label: __('Hide Scrollbars', 'patoc'),
                            checked: !showScrollbars,
                            onChange: (value) => setAttributes({ showScrollbars: !value }),
                            help: __('Hide scrollbars for a cleaner look', 'patoc'),
                        })
                    )
                ),

                // Block preview in editor
                el(
                    'div',
                    { 
                        className: 'patoc-editor-placeholder',
                        style: {
                            backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})`,
                            borderRadius: `${borderRadius}px`,
                            padding: `${padding}px`,
                            border: '1px dashed #a0a0a0',
                            textAlign: 'center',
                        }
                    },
                    el('h3', { 
                        style: { 
                            fontSize: `${titleFontSize}px`, 
                            fontWeight: titleFontWeight,
                            fontFamily: fontFamily,
                            margin: '0 0 15px 0' 
                        } 
                    }, __('Table of Contents', 'patoc')),
                    el('div', { style: { marginTop: '15px' } },
                        el('div', { 
                            style: { 
                                fontSize: `${fontSize}px`, 
                                fontWeight: fontWeight,
                                fontFamily: fontFamily,
                                lineHeight: lineHeight,
                                marginBottom: '8px'
                            } 
                        }, '• ' + __('Sample Heading 1', 'patoc')),
                        el('div', { 
                            style: { 
                                fontSize: `${fontSize}px`, 
                                fontWeight: 'bold',
                                fontFamily: fontFamily,
                                lineHeight: lineHeight,
                                color: '#ff4500'
                            } 
                        }, '• ' + __('Current Section', 'patoc'))
                    ),
                    el('p', { 
                        style: { 
                            fontSize: '12px', 
                            color: '#666', 
                            marginTop: '15px', 
                            fontStyle: 'italic' 
                        } 
                    }, __('✓ Configure settings in the sidebar', 'patoc'))
                )
            );
        },

        save: function () {
            // Dynamic block - no save needed (rendered server-side)
            return null;
        },
    });
})(
    window.wp.blocks,
    window.wp.element,
    window.wp.i18n,
    window.wp.components,
    window.wp.blockEditor
);
