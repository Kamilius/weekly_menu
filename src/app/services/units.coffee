app.service 'unitsService', ['$rootScope', ($rootScope) ->
	units = []

	loadFromLocalStorage = ->
		data = localStorage.getItem('units')

		if data
			units = JSON.parse(data).map (unit) ->
				new Unit(unit.id, unit.name)

	getById = (id) ->
		for unit in units
			return unit if unit.id is id

		return null

	add = (unit) ->
		unit.id = if units.length > 0 then units[units.length - 1]?.id + 1 else 1
		units.push(unit)
		localStorage.setItem('units', JSON.stringify(units))

	save = (unit) ->
		if unit.id is 0
			@add new Unit(0, unit.name)
			$rootScope.setStatusMessage('Одиницю виміру успішно збережено.', 'success')
		else
			temp = @getById(unit.id)
			temp.name = unit.name

		localStorage.setItem('units', JSON.stringify(units))

	remove = (unit, ingredients) ->
		index = units.indexOf(unit)
		usedInIngredients = ''

		if ingredients?.length
			for unit in units
				for ing in ingredients when ing.units.indexOf(unit) > -1
					usedInIngredients += "\n \"#{ing.name}\""

		if index > -1 and usedInIngredients.length is 0
			units.splice(index, 1)
			localStorage.setItem('units', JSON.stringify(units))
		else if recipeNames.length > 0
			$rootScope.setStatusMessage("Неможливо видалити одиницю міри \"#{unit.name}\". Вона використовується у наступних інгридієнтах: \n#{ usedInIngredients }", 'error')
		else
			$rootScope.setStatusMessage("Одиниці міри з id: #{unit.id} - не існує.", 'error')

	loadFromLocalStorage()

	{
		getById: getById
		items: units
		add: add
		save: save
		remove: remove
	}
]