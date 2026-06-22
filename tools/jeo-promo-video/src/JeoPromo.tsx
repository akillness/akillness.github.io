import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from "remotion";
import React from "react";

// ── Design tokens ────────────────────────────────────────────────────────────
const BG = "#0a0a14";
const BLUE = "#60a5fa";
const GOLD = "#f59e0b";
const GREEN = "#34d399";
const PURPLE = "#a78bfa";
const WHITE = "#f8fafc";

// ── Helpers ───────────────────────────────────────────────────────────────────
const FadeIn: React.FC<{
  from?: number;
  children: React.ReactNode;
  delay?: number;
}> = ({ from = 0, children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({ frame: frame - delay, fps, config: { damping: 20 } });
  const y = interpolate(frame - delay, [0, 20], [from, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>
  );
};

// ── Scene 1 — Hero (0–90f) ───────────────────────────────────────────────────
const SceneHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, #111830 0%, ${BG} 70%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      {/* Pulsing glow ring */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BLUE}22 0%, transparent 70%)`,
          transform: `scale(${1 + Math.sin(frame / 20) * 0.05})`,
        }}
      />
      <div
        style={{
          transform: `scale(${scale})`,
          fontFamily: "monospace",
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: -4,
          background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "none",
        }}
      >
        jeo-code
      </div>
      <FadeIn from={30} delay={20}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 28,
            color: WHITE,
            opacity: 0.8,
            letterSpacing: 2,
          }}
        >
          Encode Intention. Decode Software.
        </div>
      </FadeIn>
      <FadeIn from={30} delay={40}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 20,
            color: GOLD,
            letterSpacing: 1,
          }}
        >
          github.com/akillness/jeo-code
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};

// ── Scene 2 — Workflow loop (90–180f) ────────────────────────────────────────
const STEPS = [
  { emoji: "🤔", label: "Curiosity", color: "#f87171", desc: "Ask the right questions" },
  { emoji: "📚", label: "Retrieve", color: BLUE, desc: "Mine deep knowledge" },
  { emoji: "💡", label: "Innovation", color: GOLD, desc: "Ship production-ready" },
];

const SceneWorkflow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
      }}
    >
      <FadeIn from={20} delay={0}>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 42,
            fontWeight: 700,
            color: WHITE,
          }}
        >
          The Builder's Philosophy
        </div>
      </FadeIn>
      <div style={{ display: "flex", gap: 64, alignItems: "center" }}>
        {STEPS.map((step, i) => {
          const delay = i * 15;
          const sc = spring({ frame: frame - delay, fps, config: { damping: 18 } });
          return (
            <React.Fragment key={step.label}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  transform: `scale(${sc})`,
                }}
              >
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: `${step.color}22`,
                    border: `3px solid ${step.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 56,
                    boxShadow: `0 0 30px ${step.color}44`,
                  }}
                >
                  {step.emoji}
                </div>
                <div style={{ fontFamily: "sans-serif", fontSize: 26, fontWeight: 700, color: step.color }}>
                  {step.label}
                </div>
                <div style={{ fontFamily: "sans-serif", fontSize: 18, color: WHITE, opacity: 0.7 }}>
                  {step.desc}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ fontSize: 40, color: WHITE, opacity: 0.4 }}>→</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3 — Skills (180–255f) ───────────────────────────────────────────────
const SKILLS_SAMPLE = [
  "bmad", "deep-dive", "remotion-video-production", "god-tibo-imagen",
  "scrapling", "graphify", "llm-wiki", "team", "ultrawork", "autopilot",
  "omx", "omc", "ohmg", "spec-kit", "plannotator",
];

const SceneSkills: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleSc = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${BG} 0%, #0d1b2a 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: 80,
      }}
    >
      <div
        style={{
          transform: `scale(${titleSc})`,
          fontFamily: "sans-serif",
          fontSize: 48,
          fontWeight: 800,
          color: WHITE,
          textAlign: "center",
        }}
      >
        136 Skills.{" "}
        <span
          style={{
            background: `linear-gradient(90deg, ${GREEN}, ${BLUE})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Infinite Power.
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          justifyContent: "center",
          maxWidth: 1600,
        }}
      >
        {SKILLS_SAMPLE.map((skill, i) => {
          const delay = i * 5;
          const sc = spring({ frame: frame - delay, fps, config: { damping: 22 } });
          return (
            <div
              key={skill}
              style={{
                transform: `scale(${sc})`,
                background: `${BLUE}18`,
                border: `1px solid ${BLUE}55`,
                borderRadius: 10,
                padding: "10px 20px",
                fontFamily: "monospace",
                fontSize: 18,
                color: BLUE,
                boxShadow: `0 0 12px ${BLUE}22`,
              }}
            >
              {skill}
            </div>
          );
        })}
        <div
          style={{
            transform: `scale(${spring({ frame: frame - 90, fps, config: { damping: 22 } })})`,
            background: `${GOLD}18`,
            border: `2px solid ${GOLD}`,
            borderRadius: 10,
            padding: "10px 20px",
            fontFamily: "monospace",
            fontSize: 18,
            color: GOLD,
            boxShadow: `0 0 20px ${GOLD}44`,
            fontWeight: 700,
          }}
        >
          + 121 more →
        </div>
      </div>
      <FadeIn from={20} delay={80}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 22,
            color: GREEN,
            letterSpacing: 1,
          }}
        >
          github.com/akillness/jeo-skills
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};

// ── Scene 4 — CTA (255–300f) ─────────────────────────────────────────────────
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at bottom, #1a0a3a 0%, ${BG} 60%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          fontFamily: "sans-serif",
          fontSize: 64,
          fontWeight: 900,
          color: WHITE,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        Become a{" "}
        <span
          style={{
            background: `linear-gradient(135deg, ${BLUE}, ${PURPLE}, ${GOLD})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          10× AI Builder
        </span>
      </div>
      <FadeIn from={30} delay={20}>
        <div style={{ display: "flex", gap: 32 }}>
          <div
            style={{
              background: `${BLUE}22`,
              border: `2px solid ${BLUE}`,
              borderRadius: 16,
              padding: "18px 36px",
              fontFamily: "monospace",
              fontSize: 22,
              color: BLUE,
              boxShadow: `0 0 24px ${BLUE}44`,
            }}
          >
            ⭐ jeo-code
          </div>
          <div
            style={{
              background: `${GOLD}22`,
              border: `2px solid ${GOLD}`,
              borderRadius: 16,
              padding: "18px 36px",
              fontFamily: "monospace",
              fontSize: 22,
              color: GOLD,
              boxShadow: `0 0 24px ${GOLD}44`,
            }}
          >
            🚀 jeo-skills
          </div>
        </div>
      </FadeIn>
      <FadeIn from={20} delay={40}>
        <div style={{ fontFamily: "monospace", fontSize: 20, color: WHITE, opacity: 0.6 }}>
          bun install -g jeo-code
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};

// ── Root composition ─────────────────────────────────────────────────────────
export const JeoPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence from={0} durationInFrames={90}>
        <SceneHero />
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <SceneWorkflow />
      </Sequence>
      <Sequence from={180} durationInFrames={75}>
        <SceneSkills />
      </Sequence>
      <Sequence from={255} durationInFrames={45}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
