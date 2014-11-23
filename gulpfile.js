var gulp = require('gulp'),
    bump = require('gulp-bump'),
    changed = require('gulp-changed'),
    concat = require('gulp-concat'),
    debug = require('gulp-debug'),
    del = require('del'),
    ecstatic = require('ecstatic'),
    fs = require('fs'),
    gutil = require('gulp-util'),
    header = require('gulp-header'),
    html2js = require('gulp-html2js'),
    http = require('http'),
    inject = require("gulp-inject"),
    jshint = require('gulp-jshint'),
    // livereload = require('gulp-livereload'),
    merge = require('merge-stream'),
    ngAnnotate = require('gulp-ng-annotate'),
    pkg = require('./package.json'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    streamqueue = require('streamqueue'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),

    // load our config, build.CONFIG.js
    CONFIG = require('./build.CONFIG.js');

gulp.task('sass', function() {
    return gulp.src(CONFIG.app_files.scss)
        .pipe(sass({
            noCache: true
        }))
        .on('error', function(err) {
            console.log(err.message);
        })
        .pipe(rename(function(path) {
            path.basename = pkg.name + '-' + pkg.version;
        }))
        .pipe(gulp.dest(CONFIG.build_dir + '/assets'));
});

gulp.task('copy', function() {
    var sources = [
        gulp.src('src/assets/**/*', {
            base: 'src/assets/'
        })
        .pipe(changed(CONFIG.build_dir + '/assets'))
        .pipe(gulp.dest(CONFIG.build_dir + '/assets')),

        gulp.src(CONFIG.app_files.js)
        .pipe(changed(CONFIG.build_dir + '/src'))
        .pipe(gulp.dest(CONFIG.build_dir + '/src')),

        gulp.src(CONFIG.vendor_files.js.concat(CONFIG.vendor_files.css), {
            base: '.'
        })
        .pipe(changed(CONFIG.build_dir))
        .pipe(gulp.dest(CONFIG.build_dir))
    ];

    return merge(sources);
});


gulp.task('injectify', ['prod'], function() {

    var target = gulp.src('./build/index.html'),
        files = [].concat(
            CONFIG.vendor_files.css,
            'assets/' + pkg.name + '-' + pkg.version + '.app.css',
            'js/app.js',
            'templates-app.js'
        ),
        sources = gulp.src(files, {
            read: false,
            cwd: CONFIG.prod_dir
        });

    return target.pipe(inject(sources))
        .pipe(gulp.dest(CONFIG.prod_dir));
});


gulp.task('prod', function() {

    var paths = {
        scriptsNoTest: ['src/**/*.js', '!src/**/*.spec.js'],
        assets: 'build/assets/**/*',
        index: 'build/index.html',
        templates: 'build/templates-app.js'
    };

    //Concat into prod/js/app.js
    var concats = streamqueue({
                objectMode: true
            },
            gulp.src(CONFIG.vendor_files.js),
            gulp.src(paths.scriptsNoTest)
        )
        .pipe(concat('app.js'))
        .pipe(ngAnnotate({
            remove: false,
            add: false,
            single_quotes: true
        }))
        .pipe(gulp.dest(CONFIG.prod_dir + '/js'));

    //Copy assets
    var simpleCopy = (function() {
        var sources = [
            gulp.src(paths.assets)
            .pipe(gulp.dest(CONFIG.prod_dir + '/assets')),
            gulp.src(paths.templates)
            .pipe(gulp.dest(CONFIG.prod_dir))
        ];
        return merge(sources);
    })();

    return {
        concats: concats,
        simpleCopy: simpleCopy
    };
});

gulp.task('jshint', function() {
    return gulp.src(CONFIG.app_files.js)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('html2js', function() {
    var templates = [{
        files: CONFIG.app_files.atpl,
        type: 'app'
    }, {
        files: CONFIG.app_files.ctpl,
        type: 'common'
    }];

    return templates.map(function(template) {
        return gulp.src(template.files)
            .pipe(html2js({
                base: 'src/' + template.type,
                outputModuleName: 'templates-' + template.type
            }))
            .pipe(changed(CONFIG.build_dir, {
                extension: '.js'
            }))
            .pipe(concat('templates-' + template.type + '.js'))
            .pipe(gulp.dest(CONFIG.build_dir));
    });
});

var indexTask = function() {
    var target = gulp.src('src/index.html'),

        files = [].concat(
            CONFIG.vendor_files.js,
            'src/**/*.js',
            CONFIG.vendor_files.css,
            'templates-common.js',
            'templates-app.js',
            'assets/' + pkg.name + '-' + pkg.version + '.css'
        ),

        sources = gulp.src(files, {
            read: false,
            cwd: CONFIG.build_dir,
            addRootSlash: false
        });

    return target.pipe(inject(sources))
        .pipe(gulp.dest(CONFIG.build_dir));
};

gulp.task('index', ['sass', 'copy', 'html2js'], function() {
    return indexTask();
});

gulp.task('watch-index', ['sass'], function() {
    return indexTask();
});

// gulp.task('livereload', function() {
//     livereload.listen();
//     gulp.watch(CONFIG.build_dir + '/**').on('change', livereload.changed);
// });

gulp.task('watch', function() {
    gulp.watch(['src/**/*.scss'], ['sass']);
    gulp.watch(['src/**/*.js'], [
        'jshint',
        'copy'
    ]);
    gulp.watch([CONFIG.app_files.atpl, CONFIG.app_files.ctpl], ['html2js']);
    gulp.watch('src/index.html', ['watch-index']);
});

gulp.task('server', function() {
    http.createServer(ecstatic({
        root: __dirname + '/build'
    })).listen(8080);
    gutil.log(gutil.colors.blue('HTTP server listening on port 8080'));
});

gulp.task('default', [
    'jshint',
    'server',
    'watch',
    // 'livereload'
]);
