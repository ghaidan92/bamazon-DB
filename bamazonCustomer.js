var inquirer = require("inquirer");
var mysql = require("mysql");
require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Dance123?",
    database: "bamazonDB"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start(){
    inquirer.prompt([
        {
            type: "list",
            name: "userChoice",
            message: "Would you like to look or buy?",
            choices: ["I'd like to look first!", "I'm ready to make a purchase"]
        },
    ]).then(function(choiceResponse){
        var userChoice = choiceResponse.userChoice;
        if(userChoice ==="I'd like to look first!"){
            connection.query("SELECT * FROM products;", function(err, res){
                console.table(res);
                start();
            });
        } else if (userChoice === "I'm ready to make a purchase"){
            inquirer.prompt([
                {
                    name: "idInput",
                    message: "What is the item ID youd like to purchase?",
                    validate: function validateidInput(name){
                        return name !== '';
                    }
                },
                {
                    name: "userQuant",
                    message: "How many would you like?",
                    validate: function validateuserQuant(name){
                        return name !== '';
                    }
                }
            ]).then(function(answer){
                connection.query("SELECT stock_quantity FROM products WHERE item_id= ?", [answer.idInput],function(err, res){
                    if (answer.userQuant > res[0].stock_quantity){
                        console.log("Insufficient quantity! We only have: " + res[0].stock_quantity + " in stock!");
                        start();
                    } else if (answer.userQuant <= res[0].stock_quantity){
                        console.log("-------------------------------");
                        console.log("Your order has been placed, Thank you come again!");
                        console.log("-------------------------------");
                        connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [(res[0].stock_quantity - answer.userQuant),answer.idInput], function(err, res){
                            connection.end();
                        })
                    }   
                })
            })
        }
    })
}