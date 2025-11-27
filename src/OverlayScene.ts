// OverlayScene.ts – bản dùng CONTAIN: không cắt chữ, không blur
import { preloadIntroAssets, preloadGameAssets } from "./assetLoader";
import Phaser from "phaser";

export default class OverlayScene extends Phaser.Scene {
  bgm?: Phaser.Sound.BaseSound;
  _started?: boolean;
  private gameAssetsReady = false;// theo dõi đã load asset game chưa 

  constructor() {
    super({ key: "OverlayScene" });
  }

  preload(): void {
  const cam = this.cameras.main;
  const width = cam.width;
  const height = cam.height;

  console.log("🟦 PRELOAD start – screen:", width, height);

  // Màu nền tạm trong lúc load
  cam.setBackgroundColor("#e5f5ff");

  // Chỉ load asset intro, KHÔNG tạo thanh loading nữa
  preloadIntroAssets(this);
}

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    

    console.log("🟦 CREATE start – screen:", width, height);
    console.log("Texture check btn_start:", this.textures.exists("btn_start"));

    // ========== BACKGROUND – CONTAIN, KHÔNG CẮT CHỮ ==========
    const bgKeys = [
        "intro_bg_1",
        "intro_bg_2",
        "intro_bg_3",
    
    ];

    const chosenBG = Phaser.Utils.Array.GetRandom(bgKeys);
    console.log("🎨 Chosen background:", chosenBG);

    const texObj = this.textures.get(chosenBG);
    // texObj.setFilter(Phaser.Textures.FilterMode.NEAREST); // không blur

    const src = texObj.getSourceImage() as HTMLImageElement;
    const bgW = src.width;
    const bgH = src.height;

    // ENVELOP: phủ kín canvas, chấp nhận crop
    const bgScale = Math.max(width / bgW, height / bgH);
    const VERTICAL_BIAS = 0.05;
    // Căn giữa ngang, dính sát mép trên → nếu thừa chiều cao thì cắt phía dưới
    const bgIntro = this.add
      .image(width / 2, height / 2 + height * VERTICAL_BIAS, chosenBG)
      .setOrigin(0.5, 0.5)
      .setScale(bgScale)
      .setDepth(-999)
      .setScrollFactor(0);
      

    // Nếu ảnh cao hơn canvas (bị crop dọc), mặc định crop đều trên/dưới.
    // Dời ảnh xuống để ưu tiên giữ nguyên phần trên (chữ, mây),
    // nếu phải cắt thì cắt phía dưới nhiều hơn.

    // Log chi tiết kích thước & vị trí để debug lệch hình
    const canvas = this.game.canvas;
    const bounds = canvas.getBoundingClientRect();
    const scaleManager = this.scale;

    console.log("INTRO BG:", {
        chosenBG,
        bgW,
        bgH,
        displayW: bgIntro.displayWidth,
        displayH: bgIntro.displayHeight,
        scale: bgScale,
        posX: bgIntro.x,
        posY: bgIntro.y,
    });

    console.log("CANVAS bounds:", {
        canvasW: canvas.width,
        canvasH: canvas.height,
        clientW: bounds.width,
        clientH: bounds.height,
        left: bounds.left,
        top: bounds.top,
    });

    console.log("SCALE manager:", {
        gameSize: { w: scaleManager.gameSize.width, h: scaleManager.gameSize.height },
        displaySize: { w: scaleManager.displaySize.width, h: scaleManager.displaySize.height },
        parentSize: { w: scaleManager.parentSize.width, h: scaleManager.parentSize.height },
        zoom: scaleManager.zoom,
        scaleMode: scaleManager.scaleMode,
    });
     // ========== PRELOAD GAME ASSETS NGẦM ==========
    // Sau khi intro đã hiện, bắt đầu load toàn bộ asset game ở background.
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

        // Nếu asset game chưa load xong, bạn có thể chặn hoặc cho phép nhưng hiển thị log.
        if (!this.gameAssetsReady) {
          console.log("⏳ Game assets still loading...");
          // Option A: chặn, đợi load xong rồi mới start
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
    const DESIGN_W = 2160;
    const DESIGN_H = 1620;

    const uiScale = Math.min(width / DESIGN_W, height / DESIGN_H);
    console.log("UI scale:", uiScale);

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

    // (tuỳ chọn) thêm dòng text hướng dẫn dưới nút
    }
}
