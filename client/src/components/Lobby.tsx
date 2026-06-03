import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import './Lobby.css';

export const Lobby: React.FC = () => {
    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
    const { joinGame, rooms } = useGame();

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && roomId.trim()) {
            joinGame(name, roomId);
        }
    };

    return (
        <div className="lobby-container">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="lobby-card"
            >
                <div className="lobby-logo">
                    <div className="lobby-logo-text">
                        <span className="logo-mono">MONO</span>
                        <span className="logo-live">LIVE</span>
                    </div>
                </div>

                <p className="lobby-subtitle">Enter your name and room to join</p>

                <form onSubmit={handleJoin} className="lobby-form">
                    <div className="input-group">
                        <span className="input-icon">👤</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className="lobby-input"
                            autoFocus
                        />
                    </div>
                    <div className="input-group">
                        <span className="input-icon">🎮</span>
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="Room ID"
                            className="lobby-input"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className="lobby-button"
                        disabled={!name.trim() || !roomId.trim()}
                    >
                        Join Game →
                    </motion.button>
                </form>

                {rooms.length > 0 && (
                    <div className="active-rooms">
                        <div className="active-rooms-title">Active Rooms</div>
                        <div className="rooms-grid">
                            {rooms.map(r => (
                                <motion.button
                                    key={r}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setRoomId(r)}
                                    className="room-chip"
                                >
                                    {r}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
