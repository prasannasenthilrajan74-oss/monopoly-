"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const GameManager_1 = require("./game/GameManager");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: 'http://localhost:5173' }));
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    },
});
const MAX_ROOMS = 25;
const rooms = new Map();
// Map to track which room a socket belongs to
const socketRooms = new Map();
const broadcastRoomList = () => {
    const roomList = Array.from(rooms.keys());
    io.emit('room_list', roomList);
};
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    // Send active rooms to new user
    socket.emit('room_list', Array.from(rooms.keys()));
    socket.on('join_game', ({ name, roomId }) => {
        if (!name || !roomId)
            return;
        let gameManager = rooms.get(roomId);
        let isNewRoom = false;
        if (!gameManager) {
            if (rooms.size >= MAX_ROOMS) {
                socket.emit('error', 'Server is full (Max 25 rooms)');
                return;
            }
            console.log(`Creating new room: ${roomId}`);
            gameManager = new GameManager_1.GameManager((state) => {
                io.to(roomId).emit('game_state', state);
            });
            rooms.set(roomId, gameManager);
            isNewRoom = true;
        }
        socket.join(roomId);
        socketRooms.set(socket.id, roomId);
        const player = gameManager.addPlayer(socket.id, name);
        // Send initial state to THIS socket immediately
        socket.emit('game_state', gameManager.getGameState());
        // Broadcast to room
        io.to(roomId).emit('game_state', gameManager.getGameState());
        if (isNewRoom) {
            broadcastRoomList();
        }
    });
    socket.on('start_game', () => {
        const roomId = socketRooms.get(socket.id);
        const game = roomId ? rooms.get(roomId) : undefined;
        if (game) {
            game.startGame();
            io.to(roomId).emit('game_state', game.getGameState());
        }
    });
    socket.on('roll_dice', () => {
        const roomId = socketRooms.get(socket.id);
        const game = roomId ? rooms.get(roomId) : undefined;
        if (game) {
            game.rollDice(socket.id);
            io.to(roomId).emit('game_state', game.getGameState());
        }
    });
    socket.on('buy_property', (propertyId) => {
        const roomId = socketRooms.get(socket.id);
        const game = roomId ? rooms.get(roomId) : undefined;
        if (game) {
            game.buyProperty(socket.id, propertyId);
            io.to(roomId).emit('game_state', game.getGameState());
        }
    });
    socket.on('buy_house', (propertyId) => {
        const roomId = socketRooms.get(socket.id);
        const game = roomId ? rooms.get(roomId) : undefined;
        if (game) {
            game.buyHouse(socket.id, propertyId);
            io.to(roomId).emit('game_state', game.getGameState());
        }
    });
    socket.on('pay_jail_fine', () => {
        const roomId = socketRooms.get(socket.id);
        const game = roomId ? rooms.get(roomId) : undefined;
        if (game) {
            game.payJailFine(socket.id);
            io.to(roomId).emit('game_state', game.getGameState());
        }
    });
    socket.on('end_turn', () => {
        const roomId = socketRooms.get(socket.id);
        const game = roomId ? rooms.get(roomId) : undefined;
        if (game) {
            game.endTurn(socket.id);
            io.to(roomId).emit('game_state', game.getGameState());
        }
    });
    socket.on('disconnect', () => {
        const roomId = socketRooms.get(socket.id);
        if (roomId) {
            const game = rooms.get(roomId);
            if (game) {
                game.removePlayer(socket.id);
                io.to(roomId).emit('game_state', game.getGameState());
                // Optional: cleanup empty rooms
                // if (game.getGameState().players.length === 0) {
                //    rooms.delete(roomId);
                // }
            }
            socketRooms.delete(socket.id);
        }
        console.log('User disconnected:', socket.id);
    });
});
const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
