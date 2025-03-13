import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 2, 8);

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
const scene = new THREE.Scene();
let cubes = [];

const planeSize = 100;

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1, 0);
controls.update();

const loadManager = new THREE.LoadingManager();


function render(time){
    time *= 0.001;  // convert time to seconds

    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

function makeCube(geometry, color, x, y, z = 0){
    const material = new THREE.MeshPhongMaterial({color});
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
    return cube;
}

function loadCubeTexture(texturePathArray){
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load(texturePathArray);
    return texture;
}

function loadTexture(loaderMode, texturePath){
    let loader = new THREE.TextureLoader(loadManager);;
    switch(loaderMode){
        case 'cube':
            return loadCubeTexture(texturePath);
        case 'equirect':
            const texture = loader.load(texturePath, () => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;
            });
            return texture;
        default:
            return loader.load(texturePath);
    }
}

function placeOBJ(objPath, mtlPath){
    const mtlLoader = new MTLLoader(loadManager);
    const objLoader = new OBJLoader(loadManager);

    mtlLoader.load(mtlPath, (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
    });

    objLoader.load(objPath, (obj) => {
        obj.position.y = 1;
        scene.add(obj);
    });
}

function makeFishTank(){
    const aquariumTexture = loadTexture('texture', '/images/aquariumBackground.jpg');
    aquariumTexture.wrapS = THREE.RepeatWrapping;
    aquariumTexture.wrapT = THREE.RepeatWrapping;
    // aquariumTexture.magFilter = THREE.NearestFilter;

    const geometry = new THREE.BoxGeometry(10, 5, 5);
    const material = new THREE.MeshBasicMaterial({map: aquariumTexture, side: THREE.DoubleSide});
    const water = new THREE.Mesh(geometry, material);
    water.position.x = 0;
    water.position.y = 5;
    water.position.z = -5;
    scene.add(water);

    const glassMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFFF, opacity: 0.3, transparent: true});
    const outerGeometry = new THREE.BoxGeometry(12, 7, 7); // Slightly larger than the water object
    const glass = new THREE.Mesh(outerGeometry, glassMaterial);
    glass.position.x = 0;
    glass.position.y = 4;
    glass.position.z = -5;
    scene.add(glass);

    const backGeometry = new THREE.BoxGeometry(12, 7, 0.1);
    const aquariumBack = makeCube(backGeometry, 0xAAAAAA, 0, 4, -8.5);

    const topGeometry = new THREE.BoxGeometry(12.1, 2, 7.1);
    const aquariumTop = makeCube(topGeometry, 0xAAAAAA, 0, 8.1, -5);

    const bottomGeometry = new THREE.BoxGeometry(12.1, 2.5, 7.1);
    const aquariumBottom = makeCube(bottomGeometry, 0xAAAAAA, 0, 1.2, -5);

    return;
}

function makeWorld(){
    const skyboxTexture = loadTexture('cube', ['/images/skybox.jpg','/images/skybox.jpg','/images/skybox.jpg','/images/skybox.jpg','/images/skybox.jpg','/images/skybox.jpg']);
    skyboxTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyboxTexture;

    // placeOBJ('/sawfish/21864_Sawfish_v1.obj', '/sawfish/Blank.mtl');

    // set up texture for the ground
    const groundTexture = loadTexture('texture' ,'/images/topGrass.jpg');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.magFilter = THREE.NearestFilter;
    groundTexture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({map: groundTexture, side: THREE.DoubleSide});
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);

    groundTexture.repeat.set(repeats, repeats);
    planeMesh.rotation.x = Math.PI * -.5;
    scene.add(planeMesh);

    makeFishTank();
}

function setupLights(){
    const directColor = 0xFFFFFF;
    const intensity = 1;
    const directLight = new THREE.DirectionalLight(directColor, intensity);
    directLight.position.set(-1, 2, 4);
    scene.add(directLight);

    const ambientColor = 0xffae99;
    const ambientLight = new THREE.AmbientLight(ambientColor, intensity);
    scene.add(ambientLight);

    const skyColor = 0x3fc7fc;
    const groundColor = 0x4c733e;
    const hemiIntensity = 0.6;
    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, hemiIntensity);
    scene.add(hemiLight);
}

function main(){
    makeWorld();

    // add some cubes
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    cubes = [
        makeCube(geometry, 0x44aa88, 0, 1),
        makeCube(geometry, 0x8844aa, -2, 1),
        makeCube(geometry, 0xaa8844, 2, 1),
    ];

    setupLights();

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

main();