import { useEffect, useRef, useState } from "react";
import { Game } from "../game";
import { Data, GameData } from "./App";
import "./App.css";
import Card from "./Card";
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

type Props = {
  send: (msg: Data) => void;
  gameData: GameData;
  setGameData: React.Dispatch<React.SetStateAction<GameData>>;
  game: Game;
};

function GameComponent({ send, gameData, setGameData, game }: Props) {
  // const cancelRef = useRef(0);

  function handlePlay(playerCard: number) {
    if (game.is_valid_play(+playerCard, game.player_one)) {
      console.log({ playerCard });
      setGameData((prev) => ({ ...prev, playerCard }));
      send({ type: "isReady" });
      if (gameData.opponnentReady) {
        send({ type: "play", card: playerCard });
      }

      //setGameData((prev) => ({ ...prev, playerCard: cardPlayer }));
      // cancelRef.current = setTimeout(() => {
      //   setGameData({ opponentCard: null, playerCard: null });
      // }, 3000);
    }
  }

  const { playerLastCard, opponentLastCard } = gameData;
  return (
    <div className="min-h-screen flex flex-col justify-between p-5">
      <>
        <div className="flex flex-col items-center justify-center">
          <p className="font-extrabold text-2xl">You {game.player_one.pv}pv</p>
          <Board
            cards={game.player_one.cards}
            board={game.player_one.board}
            interactive={true}
            handlePlay={handlePlay}
          />
        </div>
        <div className="flex flex-col gap-3 items-center">
          <Card
            key={playerLastCard + "p1"}
            cardValue={playerLastCard}
            color={"bg-gradient-to-t from-slate-400 via-slate-500 to-slate-600"}
            isInteractive={false}
            handlePlay={function (_: number): void {
              return;
            }}
          ></Card>

          <Card
            key={opponentLastCard + "p2"}
            cardValue={opponentLastCard}
            color={
              "bg-gradient-to-t from-indigo-600 via-purple-500 to-pink-500"
            }
            isInteractive={false}
            handlePlay={function (_: number): void {
              return;
            }}
          ></Card>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="font-extrabold text-2xl">
            Player 2 {game.player_two.pv} pv
          </p>
          <Board
            cards={game.player_two.cards}
            board={game.player_two.board}
            interactive={false}
            handlePlay={(c: number) => undefined}
          />
        </div>
      </>
    </div>
  );
}

export default GameComponent;
