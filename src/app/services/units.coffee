app.service 'unitsService', ['$rootScope', ($rootScope) ->
	units = []

	setUnits = (data) ->
		units.splice(0, units.length)
		if data
			units = data.map (unit) ->
				new Unit(unit.id, unit.name)

	getById = (id) ->
		for unit in units
			return unit if unit.id is id

		return null

	{
		getById: getById
		setUnits: setUnits
		getUnits: ->
			units
	}
]
