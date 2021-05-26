const { ApolloServer, gql } = require('apollo-server')
const { v4: uuid } = require('uuid')

const typeDefs = gql `
  type Entidad {
    _id: ID!
    razon: String!
    tipoDoc: String!
    numeroDoc: String!
  }
  type CuentaCupo {
    _id: ID!
    nroCuenta: String!
    id_entidad: ID!
    saldo: Float!
  }
  type Transferencia {
    _id: ID!
    cuentaFrom: ID!
    cuentaTo: ID!
    id_entidad: ID!
    cantidad: Float!
    fecha: String!
  }
  type Mutation {
    transferir(): Transferencia
  }
  type Query {
    saldoTotal(id_entidad: ID!): Float!
  }
`

const baseURL = 'http://localhost:3001'
const resolvers = {
    Query: {
        saldoTotal: async(root, args) => {
            let total = await axios.get(apiURL + '/api/saldo_cuentas_cupo/' + args.id_entidad).then((r) => {
                return r.data.total
            }).catch((error) => {
                return 0
            });
            return total
        }
    },
    Mutation: {
        transferir: (root, args) => {}
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`
Server ready at $ { url }
`)
})