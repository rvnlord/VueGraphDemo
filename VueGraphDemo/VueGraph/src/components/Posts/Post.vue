<template>
    <v-container v-if="post" class="mt-5" flexbox center>
        <!-- Post Card -->
        <v-layout row wrap>
            <v-flex xs12>
                <v-card hover>
                    <v-card-title>
                        <h1 class="mr-3">{{ post.title }}</h1>
                        <v-btn @click="handleToggleLike" large icon v-if="user">
                            <v-icon large :color="checkIfPostLiked(post._id) ? 'red' : 'grey'">mdi-heart</v-icon>
                        </v-btn>
                        <h3 class="ml-3 font-weight-thin">{{ post.likes }} LIKES</h3>
                        <v-spacer></v-spacer>
                        <v-icon @click="goToPreviousPage" large color="white">mdi-arrow-left</v-icon>
                    </v-card-title>
                    <v-tooltip right>
                        <span>Click to enlarge image</span>
                        <template v-slot:activator="{ on, attrs }">
                            <v-responsive v-bind="attrs" v-on="on" @click="toggleImageDialog">
                                <v-img :src="post.imageUrl" id="post__image"></v-img>
                            </v-responsive>
                        </template>
                    </v-tooltip>
                    <!-- Enlarged Post Image -->
                    <v-dialog v-model="dialog">
                        <v-responsive>
                            <v-img :src="post.imageUrl" height="80vh"></v-img>
                        </v-responsive>
                    </v-dialog>
                    <v-card-text>
                        <span v-for="(category, index) in post.categories" :key="index">
                            <v-chip class="mb-3 mr-2" color="accent" text-color="white">{{ category }}</v-chip>
                        </span>
                        <h3>{{ post.description }}</h3>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
        <!-- Messages Section -->
        <div class="mt-3">
            <!-- Message Input-->
            <v-layout class="mb-3" v-if="user">
                <v-flex xs12>
                    <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleAddPostMessage">
                        <v-layout row>
                            <v-flex xs12>
                                <v-text-field :rules="messageRules" v-model="messageBody" clearable :append-outer-icon="messageBody && 'mdi-telegram'" @click:append-outer="handleAddPostMessage" label="Add message" typeof="text" prepend-icon="mdi-email" required></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-form>
                </v-flex>
            </v-layout>
            <!-- Messages -->
            <v-layout row wrap>
                <v-flex xs12>
                    <v-list subheader two-line>
                        <v-subheader>Messages ({{ post.messages.length }})</v-subheader>
                        <template v-for="message in post.messages">
                            <v-divider :key="message._id"></v-divider>
                            <v-list-item inset :key="message.title">
                                <v-list-item-avatar>
                                    <img :src="message.messageUser.avatar">
                                </v-list-item-avatar>
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ message.messageBody }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ message.messageUser.userName }}
                                        <span class="grey--text text-lighten-1 hidden-xs-only">{{ unixTsToDateString(message.messageDate) }}</span>
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action class="hidden-xs-only">
                                    <v-icon :color="checkIfOwnMessage(message) ? 'accent' : 'grey'">mdi-comment</v-icon>
                                </v-list-item-action>
                            </v-list-item>
                        </template>
                    </v-list>
                </v-flex>
            </v-layout>
        </div>
    </v-container>
</template>

<script>
    import "../../../server/common/extensions.js";
    import { mapGetters } from "vuex";
    import { ADD_POST_MESSAGE, GET_POST, LIKE_POST, UNLIKE_POST } from "../../queries.js";
    import { apolloClient } from "../../main";

    export default {
        name: "Post",
        props: ["postId"],
        data() {
            return {
                postLiked: false,
                dialog: false,
                messageBody: "",
                isFormValid: true,
                messageRules: [
                    message => !!message || "Message is required",
                    message => !!message && message.length < 75 || "Message must be less than 50 characters"
                ]
            }
        },
        created() {
            this.handleGetPost();
        },
        computed: {
            ...mapGetters(["post", "user", "userFavorites"])
        },
        methods: {
            handleGetPost() {
                this.$store.dispatch("getPost", {
                    postId: this.postId
                });
            },
            goToPreviousPage() {
                this.$router.go(-1);
            },
            toggleImageDialog() {
                if (window.innerWidth > 500) {
                    this.dialog = !this.dialog;
                }
            },
            unixTsToDateString(unixTs) {
                return unixTs.unixTsToDateString();
            },
            handleAddPostMessage() {
                if (!this.$refs.form.validate()) {
                    return;;
                }
                const variables = {
                    messageBody: this.messageBody,
                    userId: this.user._id,
                    postId: this.postId
                };
                apolloClient.mutate({
                    mutation: ADD_POST_MESSAGE,
                    variables,
                    update: (cache, { data: { addPostMessage }}) => {
                        this.post.messages.unshift(addPostMessage);
                    }
                }).then(({ data }) => {
                    this.$refs.form.reset();
                    console.log(data.addPostMessage);
                }).catch(err => console.error(err));
            },
            checkIfOwnMessage(message) {
                return this.user && this.user._id === message.messageUser._id;
            },
            handleLikePost() {
                const variables = {
                    postId: this.postId,
                    userName: this.user.userName
                };
                apolloClient.mutate({
                    mutation: LIKE_POST,
                    variables,
                    update: (cache, { data: { likePost } }) => {
                        const data = cache.readQuery({
                            query: GET_POST,
                            variables: { postId: this.postId }
                        });
                        data.getPost.likes += 1;
                        this.post.likes = data.getPost.likes;
                        cache.writeQuery({
                            query: GET_POST,
                            variables: { postId: this.postId },
                            data
                        });
                    }
                })
                .then(({ data }) => {
                    const updatedUser = {
                        ...this.user,
                        favorites: data.likePost.favorites
                    };
                    this.$store.commit("setUser", updatedUser);
                })
                .catch(err => console.error(err));
            },
            handleUnlikePost() {
                const variables = {
                    postId: this.postId,
                    userName: this.user.userName
                };
                apolloClient.mutate({
                    mutation: UNLIKE_POST,
                    variables,
                    update: (cache, { data: { unlikePost } }) => {
                        const data = cache.readQuery({
                            query: GET_POST,
                            variables: { postId: this.postId }
                        });
                        data.getPost.likes -= 1;
                        this.post.likes = data.getPost.likes;
                        cache.writeQuery({
                            query: GET_POST,
                            variables: { postId: this.postId },
                            data
                        });
                    }
                })
                .then(({ data }) => {
                    const updatedUser = {
                        ...this.user,
                        favorites: data.unlikePost.favorites
                    };
                    this.$store.commit("setUser", updatedUser);
                })
                .catch(err => console.error(err));
            },
            handleToggleLike() {
                if (this.postLiked) {
                    this.handleUnlikePost();
                } else {
                    this.handleLikePost();
                }
            },
            checkIfPostLiked(postId) {
                if (this.userFavorites && this.userFavorites.some(fave => fave._id === postId)) {
                    this.postLiked = true;
                    return true;
                } else {
                    this.postLiked = false;
                    return false;
                }
            }
        }
    }
</script>

<style scoped>
    #post__image {
        height: 400px !important;
    }
</style>