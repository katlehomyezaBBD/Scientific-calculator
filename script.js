let input = document.getElementById('expression');
let currentOperation = "";

class Token { 
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class Lexer {
    constructor(input) {
        this.input = input
            .replace(/\s+/g, '')
            .replace(/×/g, '*')
            .replace(/x/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**')
            .trim();
        this.position = 0;
        this.currentChar = this.input[0];
    }

    advance() {
        this.position++;
        this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
    }

    peek() {
        const peekPos = this.position + 1;
        return peekPos < this.input.length ? this.input[peekPos] : null;
    }

    peekWord() {
        let pos = this.position;
        let result = '';
        while (pos < this.input.length && /[a-zA-Z]/.test(this.input[pos])) {
            result += this.input[pos];
            pos++;
        }
        return result;
    }

    number() {
        let result = '';
        let hasDecimal = false;
        let hasE = false;

        while (this.currentChar && (
            /[\d.]/.test(this.currentChar) || 
            (this.currentChar.toLowerCase() === 'e' && !hasE) ||
            ((this.currentChar === '+' || this.currentChar === '-') && result.toLowerCase().endsWith('e'))
        )) {
            if (this.currentChar === '.') {
                if (hasDecimal) break;
                hasDecimal = true;
            }
            if (this.currentChar.toLowerCase() === 'e') {
                if (hasE) break;
                hasE = true;
            }
            result += this.currentChar;
            this.advance();
        }

        const nextWord = this.peekWord();
        if (nextWord === 'pi' || this.currentChar === 'π') {
            if (nextWord === 'pi') {
                this.position += 2; // Skip 'pi'
                this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
            } else {
                this.advance(); // Skip 'π'
            }
            return new Token('NUMBER', parseFloat(result) * Math.PI);
        }

        return new Token('NUMBER', parseFloat(result));
    }

    identifier() {
        let result = '';
        while (this.currentChar && /[a-zA-Z]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        return result;
    }

    getNextToken() {
        while (this.currentChar !== null) {
            if (this.currentChar === ' ') {
                this.advance();
                continue;
            }

            if (/[\d.]/.test(this.currentChar)) {
                return this.number();
            }

            if (/[a-zA-Z]/.test(this.currentChar)) {
                const identifier = this.identifier();
                if (identifier === 'pi') return new Token('NUMBER', Math.PI);
                if (identifier === 'e' && !/\d/.test(this.peek())) return new Token('NUMBER', Math.E);
                if (['sin', 'cos', 'tan', 'log', 'log10',"ln"].includes(identifier)) return new Token('FUNC', identifier);
                throw new Error(`Unknown identifier: ${identifier}`);
            }

            if (this.currentChar === '+') {
                this.advance();
                return new Token('PLUS', '+');
            }

            if (this.currentChar === '-') {
                this.advance();
                return new Token('MINUS', '-');
            }

            if (this.currentChar === '*') {
                this.advance();
                if (this.currentChar === '*') {
                    this.advance();
                    return new Token('POW', '**');
                }
                return new Token('MUL', '*');
            }

            if (this.currentChar === '/') {
                this.advance();
                return new Token('DIV', '/');
            }

            if (this.currentChar === '(') {
                this.advance();
                return new Token('LPAREN', '(');
            }

            if (this.currentChar === ')') {
                this.advance();
                return new Token('RPAREN', ')');
            }

            if (this.currentChar === '°') {
                this.advance();
                return new Token('DEG', '°');
            }

            if (this.currentChar === 'π') {
                this.advance();
                return new Token('NUMBER', Math.PI);
            }

            if (this.currentChar === '!') { // Handle factorial
                this.advance();
                return new Token('FACTORIAL', '!');
            }

            throw new Error(`Invalid character: ${this.currentChar}`);
        }

        return new Token('EOF', null);
    }
}

class Parser {
    constructor(lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }

    eat(tokenType) {
        if (this.currentToken.type === tokenType) {
            this.currentToken = this.lexer.getNextToken();
        } else {
            throw new Error(`Expected ${tokenType} but got ${this.currentToken.type}`);
        }
    }

    factorial(n) {
        if (n === 0 || n === 1) return 1;
        return n * this.factorial(n - 1);
    }

    factor() {
        const token = this.currentToken;

        if (token.type === 'NUMBER') {
            this.eat('NUMBER');
            let result = token.value;
            // Check if factorial follows the number
            if (this.currentToken.type === 'FACTORIAL') {
                this.eat('FACTORIAL');
                result = this.factorial(result);
            }
            return result;
        }

        if (token.type === 'LPAREN') {
            this.eat('LPAREN');
            const result = this.expr();
            this.eat('RPAREN');
            return result;
        }

        if (token.type === 'FUNC') {
            const func = token.value;
            this.eat('FUNC');
            this.eat('LPAREN');
            const arg = this.expr();
            let degrees = false;
            if (this.currentToken.type === 'DEG') {
                degrees = true;
                this.eat('DEG');
            }
            this.eat('RPAREN');
            
            const radians = degrees ? arg * Math.PI / 180 : arg;
            switch(func) {
                case 'sin': return Math.sin(radians);
                case 'cos': return Math.cos(radians);
                case 'tan': return Math.tan(radians);
                case 'log': return Math.log(arg);
                case 'log10': return Math.log10(arg);
                case 'ln': return Math.log10(arg);
                default: throw new Error(`Unknown function: ${func}`);
            }
        }

        if (token.type === 'MINUS') {
            this.eat('MINUS');
            return -this.factor();
        }

        if (token.type === 'PLUS') {
            this.eat('PLUS');
            return this.factor();
        }

        throw new Error('Invalid syntax');
    }

    power() {
        let result = this.factor();

        while (this.currentToken.type === 'POW') {
            this.eat('POW');
            result = Math.pow(result, this.factor());
        }

        return result;
    }

    term() {
        let result = this.power();

        while (['MUL', 'DIV'].includes(this.currentToken.type)) {
            const token = this.currentToken;
            if (token.type === 'MUL') {
                this.eat('MUL');
                result *= this.power();
            } else if (token.type === 'DIV') {
                this.eat('DIV');
                result /= this.power();
            }
        }

        return result;
    }

    expr() {
        let result = this.term();

        while (['PLUS', 'MINUS'].includes(this.currentToken.type)) {
            const token = this.currentToken;
            if (token.type === 'PLUS') {
                this.eat('PLUS');
                result += this.term();
            } else if (token.type === 'MINUS') {
                this.eat('MINUS');
                result -= this.term();
            }
        }

        return result;
    }
}

function solve(expression) {
    try {
        const lexer = new Lexer(expression);
        const parser = new Parser(lexer);
        return parser.expr();
    } catch (error) {
        console.error(`Error calculating "${expression}":`, error.message);
        return NaN;
    }
}

function openStatisticsInput(type) {
    console.log('STATS WOOO')
    const container = document.getElementById("statistics-input-container");
    container.style.display = "block";
    currentOperation = type;  
}

function openMatrixInput(type) {
    console.log('MATRICES WOOO')
    const container = document.getElementById("matrix-input-container");
    container.style.display = "block";
    currentOperation = type;  

}

function closeStatisticsInput() {
    const container = document.getElementById("statistics-input-container");
    container.style.display = "none";
}

function processMatrixInput() {
    const inputValue = document.getElementById("matrix-input").value;
    const matrix = JSON.parse(inputValue);



    console.log("Matrix:", matrix);

    let result;

    
    switch (currentOperation) {
        case 'det':
            result = det(matrix);  
            break;
        case 'rank':
            result = rank(matrix); 
            break;
        case 'M x M':
            result = matrixMultiplication(matrix); 
            break;
        default:
            result = "Invalid Operation"; 
    }

    input.value = result;

    closeMatrixInput(); 
}

function processStatisticsInput() {
    const inputValue = document.getElementById("statistics-array-input").value;
    const numbers = inputValue.split(",").map(Number);  

    if (numbers.some(isNaN)) {
        alert("Please enter a valid array of numbers.");
        return;
    }

    let result;
    
    
    switch (currentOperation) {
        case 'Σ':
            result = sum(numbers);
            break;
        case '∏': 
            result = product(numbers);
            break;
        case 'µ': 
            result = mean(numbers);
            break;
        case 'σ': 
            result = standardDeviation(numbers);
            break;
        case 'σ²': 
            result = variance(numbers);
            break;
        default:
            result = "Invalid Operation"; 
    }

    
    input.value = result;

    closeStatisticsInput();
}

function factorial(number){
    if(number ==0||number==1){
        return 1
    }
    console.log(number)
    return number*factorial(number-1)
}

function sum(numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

function product(numbers) {
    return numbers.reduce((total, num) => total * num, 1);
}

function mean(numbers) {
    return sum(numbers) / numbers.length;
}

function standardDeviation(numbers) {
    const meanValue = mean(numbers);
    const squaredDifferences = numbers.map(num => Math.pow(num - meanValue, 2));
    const averageSquaredDifference = mean(squaredDifferences);
    return Math.sqrt(averageSquaredDifference);
}

function variance(numbers) {
    return Math.pow(standardDeviation(numbers), 2);
}

function det(matrix) {
    if (!matrix.every(row => row.length === matrix.length)) {
        throw new Error("Matrix must be square to compute determinant.");
    }
    else{
        if (matrix.length === 2) {
            return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        }

        let determinant = 0;

        for (let col = 0; col < matrix.length; col++) {
            const minor = matrix.slice(1).map(row => row.filter((_, i) => i !== col));

            const cofactor = matrix[0][col] * det(minor);

            determinant += (col % 2 === 0 ? 1 : -1) * cofactor;
        }
        console.log(determinant)

        return determinant;
        
    }

    
}

function rank(matrixStr) {
    const numRows = matrix.length;
    const numCols = matrix[0].length;
    let rank = 0;
    const matrix = JSON.parse(matrixStr);

    const mat = matrix.map(row => [...row]);

    for (let row = 0; row < numRows; row++) {
        let pivotCol = -1;
        for (let col = 0; col < numCols; col++) {
            if (mat[row][col] !== 0) {
                pivotCol = col;
                break;
            }
        }

        if (pivotCol === -1) continue;

        rank++;

        const pivotValue = mat[row][pivotCol];
        for (let col = 0; col < numCols; col++) {
            mat[row][col] /= pivotValue;
        }

        for (let i = row + 1; i < numRows; i++) {
            const factor = mat[i][pivotCol];
            for (let col = 0; col < numCols; col++) {
                mat[i][col] -= factor * mat[row][col];
            }
        }
    }

    return rank;
}

function closeMatrixInput() {
    const container = document.getElementById("matrix-input-container");
    container.style.display = "none";
}

document.querySelectorAll('.btn.number').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
        if (buttonValue !== "=") {
            input.value += buttonValue;  
        }
    });
});

document.querySelectorAll('.btn.constant').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
        if (buttonValue !== "=") {
            input.value += buttonValue;  
        }
    });
});


document.querySelectorAll('.btn.statistical-operation').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
    
        
        if (buttonValue !== "=") {

            let buttonValue = button.textContent;
            input.value += buttonValue + "()";  
        }
        else if(buttonValue == "=>"){
            let equation = input.value; 

            let sides = equation.split("=>"); 
            console.log(sides)

          
            let leftSide = sides[0].trim();  
            let rightSide = sides[1].trim(); 
            console.log(parseFloat(leftSide) >= parseFloat(rightSide))
            if (parseFloat(leftSide) >= parseFloat(rightSide)) {
                input.value = "True";
            } else {
                input.value = "False";
            }
                

        }

    });
});

document.querySelectorAll('.btn.basic-operation').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
        if (buttonValue !== "=") {
            input.value += buttonValue; 
        } 
    });
});

document.getElementById("equal").addEventListener('click', () => {
    let result = solve(input.value); 
    input.value = result; 
});

document.getElementById("CLEAR").addEventListener('click', () => {
    input.value = ""; 
});

document.querySelectorAll('.btn.function').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
        if (buttonValue === "!") {
            input.value += "!"; 
        } else if (buttonValue === "x²" || buttonValue === "x³") {
            input.value += `(${input.value})**${buttonValue === "x²" ? 2 : 3}`;
        } else if (buttonValue === "xⁿ") {
            input.value += `(${input.value})**`;
        } 
        else if (buttonValue === "√") {
            input.value += `(${input.value})**${0.5}`;
        }else if (buttonValue === "1/x") {
            input.value = `1/(${input.value})`; 
        } else if (buttonValue === "nCr" || buttonValue === "nPr") {
            input.value += `(${input.value})`;
        } else if (buttonValue === "10^x") {
            input.value = `10**(${input.value})`;  
        } else if (buttonValue === "lg₁₀") {
            input.value = `Math.log10(${input.value})`;
        } else if (buttonValue === "lg₂") {
            input.value = `Math.log2(${input.value})`; 
        } else if (buttonValue === "ln(x)") {
            input.value = `Math.log(${input.value})`; 
        } 
        else if (buttonValue === "e") {
            input.value += `e`; 
        }else {
            input.value += buttonValue + "()";  
        }
    });
});

document.querySelectorAll(".btn.statistical-operation").forEach(button => {
    button.addEventListener("click", () => openStatisticsInput(button.textContent));
});

document.querySelectorAll(".btn.matrix-operation").forEach(button => {
    console.log("Setting up matrix button listener");
    button.addEventListener("click", () => openMatrixInput(button.textContent));
});

document.getElementById("submit-statistics").addEventListener("click", processStatisticsInput);
document.getElementById("submit-matrix").addEventListener("click", processMatrixInput);
document.getElementById("close-statistics").addEventListener("click", closeStatisticsInput);
document.getElementById("close-matrix").addEventListener("click", closeMatrixInput);

