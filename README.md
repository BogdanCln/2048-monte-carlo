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
  ```
  FOR N times (N = iterations per move, variable that can be controller from the web page)
      Execute random moves until the game is over
- Get the average final score of the N iterations for copy #1
- On copy #2 execute move right
  ```
  FOR N times (N = iterations per move, variable that can be controller from the web page)
      Execute random moves until the game is over
- Get the average final score of the N iterations for copy #2
- On copy #3 execute move up 
  ```
  FOR N times (N = iterations per move, variable that can be controller from the web page)
      Execute random moves until the game is over
- Get the average final score of the N iterations for copy #3
- On copy #4 execute move down
  ```
  FOR N times (N = iterations per move, variable that can be controller from the web page)
    Execute random moves until the game is over
- Get the average final score of the N iterations for copy #4

- Choose the move equivalent to the copy that made the highest average score
- Execute that move on the actual game
- Jump to 1