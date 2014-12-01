// Global variables
var scene, camera, renderer, platformMesh, ceilingPlatform, pLight, bg, engine;
var gapFExists = false;
var gapCExists = false;
var gapFStartX = 0;
var gapFEndX = 0;
var gapCStartX = 0;
var gapCEndX = 0;
var xPosG = 0;
var xPosGPrev = 0;
var xPosC = 0;
var xPosCPrev = 0;
var cameraXPos = 0;
var speed = 10;
var objectRot = 0.2;
var gapLength = speed * 50;
var partLength = 250;
var firstGenerat = true;
var runGame = false;
var obstacleXposPrev = 0;
var worldGroup = new THREE.Group();
var obstaclesXPosArray = [];
var clock = new THREE.Clock();
var collidableMeshList = [];
//KEYBOARD
var keyboard = new THREEx.KeyboardState();
var zacetekSkoka = 0;
var konecSkoka = 0 ;
var zacetekSpremembeGravitacijeGor = 0;
var konecSpremembeGravitacijeGor = 0;
var zacetekSpremembeGravitacijeDol = 0;
var konecSpremembeGravitacijeDol = 0;
var tla = true;
var vSkoku = false;
var vSpremembiGravitacijeGor = false;
var vSpremembiGravitacijeDol = false;
//ANIMACIJE
var tweenUp;
var tweenDown;
var tweenUpUp;
var tweenUpDown;
var tweenDownUp;
var tweenDownDown;
var tweenBullet;
var deltaGor;
var deltaDol;
//OBJEKTI//
var sphere;
var opponent;
var bullet;
var strel;
//ZVOKOVI //
var whiteNoise;
var gravity;
var alienSound;
var SpaceParticle = {
	starfield :
	{
		positionStyle    : Type.CUBE,
		positionBase     : new THREE.Vector3( -50, 0, 0 ),
		positionSpread   : new THREE.Vector3( 600, 400, 600 ),

		velocityStyle    : Type.CUBE,
		velocityBase     : new THREE.Vector3( 0, 0, 0 ),
		velocitySpread   : new THREE.Vector3( 0.5, 0.5, 0.5 ), 
		
		angleBase               : 0,
		angleSpread             : 720,
		angleVelocityBase       : 0,
		angleVelocitySpread     : 4,

		particleTexture : THREE.ImageUtils.loadTexture( 'assets/star.png' ),
		
		sizeBase    : 10.0,
		sizeSpread  : 2.0,				
		colorBase   : new THREE.Vector3(0.15, 1.0, 0.9), // H,S,L
		colorSpread : new THREE.Vector3(0.00, 0.0, 0.2),
		opacityBase : 1,

		particlesPerSecond : 20000,
		particleDeathAge   : 60.0,		
		emitterDeathAge    : 0.1
	},
	startunnel:	{
		positionStyle  : Type.CUBE,
		positionBase   : new THREE.Vector3( -50, 0, 200 ),
		positionSpread : new THREE.Vector3( 600, 400, 600 ),

		velocityStyle  : Type.CUBE,
		velocityBase   : new THREE.Vector3( -50, 0, 0 ),
		velocitySpread : new THREE.Vector3( 0.5, 0.5, 0.5 ), 
		
		angleBase               : 0,
		angleSpread             : 720,
		angleVelocityBase       : 0,
		angleVelocitySpread     : 4,
		
		particleTexture : THREE.ImageUtils.loadTexture( 'assets/star.png' ),

		sizeBase    : 4.0,
		sizeSpread  : 2.0,				
		colorBase   : new THREE.Vector3(0.15, 1.0, 0.8), // H,S,L
		opacityBase : 1,
		blendStyle  : THREE.AdditiveBlending,

		particlesPerSecond : 500,
		particleDeathAge   : 4.0,		
		emitterDeathAge    : 60
	}
}

//HOMESCREEN HIDING//
function start() {
	$("#homescreen").hide();
	$("#gameOverScreen").hide();
	collidableMeshList = [];
	init();
	$("#loadingScreen").show();
	generateTerain();
	$("#loadingScreen").hide();
	$("#canvas").show();
	runGame = true;
	animate();
}
function init(){
	
	//SCENE//
	scene = new THREE.Scene();
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;
	//RENDERER//
	var canvas = document.getElementById("canvas");
	renderer = new THREE.WebGLRenderer({canvas : canvas, antialias: true});
	renderer.setSize(WIDTH,HEIGHT);
	document.body.appendChild(renderer.domElement);
	//LIGHTING//
	var hlight = new THREE.HemisphereLight(0x404040, 0x404040, 2); // soft white light
	scene.add(hlight);	
	//LIGHTING//
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,0,100);
	scene.add(light);
	//SOUNDS//
	strel = new Audio("./sounds/strel.wav");
	whiteNoise = new Audio("./sounds/whitenoise.wav");
	gravity = new Audio("./sounds/gravity.wav");
	alienSound = new Audio("./sounds/space.wav");
	//LOAD GEOMETRY//
	//NAS OSEBEK
	var sphereGeometry = new THREE.SphereGeometry(9,32,32);
	var sphereMaterial = new THREE.MeshPhongMaterial();
	sphereMaterial.map = THREE.ImageUtils.loadTexture('./assets/earth.gif');
	sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	scene.add(sphere);
	// Particles
	engine = new ParticleEngine();
	engine.setValues(SpaceParticle.startunnel);
	engine.initialize();	

	//ZACETNA POZICIJA KROGLE
	sphere.position.y = -50;
	sphere.position.x = -50;

	//ANIMACIJA GRAVITY - UP
	tweenUp = new TWEEN.Tween(sphere.position);
	tweenUp.to({y: "+100"}, 200);
	tweenUp.easing(TWEEN.Easing.Linear.None);

	//ANIMACIJA GRAVITY - DOWN
	tweenDown = new TWEEN.Tween(sphere.position);
	tweenDown.to({y: "-100"}, 200);
	tweenDown.easing(TWEEN.Easing.Linear.None);

	// ANIMACIJA JUMP - UP UP
	tweenUpUp = new TWEEN.Tween(sphere.position);
	tweenUpUp.to({y: "+70"}, 350);
	tweenUpUp.easing(TWEEN.Easing.Quadratic.Out);
	// ANIMACIJA JUMP - UP DOWN
	tweenUpDown = new TWEEN.Tween(sphere.position);
	tweenUpDown.to({y:"-70"}, 350);
	tweenUpDown.easing(TWEEN.Easing.Quadratic.In);
	// POVEZAVA UP UP IN UP DOWN
	tweenUpUp.chain(tweenUpDown);
	// ANIMACIJA JUMP - DOWN UP
	tweenDownUp = new TWEEN.Tween(sphere.position);
	tweenDownUp.to({y: "-70"}, 350);
	tweenDownUp.easing(TWEEN.Easing.Quadratic.Out);
	// ANIMACIJA JUMP - DOWN DOWN
	tweenDownDown = new TWEEN.Tween(sphere.position);
	tweenDownDown.to({y: "+70"}, 350);
	tweenDownDown.easing(TWEEN.Easing.Quadratic.In);
	// POVEZAVA DOWN UP IN DOWN DOWN
	tweenDownUp.chain(tweenDownDown);
	//CAMERA//
	camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.1, 2000);
	camera.position.set(-206,0,144);
	var cLAXPos = sphere.position.x;
	camera.lookAt(new THREE.Vector3(cLAXPos, 0, 0));
	scene.add(camera);
	//RESIZE HANDLING/
	window.addEventListener('resize', function(){
		var WIDTH = window.innerWidth;
		var HEIGHT = window.innerHeight;
		renderer.setSize(WIDTH, HEIGHT);
		camera.aspect = WIDTH/HEIGHT;
		camera.updateProjectionMatrix(); 
	});
}

function generateTerain() {	
	for(var j = 0; j < 60; j++) { 
		// Platform part
		// Platform geometry
		var platformGeometry = new THREE.BoxGeometry(partLength, 10, 30);
		// Faces textures
		var platformTextureT = THREE.ImageUtils.loadTexture("./assets/platformTop.png");
		var platformTextureF = THREE.ImageUtils.loadTexture("./assets/platformFront.png");
		var platformTextureS = THREE.ImageUtils.loadTexture("./assets/platformSide.png");
		var platformTextureB = THREE.ImageUtils.loadTexture("./assets/platformBottom.png");
		// Faces materials
		var materialsG = [];
		materialsG.push(new THREE.MeshLambertMaterial({ map: platformTextureS })); // right face
		materialsG.push(new THREE.MeshLambertMaterial({ map: platformTextureS })); // left face
		materialsG.push(new THREE.MeshLambertMaterial({ map: platformTextureT })); // top face
		materialsG.push(new THREE.MeshLambertMaterial({ map: platformTextureB })); // bottom face
		materialsG.push(new THREE.MeshLambertMaterial({ map: platformTextureF })); // front face
		materialsG.push(new THREE.MeshLambertMaterial({ map: platformTextureF })); // back face
		var platformMaterial = new THREE.MeshFaceMaterial(materialsG);
		// platform mesh
		platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
		// Obstacles
		// Obstacle geometry
		var obstacleGeometry = new THREE.BoxGeometry(30, 30, 30);
		// Obstacle texture
		var obstacleTexture = THREE.ImageUtils.loadTexture("./assets/crate.png");
		// Obstacle material
		var obstacleMaterial = new THREE.MeshLambertMaterial({map: obstacleTexture});
		// Obstacle mesh
		var obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
					
		if(firstGenerat) { 
			for(var i = -550 + partLength; i <= 200; i += partLength) {
				var temp = platformMesh.clone();
				temp.position.x = i;
				temp.position.y = -64;
				temp.matrixAutoUpdate = false;
				temp.updateMatrix();
				worldGroup.add(temp);
				temp = platformMesh.clone();
				temp.position.x = i;
				temp.position.y = 64;
				temp.matrixAutoUpdate = false;
				temp.updateMatrix();
				worldGroup.add(temp);
			}
			firstGenerat = false;
			xPosC = 200;
			xPosG = 200;
		}
		else {
			var gapF = Math.random();
			// make gap in ground
			if(gapF > 0.5 && !gapFExists) {
				gapFExists = true;
				gapFStartX = xPosG + partLength / 2;
				xPosG += partLength + gapLength;
				gapFEndX = xPosG - partLength / 2;
				for(var gapI = xPosC; gapI < gapFEndX; gapI += partLength) {
					xPosC = gapI;
					var temp = platformMesh.clone();
					temp.position.x = xPosC;
					temp.position.y = 64;
					temp.matrixAutoUpdate = false;
					temp.updateMatrix();
					worldGroup.add(temp);
					// obstacle generate
					var makeObstacle = Math.random();
					if(makeObstacle > 0.64) {
						var t = Math.random();
						if(t > 0.5) {
							if(Math.abs(xPosC - xPosCPrev) >= partLength * 2) {
								if(!obstacleExist(xPosG)) {
									obstaclesXPosArray.push(xPosG);
									var tempObs = obstacle.clone();
									tempObs.position.set(xPosG, 44, 0);
									worldGroup.add(tempObs);
									collidableMeshList.push(tempObs);
									xPosCPrev = xPosC;
								}
							}
						}
						else {
							//NASPROTNIK
							var opponentGeometry = new THREE.SphereGeometry(9,32,32);
							var opponentMaterial = new THREE.MeshPhongMaterial({color: 0xFF0000});
							opponent = new THREE.Mesh(opponentGeometry, opponentMaterial);
							//ZACETNA POZICIJA NASPROTNIKA
							opponent.position.x = xPosG;
							opponent.position.y = -50;
							worldGroup.add(opponent);
							//BULLET
							var bulletGeometry = new THREE.CylinderGeometry(1.5,0.5,8,32);
							var bulletMaterial = new THREE.MeshPhongMaterial();
							bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
							//ZACETNA POZICIJA METKA
							bullet.position.x = xPosG;
							bullet.position.y = -50;
							bullet.rotation.z = 4.71;
							worldGroup.add(bullet);
							// ANIMACIJA METKA
							tweenBullet = new TWEEN.Tween(bullet.position);
							tweenBullet.to({x: "-1000"}, 8000);
							tweenBullet.easing(TWEEN.Easing.Linear.None);
							tweenBullet.repeat(Infinity);
							tweenBullet.start();
						}
					}
				}
			}
			else {
				gapFExists = false;
				xPosG += partLength;
				var temp = platformMesh.clone();
				temp.position.x = xPosG;
				temp.position.y = -64;
				temp.matrixAutoUpdate = false;
				temp.updateMatrix();
				worldGroup.add(temp);
			}
			var gapC = Math.random();
			// make gap in ceiling
			if(gapC > 0.5 && !gapCExists) {
				gapCExists = true;
				gapCStartX = xPosC + partLength / 2;
				xPosC += partLength + gapLength;
				gapCEndX = xPosC - partLength / 2;
				for(var gapI = xPosG; gapI < gapCEndX; gapI += partLength) {
					xPosG = gapI;
					var temp = platformMesh.clone();
					temp.position.x = xPosG;
					temp.position.y = -64;
					temp.matrixAutoUpdate = false;
					temp.updateMatrix();
					worldGroup.add(temp);
					var makeObstacle = Math.random();
					if(makeObstacle > 0.64) {
						var t = Math.random();
						if(t > 0.5) {
							if(Math.abs(xPosG - xPosGPrev) >= partLength * 2) {
								if(!obstacleExist(xPosG)) {
									obstaclesXPosArray.push(xPosG);
									var tempObs = obstacle.clone();
									tempObs.position.set(xPosG, -44, 0);
									worldGroup.add(tempObs);
									collidableMeshList.push(tempObs);
									xPosGPrev = xPosG;
								}
							}
						}
						else {
							//NASPROTNIK
							var opponentGeometry = new THREE.SphereGeometry(9,32,32);
							var opponentMaterial = new THREE.MeshPhongMaterial({color: 0xFF0000});
							opponent = new THREE.Mesh(opponentGeometry, opponentMaterial);
							//ZACETNA POZICIJA NASPROTNIKA
							opponent.position.x = xPosC;
							opponent.position.y = -50;
							worldGroup.add(opponent);
							//BULLET
							var bulletGeometry = new THREE.CylinderGeometry(1.5,0.5,8,32);
							var bulletMaterial = new THREE.MeshPhongMaterial();
							bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
							//ZACETNA POZICIJA METKA
							bullet.position.x = xPosC;
							bullet.position.y = -50;
							bullet.rotation.z = 4.71;
							worldGroup.add(bullet);
							// ANIMACIJA METKA
							tweenBullet = new TWEEN.Tween(bullet.position);
							tweenBullet.to({x: "-1000"}, 8000);
							tweenBullet.easing(TWEEN.Easing.Linear.None);
							tweenBullet.repeat(Infinity);
							tweenBullet.start();
						}
					}
				}
			}
			else {
				gapCExists = false;
				xPosC += partLength;
				var temp = platformMesh.clone();
				temp.position.x = xPosC;
				temp.position.y = 64;
				temp.matrixAutoUpdate = false;
				temp.updateMatrix();
				worldGroup.add(temp);
			}
		}
	}
	scene.add(worldGroup);
}
function obstacleExist(obstacleXPos) {
	if(obstaclesXPosArray.length > 0) {
		for(var i = 0; i < obstaclesXPosArray.length; i++) {
			if (obstaclesXPosArray[i] == obstacleXPos) return true;
		}
	}
	return false;
}
function animate(){
	requestAnimationFrame(animate);
	whiteNoise.play();
	alienSound.play();
	alienSound.volume = 0.3;
	// GRAVITY UP
	if(keyboard.pressed("up") && tla != false && !vSkoku && !vSpremembiGravitacijeDol){
		tla = false;
		TWEEN.add(tweenUp);
		tweenDown.stop(); 
		TWEEN.remove(tweenDown);
		tweenUp.start();
		gravity.pause();
		gravity.currentTime = 0;
		gravity.play();
		vSpremembiGravitacijeGor = true;
		zacetekSpremembeGravitacijeGor = parseInt((new Date()).getTime());
		
	}
	// GRAVITY DOWN
	if(keyboard.pressed("down") && tla != true && !vSkoku && !vSpremembiGravitacijeGor){		tla = true;
		TWEEN.add(tweenDown);
		tweenUp.stop();
		TWEEN.remove(tweenUp);
		tweenDown.start();
		gravity.pause();
		gravity.currentTime = 0;
		gravity.play();
		vSpremembiGravitacijeDol = true;
		zacetekSpremembeGravitacijeDol = parseInt((new Date()).getTime());
		
	}
	// JUMP
	konecSpremembeGravitacijeDol = parseInt((new Date()).getTime());
	konecSpremembeGravitacijeGor = parseInt((new Date()).getTime());
	deltaGor = konecSpremembeGravitacijeGor - zacetekSpremembeGravitacijeGor;
	deltaDol = konecSpremembeGravitacijeDol - zacetekSpremembeGravitacijeDol;
	if(deltaGor > 220){
		vSpremembiGravitacijeGor = false;
	}
	if(deltaDol > 220){
		vSpremembiGravitacijeDol = false;
	}
	
	if(keyboard.pressed("space") && !vSkoku && !vSpremembiGravitacijeDol && !vSpremembiGravitacijeGor){
		console.log(worldGroup.position.x );
		if(tla){
			TWEEN.removeAll;
			TWEEN.add(tweenUpUp);
			tweenUpUp.start();
			vSkoku = true;
			zacetekSkoka = parseInt((new Date()).getTime());

		}else{
			TWEEN.removeAll;
			TWEEN.add(tweenDownUp);
			tweenDownUp.start();
			vSkoku = true;
			zacetekSkoka = parseInt((new Date()).getTime());
		}
	}
	konecSkoka = parseInt((new Date()).getTime());
	razlika = konecSkoka - zacetekSkoka;
	if(razlika > 720){
		vSkoku = false;
	}
	if(keyboard.pressed("left")){
		worldGroup.position.x -= speed;
	}
	if(keyboard.pressed("right")){
		worldGroup.position.x += speed;
	}
	// IZRIS
	TWEEN.update();
	// start game animation
	if(runGame) {
		sphere.position.x += speed;
		camera.position.x += speed;
		// SPREMEMBA SMERI ROTACIJE
		if(tla){
			sphere.rotation.z -= objectRot;
		}else{
			sphere.rotation.z += objectRot;
		}
	}
	// restart particle animation
	if(!engine.emitterAlive) {
		engine.emitterAge = 0;
		engine.emitterAlive = true;
	}
	// Collision with obstacles
	var originPoint = sphere.position.clone();
	for(var vIndex = 0; vIndex < sphere.geometry.vertices.length; vIndex++) {
		var vLocal = sphere.geometry.vertices[vIndex].clone();
		var vGlobal = vLocal.applyMatrix4(sphere.matrix);
		var vecDirection = vGlobal.sub(sphere.position);
		
		var ray = new THREE.Raycaster( originPoint, vecDirection.clone().normalize() );
		var collisionResults = ray.intersectObjects(collidableMeshList);
		if (collisionResults.length > 0 && collisionResults[0].distance < vecDirection.length()) {
			if(worldGroup.position.x != 0) {
				runGame = false;
				$("#canvas").hide();
				$("#gameOverScreen").show();
			}
		}
	}
	renderer.render(scene, camera);
	var dt = clock.getDelta();
	engine.update( dt * 0.5 );
}