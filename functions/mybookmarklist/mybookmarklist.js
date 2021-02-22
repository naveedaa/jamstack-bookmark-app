const { ApolloServer, gql } = require('apollo-server-lambda')
var faunadb = require('faunadb'),
  q = faunadb.query;
  require('dotenv').config()

const typeDefs = gql`
  type Query {
    bookmarks: [Bookmark!]
  }
  type Bookmark {
    id: ID!
    title: String!
    url: String!
  }
  type Mutation {
    addBookmark(title: String!, url: String!): Bookmark
    deleteBookmark(id: String!) : Bookmark
  }
`

const resolvers = {
  Query: {
    bookmarks: async () => {
      var adminClient = new faunadb.Client({ secret: 'fnAD_9KrjLACARb41rzyeZP8Ha-_qJTXLsMT2ocn' });
      
      try {
        const result = await adminClient.query(
          q.Map(
            q.Paginate(q.Match(q.Index('url'))),
            q.Lambda(x => q.Get(x))
          )
        )
        console.log(result.data)

        return result.data.map(d => {
          return {
            id: d.ref.id,
            title: d.data.title,
            url: d.data.url
          }
        })

      } catch (err) {
        console.log(err);
      }
    }
  },
  Mutation: {
    addBookmark: async (_, { title, url }) => {
      var adminClient = new faunadb.Client({ secret: 'fnAD_9KrjLACARb41rzyeZP8Ha-_qJTXLsMT2ocn' });
      // console.log("*******", title, url)

      try {
        const result = await adminClient.query(
          q.Create(
            q.Collection('bookmarks'),
            {
              data: {
                title,
                url
              }
            },
          )
        )
        return result.data
      }
      catch (err) {
        console.log(err)
      }
    },
    deleteBookmark: async (_, { id }) => {
      console.log(id)
      var adminClient = new faunadb.Client({ secret: 'fnAD_9KrjLACARb41rzyeZP8Ha-_qJTXLsMT2ocn' });
      try {
        const result = await adminClient.query(
          q.Delete(q.Ref(q.Collection('bookmarks'), id))
        )
      } catch (err) {
        console.log(err)
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

exports.handler = server.createHandler()