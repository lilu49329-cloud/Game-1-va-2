// OverlayScene.ts – canvas trong suốt, BG nằm ở viewport
import { preloadIntroAssets, preloadGameAssets } from "./assetLoader";
import Phaser from "phaser";

export default class OverlayScene extends Phaser.Scene {
  bgm?: Phaser.Sound.BaseSound;
  _started?: boolean;
  private gameAssetsReady = false; // theo dõi đã load asset game chưa

  constructor() {
    super({ key: "OverlayScene" });
  }

  preload(): void {
    const cam = this.cameras.main;
    const width = cam.width;
    const height = cam.height;

    console.log("🟦 PRELOAD start – screen:", width, height);

    // KHÔNG setBackgroundColor để canvas giữ trong suốt
    // cam.setBackgroundColor("#e5f5ff");

    // Chỉ load asset intro, KHÔNG tạo thanh loading nữa
    preloadIntroAssets(this);
  }

  create(): void {
    // Random background viewport (ngoài canvas) cho màn intro
    (window as any).setRandomIntroViewportBg?.();

    const width = this.scale.width;
    const height = this.scale.height;

    // Dùng chung cho UI + character
    const DESIGN_W = 2160;
    const DESIGN_H = 1620;
    const uiScale = Math.min(width / DESIGN_W, height / DESIGN_H);
    console.log("UI scale:", uiScale);

    console.log("🟦 CREATE start – screen:", width, height);
    console.log("Texture check btn_start:", this.textures.exists("btn_start"));

    // ========== KHÔNG VẼ BACKGROUND TRONG CANVAS ==========
    // Không còn bgIntro phủ kín canvas nữa.

    // ========== CHARACTER – RANDOM 2 SPRITES ==========
    const charKeys = ["intro_char_1", "intro_char_2"];
    const chosenChar = Phaser.Utils.Array.GetRandom(charKeys);
    console.log("🎭 Chosen character:", chosenChar);

    this.add
      .image(width * 0.5, height * 0.93, chosenChar)
      .setOrigin(0.5, 1)
      .setScale(uiScale * 1.2)
      .setDepth(-998)
      .setScrollFactor(0);

    // ========== TITLE TÁCH RIÊNG ==========
    this.add
      .image(width * 0.5, height * 0.18, "intro_title")
      .setOrigin(0.5, 0.5)
      .setScale(uiScale)
      .setDepth(-997)
      .setScrollFactor(0);

    // ========== PRELOAD GAME ASSETS NGẦM ==========
    this.load.reset();
    preloadGameAssets(this);
    this.load.once("complete", () => {
      console.log("✅ Game assets preloaded in background");
      this.gameAssetsReady = true;
    });
    this.load.start();

    // ========== MUSIC ==========
    let bgm = this.sound.get("bgm_main") as Phaser.Sound.BaseSound | null;
    if (!bgm) {
      bgm = this.sound.add("bgm_main", { loop: true, volume: 0.28 });
    }
    this.bgm = bgm;

    const startGame = () => {
      console.log("▶️ Start Game triggered");
      if (this._started) return;
      this._started = true;

      if (!this.gameAssetsReady) {
        console.log("⏳ Game assets still loading...");
        this.load.once("complete", () => {
          this.scene.start("GameScene", { level: 0 });
        });
        return;
      }

      if (this.bgm && !this.bgm.isPlaying) this.bgm.play();
      this.sound.play("voice_intro", { volume: 1 });

      this.scene.start("GameScene", { level: 0 });
    };

    // ========== START BUTTON ==========
    const startY = height * 0.8;
    console.log("Button Y position:", startY);

    const startButton = this.add
      .image(width / 2, startY, "btn_start")
      .setOrigin(0.5)
      .setScale(uiScale * 1.25)
      .setDepth(999)
      .setInteractive({ useHandCursor: true });

    console.log("Button created:", {
      x: startButton.x,
      y: startButton.y,
      scale: startButton.scale,
      visible: startButton.visible,
      alpha: startButton.alpha,
    });

    startButton.on("pointerdown", startGame);

    startButton.on("pointerover", () => {
      startButton.setScale(uiScale * 1.33);
    });

    startButton.on("pointerout", () => {
      startButton.setScale(uiScale * 1.25);
    });
  }
}
