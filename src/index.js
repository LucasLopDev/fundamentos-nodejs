const { response } = require("express");
const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

app.use(express.json());

//Middleware
function verifyIfExistsAccountCPF(request, response, next){

  const { cpf } = request.params;

  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer){
    return response.status(400).json({ error: "Customer not found"})
  }
  
  request.customer = customer;

  return next();
}

function getBalance(statement) {

  const balance = statement.reduce((acc, operation) => {
    if(operation.type === "credit") {
      return acc + operation.amount;
    }
    else{
      return acc - operation.amount;
    }
  }, 0)

  return balance;
}

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement [] 
*/

app.post ("/account", (request, response) => {
  const {cpf, name} = request.body;

  const customerAlredyExixst = customers.some(
    (customer) => customer.cpf === cpf
  );

  if(customerAlredyExixst){
    return response.status(400).json({ error: "Customer already exist!"})
  }

  customers.push({
      cpf,
      name,
      id: uuidv4(),
      statement: [],
  });

  return response.status(201).send();

})

// app.use(Middleware); If all routes will use the same middleware

app.get("/statement/:cpf", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.post("/deposit/:cpf", verifyIfExistsAccountCPF, (request, response) => {
  const {description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  }

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post("/withdraw/:cpf" ,verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if(balance < amount) {
    return response.status(400).json({ error: "Insufficient funds!"})
  }
  
  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  }

  customer.statement.push(statementOperation);

  return response.status(201).send();

})

app.get("/statement/date/:cpf" ,verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + "00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );

  return response.json(customer.statement);

})

app.put("/account/:cpf",verifyIfExistsAccountCPF, (request,response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
});

app.get("/account/:cpf",verifyIfExistsAccountCPF, (request,response) => {
  const {customer} = request;

  return response.json(customer);
});

app.listen(3333);