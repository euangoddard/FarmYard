(function (angular, _) {
	'usr strict';

	var ANIMALS = [
		'cat',
		'chicken',
		'cockerel',
		'cow',
		'dog',
		'donkey',
		'elephant',
		'fox',
		'leopard',
		'lion',
		'lioness',
		'monkey',
		'orangutan',
		'owl',
		'panda',
		'penguin',
		'pig',
		'puma',
		'rabbit',
		'reindeer',
		'sheep',
		'tiger',
		'zebra'
	];

	var SOUNDS_BY_ANIMAL = {
		'cat': 'Meow',
		'chicken': 'Cluck',
		'cockerel': 'Cockadoodle-doo',
		'cow': 'Moo',
		'dog': 'Woof',
		'donkey': 'Eee-aww',
		'elephant': 'Trump',
		'fox': 'Bark',
		'leopard': 'Growl',
		'lion': 'Roar',
		'lioness': 'Roar',
		'monkey': 'Screech',
		'orangutan': 'Ooo-ooh',
		'owl': 'Twittwoo',
		'panda': 'Growl',
		'penguin': '???',
		'pig': 'Oink',
		'puma': 'Growl',
		'rabbit': 'Snuffle',
		'reindeer': 'Awww',
		'sheep': 'Baaa',
		'tiger': 'Roar',
		'zebra': '???'
	};

	var app = angular.module('FarmYard', ['ngAnimate', 'hmTouchEvents']);

	app.controller('FarmYardCtrl', function ($scope) {
		var SCENE_CACHE = {};

		$scope.position = {x: 0, y: 0};
		$scope.animals = [];

		this.move = function (dx, dy) {
			$scope.position.x += dx;
			$scope.position.y += dy;
			var cache_key = get_cache_key($scope.position.x, $scope.position.y);
			var animal = SCENE_CACHE[cache_key];
			if (typeof animal === 'undefined') {
				SCENE_CACHE[cache_key] = animal = _.sample(ANIMALS);
			}
			$scope.animals.splice(0, 1, animal);
		};

		var get_cache_key = function (x, y) {
			return [x.toString(), y.toString()].join(',');
		};

		this.move(0, 0);		
	});

	app.directive('animal', function () {
		return {
			restrict: 'EA',
			scope: {
				name: '=animal'
			},
			templateUrl: '../partials/animal.html',
			controller: function ($scope, $timeout) {
				var timeout_promise;
				$scope.is_speaking = false;

				this.speak = function () {
					$scope.is_speaking = true;
					// TODO: Replace this with listening for the end of the sound
					timeout_promise = $timeout(function () {
						$scope.is_speaking = false;
					}, 1000);
				};
				$scope.$watch('name', function (name) {
					$scope.is_speaking = false;
					$scope.sound = SOUNDS_BY_ANIMAL[name];
				});

			},
			controllerAs: 'animal_ctrl'
		}
	});

	
}(window.angular, window._));
