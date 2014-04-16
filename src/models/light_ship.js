//requirements
var c               = require("../config/constantes");
var utils           = require("../controllers/utils");
var world           = require("../world");
var addRenderSystem = require("../modules/render");
var Bullet          = require("../models/bullet");
var EventEmitter    = require("../../lib/events-emitter.js");

var LightShip = function LightShip(params)
{
    this.id                = world.gameObjects.length;
    this.tag               = params.tag;
    this.layer             = "enemy";
    this.playerID          = -1;
    this.position          = params.position         || { x : 0, y : 0 };
    this.size              = params.size             || { width : 50, height : 50 };
    this.speed             = params.speed            || 6;
    this.zIndex            = params.zIndex           || 500;
    this.context           = params.context          || world.context;
    this.angle             = params.angle            || 0;
    this.moveDirection     = { x : Math.cos(this.angle), y : Math.sin(this.angle) };
    this.direction         = { x : Math.cos(this.angle), y : Math.sin(this.angle) };
    
    this.attackDelay       = params.attackDelay      || 100;
    this.prevShot          = 0;
    
    this.spritesheet       = params.spritesheet;
    this.spritesheetBullet = params.spritesheetBullet;
    this.spriteSize        = params.spriteSize || { width : 128, height : 128 };
    this.anims             = params.anims;
    this.activeAnim        = this.anims[params.activeAnim] || this.anims['fly'];
    this.animY             = this.activeAnim["animY"];

    var self = this;
    this.on("set animation", function(name) {
        if (self.activeAnim != self.anims[name])
        {
            self.activeAnim  = self.anims[name];
            self.animY       = self.activeAnim["animY"];
            self.frameNum    = 0;
            self.frameCount  = 0;
            self.isAnimating = true;
        }
    });

    this.run = function()
    {
        this.move();
        this.limits();        
        this.setFocus();
        this.shoot();
        this.collisions();
        this.animate();
    }
}

LightShip.prototype.move = function()
{
    this.position.x += this.moveDirection.x * this.speed;
    this.position.y += this.moveDirection.y * this.speed;
}

LightShip.prototype.limits = function()
{
    // if (this.position.x < 0 || this.position.x + this.size.width > c.GAME_WIDTH ||
    //     this.position.y < 0 || this.position.y + this.size.height > c.GAME_HEIGHT)
    // {
    //     this.angle += Math.PI;        
    //     this.direction = { x : Math.cos(this.angle), y : Math.sin(this.angle) };
    // }
}

LightShip.prototype.setFocus = function()
{
    var players = world.find("tag", "player");
    for (var i = 0; i < players.length; i++)
    {
        if (i === 0)
        {
            this.targetPos = 
            {
                x : players[i].position.x + players[i].size.width / 2 ,
                y : players[i].position.y + players[i].size.height / 2 
            }
        }
        else
        {
            if (utils.getDistance(this.position, players[i].position) < utils.getDistance(this.position, this.targetPos))
            {
                this.targetPos = 
                {
                    x : players[i].position.x + players[i].size.width / 2,
                    y : players[i].position.y + players[i].size.height / 2
                }
            }      
        }
    }

    this.angle = utils.getAngle(this.position, this.targetPos);    
    this.direction = { x : Math.cos(this.angle), y : Math.sin(this.angle) };
}

LightShip.prototype.shoot = function()
{
    var datTime = new Date().getTime();

    this.animY = this.activeAnim["animY"] + 128;

    if (datTime - this.prevShot > this.attackDelay)
    {

        if (this.moving)
        {
            var canonDistance = this.size.width / 2;
        }
        else
        {
            var canonDistance = this.size.width / 2;
        }

        world.create(new Bullet(
            {
                playerID : this.playerID,
                position : { 
                    x : (this.position.x + this.size.width / 2)  + this.direction.x * canonDistance - 32,
                    y : (this.position.y + this.size.height / 2) + this.direction.y * canonDistance - 5
                },
                size : { width : 64, height : 10 },
                startAngle : this.angle,
                layer : this.layer,
                spritesheet : this.spritesheetBullet,
                spriteSize : { width : 128, height : 18 },
                anims : c.ANIMATIONS["BULLET_ENEMY"],
            }));

        this.prevShot = new Date().getTime();
        this.attackLimit -= 10;
    }
}

LightShip.prototype.collisions = function()
{
    for (var i = 0; i < world.gameObjects.length; i++)
    {
        var other = world.gameObjects[i];

        if (other.layer === "player")
        {
            if (this.position.x + this.size.width  > other.position.x && this.position.x < other.position.x + other.size.width &&
                this.position.y + this.size.height > other.position.y && this.position.y < other.position.y + other.size.height)
            {
                this.dead = true;
                if (other.tag === "bullet")
                {
                    other.dead = true;
                }
            }
        }
    }
}

EventEmitter.mixins(LightShip.prototype);
addRenderSystem(LightShip.prototype);

module.exports = LightShip;