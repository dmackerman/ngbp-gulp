/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {

    build_dir: 'build',
    prod_dir: 'dist',
    compile_dir: 'bin',

    app_files: {
        js: ['src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js'],
        jsunit: ['src/**/*.spec.js'],

        atpl: ['src/app/**/*.tpl.html'],
        ctpl: ['src/common/**/*.tpl.html'],

        html: ['src/index.html'],

        scss: 'src/scss/main.scss'
    },

    test_files: {
        js: [
            'vendor/angular-mocks/angular-mocks.js'
        ]
    },

    vendor_files: {
        js: [
            'vendor/angular/angular.js',
            'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js',
            'vendor/angular-ui-router/release/angular-ui-router.js',
            'vendor/angular-ui-utils/modules/route/route.js',
            'vendor/angular-resource/angular-resource.min.js',
            'vendor/angular-animate/angular-animate.min.js',
            'vendor/angular-route/angular-route.min.js',
            'vendor/angular-localStorageService/src/storageprovider.js',
            'vendor/angular-flash-messages/angular-flash.js'
        ],
        css: [],
        assets: []
    }
};
