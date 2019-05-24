function loadItems(Q) {
    
    // MASCARAS DE COLISION

    var SPRITE_PLAYER = 1; 
    var SPRITE_BULLET = 2; 
    var SPRITE_ENEMY_K = 3; 
    var SPRITE_OBJECT = 4; 
    var SPRITE_BULLET_ENEMY = 8;  
    var SPRITE_DOOR = 16;
    var SPRITE_FLY = 32; 

    Q.SPRITE_NONE = 0;
    Q.SPRITE_DEFAULT = 1;
    Q.SPRITE_PARTICLE = 2;
    Q.SPRITE_ACTIVE = 4;
    Q.SPRITE_FRIENDLY = 8;
    Q.SPRITE_ENEMY = 16;
    Q.SPRITE_UI = 32;
    Q.SPRITE_ALL = 0xFFFF;

    //------------------------------------------------------------------------//

    // CORAZON

    Q.Sprite.extend("Corazon",
        {
            init: function (p) {
                this._super(p,
                    {
                        type: SPRITE_OBJECT,
                        collisionMask: SPRITE_PLAYER,
                        gravity: 0,
                        frame: 0,
                        tiempo: 0,
                        sensor: true
                    });

                this.add("2d");
                this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
            },

            hit: function (collision) {
                if (collision.obj.isA("Pit")) {
                    Q.audio.play("Corazon.mp3", { loop: false }); // Reproduce la musica de corazon
                    Q.state.inc("score", this.p.heart);
                    this.destroy();
                }
            },

            step: function (dt) {
                if(this.p.tiempo > 200) {
                    this.destroy();
                }
                else {
                    this.p.tiempo++;
                }
            }
        });

    //------------------------------------------------------------------------//

    // DOOR

    Q.Sprite.extend("Door",
        {
            init: function (p) {
                this._super(p,
                    {
                        type: SPRITE_DOOR,
                        collisionMask: SPRITE_PLAYER,
                        gravity: 0,
                        frame: 0
                        //tipoPuerta sera puertaA o puertaB
                        //modelo indicará a donde transporta al personaje
                    });

                this.add("2d, aiBounce");
                this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
            },

            hit: function (collision) {
                if (collision.obj.isA("Pit")) {
                    Q.audio.play("Puerta.mp3", { loop: false }); // Musica de puerta

                    // Según el tipo de puerta te mandará a un lugar a otro
                    if (this.p.modelo == 0) // La ultima puerta
                    {
                        collision.obj.destroy();
                        Q.stageScene("winGame", 1, { label: "You Won!" });
                    }
                    else if (this.p.modelo == 1) {
                        collision.obj.p.x = 200;
                        collision.obj.p.y = 3216;
                        this.p.sheet = this.p.tipoPuerta + "Close";
                        this.p.modelo = 100;
                        this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3104, yFin: 3264, time: 0 }));
                        this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3184, yFin: 3264, time: 0 }));
                        this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3104, yFin: 3264, time: 0.5 }));
                        this.stage.insert(new Q.Napias({ x: 112, y: 3136, yIni: 3152, yFin: 3220, time: 0 }));
                        this.stage.insert(new Q.Napias({ x: 112, y: 3136, yIni: 3152, yFin: 3220, time: 0.5 }));
                    }
                    else if (this.p.modelo == 2) {
                        collision.obj.p.x = 200;
                        collision.obj.p.y = 2528;
                        // No la cerramos porque el modelo 1 y el 3 te llevan a la misma habitación
                    }
                    else if (this.p.modelo == 3) {
                        collision.obj.p.x = 200;
                        collision.obj.p.y = 3216;
                        this.p.sheet = this.p.tipoPuerta + "Close";
                        this.p.modelo = 100;
                        this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3104, yFin: 3264, time: 0 }));
                        this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3184, yFin: 3264, time: 0 }));
                        this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3104, yFin: 3264, time: 0.5 }));
                        this.stage.insert(new Q.Napias({ x: 112, y: 3136, yIni: 3152, yFin: 3220, time: 0 }));
                        this.stage.insert(new Q.Napias({ x: 112, y: 3136, yIni: 3152, yFin: 3220, time: 0.5 }));
                    }
                    else if (this.p.modelo == 4) {
                        collision.obj.p.x = 200;
                        collision.obj.p.y = 2976;
                        this.p.sheet = this.p.tipoPuerta + "Close";
                        this.p.modelo = 100;
                        this.stage.insert(new Q.Napias({ x: 112, y: 3998, yIni: 2864, yFin: 3008, time: 0 }));
                        this.stage.insert(new Q.FunestoM({ x: 112, y: 3184, yIni: 2864, yFin: 3008, time: 0.5 }));
                    }
                    else if (this.p.modelo == 5) {
                        collision.obj.p.x = 152;
                        collision.obj.p.y = 1104;
                    }
                }
            }
        });
    //------------------------------------------------------------------------//

    // BONUS LIVES

    Q.Sprite.extend("BonusLives",
        {
            init: function (p) {
                this._super(p,
                    {
                        type: SPRITE_OBJECT,
                        collisionMask: SPRITE_PLAYER,
                        gravity: 0,
                        frame: 0,
                        tiempo: 0,
                        sensor: true
                    });

                this.add("2d");
                this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
            },

            hit: function (collision) {
                if (collision.obj.isA("Pit")) {
                    Q.audio.play("BonusLives.mp3", { loop: false }); // Reproduce la musica de bonus lives
                    collision.obj.p.live += this.p.bonus;
                    collision.obj.p.live > 7 ? collision.obj.p.live = 7 : null; // Pit tiene 7 vidas
        			Q.state.set("lives", collision.obj.p.live);
                    this.destroy();
                }
            },

            step: function (dt) {}
        });

    //------------------------------------------------------------------------//
}