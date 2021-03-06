
var SOUNDS_BY_ANIMAL = {
    'cat': 'Meow',
    'chicken': 'Cluck',
    'cockerel': 'Cock-a-doodle-doo',
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
    37: -1, // left
    39: 1 // right
};

var app = angular.module('Menagerie', ['ngAnimate', 'ngTouch']);
app.config(function ($compileProvider, SoundManagerProvider, ImagePreloaderProvider) {
    $compileProvider.debugInfoEnabled(false);

    var sounds_root = get_config_value('sounds-root');
    SoundManagerProvider.set_sounds_root(sounds_root);

    var images_root = get_config_value('images-root');
    ImagePreloaderProvider.set_images_root(images_root);
});

app.controller('MenagerieCtrl', function ($scope, $q, SoundManager, ImagePreloader, HelpQueue) {
    var sound_loading_promise = SoundManager.add_sounds(ANIMALS);
    var image_loading_promise = ImagePreloader.load_images(ANIMALS, 'svg');
    $q.all([sound_loading_promise, image_loading_promise]).then(function () {
        $scope.is_loading = false;
    });
    $scope.is_loading = true;

    var SCENE_CACHE = {};

    $scope.position = 0;
    $scope.animals = [];

    this.move = function (dx) {
        $scope.position += dx;
        var position = $scope.position;
        var animal = SCENE_CACHE[position];
        if (typeof animal === 'undefined') {
            var candidate_animals = get_candidate_animals(position);
            SCENE_CACHE[position] = animal = _.sample(candidate_animals);
        }
        $scope.animals.splice(0, 1, animal);
        HelpQueue.purge('swipe').purge('tap');
    };

    var get_candidate_animals = function (x) {
        var neighbouring_animals = [
            SCENE_CACHE[x - 1],
            SCENE_CACHE[x - 2],
            SCENE_CACHE[x + 1],
            SCENE_CACHE[x + 2]
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
                ctrl.move(delta);
            });
        }

    });
    $scope.$on('$destroy', function () {
        doc_element.off('keydown');
    });

    this.move(0);
    HelpQueue.add('swipe', 15000);

});

app.directive('animal', function () {
    return {
        restrict: 'EA',
        scope: {
            name: '=animal'
        },
        templateUrl: get_config_value('partials-root') + 'animal.html',
        controller: function ($scope, vibration, SoundManager, HelpQueue) {
            var timeout_promise;
            $scope.is_speaking = false;

            this.speak = function () {
                $scope.is_speaking = true;
                vibration.vibrate(200);
                SoundManager.play($scope.name).then(function () {
                    $scope.is_speaking = false;
                });
                HelpQueue.purge('tap');
            };
            $scope.$watch('name', function (name) {
                $scope.is_speaking = false;
                $scope.sound = SOUNDS_BY_ANIMAL[name];
            });

            HelpQueue.add('tap', 5000);

        },
        controllerAs: 'animal_ctrl'
    };
});

app.factory('HelpQueue', function ($timeout, $rootScope) {
    var queue = [];
    var current_item_being_processed = null;
    var running_timeout;

    var process_queue_head = function () {
        if (current_item_being_processed && current_item_being_processed.id) {
            return;
        }

        var item = queue.shift();

        if (_.isUndefined(item)) {
            return;
        }

        running_timeout = $timeout(function () {
            $rootScope.$broadcast('help:show', item.id);
            mark_no_current_item();
            process_queue_head();
        }, item.delay);
        current_item_being_processed = item;
    };

    var mark_no_current_item = function () {
        running_timeout = null;
        current_item_being_processed = null;
    };

    return {
        add: function (help_id, delay) {
            queue.push({id: help_id, delay: delay});
            process_queue_head();
            return this;
        },
        purge: function (help_id) {
            var index = _.findIndex(queue, {id: help_id});
            $rootScope.$broadcast('help:hide', help_id);
            if (index !== -1) {
                queue.splice(index, 1);
            } else if (current_item_being_processed && current_item_being_processed.id === help_id) {
                $timeout.cancel(running_timeout);
                mark_no_current_item();
            }
            return this;
        }
    };
});

app.controller('HelpCtrl', function ($scope) {
    $scope.is_help_required = {};

    this.end_help = function (help_id) {
        $scope.is_help_required[help_id] = false;
    };

    $scope.$on('help:show', function (event, help_id) {
        $scope.is_help_required[help_id] = true;
    });

    $scope.$on('help:hide', function (event, help_id) {
        $scope.is_help_required[help_id] = false;
    });
});

app.directive('onAnimationEnd', function () {
    return {
        restrict: 'A',
        scope: {
            onAnimationEnd: '&'
        },
        link: function (scope, element, attrs) {
            element.on('webkitAnimationEnd animationend', function (event) {
                scope.$apply(function () {
                    scope.onAnimationEnd(event);
                });
            });
        }
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
