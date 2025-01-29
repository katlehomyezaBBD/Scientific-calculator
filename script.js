
let input =  document.getElementById('expression')
document.querySelectorAll('.btn.number').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
        input.value += buttonValue;
    });
});


document.querySelectorAll('.btn.compute').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
        
        if (buttonValue == "="){
            compute(document.getElementById('expression').value)
        }
        document.getElementById('expression').value = "";
    });
});

document.getElementById("equal").addEventListener('click',()=>{
    let sum = compute(input.value)
    input.value= sum
})

document.querySelectorAll('.btn.statistical-operation').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;

     
        document.getElementById('expression').value +=buttonValue+"()"
    });

});

document.querySelectorAll('.btn.basic-operation').forEach(button => {
    button.addEventListener('click', () => {
        alert(input.value)
        let buttonValue = button.textContent;
        input.value !=""? alert("add a number first"):document.getElementById('expression').value +=buttonValue
    });

});

document.querySelectorAll('.btn.number').forEach(button => {
    button.addEventListener('click', () => {
        let buttonValue = button.textContent;
        input.value += buttonValue;
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
    
    // Handle degree conversions for trig functions
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
        
    
    
    // Handle logarithms
    input = input.replace(/log/g, 'Math.log10');
    input = input.replace(/ln/g, 'Math.log');
    
    // Handle operators
    input = input.replace(/×/g, '*');
    input = input.replace(/x(?!\w)/g, '*'); // Replace x with * only when not part of a word
    input = input.replace(/÷/g, '/');
    input = input.replace(/\^/g, '**');
    
    // Add implicit multiplication
    input = input.replace(/(\d)(?=Math\.)/g, '$1*'); // Number followed by Math.
    input = input.replace(/(Math\.[A-Z]+)(\d)/g, '$1*$2'); // Math.X followed by number
    input = input.replace(/(\d)(\()/g, '$1*$2'); // Number followed by parenthesis
    input = input.replace(/\)(\d)/g, ')*$1'); // Parenthesis followed by number
    input = input.replace(/\)(\()/g, ')*('); // Parenthesis followed by parenthesis
    input = input.replace(/(\d)(Math)/g, '$1*$2'); // Number followed by Math
    
    // Remove spaces
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
    const parts = splitExpression(jsExpression);
    const BST = buildAST(parts);
    return solveBST(BST);

}

function openStatisticsInput() {
    const container = document.getElementById("statistics-input-container");
    container.style.display = "block";
}


function closeStatisticsInput() {
    const container = document.getElementById("statistics-input-container");
    container.style.display = "none";
}


function openMatrixInput() {
    const container = document.getElementById("matrix-input-container");
    container.style.display = "block";
}

function closeMatrixInput() {
    const container = document.getElementById("matrix-input-container");
    container.style.display = "none";
}


function processStatisticsInput() {
    const input = document.getElementById("statistics-array-input").value;
    const numbers = input.split(",").map(Number);
    console.log("Array of numbers:", numbers);
    closeStatisticsInput();
}


function processMatrixInput() {
    const input = document.getElementById("matrix-input").value;
    const rows = input.split("\n");
    const matrix = rows.map(row => row.split(" ").map(Number));
    console.log("Matrix:", matrix);
    closeMatrixInput();
}

document.querySelectorAll(".btn.statistical-operation").forEach(button => {
    button.addEventListener("click", openStatisticsInput);
});

document.querySelectorAll(".btn.matrix-operation").forEach(button => {
    button.addEventListener("click", openMatrixInput);
});

document.getElementById("submit-statistics").addEventListener("click", processStatisticsInput);
document.getElementById("close-statistics").addEventListener("click", closeStatisticsInput);
document.getElementById("submit-matrix").addEventListener("click", processMatrixInput);
document.getElementById("close-matrix").addEventListener("click", closeMatrixInput);

// Add event listener to the equal button
document.getElementById("equal").addEventListener('click', () => {
    let result = solve(input.value); // Compute the result
    input.value = result; // Update the input field with the result
});
