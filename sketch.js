let editorWidth = 16;
let editorHeight = 13;

let blocks = [];
for (let i = 0; i < editorWidth; i++) {
  blocks[i] = [];
  for (let j = 0; j < editorHeight; j++) {
    blocks[i][j] = new Block(i, j);
  }
}

let timeline = [];
for (let i = 0; i < 30; i++) {
  timeline[i] = [];
}

let timelineT;
let gameTick = 0;
let lastGameTickMS;
let gameTickDelay = 50;

let thirdOf32 = 32 / 3;

let backgroundColor;

function preload() {
  for (let i = 0; i < 12; i++) {
    pistonImages[i] = new Image(32, 32);
    pistonImages[i].src = `Blocks/Piston/piston${
      i < 4 ? '' : i < 8 ? '_sticky' : '_head'
    }${i % 4}.png`;
  }
  woolImg = new Image(32, 32);
  woolImg.src = `Blocks/SolidBlocks/wool.png`;
}

function setup() {
  createCanvas(400, 400);
  backgroundColor = color(182, 209, 255);
  createCamWind('editor', 0, 0, 400, 400);
  wind.c.drawingContext.imageSmoothingEnabled = false;
  wind.setLimits(0, 0, editorWidth * 32, editorHeight * 32);
  wind.setMaxZoom(4);
  //moving 4 blocks
  blocks[2][1].newPiston(1, true);
  for (let i = 0; i < 4; i++) {
    blocks[3 + i][1].newSolidBlock();
  }
  //DPE
  blocks[2][3].newPiston(1, true);
  blocks[3][3].newPiston(1, true);
  blocks[4][3].newSolidBlock();
  //sticky vs non-sticky 1-tick
  blocks[2][8].newPiston(0, true);
  blocks[2][7].newSolidBlock();
  blocks[4][8].newPiston(0, false);
  blocks[4][7].newSolidBlock();
  //0-tick swapping
  blocks[7][8].newPiston(0, true);
  blocks[7][7].newSolidBlock();
  blocks[6][7].newPiston(1, true);
  blocks[8][7].newSolidBlock();
  //moving 4 blocks
  timeline[2].push(() => blocks[2][1].block.extend());
  timeline[5].push(() => blocks[2][1].block.retract());
  //DPE
  timeline[0].push(() => blocks[2][3].block.extend());
  timeline[3].push(() => blocks[4][3].block.extend());
  timeline[5].push(() => blocks[4][3].block.retract());
  timeline[8].push(() => blocks[2][3].block.retract());
  timeline[11].push(() => blocks[3][3].block.extend());
  timeline[12].push(() => blocks[3][3].block.retract());
  timeline[15].push(() => blocks[2][3].block.extend());
  timeline[18].push(() => blocks[4][3].block.extend());
  timeline[20].push(() => blocks[4][3].block.retract());
  timeline[23].push(() => blocks[2][3].block.retract());
  timeline[26].push(() => blocks[3][3].block.extend());
  timeline[27].push(() => blocks[3][3].block.retract());
  //sticky vs non-sticky 1-tick
  timeline[3].push(() => blocks[2][8].block.extend());
  timeline[5].push(() => blocks[2][8].block.retract());
  timeline[3].push(() => blocks[4][8].block.extend());
  timeline[5].push(() => blocks[4][8].block.retract());
  //0-tick swapping
  timeline[8].push(() => blocks[7][8].block.extend());
  timeline[8].push(() => blocks[7][8].block.retract());
  timeline[8].push(() => blocks[6][7].block.extend());
  timeline[8].push(() => blocks[6][7].block.retract());
  startTimeline();
  frameRate(144);
}

function draw() {
  background(220);
  wind.c.background(backgroundColor);
  wind.c.noStroke();
  let percentToNextTick = map(
    Date.now() - lastGameTickMS,
    0,
    gameTickDelay,
    0,
    1
  );
  for (let y = 0; y < editorHeight; y++) {
    for (let x = 0; x < editorWidth; x++) {
      let block = blocks[x][y];
      if (block.block != null) block.show(wind.c, percentToNextTick);
    }
  }
  drawAllWinds();
}

function timelineHandler() {
  gameTick++;
  if (gameTick - 1 >= timeline.length) {
    clearInterval(timelineT);
    timelineT = null;
  } else {
    for (let f of timeline[gameTick - 1]) {
      f();
    }
  }
  lastGameTickMS = Date.now();
}

function startTimeline() {
  timelineT = setInterval(timelineHandler, gameTickDelay);
  gameTick = 0;
  lastGameTickMS = Date.now();
}
