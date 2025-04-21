
import React, { useEffect, useState } from "react";

const words = [
  "Health & Safety",
  "Compliance",
  "Quality",
  "IT",
  "Human Resources",
  "Legal",
  "Environmental",
  "Everything Else"
];

interface ChangingWordProps {
  interval?: number;
}

const ChangingWord: React.FC<ChangingWordProps> = ({ interval = 2000 }) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setFade(false), interval - 500);
    const cycle = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setFade(false);
      }, 500);
    }, interval);

    return () => {
      clearInterval(cycle);
      clearTimeout(timeout);
    };
  }, [interval]);

  return (
    <span
      className={`inline-block transition-all duration-500 ${
        fade ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      } bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400 font-bold`}
      style={{
        minWidth: 130,
      }}
      aria-live="polite"
    >
      {words[index]}
    </span>
  );
};

export default ChangingWord;
