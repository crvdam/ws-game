import { WebSocketServer } from 'ws';

const server = new WebSocketServer({
    port: 8081,
});

const players = new Map();

server.on('connection', (socket) => {
    players.set(socket, {
        id: crypto.randomUUID(),
        x: 100,
        y: 85,
        angle: 0,
        keys: new Set(),
    });

    socket.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'keydown') players.get(socket).keys.add(data.key);
            if (data.type === 'keyup')
                players.get(socket).keys.delete(data.key);
        } catch (error) {
            console.error(error);
            return;
        }
    });

    // socket.on('message', (message) => {
    //     const text = message.toString();

    //     players.forEach((client) => {
    //         if (client !== socket && client.readyState === WebSocket.OPEN) {
    //             client.send(text);
    //         }
    //     });
    //     console.log(`Received: ${text}`);
    //     socket.send(text);
    // });

    socket.on('close', () => {
        players.delete(socket);
    });

    socket.on('error', (error) => {
        console.error(`Socket error: ${error.message}`);
    });
});

console.log('WebSocket server is running on ws://localhost:8081');

const TICK_RATE = 60;
const PLAYER_SPEED = 8;
const TURN_SPEED = 0.1;
const CANVAS_HEIGHT = 640;
const CANVAS_WIDTH = 640;
const PLAYER_WIDTH = 45;
const PLAYER_HEIGHT = 30;

setInterval(() => {
    let dirty = false;

    players.forEach((player) => {
        const prevX = player.x;
        const prevY = player.y;
        const prevAngle = player.angle;

        let xDirection = 0;
        let yDirection = 0;

        if (player.keys.has('ArrowLeft')) player.angle -= TURN_SPEED;
        if (player.keys.has('ArrowRight')) player.angle += TURN_SPEED;
        if (player.keys.has('ArrowUp')) {
            player.x += Math.cos(player.angle) * PLAYER_SPEED;
            player.y += Math.sin(player.angle) * PLAYER_SPEED;
        }
        if (player.keys.has('ArrowDown')) {
            player.x -= Math.cos(player.angle) * PLAYER_SPEED;
            player.y -= Math.sin(player.angle) * PLAYER_SPEED;
        }

        player.x = Math.max(
            PLAYER_WIDTH / 2,
            Math.min(CANVAS_WIDTH - PLAYER_WIDTH / 2, player.x),
        );
        player.y = Math.max(
            PLAYER_HEIGHT / 2,
            Math.min(CANVAS_HEIGHT - PLAYER_HEIGHT / 2, player.y),
        );

        if (
            player.x !== prevX ||
            player.y !== prevY ||
            player.angle !== prevAngle
        )
            dirty = true;
    });

    if (dirty === true) {
        // Convert Map to Object and remove keys Set to allow for serialization
        const state = [...players.values()].map(({ id, x, y, angle }) => ({
            id,
            x,
            y,
            angle,
        }));
        const message = JSON.stringify({ type: 'state', state });

        players.forEach((player, socket) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(message);
            }
        });
    }

    dirty = false;
}, 1000 / TICK_RATE);
