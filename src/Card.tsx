import { motion } from "framer-motion";

type Props = {
  cardValue: number | null;
  color: string;
  isInteractive: boolean;
  handlePlay: (c: number) => void;
};

export default function Card({
  cardValue,
  color,
  isInteractive,
  handlePlay,
}: Props) {
  return (
    <motion.div
      layoutId={
        cardValue?.toString() + "-" + color
      }
      onClick={() => {
        handlePlay(cardValue!);
      }}
      className={`p-6 font-extrabold text-2xl rounded ${color} text-white ${
        isInteractive ? "cursor-pointer" : ""
      } ${cardValue === null ? "sr-only" : ""}`}
    >
      {cardValue == -1 ? ">" : cardValue}
    </motion.div>
  );
}
