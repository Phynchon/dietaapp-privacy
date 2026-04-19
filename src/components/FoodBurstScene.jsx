import { useId } from "react";
import "./FoodBurstScene.css";

const FOOD_ITEMS = [
  {
    id: "celery",
    kind: "celery",
    dx: "0px",
    dy: "clamp(-460px, -42vh, -260px)",
    mx: "0px",
    my: "clamp(-190px, -18vh, -110px)",
    delay: "0s",
    duration: "11.2s",
    size: "clamp(106px, 10vw, 150px)",
    rotation: "-6deg",
    scale: 1.12,
    depth: 1,
  },
  {
    id: "broccoli",
    kind: "broccoli",
    dx: "clamp(320px, 30vw, 460px)",
    dy: "0px",
    mx: "clamp(132px, 12vw, 184px)",
    my: "0px",
    delay: "0.9s",
    duration: "11.6s",
    size: "clamp(108px, 10.4vw, 154px)",
    rotation: "10deg",
    scale: 1.14,
    depth: 1.08,
  },
  {
    id: "apple",
    kind: "apple",
    dx: "clamp(-320px, -30vw, -460px)",
    dy: "0px",
    mx: "clamp(-132px, -12vw, -184px)",
    my: "0px",
    delay: "1.8s",
    duration: "11.4s",
    size: "clamp(102px, 9.8vw, 144px)",
    rotation: "-8deg",
    scale: 1.12,
    depth: 0.98,
  },
  {
    id: "cheese",
    kind: "cheese",
    dx: "0px",
    dy: "clamp(360px, 36vh, 500px)",
    mx: "0px",
    my: "clamp(150px, 15vh, 210px)",
    delay: "2.7s",
    duration: "11.8s",
    size: "clamp(102px, 9.8vw, 142px)",
    rotation: "8deg",
    scale: 1.08,
    depth: 0.92,
  },
  {
    id: "carrot",
    kind: "carrot",
    dx: "clamp(-250px, -24vw, -360px)",
    dy: "clamp(250px, 24vh, 360px)",
    mx: "clamp(-106px, -10vw, -150px)",
    my: "clamp(106px, 10vh, 150px)",
    delay: "3.6s",
    duration: "11s",
    size: "clamp(106px, 10.2vw, 148px)",
    rotation: "-22deg",
    scale: 1.12,
    depth: 0.96,
  },
  {
    id: "drumstick",
    kind: "drumstick",
    dx: "clamp(250px, 24vw, 360px)",
    dy: "clamp(250px, 24vh, 360px)",
    mx: "clamp(106px, 10vw, 150px)",
    my: "clamp(106px, 10vh, 150px)",
    delay: "4.5s",
    duration: "11.7s",
    size: "clamp(112px, 10.8vw, 156px)",
    rotation: "18deg",
    scale: 1.14,
    depth: 1.04,
  },
  {
    id: "yogurt",
    kind: "yogurt",
    dx: "clamp(250px, 24vw, 360px)",
    dy: "clamp(-250px, -24vh, -360px)",
    mx: "clamp(106px, 10vw, 150px)",
    my: "clamp(-106px, -10vh, -150px)",
    delay: "5.4s",
    duration: "11.3s",
    size: "clamp(102px, 9.6vw, 138px)",
    rotation: "-10deg",
    scale: 1.08,
    depth: 0.88,
  },
  {
    id: "fish",
    kind: "fish",
    dx: "clamp(-250px, -24vw, -360px)",
    dy: "clamp(-250px, -24vh, -360px)",
    mx: "clamp(-106px, -10vw, -150px)",
    my: "clamp(-106px, -10vh, -150px)",
    delay: "6.3s",
    duration: "11.9s",
    size: "clamp(116px, 11vw, 164px)",
    rotation: "12deg",
    scale: 1.16,
    depth: 1.08,
  },
  {
    id: "tomato",
    kind: "tomato",
    dx: "clamp(150px, 14vw, 210px)",
    dy: "clamp(-390px, -36vh, -240px)",
    mx: "clamp(66px, 6vw, 96px)",
    my: "clamp(-162px, -15vh, -102px)",
    delay: "0.4s",
    duration: "10.8s",
    size: "clamp(94px, 9vw, 126px)",
    rotation: "-4deg",
    scale: 1.08,
    depth: 0.82,
  },
  {
    id: "egg",
    kind: "egg",
    dx: "clamp(-150px, -14vw, -210px)",
    dy: "clamp(-390px, -36vh, -240px)",
    mx: "clamp(-66px, -6vw, -96px)",
    my: "clamp(-162px, -15vh, -102px)",
    delay: "1.2s",
    duration: "10.9s",
    size: "clamp(90px, 8.6vw, 120px)",
    rotation: "9deg",
    scale: 1.06,
    depth: 0.8,
  },
  {
    id: "orange",
    kind: "orange",
    dx: "clamp(390px, 36vw, 520px)",
    dy: "clamp(140px, 12vh, 200px)",
    mx: "clamp(156px, 14vw, 220px)",
    my: "clamp(60px, 5vh, 90px)",
    delay: "7.2s",
    duration: "10.7s",
    size: "clamp(94px, 9vw, 126px)",
    rotation: "18deg",
    scale: 1.08,
    depth: 0.86,
  },
  {
    id: "toast",
    kind: "toast",
    dx: "clamp(-390px, -36vw, -520px)",
    dy: "clamp(140px, 12vh, 200px)",
    mx: "clamp(-156px, -14vw, -220px)",
    my: "clamp(60px, 5vh, 90px)",
    delay: "8.1s",
    duration: "10.8s",
    size: "clamp(96px, 9.2vw, 132px)",
    rotation: "-18deg",
    scale: 1.1,
    depth: 0.86,
  },
  {
    id: "ham",
    kind: "ham",
    dx: "clamp(0px, 1vw, 10px)",
    dy: "clamp(470px, 44vh, 620px)",
    mx: "clamp(0px, 1vw, 8px)",
    my: "clamp(188px, 18vh, 260px)",
    delay: "9s",
    duration: "11.5s",
    size: "clamp(106px, 10vw, 146px)",
    rotation: "6deg",
    scale: 1.1,
    depth: 0.94,
  },
];

function FoodIcon({ kind }) {
  const gradientId = `food-grad-${useId().replace(/:/g, "")}`;

  switch (kind) {
    case "celery":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M28 74c0-14 8-33 12-48 2-6 12-6 13 0 4 15 11 34 11 48" fill={`url(#${gradientId})`} />
          <path d="M29 72c4-15 11-32 13-47" stroke="#f2ffd8" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
          <path d="M58 24c0-8 8-14 16-14-2 8-7 14-16 14Z" fill="#65c86a" />
          <path d="M44 18c-4-7-2-16 3-22 4 7 4 16-3 22Z" fill="#5aba61" />
          <path d="M32 24c-9-1-15-8-17-16 9 1 17 6 17 16Z" fill="#7ddd81" />
          <defs>
            <linearGradient id={gradientId} x1="26" y1="20" x2="65" y2="74" gradientUnits="userSpaceOnUse">
              <stop stopColor="#dafdb8" />
              <stop offset="1" stopColor="#6dcf73" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "ham":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M28 62c-8-10-7-24 4-34 15-13 39-13 50 0 9 10 6 29-8 41-14 11-37 9-46-7Z" fill={`url(#${gradientId})`} />
          <path d="M68 55c0 9-9 16-20 16S30 64 30 55s9-16 18-16 20 7 20 16Z" fill="#ffd3dd" opacity="0.9" />
          <path d="M80 58c6 1 11 5 11 10s-4 9-9 9-8-3-8-7 2-10 6-12Z" fill="#fff4ea" />
          <circle cx="87" cy="68" r="5" fill="#f4e0d0" />
          <defs>
            <linearGradient id={gradientId} x1="18" y1="20" x2="78" y2="76" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffb5c8" />
              <stop offset="1" stopColor="#d46a8b" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "broccoli":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M44 48h12v28c0 7-5 12-12 12s-12-5-12-12V60c0-7 5-12 12-12Z" fill={`url(#${gradientId})`} />
          <circle cx="31" cy="42" r="15" fill="#54ae51" />
          <circle cx="48" cy="31" r="20" fill="#4a9e49" />
          <circle cx="65" cy="42" r="17" fill="#5fbc56" />
          <circle cx="53" cy="46" r="12" fill="#3f8d42" opacity="0.65" />
          <defs>
            <linearGradient id={gradientId} x1="36" y1="44" x2="57" y2="86" gradientUnits="userSpaceOnUse">
              <stop stopColor="#dff3b8" />
              <stop offset="1" stopColor="#9ac06f" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "cheese":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M18 60 60 30c11-8 20-3 20 9v17c0 10-7 18-18 18H18Z" fill={`url(#${gradientId})`} />
          <path d="M18 60 60 30v23c0 10-8 18-18 18H18Z" fill="#f9f0a4" opacity="0.75" />
          <circle cx="54" cy="48" r="6" fill="#f1d861" />
          <circle cx="35" cy="63" r="4.5" fill="#f2d45a" />
          <circle cx="64" cy="66" r="5.5" fill="#efd769" />
          <defs>
            <linearGradient id={gradientId} x1="16" y1="34" x2="82" y2="78" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff5a9" />
              <stop offset="1" stopColor="#efc94a" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "carrot":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M31 23c0-8 6-16 14-19 2 7 0 15-6 21Z" fill="#75cd70" />
          <path d="M45 24c1-8 8-14 16-15 0 8-4 15-11 20Z" fill="#5cb962" />
          <path d="M34 30c10-9 21-1 27 8s5 19-1 28L38 92c-3 3-7 3-10 0s-3-7 0-10l24-27c3-4 3-10-1-14s-9-4-13 0Z" fill={`url(#${gradientId})`} />
          <path d="M39 44 53 58M34 50 48 64M31 59 42 70" stroke="#f7bf6b" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          <defs>
            <linearGradient id={gradientId} x1="26" y1="26" x2="60" y2="92" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffb64a" />
              <stop offset="1" stopColor="#f2792d" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "drumstick":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M32 63c-11-11-9-31 5-42 14-11 34-8 44 5 11 14 8 34-5 45-12 9-32 6-44-8Z" fill={`url(#${gradientId})`} />
          <path d="M69 65 80 76c4 4 3 10-1 14s-10 4-14 0l-9-9" fill="#faf6ef" />
          <circle cx="68" cy="80" r="5" fill="#f4ece0" />
          <circle cx="84" cy="86" r="5" fill="#f4ece0" />
          <defs>
            <linearGradient id={gradientId} x1="20" y1="20" x2="76" y2="74" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f9cf87" />
              <stop offset="1" stopColor="#c87129" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "yogurt":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M25 34h46l-6 40c-1 9-8 16-18 16H49c-10 0-19-7-20-16Z" fill={`url(#${gradientId})`} />
          <path d="M22 28c0-5 4-9 9-9h34c5 0 9 4 9 9v6H22Z" fill="#fff7f7" />
          <path d="M30 46h34" stroke="#d87093" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
          <circle cx="38" cy="42" r="4" fill="#ff8fb2" />
          <circle cx="57" cy="54" r="5" fill="#ffc6d6" />
          <defs>
            <linearGradient id={gradientId} x1="23" y1="30" x2="68" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#e39ab4" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "toast":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M29 26c-10 0-18 8-18 18v18c0 13 11 23 24 23h16c13 0 24-10 24-23V44c0-10-8-18-18-18-5 0-9 2-14 5-4-3-9-5-14-5Z" fill={`url(#${gradientId})`} />
          <path d="M22 38c4-5 11-8 18-8" stroke="#f9d39c" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
          <path d="M45 22c7 3 12 9 14 17" stroke="#b7722d" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
          <defs>
            <linearGradient id={gradientId} x1="14" y1="20" x2="72" y2="88" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f2c77f" />
              <stop offset="1" stopColor="#b76a27" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "tomato":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <circle cx="48" cy="54" r="26" fill={`url(#${gradientId})`} />
          <path d="M48 24c7 0 10 3 13 10 8-1 14 2 19 8-7 0-11 2-16 6-4-4-9-5-16-5s-12 1-16 5c-4-4-8-6-16-6 5-6 11-9 18-8 4-7 7-10 14-10Z" fill="#61af58" />
          <circle cx="36" cy="46" r="7" fill="#ff8d81" opacity="0.65" />
          <defs>
            <linearGradient id={gradientId} x1="28" y1="30" x2="68" y2="82" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff7f72" />
              <stop offset="1" stopColor="#c72732" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "egg":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M48 16c15 0 27 18 27 37S64 87 48 87 21 71 21 53 33 16 48 16Z" fill={`url(#${gradientId})`} />
          <ellipse cx="39" cy="42" rx="7" ry="10" fill="#fffef1" opacity="0.9" />
          <defs>
            <linearGradient id={gradientId} x1="26" y1="20" x2="67" y2="84" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff8e0" />
              <stop offset="1" stopColor="#d8c6a0" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "fish":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M17 50c12-15 27-23 44-23 7 0 13 2 18 5l14-10-3 19 3 18-13-9c-6 10-16 18-33 18-16 0-24-6-30-18Z" fill={`url(#${gradientId})`} />
          <circle cx="60" cy="44" r="4.5" fill="#193958" />
          <path d="M25 50h18M30 41h18M30 59h18" stroke="#d8edff" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
          <defs>
            <linearGradient id={gradientId} x1="17" y1="26" x2="90" y2="68" gradientUnits="userSpaceOnUse">
              <stop stopColor="#73d9f7" />
              <stop offset="1" stopColor="#2f6eb4" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "orange":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <circle cx="48" cy="52" r="25" fill={`url(#${gradientId})`} />
          <path d="M46 20c8-7 20-7 28-2-8 4-17 5-28 2Z" fill="#67b55c" />
          <ellipse cx="38" cy="42" rx="7" ry="9" fill="#ffcf77" opacity="0.55" />
          <defs>
            <linearGradient id={gradientId} x1="28" y1="28" x2="66" y2="78" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffbd4e" />
              <stop offset="1" stopColor="#ea7f19" />
            </linearGradient>
          </defs>
        </svg>
      );
    case "apple":
      return (
        <svg viewBox="0 0 96 96" role="presentation">
          <path d="M48 24c16 0 28 12 28 29S62 84 48 84 20 70 20 53s12-29 28-29Z" fill={`url(#${gradientId})`} />
          <path d="M48 22c0-8 4-15 11-18 1 8-2 15-11 18Z" fill="#6e4a29" />
          <path d="M55 20c7-1 13 2 18 7-7 2-14 1-18-7Z" fill="#66b45b" />
          <circle cx="38" cy="42" r="7" fill="#ff8b7b" opacity="0.55" />
          <defs>
            <linearGradient id={gradientId} x1="28" y1="26" x2="67" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff7366" />
              <stop offset="1" stopColor="#b7232f" />
            </linearGradient>
          </defs>
        </svg>
      );
    default:
      return null;
  }
}

export default function FoodBurstScene({ className = "" }) {
  const layeredItems = [
    ...FOOD_ITEMS,
    ...FOOD_ITEMS.map((item, index) => ({
      ...item,
      id: `${item.id}-ghost-${index}`,
      size: `calc(${item.size} * 0.84)`,
      depth: Number((item.depth * 0.9).toFixed(2)),
    })),
  ];

  return (
    <div
      className={`food-burst ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="food-burst__lights" />
      <div className="food-burst__items">
        {layeredItems.map((item) => (
          <div
            key={item.id}
            className="food-burst__item"
            style={{
              "--dx": item.dx,
              "--dy": item.dy,
              "--mx": item.mx,
              "--my": item.my,
              "--delay": item.delay,
              "--duration": item.duration,
              "--rotation": item.rotation,
              "--size": item.size,
              "--depth": item.depth,
            }}
          >
            <div className="food-token">
              <div className="food-token__icon">
                <FoodIcon kind={item.kind} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="food-burst__core" />
    </div>
  );
}
