//Rush ball
//Seung Lee - A01021720
//Gualberto Casas - A00942270
//Alonso Iturbe - A01021621

//Basicas de la escena
var renderer = null,
    scene = null,
    camera = null,
    root = null,
    group = null;

//Objeto que va a ser lo que se va a mover
var objLoader = null;
var ambientLight = null;

var duration = 10000; // ms
var currentTime = Date.now();
var positionZInit = 200;

//Nuestro jugador (esfera)
var spherePlayer = null;
var availableToMove = true;
var availableToJump = true;
var onPause = false;
var songMuted = false;

//Variables del stage
var roads = [];
var spikeTraps = [];
var spikeTrapCounter = 0;
var spikeTrapPosition = positionZInit;
var laserRays = [];
var laserRayCounter = 0;
var laserRayPosition = positionZInit;
var obstacles = [];
var obstacleCounter = 0;
var obstaclePosition = positionZInit;
var rings = [];
var lastZPos = -140;

//Queue para los obstaculos
var obstacleQueue = [];

//Score que vamos a llevar todo el tiempo
var scoreboard = "";
var score = 0;
var playerUser = "Seungy"; //Usuario que va a estar jugando
var playerPosScore = 200;

var ringSoundPlaying = 0;

//Animaciones
var reflectionCube = null;
var animator = null,
    durationAnimation = 1, // sec
    loopAnimation = false;

var clock = new THREE.Clock();
var lost = false;

//Particle explosion Sacada de ejemplo de js de codepen
//////////////settings/////////
var movementSpeed = 80;
var totalObjects = 1000;
var objectSize = 10;
var sizeRandomness = 4000;
var colors = [0xFF0FFF, 0xCCFF00, 0xFF000F, 0x996600, 0xFFFFFF];
/////////////////////////////////
var dirs = [];
var parts = [];

// //Funcion para loadear obstaculos
function loadObstacles(positionXObs, positionZObs) //Le pasamos las posiciones de X y Y para saber en donde spawnearlo 
{
    if (!objLoader)
        objLoader = new THREE.OBJLoader();

    objLoader.load(
        '../models/fence.obj',

        function (object) {

            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            fence = object;
            fence.scale.set(0.2, 0.2, .17);
            fence.position.set(positionXObs, -3, positionZObs)
            // fence.position.set(-20,-3,-240);
            // fence.rotation.set(0, 20.4, 0);
            //Diferentes rotaciones para usar despues
            // fence.rotation.set(0, 0, 0); //Down side
            // fence.rotation.set(0, 4.75, 0); //Left Side
            // fence.rotation.set(0, 14.25, 0); //Right side 
            let material = new THREE.MeshBasicMaterial({ color: 0xC0C0C0, envMap: scene.background });
            fence.material = material;
            fence.receiveShadow = true;
            obstacles.push(fence);
            group.add(fence);
        },
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        });
}

// //Funcion para loadear traps
function loadTrap(positionXTrap, positionZTrap) //Igual que el de los obstaculos
{
    if (!objLoader)
        objLoader = new THREE.OBJLoader();

    objLoader.load(
        '../models/spikeTrap.obj',

        function (object) {

            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            spikeTrap = object;
            spikeTrap.scale.set(0.002, 0.002, .0017);
            spikeTrap.position.set(positionXTrap, -5, -positionZTrap);
            spikeTrap.rotation.set(0, 20.4, 0);
            //Diferentes rotaciones para usar despues
            // spikeTrap.rotation.set(0, 0, 0); //Down side
            // spikeTrap.rotation.set(0, 4.75, 0); //Left Side
            // spikeTrap.rotation.set(0, 14.25, 0); //Right side 
            spikeTrap.castShadow = true;
            spikeTrap.receiveShadow = true;
            spikeTraps.push(spikeTrap);
            group.add(object);
        },
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        });
}

function createLaserRays(posXLaser, posZLaser) {
    let ran = (Math.floor(Math.random() * 1) + 1) * 10;

    let laserRaysGroup = [];
    // var groupLaserRay = new THREE.Group();
    // var groupLaserRay = new THREE.Object3D();
    var obj = {
        posZ: posZLaser,
        posX: posXLaser
    };

    //Crear las geometrias de los cilindros y los cubos
    let geometry = new THREE.BoxGeometry(4, 4, 4);
    let material = new THREE.MeshBasicMaterial({ color: 0xC0C0C0, envMap: scene.background });
    let cube = new THREE.Mesh(geometry, material);
    let cube2 = new THREE.Mesh(geometry, material);


    geometry = new THREE.CylinderGeometry(0.25, 0.25, 18 + ran, 32);
    material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    let cylinder = new THREE.Mesh(geometry, material);

    //Agregarles las posiciones y las rotaciones necesarias
    cylinder.rotation.set(0, 0, 1.57);
    cylinder.position.set(posXLaser, 0, posZLaser);
    cylinder.shader
    if (ran == 20) {
        ran = 17.5;
    } //Dependiendo del ran, el tamano de los lasers va a ser diferente
    cube.position.set(posXLaser + ran + 2.5, 0, posZLaser);
    cube2.position.set(posXLaser - ran - 2.5, 0, posZLaser);

    laserRaysGroup.push(cube);
    laserRaysGroup.push(cube2);
    laserRaysGroup.push(cylinder);

    scene.add(cube);
    scene.add(cube2);
    scene.add(cylinder);

    //Agregarlos a los lasers
    laserRays.push(laserRaysGroup);
}

function createRings(posXRings, posZRings) { //Creacion de los anillos dependiendo de en que posiciones de X y Z le demos
    var geometry = new THREE.RingGeometry(5, 6, 30, 30);
    var material = new THREE.MeshBasicMaterial({ color: 0xDAF400, side: THREE.DoubleSide, });
    var ring = new THREE.Mesh(geometry, material);

    ring.scale.set(0.7, 0.7, 0.7);
    ring.position.set(posXRings, 1.2, posZRings);

    rings.push(ring);
    scene.add(ring);
}

function loadPlayerSphere(color) { //Loadear a nuestro jugador al que estaremos utilizando
    // var esfera = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    var esfera = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 6), new THREE.MeshBasicMaterial({ color }));

    spherePlayer = esfera;
    spherePlayer.position.set(5, -1, positionZInit);
    spherePlayer.castShadow = true;
    spherePlayer.recieveShadow = true;
    scene.add(spherePlayer);
}

//Load del jugador como objeto
function loadPlayer() {
    if (!objLoader)
        objLoader = new THREE.OBJLoader();

    objLoader.load(
        '../models/player.obj',

        function (object) {
            var texture = new THREE.TextureLoader().load('../models/playerA.jpg');

            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                }
            });
            spherePlayer = object;
            spherePlayer.scale.set(0.035, 0.035, 0.035);
            spherePlayer.position.set(5, -2, positionZInit);
            spherePlayer.rotation.set(0, 0, 0.4);
            spherePlayer.castShadow = true;
            spherePlayer.recieveShadow = true;
            scene.add(spherePlayer);
        },
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        });
}

function spawnObject(obj) { //Funcion para spawnear aleatoriamente
    console.log(obj.xPosition); //Le pasamos como parametro un objeto que tendra las posiciones de z del jugador y de que obstaculo se debe crear
    if (obj.type == 0) { //Spikes
        for (let i = 0; i < spikeTraps.length; i++) {
            if (spikeTraps[i].position.z > spherePlayer.position.z + 500) { //Vamos moviendo los obstaculos dependiendo de como vaya el queue
                spikeTraps[i].position.z = obj.zPosition;
                spikeTraps[i].position.x = obj.xPosition;
                // console.log(obj.zPosition);
                break;
            }
        }
    }
    if (obj.type == 1) { //Fences
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].position.z > spherePlayer.position.z + 500) { //500 posiciones en z adelante del jugador
                obstacles[i].position.z = obj.zPosition;
                obstacles[i].position.x = obj.xPosition;
                break;
            }
        }
    }
    if (obj.type == 2) { //Laser
        let ran = (Math.floor(Math.random() * 1) + 1) * 10;
        for (let i = 0; i < laserRays.length; i++) {
            if (laserRays[i][2].position.z > spherePlayer.position.z + 500) { //El arreglo de rayos laser [i][2] es el que tiene todo el laser en si
                laserRays[i].forEach((laser, index) => {
                    if (index == 0) {
                        laser.position.x = obj.xPosition + 12.5
                    } else if (index == 1) {
                        laser.position.x = obj.xPosition - 12.5
                    } else {
                        laser.position.x = obj.xPosition
                    }
                });
                laserRays[i].forEach(laser => laser.position.z = obj.zPosition);
                break;
            }
        }
    }
    if (obj.type == 3) { //Anillos
        let tempPosRingsZ = obj.zPosition;
        for (let i = 0; i < obj.ringCount; i++) {
            createRings(obj.xPosition, tempPosRingsZ);
            tempPosRingsZ -= 20; //Aumentamos la posicion de Z para sacar mas anillos
        }
    }
}

//Funcion de animate
var increasingSpeed = 4; //La velocidad que iremos incrementando a traves del juego
function animate() {
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 50 * fract;
    // console.log(angle); //Debugs
    // console.log(lost);
    // console.log(spherePlayer.position.z);

    //Mientras nuestro queue de obstaculos sea menor a 5, iremos creando un nuevo obj y llamando nuestra funcion para crear objetos
    while (obstacleQueue.length < 5) {
        lastZPos -= Math.floor(Math.random() * 80) + 80;
        var obj = {
            type: Math.floor(Math.random() * 4), //Tipo de obstaculo que se va a crear
            ringCount: Math.floor(Math.random() * 4), //Cantidad de anillos
            zPosition: lastZPos, //Ultima posicion en z que seria random
            xPosition: (Math.floor(Math.random() * 4 + 1) * 10) - 20 //Posicion en x en la que spawneariamos el objeto de rnadom
        };
        obstacleQueue.push(obj);
        spawnObject(obj);
        // console.log(spikeTraps);
    }

    if (spherePlayer.position.z < obstacleQueue[0].zPosition - 100) {
        // console.log("Fdasfasd");
        obstacleQueue.shift(); //Shift el queue
    }

    //Funcion para hacer anillos girar
    for (let i = 0; i < rings.length; i++) {
        rings[i].rotation.y += angle * 0.5;
    }

    //Funcion para irle agregeando puntos al jugador
    if (spherePlayer.position.y > -2 && lost == false) {
        //Movimiento de la esfera del jugador
        // console.log(increasingSpeed); //Debug
        increasingSpeed += .004; //Vamos incrementado la velocidad de la pelota
        spherePlayer.rotation.x += angle / (Math.PI * 1.5); //Rotacion de la esfera siempre
        spherePlayer.position.z -= angle * increasingSpeed; //Velocidad de la esfera
        camera.position.z -= angle * increasingSpeed; //Camara se movera con la esfera
        score++; //Vamos agregando los puntos
        playerPosScore -= 10;
        scoreBoard = "Score:\t" + score + " points";
        playerBoard = playerUser;
        document.getElementById("scoreboard").innerHTML = scoreBoard;
        document.getElementById("playerName").innerHTML = playerBoard;
    } else if (lost == true) {
        // console.log(lost);
        spherePlayer.position.z = positionZInit;
    }

    var pCount = parts.length;
    while (pCount--) {
        parts[pCount].update();
    }
}

function run() {
    //Request animation Frame
    requestAnimationFrame(run);
    // Render the scene
    renderer.render(scene, camera);
    // Anmator update KF
    KF.update();
    //Render del dt
    var dt = clock.getDelta();
    composer.render(dt);
    // Spin the cube for next frame
    animate();
    collisions();
}


//Funcion para mover al jugador cuando apriete las teclas
function onKeyDown(event) {
    switch (event.keyCode) {
        case 37: // left
            if (availableToMove == true) {
                spinPlayerLeft(spherePlayer);
            }
            // camera.position.x -= 0.7;
            // console.log(spherePlayer.position.x); //Debug
            // console.log(obstacleQueue);
            break;

        case 39: // right
            if (availableToMove == true) {
                spinPlayerRight(spherePlayer);
            }
            // camera.position.x += 0.7;
            // console.log(spherePlayer.position.x);
            break;
        case 32: //Space (aka jump)
            if (availableToJump == true) {
                jumpPlayer(spherePlayer);
            }
            break;
        case 27: //Pause (escape)
        case 80: //Pause (escape)
            if (onPause == false) {
                onPause = true;
                spherePlayer.position.y = -2;
                $(".pause-menu-container").css("display", "block");
            } else if (onPause == true) {
                onPause = false;    
                spherePlayer.position.y = -1;
                $(".pause-menu-container").css("display", "none");
            }
            break;
        case 77: //Mute button
            if(songMuted == false) {
                Sounds.background.setVolume(0);
                songMuted = true;
            } else if (songMuted == true) {
                Sounds.background.setVolume(1);
                songMuted = false;
            }
    }
}

function createScene(canvas, username, color) {
    playerUser = username;
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    // create a render and set the size
    //  var renderer = new THREE.WebGLRenderer( {canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xffffff);
    var effectController = {
        amount: 2.0,
        opacity: 1.0
    };
    // Loadear a nuestro jugador como objeto
    // loadPlayer();

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create a new Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.CubeTextureLoader()
        .setPath('../pictures/')
        .load(['nebula_px.jpg', 'nebula_nx.jpg', 'nebula_py.jpg', 'nebula_ny.jpg', 'nebula_pz.jpg', 'nebula_nz.jpg']);
    scene.background.minFilter = THREE.LinearFilter;

    // Load Player
    loadPlayerSphere(color);

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 30, positionZInit + 30);
    camera.rotation.set(-0.7, 0, 0);
    // spherePlayer.add(camera);
    scene.add(camera);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    // Agregar un ambient light para nuestra escena
    ambientLight = new THREE.DirectionalLight(0xffffff, 1.0);
    root.add(ambientLight);

    //Agregamos los controles para poder mover el objeto
    document.addEventListener('keydown', onKeyDown);

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    //Crear escena en donde se va a llevar el juego
    var stage = new THREE.Mesh(new THREE.PlaneGeometry(60, 100000, 20, 20), new THREE.MeshPhongMaterial({ color: 0x4D648D, side: THREE.DoubleSide }));

    var matChanger = function () {
        pass.amount = effectController.amount;
        pass.opacity = effectController.opacity;
    };
    stage.rotation.x = -Math.PI / 2;
    stage.position.y = -4.02;
    // Add the mesh to our group
    group.add(stage);

    // create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    camera.add(listener);

    // Create obstacles and roads.
    createStartLines();
    for (let i = 0; i < 5; i++) {
        loadTrap(20, 10);
        loadObstacles(-20, -180);
        createLaserRays(-20, -200);
    }

    // createRings(-5, -230);
    // createRings(-5, -250);
    tempPosX = -5;
    tempPosZ = -230;
    for (let i = 0; i < 3; i++) {
        createRings(15, tempPosZ);
        tempPosZ -= 20;
    }

    //Composer para el efecto de bloom
    composer = new THREE.EffectComposer(renderer);

    composer.addPass(new THREE.RenderPass(scene, camera));
    pass = new THREE.BloomBlendPass(effectController.amount, effectController.opacity, new THREE.Vector2(window.innerWidth, window.innerHeight));
    pass.renderToScreen = true;
    composer.addPass(pass);

    //Inicializar nuestro scoreboard
    scoreBoard = "Score:\t" + score + " points";
    playerBoard = playerUser;
    document.getElementById("scoreboard").innerHTML = scoreBoard;
    document.getElementById("playerName").innerHTML = playerBoard;

    // Now add the group to our scene
    scene.add(root);

    // Play music
    Sounds.background.repeat();
}

//Funcion para crear la start lines
function createStartLines() {
    posZ = positionZInit - 20;
    for (let i = 0; i < 2500; i++) {
        roads[i] = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), new THREE.MeshPhongMaterial({ color: 0x3E0E4C, side: THREE.DoubleSide }));
        roads[i].rotation.x = -Math.PI / 2;
        roads[i].position.y = -4;

        roads[i].position.z = posZ;

        posZ = posZ - 30;

        group.add(roads[i]);
    }
}


//Funcion de colisiones --------------------------------------------------------------------------
function collisions() {
    //Funcion de colision de SpikeTraps
    for (let i = 0; i < spikeTraps.length; i++) {
        if (spherePlayer.position.z <= spikeTraps[i].position.z + 4.5 && spherePlayer.position.z >= spikeTraps[i].position.z - 4.5) {
            if (spherePlayer.position.x <= spikeTraps[i].position.x + 7 && spherePlayer.position.x >= spikeTraps[i].position.x - 7) {
                if (spherePlayer.position.y <= spikeTraps[i].position.y + 10) {
                    parts.push(new ExplodeAnimation(spherePlayer.position.x, spherePlayer.position.y, spherePlayer.position.z));
                    Sounds.crash.play();
                    restart();
                }
            }
        }
    }

    //Funcion de colision de Obstacles
    for (let i = 0; i < obstacles.length; i++) {
        if (spherePlayer.position.z <= obstacles[i].position.z + 3.5 && spherePlayer.position.z >= obstacles[i].position.z - 3.5) {
            if (spherePlayer.position.x <= obstacles[i].position.x + 7 && spherePlayer.position.x >= obstacles[i].position.x - 7) {
                if (spherePlayer.position.y <= obstacles[i].position.y + 10) {
                    parts.push(new ExplodeAnimation(spherePlayer.position.x, spherePlayer.position.y, spherePlayer.position.z));
                    Sounds.crash.play();
                    restart();
                }
            }
        }
    }

    //Funcion de colision de Rayos Laser
    for (let i = 0; i < laserRays.length; i++) {
        if (spherePlayer.position.z <= laserRays[i][2].position.z + 3.5 && spherePlayer.position.z >= laserRays[i][2].position.z - 3.5) {
            if (spherePlayer.position.x <= laserRays[i][2].position.x + 15 && spherePlayer.position.x >= laserRays[i][2].position.x - 15) {
                if (spherePlayer.position.y <= laserRays[i][2].position.y + 7) {
                    parts.push(new ExplodeAnimation(spherePlayer.position.x, spherePlayer.position.y, spherePlayer.position.z));
                    Sounds.crash.play();
                    restart();
                }
            }
        }
    }

    //Funcion de colision de Anillos (puntos extra)
    for (let i = 0; i < rings.length; i++) {
        if (spherePlayer.position.z <= rings[i].position.z + 4.5 && spherePlayer.position.z >= rings[i].position.z - 4.5) {
            if (spherePlayer.position.x <= rings[i].position.x + 5 && spherePlayer.position.x >= rings[i].position.x - 5) {
                if (spherePlayer.position.y <= rings[i].position.y + 10) {
                    // Sounds.ring.stop();
                    // console.log("test");
                    playRingSound();
                    score += 100; //Agregamos 100 puntos por cada anillo
                    scene.remove(rings[i]);
                }
            }
        }
    }

    //Funcion de caida de la esfera
    if (spherePlayer.position.x > 28 || spherePlayer.position.x < -28) { //si la posicion en x se sale del obstaculo en si
        spherePlayer.position.y -= 1; //Vamos bajando la esfera
        if (spherePlayer.position.y <= -80) { //pierde
            restart();
        }
    }
}

//Funcion de restart para cuando choque
async function restart() {
    var topScoreRef = firebase.database().ref('topScores');
    const array = [];
    let inserted = false;
    await topScoreRef.once('value').then((snap) => {
        // console.log('snap:', snap.val());
        if(snap.val()) {
            snap.val().forEach((_score) => {
                if (score > _score.score && !inserted) {
                    array.push({ name: playerUser, score: score });
                    inserted = true;
                }
                array.push(_score);
            });
        }
    });
    if (array.length > 3) array.pop();
    // topScoreRef.set(array);
    topScoreRef.set(array);
    // camera.position.set(0, 30, 20);
    // camera.rotation.set(-0.7, 0, 0);
    // spherePlayer.position.set(5, -1, positionZInit);
    // spherePlayer.rotation.set(0, 9.5, 0);
    scoreBoard = "You have lost the game!";
    playerBoard = playerUser;
    document.getElementById("scoreboard").innerHTML = scoreBoard;
    document.getElementById("playerName").innerHTML = playerBoard;
    lost = true;
    setTimeout(function () {
        location.reload(true);
    }, 2500);
}

//Animaciones
function spinAnimationRight(player) { //Animacion basica de THREEJS del cubo que ya habiamos utilizado
    // console.log("gasdg");
    availableToMove = false;
    animator = new KF.KeyFrameAnimator;
    animator.init({

        interps:
            [
                {
                    keys: [0, .33, 0.66, 1],
                    values: [
                        { z: 0 },
                        { z: -Math.PI / 3 },
                        { z: -Math.PI * 2 / 3 },
                        { z: -Math.PI }
                    ],
                    target: player.rotation
                },
                {
                    keys: [0, .33, 0.66, 1],
                    values: [
                        { x: spherePlayer.position.x },
                        { x: spherePlayer.position.x + 3.33 },
                        { x: spherePlayer.position.x + 6.66 },
                        { x: spherePlayer.position.x + 10 },
                    ],
                    target: player.position
                },
            ],
        loop: false,
        duration: durationAnimation * 200,
        easing: TWEEN.Easing.Linear.None,
    });
}

//Animaciones
function spinAnimationLeft(player) { //Animacion basica de THREEJS del cubo que ya habiamos utilizado
    // console.log("gasdg");
    availableToMove = false;
    animator = new KF.KeyFrameAnimator;
    animator.init({
        interps:
            [
                {
                    keys: [0, .33, 0.66, 1],
                    values: [
                        { z: 0 },
                        { z: Math.PI / 3 },
                        { z: Math.PI * 2 / 3 },
                        { z: Math.PI }
                    ],
                    target: player.rotation
                },
                {
                    keys: [0, .33, 0.66, 1],
                    values: [
                        { x: spherePlayer.position.x },
                        { x: spherePlayer.position.x - 3.33 },
                        { x: spherePlayer.position.x - 6.66 },
                        { x: spherePlayer.position.x - 10 },
                    ],
                    target: player.position
                },
            ],
        loop: false,
        duration: durationAnimation * 200,
        easing: TWEEN.Easing.Linear.None,
    });
    availableToMove = true;
}

//Animaciones
function spinAnimationJump(player) { //Animacion basica de THREEJS del cubo que ya habiamos utilizado
    // console.log("gasdg");
    animator = new KF.KeyFrameAnimator;
    animator.init({
        interps:
            [
                {
                    keys: [0, .25, 0.5, 0.75, 1],
                    values: [
                        { y: spherePlayer.position.y },
                        { y: spherePlayer.position.y + 11 },
                        { y: spherePlayer.position.y + 15 },
                        { y: spherePlayer.position.y + 11 },
                        { y: spherePlayer.position.y },
                    ],
                    target: player.position
                },
            ],
        loop: false,
        duration: durationAnimation * 750,
        easing: TWEEN.Easing.Linear.None,
    });
}

function playAnimations() {
    animator.start();
}

//Girar jugador a la izquierda
function spinPlayerLeft(player) {
    spinAnimationLeft(player);
    playAnimations(player);
    availableToMove = false;
    setTimeout(function () {
        availableToMove = true;
    }, 200);
}

//Girar jugador a la derecha
function spinPlayerRight(player) {
    spinAnimationRight(player);
    playAnimations(player);
    availableToMove = false;
    setTimeout(function () {
        availableToMove = true;
    }, 200);
}

//Hacer que el jugador salte
function jumpPlayer(player) {
    spinAnimationJump(player);
    playAnimations(player);
    availableToJump = false;
    setTimeout(function () {
        availableToJump = true;
    }, 750)
}
//Funcion de explosion de particulas
//https://codepen.io/Xanmia/pen/DoljI
function ExplodeAnimation(x, y, z) //Le pasamos los parametros en donde queremos que se explote
{
    var geometry = new THREE.Geometry();

    for (i = 0; i < totalObjects; i++) //Creamos la cantidad de particulas
    {
        var vertex = new THREE.Vector3();
        vertex.x = x;
        vertex.y = y;
        vertex.z = z;

        geometry.vertices.push(vertex);
        dirs.push({ x: (Math.random() * movementSpeed) - (movementSpeed / 2), y: (Math.random() * movementSpeed) - (movementSpeed / 2), z: (Math.random() * movementSpeed) - (movementSpeed / 2) });
    }
    //Le ponemos el color
    var material = new THREE.ParticleBasicMaterial({ size: objectSize, color: colors[Math.round(Math.random() * colors.length)] });
    var particles = new THREE.ParticleSystem(geometry, material);

    this.object = particles;
    this.status = true;

    this.xDir = (Math.random() * movementSpeed) - (movementSpeed / 2);
    this.yDir = (Math.random() * movementSpeed) - (movementSpeed / 2);
    this.zDir = (Math.random() * movementSpeed) - (movementSpeed / 2);

    scene.add(this.object);

    this.update = function () {
        if (this.status == true) {
            var pCount = totalObjects;
            while (pCount--) {
                var particle = this.object.geometry.vertices[pCount]
                particle.y += dirs[pCount].y;
                particle.x += dirs[pCount].x;
                particle.z += dirs[pCount].z;
            }
            this.object.geometry.verticesNeedUpdate = true;
        }
    }
}

//Funciones para sonido
function Sound(name) {
    this.name = name;
    this.audio = document.createElement('audio');
    var source = document.createElement('source');
    source.src = '/sounds/' + name + '.mp3';
    this.audio.appendChild(source);
}

Sound.prototype.play = function () {
    this.audio.play();
};

Sound.prototype.repeat = function () {
    this.audio.loop = true;
    this.audio.play();
};

Sound.prototype.stop = function () {
    this.audio.repeat = false;
    this.audio.currentTime = 0;
    this.audio.pause();
};

Sound.prototype.setVolume = function (val) {
    this.audio.volume = val;
}

var ringSounds = [
    new Sound('ring'), new Sound('ring'), new Sound('ring'), new Sound('ring'), new Sound('ring')
];

var Sounds = {
    all: [
        'crash', 'ring', 'ring2', 'ring3', 'background'
    ]
};

function playRingSound() {
    ringSounds[ringSoundPlaying].play();
    ringSoundPlaying += 1;
    ringSoundPlaying = ringSoundPlaying % 5;
    // console.log(ringSoundPlaying);
}

Sounds.all.forEach(function (sound) {
    Sounds[sound] = new Sound(sound);
});