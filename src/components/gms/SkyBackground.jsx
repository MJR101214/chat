import { useState, useEffect } from "react";

const BG_IMAGES = [
  "https://media.carusohomes.com/46/masterplans/631/new-home-masterplan-Monticello_5Vn5ZAi.PNG?width=1920&height=1288&fit=bounds&ois=c044224",
  "https://media.carusohomes.com/46/masterplans/631/new-home-masterplan-Monticello_IWYCNtK.PNG?width=1920&height=1285&fit=bounds&ois=dca4f1a",
  "https://media.carusohomes.com/46/masterplans/631/new-home-masterplan-Monticello_CqZ9mwF.png?width=924&height=609&fit=bounds&ois=4cea7e9",
  "https://media.carusohomes.com/46/masterplans/631/new-home-masterplan-Monticello_LrVVFyl.png?width=928&height=622&fit=bounds&ois=ed24b07",
  "https://media.carusohomes.com/46/masterplans/631/new-home-masterplan-Monticello_L8tcSRi.png?width=926&height=619&fit=bounds&ois=217e192",
  "https://media.carusohomes.com/46/masterplans/631/new-home-masterplan-Monticello_kr2FL4M.PNG?width=1920&height=1273&fit=bounds&ois=b652746",
];

export default function SkyBackground() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(i => (i + 1) % BG_IMAGES.length), 12000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {BG_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-2000"
          style={{
            backgroundImage: `url('${src}')`,
            opacity: i === current ? 1 : 0,
            transition: "opacity 2s ease-in-out",
          }}
        />
      ))}
      {/* Very light vignette only */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.08)" }} />
    </div>
  );
}