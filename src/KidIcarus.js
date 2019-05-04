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
        type: SPRITE_PLAYER=1;
        gravity: 0.65,
        x: 100,
        y: 2768,
        frame: 1,
        alive:true,
        sort: true
      });

      this.add("2d, platformerControls, animation");
      this.on("bump.left, bump.right, bump.up", function(collision){});
      this.on("fire", this, "shoot");
    },
    step: function(dt){
      if(this.p.alive){
        if(this.p.x>257) this.p.x=1;
        if(this.p.x<0) this.p.x=256;
        if(this.p.vx >0) this.play("walk_right");
        if(this.p.vx <0) this.play("walk_left");
        if(this.p.vy >0 || this.p.vy <0) this.play("jump_right");
        if((this.p.vy >0 || this.p.vy <0)&& this.p.vx <0) this.play("jump_left");
      }
    },
    shoot: function() {
      var p= this.p;
      this.stage.insert(new Q.Arrow({
        x: p.x;
        y: p.y-p.w/2;
        vx: -200;
      }))
    }
  });
  //----------------------------------------------------------------------//
  
  Q.animations("pit_anim",{
    stand_right: {frames:[1], flip:false, loop:true, rate: 1/5},
    stand_left: {frames:[1], flip: "x", loop:true, rate: 1/5},
    walk_right: {frames: [1,2,3], rate: 1/16, flip:false, loop:true},
    walk_left: {frames: [1,2,3], rate: 1/16, flip: "x", loop:true},
    jump_right: {frames: [6,7], flip: false, loop: true, rate: 1/5},
    jump_left: {frames: [6,7], flip: "x", loop: true, rate: 1/5},
    death: {frames:[0], flip:false, rate:2, loop:false, trigger: "dying"}
  });
  //----------------------------------------------------------------------//

  Q.MovingSprite.extend("Arrow", {
    init: function(p) {
      this._super(p, {
        sheet: "arrow",
        sprite: "arrow",
        type: SPRITE_BULLET,
        collisionMask: SPRITE_ENEMY,
        sensor: true;
      });
      this.add("2d");
    },

    step: funstion(dt){
      if(this.p.vx==0){
        this.destroy();
      }
    }
  });
  

  Q.scene("Level101", function(stage) {
    Q.stageTMX("Level101.tmx", stage);
    const player = stage.insert(new Q.Pit());
    stage.add("viewport").follow(player);
    stage.viewport.scale= 2;
    
  });
  

 

  Q.loadTMX("Level101.tmx , Level1.png , Pit.png, Pit.json", function() {
    Q.compileSheets("Pit.png", "Pit.json");
    Q.stageScene("Level101");
  });
};