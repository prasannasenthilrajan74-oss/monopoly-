import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState } from '../types';

interface GameContextType {
    socket: Socket | null;
    gameState: GameState | null;
    rooms: string[];
    isConnected: boolean;
    joinGame: (name: string, roomId: string) => void;
    startGame: () => void;
    rollDice: () => void;
    endTurn: () => void;
    buyProperty: (propertyId: number) => void;
    buyHouse: (propertyId: number) => void;
    payJailFine: () => void;
    playerId: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const SOCKET_URL = 'http://localhost:3000';

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [rooms, setRooms] = useState<string[]>([]);
    const [playerId, setPlayerId] = useState<string>('');

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            setPlayerId(newSocket.id || '');
        });

        newSocket.on('disconnect', () => setIsConnected(false));

        newSocket.on('game_state', (state: GameState) => {
            setGameState(state);
        });

        newSocket.on('room_list', (activeRooms: string[]) => {
            setRooms(activeRooms);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const joinGame = (name: string, roomId: string) => {
        if (!name || !roomId) return;
        socket?.emit('join_game', { name, roomId });
    };

    const startGame = () => {
        socket?.emit('start_game');
    };

    const rollDice = () => {
        socket?.emit('roll_dice');
    };

    const endTurn = () => {
        socket?.emit('end_turn');
    };

    const buyProperty = (propertyId: number) => {
        socket?.emit('buy_property', propertyId);
    };

    const buyHouse = (propertyId: number) => {
        socket?.emit('buy_house', propertyId);
    };

    const payJailFine = () => {
        socket?.emit('pay_jail_fine');
    };

    return (
        <GameContext.Provider
            value={{
                socket,
                gameState,
                rooms,
                isConnected,
                joinGame,
                startGame,
                rollDice,
                endTurn,
                buyProperty,
                buyHouse,
                payJailFine,
                playerId,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
