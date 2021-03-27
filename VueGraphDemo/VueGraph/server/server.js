const { ApolloServer, AuthenticationError } = require("apollo-server");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const VueCli = require("@vue/cli-service");
const jwt = require("jsonwebtoken");

const filePath = path.resolve(__dirname, "models/typeDefs.gql");
const typeDefs = fs.readFileSync(filePath, "utf-8");
const resolvers = require("./models/resolvers");

require("dotenv").config({ path: "variables.env" });
const userSchema = require("./models/user");
const postSchema = require("./models/post");

const getUser = async token => {
    if (token) {
        try {
            return await jwt.verify(token, process.env.SECRET);
        } catch (err) {
            const sessionEndedMessage = "Your session has ended. Please Sign In again.";
            console.log(sessionEndedMessage);
            return null;
        }
    }
};

const graphQlServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: ex => ({
        name: ex.name,
        message: ex.message.replace("Context creation failed: ", "")
    }),
    context: async ({ req }) => {
        const token = req.headers["authorization"];
        console.log(`Authorization Token: ${token}`);
        return { userSchema, postSchema, currentUser: await getUser(token) };
    }
});

const vueCliServer = new VueCli(path.resolve(__dirname, "../")); // Preventing: This relative module was not found: * ./src/main.js
vueCliServer.init("development");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(() => {
    console.log("DB Connected");
    graphQlServer.listen({ port: 4000 }).then(({ url }) => {
        console.log(`GraphQl Playground Server listening on ${url}`);
        vueCliServer.run("serve").then(({ url: vueUrl }) => {
            console.log(`Vue Cli Server listening on ${vueUrl}`);
        });
    });
})
.catch(err => console.error(err));

