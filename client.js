let gameState = [];
let ws;

function connect() {
    ws = new WebSocket('ws://localhost:8081');

    ws.onopen = () => {
        console.log('Connected to server');
    };

    ws.onclose = () => {
        console.log('Disconnected. Reconnecting...');
        setTimeout(connect, 1000);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        gameState = data.state;
    };
}
connect();

document.getElementById('send').addEventListener('click', () => {
    const input = document.getElementById('message');
    ws.send(input.value);
    input.value = '';
});

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 640;
const PLAYER_WIDTH = 45;
const PLAYER_HEIGHT = 30;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    if (!ctx) return;

    const drawPlayer = (x, y, angle) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = 'salmon';
        ctx.fillRect(
            -PLAYER_WIDTH / 2,
            -PLAYER_HEIGHT / 2,
            PLAYER_WIDTH,
            PLAYER_HEIGHT,
        );
        ctx.restore();
    };

    const loop = () => {
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (gameState.length === 0) {
            requestAnimationFrame(loop);
            return;
        }
        gameState.forEach((player) => {
            drawPlayer(player.x, player.y, player.angle);
        });

        requestAnimationFrame(loop);
    };
    loop();
});

const player = document.getElementById('player');

// const keys = new Set();

window.addEventListener('keydown', (event) => {
    // keys.add(event.key);
    ws.send(JSON.stringify({ type: 'keydown', key: event.key }));
});

window.addEventListener('keyup', (event) => {
    // keys.delete(event.key);
    ws.send(JSON.stringify({ type: 'keyup', key: event.key }));
});

function updatePosition() {
    // xDirection = 0;
    // yDirection = 0;
    // if (keys.has('ArrowLeft')) xDirection -= speed;
    // if (keys.has('ArrowRight')) xDirection += speed;
    // if (keys.has('ArrowUp')) yDirection -= speed;
    // if (keys.has('ArrowDown')) yDirection += speed;
    // xPosition = Math.max(
    //     radius,
    //     Math.min(canvas.width - radius, xPosition + xDirection),
    // );
    // yPosition = Math.max(
    //     radius,
    //     Math.min(canvas.height - radius, yPosition + yDirection),
    // );
}
