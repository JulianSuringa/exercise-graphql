
const express = require('express');
const graphqlHTTP = require('express-graphql');
const {buildSchema} = require('graphql')


const MyGraphQLSchema =  buildSchema(`
  type Query {
    hello: String
  }
`);

var root = { hello: () => 'Hello world!' };
const app = express();

app.use('/graphql', graphqlHTTP({
  schema: MyGraphQLSchema,
  rootValue: root,
  graphiql: true
}));

app.listen(4000,() => console.log('Now browse to localhost:4000/graphiql'));