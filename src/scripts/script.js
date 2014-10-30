var Recipe, app;

app = angular.module('weeklyMenuApp', []);

Recipe = (function() {
  function Recipe(name, ingredients) {
    this.name = name;
    this.ingredients = ingredients;
  }

  return Recipe;

})();

app.controller('RecipesCtrl', [
  '$scope', function($scope) {
    var calendar, recipesContainer;
    $scope.recipes = [new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice'])];
    recipesContainer = document.querySelector('.recipes-container');
    calendar = document.querySelector('.calendar-recipes');
    recipesContainer.addEventListener('dragstart', function(event) {
      var el;
      el = event.target;
      if (el.classList[0] === 'recipe') {
        return event.target.style.opacity = '0.4';
      }
    });
    calendar.addEventListener('dragenter', function(event) {
      var el;
      el = event.target;
      if (el.classList[1] === 'day') {
        return el.classList.add('over');
      }
    });
    return calendar.addEventListener('dragleave', function(event) {
      var el;
      el = event.target;
      if (el.classList[1] === 'day') {
        return el.classList.remove('over');
      }
    });
  }
]);

app.controller('CalendarCtrl', ['$scope', function($scope) {}]);
