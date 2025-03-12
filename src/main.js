import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
const scene = new THREE.Scene();
let cubes = [];
camera.position.z = 2;
const planeSize = 100;

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

let cube;

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

function makeInstance(geometry, color, x){
    const material = new THREE.MeshPhongMaterial({color});
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.x = x;
    return cube;
}

function loadTexture(texturePath){
    const loader = new THREE.TextureLoader();
    return loader.load(texturePath);
}

function makeWorld(){
    // set up texture for the ground
    const groundTexture = loadTexture('/images/topGrass.jpg');
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
}

function main(){
    makeWorld();
    // add a cube
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    cubes = [
        makeInstance(geometry, 0x44aa88, 0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844, 2),
    ];

    setupLights();

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

main();