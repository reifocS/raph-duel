
const DODGE = -1;
const cards = [1, 2, 3, 4, 5, DODGE];
const maxPv = 10;

export class Player {
    cards: number[];
    pv: number;
    board: Array<number[]>;

    constructor() {
        this.cards = [...cards];
        this.pv = maxPv;
        this.board = Array(cards.length - 1).fill([]);
    }

    render(): void {
        console.table([this.cards, this.board, this.pv])
    }
}


export class AiPlayer extends Player {

    constructor() {
        super();
    }

    choose_card(_: Game) {
        return this.cards[Math.floor(Math.random() * this.cards.length)]
    }
}

function evaluate(game: Game, depth: number): number {
    if (game.player_one.pv <= 0) {
        return 1000 + depth;
    }
    if (game.player_two.pv <= 0) {
        return -1000 - depth;
    }
    const maximizingPlayerScore = game.player_two.pv;
    const minimizingPlayerScore = game.player_one.pv;
    return maximizingPlayerScore - minimizingPlayerScore;
}

function minmax(game: Game, depth: number): number {
    if (depth === 0 || game.check_end()) {
        return evaluate(game, depth);
    }
    let bestValue = Number.NEGATIVE_INFINITY;
    for (const card of game.player_one.cards) {
        for (const card_two of game.player_two.cards) {
            const newGame = game.deep_copy();
            newGame.play(card, card_two);
            const value = minmax(newGame, depth - 1);
            bestValue = Math.max(bestValue, value);
            //console.log({ depth, bestValue, value, card_two, card })
        }
    }
    return bestValue;

}



const DEPTH = 1;
//Todo it does not work well because players are playing simultaneously, adapt it
export class AiPlayerMinMax extends AiPlayer {

    constructor() {
        super();
    }

    choose_card(game: Game): number {
        let bestValue = Number.NEGATIVE_INFINITY;
        let bestCard = this.cards[0];
        for (const card of game.player_one.cards) {
            for (const card_two of this.cards) {
                const newGame = game.deep_copy()
                newGame.play(card, card_two);
                const value = minmax(newGame, DEPTH);
                if (value > bestValue) {
                    bestValue = value;
                    bestCard = card_two;
                } else if (value == bestValue && Math.random() > 0.5 && card_two !== DODGE) {
                    bestCard = card_two
                }
            }
        }
        return bestCard;
    }
}


export class Game {
    player_one: Player;
    player_two: Player;
    done: boolean;

    deep_copy() {
        const copy = JSON.parse(JSON.stringify((this)));
        const newGame = new Game(false);
        newGame.player_one = copy.player_one;
        newGame.player_two = copy.player_two;
        newGame.done = copy.done;
        return newGame;
    }

    constructor(withAi: boolean) {
        this.player_one = new Player();
        if (withAi)
            this.player_two = new AiPlayerMinMax();
        else this.player_two = new Player();
        this.done = false;
    }

    is_valid_play(card: number, player: Player): boolean {
        return player.cards.find(c => c === card) !== undefined;
    }

    turn(player: Player, card_player: number, card_opponent: number): void {
        if (!this.is_valid_play(card_player, player)) {
            throw new Error("Invalid move");
        }
        player.cards = player.cards.filter(c => c !== card_player);
        const back_in_hand = player.board.shift();
        if (!back_in_hand) throw new Error("back_in_hand null");
        player.board.push([]);
        for (const c of back_in_hand) {
            player.cards.push(c);
        }
        if (card_player === DODGE) {
            if (card_opponent === DODGE) {
                //Put back in hand directly
                player.cards.push(DODGE);
            }
            else {
                player.board[card_opponent - 1] = [...player.board[card_opponent - 1], card_player];
            }
        } else {
            player.board[card_player - 1] = [...player.board[card_player - 1], card_player];
        }
    }

    play(card: number, card_two: number): void {
        if (card !== DODGE && card_two !== DODGE) {
            if (card > card_two) {
                this.player_two.pv -= card - card_two;
            } else if (card < card_two) {
                this.player_one.pv -= card_two - card;
            }
        }
        this.done = this.check_end();
        this.turn(this.player_one, card, card_two);
        this.turn(this.player_two, card_two, card);
    }

    render(): void {
        this.player_one.render();
        this.player_two.render();
    }

    check_end(): boolean {
        return (this.player_one.pv <= 0 || this.player_two.pv <= 0)
    }
}


const examplePayOff = [
    [[0, 0], [-1, 1], [-2, 2], [-3, 3], [-4, 4], [0, 0]],
    [[1, -1], [0, 0], [-1, 1], [-2, 2], [-3, 3], [0, 0]],
    [[2, -2], [1, -1], [0, 0], [-1, 1], [-2, 2], [0, 0]],
    [[3, -3], [2, -2], [1, -1], [0, 0], [-1, 1], [0, 0]],
    [[4, -4], [3, -3], [2, -2], [1, -1], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]]

type PayoffMatrix = number[][][];

export function getPayOffMatrix(game: Game): PayoffMatrix {
    // Set up the payoff matrix
    const n = cards.length
    const payoffMatrix = Array(n)
        .fill(0)
        .map(() =>
            Array(n)
                .fill(0)
                .map(() => [0, 0])
        );

    // Compute payoffs for each combination of moves
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            // Copy the game state for the simulation
            if (game.is_valid_play(cards[i], game.player_one) && game.is_valid_play(cards[j], game.player_two)) {
                const simGame = game.deep_copy();
                simGame.play(cards[i], cards[j]);

                // Compute payoffs for each player based on the simulation
                const playerOnePayoff = simGame.player_one.pv - simGame.player_two.pv;
                const playerTwoPayoff = simGame.player_two.pv - simGame.player_one.pv;

                // Update the payoff matrix
                payoffMatrix[i][j] = [playerOnePayoff, playerTwoPayoff];
            } else {
                // Impossible move
                payoffMatrix[i][j] = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

            }

        }
    }

    return payoffMatrix;


}
