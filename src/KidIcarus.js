var game = function(){
  var Q= window.Q= Quintus()
    .include("Sprites, Scenes,Input, UI, Touch, TMX, Anim, 2D")
      .setup({maximize: true})
      .controls()
      .touch();

      var SPRITE_PLAYER=1;
      var SPRITE_BULLET=2;
      var SPRITE_ENEMY=3;


  Q.Sprite.extend("Pit",{
    init: function(p) {
      this._super(p, {
        sprite: "pit_anim",
        sheet: "pit",
        type: SPRITE_PLAYER,
        gravity: 0.65,
        x: 100,
        y: 2768,
        frame: 1,
        alive:true,
        sort: true,
        direction: "right"
      });

      this.add("2d, platformerControls, animation");
      this.on("bump.left, bump.right, bump.up", function(collision){});
      Q.input.on("fire", this, "shoot");
      Q.input.on( "S", this, "shootUp");
      this.play("stand_right");
    },

    step: function(dt){
      if(this.p.alive){
        if(this.p.x>257) this.p.x=1;
        if(this.p.x<0) this.p.x=256;
        if(this.p.vx >0){
          this.p.direction = "right";
          this.play("walk_right");

        }
        if(this.p.vx <0) {
          this.p.direction="left";
          this.play("walk_left");
        }
        if(this.p.vy >0 || this.p.vy <0){
          this.p.direction= "right";
          this.play("jump_right");
        } 
        if((this.p.vy >0 || this.p.vy <0)&& this.p.vx <0){
          this.p.direction= "left";
          this.play("jump_left");
        }
      }
    },

    shoot: function() {
      var p= this.p;
      if(p.direction==="right"){
        this.stage.insert(new Q.Arrow({
          x: p.x,
          y: p.y+p.h/6+2,
          vx: 200
        }))
      }else{
        this.stage.insert(new Q.Arrow({
          x: p.x,
          y: p.y+p.h/6+2,
          vx: -200
        }))
      }
      
    },

    shootUp: function(){
      var p=this.p;
      this.play("lookUp");
      this.stage.insert(new Q.ArrowUp({
        x: p.x,
        y: p.y-p.h/2,
        vy: -200
      }))
    }
  });
  //----------------------------------------------------------------------//
  
  Q.animations("pit_anim",{
    stand_right: {frames:[1], flip:false, loop:true, rate: 1/5},
    stand_left: {frames:[1], flip: "x", loop:true, rate: 1/5},
    walk_right: {frames: [1,2,3,4], rate: 1/16, flip:false, loop:true, next: "stand_right"},
    walk_left: {frames: [1,2,3,4], rate: 1/16, flip: "x", loop:true, next: "stand_left"},
    jump_right: {frames: [6,7], flip: false, loop: true, rate: 1/5},
    jump_left: {frames: [6,7], flip: "x", loop: true, rate: 1/5},
    lookUp: {frames: [8,9], rate: 1/5, flip: false, loop: true, next: "stand_right"},
    death: {frames:[0], flip:false, rate:2, loop:false, trigger: "dying"}
  });
  //----------------------------------------------------------------------//

  Q.MovingSprite.extend("Arrow", {
    init: function(p) {
      this._super( p, {
        sheet: "arrow",
        sprite: "arrow",
        type: SPRITE_BULLET,
        collisionMask: SPRITE_ENEMY,
        sensor: true,
        gravity: 0
      });

      this.add("2d");
    },

    step: function(dt){
      if(this.p.vx==0){
        this.destroy();
      }
      if(this.p.x<0 || this.p.x>257){
        this.destroy();
      }
    }
  });

  Q.MovingSprite.extend("ArrowUp", {
    init: function(p) {
      this._super( p, {
        sheet: "arrowUp",
        sprite: "arrowUp",
        type: SPRITE_BULLET,
        collisionMask: SPRITE_ENEMY,
        sensor: true,
        gravity: 0
      });

      this.add("2d");
    },

    step: function(dt){
      if(this.p.vy==0){
        this.destroy();
      }
      if(this.p.y<0){
        this.destroy();
      }
    }
  });

  Q.Sprite.extend("Viperix", {
    init: function(p){
      this._super(p, {
        sprite: "viperix_anim",
        sheet: "viperix1",
        type: SPRITE_ENEMY,
        collisionMask: SPRITE_BULLET | SPRITE_PLAYER,
        gravity: 0.65,
        frame: 1,
        live:1,
        exp: 100
      });

      this.add("2d, platformerControls, animation");
      this.on("bump.left, bump.right, bump.botton, bump.top", this, "kill");
      this.on("hit", this, "killed");
    },

    kill: function(collision){
      if(collision.obj.isA("Pit")){
      }
    },

    killed: function(collision){
      if(collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")){
        this.p.live--;
        if(this.p.live<=0){
          this.destroy();
        }
      }

    },

    step: function(dt){
      if(this.p.alive){
        if(this.p.vx>0) this.p.sheet="viperix1";
        if(this.p.vx<0) this.p.sheet="viperix11";
        if(this.p.vx==0) this.p.vx=-this.p.vx;
      }
    }

  });
  

  Q.scene("Level101", function(stage) {
    Q.stageTMX("Level101.tmx", stage);
    const player = stage.insert(new Q.Pit());
    stage.add("viewport").follow(player);
    stage.viewport.scale= 2;
    stage.insert(new Q.Viperix({ x: 60, y: 2666 }));
    
  });
  

 

  Q.loadTMX("Level101.tmx , Level1.png , Pit.png, Pit.json, EnemigosL1.png, EnemigosL1.json", function() {
    Q.compileSheets("Pit.png", "Pit.json");
    Q.compileSheets("EnemigosL1.png", "EnemigosL1.json");
    Q.stageScene("Level101");
  });
};