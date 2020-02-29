window.requestAnimationFrame(function () {
    document.querySelector("#start-sm")
        .addEventListener("click", simMan.startSimulation);

    document.querySelector("#stop-sm")
        .addEventListener("click", simMan.stopSimulation);


    this.tileContainer = document.querySelector(".tile-container-sim");
    this.scoreContainer = document.querySelector(".score-container-sim");
    this.bestContainer = document.querySelector(".best-container-sim");
    this.messageContainer = document.querySelector(".game-message-sim");

    var elements = document
        .querySelectorAll(".tile-container, .score-container, .best-container, .game-message");
    var body = document.getElementById("simulation-sandbox");

    for (var i = 0, im = elements.length; im > i; i++) {
        let cloneEl = elements[i].cloneNode(true);

        cloneEl.className = cloneEl.className + "-sim";

        if (cloneEl.className !== "tile-container-sim")
            cloneEl.className += " hidden";

        body.appendChild(cloneEl);
    }
});

let simMan = {
    SIM_IN_PROG: false,

    startSimulation: async _ => {
        simMan.stopSimulation();

        simMan.SIM_IN_PROG = true;
        if (gameManager.over) gameManager.inputManager.events.restart[0]()

        simMan.simulationLoop();
    },

    simulationLoop: async _ => {
        let scores = [
            [(await simMan.simulateMoveEnv(0)), 0],
            [(await simMan.simulateMoveEnv(1)), 1],
            [(await simMan.simulateMoveEnv(2)), 2],
            [(await simMan.simulateMoveEnv(3)), 3]
        ]

        let bestMove = scores.reduce((prev, current) => prev[0] <= current[0] ? current : prev)
        console.log("bestMove", bestMove);

        gameManager.inputManager.events.move[0](bestMove[1]);

        if (!gameManager.over && simMan.SIM_IN_PROG) {
            simMan.simulationLoop();
        } else {
            simMan.stopSimulation();
        }
    },

    stopSimulation: _ => {
        simMan.SIM_IN_PROG = false;
    },

    simulateMoveEnv: (firstMove) => {
        let localGameManager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager, true);

        // Tests
        // setTimeout(() => {
        //     localGameManager.inputManager.events.move[0](firstMove);
        //     setTimeout(() => {
        //         localGameManager.inputManager.events.move[0](1);
        //         setTimeout(() => {
        //             localGameManager.inputManager.events.move[0](2);
        //         }, 500);
        //     }, 500);
        // }, 500);

        // return new Promise((resolve, reject) => {
        //     setTimeout(() => {
        //         resolve(1);
        //     }, 3000);
        // })

        let moved = localGameManager.inputManager.events.move[0](firstMove);
        if (!moved) return localGameManager.score;

        return simMan.randTillOver(localGameManager);
    },

    randTillOver: localGameManager => {
        return new Promise((resolve, reject) => {
            let randomMoveI = setInterval(() => {
                if (!localGameManager.over && simMan.SIM_IN_PROG) {
                    let randMove = Math.floor(Math.random() * 10 % 5);
                    try {
                        localGameManager.inputManager.events.move[0](randMove);
                    } catch (error) { }
                } else {
                    clearInterval(randomMoveI);
                    resolve(localGameManager.score);
                }
            }, 0);
        })
    }
}