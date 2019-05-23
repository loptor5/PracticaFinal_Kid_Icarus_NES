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


        var yIniViperix= 2592;
        var xIniViperi= 96;
        for(var i=0; i< 4; i++){
            for(var j=0; j<4; j++){
                stage.insert(new Q.Viperix({ x: xIniViperi+j*16, y: yIniViperix }));
            }
            yIniViperi+=100;
        }
        /*
        stage.insert(new Q.Viperix({ x: 96, y: 2592 }));
        stage.insert(new Q.Viperix({ x: 128, y: 2592 }));
        stage.insert(new Q.Viperix({ x: 176, y: 2528 }));
        stage.insert(new Q.Viperix({ x: 208, y: 2528 }));
        stage.insert(new Q.Viperix({ x: 176, y: 2368 }));
        stage.insert(new Q.Viperix({ x: 192, y: 2336 }));
        stage.insert(new Q.Viperix({ x: 32, y: 2208 }));
        stage.insert(new Q.Viperix({ x: 32, y: 2096 }));*/
        stage.insert(new Q.Monoculus({ x: 32, y: 2048, yIni: 2047, yFin: 2147, time: 0 }));
        stage.insert(new Q.Monoculus({ x: 32, y: 2032, yIni: 2031, yFin: 2131, time: 0.5 }));
        stage.insert(new Q.Monoculus({ x: 32, y: 2016, yIni: 2015, yFin: 2115, time: 1 }));
        stage.insert(new Q.Monoculus({ x: 32, y: 2000, yIni: 1999, yFin: 2199, time: 1.5 }));
        stage.insert(new Q.Monoculus({ x: 32, y: 1872, yIni: 1871, yFin: 1971, time: 0 }));
        stage.insert(new Q.Monoculus({ x: 32, y: 1840, yIni: 1939, yFin: 1940, time: 0.2 }));
        stage.insert(new Q.Monoculus({ x: 32, y: 1840, yIni: 1839, yFin: 1940, time: 1 }));
        stage.insert(new Q.Monoculus({ x: 32, y: 1808, yIni: 1807, yFin: 1908, time: 0.25 }));
        stage.insert(new Q.Monoculus({ x: 32, y: 1776, yIni: 1775, yFin: 18776, time: 0.75 }));
        stage.insert(new Q.Monoculus({ x: 32, y: 1360, yIni: 1359, yFin: 1460, time: 0 }));
        stage.insert(new Q.Funesto({ x: 157, y: 1346, xIni: 136, xFin: 164 }));
        stage.insert(new Q.Napias({ x: 32, y: 1024, yIni: 1023, yFin: 1124, time: 0.5 }));
        stage.insert(new Q.Napias({ x: 32, y: 992, yIni: 991, yFin: 1092, time: 0.25 }));
        stage.insert(new Q.Funesto({ x: 135, y: 1104, xIni: 95, xFin: 160 }));
        stage.insert(new Q.FunestoM({ x: 112, y: 864, yIni: 863, yFin: 964, time: 0 }));
        stage.insert(new Q.FunestoM({ x: 112, y: 832, yIni: 831, yFin: 932, time: 0.33 }));
        stage.insert(new Q.FunestoM({ x: 112, y: 800, yIni: 799, yFin: 900, time: 0.66 }));
        stage.insert(new Q.FunestoM({ x: 112, y: 768, yIni: 767, yFin: 868, time: 0.99 }));
        stage.insert(new Q.Funesto({ x: 63, y: 544, xIni: 46, xFin: 80 }));
        stage.insert(new Q.Funesto({ x: 151, y: 480, xIni: 126, xFin: 176 }));
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

            
        // INICIALIZA SCORE
        Q.state.set({ score: 0, lives: 7 });
    });
}