const gulp   = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const FileWatchArray = [
    './Helpers/web.js',
    './Helpers/index.js',
    './Data/index.js',
    './Object/index.js',
    './Client/index.js',
];

gulp.task('default', function() {
    return gulp.src(FileWatchArray).pipe(concat('xSocket.js')).pipe(gulp.dest('./')).pipe(concat('xSocket.min.js')).pipe(uglify()).pipe(gulp.dest('./'));
});

gulp.watch(FileWatchArray, gulp.parallel(['default']));