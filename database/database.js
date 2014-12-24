var Sequelize = require('sequelize'),
    sequelize,
    Unit,
    Ingredient,
    Recipe,
    IngredientsRecipes,
    Day,
    User;

if(process.env.HEROKU_POSTGRESQL_BRONZE_URL) {
  var match = process.env.HEROKU_POSTGRESQL_BRONZE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  sequelize = new Sequelize(match[5], match[1], match[2], {
    dialect: 'postgres',
    protocol: 'postgres',
    port: match[4],
    host: match[3],
    logging: false,
    timezone: '+02:00'
  });
} else {
  //remit laptop
  // sequelize = new Sequelize('weekly_menu', 'dev', '1', {
  //   dialect: 'postgres',
  //   timezone: '+02:00'
  // });

  //home
  sequelize = new Sequelize('weekly_menu', 'postgres', '12356890', {
    dialect: 'postgres',
    timezone: '+02:00'
  });
}


//DATABASE
//-----------------------------------------------------------------
//Database structure creation and bootstrap

Unit = sequelize.define('Unit', {
  name: Sequelize.STRING
});
Ingredient = sequelize.define('Ingredient', {
  name: Sequelize.STRING
});

Ingredient.belongsTo(Unit);
Unit.hasMany(Ingredient);

Recipe = sequelize.define('Recipe', {
  name: Sequelize.STRING,
  description: Sequelize.TEXT,
  image: Sequelize.STRING
});
IngredientsRecipes = sequelize.define('IngredientsRecipes', {
  amount: Sequelize.STRING
});

Recipe.hasMany(Ingredient, { through: IngredientsRecipes });
Ingredient.hasMany(Recipe, { through: IngredientsRecipes });

Day = sequelize.define('Day', {
  date: Sequelize.DATE,
  meal: Sequelize.STRING
});

Day.belongsTo(Recipe);
Recipe.hasMany(Day);

User = sequelize.define('User', {
  name: Sequelize.STRING,
  password: Sequelize.STRING,
  email: Sequelize.STRING,
  role: Sequelize.STRING
});

User.hasMany(Recipe);
Recipe.belongsTo(User);
User.hasMany(Ingredient);
Ingredient.belongsTo(User);
User.hasMany(Unit);
Unit.belongsTo(User);
User.hasMany(Day);
Day.belongsTo(User);

sequelize
  .sync()//pass { force: true } to drop databases
  .complete(function(err) {
    if (!!err) {
      console.log('An error occurred while creating the table: %s', err);
    } else {
      console.log('Table created.');
    }
  });

exports.Unit = Unit;
exports.Ingredient = Ingredient;
exports.Recipe = Recipe;
exports.IngredientsRecipes = IngredientsRecipes;
exports.Day = Day;
exports.User = User;
