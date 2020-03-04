window.requestAnimationFrame(function () {
    document.querySelector("#start-sm")
        .addEventListener("click", simMan.startSimulation);

    document.querySelector("#stop-sm")
        .addEventListener("click", simMan.stopSimulation);

    document.querySelector("#simulation-update-speed")
        .addEventListener("click", simMan.updateSpeed);

    document.querySelector("#simulation-update-iterations")
        .addEventListener("click", simMan.updateIterations);

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
    speed: 100,
    simIterations: 10,

    updateIterations: _ => {
        simMan.simIterations = parseInt(document.querySelector("#simulation-iterations").value);
    },

    updateSpeed: _ => {
        simMan.speed = parseInt(document.querySelector("#simulation-speed").value);
    },

    startSimulation: async _ => {
        simMan.stopSimulation();

        setTimeout(() => {
            simMan.SIM_IN_PROG = true;
            if (gameManager.over) gameManager.inputManager.events.restart[0]()

            simMan.simulationLoop();
        }, 500);
    },

    simulationLoop: async _ => {
        clearDOMLogger();

        // full async mode will completly block the browser window until the main game is finished
        // let scores = [
        //     [(await simMan.simulateMoveEnv(0)), 0],
        //     [(await simMan.simulateMoveEnv(1)), 1],
        //     [(await simMan.simulateMoveEnv(2)), 2],
        //     [(await simMan.simulateMoveEnv(3)), 3]
        // ]

        let scores = [];

        // Doing the simulations synchronously so that we can see the final state in the simulation sandbox
        // and to avoid crashing the browser window
        simMan.simulateMoveEnv(0).then(async result => {
            scores[0] = [result, 0];
            if (simMan.speed < 1000) await sleep(simMan.speed);

            simMan.simulateMoveEnv(1).then(async result => {
                scores[1] = [result, 1];
                if (simMan.speed < 1000) await sleep(simMan.speed);

                simMan.simulateMoveEnv(2).then(async result => {
                    scores[2] = [result, 2];
                    if (simMan.speed < 1000) await sleep(simMan.speed);

                    simMan.simulateMoveEnv(3).then(async result => {
                        scores[3] = [result, 3];

                        let bestMove = scores.reduce((prev, current) => prev[0] <= current[0] ? current : prev)
                        DOMLogger("Highest score simulation: " + bestMove);
                        console.log("Highest score simulation: " + bestMove);

                        gameManager.inputManager.events.move[0](bestMove[1]);

                        if (simMan.speed < 1000) await sleep(simMan.speed * 2);

                        if (!gameManager.over && simMan.SIM_IN_PROG) {
                            simMan.simulationLoop();
                        } else {
                            simMan.stopSimulation();
                        }
                    })
                })
            })
        })

    },

    stopSimulation: _ => {
        simMan.SIM_IN_PROG = false;
    },

    simulateMoveEnv: (firstMove, iterationNO = 0, scoresSum = 0) => {
        console.log(iterationNO, scoresSum)

        let localGameManager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager, true);

        let moveAlias;
        switch (firstMove) {
            case 0:
                moveAlias = "up";
                break;
            case 1:
                moveAlias = "right";
                break;
            case 2:
                moveAlias = "down";
                break;
            case 3:
                moveAlias = "left";
                break;
            default:
        }

        return new Promise(async (resolve, reject) => {
            let moved = localGameManager.inputManager.events.move[0](firstMove);
            if (!moved) {
                DOMLogger("Can't move is the " + moveAlias + " direction | " + localGameManager.score);
                console.log("Can't move is the " + moveAlias + " direction | " + localGameManager.score);
                resolve(localGameManager.score); // Can;t move from the very
            }
            else {
                let result = simMan.speed < 1000 ?
                    await simMan.randTillOver(localGameManager)
                    :
                    await simMan.randTillOverLazy(localGameManager);

                let logMsg = `Score with first move as ${moveAlias} on iteration #${iterationNO}:  ${result}`;
                // DOMLogger(logMsg);
                console.log(logMsg);

                scoresSum += result;
                iterationNO++;

                if (iterationNO < simMan.simIterations)
                    resolve(await simMan.simulateMoveEnv(firstMove, iterationNO, scoresSum));
                else {
                    let logMsg = `Avg score with first move as ${moveAlias} after ${iterationNO} iterations:  ${scoresSum / iterationNO}`;
                    DOMLogger(logMsg);
                    console.log(logMsg);

                    resolve(scoresSum / iterationNO);
                }
            }
        })
    },

    randTillOver: localGameManager => {
        return new Promise((resolve, reject) => {
            while (true) {
                if (!localGameManager.over 
                    && !localGameManager.won
                    && simMan.SIM_IN_PROG) {
                    let randMove = Math.floor(Math.random() * 10 % 4);
                    try {
                        localGameManager.inputManager.events.move[0](randMove);
                    } catch (error) {
                        console.error(randMove, error)
                     }
                } else {
                    if(localGameManager.won)
                    console.warn("Got a simulation with 2048 tile!")
                    resolve(localGameManager.score);
                    break;
                }
            }
        })
    },

    randTillOverLazy: localGameManager => {
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
            }, (simMan.speed === 1000) ? 0 : simMan.speed / 100);
        })
    }
}

function sleep(time) {
    return new Promise((resolve, _) => {
        setTimeout(resolve, time);
    })
}

function DOMLogger(message) {
    let log = document.createElement("p")
    log.innerHTML = message;
    document.querySelector("#simulation-logger").appendChild(log);
}

function clearDOMLogger() {
    document.querySelector("#simulation-logger").innerText = "";
}