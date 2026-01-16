import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { BOARD } from '../data/board';
import { motion } from 'framer-motion';
import './GameBoard.css';

export const GameBoard: React.FC = () => {
    const { gameState, rollDice, endTurn, buyProperty, buyHouse, payJailFine, playerId } = useGame();

    const [timer, setTimer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(t => t + 1); // just trigger render
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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

        // Orientation
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
    const canBuy = isMyTurn && gameState?.currentTurnPhase === 'acting' && currentSpace && !isOwned && (currentSpace.type === 'property' || currentSpace.type === 'railroad' || currentSpace.type === 'utility') && (currentSpace.price || 0) <= (myPlayer?.money || 0);

    return (
        <div className="game-container">
            <div className="board-wrapper">
                <div className="monopoly-board">
                    <div className="center-area">
                        <h1 className="board-logo">MONOPOLY</h1>
                        {gameState?.lastAction && (
                            <div className="last-action">{gameState.lastAction}</div>
                        )}
                        {gameState?.gameStatus === 'waiting' && (
                            <div className="waiting-message">
                                <div>Waiting for players...</div>
                                {gameState.players.length >= 2 && (
                                    <button className="action-button start-button" onClick={useGame().startGame} style={{ marginTop: '10px', backgroundColor: '#4CAF50' }}>
                                        Start Game
                                    </button>
                                )}
                            </div>
                        )}
                        {gameState?.dice && (
                            <div className="dice-display">
                                <div className="die">{gameState.dice[0]}</div>
                                <div className="die">{gameState.dice[1]}</div>
                            </div>
                        )}

                        {isMyTurn && gameState?.currentTurnPhase === 'rolling' && (
                            <button className="action-button" onClick={rollDice}>Roll Dice</button>
                        )}

                        {isMyTurn && gameState?.currentTurnPhase === 'jail_decision' && (
                            <div className="jail-actions">
                                <div className="jail-message">You are in Jail!</div>
                                <button className="action-button" onClick={rollDice}>Roll Doubles</button>
                                <button className="action-button end-turn" onClick={payJailFine}>Pay $50 Fine</button>
                            </div>
                        )}

                        {canBuy && (
                            <button className="action-button buy-button" onClick={() => currentSpace && buyProperty(currentSpace.id)}>
                                Buy {currentSpace?.name} (${currentSpace?.price})
                            </button>
                        )}

                        {isMyTurn && gameState?.currentTurnPhase === 'acting' && (
                            <>
                                <div className="timer-display" style={{ color: 'orange', fontWeight: 'bold', marginBottom: '10px' }}>
                                    Time left: {Math.max(0, Math.floor(15 - (Date.now() - (gameState.turnTimerStart || Date.now())) / 1000))}s
                                </div>
                                <button className="action-button end-turn" onClick={endTurn}>End Turn</button>
                                {/* Simple Buy House UI for valid properties owned */}
                                {gameState.players[gameState.currentPlayerIndex].properties.map(propName => {
                                    const pSpace = BOARD.find(s => s.name === propName);
                                    if (!pSpace || !pSpace.houseCost) return null;
                                    // Check eligible - rough check on client, server validates
                                    return (
                                        <button key={pSpace.id} className="buy-house-btn" onClick={() => buyHouse(pSpace.id)}>
                                            House on {pSpace.name.substring(0, 10)}.. (${pSpace.houseCost})
                                        </button>
                                    )
                                }).slice(0, 3) /* Limit to 3 to save space in this view */}
                            </>
                        )}
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
                                        <div className="owner-indicator" style={{ borderColor: gameState.players.find(p => p.id === gameState.propertyOwners[space.id])?.color }}></div>
                                    )}
                                    {gameState?.buildings[space.id] ? (
                                        <div className="building-indicator">
                                            {Array(gameState.buildings[space.id]).fill(0).map((_, i) => (
                                                <span key={i} className="house-dot"></span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            )}
                            <div className="space-name">{space.name}</div>
                            {space.price && <div className="space-price">${space.price}</div>}

                            {/* Players on this space */}
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

            <div className="player-panel">
                <h3>Players</h3>
                <div className="player-list">
                    {gameState?.players.map(player => (
                        <div key={player.id} className={`player-card ${gameState.players[gameState.currentPlayerIndex].id === player.id ? 'active' : ''}`}>
                            <div className="player-color" style={{ background: player.color }}></div>
                            <div className="player-info">
                                <div className="player-name">{player.name} {player.id === playerId ? '(You)' : ''}</div>
                                <div className="player-money">${player.money}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
