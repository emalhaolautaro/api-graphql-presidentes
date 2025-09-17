// server.js

const { ApolloServer, gql } = require('apollo-server');
const presidents = require('./database'); // Importa los datos de database.js

// Definición del esquema (Schema Definition Language - SDL)
const typeDefs = gql`

input PresidenteFilter {
    nombre: String
    anio: Int
  }

  type Presidente {
    nombre: String!
    mandato: String!
  }

  type Query {
    presidentes: [Presidente]
    presidente(nombre: String!): Presidente
  }

  type Mutation {
    addPresidente(nombre: String!, mandato: String!): Presidente
    updatePresidente(nombreActual: String!, nombreNuevo: String, mandatoNuevo: String): Presidente
    deletePresidente(nombre: String!): Presidente
  }
`;

// Resolvers: las funciones que devuelven los datos para el esquema
const resolvers = {
  Query: {
    presidentes: (_, { filter }) => {
      let filteredPresidents = presidents;

      if (filter) {
        if (filter.nombre) {
          const filterNombre = filter.nombre.toLowerCase();
          filteredPresidents = filteredPresidents.filter(p => 
            p.nombre.toLowerCase().includes(filterNombre)
          );
        }
        if (filter.anio) {
          filteredPresidents = filteredPresidents.filter(p => {
            const [inicio, finStr] = p.mandato.split('-');
            const anioInicio = parseInt(inicio);
            const anioFin = finStr === 'presente' ? new Date().getFullYear() : parseInt(finStr);
            return filter.anio >= anioInicio && filter.anio <= anioFin;
          });
        }
      }
      return filteredPresidents;
    },
    
    presidente: (_, { nombre }) => presidents.find(p => p.nombre.toLowerCase() === nombre.toLowerCase()),
  },
  Mutation: {
    addPresidente: (_, { nombre, mandato }) => {
      const newPresidente = { nombre, mandato };
      presidents.push(newPresidente);
      return newPresidente;
    },
    updatePresidente: (_, { nombreActual, nombreNuevo, mandatoNuevo }) => {
      const presidenteIndex = presidents.findIndex(p => p.nombre.toLowerCase() === nombreActual.toLowerCase());
      if (presidenteIndex > -1) {
        if (nombreNuevo) presidents[presidenteIndex].nombre = nombreNuevo;
        if (mandatoNuevo) presidents[presidenteIndex].mandato = mandatoNuevo;
        return presidents[presidenteIndex];
      }
      return null;
    },
    deletePresidente: (_, { nombre }) => {
      const presidenteIndex = presidents.findIndex(p => p.nombre.toLowerCase() === nombre.toLowerCase());
      if (presidenteIndex > -1) {
        const [deletedPresidente] = presidents.splice(presidenteIndex, 1);
        return deletedPresidente;
      }
      return null;
    },
  },
};

// Configuración del servidor
const server = new ApolloServer({ typeDefs, resolvers });

// Iniciar el servidor
server.listen().then(({ url }) => {
  console.log(`🚀 Servidor listo en ${url}`);
});