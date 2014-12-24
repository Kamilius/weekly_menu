app.service 'recipeService', ['$rootScope', ($rootScope) ->
	recipes = []

	setRecipes = (data) ->
		if data
			recipes = data.map (recipe) ->
				new Recipe(recipe.id, recipe.name, recipe.description, recipe.meal, recipe.image, recipe.ingredients.map((ing) ->
					new Ingredient(ing.id, ing.name, ing.unit, parseFloat(ing.amount))
				))

	getById = (id) ->
		for recipe in recipes
			return recipe if recipe.id == id

		return null

	return {
		setRecipes: setRecipes
		getById: getById
		getRecipes: ->
			recipes
	}
]
