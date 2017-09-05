var gulp            = require('gulp'),
    connect         = require('gulp-connect'),
    sass            = require('gulp-sass'),
    nunjucksRender  = require('gulp-nunjucks-render'),
    sourcemaps      = require('gulp-sourcemaps'),
    uglify          = require('gulp-uglify'),
    cleanCss        = require('gulp-clean-css'),
    watch           = require('gulp-watch'),
    data            = require('gulp-data'),
    fs              = require('fs'),
    path            = require('path'),
    browserSync     = require('browser-sync').create();
    
    gulp.task('webserver', function() {
        connect.server({
            port: 3000,
            host: 'localhost',
            root: 'web/html',
            livereload: true
        });
    });
    
    gulp.task('livereload', function() {
        gulp.src(['web/css/*.css', 'web/js/*.js'])
        .pipe(connect.reload());
    });
    
    gulp.task('scss', function() {
        gulp.src('app/css/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('web/css'))
        .pipe(sourcemaps.write('./maps'))
        .pipe(browserSync.stream())
        .pipe(connect.reload());
    });
    
    gulp.task('javascripts', function() {
        gulp.src('app/js/*.js')
        .pipe(sourcemaps.init())
        .pipe(watch('app/js/*.js'))
        .pipe(gulp.dest('web/js'))
        .pipe(sourcemaps.write('./maps'))
        .pipe(browserSync.stream());;
    });
    
    
    var getData = function(file) {
        return JSON.parse(fs.readFileSync(path.resolve('app/html/data/global.json'), 'utf8'))
    }
    var getFiles =function(){
        var filePath = path.resolve('app/html')
        return fs.readdirSync(filePath)
                 .filter(function(file) {
                     return fs.statSync(path.join(filePath, file)).isFile() && file.substr(-5) === '.html'
                 })
    }

    gulp.task('nunjucks', function() {

        var dataJSON    = getData()
        dataJSON.files  = getFiles()

        gulp.src('app/html/**/*.html')
            .pipe(watch('app/html/data/*'))
            .pipe(data(dataJSON))
            .pipe(nunjucksRender({
                path: ['app/html']
            }))
            .pipe(gulp.dest('web/html'))
            .pipe(browserSync.stream())
            .on('end',browserSync.reload);

});

gulp.task('watch', function() {
    gulp.watch('app/css/*.scss', ['scss']);
    gulp.watch('app/js/*.js', ['javascripts']);
    gulp.watch('app/html/*.html', ['nunjucks']);
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./web",
            index : "html/index.html"
        }
    });
});

gulp.task('default', ['scss', 'javascripts', 'nunjucks', 'webserver', 'livereload', 'watch', 'browser-sync']);