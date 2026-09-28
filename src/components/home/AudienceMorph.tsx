import * as React from "react";
import { TextMorph } from "torph/react";

// "Stocked for builders / contractors / farmers …" — the word morphs every
// few seconds. The first word is what search engines and no-JS visitors see.
const WHO = ["builders", "contractors", "plumbers", "retailers", "farmers", "housing projects", "government projects"];

export default function AudienceMorph() {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => !document.hidden && setI((n) => (n + 1) % WHO.length), 2600);
    return () => window.clearInterval(id);
  }, []);
  return (
    <TextMorph as="span" className="text-teal" ease={{ stiffness: 220, damping: 26 }}>
      {WHO[i]}
    </TextMorph>
  );
}
