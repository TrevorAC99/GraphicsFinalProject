/**
 * Assignment 6
 * Trevor Carlson and David Bain
 * 
 * Our game is a Pacman style game where you play as Pacman trying to acquire coins that look like
 * coins from Mario games.
 * 
 * There are 6 coins on the map at any given time, and collecting a coin causes another to randomly
 * appear on the grid. 
 * 
 * There are 4 ghosts that wander the map. The orange and blue ghosts move around randomly choosing
 * a direction other than backards at each intersection. The red and green ghosts move very similar
 * to the other two, but if they have a line of sight with the player upon reaching an intersection,
 * they will always choose to follow the player. If the player touches a ghost, it is game over.
 * 
 * There is also a ball that spawns in a random location and bounces around the map. If the ball
 * touches the player, the player's forward motion is stopped for 2 seconds, though the player can
 * still turn.
 * 
 * The coins and the bouncing ball are textured using images wrapped around the mesh using
 * cylindrical mapping. The function that maps vertices to texture coordinates can be found in
 * GameObject.js. The function is called cylindricalTextureMap. The ball uses a texture of
 * glowstone from the game Minecraft. The coin uses a texture we created to show that it works.
 * 
 * There are two lights that are being used. One is very far off to the north of the arena and the
 * other is very far to the east. They are located at points (2000.0, 50.0, -500.0) and 
 * (500.0, 50.0, -2000.0) respectively.
 * 
 * The player can use either the arrow keys or WASD to control Pacman.
 * 
 * GGW
 * 
 * To make the game more immersive, we have added many sounds. The following things trigger sounds.
 *      -Background music
 *      -The ball boucing off a wall (while within 5 tile widths of a player)
 *      -The hero picking up a coin
 *      -The hero getting hit by the ball
 *      -The hero getting hit by a ghost and ending the game
 *      -The hero leaving the starting area
 *      -The red or green ghosts seeing a player
 * 
 * We have used sounds from Mario games and the Lord of the Rings films.
 */
// the-game.js
var gl;
var canvas;
const WALLHEIGHT = 50.0; // Some playing field parameters
const ARENASIZE = 1000.0;
const EYEHEIGHT = 15.0;
const HERO_VP = 0.625;

const upx = 0.0, upy = 1.0, upz = 0.0;    // Some LookAt params 

const fov = 60.0;     // Perspective view params 
const near = 1.0;
const far = 10000.0;
var aspect, eyex, eyez;

const width = 1000;       // canvas size 
const height = 625;
const vp1_left = 0;      // Left viewport -- the hero's view 
const vp1_bottom = 0;

var isFirstPerson = true;

var forward = false;
var backward = false;
var right = false;
var left = false;

var hasLeftStart;

// var coinSound = new Audio(addPathRoot('/Sounds/soundCoin.mp3'));
// var dyingSound = new Audio(addPathRoot('/Sounds/soundDying.mp3'));
// var soundtrack = new Audio(addPathRoot('/Sounds/soundtrack2.mp3'));
// var ballHit = new Audio(addPathRoot('/Sounds/soundHitByBall.wav'));
// var gameBeginSound = new Audio(addPathRoot('/Sounds/soundComing.wav'));

// var coinSound = new Audio('../Sounds/soundCoin.mp3');
// var dyingSound = new Audio('../Sounds/soundDying.mp3');
// var soundtrack = new Audio('../Sounds/soundtrack2.mp3');
// var ballHit = new Audio('../Sounds/soundHitByBall.wav');
// var gameBeginSound = new Audio('../Sounds/soundComing.wav');

var coinSound = document.getElementById("coinSound");
var dyingSound = document.getElementById("dyingSound");
var soundtrack = document.getElementById("soundtrack");
var ballHit = document.getElementById("ballHit");
var gameBeginSound = document.getElementById("gameBeginSound");

var coinsCollected;

// Lighting stuff
var la0 = [0.4, 0.4, 0.4, 1.0]; // light 0 ambient intensity 
var ld0 = [1.0, 1.0, 1.0, 1.0]; // light 0 diffuse intensity 
var ls0 = [1.0, 1.0, 1.0, 1.0]; // light 0 specular 
var lp0 = [2000.0, 50.0, -500.0, 1.0];//Position of light 1
var lp1 = [500.0, 50.0, -2000.0, 1.0];//Position of light 2
var ma = [0.02, 0.2, 0.02, 1.0]; // material ambient 
var md = [0.08, 0.6, 0.08, 1.0]; // material diffuse 
var ms = [0.6, 0.7, 0.6, 1.0]; // material specular 
var me = 75;             // shininess exponent 
const red = [1.0, 0.0, 0.0, 1.0]; // pure red 
const blue = [0.0, 0.0, 1.0, 1.0]; // pure blue 
const green = [0.0, 1.0, 0.0, 1.0]; // pure green 
const yellow = [1.0, 1.0, 0.0, 1.0]; // pure yellow
const purple = [1.0, 0.0, 1.0, 1.0]; //purple
const orange = [1.0, 0.6, 0.0, 1.0]; // orange
const pink = [255.0 / 255.0, 20.0 / 255.0, 147.0 / 255.0, 1.0] // pink
const brightBlue = [0.0, 1.0, 1.0, 1.0]; // Bright blue

//0 is empty space where coins can spawn
//1 is a wall tile.
//2 is the spawn location.
var grid = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 2, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

grid.reverse();

function getRandomLocationForCoin() {
    var location = coinLocations[Math.floor(Math.random() * coinLocations.length)];
    var isCoinAlreadyThere = false;
    coins.forEach(function (coin) {
        if (getXCoord(coin.x) === location[0] && getZCoord(coin.z) === location[1]) {
            isCoinAlreadyThere = true;
        }
    });

    return isCoinAlreadyThere ? getRandomLocationForCoin() : location;
}

function gridSquare(x, z, valueToSet = null) {
    if (valueToSet !== null) {
        grid[z][x] = valueToSet;
    }
    return grid[z][x];
}

var modelViewMatrix, projectionMatrix, heroPositionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, heroPositionMatrixLoc;

var program;

var arena;
var hero;
var coins = [];
var ghosts = [];
var projectiles = [];
var projectile1;
var walls = [];

var coinLocations = [];

var coinRadius = 10;
var ghostRadius = 15;

var alive = true;
var inMenu = true;

var g_matrixStack = []; // Stack for storing a matrix

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    //gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); // For debugging
    if (!gl) { alert("WebGL isn't available"); }

    //  Configure WebGL

    gl.clearColor(0.2, 0.2, 0.2, 1.0);

    //  Load shaders and initialize attribute buffers

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    eyex = ARENASIZE / 2.0;	// Where the hero starts
    eyez = -ARENASIZE / 2.0;
    aspect = width / height;

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    heroPositionMatrixLoc = gl.getUniformLocation(program, "heroPositionMatrix");

    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
        0); // Assume no texturing is the default used in
    // shader.  If your game object uses it, be sure
    // to switch it back to 0 for consistency with
    // those objects that use the defalt.


    arena = new Arena(program);
    arena.init();

    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === 0) {
                coinLocations.push([j, i]);
            } else if (grid[i][j] === 1) { /*
                //This code generates walls based on the map grid. This makes the game a bit slower as there are a lot more walls to render.
                walls.push(new Wall(program,
                                    (j * ARENASIZE) / 20.0,
                                    0.0,
                                    -((i + 1) * ARENASIZE) / 20.0,
                                    0,
                                    10,
                                    1.0,
                                    1.0));
                */}
        }
    }
    
    walls.push(new Wall(program, (0 * ARENASIZE) / 20.0, 0.0, -(1 * ARENASIZE) / 20.0, 0, 10.0, 20.0, 1.0));
    walls.push(new Wall(program, (0 * ARENASIZE) / 20.0, 0.0, -(20 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 20.0));
    walls.push(new Wall(program, (1 * ARENASIZE) / 20.0, 0.0, -(20 * ARENASIZE) / 20.0, 0, 10.0, 19.0, 1.0));
    walls.push(new Wall(program, (19 * ARENASIZE) / 20.0, 0.0, -(19 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 18.0));
    walls.push(new Wall(program, (2 * ARENASIZE) / 20.0, 0.0, -(3 * ARENASIZE) / 20.0, 0, 10.0, 5.0, 1.0));
    walls.push(new Wall(program, (2 * ARENASIZE) / 20.0, 0.0, -(7 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 3.0));
    walls.push(new Wall(program, (2 * ARENASIZE) / 20.0, 0.0, -(11 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 3.0));
    walls.push(new Wall(program, (2 * ARENASIZE) / 20.0, 0.0, -(14 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 2.0));
    walls.push(new Wall(program, (1 * ARENASIZE) / 20.0, 0.0, -(16 * ARENASIZE) / 20.0, 0, 10.0, 4.0, 1.0));
    walls.push(new Wall(program, (2 * ARENASIZE) / 20.0, 0.0, -(18 * ARENASIZE) / 20.0, 0, 10.0, 5.0, 1.0));
    walls.push(new Wall(program, (4 * ARENASIZE) / 20.0, 0.0, -(9 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 5.0));
    walls.push(new Wall(program, (4 * ARENASIZE) / 20.0, 0.0, -(15 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 5.0));
    walls.push(new Wall(program, (6 * ARENASIZE) / 20.0, 0.0, -(17 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 9.0));
    walls.push(new Wall(program, (6 * ARENASIZE) / 20.0, 0.0, -(7 * ARENASIZE) / 20.0, 0, 10.0, 8.0, 1.0));
    walls.push(new Wall(program, (6 * ARENASIZE) / 20.0, 0.0, -(5 * ARENASIZE) / 20.0, 0, 10.0, 8.0, 1.0));
    walls.push(new Wall(program, (8 * ARENASIZE) / 20.0, 0.0, -(3 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 2.0));
    walls.push(new Wall(program, (10 * ARENASIZE) / 20.0, 0.0, -(3 * ARENASIZE) / 20.0, 0, 10.0, 4.0, 1.0));
    walls.push(new Wall(program, (15 * ARENASIZE) / 20.0, 0.0, -(3 * ARENASIZE) / 20.0, 0, 10.0, 3.0, 1.0));
    walls.push(new Wall(program, (17 * ARENASIZE) / 20.0, 0.0, -(5 * ARENASIZE) / 20.0, 0, 10.0, 2.0, 1.0));
    walls.push(new Wall(program, (15 * ARENASIZE) / 20.0, 0.0, -(7 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 4.0));
    walls.push(new Wall(program, (8 * ARENASIZE) / 20.0, 0.0, -(11 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 3.0));
    walls.push(new Wall(program, (9 * ARENASIZE) / 20.0, 0.0, -(9 * ARENASIZE) / 20.0, 0, 10.0, 3.0, 1.0));
    walls.push(new Wall(program, (11 * ARENASIZE) / 20.0, 0.0, -(11 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 2.0));
    walls.push(new Wall(program, (8 * ARENASIZE) / 20.0, 0.0, -(13 * ARENASIZE) / 20.0, 0, 10.0, 4.0, 1.0));
    walls.push(new Wall(program, (8 * ARENASIZE) / 20.0, 0.0, -(15 * ARENASIZE) / 20.0, 0, 10.0, 4.0, 1.0));
    walls.push(new Wall(program, (8 * ARENASIZE) / 20.0, 0.0, -(19 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 3.0));
    walls.push(new Wall(program, (10 * ARENASIZE) / 20.0, 0.0, -(18 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 3.0));
    walls.push(new Wall(program, (12 * ARENASIZE) / 20.0, 0.0, -(18 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 2.0));
    walls.push(new Wall(program, (13 * ARENASIZE) / 20.0, 0.0, -(18 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 10.0));
    walls.push(new Wall(program, (14 * ARENASIZE) / 20.0, 0.0, -(16 * ARENASIZE) / 20.0, 0, 10.0, 4.0, 1.0));
    walls.push(new Wall(program, (15 * ARENASIZE) / 20.0, 0.0, -(14 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 6.0));
    walls.push(new Wall(program, (17 * ARENASIZE) / 20.0, 0.0, -(14 * ARENASIZE) / 20.0, 0, 10.0, 1.0, 8.0));
    walls.push(new Wall(program, (15 * ARENASIZE) / 20.0, 0.0, -(18 * ARENASIZE) / 20.0, 0, 10.0, 3.0, 1.0));

    walls.forEach(wall => wall.init());

    setup();

    render();
};

function setup() {
    backward = false;
    forward = false;
    left = false;
    right = false;

    alive = true;
    updateCoinCount();

    hasLeftStart = false;
    gridSquare(9, 9, 2);
    gridSquare(9, 10, 2);
    gridSquare(10, 9, 2);
    gridSquare(10, 10, 2);

    hero = new Hero(program, eyex, 0.0, eyez, 270, 10.0);
    hero.init();

    coins = [];

    var coinLocation = getRandomLocationForCoin();
    coins.push(new ThingSeeking(program, xCoord(coinLocation[0]), 0.0, zCoord(coinLocation[1]), 0, coinRadius));
    coinLocation = getRandomLocationForCoin();
    coins.push(new ThingSeeking(program, xCoord(coinLocation[0]), 0.0, zCoord(coinLocation[1]), 0, coinRadius));
    coinLocation = getRandomLocationForCoin();
    coins.push(new ThingSeeking(program, xCoord(coinLocation[0]), 0.0, zCoord(coinLocation[1]), 0, coinRadius));
    coinLocation = getRandomLocationForCoin();
    coins.push(new ThingSeeking(program, xCoord(coinLocation[0]), 0.0, zCoord(coinLocation[1]), 0, coinRadius));
    coinLocation = getRandomLocationForCoin();
    coins.push(new ThingSeeking(program, xCoord(coinLocation[0]), 0.0, zCoord(coinLocation[1]), 0, coinRadius));
    coinLocation = getRandomLocationForCoin();
    coins.push(new ThingSeeking(program, xCoord(coinLocation[0]), 0.0, zCoord(coinLocation[1]), 0, coinRadius));

    coins.forEach(coin => coin.init());

    ghosts = [];

    ghosts.push(new Villain(program, xCoord(1), 0.0, zCoord(1), 0, ghostRadius, red, 1));
    ghosts.push(new Villain(program, xCoord(1), 0.0, zCoord(18), 0, ghostRadius, orange));
    ghosts.push(new Villain(program, xCoord(18), 0.0, zCoord(18), 0, ghostRadius, green, 1));
    ghosts.push(new Villain(program, xCoord(18), 0.0, zCoord(1), 0, ghostRadius, brightBlue));

    ghosts.forEach(ghost => ghost.init());

    var angle = Math.floor(Math.random() * 360);
    while (angle === 0 || angle === 90 || angle === 180 || angle ===270) {
        angle = Math.floor(Math.random() * 360);
    }
    var projectileLocation = getRandomLocationForCoin();
    projectile1 = new Projectile(program, xCoord(projectileLocation[0]), 0.0, zCoord(projectileLocation[1]), angle, 10.0);
    projectile1.init();

    wallStart = new Wall(program, (9 * ARENASIZE) / 20.0, 0.0, -(11 * ARENASIZE) / 20.0, 0, 10.0, 2.0, 2.0);
    wallStart.init();
    handleMovement();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if(alive) {
        // Hero's eye viewport 
        gl.viewport(vp1_left, vp1_bottom, (HERO_VP * width), height);

        //lp0[0] = hero.x + hero.xdir; // Light in front of hero, in line with hero's direction
        //lp0[1] = EYEHEIGHT;
        //lp0[2] = hero.z + hero.zdir;
        //lp1[0] = hero.x + hero.xdir; // Light in front of hero, in line with hero's direction
        //lp1[1] = EYEHEIGHT;
        //lp1[2] = hero.z + hero.zdir;
        modelViewMatrix = lookAt(vec3(hero.x, EYEHEIGHT, hero.z),
            vec3(hero.x + hero.xdir, EYEHEIGHT, hero.z + hero.zdir),
            vec3(upx, upy, upz));
        
        //Exact copy of modelViewMatrix, but won't get changed when modeViewMatrix gets changed.
        //This is to be able to always place the light correctly.
        heroPositionMatrix = lookAt(vec3(hero.x, EYEHEIGHT, hero.z),
        vec3(hero.x + hero.xdir, EYEHEIGHT, hero.z + hero.zdir),
        vec3(upx, upy, upz));

        projectionMatrix = perspective(fov, HERO_VP * aspect, near, far);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(heroPositionMatrixLoc, false, flatten(heroPositionMatrix));

        arena.show();

        hero.show();

        coins.forEach(coin => coin.show());
    
        ghosts.forEach(ghost => ghost.show());

        projectile1.show();
    
        walls.forEach(wall => wall.show());
    
        wallStart.show();
    
        // Overhead viewport 
        var horiz_offset = (width * (1.0 - HERO_VP) / 20.0);
        //var horiz_offset = 50;
        gl.viewport(vp1_left + (HERO_VP * width) + horiz_offset,
            vp1_bottom, (HERO_VP * width), height);

        //lp0[0] = hero.x + hero.xdir; // Light in front of hero, in line with hero's direction
        //lp0[1] = EYEHEIGHT;
        //lp0[2] = hero.z + hero.zdir;
        //lp1[0] = hero.x + hero.xdir; // Light in front of hero, in line with hero's direction
        //lp1[1] = EYEHEIGHT;
        //lp1[2] = hero.z + hero.zdir;

        modelViewMatrix = lookAt(vec3(500.0, 100.0, -500.0),
            vec3(500.0, 0.0, -500.0),
            vec3(0.0, 0.0, -1.0));
        heroPositionMatrix = lookAt(vec3(500.0, 100.0, -500.0),
            vec3(500.0, 0.0, -500.0),
            vec3(0.0, 0.0, -1.0));
        projectionMatrix = ortho(-500, 500, -500, 500, 0, 200);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(heroPositionMatrixLoc, false, flatten(heroPositionMatrix));
        arena.show();
    
        hero.show();
    
        coins.forEach(coin => coin.show());
    
        ghosts.forEach(ghost => ghost.show());

        projectile1.show();
    
        walls.forEach(wall => wall.show());
    
        if (hasLeftStart) {
            wallStart.show();
            //soundtrack.play();
        }
    } else {
        // Overhead viewport 
        var horiz_offset = (width * (1.0 - HERO_VP) / 20.0);
        //var horiz_offset = 50;
        gl.viewport(vp1_left, vp1_bottom, (HERO_VP * width), height);
        modelViewMatrix = lookAt(vec3(500.0, 100.0, -500.0),
            vec3(500.0, 0.0, -500.0),
            vec3(0.0, 0.0, -1.0));
        projectionMatrix = ortho(-500, 500, -500, 500, 0, 200);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        arena.show();
    }


    requestAnimFrame(render);
};

function handleMovement() {
    if (alive) {
        if (hasLeftStart) {
            ghosts.forEach(ghost => ghost.moveAuto());
            projectile1.move(2.0);
            soundtrack.play();
        } else {
            if ((getXCoord(hero.x) < 9 || getXCoord(hero.x) > 10) || (getZCoord(hero.z) < 9 || getZCoord(hero.z) > 10)) {
                hasLeftStart = true;
                gridSquare(9, 9, 1);
                gridSquare(9, 10, 1);
                gridSquare(10, 9, 1);
                gridSquare(10, 10, 1);
                gameBeginSound.play();
            }
        }


        if (forward && !backward) {
            hero.move(1.0);
        } else if (backward && !forward) {
            hero.move(-1.0);
        }

        if (right && !left) {
            hero.turn(2);
        } else if (left && !right) {
            hero.turn(-2);
        }

        //Checks for collisions between projectile and hero.
        if (projectile1.isTouchingHero()) {
            ballHit.play();
            hero.disableMovement();
        }

        //Checks for collisions between ghosts and the hero.
        ghosts.forEach(function (ghost, i) {
            if (ghost.isTouchingHero()) {
                soundtrack.pause();
                soundtrack.currentTime = 0;
                dyingSound.play();
                alive = false;
                updateCoinCount(0);
            }
        });

        //Checks for collisions between ghosts and the hero.
        coins.forEach(function (coin, i) {
            if (coin.isTouchingHero()) {
                var newLocation = getRandomLocationForCoin();
                coin.x = xCoord(newLocation[0]);
                coin.z = zCoord(newLocation[1]);
                coinSound.pause();
                coinSound.currentTime = 0;
                coinSound.play();
                updateCoinCount(1);
            }
        });

        requestAnimFrame(handleMovement);
    } else {

    }
}

// Key listener

window.onkeydown = function (event) {
    //var key = String.fromCharCode(event.keyCode);
    // For letters, the upper-case version of the letter is always
    // returned because the shift-key is regarded as a separate key in
    // itself.  Hence upper- and lower-case can't be distinguished.
    switch (event.keyCode) {
        case 83:
            // Move backward
            //hero.move(-2.0);
            backward = true;
            break;
        case 40:
            // Move backward
            //hero.move(-2.0);
            backward = true;
            break;
        case 87:
            // Move forward
            //hero.move(2.0);
            forward = true;
            break;
        case 38:
            // Move forward
            //hero.move(2.0);
            forward = true;
            break;
        case 68:
            // Turn right 
            //hero.turn(2);
            right = true;
            break;
        case 39:
            // Turn right 
            //hero.turn(2);
            right = true;
            break;
        case 65:
            // Turn left 
            //hero.turn(-2);
            left = true;
            break;
        case 37:
            // Turn left
            //hero.turn(-2);
            left = true;
            break;
    }
};

window.onkeyup = function (event) {
    //var key = String.fromCharCode(event.keyCode);
    // For letters, the upper-case version of the letter is always
    // returned because the shift-key is regarded as a separate key in
    // itself.  Hence upper- and lower-case can't be distinguished.
    switch (event.keyCode) {
        case 83:
            // Move backward
            //hero.move(-2.0);
            backward = false;
            break;
        case 40:
            // Move backward
            //hero.move(-2.0);
            backward = false;
            break;
        case 87:
            // Move forward
            //hero.move(2.0);
            forward = false;
            break;
        case 38:
            // Move forward
            //hero.move(2.0);
            forward = false;
            break;
        case 68:
            // Turn right 
            //hero.turn(2);
            right = false;
            break;
        case 39:
            // Turn right 
            //hero.turn(2);
            right = false;
            break;
        case 65:
            // Turn left 
            //hero.turn(-2);
            left = false;
            break;
        case 37:
            // Turn left
            //hero.turn(-2);
            left = false;
            break;
    }
};

window.onkeypress = function (event) {
    switch(event.keyCode) {
        case 13:
            if (!alive) {
                setup();
            } else if (inMenu) {
                inMenu = false;
                $("#GameContents").removeClass("hidden");
                $("#Description").addClass("hidden");
            }
            break;
        default:
    }
}

function xCoord(x) {
    return ((x + 0.5) * ARENASIZE) / 20.0;
}

function zCoord(z) {
    return -((z + 0.5) * ARENASIZE) / 20.0;
}

function getXCoord(x) {
    return Math.floor(x * 20 / ARENASIZE);
}

function getZCoord(z) {
    return -Math.ceil(z * 20 / ARENASIZE);
}

function updateCoinCount(n = null) {
    if(n === null) {
        coinsCollected = 0;
    } else {
        coinsCollected += n;
    }
    if (alive) {
        $("#CoinCountDiv").text(`You've collected ${coinsCollected} ${coinsCollected === 1 ? "coin" : "coins"} so far!`);
    } else {
        $("#CoinCountDiv").text(`You collected ${coinsCollected} ${coinsCollected === 1 ? "coin" : "coins"} before dying! Try for a higher score next time! Press ENTER to restart`);
    }
}