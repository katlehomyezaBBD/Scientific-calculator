
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

document.querySelectorAll('.btn.function').forEach(button => {
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

function factorial(number){
    if(number ==0||number==1){
        return 1
    }
    return number*factorial(number-1)
}

function transpose(matrix) {
    let transposed = [];
    matrix.forEach((row, rowIndex) => {
        row.forEach((item, colIndex) => {
            
            transposed[colIndex][rowIndex] = item;
        });
    });
    return transposed;
}

function convertToJsExpression(input) {
    input = input.replace(/×/g, '*');
    input = input.replace(/pi/g, 'Math.PI');
    input = input.replace(/π/g, 'Math.PI');
    input = input.replace(/exp/g, 'Math.PI');
      
    input = input.replace(/x/g, '*');
    input = input.replace(/\s+/g, '');
    input = input.replace(/(\d)!/g, 'factorial($1)');
  
    input = input.replace(/(\d)(\()/g, '$1*$2');
    input = input.replace(/\)(\d)/g, ')*$1');  
    input = input.replace(/\)(\()/g, ')*(');    
    input = input.replace(/(\d)(Math\.[a-zA-Z]+)/g, '$1*$2'); 
     
    input = input.replace(/÷/g, '/');
    input = input.replace(/\^/g, '**');
  
  
    if (input.includes("°")) {
        input = input.replace(/sin\((\d+(\.\d+)?)°\)/g, (match, p1) => {
            return `Math.sin(${p1} * Math.PI / 180)`;
        });
        input = input.replace(/cos\((\d+(\.\d+)?)°\)/g, (match, p1) => {
            return `Math.cos(${p1} * Math.PI / 180)`;
        });
        input = input.replace(/tan\((\d+(\.\d+)?)°\)/g, (match, p1) => {
            return `Math.tan(${p1} * Math.PI / 180)`;
        });
    
    }
    else {
        if (input.includes("sin")) {
            input = input.replace(/sin/g, 'Math.sin');
        }
        if (input.includes("cos")) {
            input = input.replace(/cos/g, 'Math.cos');
        }
        if (input.includes("tan")) {
            input = input.replace(/tan/g, 'Math.tan');
        }
    }
  
  
    input = input.replace(/log/g, 'Math.log');
    input = input.replace(/ln/g, 'Math.log10');
  
    return input;
  }

  
function splitExpression(input) {
    // This regular expression splits the input at '+' or '-' but keeps the operators as separate tokens
    const regex = /([+-])/;
    const result = input.split(regex).filter(Boolean); // Remove any empty entries

    // Join parts that may need to be grouped together (for cases where the expression has no operators)
    let parts = [];
    let currentPart = '';

    result.forEach(item => {
        if (item === '+' || item === '-') {
            if (currentPart) {
                parts.push(currentPart);
            }
            parts.push(item);  // Add the operator separately
            currentPart = '';  // Start a new part
        } else {
            currentPart += item;  // Keep adding to the current part
        }
    });

    if (currentPart) {
        parts.push(currentPart);  // Add the last part
    }

    return parts;


}function buildAST(tokens) {
    if (tokens.length === 1) return  tokens[0] ;

    let depth = 0;

    for (let i = tokens.length - 1; i >= 0; i--) {
        const token = tokens[i];
        if (token === '+' || token === '-') {
            if (depth === 0) {
                const leftTokens = tokens.slice(0, i);
                const rightTokens = tokens.slice(i + 1);
                return {
                   
                    operator: token,
                    left: buildAST(leftTokens),
                    right: buildAST(rightTokens),
                };
            }
        } else if (token === '(') depth++;
        else if (token === ')') depth--;
    }

    return tokens[0] ;
}
  

function compute(input){
    return 0


}
