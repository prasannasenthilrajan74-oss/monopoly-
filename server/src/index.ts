import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameManager } from './game/GameManager';

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    },
});

const MAX_ROOMS = 25;
const rooms = new Map<string, GameManager>();
// Map to track which room a socket belongs to
const socketRooms = new Map<string, string>();

const broadcastRoomList = () => {
    const roomList = Array.from(rooms.keys());
    io.emit('room_list', roomList);
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send active rooms to new user
    socket.emit('room_list', Array.from(rooms.keys()));

    socket.on('join_game', ({ name, roomId }: { name: string, roomId: string }) => {
        if (!name || !roomId) return;

        let gameManager = rooms.get(roomId);
        let isNewRoom = false;

        if (!gameManager) {
            if (rooms.size >= MAX_ROOMS) {
                socket.emit('error', 'Server is full (Max 25 rooms)');
                return;
            }
            console.log(`Creating new room: ${roomId}`);
            gameManager = new GameManager((state) => {
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
            io.to(roomId!).emit('game_state', game.getGameState());
        }
    });

    socket.on('roll_dice', () => {
        const roomId = socketRooms.get(socket.id);
        const game = roomId ? rooms.get(roomId) : undefined;
        if (game) {
            game.rollDice(socket.id);
            io.to(roomId!).emit('game_state', game.getGameState());
        }
    });

    socket.on('buy_property', (propertyId: number) => {
        const roomId = socketRooms.get(socket.id);
        const game = roomId ? rooms.get(roomId) : undefined;
        if (game) {
            game.buyProperty(socket.id, propertyId);
            io.to(roomId!).emit('game_state', game.getGameState());
        }
    });

    socket.on('buy_house', (propertyId: number) => {
        const roomId = socketRooms.get(socket.id);
        const game = roomId ? rooms.get(roomId) : undefined;
        if (game) {
            game.buyHouse(socket.id, propertyId);
            io.to(roomId!).emit('game_state', game.getGameState());
        }
    });

    socket.on('pay_jail_fine', () => {
        const roomId = socketRooms.get(socket.id);
        const game = roomId ? rooms.get(roomId) : undefined;
        if (game) {
            game.payJailFine(socket.id);
            io.to(roomId!).emit('game_state', game.getGameState());
        }
    });

    socket.on('end_turn', () => {
        const roomId = socketRooms.get(socket.id);
        const game = roomId ? rooms.get(roomId) : undefined;
        if (game) {
            game.endTurn(socket.id);
            io.to(roomId!).emit('game_state', game.getGameState());
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
