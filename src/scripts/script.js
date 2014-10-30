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
    $scope.recipes = [new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice']), new Recipe('Baked potato', ['potato', 'spice']), new Recipe('Steak', ['beef meat', 'spice'])];
    recipesContainer = document.querySelector('.recipes-container');
    calendar = document.querySelector('.calendar-recipes');
    recipesContainer.addEventListener('dragstart', function(event) {
      var el;
      el = event.target;
      if (el.classList[0] === 'recipe') {
        el.style.opacity = '0.4';
        return event.dataTransfer.setData('draggable', el);
      }
    }, false);
    calendar.addEventListener('dragenter', function(event) {
      var el;
      el = event.target;
      if (el.classList[1] === 'day') {
        return el.classList.add('over');
      }
    }, false);
    return calendar.addEventListener('dragleave', function(event) {
      var el;
      el = event.target;
      if (el.classList[1] === 'day') {
        return el.classList.remove('over');
      }
    }, false);
  }
]);

app.controller('CalendarCtrl', [
  '$scope', function($scope) {
    var calendar;
    $scope.weeklyMenu = {};
    calendar = document.querySelector('.calendar-recipes');
    return calendar.addEventListener('drop', function(event) {
      var draggable, droppable;
      droppable = event.target;
      draggable = event.dataTransfer.getData('draggable');
      if (droppable.classList[1] === 'day') {
        if (!$scope.weeklyMenu[droppable.classList[2]]) {
          $scope.weeklyMenu[droppable.classList[2]] = [];
        }
        $scope.weeklyMenu[droppable.classList[2]].push('done');
        return console.log($scope.weeklyMenu);
      }
    }, false);
  }
]);
