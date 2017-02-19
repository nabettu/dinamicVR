navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

var vid = document.getElementById('videoel');
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

var ctrack = new clm.tracker({useWebGL: true});
ctrack.init(pModel);

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

    navigator.getUserMedia(videoSelector, function(stream) {
        if (vid.mozCaptureStream) {
            vid.mozSrcObject = stream;
        } else {
            vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
        }
        vid.play();
    }, function() {
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
        const x = ctrack.getCurrentPosition()[33][0];
        const y = ctrack.getCurrentPosition()[33][1];
        const p1 = ctrack.getCurrentPosition()[0];
        const p2 = ctrack.getCurrentPosition()[14];
        const w = distance(p1, p2);
        setPosition(x, y, w);
    } else {
        console.log("not detected");
    }
}

document.addEventListener('clmtrackrIteration', function(event) {}, false);

document.addEventListener("clmtrackrConverged", () => {}, false);
document.addEventListener("clmtrackrNotFound", () => {}, false);

function distance(p1, p2) {
    const x = p1[0] - p2[0];
    const y = p1[1] - p2[1];
    if (x == 0) {
        return Math.abs(y);
    } else if (y == 0) {
        return Math.abs(x);
    } else {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }
};

var width = 600;
var height = 400;

const faceBaseSize = 130;
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

var main = function() {
    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    $("#renderer").append(renderer.domElement);

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0.7, 0.7);
    scene.add(directionalLight);

    var geometry = new THREE.CubeGeometry(30, 30, 30);
    var material = new THREE.MeshPhongMaterial({color: 0xff0000});
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    (function renderLoop() {
        requestAnimationFrame(renderLoop);
        // console.log(cx, cy);
        mesh.rotation.set(0, mesh.rotation.y + .01, mesh.rotation.z + .01);
        camera.position.set(cx * width / 20, -1 * cy * height / 20, 30 * cz + 150);
        renderer.render(scene, camera);
    })();
};

window.addEventListener('DOMContentLoaded', main, false);
