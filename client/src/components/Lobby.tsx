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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lobby-card"
            >
                <h1 className="lobby-title">Monopoly Live</h1>
                <p className="lobby-subtitle">Enter your name and room to join</p>

                <form onSubmit={handleJoin} className="lobby-form">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="lobby-input"
                        autoFocus
                    />
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Room ID"
                        className="lobby-input"
                        style={{ marginTop: '10px' }}
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="lobby-button"
                        disabled={!name.trim() || !roomId.trim()}
                    >
                        Join Game
                    </motion.button>
                </form>

                {rooms.length > 0 && (
                    <div style={{ marginTop: '20px', textAlign: 'left' }}>
                        <h3>Active Rooms:</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {rooms.map(r => (
                                <span
                                    key={r}
                                    onClick={() => setRoomId(r)}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(255,255,255,0.2)'
                                    }}
                                >
                                    {r}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
