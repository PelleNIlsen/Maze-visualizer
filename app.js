const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.')));

app.get('/generate', (req, res) => {
    const size = parseInt(req.query.size);
    const maze = generateMaze(size);

    res.json(maze);
});

app.get('/solve', (req, res) => {
    const maze = JSON.parse(req.query.maze);
    const result = solveMaze(maze);
    res.json(result);
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

function generateMaze(size) {
    const maze = new Array(size).fill(null).map(() => new Array(size).fill(1));
    const startX = Math.floor(Math.random() * size);
    const startY = Math.floor(Math.random() * size);

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function isValid(x, y) {
        return x >= 0 && y >= 0 && x < size && y < size;
    }

    function hasUnvisitedNeighbours(x, y) {
        return directions.some(([dx, dy]) => isValid(x + 2 * dx, y + 2 * dy) && maze[y + 2 * dy][x + 2 * dx]);
    }

    function dfs(x, y) {
        maze[y][x] = 0;

        shuffleArray(directions);

        for (let [dx, dy] of directions) {
            const nx = x + 2 * dx;
            const ny = y + 2 * dy;

            if (isValid(nx, ny) && maze[ny][nx] === 1 && hasUnvisitedNeighbours(nx, ny)) {
                maze[y + dy][x + dx] = 0;
                dfs(nx, ny);
            }
        }
    }

    dfs(startX, startY);

    maze[0][0] = 0;
    maze[size - 1][size - 1] = 0;

    return maze;
}

function solveMaze(maze) {
    const size = maze.length;
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // right, down, left, up
    const stack = [[0, 0]]; // stack for DFS
    const visited = new Array(size).fill(0).map(() => new Array(size).fill(false));
    visited[0][0] = true;
    const path = [];
    const visitedCells = [];

    function dfs(x, y) {
        path.push([x, y]);
        visitedCells.push([x, y]);
        if (x === size - 1 && y === size - 1) { // Reached the end
            return true;
        }
        for (let [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < size && ny < size && !visited[ny][nx] && maze[ny][nx] === 0) {
                visited[ny][nx] = true;
                if (dfs(nx, ny)) {
                    return true;
                } else {
                    // No path forward, so backtrack
                    for (let i = path.length - 1; i >= 0; i--) {
                        visitedCells.push(path[i]); // Record each cell on the backtrack path
                        if (path[i][0] === x && path[i][1] === y) {
                            break; // Stop when back to current junction
                        }
                    }
                }
            }
        }
        path.pop();
        return false;
    }

    if (dfs(0, 0)) {
        return {solution: path, visitedCells: visitedCells};
    } else {
        return {solution: null, visitedCells: visitedCells}; // No solution found
    }
}
