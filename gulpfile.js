const gulp = require('gulp')
const connect = require('gulp-connect')

gulp.task('connect', () => {
    const fs = require('fs')
    connect.server({
        root: 'build/',
        port: '8100',
        livereload: true
    })
})

gulp.task('clean', () => {
    const clean = require('gulp-clean')
    return gulp.src('build/', {read: false}).pipe(clean())
})

gulp.task('pack', ['clean'], () => {
    const stream = require('webpack-stream')
    const webpack2 = require('webpack')

    const config = {
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }]
        },
        output: {
            filename: 'bundle.js'
        },
        devtool: "source-map"
    }

    return gulp.src('src/js/**/*.js')
        .pipe(stream(config, webpack2))
        .pipe(gulp.dest('build/'))
})

gulp.task('pack-css', ['clean'], () => {
    const cssPreprocessor = require('gulp-css-preprocessor')
    gulp.src('src/css/*.styl')
        .pipe(cssPreprocessor())
        .pipe(gulp.dest('build/'))
})

gulp.task('deploy-static', ['clean'], () => {
    gulp.src('src/lib/**/*.js').pipe(gulp.dest('build/lib/'))

    gulp.src(['src/index.html'])
        .pipe(gulp.dest('build/'));

    return gulp.src(['assets/**/*', '!assets/patterns/template.json'])
        .pipe(gulp.dest('build/assets'))
})

gulp.task('pack-maps', ['clean', 'deploy-static'], () => {
    const through = require('through2')
    const path = require('path')

    const patternDigest = {}
    gulp.src(['build/assets/patterns/**/*.json'])
        .pipe(through.obj(
            (ch, enc, cb) => {
                const loadPath = path.relative(path.join(ch.cwd, 'build'), ch.path)
                const relative = path.relative(path.join(ch.cwd, 'build', 'assets', 'patterns'), ch.path)
                const category = path.dirname(relative)
                const name = path.basename(relative)

                // console.log(loadPath)
                if (category in patternDigest) {
                    patternDigest[category].push({alias: name, path: loadPath})
                } else {
                    patternDigest[category] = [{alias: name, path: loadPath}]
                }

                cb(null, ch)
            },
            (cb) => {
                require('fs').writeFileSync('build/assets/patterns/digest.json', JSON.stringify(patternDigest, null, '  '))
                cb()
            }))
})

gulp.task('deploy', ['clean', 'pack', 'pack-css', 'deploy-static', 'pack-maps'], () => {
    gulp.src(['src/**/*']).pipe(connect.reload());
});

gulp.task('watch', () => {
    gulp.watch(['src/**/*', 'assets/**/*'], ['deploy']);
});

gulp.task('default', ['connect', 'deploy', 'watch'])