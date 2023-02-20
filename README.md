# raph-duel

Here are the rules of the game:

The game is played between two players.
- Each player starts with a set of cards numbered from 1 to 5, and a special card called DODGE.
- The players also have a life total that starts at 10.
- The game is turn-based, and each turn, both players choose a card from their hand to play.
- If both players play the DODGE card, nothing happens, and both cards are discarded.
- If one player plays the DODGE card, and the other player plays a card other than DODGE, the player who played the DODGE card is protected, and the other player's card is added to a corresponding slot on the player's board.
- If both players play a card other than DODGE, the player with the higher-numbered card inflicts damage on the other player equal to the difference between the two cards numbers.
- After each turn, the cards played are discarded to the board at the same index of their values, and the player's hand is replenished with the card from the back of their board.

The game ends when one player's life total reaches 0 or less. The other player is the winner.
