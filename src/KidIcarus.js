var game = function(){
  var Q= window.Q= Quintus()
    .include("Sprites, Scenes,Input, UI, Touch, TMX, Anim, 2D")
      .setup({maximize: true})
      .controls()
      .touch();


  Q.Sprite.extend("Pit",{
    init: function(p) {
      this._super(p, {
        sprite: "pit_anim",
        sheet: "pit",
        gravity: 0.65,
        x: 100,
        y: 2768,
        frame: 1,
        alive:true,
        sort: true
      });

      this.add("2d, platformerControls, animation");
      this.on("bump.left, bump.right", function(collision){});
      this.on("bump.up", function(collision){
        if(this.p.vy >0){
          this.z=z+2;
        }else{
          this.z=0;
        }

      } );
      this.on("fire", this, "shoot");
    },
    step: function(dt){
      if(this.p.alive){
        if(this.p.x>257) this.p.x=1;
        if(this.p.x<0) this.p.x=256;
        if(this.p.vx === 0) this.play("stand_right");
        if(this.p.vx >0) this.play("walk_right");
        if(this.p.vx <0) this.play("walk_left");
        if(this.p.vy >0 || this.p.vy <0) this.play("jump_right");
        if((this.p.vy >0 || this.p.vy <0)&& this.p.vx <0) this.play("jump_left");
      }
    }
  });
  //----------------------------------------------------------------------//
  
  Q.animations("pit_anim",{
    stand_right: {frames:[1], flip:false, loop:true, rate: 1/5},
    stand_left: {frames:[1], flip: "x", loop:true, rate: 1/5},
    walk_right: {frames: [1,2,3], rate: 1/15, flip:false, loop:true},
    walk_left: {frames: [1,2,3], rate: 1/15, flip: "x", loop:true},
    jump_right: {frames: [6,7], flip: false, loop: true, rate: 1/5},
    jump_left: {frames: [6,7], flip: "x", loop: true, rate: 1/5},
    death: {frames:[0], flip:false, rate:2, loop:false, trigger: "dying"}
  });
  

  Q.scene("Level101", function(stage) {
    Q.stageTMX("Level101.tmx", stage);
    const player = stage.insert(new Q.Pit());
    stage.add("viewport").follow(player);
    stage.viewport.offsetX = -1300;
    stage.viewport.offsetY = 1600;
    
  });
  

 

  Q.loadTMX("Level101.tmx , Level1.png , Pit.png, Pit.json", function() {
    Q.compileSheets("Pit.png", "Pit.json");
    Q.stageScene("Level101");
  });
};