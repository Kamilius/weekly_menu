module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		coffee: {
			dist: {
				options: {
					bare: true
				},
				files: {
					'src/app/script.js': [
						'src/app/app.coffee',
						'src/app/controllers/*.coffee',
						'src/app/models/*.coffee',
						'src/app/services/*.coffee',
						'src/app/config.coffee'
					]
				}
			}
		},
		uglify: {
			options: {
				banner: '/*! "Weekly menu" <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				mangle: false,
				compress: false,
				beautify: true
			},
			my_target: {
				files: {
					'build/scripts/main.min.js': [
						'src/scripts/angular.js',
						'src/scripts/angular-locale_uk-ua.js',
						'src/scripts/angular-route.min.js',
						'src/scripts/angular-animate.min.js',
						'src/app/script.js'
					]
				}
			}
		},
		haml: {
			dist: {
				options: {
					format: 'html5'
				},
				files: {
					'build/index.html': 'src/index.haml',
					'build/views/calendar.html': 'src/app/views/calendar.haml',
					'build/views/home.html': 'src/app/views/home.haml',
					'build/views/ingredients.html': 'src/app/views/ingredients.haml',
					'build/views/recipeControls.html': 'src/app/views/recipeControls.haml',
					'build/views/recipesContainer.html': 'src/app/views/recipesContainer.haml',
					'build/views/recipesCRUD.html': 'src/app/views/recipesCRUD.haml',
					'build/views/summary.html': 'src/app/views/summary.haml',
					'build/views/units.html': 'src/app/views/units.haml'
				}
			}
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
					'build/styles/style.css': 'src/content/styles/style.sass'
				}
			}
		},
		watch: {
			copy: {
				files: ['src/content/images/*', 'src/content/fonts/*'],
				tasks: 'copy'
			},
			sass: {
				files: ['src/content/styles/*.sass'],
				tasks: 'sass'
			},
			haml: {
				files: ['src/index.haml', 'src/app/views/*.haml'],
				tasks: 'haml'
			},
			scripts: {
				files: ['src/app/*/*.coffee', 'src/app/*.coffee'],
				tasks: ['coffee', 'uglify', 'clean']
			}
		},
		clean: {
			js: 'src/app/script.js'
		},
		copy: {
			main: {
				files: [
					{ expand: true, src:'src/content/images/*', dest:'build/images/', flatten: true },
					{ expand: true, src:'src/content/fonts/*', dest:'build/fonts/', flatten: true }
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-haml2html');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['watch']);
	grunt.registerTask('build', ['coffee', 'uglify', 'clean', 'sass', 'haml', 'copy']);
};
