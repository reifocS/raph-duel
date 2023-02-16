
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

    choose_card(game: Game) {
        return this.cards[Math.floor(Math.random() * this.cards.length)]
    }
}

function evaluate(game: Game, maximizingPlayer: Player, minimizingPlayer: Player): number {
    if (game.player_one.pv <= 0) {
        return Number.NEGATIVE_INFINITY;
    }
    if (game.player_two.pv <= 0) {
        return Number.POSITIVE_INFINITY;
    }
    const maximizingPlayerScore = maximizingPlayer.pv;
    const minimizingPlayerScore = minimizingPlayer.pv;
    return maximizingPlayerScore - minimizingPlayerScore;
}

function minmax(game: Game, depth: number, isMaximizing: boolean): number {
    if (depth === 0 || game.check_end()) {
        return evaluate(game, game.player_two, game.player_one);
    }

    if (isMaximizing) {
        let bestValue = Number.NEGATIVE_INFINITY;
        for (const card of game.player_one.cards) {
            for (const card_two of game.player_two.cards) {
                const newGame = game.deep_copy();
                newGame.play(card, card_two);
                const value = minmax(newGame, depth - 1, false);
                bestValue = Math.max(bestValue, value);
            }
        }
        return bestValue;
    } else {
        let bestValue = Number.POSITIVE_INFINITY;
        for (const card of game.player_one.cards) {
            for (const card_two of game.player_two.cards) {
                const newGame = game.deep_copy();
                newGame.play(card, card_two);
                const value = minmax(newGame, depth - 1, true);
                bestValue = Math.min(bestValue, value);
            }
        }
        return bestValue;
    }
}

export class AiPlayerMinMax extends AiPlayer {

    constructor() {
        super();
    }

    choose_card(game: Game): number {
        let bestValue = Number.NEGATIVE_INFINITY;
        let bestCard = this.cards[0];
        console.log(this.cards)
        for (const card of game.player_one.cards) {
            for (const card_two of this.cards) {
                const newGame = game.deep_copy()
                newGame.play(card, card_two);
                const value = minmax(newGame, 3, false);
                if (value > bestValue) {
                    bestValue = value;
                    bestCard = card_two;
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
        const copy = structuredClone(this);
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
        this.check_end();
        this.turn(this.player_one, card, card_two);
        this.turn(this.player_two, card_two, card);
    }

    render(): void {
        this.player_one.render();
        this.player_two.render();
    }

    check_end(): boolean {
        if (this.player_one.pv <= 0 || this.player_two.pv <= 0) {
            return true;
        }
        return false;
    }
}
