(function (angular, _) {
	'usr strict';

	var SOUNDS_BY_ANIMAL = {
		'cat': 'Meow',
		'chicken': 'Cluck',
		'cockerel': 'Cockadoodle-doo',
		'cow': 'Moo',
		'dog': 'Woof',
		'donkey': 'Eee-aww',
		'elephant': 'Trump',
		'fox': 'Bark',
		'horse': 'Neigh',
		'leopard': 'Growl',
		'lion': 'Roar',
		'lioness': 'Roar',
		'monkey': 'Screech',
		'orangutan': 'Ooo-ooh',
		'owl': 'Hoot',
		'panda': 'Growl',
		'penguin': 'Squawk',
		'pig': 'Oink',
		'puma': 'Growl',
		'reindeer': 'Awww',
		'sheep': 'Baaa',
		'tiger': 'Growl',
		'zebra': 'Whinny'
	};

	var ANIMALS = _.keys(SOUNDS_BY_ANIMAL);

	var DELTAS_BY_KEYCODE = {
		37: [-1, 0], // left
		38: [0, -1], // up
		39: [1, 0], // right
		40: [0, 1] // down
	};

	var app = angular.module('Menagerie', ['ngAnimate', 'hmTouchEvents']).config(function (SoundManagerProvider) {
		SoundManagerProvider.set_sounds_root('/sounds/').add_sounds(ANIMALS);
	});

	app.controller('MenagerieCtrl', function ($scope) {
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

		var ctrl = this;
		var doc_element = angular.element(document);
		doc_element.on('keydown', function (event) {
			var delta = DELTAS_BY_KEYCODE[event.keyCode];
			if (delta) {
				$scope.$apply(function () {
					ctrl.move.apply(ctrl, delta);
				});
			};

		});
		$scope.$on('$destroy', function () {
			doc_element.off('keydown');
		});

		this.move(0, 0);
	});

	app.directive('animal', function () {
		return {
			restrict: 'EA',
			scope: {
				name: '=animal'
			},
			templateUrl: '../partials/animal.html',
			controller: function ($scope, vibration, SoundManager) {
				var timeout_promise;
				$scope.is_speaking = false;

				this.speak = function () {
					$scope.is_speaking = true;
					vibration.vibrate(200);
					SoundManager.play($scope.name).then(function () {
						$scope.is_speaking = false;
					});
				};
				$scope.$watch('name', function (name) {
					$scope.is_speaking = false;
					$scope.sound = SOUNDS_BY_ANIMAL[name];
				});

			},
			controllerAs: 'animal_ctrl'
		}
	});

	app.factory('vibration', function () {
		var is_vibration_capable = angular.isFunction(navigator.vibrate);

		if (!is_vibration_capable) {
			return {
				vibrate: angular.noop,
				stop: angular.noop
			}
		}

		return {
			vibrate: function () {
				return navigator.vibrate(Array.prototype.slice.call(arguments, 0));
			},
			stop: function () {
				return navigator.vibrate(0);
			}
		};
	});

	app.provider('SoundManager', function () {

		var sounds = {};
		var pending_sounds = 0;

		var sounds_root = '/';

		var extension = Modernizr.audio.ogg ? 'ogg' : 'm4a';

		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		var context = new AudioContext();

		this.set_sounds_root = function (root) {
			sounds_root = root;
			return this;
		};

		this.add_sounds = function (sounds) {
			var self = this;
			angular.forEach(sounds, function (sound) {
				pending_sounds += 1;
				load_sound(sound);
			});
			return this;
		};

		var get_sound_file_name = function (sound) {
			return sounds_root + sound + '.' + extension;
		};

		var load_sound = function (sound) {
			var url = get_sound_file_name(sound);
			
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';
			request.onload = function () {
				context.decodeAudioData(request.response, function (buffer) {
					sounds[sound] = buffer;
					pending_sounds -= 1;
					if (pending_sounds === 0) {
						console.log('all sounds loaded');
					}
				});
			};
			request.send();
		};

		this.$get = function ($q) {
			return {
				play: function (sound) {
					var buffer = sounds[sound];
					var source = context.createBufferSource();
					source.buffer = buffer;
					source.connect(context.destination);
					var sound_promise = $q(function (resolve, reject) {
						source.onended = resolve;
					});
					source.start(0);
					return sound_promise;
				}
			};
		}

	});

	
}(window.angular, window._));
