import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import React from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG = "#0d1117";
const TERM_BG = "#161b22";
const BORDER = "#30363d";
const PROMPT_GREEN = "#3fb950";
const CMD_WHITE = "#e6edf3";
const OUTPUT_DIM = "#8b949e";
const BLUE = "#58a6ff";
const GOLD = "#e3b341";
const GREEN = "#3fb950";
const PURPLE = "#bc8cff";
const CYAN = "#39c5cf";
const WHITE = "#f0f6fc";
const RED = "#f85149";
const ORANGE = "#d29922";

// ── Typewriter helper ─────────────────────────────────────────────────────────
function typewriterSlice(text: string, frame: number, startFrame: number, speed = 2.5): string {
  const elapsed = Math.max(0, frame - startFrame);
  return text.slice(0, Math.floor(elapsed * speed));
}

function isTyping(text: string, frame: number, startFrame: number, speed = 2.5): boolean {
  return typewriterSlice(text, frame, startFrame, speed).length < text.length;
}

// ── TermLine: types one command line ─────────────────────────────────────────
interface TermLineProps {
  text: string;
  startFrame: number;
  color?: string;
  promptColor?: string;
  prompt?: string;
  speed?: number;
}
const TermLine: React.FC<TermLineProps> = ({
  text, startFrame, color = CMD_WHITE,
  promptColor = PROMPT_GREEN, prompt = "$", speed = 2.5,
}) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;
  const displayed = typewriterSlice(text, frame, startFrame, speed);
  const blinkOn = Math.floor(frame / 6) % 2 === 0;
  const typing = isTyping(text, frame, startFrame, speed);
  return (
    <div style={{ fontFamily: "monospace", fontSize: 22, lineHeight: 1.85, display: "flex", alignItems: "center" }}>
      <span style={{ color: promptColor, marginRight: 10, flexShrink: 0, fontWeight: 700 }}>{prompt}</span>
      <span style={{ color }}>{displayed}</span>
      {typing && blinkOn && (
        <span style={{ color: GREEN, marginLeft: 1 }}>▋</span>
      )}
    </div>
  );
};

// ── StaticLine: appears instantly (for output) ────────────────────────────────
interface StaticLineProps {
  text: string;
  startFrame: number;
  color?: string;
  indent?: number;
}
const StaticLine: React.FC<StaticLineProps> = ({ text, startFrame, color = OUTPUT_DIM, indent = 0 }) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;
  const opacity = Math.min(1, (frame - startFrame) / 4);
  return (
    <div style={{
      fontFamily: "monospace", fontSize: 20, lineHeight: 1.75, color, opacity,
      paddingLeft: indent * 24,
    }}>
      {text}
    </div>
  );
};

// ── CommentLine: # style comment ──────────────────────────────────────────────
const CommentLine: React.FC<{ text: string; startFrame: number }> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;
  const opacity = Math.min(1, (frame - startFrame) / 6);
  return (
    <div style={{ fontFamily: "monospace", fontSize: 19, lineHeight: 1.75, color: OUTPUT_DIM, opacity, fontStyle: "italic" }}>
      {text}
    </div>
  );
};

// ── Terminal window ────────────────────────────────────────────────────────────
const Terminal: React.FC<{ children: React.ReactNode; title?: string; maxHeight?: number }> = ({
  children, title = "bash — ~/my-project", maxHeight = 700,
}) => (
  <div style={{
    background: TERM_BG, borderRadius: 12, border: `1px solid ${BORDER}`,
    boxShadow: "0 20px 80px rgba(0,0,0,0.7)", overflow: "hidden", width: "100%", maxWidth: 1380,
  }}>
    {/* title bar */}
    <div style={{
      background: "#21262d", padding: "10px 18px", display: "flex", alignItems: "center", gap: 8,
      borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#ff5f57" }} />
      <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#febc2e" }} />
      <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#28c840" }} />
      <div style={{ flex: 1, textAlign: "center", fontFamily: "monospace", fontSize: 14, color: OUTPUT_DIM }}>{title}</div>
    </div>
    {/* body */}
    <div style={{ padding: "22px 28px", maxHeight, overflow: "hidden" }}>
      {children}
    </div>
  </div>
);

// ── FadeIn wrapper ────────────────────────────────────────────────────────────
const FadeIn: React.FC<{ delay?: number; children: React.ReactNode; from?: number }> = ({
  delay = 0, children, from = 20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - delay;
  const opacity = elapsed < 0 ? 0 : Math.min(1, elapsed / 10);
  const y = elapsed < 0 ? from : interpolate(elapsed, [0, 15], [from, 0], { extrapolateRight: "clamp" });
  return <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Scene 1 — Hero (f 0–60)
// ═══════════════════════════════════════════════════════════════════════════════
const SceneHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const pulse = 1 + Math.sin(frame / 18) * 0.03;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, #111830 0%, ${BG} 65%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      {/* glow */}
      <div style={{
        position: "absolute", width: 560, height: 560, borderRadius: "50%",
        background: `radial-gradient(circle, ${BLUE}1a 0%, transparent 70%)`,
        transform: `scale(${pulse})`,
      }} />

      <div style={{
        transform: `scale(${scale})`, fontFamily: "monospace", fontSize: 108, fontWeight: 900,
        letterSpacing: -4,
        background: `linear-gradient(135deg, ${BLUE} 0%, ${PURPLE} 50%, ${CYAN} 100%)`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        jeo-code
      </div>

      <FadeIn delay={18}>
        <div style={{ fontFamily: "monospace", fontSize: 28, color: WHITE, opacity: 0.85, letterSpacing: 2 }}>
          The Harness Engine That Makes You a 10× AI Builder
        </div>
      </FadeIn>

      <FadeIn delay={32}>
        <div style={{
          display: "flex", gap: 24, fontFamily: "monospace", fontSize: 18,
        }}>
          {[
            { label: "TypeScript", color: BLUE },
            { label: "Bun-based", color: GREEN },
            { label: "136 Skills", color: GOLD },
            { label: "Multi-LLM", color: PURPLE },
          ].map(({ label, color }) => (
            <span key={label} style={{
              background: `${color}18`, border: `1px solid ${color}55`,
              borderRadius: 8, padding: "5px 16px", color,
            }}>{label}</span>
          ))}
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Scene 2 — Installation Terminal (f 0–150 relative, scene from=60)
// ═══════════════════════════════════════════════════════════════════════════════
const SceneInstall: React.FC = () => {
  return (
    <AbsoluteFill style={{
      background: BG, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 28, padding: "60px 80px",
    }}>
      <FadeIn delay={0}>
        <div style={{ fontFamily: "sans-serif", fontSize: 36, fontWeight: 800, color: WHITE, marginBottom: 8, textAlign: "center" }}>
          🚀 Installation — Two Ways
        </div>
      </FadeIn>

      <Terminal title="bash — install jeo-code">
        {/* Method 1: Bun */}
        <CommentLine text="# ─── Method 1: Bun (recommended — fastest startup)" startFrame={8} />
        <TermLine text="bun install -g jeo-code" startFrame={16} />
        <StaticLine text="bun add v1.2.4 (fast)" startFrame={52} color={OUTPUT_DIM} />
        <StaticLine text="✓  jeo-code@1.2.4 installed → /usr/local/bin/jeo" startFrame={58} color={GREEN} />

        {/* spacer */}
        <StaticLine text="" startFrame={64} />

        {/* Method 2: npm */}
        <CommentLine text="# ─── Method 2: npm (universal Node.js environment)" startFrame={66} />
        <TermLine text="npm install -g jeo-code" startFrame={74} />
        <StaticLine text="added 1 package, audited 1 package in 4s" startFrame={110} color={OUTPUT_DIM} />
        <StaticLine text="✓  jeo → /usr/local/bin/jeo" startFrame={116} color={GREEN} />

        <StaticLine text="" startFrame={120} />

        {/* LLM provider setup */}
        <CommentLine text="# ─── Connect your LLM provider (Anthropic / OpenAI / Gemini / Ollama)" startFrame={122} />
        <TermLine text="jeo doctor" startFrame={130} color={CMD_WHITE} />
        <StaticLine text="  ✓  Bun runtime      v1.2.4" startFrame={152} color={GREEN} />
        <StaticLine text="  ✓  Anthropic API     connected (claude-opus-4-5)" startFrame={158} color={GREEN} />
        <StaticLine text="  ○  OpenAI API        not configured  →  jeo /provider login openai" startFrame={164} color={ORANGE} />
        <StaticLine text="  ○  Gemini API        not configured  →  jeo /provider login gemini" startFrame={170} color={ORANGE} />
        <StaticLine text="  ○  Ollama            not running     →  ollama serve" startFrame={176} color={ORANGE} />
        <StaticLine text="  ✓  jeo-skills        136 skills loaded  (~/.agents/skills/)" startFrame={182} color={GREEN} />
      </Terminal>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Scene 3 — jeo in action (f 0–120 relative, scene from=210)
// ═══════════════════════════════════════════════════════════════════════════════
const SceneRun: React.FC = () => {
  return (
    <AbsoluteFill style={{
      background: BG, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 24, padding: "50px 80px",
    }}>
      <FadeIn delay={0}>
        <div style={{ fontFamily: "sans-serif", fontSize: 36, fontWeight: 800, color: WHITE, marginBottom: 4, textAlign: "center" }}>
          ⚡ jeo Agent Loop In Action
        </div>
      </FadeIn>

      <Terminal title="bash — ~/my-project — jeo agent">
        {/* Launch */}
        <TermLine text="cd my-project && jeo" startFrame={5} />
        <StaticLine text="" startFrame={28} />
        <StaticLine text="  ╔══════════════════════════════════════════╗" startFrame={30} color={BLUE} />
        <StaticLine text="  ║   jeo  v1.2.4  •  claude-opus-4-5       ║" startFrame={32} color={BLUE} />
        <StaticLine text="  ║   136 skills loaded  •  .jeo/ state on   ║" startFrame={34} color={BLUE} />
        <StaticLine text="  ╚══════════════════════════════════════════╝" startFrame={36} color={BLUE} />
        <StaticLine text="" startFrame={38} />

        {/* User intent */}
        <TermLine
          text="implement OAuth2 login with refresh tokens + session persistence"
          startFrame={40}
          prompt=">"
          promptColor={CYAN}
          speed={3.5}
        />

        <StaticLine text="" startFrame={80} />

        {/* deep-interview */}
        <StaticLine text="🤔 [deep-interview]  Socratic gate — clarifying 3 things..." startFrame={82} color={PURPLE} />
        <StaticLine text="    Q1: Token storage — httpOnly cookie or localStorage?" startFrame={88} color={OUTPUT_DIM} />
        <StaticLine text="    Q2: Refresh window — silent refresh or explicit TTL?" startFrame={92} color={OUTPUT_DIM} />
        <StaticLine text="    Q3: Multi-device logout required?" startFrame={96} color={OUTPUT_DIM} />
        <StaticLine text="    → Requirements crystallized ✓" startFrame={102} color={GREEN} />

        {/* ralplan */}
        <StaticLine text="" startFrame={104} />
        <StaticLine text="📋 [ralplan]  Blueprint: 4 phases  •  critic signed [OKAY] ✓" startFrame={106} color={GOLD} />

        {/* team */}
        <StaticLine text="" startFrame={110} />
        <StaticLine text="🚀 [team]  Spawning 3 executor agents..." startFrame={112} color={CYAN} />
        <StaticLine text="    [agent-1] ✅  src/auth/oauth2.ts" startFrame={116} color={GREEN} />
        <StaticLine text="    [agent-2] ✅  src/auth/tokens.ts + refresh logic" startFrame={119} color={GREEN} />
        <StaticLine text="    [agent-3] ✅  tests/auth.spec.ts  (18 tests, all pass)" startFrame={122} color={GREEN} />

        {/* ultragoal */}
        <StaticLine text="" startFrame={126} />
        <StaticLine text="🎯 [ultragoal]  5/5 acceptance criteria PASS  — task DONE" startFrame={128} color={GREEN} />
      </Terminal>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Scene 4 — Skills terminal (f 0–90 relative, scene from=330)
// ═══════════════════════════════════════════════════════════════════════════════
const SceneSkills: React.FC = () => {
  return (
    <AbsoluteFill style={{
      background: BG, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 24, padding: "50px 80px",
    }}>
      <FadeIn delay={0}>
        <div style={{ fontFamily: "sans-serif", fontSize: 36, fontWeight: 800, color: WHITE, marginBottom: 4, textAlign: "center" }}>
          📦 136 Skills — One Command Away
        </div>
      </FadeIn>

      <Terminal title="bash — jeo-skills in action">
        {/* Install skills */}
        <CommentLine text="# Install all 136 skills from jeo-skills" startFrame={5} />
        <TermLine text='git clone https://github.com/akillness/jeo-skills && bash jeo-skills/install.sh' startFrame={12} speed={4} />
        <StaticLine text="  ✓  136 skills installed  →  ~/.agents/skills/" startFrame={45} color={GREEN} />
        <StaticLine text="" startFrame={48} />

        {/* Run a skill */}
        <CommentLine text="# Invoke any skill by name with $skill prefix" startFrame={50} />
        <TermLine
          text='jeo "$scrapling fetch https://github.com/akillness/jeo-code"'
          startFrame={58}
          speed={3.5}
        />
        <StaticLine text="  ▶  [scrapling]  mode: plain HTTP fetcher (lightest path)" startFrame={85} color={CYAN} />
        <StaticLine text="  ▶  Fetching README + package.json..." startFrame={90} color={OUTPUT_DIM} />
        <StaticLine text="  ✓  Content parsed: 842 tokens" startFrame={95} color={GREEN} />
        <StaticLine text="" startFrame={98} />

        {/* Skills list */}
        <CommentLine text="# See your full skill library" startFrame={100} />
        <TermLine text="ls ~/.agents/skills/ | head -8" startFrame={108} />
        <StaticLine text="  autoresearch    bmad          clawteam      deep-dive" startFrame={128} color={BLUE} />
        <StaticLine text="  graphify        llm-wiki      omx           plannotator" startFrame={131} color={BLUE} />
        <StaticLine text="  remotion-video  scrapling     team          ultragoal" startFrame={134} color={BLUE} />
        <StaticLine text="  ... 124 more  (136 total)" startFrame={137} color={OUTPUT_DIM} />
      </Terminal>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Scene 5 — CTA (f 0–60 relative, scene from=420)
// ═══════════════════════════════════════════════════════════════════════════════
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at bottom, #1a0a3a 0%, ${BG} 60%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32,
    }}>
      <div style={{
        transform: `scale(${scale})`, fontFamily: "sans-serif", fontSize: 68, fontWeight: 900,
        color: WHITE, textAlign: "center", lineHeight: 1.2,
      }}>
        Become a{" "}
        <span style={{
          background: `linear-gradient(135deg, ${BLUE}, ${PURPLE}, ${GOLD})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          10× AI Builder
        </span>
      </div>

      <FadeIn delay={18}>
        <div style={{ display: "flex", gap: 28 }}>
          {[
            { icon: "⭐", label: "jeo-code", sub: "bun install -g jeo-code", color: BLUE },
            { icon: "🚀", label: "jeo-skills", sub: "136 battle-tested skills", color: GOLD },
          ].map(({ icon, label, sub, color }) => (
            <div key={label} style={{
              background: `${color}18`, border: `2px solid ${color}`,
              borderRadius: 18, padding: "22px 44px", textAlign: "center",
              boxShadow: `0 0 30px ${color}33`,
            }}>
              <div style={{ fontSize: 28, fontFamily: "monospace", fontWeight: 900, color }}>{icon} {label}</div>
              <div style={{ fontFamily: "monospace", fontSize: 17, color: OUTPUT_DIM, marginTop: 6 }}>{sub}</div>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={32}>
        <div style={{ fontFamily: "monospace", fontSize: 22, color: CYAN, letterSpacing: 1 }}>
          github.com/akillness/jeo-code  ·  github.com/akillness/jeo-skills
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Root composition  (total 480 frames = 16s @ 30fps)
// ═══════════════════════════════════════════════════════════════════════════════
export const JeoPromo: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    {/* Scene 1: Hero        0 – 60  (2s)  */}
    <Sequence from={0} durationInFrames={60}>
      <SceneHero />
    </Sequence>

    {/* Scene 2: Install    60 – 260 (6.7s) */}
    <Sequence from={60} durationInFrames={200}>
      <SceneInstall />
    </Sequence>

    {/* Scene 3: Run       260 – 410 (5s) */}
    <Sequence from={260} durationInFrames={150}>
      <SceneRun />
    </Sequence>

    {/* Scene 4: Skills    410 – 560 (5s) */}
    <Sequence from={410} durationInFrames={150}>
      <SceneSkills />
    </Sequence>

    {/* Scene 5: CTA       560 – 630 (2.3s) */}
    <Sequence from={560} durationInFrames={70}>
      <SceneCTA />
    </Sequence>
  </AbsoluteFill>
);
