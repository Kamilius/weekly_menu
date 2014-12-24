var db = require('../database/database');

exports.getAllUnits = function(req, res) {
  db.User.find(req.user.id).success(function(user) {
    user.getUnits({ order: ['name']}).success(function(units) {
      res.json(units.map(function(unit) {
        return {
          id: unit.id,
          name: unit.name
        };
      }));
    })
    .error(function(msg) {
      console.log(msg);
      res.json({ message: 'Can not get units' });
    });
  })
  .error(function(msg) {
    console.log(msg);
    res.json({ message: 'User not found' });
  });
};

exports.getUnitById = function(req, res) {
  db.Unit.find({ where: { UserId: req.user.id, id: req.params.id }}).success(function(item) {
    res.json(item);
  });
};

exports.editOrCreateUnit = function(req, res) {
  db.Unit.findOrCreate({ where: { id: req.body.id, UserId: req.user.id }}).success(function(unit, created) {
    if(created) {
      unit.UserId = req.user.id;
    }
    unit.name = req.body.name;
    unit.save().success(function() {
      res.json({ message: 'success', unitId: unit.id });
    });
  });
};

exports.deleteUnit = function(req, res) {
  db.Unit.find(req.params.id).success(function(unit) {
    unit.getIngredients().success(function(ingredients) {
      if(ingredients.length > 0) {
        res.json({
          message: "error",
          ingredients: ingredients.map(function(ingr) {
            return ingr.name;
          })
        });
      } else {
        unit.destroy().success(function() {
          res.json({
            message: "success",
            unitId: unit.id
          });
        });
      }
    })
  }).error(function(msg) {
    console.log(msg);
    res.json({ message: 'Error' });
  });
};
