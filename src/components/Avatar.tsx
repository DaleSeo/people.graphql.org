import styles from "./Avatar.module.css";
import { useState, type CSSProperties } from "react";

function initialsFor(name: string) {
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
      className={[styles.avatar, className].filter(Boolean).join(" ")}
      style={style}
    >
      {src && failedSrc !== src ? (
        <img
          src={src}
          alt=""
          width="240"
          height="240"
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          aria-hidden="true"
          className={styles.fallback}
        >
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dy=".35em"
            fill="currentColor"
          >
            {initialsFor(name)}
          </text>
        </svg>
      )}
    </span>
  );
}
