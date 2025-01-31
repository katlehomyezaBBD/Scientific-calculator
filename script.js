let input = document.getElementById('expression');
let currentOperation = "";

function factorial(number){
    if(number ==0||number==1){
        return 1
    }
    return number*factorial(number-1)
}

function convertToJsExpression(input) {  
    input = input.replace(/(\d+\.?\d*)e([+-]?\d+)/g, (match, coefficient, exponent) => {
        return `${coefficient}x10**(${exponent})`;
    });

    input = input.replace(/(?<!\d)-(\d+)/g, ' -$1'); 

    input = input.replace(/(\d+)!/g,(match,p1)=>{`${factorial(parseInt(p1))}`} );

    if (input.includes("°")) {
        input = input.replace(/sin\(([^)]+)°\)/g, (match, p1) => {
            return `Math.sin(${parseFloat(p1) * (Math.PI / 180)})`; 
        });
        input = input.replace(/cos\(([^)]+)°\)/g, (match, p1) => {
            return `Math.cos(${parseFloat(p1) * (Math.PI / 180)})`;
        });
        input = input.replace(/tan\(([^)]+)°\)/g, (match, p1) => {
            return `Math.tan(${parseFloat(p1) * (Math.PI / 180)})`; 
        });
    } 
    else{
        input = input.replace(/sin/g, 'Math.sin');
        input = input.replace(/cos/g, 'Math.cos');
        input = input.replace(/tan/g, 'Math.tan');
    }
    
    input = input.replace(/(?<!Math\.)sin/g, 'Math.sin');
    input = input.replace(/(?<!Math\.)cos/g, 'Math.cos');
    input = input.replace(/(?<!Math\.)tan/g, 'Math.tan');
    input = input.replace(/log/g, 'Math.log10');
    input = input.replace(/ln/g, 'Math.log');
    input = input.replace(/(\d+)e([+-]?\d+)/g, '$1x10**$2');
    input = input.replace(/×/g, '*');
    input = input.replace(/x/g, '*');
    input = input.replace(/x(?!\w)/g, '*');
    input = input.replace(/÷/g, '/');
    input = input.replace(/\^/g, '**');
    input = input.replace(/(\d)(?=Math\.)/g, '$1*'); 
    input = input.replace(/(Math\.[A-Z]+)(\d)/g, '$1*$2'); 
    input = input.replace(/(\d)(\()/g, '$1*$2'); 
    input = input.replace(/\)(\d)/g, ')*$1'); 
    input = input.replace(/\)(\()/g, ')*('); 
    input = input.replace(/(\d)(Math)/g, '$1*$2');
    input = input.replace(/\s+/g, '');

    

    input = input.replace(/pi/g, `${parseFloat(Math.PI)}`);
    input = input.replace(/π/g, `${parseFloat(Math.PI)}`);
    input = input.replace(/e/g, `${parseFloat(Math.E)}`);
    
    return input;
}

function splitExpression(input) {
    const regex = /([+-])/;
    const result = input.split(regex).filter(Boolean);
    
    let parts = [];
    let currentPart = '';
    
    result.forEach(item => {
        if (item === '+' || item === '-') {
            if (currentPart) {
                parts.push(currentPart);
            }
            parts.push(item);
            currentPart = '';
        } else {
            currentPart += item;
        }
    });
    
    if (currentPart) {
        parts.push(currentPart);
    }
    return parts;
}

function buildAST(tokens) {
    if (tokens.length === 1){
        return { type: 'Literal', value: tokens[0] }
    };
    
    let depth = 0;
    for (let i = tokens.length - 1; i >= 0; i--) {
        const token = tokens[i];
        if (token === '+' || token === '-') {
            if (depth === 0) {
                return {
                    type: 'BinaryExpression',
                    operator: token,
                    left: buildAST(tokens.slice(0, i)),
                    right: buildAST(tokens.slice(i + 1))
                };
            }
        } else if (token === '(') depth++;
        else if (token === ')') depth--;
    }
    return { type: 'Literal', value: tokens[0] };
}

function solveAST(node) {
    if (node.type === "Literal") {
        try {
            const result = compute(node.value)
            return result;
        } catch (error) {
            console.error("Error evaluating:", node.value);
            return NaN;
        }
    } else {
        const leftValue = solveAST(node.left);
        const rightValue = solveAST(node.right);
        return node.operator === "+" ? leftValue + rightValue : leftValue - rightValue;
    }
    
}

function computeMathjsFunctions(expression){
   
    if(expression.includes("Math.sin")){
        const paramMatch = expression.match(/Math\.\w+\(([^)]+)\)/);
        const param = paramMatch[1];
       
        return Math.sin(parseFloat(param))
    }
    if(expression.includes("Math.cos")){
        const paramMatch = expression.match(/Math\.\w+\(([^)]+)\)/);
        const param = paramMatch[1];
       
        return Math.sin(parseFloat(param))
    }
    if(expression.includes("Math.tan")){
        const paramMatch = expression.match(/Math\.\w+\(([^)]+)\)/);
        const param = paramMatch[1];
       
        return Math.tan(parseFloat(param))
    }
    if(expression.includes("Math.exp")){
        const paramMatch = expression.match(/Math\.\w+\(([^)]+)\)/);
        const param = paramMatch[1];
       
        return Math.exp(parseFloat(param))
    }

    if(expression.includes("Math.log")){
        const paramMatch = expression.match(/Math\.\w+\(([^)]+)\)/);
        const param = paramMatch[1];
       
        return Math.log(parseFloat(param))
    }

    if(expression.includes("Math.log10")){
        const paramMatch = expression.match(/Math\.\w+\(([^)]+)\)/);
        const param = paramMatch[1];
       
        return Math.log10(parseFloat(param))
    }


}

function compute(expression) {
    expression = expression.replace(/\s+/g, ''); // Remove all whitespace

    // Check if the expression contains a Math function
    if (expression.includes("Math.")) {
        return computeMathjsFunctions(expression);
    }


    const operators = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        '%': 2,
        '**': 3,
    };

    const values = [];
    const ops = [];

    let i = 0;

    function applyOperator() {
        const operator = ops.pop();
        const right = values.pop();
        const left = values.pop();
        switch (operator) {
            case '+': values.push(left + right); break;
            case '-': values.push(left - right); break;
            case '*': values.push(left * right); break;
            case '/': values.push(left / right); break;
            case '%': values.push(left % right); break;
            case '**': values.push(Math.pow(left, right)); break;
            default: throw new Error("Unknown operator: " + operator);
        }
    }

    while (i < expression.length) {
        let char = expression[i];

        if (/\d/.test(char)) {
            let num = '';
            while (i < expression.length && /\d|\./.test(expression[i])) {
                num += expression[i++];
            }
            values.push(parseFloat(num));
        } else if (char === '(') {
            ops.push(char);
            i++;
        } else if (char === ')') {
            while (ops.length && ops[ops.length - 1] !== '(') {
                applyOperator();
            }
            ops.pop();
            i++;
        } else if (operators[char] || (char === '*' && expression[i + 1] === '*')) {
            let operator = char;
            if (char === '*' && expression[i + 1] === '*') {
                operator = '**'; // Exponentiation
                i++;
            }
            while (ops.length && operators[ops[ops.length - 1]] >= operators[operator]) {
                applyOperator();
            }
            ops.push(operator);
            i++;
        } else {
            throw new Error('Invalid character: ' + char);
        }
    }

    while (ops.length) {
        if (ops[ops.length - 1] === '(') {
            ops.pop();
        } else {
            applyOperator();
        }
    }

    return values.pop();
}

function solve(expression){
    let jsExpression = convertToJsExpression(expression);
    console.log(jsExpression)
    const parts = splitExpression(jsExpression);
    console.log(parts)
    const BST = buildAST(parts);
    console.log(solveAST(BST))
    return solveAST(BST);

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
            result = det(matrix);  // Calculate determinant of the matrix
            break;
        case 'rank':
            result = rank(matrix);  // Calculate rank of the matrix
            break;
        case 'M x M':
            result = matrixMultiplication(matrix);  // Calculate determinant of the matrix
            break;
        default:
            result = "Invalid Operation";  // In case of unknown operation
    }

    input.value = result;

    closeMatrixInput(); 
}

function processStatisticsInput() {
    const inputValue = document.getElementById("statistics-array-input").value;
    const numbers = inputValue.split(",").map(Number);  // Convert the input string to an array of numbers

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
        case 'µ': // Mean (average)
            result = mean(numbers);
            break;
        case 'σ': 
            result = standardDeviation(numbers);
            break;
        case 'σ²': // Variance
            result = variance(numbers);
            break;
        default:
            result = "Invalid Operation"; 
    }

    
    input.value = result;

    closeStatisticsInput();
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
            input.value += "()!"; 
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

