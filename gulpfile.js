const gulp = require('gulp')
const connect = require('gulp-connect')

gulp.task('connect', () => {
    connect.server({
        host: '0.0.0.0',
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
                query: { presets: ['env'] }
            }]
        },
        output: {
            filename: 'bundle.js'
        },
        devtool: "source-map"
    }

    const transpileStream = 
        gulp.src('src/js/**/*.js')
        .pipe(stream(config, webpack2))

    transpileStream.on('error', e => {
        console.error(e)
    })
    transpileStream.on('compilation-error', e => {
        console.error(e)
    })

    return transpileStream.pipe(gulp.dest('build/'))
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

    return gulp.src([
            'assets/**/*.png', 'assets/**/*.json',
            'assets/**/*.glsl', 'assets/**/*.ttf',
            '!assets/patterns/template.json'])
        .pipe(gulp.dest('build/assets'))
})

gulp.task('pack-digests', ['clean', 'deploy-static'], () => {
    const through = require('through2')
    const path = require('path')

    const buildDigest = (assetPath, assetType) => {
        const digest = []
        return gulp.src(['build/assets/' + assetPath + '/**/*.' + assetType])
            .pipe(through.obj(
                (ch, enc, cb) => {
                    const loadPath = path.relative(path.join(ch.cwd, 'build'), ch.path)

                    const relative = path.relative(path.join(ch.cwd, 'build', 'assets', assetPath), ch.path)
                    const baseName = relative.split(path.sep).pop().replace('.' + assetType, '')
                    const subpath = relative.split(path.sep)
                    subpath.pop()
                    const suffix = subpath.join('.')
                    const alias =  suffix.length > 0 ? suffix + '.' + baseName : baseName
                    digest.push({alias: alias, path: loadPath})
                    cb(null, ch)
                },
                (cb) => {
                    require('fs').writeFileSync('build/assets/' + assetPath + '/digest.json', JSON.stringify(digest, null, '  '))
                    cb()
                })).pipe(through.obj())
    }

    buildDigest('art', 'png')
    buildDigest('shaders', 'glsl')
    return buildDigest('patterns', 'json')
})

gulp.task('create-pattern-bitmaps', ['pack-digests'], () => {
    const toHex = (hex) => {
        if (hex.length === 9) {
            hex = '#' + hex.substr(3)
        }
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return parseInt(result[1], 16) << 16 | parseInt(result[2], 16) << 8 | parseInt(result[3], 16)
    }

    const fs = require('fs')
    fs.mkdir('build/assets/debug')

    const path = require('path')
    const bm = require('bitmap-manipulation')

    const patterns = JSON.parse(fs.readFileSync('build/assets/patterns/digest.json'))
    patterns.forEach(p => {
        const mapFile = JSON.parse(fs.readFileSync(path.join('build', p.path)))
        const w = mapFile.width * mapFile.tilewidth
        const h = mapFile.height * mapFile.tileheight

        const bmp = new bm.BMPBitmap(Math.floor(w/10), Math.floor(h/10))
        mapFile.layers.forEach(layer => {
            const clr = layer.color
            layer.objects.forEach(obj => {
                bmp.drawFilledRect(Math.floor(obj.x / 10), Math.floor(obj.y / 10),
                    Math.floor(obj.width/10), Math.floor(obj.height/10), 0x00, toHex(clr))
            })
        })

        bmp.save('build/assets/debug/' + p.alias + '.bmp')
    })
})

gulp.task('deploy', ['clean', 'pack', 'pack-css', 'deploy-static', 'pack-digests', 'create-pattern-bitmaps'], () => {
    gulp.src(['src/**/*']).pipe(connect.reload());
});

gulp.task('watch', () => {
    gulp.watch(['src/**/*', 'assets/**/*'], ['deploy']);
});

gulp.task('default', ['connect', 'deploy', 'watch'])

gulp.task('cache-bitmap', () => {
    const bm = require('bitmap-manipulation')
    const bitmap = new bm.BMPBitmap(400, 300)
    // bitmap.drawFilledRect(10, 10, 100, 100, 0x00, 0xFF)

    // bitmap.save('build/test.bmp')
})