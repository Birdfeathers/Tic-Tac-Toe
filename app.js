const table = document.getElementsByTagName("table")[0];
let turnText = document.getElementById("turnText");
let submit = document.getElementById("submit");

class Board{
    constructor(numRows, numCols, winLength, mode, name1, name2, style){
        this.numRows = numRows;
        this.numCols= numCols;
        this.turn = "black";
        this.winLength = winLength;
        this.mode = mode;
        this.gameOver = false;
        this.checker = makeTableChecker(numRows, numCols);
        if(mode == "blackComp")
        {
            this.blackName = "Computer";
            this.whiteName = name1;
        }
        else if(mode == "whiteComp")
        {
            this.blackName = name1;
            this.whiteName = "Computer"
        }
        else{
            this.blackName = name1;
            this.whiteName = name2;
        }
        this.totalTurns = numRows * numCols;
        this.turnNumber = 1;
        this.blackLines = {
            currentID : 0
            
        };
        this.whiteLines = {
            currentID : 0
        };
        this.style = style;

        
    }
}

function iterateLine(linetype, Row, Col, forward = true)
{
    if(linetype != "vertical")
        {
            if(forward) Col++;
            else Col--;
        }
        if(linetype == "vertical" || linetype =="negative")
        {
            if(forward) Row++;
            else Row--;
        }
        if(linetype == "positive")
        {
            if(forward)Row--;
            else Row++;
        }
        return{row: Row, column : Col};
}


function adjustNums(board, line, linetype , num)
{
    let currentRow = line.start.row;
    let currentColumn = line.start.column;
    for(i = 0; i < line.length; i++)
    {
        board.checker[currentRow][currentColumn].stone[linetype] = num;
        // if(linetype != "vertical")
        // {
        //     currentColumn++;
        // }
        // if(linetype == "vertical" || linetype =="negative")
        // {
        //     currentRow++;
        // }
        // if(linetype == "positive")
        // {
        //     currentRow--;
        // }
        let position = iterateLine(linetype, currentRow, currentColumn);
        currentRow = position.row;
        currentColumn = position.column;

    }
}


class Line{
    constructor(startRow, startColumn,color, type){
        this.type = type;
        this.color = color;
        this.length = 1;
        this.start = {row : startRow, column : startColumn}; // left, top horizontal
        this.end = {row : startRow, column : startColumn}; // right, bottom horizontal
       
    }
}

function mergeLines(line1, line2)
{
    line1.end = line2.end;
    line1.length += line2.length;
    return line1;
}


class stone{
    constructor(board, row, column, color)
    {
        this.color = color;
        //position:
        this.row = row;
        this.column = column;
        // create lines for all eight directions and add them to board.
        let horizontal= new Line(row, column, color, "horizontal");
        let vertical = new Line(row, column, color, "vertical");
        let positive = new Line(row, column, color, "positive");
        let negative = new Line(row, column, color, "negative");
        let currentID = board[color + "Lines"]["currentID"];
        board[color + "Lines"][currentID] = horizontal;
        this.horizontal =  currentID;
        currentID++;
        board[color + "Lines"][currentID] = vertical;
        this.vertical =  currentID;
        currentID++;
        board[color + "Lines"][currentID] = positive;
        this.positive = currentID;
        currentID++;
        board[color + "Lines"][currentID] = negative;
        this.negative = currentID;
        currentID++;
        board[color + "Lines"]["currentID"] = currentID;

       
    }
}




function mergeSurroundingLines(board, stone, row, column, color)
{
            //surrounding stones:
            let up = checkSpace(board, row - 1, column, color);
            let down = checkSpace(board, row + 1, column, color);
            let left = checkSpace(board, row, column - 1, color);
            let right = checkSpace(board, row, column + 1, color);
            // positive vs. negative graph slope diagonals, and whether they're up or down from piece
            let posLeft = checkSpace(board, row + 1, column - 1, color); 
            let posRight = checkSpace(board, row - 1, column + 1, color);
            let negLeft = checkSpace(board, row -1, column - 1, color);
            let negRight = checkSpace(board, row + 1, column +1, color);

        if(up.color == "same")
        {
            mergeGroups(board, up.stone.vertical, stone.vertical, color, "vertical");
        }
        if(down.color == "same")
        {
            mergeGroups(board, stone.vertical, down.stone.vertical, color, "vertical");
        }
        if(left.color == "same")
        {
            mergeGroups(board, left.stone.horizontal, stone.horizontal, color, "horizontal");
        }
        if(right.color == "same")
        {
            mergeGroups(board, stone.horizontal, right.stone.horizontal, color, "horizontal");
        }
        if(posLeft.color == "same")
        {
            mergeGroups(board, posLeft.stone.positive, stone.positive, color, "positive");
        }
        if(posRight.color == "same")
        {
            mergeGroups(board, stone.positive, posRight.stone.positive, color, "positive");
        }
        if(negLeft.color == "same")
        {
            mergeGroups(board, negLeft.stone.negative, stone.negative, color, "negative");
        }
        if(negRight.color == "same")
        {
            mergeGroups(board, stone.negative, negRight.stone.negative, color, "negative");
        }
}

function mergeGroups(board, lineNum1, lineNum2, color, type)
{
    // line 2 will be merged into line 1
    let lineColor = color + "Lines";
    // board[lineColor][lineNum1].mergeLines(board[lineColor][lineNum2]);
    let line1 = board[lineColor][lineNum1];
    let line2 = board[lineColor][lineNum2];
    board[lineColor][lineNum1] = mergeLines(line1, line2);
    adjustNums(board, board[lineColor][lineNum2], type, lineNum1);
    delete board[lineColor][lineNum2];
}

function isInBounds(board, row, column)
{
    if(row < 0 || column < 0 || row >= board.numRows || column >= board.numCols) return false;
    return true;
}

function checkSpace(board, row, column, color)
{
    if(!isInBounds(board, row,column)) return "off board";
    if(board.checker[row][column].color == color) return {color : "same", stone: board.checker[row][column].stone};
    if(board.checker[row][column].occupied) return {color : "different", stone: board.checker[row][column].stone};
    return "open";

}

function addCross(cell, rowNum, colNum)
{
    const temp = document.getElementById("cross");
    let crossTemp = temp.content.cloneNode(true);
    cell.appendChild(crossTemp);
    let cross = cell.children[0];
    cross.classList.add("full", "orange");
    if(rowNum == 0)
    {
        let top = cross.children[0].children[1];
        top.classList.remove("borderLeft");
    }
    if(rowNum == board.numRows - 1)
    {
        let bottom = cross.children[1].children[1];
        bottom.classList.remove("borderLeft");
    }
    if(colNum == 0)
    {
        let left = cross.children[0].children[0];
        left.classList.remove("borderBottom");
    }
    if(colNum == board.numCols -1)
    {
        let right = cross.children[0].children[1];
        right.classList.remove("borderBottom");
    }
}

function addEdges(cell, rowNum, colNum)
{
    if(rowNum != board.numRows -1)
        cell.classList.add("borderBottom");
    if(colNum != 0)
        cell.classList.add("borderLeft");

}


function makeRow(numColumns, rowNum){
    const trow = document.createElement("tr");
   
   for (let i = 0; i < numColumns; i++){
    const tcell = document.createElement("td");
    if(board.style == "go") addCross(tcell, rowNum, i);
    else addEdges(tcell, rowNum, i);
    trow.appendChild(tcell);
   }
   
table.appendChild(trow);
}

function makeTable(numRows, numColumns)
{
    for(let i = 0; i < numRows; i++)
    {
        makeRow(numColumns, i);
    }
}
function makeSelect(id)
{
    for(let i = 3; i < 16; i++)
    {
        let opt = document.createElement("option");
        opt.value = i;
        opt.innerText = i;
        const sel = document.getElementById(id);
        sel.appendChild(opt);

    }
}

function makeTableChecker(numRows, numColumns)
{
    let TableChecker = [];
    for(let i = 0; i < numRows; i++)
    {
        let row = [];
        for(let j = 0; j < numColumns; j++)
        {
            row.push({occupied : false});
        }
        TableChecker.push(row);
    }
    return TableChecker;
}

function cellClicked(event)
{
    if(board.gameOver) return;
    if(board.mode == board.turn + "Comp") return;
    let cell;
    if(board.style == "go")
        cell  = event.target.parentNode.parentNode.parentNode;
    else cell = event.target;
    if(cell.tagName == "TD") 
      {  
        let row = cell.parentNode;
        // find row number by finding out what child number the row is:
        let rowNum = Array.prototype.indexOf.call(table.children, row); 
        // find column number by finding what child number the column is:
        let colNum = Array.prototype.indexOf.call(row.children, cell); 
        if(!board.checker[rowNum][colNum].occupied)
        {
            addPiece(board, cell, rowNum, colNum);
        }
    }
}
function addPiece(board, cell, rowNum, colNum)
{
        if(board.style == "go")addCircle(cell);
        else if(board.style == "x")addX(cell);
        board.checker[rowNum][colNum].occupied = true;
        board.checker[rowNum][colNum].color = board.turn;
        let piece = new stone(board, rowNum, colNum, board.turn);
        board.checker[rowNum][colNum].stone = piece;
        mergeSurroundingLines(board, piece, rowNum, colNum, board.turn);
        if(board.style == "none") return board;
        endTurn();
}

function getOpenings(board, line, color)
{
    let openings = [];
    const start = line.start;
    const end = line.end;
    let edge1 = iterateLine(line.type,start.row, start.column, false);
    let edge2 = iterateLine(line.type, end.row, end.column, true);
    if(checkSpace(board, edge1.row, edge1.column, color) == "open")
        openings.push(edge1);
    if(checkSpace(board, edge2.row, edge2.column,color) == "open")
        openings.push(edge2);
    return openings;
}

function checkLengths(board, color, length, minOpen = 0)
{
    let lines = board[color + "Lines"];
    let threshold = [];
    for(key in lines)
    {
        let open = 0;
        if(lines[key].length == length)
        {
            if(getOpenings(board, lines[key], color).length >= minOpen)
                threshold.push(lines[key]);
        }
    }
    return threshold;
}


function endTurn()
{
    if(checkLengths(board, board.turn, board.winLength).length > 0)
    {
        turnText.innerText = `Game over, ${board[board.turn + "Name"]} wins! Click Create New Game to play again.`;
        board.gameOver = true;
        return;
    }
    if(board.turnNumber == board.totalTurns)
    {
        turnText.innerText = "Draw. Click Create New Game to play again.";
        board.gameOver = true;
        return;
    }
    board.turnNumber++;
    if(board.turn == "black") board.turn = "white";
    else board.turn = "black";
    startTurn();
}

function startTurn()
{
    if(board.gameOver) return;
    turnText.innerText = `${board[board.turn + "Name"]}'s turn`
    if(board.mode == board.turn + "Comp")
        window.setTimeout(computerTurn, 1000);
}


function addCircle(cell)
{
    let circle = document.createElement("div");
    circle.classList.add("circle", "full", "top");
    circle.classList.add(board.turn);
    cell.appendChild(circle);
}

function addX(cell)
{
    if(board.turn == "black")
    {
        const temp = document.getElementById("cross");
        let crossTemp = temp.content.cloneNode(true);
        cell.appendChild(crossTemp);
        let cross = cell.children[0];
        cross.classList.add("full", "rotate45");
    }
    else
    {
        let circle = document.createElement("div");
        circle.classList.add("circle", "most", "border");
        cell.appendChild(circle);
    }
}

function getAllUnoccupied()
{
    let Unoccupied = [];
    for(let i = 0; i < board.numRows; i++)
    {
        for(let j = 0; j < board.numCols; j++)
        {
            if(!board.checker[i][j].occupied)
                Unoccupied.push({row: i, column : j, cell : table.children[i].children[j]});
        }
    }
    return Unoccupied;
}


function getRandomUnoccupied()
{
    const Unoccupied = getAllUnoccupied();
    const index = Math.floor(Math.random() * Unoccupied.length);
    return Unoccupied[index];
}

function getWinningMoves(color, num, minOpens = 0)
{
    copy = JSON.parse(JSON.stringify(board));
    copy.style = "none";
    copy.turn = color;
    const Unoccupied = getAllUnoccupied();
    let winningMoves = [];
    for(let i = 0; i < Unoccupied.length; i++)
    {
        const previous = JSON.parse(JSON.stringify(copy));
        copy = addPiece(copy, Unoccupied[i].cell, Unoccupied[i].row, Unoccupied[i].column);
        let check = checkLengths(copy, color, num, minOpens);
        if(check != 0)
        {
            winningMoves.push({space : Unoccupied[i], winNum: check.length});
        }

        copy = JSON.parse(JSON.stringify(previous));
    }
    return winningMoves;
    


}

function getMaxSpace(winningMoves)
{
    let maxSpace = winningMoves[0].space;
    let maxNum = winningMoves[0].winNum;
    for(let i = 1; i < winningMoves.length; i++)
    {
        if(winningMoves[i].winNum > maxNum)
        {
            maxSpace = winningMoves[i].space;
            maxNum = winningMoves[i].winNum;
        }
    }
    return maxSpace;
}


function computerTurn()
{
    const winLength = board.winLength;
    if(board.gameOver) return;
    let place;
    let other;
    if(board.turn == "black") other = "white";
    else other = "black";
    const winningMoves = getWinningMoves(board.turn, winLength);
    const otherWinningMoves = getWinningMoves(other, winLength);
    if(winningMoves.length != 0)
    {
        place = winningMoves[0].space;
    }
    else if(otherWinningMoves != 0)
    {
        place = getMaxSpace(otherWinningMoves);
    }
    else
    {
        const otherWinningMoves2 = getWinningMoves(other, winLength -1, 2);
        if(otherWinningMoves2.length > 1)
        {
            place = getMaxSpace(otherWinningMoves2);
        }
    }
    if(place == undefined) place = getRandomUnoccupied();
    addPiece(board, place.cell, place.row, place.column);

}

function deleteTable()
{
    while(table.children.length != 0)
    {
        table.children[0].remove();
    }
}



function CreateGame()
{
    let rows = Number(document.getElementById("numRows").value);
    let columns = Number(document.getElementById("numColumns").value);
    let winLength = Number(document.getElementById("winLength").value);
    let mode = document.getElementById("gametype").value;
    let name1 = document.getElementById("firstPlayer").value;
    let name2 = document.getElementById("secondPlayer").value;
    let style = document.getElementById("styles").value;
    let shuffle = document.getElementById("shuffle").checked;
    if(winLength > rows || winLength > columns){
        alert("Cannot make game with win Length greater than rows or columns.");
        return;
    } 
    if(name1 == "" || name1 == undefined) name1 = "Player one";
    if(name2 == "" || name2 == undefined) name2 = "Player two";
    if(shuffle && Math.floor(Math.random() * 2))
    {
        if(mode == "whiteComp") mode = "blackComp";
        else if(mode == "blackComp") mode = "whiteComp";
        else{
            const temp = name1;
            name1 = name2;
            name2 = temp;
        }
    }
    deleteTable();
    board = new Board(rows, columns, winLength, mode, name1, name2, style);
    makeTable(rows,columns);
    startTurn();


}

submit.addEventListener("click", CreateGame);
table.addEventListener('click', cellClicked);

let board;
let copy;
makeSelect("numRows");
makeSelect("numColumns");
makeSelect("winLength");

