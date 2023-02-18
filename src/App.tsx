import { usePeerConnection } from "../hooks/usePeerConnection";
import { useCallback, useEffect, useRef, useState } from "react";
import GameComponent from "./GameComponent";
import { Game } from "../game";

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
    <>
      <h3>My peer ID is: {peer_state.id}</h3>
      {peer_state.status == CONNECTION_STATUS.JOINING && (
        <div>
          <p>Try joining by adding dest id</p>
          <input
            value={peer_state.dest_id}
            onChange={({ target }) => setDestId(target.value)}
          />
          <button disabled={!destId} onClick={() => connect(destId)}>
            Connect
          </button>
        </div>
      )}
      {peer_state.status == CONNECTION_STATUS.CONNECTED && (
        <>
          <section>
            <p>Connection established</p>
            <div>Other: {peer_state.connection.peer}</div>
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
    </>
  );
}

export default App;
