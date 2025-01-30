let input = document.getElementById('expression');
let currentOperation = '';  // This will store the current statistical operation


// Handle number buttons
document.querySelectorAll('.btn.number').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
        if (buttonValue !== "=") {
            input.value += buttonValue;  // Add to input unless the value is "="
        }
    });
});

document.querySelectorAll('.btn.constant').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
        if (buttonValue !== "=") {
            input.value += buttonValue;  // Add to input unless the value is "="
        }
    });
});


// Button for Statistical Operations (like sin(), cos())
document.querySelectorAll('.btn.statistical-operation').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
    
        
        if (buttonValue !== "=") {

            let buttonValue = button.textContent;
            input.value += buttonValue + "()";  // Add statistical operation with parentheses
        }
        else{

        }

    });
});

// Button for Basic Operations (like +, -, *, /)
document.querySelectorAll('.btn.basic-operation').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
        if (buttonValue !== "=") {
            input.value += buttonValue;  // Add operation to the input
        } 
    });
});

// Handle "=" button to compute the result
document.getElementById("equal").addEventListener('click', () => {
    let result = solve(input.value); 
    input.value = result;  // Display the computed result
});

document.getElementById("CLEAR").addEventListener('click', () => {
   
    input.value = "";  // Display the computed result
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

function compute(expression){
    return eval(expression)
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
            result = "Invalid Operation";  // If for some reason the operation is not set
    }

    // Insert the result into the input field
    input.value = result;

    // Close the input container after processing
    closeStatisticsInput();
}

// Sum of the numbers in the array
function sum(numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

// Product of the numbers in the array
function product(numbers) {
    return numbers.reduce((total, num) => total * num, 1);
}

// Mean (average) of the numbers in the array
function mean(numbers) {
    return sum(numbers) / numbers.length;
}

// Standard deviation of the numbers in the array
function standardDeviation(numbers) {
    const meanValue = mean(numbers);
    const squaredDifferences = numbers.map(num => Math.pow(num - meanValue, 2));
    const averageSquaredDifference = mean(squaredDifferences);
    return Math.sqrt(averageSquaredDifference);
}

// Variance of the numbers in the array (square of standard deviation)
function variance(numbers) {
    return Math.pow(standardDeviation(numbers), 2);
}

// Open Matrix Input (unchanged)
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

// Event listeners for statistical operations
document.querySelectorAll(".btn.statistical-operation").forEach(button => {
    button.addEventListener("click", () => openStatisticsInput(button.textContent));  // Pass button text (Σ, ∏, etc.)
});

// Event listeners for matrix operations (unchanged)
document.querySelectorAll(".btn.matrix-operation").forEach(button => {
    button.addEventListener("click", openMatrixInput);
});

// Submit statistics array and process it
document.getElementById("submit-statistics").addEventListener("click", processStatisticsInput);

// Close the statistics input
document.getElementById("close-statistics").addEventListener("click", closeStatisticsInput);

// Close matrix input
document.getElementById("close-matrix").addEventListener("click", closeMatrixInput);
