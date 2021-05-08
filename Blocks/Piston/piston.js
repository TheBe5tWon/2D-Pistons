let pistonImages = [];

class Piston {
  constructor(p, r, s) {
    this.p = p;
    this.r = r;
    this.sticky = s;
    this.extended = false;
    this.extensionTick;
    this.retractionTick;
    this.extending = false;
    this.retracting = false;
  }

  show(c = p5, i) {
    let g;
    if (this.r == 0 || this.r == 2) {
      g = createGraphics(32, 64);
    } else {
      g = createGraphics(64, 32);
    }
    let ctx = g.drawingContext;
    let toNextBlock;
    if (this.extended) {
      if (this.extensionTick != undefined && this.extending) {
        if (gameTick - this.extensionTick < 3) {
          toNextBlock = (gameTick - this.extensionTick + i) * thirdOf32;
        } else {
          this.extending = false;
          toNextBlock = 32;
        }
      } else {
        toNextBlock = 32;
      }
    } else {
      if (this.retractionTick != undefined && this.retracting) {
        if (gameTick - this.retractionTick < 3) {
          if (gameTick - this.retractionTick == 2) this.p.movable = true;
          toNextBlock = 32 - (gameTick - this.retractionTick + i) * thirdOf32;
        } else {
          this.retracting = false;
          this.p.movable = true;
          toNextBlock = 0;
        }
      } else {
        toNextBlock = 0;
      }
    }
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
    switch (this.r) {
      case 0:
        ctx.drawImage(pistonImages[8], 0, 32 - toNextBlock);
        ctx.drawImage(pistonImages[this.sticky ? 4 : 0], 0, 32);
        c.image(g, x, y - 32);
        break;
      case 1:
        ctx.drawImage(pistonImages[9], -8 + toNextBlock, 0);
        ctx.drawImage(pistonImages[this.sticky ? 5 : 1], 0, 0);
        c.image(g, x, y);
        break;
      case 2:
        ctx.drawImage(pistonImages[10], 0, -8 + toNextBlock);
        ctx.drawImage(pistonImages[this.sticky ? 6 : 2], 0, 0);
        c.image(g, x, y);
        break;
      case 3:
        ctx.drawImage(pistonImages[11], 32 - toNextBlock, 0);
        ctx.drawImage(pistonImages[this.sticky ? 7 : 3], 32, 0);
        c.image(g, x - 32, y * 32);
        break;
    }
  }

  extend() {
    if (!this.extended && this.p.movable) {
      let dir;
      switch (this.r) {
        case 0:
          dir = [0, -1];
          break;
        case 1:
          dir = [1, 0];
          break;
        case 2:
          dir = [0, 1];
          break;
        case 3:
          dir = [-1, 0];
          break;
      }
      let l = 0;
      let x = this.p.x;
      let y = this.p.y;
      let moveArr = [];
      while (true) {
        x += dir[0];
        y += dir[1];
        if (l == 13) break;
        if (this.inBounds(x, y)) {
          let block = blocks[x][y].block;
          if (blocks[x][y].movable == false) break;
          if (block == null) {
            this.extensionTick = gameTick;
            this.extended = true;
            this.extending = true;
            this.p.movable = false;
            for (let i = l - 1; i >= 0; i--) {
              blocks[x][y].block = moveArr[i];
              blocks[x][y].movable = false;
              blocks[x][y].moving = true;
              blocks[x][y].movingTick = gameTick;
              blocks[x][y].moveR = this.r;
              moveArr[i].p = blocks[x][y];
              x -= dir[0];
              y -= dir[1];
            }
            blocks[x][y].block = null;
            blocks[x][y].movable = false;
            break;
          }
          moveArr.push(block);
        } else break;
        l++;
      }
    }
  }

  retract() {
    if (this.extended) {
      this.retractionTick = gameTick;
      this.extended = false;
      this.retracting = true;
      if (this.sticky) {
        let dir;
        switch (this.r) {
          case 0:
            dir = [0, -1];
            break;
          case 1:
            dir = [1, 0];
            break;
          case 2:
            dir = [0, 1];
            break;
          case 3:
            dir = [-1, 0];
            break;
        }
        let x = this.p.x + 2 * dir[0];
        let y = this.p.y + 2 * dir[1];
        if (this.inBounds(x, y)) {
          if (blocks[x][y].movable) {
            if (blocks[x][y].block != null) {
              let newBlock = blocks[this.p.x + dir[0]][this.p.y + dir[1]];
              blocks[x][y].block.p = newBlock;
              newBlock.block = blocks[x][y].block;
              newBlock.moving = true;
              newBlock.movingTick = gameTick;
              newBlock.moveR = (this.r + 2) % 4;
              newBlock.movable = false;
              blocks[x][y].block = null;
              blocks[x][y].movable = true;
            } else {
              blocks[this.p.x + dir[0]][this.p.y + dir[1]].movable = true;
              blocks[x][y].moving = false;
              blocks[x][y].movable = true;
            }
          } else {
            blocks[this.p.x + dir[0]][this.p.y + dir[1]].movable = true;
            blocks[x][y].moving = false;
            blocks[x][y].movable = true;
          }
        }
      }
    }
  }

  inBounds(x, y) {
    return !(x == -1 || x == editorWidth || y == -1 || y == editorHeight);
  }
}
