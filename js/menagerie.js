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

    var app = angular.module('Menagerie', ['ngAnimate', 'hmTouchEvents']);
    app.config(function (SoundManagerProvider, ImagePreloaderProvider) {
        var sounds_root = get_config_value('sounds-root');
        SoundManagerProvider.set_sounds_root(sounds_root);

        var images_root = get_config_value('images-root');
        ImagePreloaderProvider.set_images_root(images_root);
    });

    app.controller('MenagerieCtrl', function ($scope, $q, SoundManager, ImagePreloader) {
        var sound_loading_promise = SoundManager.add_sounds(ANIMALS)
        var image_loading_promise = ImagePreloader.load_images(ANIMALS, 'svg');
        $q.all([sound_loading_promise, image_loading_promise]).then(function () {
            $scope.is_loading = false;
        });
        $scope.is_loading = true;

        var SCENE_CACHE = {};

        $scope.position = {x: 0, y: 0};
        $scope.animals = [];

        this.move = function (dx, dy) {
            $scope.position.x += dx;
            $scope.position.y += dy;
            var cache_key = get_cache_key($scope.position.x, $scope.position.y);
            var animal = SCENE_CACHE[cache_key];
            if (typeof animal === 'undefined') {
                var candidate_animals = get_candidate_animals(
                    $scope.position.x,
                    $scope.position.y
                );
                SCENE_CACHE[cache_key] = animal = _.sample(candidate_animals);
            }
            $scope.animals.splice(0, 1, animal);
        };

        var get_cache_key = function (x, y) {
            return [x.toString(), y.toString()].join(',');
        };

        var get_candidate_animals = function (x, y) {
            var neighbouring_animals = [
                SCENE_CACHE[get_cache_key(x - 1, y)],
                SCENE_CACHE[get_cache_key(x + 1, y)],
                SCENE_CACHE[get_cache_key(x, y - 1)],
                SCENE_CACHE[get_cache_key(x, y + 1)],
            ];
            var candidate_animals = _.difference(ANIMALS, neighbouring_animals);
            return candidate_animals;
        };

        var ctrl = this;
        var doc_element = angular.element(document);
        doc_element.on('keydown', function (event) {
            var delta = DELTAS_BY_KEYCODE[event.keyCode];
            if (delta) {
                $scope.$apply(function () {
                    ctrl.move.apply(ctrl, delta);
                });
            }

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
            templateUrl: get_config_value('partials-root') + 'animal.html',
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
        };
    });

    app.factory('vibration', function () {
        var is_vibration_capable = angular.isFunction(navigator.vibrate);

        if (!is_vibration_capable) {
            return {
                vibrate: angular.noop,
                stop: angular.noop
            };
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

        var sounds_root = '/';

        var extension = Modernizr.audio.ogg ? 'ogg' : 'm4a';

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var context = new AudioContext();

        this.set_sounds_root = function (root) {
            sounds_root = root;
            return this;
        };

        var get_sound_file_name = function (sound) {
            return sounds_root + sound + '.' + extension;
        };

        this.$get = function ($q) {

            var load_sound = function (sound) {
                var url = get_sound_file_name(sound);
                
                var request = new XMLHttpRequest();
                request.open('GET', url, true);
                request.responseType = 'arraybuffer';

                var sound_load_promise = $q(function (resolve, reject) {
                    request.onload = function () {
                        context.decodeAudioData(request.response, function (buffer) {
                            sounds[sound] = buffer;
                            resolve(sound);
                        });
                    };
                });
                request.send();
                return sound_load_promise;
            };

            return {
                play: function (sound) {
                    var sound_promise = $q(function (resolve, reject) {
                        var buffer = sounds[sound];
                        var source = context.createBufferSource();
                        source.buffer = buffer;
                        source.connect(context.destination);
                        source.onended = resolve;
                        source.start(0);
                    });
                    return sound_promise;
                },

                add_sounds: function (sounds) {
                    var sound_load_promises = [];
                    angular.forEach(sounds, function (sound) {
                        sound_load_promises.push(load_sound(sound));
                    });
                    return $q.all(sound_load_promises);
                }
            };
        };

    });

    app.provider('ImagePreloader', function () {

        var images_root = '/';

        this.set_images_root = function (root) {
            images_root = root;
            return this;
        };

        this.$get = function ($q) {

            var load_image = function (image_path, extension) {
                var url = images_root + image_path + '.' + extension;

                var image = new Image();
                var image_load_promise = $q(function (resolve, reject) {
                    image.onload = function () {
                        resolve(image);
                    };
                });
                image.src = url;
                return image_load_promise;
            };

            return {
                load_images: function (images, extension) {
                    var image_load_promises = [];
                    angular.forEach(images, function (image) {
                        image_load_promises.push(load_image(image, extension));
                    });
                    return $q.all(image_load_promises);
                }
            };
        };

    });

    var get_config_value = function (param_name) {
        var value = document.body.getAttribute('data-' + param_name);
        return value;
    };

    
}(window.angular, window._));
