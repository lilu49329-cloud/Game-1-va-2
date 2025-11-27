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

// Giữ tham chiếu game để tránh tạo nhiều lần (HMR, reload, event lặp…)
let game: Phaser.Game | null = null;

// ================== CẤU HÌNH PHASER ==================
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720, // 16:9

  // Tăng độ nét trên màn hình retina / dpr cao
  // resolution: window.devicePixelRatio || 1,

  parent: containerId,
  backgroundColor: "#ffffff",

  scale: {
    mode: Phaser.Scale.FIT, // Canvas tự fit vào container
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  render: {
    pixelArt: false, // UI / illustration mượt hơn, không bị "pixel hóa" nút
    antialias: true, // bật làm mịn vector / texture
    transparent: true,
  },

  scene: [OverlayScene, GameScene, EndGameScene],
};

// ================== SETUP CONTAINER HTML ==================
// function setupContainer() {
//   if (!container) return;

//   document.documentElement.style.margin = '0';
//   document.documentElement.style.padding = '0';
//   document.body.style.margin = '0';
//   document.body.style.padding = '0';

//   container.style.position = 'fixed';
//   container.style.inset = '0';
//   container.style.margin = '0';
//   container.style.padding = '0';
//   container.style.display = 'flex';
//   container.style.justifyContent = 'center';
//   container.style.alignItems = 'center';
//   container.style.background = 'transparent';
//   container.style.boxSizing = 'border-box';
//   container.style.overflow = 'hidden';
// }

//================== CHỜ FONT FREDOKA ==================
function waitForFredoka(): Promise<void> {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();

  return new Promise<void>((resolve) => {
    let done = false;

    // Thử load font
    document.fonts.load('400 20px "Fredoka"').then(() => {
      if (!done) {
        done = true;
        resolve();
      }
    });

    // Timeout sau 150ms để không chờ quá lâu
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
  //setupContainer();

  try {
    await waitForFredoka();
  } catch (e) {
    console.warn('Không load kịp font Fredoka, chạy game luôn.');
  }

  // Tránh tạo game nhiều lần (quan trọng khi dev + HMR)
  if (!game) {
    game = new Phaser.Game(config);
  }

  // Tối ưu canvas hiển thị sau khi Phaser tạo xong
  setTimeout(() => {
    const canvas =
      document.querySelector<HTMLCanvasElement>("#game-container canvas");
    if (canvas) {
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      canvas.style.display = "block";
      // Để browser tự nội suy, tránh ép 'pixelated' làm vỡ nút/icon mềm
      canvas.style.imageRendering = "auto";
    }
  }, 50);
}

document.addEventListener("DOMContentLoaded", initGame);
