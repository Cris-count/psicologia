import Phaser from 'phaser';



export interface HallwayInputState {

  forward: boolean;

  backward: boolean;

  left: boolean;

  right: boolean;

  interact: boolean;

  sprint: boolean;

}



type KeyMap = {

  W: Phaser.Input.Keyboard.Key;

  A: Phaser.Input.Keyboard.Key;

  S: Phaser.Input.Keyboard.Key;

  D: Phaser.Input.Keyboard.Key;

  UP: Phaser.Input.Keyboard.Key;

  DOWN: Phaser.Input.Keyboard.Key;

  LEFT: Phaser.Input.Keyboard.Key;

  RIGHT: Phaser.Input.Keyboard.Key;

  E: Phaser.Input.Keyboard.Key;

  SHIFT: Phaser.Input.Keyboard.Key;

};



/** Input Phaser Keyboard + respaldo bridge Angular. */

export class HallwayInputController {

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

  private keys: KeyMap | null = null;



  bind(scene: Phaser.Scene): void {

    if (!scene.input.keyboard) {

      console.warn('[HallwayInput] keyboard plugin unavailable');

      return;

    }

    const kb = scene.input.keyboard;

    kb.enabled = true;

    kb.clearCaptures();

    kb.resetKeys();



    this.cursors = kb.createCursorKeys();

    this.keys = kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SHIFT') as KeyMap;



    const capture = [

      Phaser.Input.Keyboard.KeyCodes.W,

      Phaser.Input.Keyboard.KeyCodes.A,

      Phaser.Input.Keyboard.KeyCodes.S,

      Phaser.Input.Keyboard.KeyCodes.D,

      Phaser.Input.Keyboard.KeyCodes.UP,

      Phaser.Input.Keyboard.KeyCodes.DOWN,

      Phaser.Input.Keyboard.KeyCodes.LEFT,

      Phaser.Input.Keyboard.KeyCodes.RIGHT,

      Phaser.Input.Keyboard.KeyCodes.E,

      Phaser.Input.Keyboard.KeyCodes.SHIFT,

    ];

    capture.forEach((code) => kb.addCapture(code));

  }



  read(bridge: HallwayInputState): HallwayInputState {

    const k = this.keys;

    const c = this.cursors;



    const forward = !!(c?.up.isDown || k?.UP?.isDown || k?.W?.isDown || bridge.forward);

    const backward = !!(c?.down.isDown || k?.DOWN?.isDown || k?.S?.isDown || bridge.backward);

    const left = !!(c?.left.isDown || k?.LEFT?.isDown || k?.A?.isDown || bridge.left);

    const right = !!(c?.right.isDown || k?.RIGHT?.isDown || k?.D?.isDown || bridge.right);



    if (forward) console.log('W PRESSED');

    if (left) console.log('A PRESSED');

    if (backward) console.log('S PRESSED');

    if (right) console.log('D PRESSED');



    return {

      forward,

      backward,

      left,

      right,

      interact: !!(k?.E?.isDown || bridge.interact),

      sprint: !!(k?.SHIFT?.isDown || bridge.sprint),

    };

  }

}


