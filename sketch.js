let video;
let handPose;
let hands = [];
let font;
let magnets = [];
let lines;
let questions = [];
let currentQuestion;
let isQuestionEnglish = true;
let englishScore = 0;

let targetColor;

let score = 0;
let colorBestScore = 0;
let englishBestScore = 0;

let timeLeft = 30;
let lastTime = 0;

let tolerance = 120;
let camOn = true;

let scene = "menu";

let menuImg;
let settingsImg;
let achImg;

function preload() {
  menuImg = loadImage("pic/main/1.png");
  settingsImg = loadImage("pic/C/ca/3.png");
  achImg = loadImage("pic/A/ah/2.png");
  
  // 若您沒有 Outfit-Regular.ttf，請將 font 設為內建字型名稱以避免 404 錯誤
  font = 'sans-serif'; 
  lines = loadStrings("question/question.txt");
  handPose = ml5.handPose({flipped: true});
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 使用 flipped: true 以匹配手勢辨識視角
  video = createCapture(VIDEO, {flipped: true});
  video.size(width, height);
  video.hide();
  handPose.detectStart(video, gotHands);

  textAlign(CENTER, CENTER);

  // 讀取並解析 question.txt (格式預期為: 英文,中文)
  if (lines && lines.length > 0) {
    for (let i = 0; i < lines.length; i++) {
      let parts = lines[i].split(',');
      if (parts.length >= 2) {
        questions.push({ eng: parts[0].trim(), chi: parts[1].trim() });
      }
    }
  }
  // 若讀取不到題目或出錯，提供預設選項確保遊戲能運行
  if (questions.length === 0) {
    questions = [
      { eng: "Apple", chi: "蘋果" },
      { eng: "Dog", chi: "狗" },
      { eng: "Cat", chi: "貓" },
      { eng: "Book", chi: "書" }
    ];
  }

  pickNewColor();
  setupEnglishGame(); // 初始化中英文遊戲的題目
  lastTime = millis();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (video) {
    video.size(width, height);
  }
}

function draw() {

  switch (scene) {

    case "menu":
      drawMenu();
      break;

    case "colorGame":
      drawColorGame();
      break;

    case "englishGame":
      drawEnglishGame();
      break;

    case "settings":
      drawSettings();
      break;

    case "achievements":
      drawAchievements();
      break;

    case "help":
      drawHelp();
      break;
  }
}

//////////////////////////////////////////////////
// 主選單
//////////////////////////////////////////////////

function drawMenu() {
  image(menuImg, 0, 0, width, height);
}

//////////////////////////////////////////////////
// 顏色辨識遊戲
//////////////////////////////////////////////////

function drawColorGame() {

  if (camOn) {
    // 因為上方 createCapture 已設定 flipped: true，不需再手動翻轉
    image(video, 0, 0, width, height);
  } else {
    background(0);
  }

  if (timeLeft > 0) {
    playGame();
  } else {
    gameOver();
  }

  drawBackButton();
}

function playGame() {

  noFill();
  stroke(255, 0, 0);
  strokeWeight(4);

  rectMode(CENTER);

  rect(
    width / 2,
    height / 2,
    50,
    50
  );

  strokeWeight(2);

  line(
    width / 2 - 10,
    height / 2,
    width / 2 + 10,
    height / 2
  );

  line(
    width / 2,
    height / 2 - 10,
    width / 2,
    height / 2 + 10
  );

  let r = 0;
  let g = 0;
  let b = 0;

  if (camOn) {

    let c = video.get(
      video.width / 2,
      video.height / 2
    );

    r = c[0];
    g = c[1];
    b = c[2];
  }

  fill(0, 150);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, 90);

  fill(255);

  textSize(24);
  text(
    `分數: ${score}   剩餘時間: ${timeLeft}秒`,
    width / 2,
    30
  );

  textSize(20);

  text(
    "請尋找此顏色並對準中央：",
    width / 2 - 50,
    65
  );

  fill(targetColor);
  stroke(255);
  strokeWeight(2);

  circle(
    width / 2 + 120,
    65,
    30
  );

  fill(r, g, b);
  noStroke();

  circle(
    width / 2,
    height / 2 - 40,
    20
  );

  let tr = red(targetColor);
  let tg = green(targetColor);
  let tb = blue(targetColor);

  let d = dist(
    r,
    g,
    b,
    tr,
    tg,
    tb
  );

  if (d < tolerance && camOn) {

    score++;

    timeLeft = 30;

    pickNewColor();
  }

  if (millis() - lastTime >= 1000) {

    timeLeft--;

    lastTime = millis();
  }
}

function gameOver() {

  if (score > colorBestScore) {
    colorBestScore = score;
  }

  fill(0, 200);

  rectMode(CORNER);

  rect(
    0,
    0,
    width,
    height
  );

  fill(255);

  textSize(50);

  text(
    "時間到！",
    width / 2,
    height / 2 - 60
  );

  fill(255, 204, 0);

  textSize(30);

  text(
    `最終分數：${score}`,
    width / 2,
    height / 2
  );

  fill(255);

  textSize(20);

  text(
    "點擊畫面重新開始",
    width / 2,
    height / 2 + 60
  );
}

//////////////////////////////////////////////////
// 中英文對照（暫時空白）
//////////////////////////////////////////////////

function drawEnglishGame() {

  if (camOn) {
    image(video, 0, 0, width, height);
  } else {
    background(200);
  }

  if (font) textFont(font);

  // 繪製問題底框與文字
  fill(255, 200);
  rectMode(CENTER);
  rect(width / 2, height * 0.15, 400, 100, 15);

  fill(0);
  noStroke();
  textSize(36);
  let qText = isQuestionEnglish ? currentQuestion.eng : currentQuestion.chi;
  text("問題: " + qText, width / 2, height * 0.15);

  // 繪製分數
  textSize(24);
  fill(255);
  text("分數: " + englishScore, 80, 40);

  // 繪製指定位置 (作答區 Drop Zone)
  let dropZoneX = width / 2;
  let dropZoneY = height * 0.45;
  let dropZoneW = 200;
  let dropZoneH = 120;

  noFill();
  stroke(255, 204, 0);
  strokeWeight(4);
  rect(dropZoneX, dropZoneY, dropZoneW, dropZoneH, 15);
  fill(255, 204, 0);
  noStroke();
  textSize(20);
  text("將正確答案拖曳至此", dropZoneX, dropZoneY);

  // 顯示影片並偵測手勢 (Index 和 Thumb)
  if (hands.length > 0 && camOn) {
    let index = hands[0].keypoints[8];
    let thumb = hands[0].keypoints[4];

    noFill();
    stroke(0, 255, 0);
    strokeWeight(2);
    textSize(18);
    text("index", index.x, index.y - 20);
    text("thumb", thumb.x, thumb.y - 20);

    for (let i = 0; i < magnets.length; i++) {
      magnets[i].touch(thumb.x, thumb.y, index.x, index.y);
    }
  }

  let anyDragging = false;
  for (let i = magnets.length - 1; i >= 0; i--) {
    magnets[i].display();
    if (magnets[i].isDragging) anyDragging = true;
  }

  // 檢查是否將正確的方塊拖曳放進指定位置（鬆手時結算）
  if (!anyDragging) {
    for (let i = 0; i < magnets.length; i++) {
      let m = magnets[i];
      if (m.isCorrect) {
        // 判斷方塊中心點是否在指定的作答區內
        if (abs(m.x - dropZoneX) < dropZoneW / 2 && abs(m.y - dropZoneY) < dropZoneH / 2) {
          englishScore++;
          if (englishScore > englishBestScore) {
            englishBestScore = englishScore;
          }
          setupEnglishGame(); // 答對直接進入下一題
        }
      }
    }
  }

  drawBackButton();
}

//////////////////////////////////////////////////
// 設定
//////////////////////////////////////////////////

function drawSettings() {

  image(settingsImg, 0, 0, width, height);

  drawBackButton();
}

//////////////////////////////////////////////////
// 成就
//////////////////////////////////////////////////

function drawAchievements() {

  image(achImg, 0, 0, width, height);

  fill(0);
  textSize(45);
  text("成就紀錄", width * 0.75, height * 0.3);

  textSize(28);
  text("顏色辨識最高分：" + colorBestScore, width * 0.75, height * 0.45);
  text("中英文對照最高分：" + englishBestScore, width * 0.75, height * 0.55);

  drawBackButton();
}

//////////////////////////////////////////////////
// 說明
//////////////////////////////////////////////////

function drawHelp() {

  background(255);

  fill(0);

  textSize(42);

  text(
    "遊戲說明",
    width / 2,
    80
  );

  textSize(24);

  text(
`【顏色辨識】

畫面上方會出現目標顏色

請尋找相同顏色物體

並將它對準中央十字準星

成功即可得分


【中英文對照】

畫面上會隨機出現題目

請將答案雙指捏和後移至方框內

成功即可得分
`,
    width / 2,
    height / 2
  );

  drawBackButton();
}

//////////////////////////////////////////////////
// 返回按鈕
//////////////////////////////////////////////////

function drawBackButton() {
  // 取消繪製預設按鈕，改為直接使用圖片中的按鈕圖案
}

//////////////////////////////////////////////////
// 點擊事件
//////////////////////////////////////////////////

function mousePressed() {

  //////////////////////////////////////////////////
  // 主選單按鈕區域
  //////////////////////////////////////////////////

  if (scene === "menu") {

    // 顏色辨識

    if (
      mouseX > width * 0.15 &&
      mouseX < width * 0.48 &&
      mouseY > height * 0.35 &&
      mouseY < height * 0.70
    ) {

      score = 0;
      timeLeft = 30;
      lastTime = millis();

      scene = "colorGame";

      return;
    }

    // 中英文對照

    if (
      mouseX > width * 0.52 &&
      mouseX < width * 0.85 &&
      mouseY > height * 0.35 &&
      mouseY < height * 0.70
    ) {

      englishScore = 0;
      setupEnglishGame(); // 進入遊戲時重新抽取題目
      scene = "englishGame";

      return;
    }

    // 設定
    if (dist(mouseX, mouseY,
             width * 0.33,
             height * 0.84) < 70) {
      scene = "settings";
      return;
    }

    // 成就
    if (dist(mouseX, mouseY,
             width * 0.50,
             height * 0.84) < 70) {
      scene = "achievements";
      return;
    }

    // 說明
    if (dist(mouseX, mouseY,
             width * 0.67,
             height * 0.84) < 70) {
      scene = "help";
      return;
    }
  }

  //////////////////////////////////////////////////
  // 返回主選單
  //////////////////////////////////////////////////

  if (
    scene !== "menu" &&
    mouseX > width * 0.02 &&
    mouseX < width * 0.28 &&
    mouseY > height * 0.85 &&
    mouseY < height * 0.98
  ) {

    scene = "menu";

    return;
  }

  //////////////////////////////////////////////////
  // 設定切換攝影機
  //////////////////////////////////////////////////

  if (scene === "settings") {

    // 點擊「開」按鈕
    if (
      mouseX > width * 0.25 &&
      mouseX < width * 0.48 &&
      mouseY > height * 0.45 &&
      mouseY < height * 0.70
    ) {
      camOn = true;
    }

    // 點擊「關」按鈕
    if (
      mouseX > width * 0.52 &&
      mouseX < width * 0.75 &&
      mouseY > height * 0.45 &&
      mouseY < height * 0.70
    ) {
      camOn = false;
    }
  }

  //////////////////////////////////////////////////
  // 顏色遊戲重新開始
  //////////////////////////////////////////////////

  if (
    scene === "colorGame" &&
    timeLeft <= 0
  ) {

    score = 0;

    timeLeft = 30;

    lastTime = millis();

    pickNewColor();
  }
}

//////////////////////////////////////////////////
// 隨機顏色
//////////////////////////////////////////////////

function pickNewColor() {

  let colors = [

    color(255, 50, 50),
    color(50, 255, 50),
    color(50, 50, 255),
    color(255, 255, 50),
    color(50, 255, 255),
    color(255, 150, 50),

  ];

  targetColor = random(colors);
}

//////////////////////////////////////////////////
// 中英文對照遊戲邏輯與物件
//////////////////////////////////////////////////

function setupEnglishGame() {
  if (questions.length === 0) return;

  let qIndex = floor(random(questions.length));
  currentQuestion = questions[qIndex];
  isQuestionEnglish = random([true, false]);

  magnets = [];
  let options = [];
  options.push(currentQuestion); // 放進正確答案

  // 隨機挑選 3 個不同的錯誤選項
  let attempts = 0;
  while (options.length < 4 && attempts < 50) {
    let randQ = random(questions);
    if (!options.includes(randQ)) {
      options.push(randQ);
    }
    attempts++;
  }

  // 隨機打亂這四個選項順序
  options.sort(() => random() - 0.5);

  let spacing = width / 5;
  for (let i = 0; i < options.length; i++) {
    // 如果題目為英文，選項顯示中文；反之亦然
    let txt = isQuestionEnglish ? options[i].chi : options[i].eng;
    let isCorrect = (options[i] === currentQuestion);
    
    // 方塊在畫面底部的初始分布
    let mx = spacing * (i + 1);
    let my = height * 0.85 + random(-15, 15);
    magnets.push(new Magnet(mx, my, txt, isCorrect));
  }
}

function gotHands(results) {
  hands = results;
}

class Magnet {
  constructor(x, y, txt, isCorrect) {
    this.x = x;
    this.y = y;
    this.txt = txt;
    this.isCorrect = isCorrect;
    this.isDragging = false;
    
    if (font) textFont(font);
    textSize(24);
    this.w = max(textWidth(txt) + 40, 120); // 依據字長調整方塊寬度
    this.h = 60;
  }

  display() {
    fill(this.isDragging ? color(200, 200, 255) : 255);
    stroke(0);
    strokeWeight(2);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h, 10);

    fill(0);
    noStroke();
    if (font) textFont(font);
    textSize(24);
    text(this.txt, this.x, this.y);
  }

  touch(tx, ty, ix, iy) {
    let pinchDist = dist(tx, ty, ix, iy);
    let midX = (tx + ix) / 2;
    let midY = (ty + iy) / 2;
    let over = abs(midX - this.x) < this.w / 2 && abs(midY - this.y) < this.h / 2;

    // 距離過小且在方塊上即為拖曳中
    if (pinchDist < 40 && over && !this.isDragging) {
      this.isDragging = true;
    } else if (pinchDist > 60) {
      this.isDragging = false; // 放開距離加大
    }

    if (this.isDragging) {
      this.x = midX;
      this.y = midY;
    }
  }
}