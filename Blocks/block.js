class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.block = null;
    this.movable = true;
    this.moving = false;
    this.movingTick;
  }

  newSolidBlock() {
    this.block = new Solid(this);
  }

  newPiston(r, s) {
    this.block = new Piston(this, r, s);
  }

  show(c, i) {
    this.block.show(c, i);
  }
}

class Solid {
  constructor(p) {
    this.p = p;
  }

  show(c, i) {
    c.noStroke();
    c.fill(255);
    let x = this.p.x * 32;
    let y = this.p.y * 32;
    if (this.p.movingTick != undefined && this.p.moving) {
      if (gameTick - this.p.movingTick < 3) {
        if (gameTick - this.p.movingTick == 2) this.p.movable = true;
        let toNextBlock = (gameTick - this.p.movingTick + i) * thirdOf32;
        switch (this.p.moveR) {
          case 0:
            y += 32 - toNextBlock;
            break;
          case 1:
            x -= 32 - toNextBlock;
            break;
          case 2:
            y -= 32 - toNextBlock;
            break;
          case 3:
            x += 32 - toNextBlock;
            break;
        }
      } else {
        this.p.moving = false;
      }
    }
    let ctx = c.drawingContext;
    ctx.drawImage(woolImg, x, y);
  }
}
