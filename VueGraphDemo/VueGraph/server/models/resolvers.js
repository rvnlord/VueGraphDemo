const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createToken = (user, secret, expiresIn) => {
    return jwt.sign({ userName: user.userName, email: user.email }, secret, { expiresIn });
};

module.exports = {
    Query: {
        getPosts: async (_, args, { postSchema }) => {
            const posts = await postSchema.find({}).sort({ createdDate: "desc" }).populate({
                path: "createdBy",
                model: "User"
            });
            return posts;
        },
        getPost: async (_, { postId }, { postSchema }) => {
            return postSchema.findOne({ _id: postId }).populate({
                path: "messages.messageUser",
                model: "User"
            });
        },
        getUserPosts: async (_, { userId }, { postSchema }) => {
            return await postSchema.find({ createdBy: userId });
        },
        searchPosts: async (_, { searchTerm }, { postSchema }) => {
            if (!searchTerm) {
                return null;
            }

            return await postSchema.find( // Perform text search for search value of 'searchTerm'
                { $text: { $search: searchTerm } }, // Assign 'searchTerm' a text score to provide best match
                { score: { $meta: "textScore" } } // Sort results according to that textScore (as well as by likes in descending order)
            ).sort({
                score: { $meta: "textScore" },
                likes: "desc"
            }).limit(5);
        },
        infiniteScrollPosts: async (_, { pageNum, pageSize }, { postSchema }) => {
            let posts;
            if (pageNum === 1) {
                posts = await postSchema.find({}).sort({ createdDate: "desc" }).populate({
                    path: "createdBy",
                    model: "User"
                }).limit(pageSize);
            } else {
                const skips = pageSize * (pageNum - 1);
                posts = await postSchema.find({}).sort({ createdDate: "desc" }).populate({
                    path: "createdBy",
                    model: "User"
                }).skip(skips).limit(pageSize);
            }

            const totalPosts = await postSchema.countDocuments();
            const hasMore = totalPosts > pageSize * pageNum;

            return { hasMore, posts };
        },
        getCurrentUser: async (_, args, { userSchema, currentUser }) => {
            if (!currentUser) {
                return null;
            }
            const user = await userSchema.findOne({ userName: currentUser.userName }).populate({
                path: "favorites",
                model: "Post"
            });
            return user;
        }
    },
    Mutation: {
        addPost: async (_, { title, imageUrl, categories, description, creatorId }, { postSchema }) => {
            const newPost = await new postSchema({
                title,
                imageUrl,
                categories,
                description,
                createdBy: creatorId
            }).save();
            return newPost;
        },
        addPostMessage: async (_, { messageBody, userId, postId }, { postSchema }) => {
            const newMessage = {
                messageBody,
                messageUser: userId
            };
            const post = await postSchema.findOneAndUpdate(
                { _id: postId },
                { $push: { messages: { $each: [newMessage], $position: 0 } } },
                { new: true }
            ).populate({
                path: "messages.messageUser",
                model: "User"
            });
            return post.messages[0];
        },
        likePost: async (_, { postId, userName }, { postSchema, userSchema }) => {
            const post = await postSchema.findOneAndUpdate(
                { _id: postId },
                { $inc: { likes: 1 } },
                { new: true }
            );
            const user = await userSchema.findOneAndUpdate(
                { userName },
                { $addToSet: { favorites: postId } },
                { new: true }
            ).populate({
                path: "favorites",
                model: "Post"
            });
            return { likes: post.likes, favorites: user.favorites };
        },
        unlikePost: async (_, { postId, userName }, { postSchema, userSchema }) => {
            const post = await postSchema.findOneAndUpdate(
                { _id: postId },
                { $inc: { likes: -1 } },
                { new: true }
            );
            const user = await userSchema.findOneAndUpdate(
                { userName },
                { $pull: { favorites: postId } },
                { new: true }
            ).populate({
                path: "favorites",
                model: "Post"
            });
            return { likes: post.likes, favorites: user.favorites };
        },
        updateUserPost: async (_, { postId, userId, title, imageUrl, categories, description }, { postSchema }) => {
            return await postSchema.findOneAndUpdate(
                { _id: postId, createdBy: userId },
                { $set: { title, imageUrl, categories, description } },
                { new: true }
            );
        },
        deleteUserPost: async (_, { postId }, { postSchema }) => {
            return await postSchema.findOneAndRemove({ _id: postId });
        },
        signinUser: async (_, { userName, password }, { userSchema }) => {
            const user = await userSchema.findOne({ userName });
            if (!user) {
                throw new Error("User not found");
            }
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new Error("Invalid password");
            }
            return { token: createToken(user, process.env.SECRET, "1hr") };
        },
        signupUser: async (_, { userName, email, password }, { userSchema }) => {
            const user = await userSchema.findOne({ userName });

            if (user) {
                throw new Error("User already exists");
            }

            const newUser = await new userSchema({
                userName,
                email,
                password
            }).save();

            return { token: createToken(newUser, process.env.SECRET, "1hr") };
        }
    }
};