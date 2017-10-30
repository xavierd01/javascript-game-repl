(function () {

    /* Utility Functions. */

    // concatAll
    // The concatAll() function iterates over each sub-array in the array and collects the results in a new, flat array.
    // Expects each item in the array to be another array.
    Array.prototype.concatAll = function() {
        var results = [];
        this.forEach(function(subArray) {
            subArray.forEach(function(item) {
                results.push(item);
            });
        });

        return results;
    };

    /* END Utility Functions. */

    /* Game Data
       Global Game Data */
    var _currentLocation = 'store';

    /* END Game Data */

    /* Game Scenes. Functional.
       Data and Functions for interacting with the game locations.*/
    var _locations = [
        { 
            name: 'store',
            description: 'You are in a store.'
        },
        {
            name: 'street',
            description: 'You are in a street.'
        },
        {
            name: 'roof',
            description: 'You are on the roof of the store.'
        },
        {
            name: 'fenced-back',
            description: 'You are outside, behind the store, in a fenced in area.'
        }
    ];

    var describeLocation = function (scene, scenes) {
        return scenes.filter(function(sc) { 
            return sc.name === scene; 
        }).map(function(s) {return s.description;});
    };

    var _edges = [
        {
            scene: 'store',
            edges: [
                {
                    destination: 'street',
                    direction: 'east',
                    path: 'locked door'
                },
                {
                    destination: 'fenced-back',
                    direction: 'north',
                    path: 'door'
                }
            ]
        },
        {
            scene: 'street',
            edges: [
                {
                    destination: 'store',
                    direction: 'west',
                    path: 'door'
                }
            ]
        },
        {
            scene: 'roof',
            edges: [
                {
                    destination: 'fenced-back',
                    direction: 'south',
                    path: 'ladder'
                }
            ]
        },
        {
            scene: 'fenced-back',
            edges: [
                {
                    destination: 'roof',
                    direction: 'north',
                    path: 'ladder'
                },
                {
                    destination: 'store',
                    direction: 'south',
                    path: 'door'
                }
            ]
        }
    ];

    var describePath = function (edge) {
        return "There is a " + edge.path + " going " + edge.direction + " from here."
    };

    var describePaths = function (scene, sceneEdges) {
        return sceneEdges.filter(function(sceneEdge) {
            return sceneEdge.scene === scene;
        }).map(function(edge) { 
            return edge.edges; 
        }).concatAll().map(describePath);
    };
    /* END Game Scenes. */

    /* Game Objects. Functional.
       Data and Functions for manipulating objects in the game. 
       For now, we only have weapons. Later we can add tools, etc. for puzzles. */
    var _objects = ['knife', 'axe', 'bat'];
    var _objectLocations = [
        { object: 'knife', location: 'store' },
        { object: 'axe', location: 'store' },
        { object: 'bat', location: 'street' },
    ];

    var objectsAt = function (loc, objs, objLocs) {
        var atLoc = function (obj) {
            return objLocs.filter(function(oloc) {
                return oloc.object === obj;
            }).map(function(ol) { return ol.location; } ).includes(loc);
        };
        return objs.filter(atLoc);
    };

    var describeObjects = function (loc, objs, objLocs) {
        var describeObject = function (obj) {
            return "You see a " + obj + " on the floor.";
        };

        return objectsAt(loc, objs, objLocs).map(describeObject);
    };

    /* END Game Objects. */

    /* Game Mechanics. Non-functional.
       Functions for interacting with our game world. */
    var _allowedCommands = ['look', 'walk', 'pickup', 'inventory'];
    var look = function () {
        return [
            describeLocation(_currentLocation, _locations),
            describePaths(_currentLocation, _edges),
            describeObjects(_currentLocation, _objects, _objectLocations)
        ].concatAll();
    };

    var walk = function (direction) {
        let next = 
            _edges.filter(function (sceneEdge) {
                return sceneEdge.scene == _currentLocation;
            }).map(function (locEdge) {
                return locEdge.edges;
            }).concatAll().filter(function (edge) {
                return edge.direction == direction;
            });

        if (next.length != 0) {
            _currentLocation = next[0].destination;
            return look();
        }
        else {
            return ["you cannot go that way."];
        }
    };

    var pickup = function (obj) {
        var index = objectsAt(_currentLocation, _objects, _objectLocations).indexOf(obj);
        if (index >= 0) {
            _objectLocations.splice(index, 1);
            _objectLocations.push({object: obj, location: 'body'});
            return ["you are now carrying the " + obj];
        }
        else {
            return ["cannot get that."];
        }
    };

    var inventory = function () {
        return { items: objectsAt('body', _objects, _objectLocations) };
    };
    /* END Game Mechanics. */

    /* Game UI. Non-functional.
       Functions for interacting with game UI. */
    var Game = function () {
        var gameConsole = document.getElementById("console"),
            userInput = document.getElementById("userInput"),
            enterButton = document.getElementById("enterButton"),
            game_print = function (text, color) {
                if (color) {
                    text = "<span style='color: " + color + ";'>" + text + "</span>";
                }
                gameConsole.innerHTML += text + '<br/>';
                gameConsole.scrollTop = gameConsole.scrollHeight;
            },
            game_eval = function (sexp) {
                var cmdTokens = sexp.split(" ");
                var cmd = cmdTokens[0];
                if (_allowedCommands.indexOf(cmd) < 0) {
                    return 'I DO NOT know that command';
                }
                // TODO cmdToken parsing function. 
                // TODO turn returned array of strings into just strings. 
                // TODO create an eval return object that includes data + color.
                return eval(cmd + "('" + cmdTokens[1] + "')");
            },
            game_read = function () {
                var input = userInput.value;
                userInput.value = "";
                return input;
            },
            game_repl = function () {
                game_print(game_eval(game_read()));
			};

        this.init = function () {
			userInput.onkeypress = function (e) {
				if (e.keyCode == 13) {
					enterButton.click();
				}
			};
			userInput.focus();
            enterButton.onclick = game_repl;
			//game_repl();
		};
    };

    window.onload = function () {
        var game = new Game();
        game.init();
    }

    /* END Game UI. */

})();