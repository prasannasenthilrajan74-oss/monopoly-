"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Board_1 = require("./Board");
class GameManager {
    constructor(onStateChange) {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.dice = [0, 0];
        this.gameStatus = 'waiting';
        this.propertyOwners = {};
        this.buildings = {};
        this.currentTurnPhase = 'rolling';
        this.lastAction = 'Game started';
        this.doublesConsecutive = 0;
        this.turnTimer = null;
        this.turnTimerStart = 0;
        this.onStateChange = null;
        this.availableColors = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0', '#ff9800', '#00bcd4', '#e91e63'];
        if (onStateChange)
            this.onStateChange = onStateChange;
    }
    getNextColor() {
        const usedColors = this.players.map(p => p.color);
        const freeColor = this.availableColors.find(c => !usedColors.includes(c));
        return freeColor || this.availableColors[Math.floor(Math.random() * this.availableColors.length)];
    }
    setOnStateChange(cb) {
        this.onStateChange = cb;
    }
    startActingTimer() {
        if (this.turnTimer)
            clearTimeout(this.turnTimer);
        this.turnTimerStart = Date.now();
        // Notify state change for timer UI
        if (this.onStateChange)
            this.onStateChange(this.getGameState());
        this.turnTimer = setTimeout(() => {
            const player = this.players[this.currentPlayerIndex];
            this.lastAction = `Time's up for ${player.name}! Turn ended automatically.`;
            this.endTurn(player.id, true);
            if (this.onStateChange)
                this.onStateChange(this.getGameState());
        }, 15000);
    }
    clearTimer() {
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
            this.turnTimer = null;
        }
    }
    addPlayer(id, name) {
        const player = {
            id,
            name,
            money: 1500,
            position: 0,
            properties: [],
            inJail: false,
            jailTurns: 0,
            color: this.getNextColor(),
            doublesCount: 0,
            getOutJailCards: 0,
            bankrupt: false,
        };
        this.players.push(player);
        return player;
    }
    removePlayer(id) {
        this.players = this.players.filter(p => p.id !== id);
        if (this.currentPlayerIndex >= this.players.length) {
            this.currentPlayerIndex = 0;
        }
    }
    getGameState() {
        return {
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            dice: this.dice,
            gameStatus: this.gameStatus,
            propertyOwners: this.propertyOwners,
            buildings: this.buildings,
            currentTurnPhase: this.currentTurnPhase,
            lastAction: this.lastAction,
            turnTimerStart: this.currentTurnPhase === 'acting' ? this.turnTimerStart : undefined,
        };
    }
    startGame() {
        if (this.players.length >= 2) {
            this.gameStatus = 'active';
            this.currentPlayerIndex = 0;
            this.currentTurnPhase = 'rolling';
            this.lastAction = 'Game started! ' + this.players[0].name + "'s turn.";
            this.clearTimer();
        }
    }
    rollDice(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player)
            return { dice: [0, 0], player: undefined };
        if (this.players[this.currentPlayerIndex].id !== playerId)
            return { dice: this.dice, player };
        if (this.currentTurnPhase !== 'rolling' && this.currentTurnPhase !== 'jail_decision')
            return { dice: this.dice, player };
        if (player.inJail && this.currentTurnPhase !== 'jail_decision') {
            this.currentTurnPhase = 'jail_decision';
            return { dice: this.dice, player };
        }
        const d1 = Math.ceil(Math.random() * 6);
        const d2 = Math.ceil(Math.random() * 6);
        this.dice = [d1, d2];
        const isDouble = d1 === d2;
        if (player.inJail) {
            if (isDouble) {
                player.inJail = false;
                player.jailTurns = 0;
                this.lastAction = `${player.name} rolled doubles to escape Jail!`;
                this.currentTurnPhase = 'acting';
                this.startActingTimer();
            }
            else {
                player.jailTurns++;
                if (player.jailTurns >= 3) {
                    player.inJail = false;
                    player.jailTurns = 0;
                    player.money -= 50;
                    this.lastAction = `${player.name} failed to roll doubles 3 times. Paid $50 fine.`;
                    this.currentTurnPhase = 'acting';
                    this.startActingTimer();
                }
                else {
                    this.lastAction = `${player.name} stayed in Jail.`;
                    this.endTurn(playerId);
                    return { dice: this.dice, player };
                }
            }
        }
        else {
            // Normal Move
            if (isDouble) {
                this.doublesConsecutive++;
            }
            else {
                this.doublesConsecutive = 0;
            }
            if (this.doublesConsecutive >= 3) {
                this.sendToJail(player);
                this.lastAction = `${player.name} rolled 3 doubles! Go to Jail!`;
                this.endTurn(playerId, true);
                return { dice: this.dice, player };
            }
            const moves = d1 + d2;
            const oldPos = player.position;
            player.position = (player.position + moves) % 40;
            this.currentTurnPhase = 'acting';
            if (player.position < oldPos && !player.inJail) {
                player.money += 200;
                this.lastAction = `${player.name} passed GO and collected $200.`;
            }
            else {
                this.lastAction = `${player.name} rolled ${moves}.`;
            }
            this.handleLanding(player);
            // Check if turn ended due to Jail in handleLanding (e.g. Go To Jail space)
            if (this.currentTurnPhase === 'acting') {
                this.startActingTimer();
            }
        }
        return { dice: this.dice, player };
    }
    sendToJail(player) {
        player.inJail = true;
        player.position = 10; // Jail space
        player.jailTurns = 0;
        this.doublesConsecutive = 0;
    }
    handleLanding(player) {
        const spaceId = player.position;
        const space = Board_1.BOARD.find(s => s.id === spaceId);
        if (!space)
            return;
        if (space.name === 'Go To Jail') {
            this.sendToJail(player);
            this.lastAction += ' Sent to Jail!';
            this.endTurn(player.id, true);
            return;
        }
        if (space.type === 'tax') {
            const tax = space.name === 'Income Tax' ? 200 : 100;
            player.money -= tax;
            this.lastAction += ` Paid $${tax} tax.`;
        }
        if (space.type === 'action') { // Community Chest / Chance
            // Simplified action logic
            const actions = [
                { text: "Bank error in your favor. Collect $200", change: 200 },
                { text: "Doctor's fee. Pay $50", change: -50 },
                { text: "From sale of stock you get $50", change: 50 },
                { text: "Pay hospital fees of $100", change: -100 },
                { text: "Go to Jail", goto: 10, jail: true },
                { text: "Advance to GO", goto: 0, collect: 200 }
            ];
            const action = actions[Math.floor(Math.random() * actions.length)];
            this.lastAction += ` Drew card: ${action.text}.`;
            if (action.change) {
                player.money += action.change;
            }
            if (action.goto !== undefined) {
                player.position = action.goto;
                if (action.jail) {
                    this.sendToJail(player);
                    this.endTurn(player.id, true);
                    return;
                }
                if (action.collect) { // Passed go logic handled if manual move but direct jump usually implies only if passing logic valid. Standard Monop allows collecting if passing steps, direct jump usually specifies.
                    player.money += 200;
                }
                // Handle landing on new space? Recursion limit?
                // For MVP, just land and done.
            }
        }
        const ownerId = this.propertyOwners[spaceId];
        if ((space.type === 'property' || space.type === 'railroad' || space.type === 'utility') && ownerId && ownerId !== player.id) {
            const owner = this.players.find(p => p.id === ownerId);
            if (owner && space.price) {
                let rent = 0;
                if (space.type === 'railroad') {
                    // Count RRs owned by owner
                    const rrCount = Board_1.BOARD.filter(s => s.type === 'railroad' && this.propertyOwners[s.id] === owner.id).length;
                    rent = [25, 50, 100, 200][rrCount - 1] || 25;
                }
                else if (space.type === 'utility') {
                    // Dice dependent
                    const uCount = Board_1.BOARD.filter(s => s.type === 'utility' && this.propertyOwners[s.id] === owner.id).length;
                    const mult = uCount === 2 ? 10 : 4;
                    rent = (this.dice[0] + this.dice[1]) * mult;
                }
                else {
                    // Property
                    const buildings = this.buildings[spaceId] || 0;
                    if (space.rent) {
                        rent = space.rent[buildings];
                        if (buildings === 0) {
                            // Check color set for double rent
                            const groupSpaces = Board_1.BOARD.filter(s => s.group === space.group);
                            const ownsAll = groupSpaces.every(s => this.propertyOwners[s.id] === owner.id);
                            if (ownsAll)
                                rent *= 2;
                        }
                    }
                    else {
                        rent = space.price * 0.1;
                    }
                }
                if (player.money >= rent) {
                    player.money -= rent;
                    owner.money += rent;
                    this.lastAction += ` Paid $${rent} rent to ${owner.name}.`;
                }
                else {
                    const amount = player.money;
                    player.money = 0;
                    owner.money += amount;
                    player.bankrupt = true;
                    this.lastAction += ` Bankrupt! Paid $${amount} to ${owner.name}.`;
                    // Handle bankruptcy cleanup?
                }
            }
        }
    }
    buyProperty(playerId, propertyId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player || this.players[this.currentPlayerIndex].id !== playerId || this.currentTurnPhase !== 'acting')
            return;
        if (this.propertyOwners[propertyId])
            return;
        const space = Board_1.BOARD.find(s => s.id === propertyId);
        if (!space || !space.price)
            return;
        if (player.money >= space.price) {
            player.money -= space.price;
            player.properties.push(space.name); // Keep for UI info
            this.propertyOwners[propertyId] = player.id;
            this.lastAction = `${player.name} bought ${space.name}.`;
            this.startActingTimer(); // Reset timer to give time to End Turn
        }
    }
    buyHouse(playerId, propertyId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player || this.players[this.currentPlayerIndex].id !== playerId || this.currentTurnPhase !== 'acting')
            return;
        const space = Board_1.BOARD.find(s => s.id === propertyId);
        if (!space || !space.houseCost || space.type !== 'property')
            return;
        // Check ownership
        if (this.propertyOwners[propertyId] !== playerId)
            return;
        // Check color group ownership
        const groupSpaces = Board_1.BOARD.filter(s => s.group === space.group);
        const ownsAll = groupSpaces.every(s => this.propertyOwners[s.id] === playerId);
        if (!ownsAll) {
            // In a real game you'd notify "Must own all properties..."
            return;
        }
        // Check max houses (5 = hotel)
        const currentHouses = this.buildings[propertyId] || 0;
        if (currentHouses >= 5)
            return;
        // Enforce even building (cannot build if this property has more than others in group)
        const housesInGroup = groupSpaces.map(s => this.buildings[s.id] || 0);
        const minHouses = Math.min(...housesInGroup);
        if (currentHouses > minHouses)
            return;
        if (player.money >= space.houseCost) {
            player.money -= space.houseCost;
            this.buildings[propertyId] = currentHouses + 1;
            const type = this.buildings[propertyId] === 5 ? 'Hotel' : 'House';
            this.lastAction = `${player.name} bought a ${type} for ${space.name}.`;
            this.startActingTimer(); // Reset timer
        }
    }
    // New phase: Pay Jail Fine
    payJailFine(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player || this.players[this.currentPlayerIndex].id !== playerId)
            return;
        if (!player.inJail)
            return;
        if (player.money >= 50) {
            player.money -= 50;
            player.inJail = false;
            player.jailTurns = 0;
            this.currentTurnPhase = 'rolling'; // Now can roll
            this.lastAction = `${player.name} paid $50 fine. Ready to roll.`;
        }
    }
    endTurn(playerId, force = false) {
        if (!force) {
            if (this.players[this.currentPlayerIndex].id !== playerId)
                return;
            if (this.currentTurnPhase !== 'acting')
                return;
            // If double rolled and not in jail, can roll again?
            const isDouble = this.dice[0] === this.dice[1] && this.dice[0] !== 0;
            const player = this.players.find(p => p.id === playerId);
            if (isDouble && !(player === null || player === void 0 ? void 0 : player.inJail) && this.doublesConsecutive < 3) {
                this.currentTurnPhase = 'rolling';
                this.lastAction = `${player === null || player === void 0 ? void 0 : player.name} rolled doubles! Roll again.`;
                this.clearTimer();
                return;
            }
        }
        this.clearTimer();
        this.doublesConsecutive = 0;
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        const nextPlayer = this.players[this.currentPlayerIndex];
        if (nextPlayer.inJail) {
            this.currentTurnPhase = 'jail_decision';
            this.lastAction = `Turn passed to ${nextPlayer.name} (In Jail).`;
        }
        else {
            this.currentTurnPhase = 'rolling';
            this.lastAction = `Turn passed to ${nextPlayer.name}.`;
        }
    }
}
exports.GameManager = GameManager;
