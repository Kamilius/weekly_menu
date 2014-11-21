app.service 'ingredientsService', ['$rootScope', 'unitsService', ($rootScope, $unitsService) ->
	ingredients = []

	setIngredients = (data) ->
		ingredients.splice(0, ingredients.length)
		if data
			ingredients = data.map (ingredient) ->
				new Ingredient(ingredient.id, ingredient.name, ingredient.unit)

	getById = (id) ->
		for ingredient in ingredients
			return ingredient if ingredient.id == id

		return null

	{
		getById: getById
		setIngredients: setIngredients
		getIngredients: ->
			ingredients
	}
]
