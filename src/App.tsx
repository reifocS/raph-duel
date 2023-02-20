import { usePeerConnection } from "../hooks/usePeerConnection";
import { useCallback, useEffect, useRef, useState } from "react";
import GameComponent from "./GameComponent";
import { Game } from "../game";
import CopyIcon from "./Copy";

const CONNECTION_STATUS = { DISCONNECTED: 0, JOINING: 1, CONNECTED: 2 };

export type Data =
  | {
      type: "isReady";
    }
  | {
      type: "play";
      card: number;
    };

export type GameData = {
  playerCard: number | null;
  playerLastCard: number | null;
  opponentLastCard: number | null;
  opponentCard: number | null;
  opponnentReady: boolean;
};
function App() {
  const [gameData, setGameData] = useState<GameData>({
    playerCard: null,
    playerLastCard: null,
    opponentLastCard: null,
    opponnentReady: false,
    opponentCard: null,
  });
  const gameRef = useRef(new Game(false));

  const { opponnentReady, playerCard, opponentCard } = gameData;

  const onReceive = useCallback((d: Data) => {
    console.log(d);
    setGameData((prev) => {
      if (d.type === "isReady") {
        return { ...prev, opponnentReady: true };
      }
      if (d.type === "play") {
        return {
          ...prev,
          opponentCard: d.card,
        };
      }
      return prev;
    });
  }, []);

  const { state: peer_state, connect, send } = usePeerConnection({ onReceive });

  useEffect(() => {
    if (opponnentReady && playerCard !== null) {
      send({ type: "play", card: playerCard });
    }
  }, [opponnentReady]);

  //Play turn and reset state
  useEffect(() => {
    if (playerCard !== null && opponentCard !== null) {
      gameRef.current.play(playerCard, opponentCard);
      setGameData((prev) => ({
        ...prev,
        playerCard: null,
        opponentCard: null,
        opponentLastCard: prev.opponentCard,
        playerLastCard: prev.playerCard,
        opponnentReady: false,
      }));
    }
  }, [playerCard, opponentCard]);

  const [destId, setDestId] = useState("");

  return (
    <body className="min-h-screen flex flex-col w-full overflow-x-hidden bg-gray-900 text-gray-200">
      {peer_state.status != CONNECTION_STATUS.CONNECTED && (
        <>
          <h1 className="text-3xl text-center font-extrabold">RAPH DUEL</h1>

          <div className="flex gap-2 p-3">
            <h3>My peer ID is: {peer_state.id}</h3>
            <CopyIcon value={peer_state.id} />
          </div>
        </>
      )}
      {peer_state.status == CONNECTION_STATUS.JOINING && (
        <div className="p-3 flex items-center gap-3">
          <p>Try joining by adding dest id</p>
          <form
          className="flex gap-2 items-center"
            onSubmit={(e) => {
              e.preventDefault();
              connect(destId);
            }}
          >
            <input
              required
              className="block p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={peer_state.dest_id}
              onChange={({ target }) => setDestId(target.value)}
            />
            <button className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2">
              Connect
            </button>
          </form>
        </div>
      )}
      {peer_state.status == CONNECTION_STATUS.CONNECTED && (
        <>
          <section className="p-3 flex gap-2">
            <p>Connection established with {peer_state.connection.peer}</p>
          </section>
          <GameComponent
            game={gameRef.current}
            send={send}
            gameData={gameData}
            setGameData={setGameData}
          />
          ;
        </>
      )}
    </body>
  );
}

export default App;
