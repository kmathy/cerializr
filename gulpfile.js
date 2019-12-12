const gulp = require("gulp");
const ts = require("gulp-typescript");
const merge = require("merge2");
const clean = require("gulp-clean");
const terser = require("gulp-terser");
const sourcemaps = require("gulp-sourcemaps");

const tsProject = ts.createProject("tsconfig.json");

gulp.task("clean-dist", function() {
	return gulp.src("dist/*").pipe(clean());
});

gulp.task("build", function() {
	const tsResult = tsProject.src().pipe(tsProject());
	return merge([
		tsResult.dts.pipe(gulp.dest("dist")),
		tsResult.js.pipe(terser()).pipe(gulp.dest("dist")),
	]);
});

gulp.task("default", gulp.series(["clean-dist", "build"]));
