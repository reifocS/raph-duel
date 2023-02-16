import { SyntheticEvent, useRef, useState } from "react";
import { AiPlayer, Game } from "../game";
import "./App.css";

function App() {
  const gameRef = useRef(new Game(true));
  const [, forceUpdate] = useState(1);
  const [error, setError] = useState("");

  function handlePlay(cardPlayer: number) {
    setError("");
    const game = gameRef.current;
    if (game.is_valid_play(+cardPlayer, game.player_one)) {
      const cardAi = (game.player_two as AiPlayer).choose_card(game);
      game.play(+cardPlayer, cardAi);
      forceUpdate((prev) => prev + 1);
    } else {
      setError("invalid move");
    }
  }

  return (
    <div className="App">
      <p style={{ color: "red" }}>{error}</p>
      <div className="flex flex-col items-center justify-center">
        <p>Player 1 {gameRef.current.player_one.pv}pv</p>

        <div className="grid grid-cols-5">
          {gameRef.current.player_one.board.map((b, i) => (
            <ul className="border-2 border-solid p-4" key={i}>
              {b.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ))}
        </div>
        <div className="flex gap-2 w-full items-center justify-center">
          {gameRef.current.player_one.cards.map((c) => (
            <div
              className="p-4 cursor-pointer"
              onClick={() => handlePlay(c)}
              key={c}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <p>Player 2 {gameRef.current.player_two.pv} pv</p>

        <div className="grid grid-cols-5">
          {gameRef.current.player_two.board.map((b, i) => (
            <ul className="border-2 border-solid p-4" key={i}>
              {b.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ))}
        </div>
        <div className="flex gap-2 w-full items-center justify-center">
          {gameRef.current.player_two.cards.map((c) => (
            <div className="p-4" key={c}>
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
