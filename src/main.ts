import Phaser from "phaser";
import OverlayScene from "./OverlayScene";
import GameScene from "./GameScene";
import EndGameScene from "./EndGameScene";

// ================== TẠO CONTAINER GAME ==================
const containerId = "game-container";
let container = document.getElementById(containerId);
if (!container) {
  container = document.createElement("div");
  container.id = containerId;
  document.body.appendChild(container);
}

// ================== CSS CHO HTML & BODY ==================
const root = document.documentElement;

root.style.margin = "0";
root.style.padding = "0";
root.style.width = "100%";
root.style.height = "100%";

document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.width = "100%";
document.body.style.height = "100%";

// ========== RANDOM BACKGROUND VIEWPORT ==========
const INTRO_VIEWPORT_BGS = [
  "assets/intro/bge1.webp",
  "assets/intro/bge2.webp",
  "assets/intro/bge3.webp",
  "assets/intro/bge4.webp",
  "assets/intro/bge5.webp",
  "assets/intro/bge6.webp",
  "assets/intro/bge7.webp",
];

const GAME_VIEWPORT_BGS = [
  "assets/bg/bg1.webp",
  "assets/bg/bg2.webp",
  "assets/bg/bg3.webp",
  "assets/bg/bg4.webp",
  "assets/bg/bg5.webp",
  "assets/bg/bg6.webp",
  "assets/bg/bg7.webp",
];

const END_VIEWPORT_BGS = [
  "assets/bg/bg1.webp",
  "assets/bg/bg2.webp",
];

function setViewportBg(url: string) {
  document.body.style.backgroundImage = `url("${url}")`;
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.boxSizing = "border-box";
}

export function setRandomIntroViewportBg() {
  const url =
    INTRO_VIEWPORT_BGS[Math.floor(Math.random() * INTRO_VIEWPORT_BGS.length)];
  setViewportBg(url);
}

export function setRandomGameViewportBg() {
  const url =
    GAME_VIEWPORT_BGS[Math.floor(Math.random() * GAME_VIEWPORT_BGS.length)];
  setViewportBg(url);
}

export function setRandomEndViewportBg() {
  const url =
    END_VIEWPORT_BGS[Math.floor(Math.random() * END_VIEWPORT_BGS.length)];
  setViewportBg(url);
}

// ========== HIỆN / ẨN NÚT VIEWPORT ==========
function setGameButtonsVisible(visible: boolean) {
  const replayBtn = document.getElementById("btn-replay") as HTMLButtonElement | null;
  const nextBtn = document.getElementById("btn-next") as HTMLButtonElement | null;
  const display = visible ? "block" : "none";
  if (replayBtn) replayBtn.style.display = display;
  if (nextBtn) nextBtn.style.display = display;
}

// Cho các Scene gọi qua window
(Object.assign(window as any, {
  setRandomIntroViewportBg,
  setRandomGameViewportBg,
  setRandomEndViewportBg,
  setGameButtonsVisible,
}));

// ================== CSS CHO CONTAINER (TRONG SUỐT) ==================
if (container instanceof HTMLDivElement) {
  container.style.position = "fixed";
  container.style.inset = "0"; // full màn hình
  container.style.margin = "0";
  container.style.padding = "0";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.overflow = "hidden";
  container.style.boxSizing = "border-box";

  // rất quan trọng: container không có background, để lộ background của body
  container.style.background = "transparent";
}

// Giữ tham chiếu game để tránh tạo nhiều lần (HMR, reload…)
let game: Phaser.Game | null = null;

// ================== CẤU HÌNH PHASER ==================
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720, // 16:9

  parent: containerId,

  // Canvas trong suốt để nhìn thấy background của body
  transparent: true,

  scale: {
    mode: Phaser.Scale.FIT, // Canvas tự fit vào container
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  render: {
    pixelArt: false,
    antialias: true,
  },

  scene: [OverlayScene, GameScene, EndGameScene],
};

// ================== KẾT NỐI NÚT HTML (ngoài Phaser) ==================
function setupHtmlButtons() {
  const replayBtn = document.getElementById("btn-replay");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      if (!game) return;
      const scene = game.scene.getScene("GameScene") as GameScene;
      if (!scene) return;
      scene.scene.restart({ level: scene.level });
    });
  }

  const nextBtn = document.getElementById("btn-next");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!game) return;
      const scene = game.scene.getScene("GameScene") as GameScene;
      if (!scene) return;

      if (!scene.isLevelComplete()) {
        scene.sound.play("voice_need_finish");
        return;
      }

      const nextIndex = scene.level + 1;
      if (nextIndex >= scene.levels.length) {
        scene.scene.start("EndGameScene");
      } else {
        scene.scene.restart({ level: nextIndex });
      }
    });
  }

  // Mặc định ẩn nút (intro, endgame)
  setGameButtonsVisible(false);
}

// ================== CHỜ FONT FREDOKA ==================
function waitForFredoka(): Promise<void> {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();

  return new Promise<void>((resolve) => {
    let done = false;

    document.fonts.load('400 20px "Fredoka"').then(() => {
      if (!done) {
        done = true;
        resolve();
      }
    });

    // Timeout ngắn để không chờ quá lâu
    setTimeout(() => {
      if (!done) {
        done = true;
        resolve();
      }
    }, 10);
  });
}

// ================== KHỞI TẠO GAME ==================
async function initGame() {
  try {
    await waitForFredoka();
  } catch (e) {
    console.warn("Không load kịp font Fredoka, chạy game luôn.");
  }

  // Tránh tạo game nhiều lần
  if (!game) {
    // Lần đầu vào, set bg cho intro
    setRandomIntroViewportBg();
    game = new Phaser.Game(config);
    setupHtmlButtons(); // gắn listener cho nút HTML sau khi game tồn tại
  }

  // Tối ưu canvas hiển thị sau khi Phaser tạo xong
  setTimeout(() => {
    const canvas =
      document.querySelector<HTMLCanvasElement>("#game-container canvas");
    if (canvas) {
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      canvas.style.display = "block";
      canvas.style.imageRendering = "auto";
      canvas.style.backgroundColor = "transparent";
    }
  }, 50);
}

document.addEventListener("DOMContentLoaded", initGame);
