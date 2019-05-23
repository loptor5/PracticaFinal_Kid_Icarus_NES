function loadPlayer(Q) {
    
    // MASCARAS DE COLISION

    var SPRITE_PLAYER = 1; 
    var SPRITE_BULLET = 2; 
    var SPRITE_ENEMY_K = 3; 
    var SPRITE_OBJECT = 4; 
    var SPRITE_BULLET_ENEMY = 9;  
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

    // PIT

    Q.Sprite.extend("Pit",
        {
            init: function (p) {
                this._super(p,
                    {
                        sprite: "pit_anim",
                        sheet: "pit",
                        type: SPRITE_PLAYER,
                        collisionMask: SPRITE_ENEMY_K | SPRITE_BULLET_ENEMY | SPRITE_FLY,
                        gravity: 0.5,
                        x: 40,
                        y: 2763,
                        frame: 1,
                        alive: true,
                        live: 7,
                        sort: true,
                        direction: "right",
                        speed: 80,
                        jumpSpeed: -280,
                        jumped: 0, // numero de saltos
                        damaged: false, // si esta dañado
                        shootedUp: false, // si ha disparado hacia arriba
                        timeShooted: 0, // tiempo de disparo
                        timeDamaged: 0 // tiempo de invulnerabilidad
                    });

                this.add("2d, platformerControls, animation");
                this.on("bump.left, bump.right, bump.up, bump.bottom, bump.top", this, "hit");
                Q.input.on("fire", this, "shoot");
                Q.input.on("S", this, "shootUp");
                this.on("dying", this, "die");
            },

            step: function (dt) {
                //console.log(this.p.frame); // frame del sprite actual
                if (this.p.alive) {
                    // Si se sale de los limites
                    if (this.p.x > 257) this.p.x = 1;
                    if (this.p.x < 0) this.p.x = 256;

                    if(Q.inputs["down"] && !this.p.damaged)
                    {
                        this.play("bend_over");
                    }
                    else if (this.p.timeShooted > 0) {
                        this.p.timeShooted--;

                        if (this.p.timeShooted == 5) // en la mitad de tiempo de animacion suelta la flecha
                        {
                            if (this.p.shootedUp) { // Disparo Arriba
                                this.p.shootedUp = false;

                                this.stage.insert(new Q.ArrowUp(
                                    {
                                        x: this.p.x,
                                        y: this.p.y - this.p.h / 2,
                                        vy: vyF = -200,
                                    }));
                            }
                            else { // Disparo Horizontal
                                let dir;
                                this.p.direction == "right" ? dir = 1 : dir = -1;

                                this.stage.insert(new Q.Arrow(
                                    {
                                        x: this.p.x + 2 * dir,
                                        y: this.p.y + this.p.h / 10,
                                        vx: 200 * dir,
                                        angle: 90 * dir
                                    }));
                            }
                        }
                    }
                    else if (this.p.timeDamaged > 0) {
                        this.play("damage_" + this.p.direction);
                        this.p.timeDamaged--;
                        this.p.timeDamaged == 0 ? this.p.damaged = false : this.p.damaged = true;
                    }
                    else if (this.p.vy == 0 && this.p.vx == 0 && !this.p.ignoreControls) {
                        this.play("stand_" + this.p.direction);
                        this.p.jumped = 0;
                    }
                    else if (this.p.landed > 0 && !this.p.ignoreControls) {
                        this.play("walk_" + this.p.direction);
                        this.p.jumped = 0;
                    }
                    else if (!this.p.ignoreControls) {
                        if (this.p.vy < 0) {
                            this.play("jump_up_" + this.p.direction);
                        }
                        else {
                            this.play("jump_down_" + this.p.direction);
                        }
                        this.p.jumped++;
                    }

                    if (this.p.jumped == 1) {
                        this.p.vy < 0 ? Q.audio.play("Salto.mp3", { loop: false }) : null; // si salta hacia "arriba" (solo el primer salto)
                    }
                }else{
                    this.p.alive = false;
                    this.p.sensor = false;
                    this.p.gravity = 0;
                    this.play("death");
                }

            },

            shoot: function () {
                if (this.p.alive) {
                    switch (this.p.frame) {
                        case 1:
                        case 5: // estatico
                            this.play("shoot_stand_" + this.p.direction);
                            break;
                        case 2:
                        case 3:
                        case 4: // andando (depende del frame que este)
                            this.play("shoot_walk_" + this.p.direction + "_" + this.p.frame);
                            break;
                        case 6: // saltando abajo
                            this.play("shoot_jump_down_" + this.p.direction);
                            break;
                        case 7: // saltando arriba
                            this.play("shoot_jump_up_" + this.p.direction);
                            break;
                        default:
                            this.play("shoot_stand_" + this.p.direction);
                            console.log(this.p.frame);
                    }
                    Q.audio.play("Disparo.mp3", { loop: false }); // audio de disparo
                    this.p.timeShooted = 10;
                }
            },

            shootUp: function () {
                if (this.p.alive) {
                    this.play("shoot_up");
                    Q.audio.play("Disparo.mp3", { loop: false }); // audio de disparo
                    this.p.timeShooted = 10;
                    this.p.shootedUp = true;
                }
            },

            hit: function (collision) {
                if (this.p.alive) {
                    if (collision.obj.isA("Viperix") || collision.obj.isA("Monoculus") || collision.obj.isA("Funesto") || collision.obj.isA("FunestoM") || collision.obj.isA("Napias") || collision.obj.isA("Fuego") || collision.obj.isA("EnemyFire") || collision.obj.isA("Netora")) {
                        if (!this.p.damaged) {
                            this.p.live -= collision.obj.p.damage;
                            Q.state.set("lives", this.p.live);
                            this.p.damaged = true;
                            this.p.timeDamaged = 30;
                        }

                        if (this.p.live <= 0) {
                            this.p.alive = false;
                            this.p.sensor = false;
                            this.p.gravity = 0;
                            this.play("death");
                        }
                    }
                }
            },

            bendOver: function () {
                if (this.p.alive) {
                    
                }
            },

            die: function () {
                this.add("tween");
                this.p.sensor = true;
                this.p.collisionMask = SPRITE_FLY;
                this.del('2d, platformerControls'); // quito los controles
                Q.stages[0].unfollow();
                this.animate(
                    {
                        y: this.p.y + 250,
                        angle: 180
                    }, 0.8, Q.Easing.Linear,
                    {
                        callback: function () {
                            this.destroy(); // elimina el personaje
                            Q.stageScene("endGame", 1, { label: "You Died" }); // escena de muerte
                        }
                    });
            }
        });

    //----------------------------------------------------------------------//

    Q.animations("pit_anim",
        {
            stand_right: { frames: [1], flip: false, loop: true, rate: 1 / 5 },
            stand_left: { frames: [1], flip: "x", loop: true, rate: 1 / 5 },
            walk_right: { frames: [2, 3, 4], rate: 1 / 20, flip: false, loop: false, next: "stand_right" }, // ?cambiar?
            walk_left: { frames: [2, 3, 4], rate: 1 / 20, flip: "x", loop: false, next: "stand_left" },
            jump_up_right: { frames: [7], flip: false, loop: false, rate: 1 / 5 },
            jump_up_left: { frames: [7], flip: "x", loop: false, rate: 1 / 5 },
            jump_down_right: { frames: [6], flip: false, loop: false, rate: 1 / 5 },
            jump_down_left: { frames: [6], flip: "x", loop: false, rate: 1 / 5 },
            death: { frames: [0], flip: false, loop: false, rate: 1 / 5, trigger: "dying" },
            damage_right: { frames: [5, 1, 5, 1], flip: false, loop: true, rate: 1 / 15 },
            damage_left: { frames: [5, 1, 5, 1], flip: "x", loop: true, rate: 1 / 15 },
            shoot_stand_right: { frames: [1, 10], flip: false, loop: false, rate: 1 / 10 },
            shoot_stand_left: { frames: [1, 10], flip: "x", loop: false, rate: 1 / 10 },
            shoot_walk_right_2: { frames: [4, 3, 11, 12], flip: false, loop: false, rate: 1 / 20 },
            shoot_walk_right_3: { frames: [2, 4, 11, 12], flip: false, loop: false, rate: 1 / 20 },
            shoot_walk_right_4: { frames: [3, 2, 11, 12], flip: false, loop: false, rate: 1 / 20 },
            shoot_walk_left_2: { frames: [4, 3, 11, 12], flip: "x", loop: false, rate: 1 / 20 },
            shoot_walk_left_3: { frames: [2, 4, 11, 12], flip: "x", loop: false, rate: 1 / 20 },
            shoot_walk_left_4: { frames: [3, 2, 11, 12], flip: "x", loop: false, rate: 1 / 20 },
            shoot_jump_up_right: { frames: [7, 14], flip: false, loop: false, rate: 1 / 10 },
            shoot_jump_up_left: { frames: [7, 14], flip: "x", loop: false, rate: 1 / 20 },
            shoot_jump_down_right: { frames: [6, 13], flip: false, loop: false, rate: 1 / 10 },
            shoot_jump_down_left: { frames: [6, 13], flip: "x", loop: false, rate: 1 / 10 },
            shoot_up: { frames: [8, 9], flip: false, loop: false, rate: 1 / 10 },
            bend_over: { frames: [15], flip: false, loop: false, rate: 1 / 5 }
        });
    
    //----------------------------------------------------------------------//

    // ARROW

    Q.MovingSprite.extend("Arrow",
        {
            init: function (p) {
                this._super(p,
                    {
                        sheet: "flecha",
                        sprite: "flecha",
                        scale: 0.5,
                        type: SPRITE_BULLET,
                        collisionMask: SPRITE_ENEMY_K | SPRITE_FLY,
                        sort: true,
                        gravity: 0,
                        sensor: true
                    });

                this.add("2d");
            },

            step: function (dt) {
                if (this.p.vx == 0) {
                    this.destroy();
                }
                if (this.p.x < 0 || this.p.x > 257) {
                    this.destroy();
                }
            }
        });

    Q.MovingSprite.extend("ArrowUp",
        {
            init: function (p) {
                this._super(p,
                    {
                        sheet: "flecha",
                        sprite: "flecha",
                        scale: 0.5,
                        type: SPRITE_BULLET,
                        collisionMask: SPRITE_ENEMY_K | SPRITE_FLY,
                        sort: true,
                        gravity: 0,
                        sensor: true
                    });

                this.add("2d");
            },

            step: function (dt) {
                if (this.p.vy == 0) {
                    this.destroy();
                }
                if (this.p.y < 0) {
                    this.destroy();
                }
            }
        });
    
    //------------------------------------------------------------------------//
}