import { useRef, useState } from "react";
import { AiPlayer, getPayOffMatrix, Game } from "../game";
import "./App.css";
import Card from "./Card";
// import { useAutoAnimate } from "@formkit/auto-animate/react";
import { motion } from "framer-motion";
import Stacking from "./Stacking";

function Board({
  cards,
  board,
  interactive,
  handlePlay,
}: {
  cards: number[];
  board: number[][];
  interactive: boolean;
  handlePlay: (c: number) => void;
}) {
  //const [parent, enableAnimations] = useAutoAnimate(/* optional config */);

  return (
    <>
      <div className="flex mb-2 gap-2">
        {board.map((b, i) => (
          <Stacking key={i} cards={b} index={i} player={interactive} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 w-full items-center justify-center mb-2">
        {cards.map((c) => (
          <Card
            key={c}
            cardValue={c}
            color={
              interactive
                ? "bg-gradient-to-t from-slate-400 via-slate-500 to-slate-600"
                : "bg-gradient-to-t from-indigo-600 via-purple-500 to-pink-500"
            }
            isInteractive={interactive}
            handlePlay={handlePlay}
          ></Card>
        ))}
      </div>
    </>
  );
}

type GameInfo = {
  player_one_card: number | null;
  player_two_card: number | null;
  winner: number | null;
};

function App() {
  const gameRef = useRef(new Game(true));
  const [gameInfo, setGameInfo] = useState<GameInfo>({
    player_one_card: null,
    player_two_card: null,
    winner: null,
  });
  const cancelRef = useRef(0);

  function handlePlay(cardPlayer: number) {
    const game = gameRef.current;
    clearTimeout(cancelRef.current);
    if (game.is_valid_play(+cardPlayer, game.player_one)) {
      const cardAi = (game.player_two as AiPlayer).choose_card(game);
      console.log(getPayOffMatrix(game));
      game.play(+cardPlayer, cardAi);
      setGameInfo({
        player_one_card: cardPlayer,
        player_two_card: cardAi,
        winner: game.done ? (game.player_one.pv <= 0 ? 2 : 1) : null,
      });

      /*cancelRef.current = setTimeout(() => {
        setGameInfo((prev) => ({
          ...prev,
          player_one_card: null,
          player_two_card: null,
        }));
      }, 2000);*/
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-5">
      <>
        <div className="flex flex-col items-center justify-center">
          <p className="font-extrabold text-2xl">
            Player 1 {gameRef.current.player_one.pv}pv
          </p>
          <Board
            cards={gameRef.current.player_one.cards}
            board={gameRef.current.player_one.board}
            interactive={true}
            handlePlay={handlePlay}
          />
        </div>
        <div className="flex flex-col gap-3 items-center">
          <Card
            key={gameInfo.player_one_card + "p1"}
            cardValue={gameInfo.player_one_card}
            color={"bg-gradient-to-t from-slate-400 via-slate-500 to-slate-600"}
            isInteractive={false}
            handlePlay={function (c: number): void {
              return;
            }}
          ></Card>
          <Card
            key={gameInfo.player_two_card + "p2"}
            cardValue={gameInfo.player_two_card}
            color={
              "bg-gradient-to-t from-indigo-600 via-purple-500 to-pink-500"
            }
            isInteractive={false}
            handlePlay={function (c: number): void {
              return;
            }}
          ></Card>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="font-extrabold text-2xl">
            Player 2 {gameRef.current.player_two.pv} pv
          </p>
          <Board
            cards={gameRef.current.player_two.cards}
            board={gameRef.current.player_two.board}
            interactive={false}
            handlePlay={(c: number) => undefined}
          />
        </div>
      </>
      {gameRef.current.done && (
        <p className="text-2xl font-extrabold">
          Winner is player {gameInfo.winner}
          <button
            onClick={() => {
              gameRef.current = new Game(true);
              setGameInfo({
                player_one_card: null,
                player_two_card: null,
                winner: null,
              });
            }}
            className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
          >
            Replay
          </button>
        </p>
      )}
    </div>
  );
}

export default App;
