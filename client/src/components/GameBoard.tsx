import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { BOARD } from '../data/board';
import { motion, AnimatePresence } from 'framer-motion';
import './GameBoard.css';

export const GameBoard: React.FC = () => {
    const { gameState, rollDice, endTurn, buyProperty, buyHouse, payJailFine, playerId, startGame } = useGame();

    const [timer, setTimer] = useState(0);
    const [chatMessage, setChatMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<{ id: number; sender: string; text: string; color: string }[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        const myPlayer = gameState?.players.find(p => p.id === playerId);
        setChatMessages(prev => [...prev, {
            id: Date.now(),
            sender: myPlayer?.name || 'You',
            text: chatMessage,
            color: myPlayer?.color || '#60a5fa'
        }]);
        setChatMessage('');
    };

    const getPositionStyle = (index: number) => {
        let row = 1;
        let col = 1;

        if (index >= 0 && index <= 10) {
            row = 11;
            col = 11 - index;
        } else if (index >= 11 && index <= 19) {
            col = 1;
            row = 11 - (index - 10);
        } else if (index >= 20 && index <= 30) {
            row = 1;
            col = index - 19;
        } else if (index >= 31 && index <= 39) {
            col = 11;
            row = index - 29;
        }

        return { gridRow: row, gridColumn: col };
    };

    const getSpaceClass = (index: number) => {
        let classes = 'board-space';

        if (index > 0 && index < 10) classes += ' bottom';
        else if (index > 10 && index < 20) classes += ' left';
        else if (index > 20 && index < 30) classes += ' top';
        else if (index > 30 && index < 40) classes += ' right';
        else classes += ' corner';

        return classes;
    };

    const isMyTurn = gameState?.players[gameState.currentPlayerIndex]?.id === playerId;
    const myPlayer = gameState?.players.find(p => p.id === playerId);
    const currentSpace = myPlayer ? BOARD[myPlayer.position] : null;
    const isOwned = currentSpace && gameState?.propertyOwners[currentSpace.id];
    const canBuy = isMyTurn && gameState?.currentTurnPhase === 'acting' && currentSpace && !isOwned &&
        (currentSpace.type === 'property' || currentSpace.type === 'railroad' || currentSpace.type === 'utility') &&
        (currentSpace.price || 0) <= (myPlayer?.money || 0);

    const timeLeft = gameState?.turnTimerStart
        ? Math.max(0, Math.floor(15 - (Date.now() - gameState.turnTimerStart) / 1000))
        : 15;

    const getRoomId = () => {
        if (gameState?.players && gameState.players.length > 0) {
            return 'room-' + (gameState.players[0].id?.substring(0, 5) || 'xxxx');
        }
        return 'room-xxxx';
    };

    const currentPlayer = gameState?.players[gameState?.currentPlayerIndex];

    return (
        <div className="richup-layout">
            {/* LEFT SIDEBAR */}
            <aside className="left-sidebar">
                <div className="sidebar-logo">
                    <span className="logo-rich">MONO</span>
                    <span className="logo-up">LIVE</span>
                </div>

                <div className="share-section">
                    <div className="share-label">Share this game <span className="info-icon">ⓘ</span></div>
                    <div className="share-link-row">
                        <div className="share-link-box">
                            <span className="share-link-text">localhost/room/{getRoomId()}</span>
                        </div>
                        <button className="copy-btn">📋 Copy</button>
                    </div>
                </div>

                <div className="ad-placeholder">
                    <div className="ad-label">advertisement</div>
                </div>

                <div className="chat-section">
                    <div className="chat-header">
                        <span className="chat-icon">💬</span>
                        <span>Chat</span>
                    </div>
                    <div className="chat-messages">
                        {chatMessages.length === 0 ? (
                            <div className="no-messages">No messages yet</div>
                        ) : (
                            chatMessages.map(msg => (
                                <div key={msg.id} className="chat-msg">
                                    <span className="chat-sender" style={{ color: msg.color }}>{msg.sender}: </span>
                                    <span className="chat-text">{msg.text}</span>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <form className="chat-input-row" onSubmit={handleSendChat}>
                        <input
                            className="chat-input"
                            placeholder="Say something..."
                            value={chatMessage}
                            onChange={e => setChatMessage(e.target.value)}
                        />
                        <button type="submit" className="chat-send-btn">➤</button>
                    </form>
                </div>
            </aside>

            {/* CENTER - BOARD */}
            <main className="board-main">
                <div className="board-wrapper">
                    <div className="monopoly-board">
                        <div className="center-area">
                            <div className="center-inner">
                                {/* Dice — always visible */}
                                <div className="dice-display">
                                    {[gameState?.dice?.[0] ?? 1, gameState?.dice?.[1] ?? 1].map((val, i) => (
                                        <motion.div
                                            key={i}
                                            className={`die-3d ${!gameState?.dice ? 'die-idle' : ''}`}
                                            animate={gameState?.dice ? {
                                                rotateY: [0, 360],
                                                rotateX: [0, 360]
                                            } : {
                                                rotateY: [0, 5, -5, 0],
                                                rotateX: [0, 3, -3, 0]
                                            }}
                                            transition={gameState?.dice ? {
                                                duration: 0.4,
                                                ease: 'easeOut'
                                            } : {
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: 'easeInOut'
                                            }}
                                        >
                                            <DiceFace value={val} />
                                        </motion.div>
                                    ))}
                                </div>

                                {gameState?.gameStatus === 'waiting' && (
                                    <div className="waiting-state">
                                        <div className="waiting-label">Waiting for players...</div>
                                        {gameState.players.length >= 2 && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="start-game-btn"
                                                onClick={startGame}
                                            >
                                                ▶ Start Game
                                            </motion.button>
                                        )}
                                        <div className="joined-label">
                                            {gameState.players.length} player{gameState.players.length !== 1 ? 's' : ''} joined
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'none' }}>{timer}</div>

                                {gameState?.gameStatus === 'active' && (
                                    <>

                                        {/* Current action button */}
                                        <div className="action-zone">
                                            {isMyTurn && gameState.currentTurnPhase === 'rolling' && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(96, 165, 250, 0.5)' }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="roll-btn"
                                                    onClick={rollDice}
                                                >
                                                    🎲 Roll Dice
                                                </motion.button>
                                            )}

                                            {isMyTurn && gameState.currentTurnPhase === 'jail_decision' && (
                                                <div className="jail-actions">
                                                    <div className="jail-msg">🔒 You are in Jail!</div>
                                                    <button className="roll-btn" onClick={rollDice}>Roll Doubles</button>
                                                    <button className="end-turn-btn" onClick={payJailFine}>Pay $50 Fine</button>
                                                </div>
                                            )}

                                            {canBuy && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="buy-btn"
                                                    onClick={() => currentSpace && buyProperty(currentSpace.id)}
                                                >
                                                    🏠 Buy {currentSpace?.name} (${currentSpace?.price})
                                                </motion.button>
                                            )}

                                            {isMyTurn && gameState.currentTurnPhase === 'acting' && (
                                                <div className="acting-zone">
                                                    <div className="timer-ring">
                                                        <svg viewBox="0 0 36 36" className="timer-svg">
                                                            <path
                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                fill="none"
                                                                stroke="#334155"
                                                                strokeWidth="2"
                                                            />
                                                            <path
                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                fill="none"
                                                                stroke={timeLeft <= 5 ? '#ef4444' : '#f59e0b'}
                                                                strokeWidth="2"
                                                                strokeDasharray={`${(timeLeft / 15) * 100}, 100`}
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        <span className="timer-text">{timeLeft}s</span>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="end-turn-btn"
                                                        onClick={endTurn}
                                                    >
                                                        End Turn →
                                                    </motion.button>
                                                    {gameState.players[gameState.currentPlayerIndex].properties.slice(0, 2).map(propName => {
                                                        const pSpace = BOARD.find(s => s.name === propName);
                                                        if (!pSpace || !pSpace.houseCost) return null;
                                                        return (
                                                            <button key={pSpace.id} className="house-btn" onClick={() => buyHouse(pSpace.id)}>
                                                                🏠 {pSpace.name.substring(0, 8)}.. (${pSpace.houseCost})
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {!isMyTurn && (
                                                <div className="not-my-turn">
                                                    <div className="turn-indicator">
                                                        <div className="turn-dot" style={{ background: currentPlayer?.color || '#60a5fa' }}></div>
                                                        <span>{currentPlayer?.name}'s turn</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Last action */}
                                        {gameState.lastAction && (
                                            <AnimatePresence>
                                                <motion.div
                                                    key={gameState.lastAction}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="last-action-pill"
                                                >
                                                    {gameState.lastAction}
                                                </motion.div>
                                            </AnimatePresence>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {BOARD.map((space, index) => (
                            <div
                                key={space.id}
                                className={getSpaceClass(index)}
                                style={getPositionStyle(index)}
                            >
                                {space.type === 'property' && (
                                    <div className={`color-bar ${space.group}`}>
                                        {gameState?.propertyOwners[space.id] && (
                                            <div
                                                className="owner-indicator"
                                                style={{ borderColor: gameState.players.find(p => p.id === gameState.propertyOwners[space.id])?.color }}
                                            />
                                        )}
                                        {gameState?.buildings[space.id] ? (
                                            <div className="building-indicator">
                                                {Array(gameState.buildings[space.id]).fill(0).map((_, i) => (
                                                    <span key={i} className="house-dot" />
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                                <div className="space-name">{space.name}</div>
                                {space.price && <div className="space-price">${space.price}</div>}

                                <div className="players-container">
                                    {gameState?.players.filter(p => p.position === space.id).map(player => (
                                        <motion.div
                                            layoutId={`player-${player.id}`}
                                            key={player.id}
                                            className="player-token"
                                            style={{ backgroundColor: player.color }}
                                            title={player.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="right-sidebar">
                {/* My player info */}
                <div className="my-player-header">
                    <div className="my-avatar" style={{ background: myPlayer?.color || '#60a5fa' }}>
                        {(myPlayer?.name || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div className="my-player-info">
                        <div className="my-player-name">{myPlayer?.name || 'You'} 👑</div>
                        <div className="my-player-money">${myPlayer?.money?.toLocaleString() || 0}</div>
                    </div>
                </div>

                {/* Players list */}
                <div className="players-panel">
                    <div className="panel-title">Players</div>
                    <div className="player-list">
                        {gameState?.players.map(player => (
                            <motion.div
                                key={player.id}
                                className={`player-card-rich ${gameState.players[gameState.currentPlayerIndex]?.id === player.id ? 'active' : ''}`}
                                layout
                            >
                                <div className="pc-avatar" style={{ background: player.color }}>
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="pc-info">
                                    <div className="pc-name">
                                        {player.name}
                                        {player.id === playerId ? <span className="you-tag">YOU</span> : null}
                                    </div>
                                    <div className="pc-money">${player.money?.toLocaleString()}</div>
                                </div>
                                {gameState.players[gameState.currentPlayerIndex]?.id === player.id && (
                                    <div className="turn-arrow">▶</div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Game settings */}
                <div className="settings-panel">
                    <div className="settings-title">⚙ Game Settings</div>
                    <div className="setting-row">
                        <div className="setting-icon">👥</div>
                        <div className="setting-label">
                            <div className="setting-name">Maximum players</div>
                            <div className="setting-desc">How many players can join</div>
                        </div>
                        <div className="setting-value">4</div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-icon">🔒</div>
                        <div className="setting-label">
                            <div className="setting-name">Private room</div>
                            <div className="setting-desc">Accessible via URL only</div>
                        </div>
                        <div className="toggle-switch active"></div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-icon">🤖</div>
                        <div className="setting-label">
                            <div className="setting-name">Allow bots <span className="beta-tag">Beta</span></div>
                            <div className="setting-desc">Bots will join based on availability</div>
                        </div>
                        <div className="toggle-switch"></div>
                    </div>

                    <div className="rules-title">📋 Gameplay Rules</div>
                    <div className="setting-row">
                        <div className="setting-icon">💰</div>
                        <div className="setting-label">
                            <div className="setting-name">x2 rent on full-set</div>
                            <div className="setting-desc">Base rent doubled if player owns all</div>
                        </div>
                        <div className="toggle-switch active"></div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-icon">🏖</div>
                        <div className="setting-label">
                            <div className="setting-name">Vacation cash</div>
                            <div className="setting-desc">Collect taxes when on vacation</div>
                        </div>
                        <div className="toggle-switch"></div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-icon">🔨</div>
                        <div className="setting-label">
                            <div className="setting-name">Auction</div>
                            <div className="setting-desc">Unsold properties go to auction</div>
                        </div>
                        <div className="toggle-switch"></div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

// Dice face component with dots — grid based for reliability
const DiceFace: React.FC<{ value: number }> = ({ value }) => {
    const v = Math.max(1, Math.min(6, value || 1));

    // Each value maps to a grid pattern (3x3 grid cells, 1=dot, 0=empty)
    // Rows: top, mid, bottom — Cols: left, center, right
    const grids: Record<number, boolean[][]> = {
        1: [
            [false, false, false],
            [false, true, false],
            [false, false, false],
        ],
        2: [
            [true, false, false],
            [false, false, false],
            [false, false, true],
        ],
        3: [
            [true, false, false],
            [false, true, false],
            [false, false, true],
        ],
        4: [
            [true, false, true],
            [false, false, false],
            [true, false, true],
        ],
        5: [
            [true, false, true],
            [false, true, false],
            [true, false, true],
        ],
        6: [
            [true, false, true],
            [true, false, true],
            [true, false, true],
        ],
    };

    const grid = grids[v];

    return (
        <div className="dice-face">
            {grid.map((row, ri) =>
                row.map((hasDot, ci) => (
                    <div
                        key={`${ri}-${ci}`}
                        className={`dot-cell${hasDot ? ' dot-filled' : ''}`}
                    />
                ))
            )}
        </div>
    );
};
