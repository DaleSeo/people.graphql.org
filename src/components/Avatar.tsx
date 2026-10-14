import { useState, type CSSProperties } from "react";

export function initialsFor(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? [words[0], words[words.length - 1]] : words)
    .map((word) => Array.from(word)[0])
    .join("")
    .toLocaleUpperCase();
}

export default function Avatar({
  name,
  src,
  className,
  style,
}: {
  name: string;
  src?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return (
    <span
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      {src && failedSrc !== src ? (
        <img
          src={src}
          alt=""
          width="240"
          height="240"
          loading="lazy"
          decoding="async"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          aria-hidden="true"
          style={{ display: "block", background: "#f5e5ef", color: "#69254f" }}
        >
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dy=".35em"
            fill="currentColor"
            style={{
              fontFamily: '"Host Grotesk", Arial, sans-serif',
              fontWeight: 700,
              fontSize: 36,
            }}
          >
            {initialsFor(name)}
          </text>
        </svg>
      )}
    </span>
  );
}
