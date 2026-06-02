"use strict";

// シナリオは仕様どおり、シーンIDをキーにしたデータとして管理します。
const script = {
  start: {
    text: "前方から15万文字の長文津波がマッハ20で接近中だお！防具はパジャマ姿（初期状態）！どうするお！？",
    choices: [
      {
        text: "【1】右へ全速スクロール！",
        nextScene: "koyubi_death"
      },
      {
        text: "【2】シークレットモード起動！",
        nextScene: "secret_route"
      },
      {
        text: "【3】全裸正座で受け止める！",
        nextScene: "mizoochi_death"
      }
    ]
  },

  secret_route: {
    text: "ステルス成功！…と思いきや、労基タコちゃんがポップアップ侵入！50トンの書類を落としてきたお！",
    choices: [
      {
        text: "【1】パジャマを脱ぎ捨てる",
        nextScene: "all_naked_death"
      },
      {
        text: "【2】右ひじで弾き返す！",
        nextScene: "funny_bone_death"
      },
      {
        text: "【3】F5キーを連打してリロード！",
        nextScene: "biteikotsu_death"
      }
    ]
  },

  koyubi_death: {
    text: "それがし船長は右へ全速スクロールした！しかし横スクロールバーの終端に小指を強打！小指は404 Not Foundになり、船長は静かにログアウトした。",
    deathReason: "死亡理由：小指が横スクロールバー終端に激突して404化",
    gameOver: true
  },

  mizoochi_death: {
    text: "全裸正座の覚悟は完璧だった！だが長文津波の1文字目「前」が、みぞおちにHTTP 500級の直撃！船長の呼吸プロセスは強制終了された。",
    deathReason: "死亡理由：みぞおちへHTTP 500級の文字圧が直撃",
    gameOver: true
  },

  all_naked_death: {
    text: "パジャマを脱ぎ捨てた瞬間、セキュリティ設定が『防御力：null』を検出！船長はキャッシュの冷気でフリーズし、そのまま全裸例外として処理された。",
    deathReason: "死亡理由：防御力null判定により全裸例外でフリーズ",
    gameOver: true
  },

  funny_bone_death: {
    text: "右ひじで50トンの書類を弾いた！その衝撃はファニーボーンに直行し、ジジジジジジーーーーーン！！という通知音だけが社内チャットに残った。",
    deathReason: "死亡理由：右ひじ（ファニーボーン）に50トン書類の反動が集中",
    gameOver: true
  },

  biteikotsu_death: {
    text: "F5で世界はリロードされた！が、再構築ミスで生まれた1pxのポリゴンが船長のノーマークな尾てい骨にピンポイントストライク！！！",
    deathReason: "死亡理由：リロード後の1pxポリゴンが尾てい骨へ直撃",
    gameOver: true,
    layoutShift: true
  }
};

const sceneText = document.getElementById("sceneText");
const choices = document.getElementById("choices");
const gameWindow = document.getElementById("gameWindow");
const crashScreen = document.getElementById("crashScreen");

let currentSceneId = "start";
let currentScene = script.start;
let audioContext = null;

// 指定されたシーンを表示し、必要なら演出とゲームオーバー処理を起動します。
function showScene(sceneId) {
  const scene = script[sceneId];

  if (!scene) {
    sceneText.textContent = "存在しないシーンに漂着したお！";
    choices.innerHTML = "";
    return;
  }

  currentSceneId = sceneId;
  currentScene = scene;
  sceneText.textContent = scene.text;

  if (scene.layoutShift) {
    triggerLayoutShift();
    playSound("reload");
  }

  if (scene.gameOver) {
    playSound("hit");
    showGameOver();
    return;
  }

  renderChoices();
}

// 現在のシーンデータから選択肢ボタンを生成します。
function renderChoices() {
  choices.innerHTML = "";

  currentScene.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = choice.text;

    button.addEventListener("click", () => {
      playSound("button");
      showScene(choice.nextScene);
    });

    choices.appendChild(button);
  });
}

// 音声ファイルを使わず、Web Audio APIの発振器で効果音を作ります。
function playSound(type) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const patterns = {
    button: [
      { frequency: 520, duration: 0.05, delay: 0, wave: "square", volume: 0.12 },
      { frequency: 760, duration: 0.05, delay: 0.055, wave: "square", volume: 0.09 }
    ],
    reload: [
      { frequency: 880, duration: 0.07, delay: 0, wave: "sawtooth", volume: 0.1 },
      { frequency: 640, duration: 0.08, delay: 0.08, wave: "sawtooth", volume: 0.09 },
      { frequency: 420, duration: 0.11, delay: 0.17, wave: "sawtooth", volume: 0.08 }
    ],
    hit: [
      { frequency: 120, duration: 0.12, delay: 0, wave: "sawtooth", volume: 0.18 },
      { frequency: 90, duration: 0.22, delay: 0.08, wave: "square", volume: 0.1 },
      { frequency: 65, duration: 0.35, delay: 0.16, wave: "sawtooth", volume: 0.08 }
    ]
  };

  const notes = patterns[type] || patterns.button;
  notes.forEach((note) => scheduleTone(note));
}

// 1音ぶんの発音を予約します。
function scheduleTone(note) {
  const startTime = audioContext.currentTime + note.delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = note.wave;
  oscillator.frequency.setValueAtTime(note.frequency, startTime);
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(note.volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + note.duration + 0.03);
}

// ゲームオーバー画面を表示し、ランダムで偽クラッシュ画面を挟みます。
function showGameOver() {
  choices.innerHTML = "";

  const title = document.createElement("h2");
  title.className = "game-over-title";
  title.textContent = "GAME OVER";

  const reason = document.createElement("p");
  reason.className = "death-reason";
  reason.textContent = currentScene.deathReason || "死亡理由：それがし船長、原因不明のバグで沈没";

  const restartButton = document.createElement("button");
  restartButton.type = "button";
  restartButton.className = "restart-button";
  restartButton.textContent = "もう一度挑戦する";
  restartButton.addEventListener("click", restartGame);

  choices.append(title, reason, restartButton);

  if (Math.random() < 0.42) {
    showCrashScreen();
  }
}

// クラッシュ画面は一瞬だけ表示し、ゲームオーバー画面へ戻します。
function showCrashScreen() {
  crashScreen.classList.add("visible");
  crashScreen.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    crashScreen.classList.remove("visible");
    crashScreen.setAttribute("aria-hidden", "true");
  }, 1500);
}

// リロードイベント用のレイアウトシフト演出です。
function triggerLayoutShift() {
  gameWindow.classList.remove("layout-shift");
  void gameWindow.offsetWidth;
  gameWindow.classList.add("layout-shift");
}

// スタート地点へ戻して再挑戦できるようにします。
function restartGame() {
  crashScreen.classList.remove("visible");
  crashScreen.setAttribute("aria-hidden", "true");
  playSound("button");
  showScene("start");
}

showScene(currentSceneId);
