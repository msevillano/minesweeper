
# Mine Sweeper API

## Folder Structure

```txt
  src/
    |__ config/  ......................  parameter definitions for several environments
    |__ models/  ......................  game rules and data structures defined as objects
          |__ minesweeper/  ...........  object modeling for minesweeper game       
    |-- public/  ......................  exposed endpoints of app
          |__ minesweeper/  ...........  minesweeper endpoints
          |__ status.js  ..............  app status
    |__ utils/  .......................  utilities
  test/
    |__ models/  ......................  tests for game rules and data structures defined as objects
          |__ minesweeper/  ...........  tests for object modeling for minesweeper game       
    |-- public/  ......................  tests for exposed endpoints of app
          |__ minesweeper/  ...........  tests for minesweeper endpoints
          |__ status.js  ..............  tests for app status

```
## Explaining the data models

### How the game is modeled

Minesweeper, in this case, has been modeled as a 2D array of cells contained in a board, the board with some other atributes are contained in an minesweeper instance that handles everything on the game (start, finsish reveal/mark cells).

Others ways of modeling the game could be as a map of cells (map keys would be the position on the board).

### Cell class

It knows its own position, if it has a bomb, its current state and if it hasn't a bomb, the bombCount (amount of bombs on neighborhood).
Its able to change its own state when asked to.

### board class

It knows the placement of the cells on the board, it knows how to create, change status of, and calculate the bombCount of every cell.

### Minesweeper class

It knows how to interact with the board and keep game status info such as time and if the game ended or not.
It also knows how to start a new game. 
This class should be te only one public, board and cells shouldn't be accesed on their own

## Game API

### `/status`

Shows the app status [online | offline | maintainance]

### POST `/minsweeper/start`

Starts a new game
Post body example:

            { 
              x: 10,
              y: 10,
              bombCount: 10
            }
it returns the game model (cells are hidden for obvious reasons)

### GET `/minsweeper/find/{gameId}`

Searchs an already started game

it returns the game model (cells that aren't revealed yet hide some info)

### POST `/minsweeper/update/{gameId}/{status}`

marks a given cell with the given status
Post body example:

            { 
              x: 1,
              y: 1
            }

it returns all the cells that changed with that request

## Arq and technologies

Class modeling has been done with JS, then added Mongoose as ODM. Server framework is Serverless.

Unit testing has been made with Jest. (there is a bad dependency here, a MongoDB instance is needed for test to run - i couldn't fix this on time)

Code conventions provided by Google ESLint plugin.