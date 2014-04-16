$(function() {
    //requirements
    var c         = require("./config/constantes");
    var world     = require("./world");
    var input     = require("./controllers/inputs");
    var loader    = require("./controllers/loader");
    var Player    = require("./models/player");
    var Decor     = require("./models/decor");
    var prefabs   = require("./config/prefabs");
    var setGenerators = require("./controllers/set_generators");

    function initMenu()
    {
        world.state = "menu";
        defineCanvas();

        world.on("gamepad connected", function(gamepadID) {
            world.create(new Player(
            {
                tag               : "player",
                playerID          : gamepadID,
                spritesheet       : world.manifest.images[prefabs.players[gamepadID].spritesheet],
                spritesheetBullet : world.manifest.images[prefabs.players[gamepadID].spritesheetBullet],
                anims             : c.ANIMATIONS[prefabs.players[gamepadID].anims],
                position          : { x : c.CANVAS_WIDTH / 4 + gamepadID * c.CANVAS_WIDTH / 2 - 48, y : c.CANVAS_HEIGHT - 300 },
                size              : { width : 96, height : 96 },
                speed             : 8,
                attackDelay       : 500
            }));

            if (world.find("tag", "player").length >= 1)
            {
                // $("#menuScreen").fadeOut(function() {
                //     $("#gameScreen").fadeIn(function() {
                //         initGame();                        
                //     });
                // });
                
                $("#menuScreen").hide();
                $("#gameScreen").show()
                initGame();
            }
        });

        input.startPollingGamepads();
    }

    function initGame()
    {
        world.state = "ingame";

        setGenerators();

        initDecor();

        requestAnimationFrame(gameloop);
    }

    //looping at 60 frames per second
    function gameloop()
    {
        world.run();
        requestAnimationFrame(gameloop);
    }

    //set canvas size and return his context
    function defineCanvas()
    {
        var canvas      = document.getElementById("mainCanvas");
        var context     = canvas.getContext("2d");
        canvas.width    = c.CANVAS_WIDTH;
        canvas.height   = c.CANVAS_HEIGHT;

        var bgBuffer    = document.createElement("canvas");
        var bgContext   = bgBuffer.getContext("2d");
        bgBuffer.width  = c.GAME_WIDTH;
        bgBuffer.height = c.GAME_HEIGHT;

        world.on("before:render", function() {
            context.clearRect(0, 0, c.CANVAS_WIDTH, c.CANVAS_HEIGHT);
        });

        world.context   = context;
        world.bgBuffer  = bgBuffer;
        world.bgContext = bgContext;
    }

    function initDecor()
    {
        //island
        for (var i = 0; i < 750; i += 250)
        {
            world.create(new Decor(
            {
                speed : 0.4,
                size : { width : 200, height : 200 },
                angle : Math.PI,
                position : { x : i, y : i},
                spritesheet : world.manifest.images["islands.png"],
                spriteSize : { width : 250, height : 250 },
                spritePos : { x : 0, y : 0 }
            }));
        }
    }

    loader(initMenu);
});