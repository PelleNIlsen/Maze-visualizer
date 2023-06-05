const CELL_SIZE = 20;
const WALL_COLOR = '#000000';
const PATH_COLOR = '#FFFFFF';
const SOLUTION_COLOR = '#FF0000';
const SEARCH_COLOR = 'rgba(255, 255, 0, .5)';

const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');

function drawMaze(maze) {
    const size = maze.length;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            ctx.fillStyle = maze[y][x] ? WALL_COLOR : PATH_COLOR;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

function drawSearchPath(x, y, opacity) {
    ctx.fillStyle = `rgba(255, 255, 0, ${opacity})`; // Increase opacity with each visit
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawSolution(solution) {
    for (let [x, y] of solution) {
        ctx.fillStyle = SOLUTION_COLOR;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
}

async function updateMaze(maze, visitedCells, solution) {
    drawMaze(maze);
    const visitCount = Array(maze.length).fill(0).map(() => Array(maze.length).fill(0));
    for (let [x, y] of visitedCells) {
        visitCount[y][x]++;
        drawSearchPath(x, y, Math.min(visitCount[y][x] * 0.2, 1)); // cap max opacity at 1
        await new Promise(r => setTimeout(r, 50)); // Delay for animation
    }
    await new Promise(r => setTimeout(r, 1000)); // Delay before drawing the solution
    drawSolution(solution);
}

async function generateMazeFromServer(size) {
    const response = await fetch(`http://localhost:3000/generate?size=${size}`);
    const maze = await response.json();
    return maze;
}

async function solveMazeOnServer(maze) {
    const response = await fetch(`http://localhost:3000/solve?maze=${JSON.stringify(maze)}`);
    const solution = await response.json();
    return solution;
}

async function generateAndSolveMaze(size) {
    const maze = await generateMazeFromServer(size);
    const result = await solveMazeOnServer(maze);
    await updateMaze(maze, result.visitedCells, result.solution);
}
