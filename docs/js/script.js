(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

var vid = document.getElementById('videoel');
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

var ctrack = new clm.tracker({ useWebGL: true });
ctrack.init(pModel);

var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.getElementById('container').appendChild(stats.domElement);

function enablestart() {
    // start video
    vid.play();
    // start tracking
    ctrack.start(vid);
    // start loop to draw face
    drawLoop();
}

// check for camerasupport
if (navigator.getUserMedia) {
    // set up stream

    var videoSelector = {
        video: true
    };
    if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
        var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
        if (chromeVersion < 20) {
            videoSelector = "video";
        }
    };

    navigator.getUserMedia(videoSelector, function (stream) {
        if (vid.mozCaptureStream) {
            vid.mozSrcObject = stream;
        } else {
            vid.src = window.URL && window.URL.createObjectURL(stream) || stream;
        }
        vid.play();
    }, function () {
        alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
    });
} else {
    alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
}

vid.addEventListener('canplay', enablestart, false);

function drawLoop() {
    requestAnimFrame(drawLoop);
    overlayCC.clearRect(0, 0, 400, 300);
    //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
    if (ctrack.getCurrentPosition()) {
        var x = ctrack.getCurrentPosition()[33][0];
        var y = ctrack.getCurrentPosition()[33][1];
        var p1 = ctrack.getCurrentPosition()[0];
        var p2 = ctrack.getCurrentPosition()[14];
        var w = distance(p1, p2);
        setPosition(x, y, w);
    } else {
        console.log("not detected");
    }
}

document.addEventListener('clmtrackrIteration', function (event) {}, false);

document.addEventListener("clmtrackrConverged", function () {}, false);
document.addEventListener("clmtrackrNotFound", function () {}, false);

function distance(p1, p2) {
    var x = p1[0] - p2[0];
    var y = p1[1] - p2[1];
    if (x == 0) {
        return Math.abs(y);
    } else if (y == 0) {
        return Math.abs(x);
    } else {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }
};

var width = 900;
var height = 680;

var faceBaseSize = 130;
function setPosition(x, y, w) {
    overlayCC.fillStyle = 'rgb(155, 187, 89)';
    overlayCC.fillRect(x - w / 2, y, w, 2);

    console.log("x: " + x + " y: " + y + " face: " + w / faceBaseSize);
    cx = -2 * x / width + 1;
    cy = 2 * y / height - 1;
    cz = faceBaseSize / w;
}

var cx = 50;
var cy = 50;
var cz = 50;
var fov = 60;
var aspect = width / height;
var near = 1;
var far = 1000;
var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

var Params = function Params() {
    this.dat_mesh_z = -0.1;
    this.dat_mesh_x = 40;
    this.dat_mesh_y = -1.2;
    this.dat_camera_y = -45;
};
var params = new Params();
var gui = new dat.GUI();

window.onload = function () {
    gui.add(params, 'dat_mesh_z', -1, 2);
    gui.add(params, 'dat_mesh_x', 0, 200);
    gui.add(params, 'dat_mesh_y', -3, 5);
    gui.add(params, 'dat_camera_y', -200, 200);
};

var main = function main() {
    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    $("#renderer").append(renderer.domElement);

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0.7, 0.7);
    scene.add(directionalLight);

    var geometry = new THREE.CubeGeometry(30, 30, 30);
    var material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.set(0, 45, 5);
    scene.add(mesh);
    camera.position.set(0, 0, 150);

    (function renderLoop() {
        requestAnimationFrame(renderLoop);
        console.log(cx, cy);
        console.log("aaa: " + params.dat_mesh_z);
        mesh.rotation.set(cy * params.dat_mesh_y, -45 * cx / params.dat_mesh_x, params.dat_mesh_z);
        camera.position.set(0, cy * params.dat_camera_y, 150);
        renderer.render(scene, camera);
        stats.update();
    })();
};

window.addEventListener('DOMContentLoaded', main, false);

},{}]},{},[1]);
