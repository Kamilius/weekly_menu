app.config ['$routeProvider', ($routeProvider) ->
	$routeProvider.when('/',
		templateUrl: 'views/calendar-page.html'
	).when('/recipes',
		templateUrl: 'views/recipesCRUD.html'
		controller: 'RecipesCRUDCtrl'
	).when('/recipes/:recipeId',
		templateUrl: 'views/recipesCRUD.html'
		controller: 'RecipesCRUDCtrl'
	).when('/ingredients',
		templateUrl: 'views/ingredients.html'
		controller: 'IngredientsCtrl'
	).when('/units',
		templateUrl: 'views/units.html'
		controller: 'UnitsCtrl'
	).when('/summary',
		templateUrl: 'views/summary.html'
		controller: 'SummaryCtrl'
	).when('/login',
		templateUrl: 'views/login.html',
		controller: 'AccountCtrl'
	).
	otherwise(redirectTo: '/')
]

app.run ['$rootScope', '$location', '$http', ($rootScope, $location, $http) ->
	$rootScope.userAuthenticated = false

	$http.get('/api/authentication').success((data) ->
		$rootScope.userAuthenticated = data.authenticated

		if !data.authenticated
			$location.path('/login')

		$rootScope.$on('$routeChangeStart', (event, next, current) ->
			if $rootScope.userAuthenticated is false
				switch next.templateUrl
					when "views/summary.html", "views/recipesCRUD.html", "views/ingredients.html", "viwes/units.html", "views/calendar-page.html"
						$location.path('/login')
			else
				if next.templateUrl is "views/login.html"
					$location.path('/calendar')
		)
	)

	$rootScope.statusMessage =
		text: ''
		type: ''

	$rootScope.setStatusMessage = (text, type) ->
		this.statusMessage.text = text
		this.statusMessage.type = type
		setTimeout ->
			(->
				$rootScope.statusMessage.text = ''
				$rootScope.statusMessage.type = ''
				$rootScope.$apply()
			)($rootScope)
		, 10000

	$rootScope.getClass = (path) ->
		if $location.path().substr(0, path.length) == path then 'active' else ''

	$rootScope.recipeDetailsVisible = false
]

app.directive 'calendar', ->
	{
		restrict: 'E'
		templateUrl: 'views/calendar.html'
		scope: {}
		controller: 'CalendarCtrl'
	}

app.directive 'recipescontainer', ->
	{
		restrict: 'E'
		templateUrl: 'views/recipesContainer.html'
		scope: {}
		controller: 'RecipesCtrl'
	}

app.directive 'ingredients', ->
	{
		restrict: 'E'
		scope: {}
		templateUrl: 'views/ingredients.html'
	}

app.directive 'index', ->
	{
		restrict: 'E'
		templateUrl: 'views/home.html'
	}

app.directive 'recipecrud', ->
	{
		restrict: 'E'
		scope: {}
		templateUrl: 'views/recipeCRUD.html'
	}

app.directive 'recipecontrols', ->
	{
		restrict: 'E'
		templateUrl: 'views/recipeControls.html'
	}

app.directive 'dragEnterLeaveAnimation', ->
	(scope, element, attrs) ->
		element.on 'dragenter', (event) ->
			@classList.add('over')
		element.on 'dragleave', (event) ->
			@classList.remove('over')

app.directive 'fileread', ->
	(scope, element, attributes) ->
		element.bind('change', (event) ->
			img = new Image()
			img.onload = () ->
				width = img.width
				height = img.height
				maxWidthHieght = 167
				ratio = 0

				if width > maxWidthHieght
					ratio = maxWidthHieght / width
					width *= ratio
					height *= ratio
				if height > maxWidthHieght
					ratio = maxWidthHieght / height
					width *= ratio
					height *= ratio

				canvas = document.createElement('canvas')
				canvas.width = width
				canvas.height = height
				ctx = canvas.getContext('2d')
				ctx.drawImage(img, 0, 0, width, height)

				scope.$apply(() ->
					scope.recipe.image = canvas.toDataURL("image/jpeg")
				)

			reader = new FileReader()
			reader.onload = (loadEvent) ->
				img.src = loadEvent.target.result
			reader.readAsDataURL(event.target.files[0])
		)
