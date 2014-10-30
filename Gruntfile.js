module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		coffee: {
			dist: {
				options: {
					bare: true
				},
				files: {
					'src/scripts/script.js': 'src/scripts/script.coffee'
				}
			}
		},
		uglify: {
			options: {
				banner: '/*! "Weekly menu" <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				//compress: true,
				beautify: true
			},
			my_target: {
				files: {
					'build/scripts/main.min.js': ['src/scripts/angular.js', 'src/scripts/angular-route.min.js', 'src/scripts/script.js']
				}
			}
		},
		haml: {
			dist: {
				options: {
					format: 'html5'
				},
				files: {
					'build/index.html': 'src/index.haml'
				}
			}
		},
		jshint: {
    		all: ['Gruntfile.js', 'src/scripts/*.js']
		},
		sass: {
			dist: {
				options: {
					//style: 'compressed',
					style: 'expanded',
					lineNumbers: true,
					banner: '/*! "Weekly menu" <%= grunt.template.today("yyyy-mm-dd") %> */'
				},
				files: {
					'build/styles/style.css': 'src/styles/style.sass'
				}
			}
		},
		watch: {
			sass: {
				files: ['src/styles/*.sass'],
				tasks: 'sass'
			},
			haml: {
				files: ['src/index.haml'],
				tasks: 'haml'
			},
			scripts: {
				files: ['src/scripts/*.coffee'],
				tasks: ['coffee', 'uglify']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-haml');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['watch']);
	grunt.registerTask('build', ['coffee', 'uglify', 'sass', 'haml']);
};