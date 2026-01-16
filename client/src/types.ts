export interface Player {
    id: string;
    name: string;
    money: number;
    position: number;
    properties: string[]; // Property IDs
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
    propertyOwners: Record<number, string>;
    buildings: Record<number, number>;
    currentTurnPhase: 'rolling' | 'acting' | 'jail_decision';
    lastAction: string;
    turnTimerStart?: number;
}
