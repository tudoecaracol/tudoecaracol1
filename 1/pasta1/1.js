const audio = document.getElementById('audioPlayer');
const progressBar = document.getElementById('progressBar');
const status = document.getElementById('status');
const scaleValue = document.getElementById('scaleValue');
const canvas = document.getElementById('spiralCanvas');
const ctx = canvas.getContext('2d');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioSource = audioContext.createMediaElementSource(audio);
const analyser = audioContext.createAnalyser();

audioSource.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 512;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

let isAudioContextResumed = false;

let angle = 0;
let radius = 5;
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;

const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 10;
let currentRadius = radius;
let bolinhas = [];

let espiralColor = '#ff5733';
let frequencyRange = 500;
let spiralSpeed = 0.1;

function tocarMusica() {
    if (audioContext.state === 'suspended' && !isAudioContextResumed) {
        audioContext.resume().then(() => {
            isAudioContextResumed = true;
            audio.play();
            status.innerHTML = "Música tocando...";
            analisarRitmo();
        });
    } else {
        audio.play();
        status.innerHTML = "Música tocando...";
        analisarRitmo();
    }
}

function pausarMusica() {
    audio.pause();
    status.innerHTML = "Música pausada";
}

function analisarRitmo() {
    if (!audio.paused) {
        analyser.getByteFrequencyData(dataArray);

        let totalAmplitude = 0;
        for (let i = 0; i < bufferLength; i++) {
            if (i > frequencyRange) break;
            totalAmplitude += dataArray[i];
        }

        const averageAmplitude = totalAmplitude / bufferLength;
        let progress = (averageAmplitude / 255) * 100;
        progressBar.style.width = Math.min(progress, 100) + '%';

        const scale = Math.floor((averageAmplitude / 255) * 10);
        scaleValue.innerHTML = scale;

        atualizarEspiral(scale);

        requestAnimationFrame(analisarRitmo);
    }
}

function atualizarEspiral(intensidade) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < bolinhas.length; i++) {
        const bolinha = bolinhas[i];

        const perspectiva = 1 / (1 + bolinha.z * 0.01);
        const tamanhoBolinha = 5 * perspectiva;

        ctx.beginPath();
        ctx.arc(bolinha.x, bolinha.y, tamanhoBolinha, 0, 2 * Math.PI);
        ctx.fillStyle = espiralColor;
        ctx.fill();
    }

    for (let i = 0; i < intensidade; i++) {
        angle += spiralSpeed;
        currentRadius += 0.5;

        if (currentRadius > maxRadius) {
            currentRadius = 5;
        }

        const x = centerX + currentRadius * Math.cos(angle);
        const y = centerY + currentRadius * Math.sin(angle);
        const z = currentRadius;

        bolinhas.push({ x, y, z });

        if (bolinhas.length > 500) {
            bolinhas.shift();
        }
    }
}

document.getElementById('colorPicker').addEventListener('input', (event) => {
    espiralColor = event.target.value;
});

document.getElementById('frequencyRange').addEventListener('input', (event) => {
    frequencyRange = event.target.value;
});

document.getElementById('spiralSpeed').addEventListener('input', (event) => {
    spiralSpeed = parseFloat(event.target.value);
});
