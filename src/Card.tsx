import { motion } from "framer-motion";

type Props = {
  cardValue: number | null;
  color: string;
  isInteractive: boolean;
  handlePlay: (c: number) => void;
  selected: boolean;
};

export default function Card({
  cardValue,
  color,
  isInteractive,
  handlePlay,
  selected,
}: Props) {
  return (
    <div className="flex flex-col gap-2 items-center">
      <motion.div
        layoutId={cardValue?.toString() + "-" + color}
        onClick={() => {
          handlePlay(cardValue!);
        }}
        className={`p-6 font-extrabold text-2xl rounded ${color} text-white ${
          isInteractive ? "cursor-pointer" : ""
        } ${cardValue === null ? "sr-only" : ""}
      `}
      >
        {cardValue == -1 ? ">" : cardValue}
      </motion.div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`w-6 h-6 ${selected ? "visible" : "invisible"}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5"
        />
      </svg>
    </div>
  );
}
