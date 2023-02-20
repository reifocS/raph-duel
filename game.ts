
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
                } else if (value == bestValue && Math.random() > 0.5) {
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

type PayoffMatrix = number[][];

/*
By Convention the payoff matrix for a two player zero-sum game, shows the strategies for both players
with the payoffs for the row player as entries. The payoffs for the column player for each situation can
be calculated by taking the negative of the row player’s payoff.
Recall that an Equilibrium Point of a game is a pair of strategies such that neither player has any
incentive to change strategies if the other player stays with their current strategy. Note that in a zero
sum game this corresponds to an entry in the matrix which is simultaneously the minimum in
its row and the maximum in its column. To find such entries, we can calculate the minimum in
each row and the maximum in each column and check if any entry simultaneously gives the minimum
in its row and the maximum in its column.
*/

export function getPayOffMatrix(game: Game): PayoffMatrix {
    // Set up the payoff matrix
    const n = cards.length
    const payoffMatrix: PayoffMatrix = Array(n)
        .fill(0)
        .map(() =>
            Array(n)
                .fill(0));

    // Compute payoffs for each combination of moves
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            // Copy the game state for the simulation
            if (game.is_valid_play(cards[i], game.player_one) && game.is_valid_play(cards[j], game.player_two)) {
                const simGame = game.deep_copy();
                simGame.play(cards[i], cards[j]);

                // Compute payoffs for each player based on the simulation
                const playerOnePayoff = simGame.player_one.pv - simGame.player_two.pv;

                // Update the payoff matrix
                payoffMatrix[i][j] = playerOnePayoff;
            } else {
                // Impossible move
                payoffMatrix[i][j] = Number.NEGATIVE_INFINITY

            }

        }
    }

    return payoffMatrix;


}

function doubleOracle(payoffMatrix: PayoffMatrix): [number, number] {
    // Initialize players' sets of possible moves
    const numMoves = payoffMatrix.length;
    const player1Moves = new Set<number>(Array.from({ length: numMoves }, (_, i) => i));
    const player2Moves = new Set<number>(Array.from({ length: numMoves }, (_, i) => i));

    // Iterate until a stable outcome is reached
    while (true) {
        // Find player 1's best response to player 2's moves
        const bestResponse1 = Array.from(player1Moves).reduce(
            (bestMove, move) =>
                Math.max(
                    bestMove,
                    Math.min(...Array.from(player2Moves).map((move2) => payoffMatrix[move][move2]))
                ),
            -Infinity
        );

        // Find player 2's best response to player 1's moves
        const bestResponse2 = Array.from(player2Moves).reduce(
            (bestMove, move) =>
                Math.max(
                    bestMove,
                    Math.min(...Array.from(player1Moves).map((move1) => payoffMatrix[move1][move]))
                ),
            -Infinity
        );

        // Play the chosen moves simultaneously
        const payoff1 = payoffMatrix[bestResponse1][bestResponse2];
        const payoff2 = payoffMatrix[bestResponse2][bestResponse1];

        // Update players' sets of possible moves
        player1Moves.add(bestResponse2);
        player2Moves.add(bestResponse1);

        // Check if a stable outcome has been reached
        if (!player1Moves.has(bestResponse2) && !player2Moves.has(bestResponse1)) {
            return [payoff1, payoff2];
        }
    }
}
