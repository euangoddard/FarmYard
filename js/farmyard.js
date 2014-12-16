(function (angular, _) {
	'usr strict';

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

}(window.angular, window._));


/*define(['hammer', 'scene', 'domReady!'], function (Hammer, scene) {
	'use strict';

	var make_scene_mover = function (dx, dy) {
		return function move_scene () {
			var animal = scene.move(dx, dy);
			console.log(animal);
		};
	};

	var ui_scene = document.querySelector('#scene');
	var hammer = new Hammer(ui_scene);

	hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
	hammer.on('swipeleft', make_scene_mover(1, 0));
	hammer.on('swiperight', make_scene_mover(-1, 0));
	hammer.on('swipeup', make_scene_mover(0, 1));
	hammer.on('swipedown', make_scene_mover(0, -1));

	console.log(scene.init());

});*/