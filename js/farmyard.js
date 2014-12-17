(function (angular, _) {
	'usr strict';

	var ANIMALS = [
		'cat',
		'chicken',
		'cow',
		'dog',
		'duck',
		'elephant',
		'giraffe',
		'goat',
		'horse',
		'mouse',
		'owl',
		'penguin',
		'pig',
		'sheep',
		'zebra'
	];

	var app = angular.module('FarmYard', ['hmTouchEvents']);

	app.controller('FarmYardCtrl', function ($scope) {
		var SCENE_CACHE = {};

		$scope.position = {x: 0, y: 0};

		this.move = function (dx, dy) {
			$scope.position.x += dx;
			$scope.position.y += dy;
			var cache_key = get_cache_key($scope.position.x, $scope.position.y);
			var animal = SCENE_CACHE[cache_key];
			if (typeof animal === 'undefined') {
				SCENE_CACHE[cache_key] = animal = _.sample(ANIMALS);
			}
			$scope.animal = animal;
		};

		var get_cache_key = function (x, y) {
			return [x.toString(), y.toString()].join(',');
		};

		this.move(0, 0);		
	});

	app.directive('animal', function () {
		return {
			restrict: 'E',
			scope: {
				name: '='
			},
			templateUrl: '../partials/animal.html',
			controller: function ($scope) {
				$scope.is_speaking = false;
				this.speak = function () {
					$scope.is_speaking = true;
				};

			},
			controllerAs: 'animal_ctrl'
		}
	});

	
}(window.angular, window._));
