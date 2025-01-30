let input = document.getElementById('expression');
let currentOperation = ''; 


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
            input.value += "()"; 
        } else if (buttonValue === "x²" || buttonValue === "x³") {
            input.value += `(${input.value})**${buttonValue === "x²" ? 2 : 3}`;
        } else if (buttonValue === "xⁿ") {
            input.value += `(${input.value})**`;
        } else if (buttonValue === "1/x") {
            input.value = `1/(${input.value})`; 
        } else if (buttonValue === "nCr" || buttonValue === "nPr") {
            input.value += `(${input.value})`;
        } else if (buttonValue === "10^x") {
            input.value = `Math.pow(10, ${input.value})`;  
        } else if (buttonValue === "lg₁₀") {
            input.value = `Math.log10(${input.value})`;
        } else if (buttonValue === "lg₂") {
            input.value = `Math.log2(${input.value})`; 
        } else if (buttonValue === "ln(x)") {
            input.value = `Math.log(${input.value})`; 
        } else {
            input.value += buttonValue + "()";  
        }
    });
});




function factorial(number){
    if(number ==0||number==1){
        return 1
    }
    return number*factorial(number-1)
}

function convertToJsExpression(input) {
   
    input = input.replace(/pi/g, 'Math.PI');
    input = input.replace(/π/g, 'Math.PI');
    input = input.replace(/exp/g, 'Math.E');
    
    input = input.replace(/(\d+)!/g, 'factorial($1)');

    if (input.includes("°")) {
        input = input.replace(/sin\(([^)]+)°\)/g, (match, p1) => {
            return `Math.sin((${p1}) * Math.PI / 180)`;
        });
        input = input.replace(/cos\(([^)]+)°\)/g, (match, p1) => {
            return `Math.cos((${p1}) * Math.PI / 180)`;
        });
        input = input.replace(/tan\(([^)]+)°\)/g, (match, p1) => {
            return `Math.tan((${p1}) * Math.PI / 180)`;
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

    input = input.replace(/×/g, '*');
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
    
    return input;
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
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

function solveBST(node) {
    if (node.type === "Literal") {
        try {
            const result = compute(node.value)
            return result;
        } catch (error) {
            console.error("Error evaluating:", node.value);
            return NaN;
        }
    } else {
        const leftValue = solveBST(node.left);
        const rightValue = solveBST(node.right);
        return node.operator === "+" ? leftValue + rightValue : leftValue - rightValue;
    }
    
}

function compute(expression) {
    expression = expression.replace(/\s+/g, '');

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
    const funcs = [];

    let i = 0;

    // Helper function to apply operator
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
            case '^': values.push(Math.pow(left, right)); break; // Handle '^' operator
            case '**': values.push(Math.pow(left, right)); break; // Handle '**' operator
            default: throw new Error("Unknown operator: " + operator);
        }
    }

    // Helper function to apply function
    function applyFunction(func) {
        const arg = values.pop();
        switch (func) {
            case 'Math.sin': values.push(Math.sin(arg)); break;
            case 'Math.cos': values.push(Math.cos(arg)); break;
            case 'Math.tan': values.push(Math.tan(arg)); break;
            case 'Math.log': values.push(Math.log10(arg)); break;  
            case 'Math.ln': values.push(Math.log(arg)); break;
            case 'Math.sqrt': values.push(Math.sqrt(arg)); break;
            default: throw new Error("Unknown function: " + func);
        }
    }

    while (i < expression.length) {
        let char = expression[i];

        if (/\d/.test(char)) {
            // Parse numbers (including decimals)
            let num = '';
            while (i < expression.length && /\d|\./.test(expression[i])) {
                num += expression[i++];
            }
            values.push(parseFloat(num));
        } else if (char === '(') {
            // Push opening parenthesis to the ops stack
            ops.push(char);
            i++;
        } else if (char === ')') {
            // Process all operators until the matching '(' is found
            while (ops.length && ops[ops.length - 1] !== '(') {
                applyOperator();
            }
            ops.pop(); // Pop the '('
            i++;
        } else if (operators[char] || (char === '*' && expression[i + 1] === '*')) {
            // Handle operators (including '**')
            let operator = char;
            if (char === '*' && expression[i + 1] === '*') {
                operator = '**'; // Handle '**' operator
                i++; // Skip the second '*'
            }
            // Process higher precedence operators first
            while (ops.length && operators[ops[ops.length - 1]] >= operators[operator]) {
                applyOperator();
            }
            ops.push(operator);
            i++;
        } else if (/[a-zA-Z]/.test(char)) {
            // Parse functions like Math.sin, Math.cos, etc.
            let func = '';
            while (i < expression.length && /[a-zA-Z]/.test(expression[i])) {
                func += expression[i++];
            }
            if (func === 'Math.sin' || func === 'Math.cos' || func === 'Math.tan' || func === 'Math.log' || func === 'Math.ln' || func === 'Math.sqrt') {
                funcs.push(func);
                ops.push('('); // Push '(' to handle function arguments
            } else {
                throw new Error("Unknown function: " + func);
            }
        } else {
            throw new Error('Invalid character: ' + char);
        }
    }

    // Process remaining operators
    while (ops.length) {
        if (ops[ops.length - 1] === '(') {
            ops.pop(); // Discard any remaining '('
        } else {
            applyOperator();
        }
    }

    // Process remaining functions
    while (funcs.length) {
        const func = funcs.pop();
        applyFunction(func);
    }

    // Return the final result
    return values.pop();
}

function solve(expression){
    let jsExpression = convertToJsExpression(expression);
    console.log(jsExpression)
    const parts = splitExpression(jsExpression);
    console.log(parts)
    const BST = buildAST(parts);
    console.log(BST)
    return solveBST(BST);

}


function openStatisticsInput(type) {
    const container = document.getElementById("statistics-input-container");
    container.style.display = "block";
    currentOperation = type;  
    document.getElementById("statistics-operation-name").innerText = `Enter values for ${type}`;
}


function closeStatisticsInput() {
    const container = document.getElementById("statistics-input-container");
    container.style.display = "none";
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

function openMatrixInput() {
    const container = document.getElementById("matrix-input-container");
    container.style.display = "block";
}

function closeMatrixInput() {
    const container = document.getElementById("matrix-input-container");
    container.style.display = "none";
}

function processMatrixInput() {
    const input = document.getElementById("matrix-input").value;
    const rows = input.split("\n");
    const matrix = rows.map(row => row.split(" ").map(Number));
    console.log("Matrix:", matrix);
    closeMatrixInput();
}

document.querySelectorAll(".btn.statistical-operation").forEach(button => {
    button.addEventListener("click", () => openStatisticsInput(button.textContent));  // Pass button text (Σ, ∏, etc.)
});

document.querySelectorAll(".btn.matrix-operation").forEach(button => {
    button.addEventListener("click", openMatrixInput);
});

document.getElementById("submit-statistics").addEventListener("click", processStatisticsInput);

document.getElementById("close-statistics").addEventListener("click", closeStatisticsInput);

document.getElementById("close-matrix").addEventListener("click", closeMatrixInput);
