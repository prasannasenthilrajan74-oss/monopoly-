export interface Space {
    id: number;
    name: string;
    type: 'property' | 'railroad' | 'utility' | 'action' | 'tax' | 'corner';
    price?: number;
    rent?: number[];
    group?: string; // Color group or type
    houseCost?: number;
}

export const BOARD: Space[] = [
    { id: 0, name: 'Box Office Opening', type: 'corner', group: 'special' },
    { id: 1, name: 'Whiplash', type: 'property', price: 60, rent: [2, 10, 30, 90, 160, 250], group: 'brown', houseCost: 50 },
    { id: 2, name: 'Casting Call', type: 'action', group: 'special' },
    { id: 3, name: 'Moonlight', type: 'property', price: 60, rent: [4, 20, 60, 180, 320, 450], group: 'brown', houseCost: 50 },
    { id: 4, name: 'Income Tax', type: 'tax', group: 'special' },
    { id: 5, name: 'Reading RR', type: 'railroad', price: 200, group: 'railroad', rent: [25, 50, 100, 200] },
    { id: 6, name: 'The Hangover', type: 'property', price: 100, rent: [6, 30, 90, 270, 400, 550], group: 'lightblue', houseCost: 50 },
    { id: 7, name: 'Plot Twist', type: 'action', group: 'special' },
    { id: 8, name: 'Superbad', type: 'property', price: 100, rent: [6, 30, 90, 270, 400, 550], group: 'lightblue', houseCost: 50 },
    { id: 9, name: 'Home Alone', type: 'property', price: 120, rent: [8, 40, 100, 300, 450, 600], group: 'lightblue', houseCost: 50 },
    { id: 10, name: 'Censorship Board', type: 'corner', group: 'special' },
    { id: 11, name: 'Titanic', type: 'property', price: 140, rent: [10, 50, 150, 450, 625, 750], group: 'pink', houseCost: 100 },
    { id: 12, name: 'Electric Co', type: 'utility', price: 150, group: 'utility' },
    { id: 13, name: 'The Notebook', type: 'property', price: 140, rent: [10, 50, 150, 450, 625, 750], group: 'pink', houseCost: 100 },
    { id: 14, name: 'La La Land', type: 'property', price: 160, rent: [12, 60, 180, 500, 700, 900], group: 'pink', houseCost: 100 },
    { id: 15, name: 'Penn RR', type: 'railroad', price: 200, group: 'railroad', rent: [25, 50, 100, 200] },
    { id: 16, name: 'Mission Impossible', type: 'property', price: 180, rent: [14, 70, 200, 550, 750, 950], group: 'orange', houseCost: 100 },
    { id: 17, name: 'Casting Call', type: 'action', group: 'special' },
    { id: 18, name: 'John Wick', type: 'property', price: 180, rent: [14, 70, 200, 550, 750, 950], group: 'orange', houseCost: 100 },
    { id: 19, name: 'Die Hard', type: 'property', price: 200, rent: [16, 80, 220, 600, 800, 1000], group: 'orange', houseCost: 100 },
    { id: 20, name: 'Film Festival', type: 'corner', group: 'special' },
    { id: 21, name: 'Jurassic Park', type: 'property', price: 220, rent: [18, 90, 250, 700, 875, 1050], group: 'red', houseCost: 150 },
    { id: 22, name: 'Plot Twist', type: 'action', group: 'special' },
    { id: 23, name: 'Avatar', type: 'property', price: 220, rent: [18, 90, 250, 700, 875, 1050], group: 'red', houseCost: 150 },
    { id: 24, name: 'Inception', type: 'property', price: 240, rent: [20, 100, 300, 750, 925, 1100], group: 'red', houseCost: 150 },
    { id: 25, name: 'B. & O. RR', type: 'railroad', price: 200, group: 'railroad', rent: [25, 50, 100, 200] },
    { id: 26, name: 'Forrest Gump', type: 'property', price: 260, rent: [22, 110, 330, 800, 975, 1150], group: 'yellow', houseCost: 150 },
    { id: 27, name: 'The Godfather', type: 'property', price: 260, rent: [22, 110, 330, 800, 975, 1150], group: 'yellow', houseCost: 150 },
    { id: 28, name: 'Water Works', type: 'utility', price: 150, group: 'utility' },
    { id: 29, name: "Schindler's List", type: 'property', price: 280, rent: [24, 120, 360, 850, 1025, 1200], group: 'yellow', houseCost: 150 },
    { id: 30, name: 'Go To Jail', type: 'corner', group: 'special' },
    { id: 31, name: 'Interstellar', type: 'property', price: 300, rent: [26, 130, 390, 900, 1100, 1275], group: 'green', houseCost: 200 },
    { id: 32, name: 'The Dark Knight', type: 'property', price: 300, rent: [26, 130, 390, 900, 1100, 1275], group: 'green', houseCost: 200 },
    { id: 33, name: 'Casting Call', type: 'action', group: 'special' },
    { id: 34, name: 'Gladiator', type: 'property', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], group: 'green', houseCost: 200 },
    { id: 35, name: 'Short Line', type: 'railroad', price: 200, group: 'railroad', rent: [25, 50, 100, 200] },
    { id: 36, name: 'Star Wars', type: 'property', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], group: 'darkblue', houseCost: 200 },
    { id: 37, name: 'Luxury Tax', type: 'tax', group: 'special' },
    { id: 38, name: 'The Lord of the Rings', type: 'property', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], group: 'darkblue', houseCost: 200 },
];
