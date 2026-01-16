export interface Player {
    id: string;
    name: string;
    money: number;
    position: number;
    properties: string[]; // Property IDs (as strings for now, but referenced by ID in logic)
    inJail: boolean;
    jailTurns: number;
    color: string;
    doublesCount: number;
    getOutJailCards: number;
    bankrupt: boolean;
}

export interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    dice: [number, number];
    gameStatus: 'waiting' | 'active' | 'finished';
    propertyOwners: Record<number, string>; // spaceId -> playerId
    buildings: Record<number, number>; // spaceId -> number of houses (5 = hotel)
    currentTurnPhase: 'rolling' | 'acting' | 'jail_decision';
    lastAction: string;
    turnTimerStart?: number; // Timestamp when timer started
    // We can add board state here if properties can be upgraded/mortgaged
}
