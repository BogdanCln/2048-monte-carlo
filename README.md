# 2048 game - Monte Carlo simulations

## 1. 
- Get the current game state(4x4 array of values that are powers of 2)
- 
    ```
    IF game is not over(eg.: there is a null value in the array)
      THEN GO TO 2
    ELSE STOP EXECUTION

## 2. 
- Copy the current game state 4 times
- On copy #1 execute move left
- On copy #2 execute move right
- On copy #3 execute move up 
- On copy #4 execute move down
- For each copy continue with random moves until the game is over
- Get the final score for each of the copies
- Choose the move equivalent to the copy that made the highest score
- Execute that move on the actual game
- Jump to 1