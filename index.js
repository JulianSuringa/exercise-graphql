'use strict';

const express = require('express');
const graphqlHTTP = require('express-graphql');

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean
} = require('graphql');

const {
  globalIdField,
  connectionDefinitions,
  connectionFromPromisedArray,
  connectionArgs,
  mutationWithClientMutationId,

} = require('graphql-relay');

const {getVideoById, getVideos, createVideo} = require('./src/data');
const {nodeInterface, nodeField} = require('./src/node');

const PORT  = process.env.PORT || 3000;

const videoType = new GraphQLObjectType({
  name: 'video',
  description: ' A video on Egghead.io',
  fields: {
    id: globalIdField(),
    title: {
      type: GraphQLString,
      description: 'The title of the video.',
    },
    duration: {
      type: GraphQLInt,
      description: 'The duration of the video (in seconds).',
    },
    released: {
      type: GraphQLBoolean,
      decription: 'Whether or not the video has been released.',
    },
  },
  interfaces: [nodeInterface]
})

exports.videoType = videoType;

const {connectionType: VideoConnection} = connectionDefinitions({
  nodeType: videoType,
  connectionFields: () => ({
    totalCount: {
      type: GraphQLInt,
      decription:  'A count of the total number of object in this  connections.',
      resolve: (conn) => {
        return conn.edges.length;
      }
    }
  })
});

const queryType = new GraphQLObjectType ({
  name: 'QueryType',
  description: 'the root of the query',
  fields: {
    node: nodeField,
    videos: {
      type: VideoConnection,
      args: connectionArgs,
      resolve: (_, args) => connectionFromPromisedArray(
        getVideos(),
        args
      ),
    },
    video: {
      type: videoType,
      args: {
        id:{
          type: new GraphQLNonNull(GraphQLID),
          description: 'the id of the video.'
        },
      },
      resolve: (_, args) => {
        return getVideoById(agrs.id);

      }
    }
  }
})

const videoMutation = mutationWithClientMutationId({
  name: 'AddVideo',
  inputFields: {
    title: {
      type:  new GraphQLNonNull(GraphQLString),
      description: 'The title of the video',
    },

    duration: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The duration of the video (in seconds).',
    },

    released: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether or not the video has been released.',
    },
  },

  outputFields: {
    video: {
      type: videoType,
    }

  },

  mutateAndGetPayload: (args) => new Promise((resolve, reject) => {

    Promise.resolve(createVideo(args))
      .then((video) =>resolve({video}))
      .catch(reject);

  }),
})

const  mutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'The root Mutation Type',
  fields: {
    createVideo: videoMutation
  }
})

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

const server = express();

server.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

server.listen(PORT,() => {
  console.log(`listening on http://localhost:${PORT}`)
});