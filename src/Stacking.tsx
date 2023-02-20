import { motion } from "framer-motion";

type Props = {
  cards: number[];
  player: boolean;
  index: number;
};

export default function Stacking(props: Props) {
  return (
    <div className="relative text-center m-2 h-[60px] w-[30px] bg-slate-600 ">
      {props.cards.map((c, i) => (
        <motion.div
          layoutId={"board" + c + props.player}
          className={`absolute text-center text-white bg-slate-800 border-2 w-[100%] border-solid`}
          style={{
            top: i * 20,
          }}
          key={c}
        >
          {c === -1 ? ">" : c}
        </motion.div>
      ))}
    </div>
  );
}
