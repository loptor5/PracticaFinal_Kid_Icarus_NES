function loadScenes(Q)
{
    // HUD

    Q.scene("HUD", function (stage)
    {
        stage.insert(new Q.Score());
    });

    // SCORE

    Q.UI.Text.extend("Score",
    {
    init: function (p)
    {
        this._super(
        {
            label: "LIVES: " + barraVida(Q.state.get("lives")) + "\n\nHEARTS: " + Q.state.get("score"),
            color: "white",
            family: "PressStart2P",
            align: "left",
            x: 150,
            y: 25
        });

        Q.state.on("change.score", this, "score");
        Q.state.on("change.lives", this, "lives");
    },
    score: function (score)
    {
        this.p.label = "LIVES: " + barraVida(Q.state.get("lives")) + "\n\nHEARTS: " + score;
    },

    lives: function (lives)
    {
        this.p.label = "LIVES: " + barraVida(lives) + "\n\nHEARTS: " + Q.state.get("score");
    } 
    });

    // BARRA DE VIDA
    
    var barraVida = function(num)
    {
        let barra = "[";
        for(let i = 1; i <= 7; i++)
        {
            num >= i ? barra += "|" : barra += " ";
        }
        barra += "]";
        return barra;
    }

    // END GAME

    Q.scene("endGame", function(stage)
    {
        Q.audio.stop(); // para toda la musica
        Q.audio.play("Game_Over.mp3", { loop: false }); // Reproduce la musica de Game Over

        const container = stage.insert(
        new Q.UI.Container(
        {
            x: Q.width/2,
            y: Q.height/2,
            fill: "rgba(0,0,0,0.5)"
        }));

        const button = container.insert(
        new Q.UI.Button(
        {
            x: 0,
            y: 0,
            color: "#FFFFFF",
            fill: "#CCCCCC",
            label: "Press 'ENTER' to play again"
            //keyActionName: "fire"
        }));

        const label = container.insert(
        new Q.UI.Text(
        {
            family: "PressStart2P",
            color: "#FFFFFF",
            x: 10,
            y: -10 - button.p.h,
            label: stage.options.label
        }));

        container.fit(20);

    });

    // WIN GAME

    Q.scene("winGame", function(stage)
    {
        Q.audio.stop(); // para toda la musica
        Q.audio.play("Nivel_Completado.mp3", { loop: false }); // Reproduce la musica de Nivel Completado


        const container = stage.insert(
            new Q.UI.Container(
            {
                x: Q.width/2,
                y: Q.height/2,
                fill: "rgba(0,0,0,0.5)"
            })
        );

        const button = container.insert(
            new Q.UI.Button(
            {
                x: 0,
                y: 0,
                fill: "#FFFFFF",
                label: "Press 'ENTER' to play again"
                //keyActionName: "fire"
            })
        );

        const label = container.insert(
            new Q.UI.Text(
            {
                family: "PressStart2P",
                color: "#FFFFFF",
                x: 10,
                y: -10 - button.p.h,
                label: stage.options.label
            })
        );

        container.fit(20);
    });

    // TITULO

    Q.scene("TitleScreen", function (stage)
    {

        Q.audio.play("Titulo.mp3", { loop: true }); // Reproduce la musica del TitleScreen

        stage.insert(new Q.UI.Button(
        {
            asset: "TitleScreen.png",
            x: Q.width / 2,
            y: Q.height / 2,
            scaleToFit: true,
            scale: 2.85
        }))

        Q.input.on("confirm", function()
        {
            Q.audio.stop(); // para toda la musica
            Q.clearStages();
            Q.stageScene("Level101");
            Q.stageScene("HUD", 1);
        });
    });

    // NIVEL 1

    Q.scene("Level101", function (stage)
    {
        Q.audio.play("Nivel_1.mp3", { loop: true }); // Reproduce la musica del Nivel 1
        Q.stageTMX("Level101.tmx", stage);
        const player = stage.insert(new Q.Pit());
        stage.add("viewport").follow(player);
        stage.viewport.scale = 2;


        var yIniEnemy= 2592;
        var xIniEnemy= 96;
        for(var i=0; i< 3; i++){
            for(var j=0; j<4; j++){
                stage.insert(new Q.Viperix({ x: xIniEnemy+j*24, y: yIniEnemy }));
            }
            yIniEnemy-=300;
        }


        for(var i=0; i< 3; i++){
            for(var j=0; j<4; j++){
                stage.insert(new Q.Monoculus({ x: xIniEnemy, y: yIniEnemy, yIni:yIniEnemy+1, yFin:yIniEnemy+100, time:0.25*j }));
            }
            yIniEnemy-=150;
        }

        stage.insert(new Q.Funesto({ x: 157, y: 1346, xIni: 136, xFin: 164 }));
        stage.insert(new Q.Funesto({ x: 135, y: 1104, xIni: 95, xFin: 160 }));
        stage.insert(new Q.Funesto({ x: 63, y: 544, xIni: 46, xFin: 80 }));
        stage.insert(new Q.Funesto({ x: 151, y: 480, xIni: 126, xFin: 176 }));

        yIniEnemy=864;

        for(var i=0; i< 3; i++){
            for(var j=0; j<4; j++){
                stage.insert(new Q.FunestoM({ x: xIniEnemy+j*24, y: yIniEnemy, yIni:yIniEnemy+1, yFin:yIniEnemy+100, time:0.25*j }));
            }
            yIniEnemy-=150;
        }

        stage.insert(new Q.Fuego({ x: 176, y: 480 }));
        stage.insert(new Q.Fuego({ x: 48, y: 432 }));
        stage.insert(new Q.Fuego({ x: 96, y: 256 }));
        stage.insert(new Q.Netora({ x: 80, y: 128 }));
        stage.insert(new Q.Netora({ x: 192, y: 128 }));

        stage.insert(new Q.Door({x: 16, y:2752, tipoPuerta: "doorB", sheet: "doorBClose", modelo:-1 }));
        stage.insert(new Q.Door({x: 241, y:3200, tipoPuerta: "doorB", sheet: "doorBOpen", modelo: 2 }));
        stage.insert(new Q.Door({x: 241, y:2965, tipoPuerta: "doorB", sheet: "doorBOpen", modelo: 5 }));
        stage.insert(new Q.Door({x: 241, y:2512, tipoPuerta: "doorA", sheet: "doorAOpen", modelo: 1 }));
        stage.insert(new Q.Door({x: 64, y:1317, tipoPuerta: "doorA", sheet: "doorAOpen", modelo: 3 }));
        stage.insert(new Q.Door({x: 192, y:1093, tipoPuerta: "doorA", sheet: "doorAOpen", modelo: 4 }));
        stage.insert(new Q.Door({x: 240, y:117, tipoPuerta: "doorB", sheet: "doorBOpen", modelo: 0 }));

        stage.insert(new Q.BonusLives({ x: 105, y: 1844, sheet: "copa", bonus: 1 }));
        stage.insert(new Q.BonusLives({ x: 77, y: 1124, sheet: "frasco", bonus: 6 }));

            
        // INICIALIZA SCORE
        Q.state.set({ score: 0, lives: 7 });
    });
}