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



app.listen(3333);