import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
// import textures to ensure they're packed with the build
import aquariumTexturePath from '/assets/fish.jpg';
import globeTexturePath from '/assets/globe.jpg';
import skyboxTexturePath from '/assets/skybox.jpg';
import topGrassTexturePath from '/assets/topGrass.jpg';

const fishOBJPath = new URL(`${import.meta.env.BASE_URL}assets/Fish/Fish.obj`, import.meta.url).href;
const fishMTLPath = new URL(`${import.meta.env.BASE_URL}assets/Fish/Fish.mtl`, import.meta.url).href;

// const fishOBJPath = new URL('/assets/Fish/Fish.obj', import.meta.url).href;
// const fishMTLPath = new URL('/assets/Fish/Fish.mtl', import.meta.url).href;

// import fishOBJPath from '/assets/Fish/Fish.obj';
// import fishMTLPath from '/assets/Fish/Fish.mtl';

const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 3, 8);

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
const scene = new THREE.Scene();
let cubes = [];
let spheres = [];
let fishes = [];

const planeSize = 100;

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 3, 0);
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

    spheres.forEach((sphere, ndx) => {
        const speed = 1 + ndx * 0.05;
        const rot = time * speed;
        sphere.rotation.y = rot;
    });

    fishes.forEach((fish, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        fish.position.x = Math.sin(rot)* 4.5;
        fish.position.y = Math.cos(rot);
    });

    // if(fish){
    //     fish.position.x = Math.sin(time) * 4.5;
    //     fish.position.y = Math.cos(time);
    //     // // flip the fish around when it changes direction
    //     // if(fish.position.x >= 4.4){
    //     //     fish.rotation.y = Math.PI;
    //     //     fish.position.z = -1;
    //     // }
    //     // else if(fish.position.x <= -4.4){
    //     //     fish.rotation.y = 0;
    //     //     fish.position.z = -4;
    //     // }
    // }

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

function makeSphere(bubbleMode = false, geometry, texture, x, y, z){
    let material;
    if(bubbleMode){
        material = new THREE.MeshPhongMaterial({
            color: 0xa6c8ff, 
            transparent: true, 
            opacity: 0.4,
            specular: 0xFFFFFF,
            shininess: 70,
        });
    }
    else{
        material = new THREE.MeshPhongMaterial({map: texture});
    } 
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    spheres.push(sphere);
    return sphere;
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

function placeOBJ(objPath, mtlPath, x, y, z, scale, rotationX, rotationY, rotationZ){
    const mtlLoader = new MTLLoader(loadManager);
    const objLoader = new OBJLoader(loadManager);

    mtlLoader.load(mtlPath, (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
    });

    let object = new THREE.Group(); // Create an empty group to hold the object
    objLoader.load(objPath, (obj) => {
        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;
        obj.scale.x = scale;
        obj.scale.y = scale;
        obj.scale.z = scale;
        obj.rotation.x = rotationX;
        obj.rotation.y = rotationY;
        obj.rotation.z = rotationZ;
        object.add(obj); // Add the loaded object to the group
    });

    scene.add(object); // Add the group to the scene
    return object; // Return the group so it can be animated
}

function makeFishTank(){
    const aquariumTexture = loadTexture('texture', aquariumTexturePath);
    aquariumTexture.wrapS = THREE.RepeatWrapping;
    aquariumTexture.wrapT = THREE.RepeatWrapping;
    aquariumTexture.magFilter = THREE.NearestFilter;

    const geometry = new THREE.BoxGeometry(10, 5, 5);
    const material = new THREE.MeshBasicMaterial({map: aquariumTexture, side: THREE.DoubleSide});
    const water = new THREE.Mesh(geometry, material);
    water.scale.x = 1.45;
    water.position.x = 0;
    water.position.y = 5;
    water.position.z = -6.2;
    scene.add(water);

    const glassMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF, 
        opacity: 0.3, 
        transparent: true,
        specular: 0xFFFFFF,
        shininess: 100,
    });

    const glass = new THREE.Mesh(geometry, glassMaterial);
    glass.position.y = 5;
    glass.position.z = -5;
    glass.scale.x = 1.5;
    glass.scale.y = 1.5;
    glass.scale.z = 1.5;
    scene.add(glass);

    const aquariumBack = makeCube(geometry, 0xAAAAAA, 0, 4, -8.5);
    aquariumBack.scale.x = 1.5;
    aquariumBack.scale.y = 1.65;
    aquariumBack.scale.z = 0.05;
    aquariumBack.position.y = 5;
    aquariumBack.position.z = -8.8;

    const aquariumTop = makeCube(geometry, 0xAAAAAA, 0, 8.1, -5);
    aquariumTop.scale.x = 1.51;
    aquariumTop.scale.y = 0.4;
    aquariumTop.scale.z = 1.51;

    const aquariumBottom = makeCube(geometry, 0xAAAAAA, 0, 1.2, -5);
    aquariumBottom.scale.x = 1.51;
    aquariumBottom.scale.y = 0.5;
    aquariumBottom.scale.z = 1.51;
    aquariumBottom.position.y = 1.3;

    const aquariumLightColor = 0xFFFFFF;
    const aquariumLightIntensity = 0.5;
    const aquariumLight = new THREE.PointLight(aquariumLightColor, aquariumLightIntensity);
    aquariumLight.position.set(0, 5, -3);
    scene.add(aquariumLight);

    let fish = placeOBJ(fishOBJPath, fishMTLPath, 0, 5, -2.5, 0.055, Math.PI*1.5, 0, 0);
    fishes.push(fish);

    let fish2 = placeOBJ(fishOBJPath, fishMTLPath, 2, 5, -2, 0.05, Math.PI*1.5, 0, 0);
    fishes.push(fish2);

    let fish3 = placeOBJ(fishOBJPath, fishMTLPath, -2, 5, -2.2, 0.048, Math.PI*1.5, 0, 0);
    fishes.push(fish3);

    return;
}

function makeBubbles(sphereCount){
    const spheresGeo = new THREE.SphereGeometry(1, 32, 32);
    const globeTexture = loadTexture('texture', globeTexturePath);
    const globe = makeSphere(false, spheresGeo, globeTexture, 10, 3, 0);
    scene.add(globe);

    // make some random bubbles
    for (let i = 0; i < sphereCount; i++){
        const bubbleSize = Math.random() * 40 + 10; // random size for bubble variety
        const bubbleGeo = new THREE.SphereGeometry(1, bubbleSize, bubbleSize);
        let xOffset = Math.random() * 75;
        let yOffset = Math.random() * 10;
        let zOffset = Math.random() * 100;
        const bubbleMode = Math.random() < 0.85; // 15% chance of being a globe
        const bubble = makeSphere(bubbleMode, bubbleGeo, globeTexture, -25 + xOffset, 2+ yOffset, -50 + zOffset);
        scene.add(bubble);
    }
}

function makeWorld(){
    const skyboxTexture = loadTexture('cube', [skyboxTexturePath,skyboxTexturePath,skyboxTexturePath,skyboxTexturePath,skyboxTexturePath,skyboxTexturePath]);
    skyboxTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyboxTexture;

    // set up texture for the ground
    const groundTexture = loadTexture('texture' , topGrassTexturePath);
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

    makeBubbles(30);

}

function setupLights(){
    const directColor = 0xFFFFFF;
    const intensity = 1;
    const directLight = new THREE.DirectionalLight(directColor, intensity);
    directLight.position.set(-1, 10, 4);
    scene.add(directLight);

    const ambientColor = 0x94d2ff;
    const ambientLight = new THREE.AmbientLight(ambientColor, intensity-0.4);
    scene.add(ambientLight);
}

function main(){
    makeWorld();

    // add some cubes
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    cubes = [
        makeCube(geometry, 0x44aa88, 0, 15),
        makeCube(geometry, 0x8844aa, -2, 15),
        makeCube(geometry, 0xaa8844, 2, 15),
    ];

    setupLights();

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

main();