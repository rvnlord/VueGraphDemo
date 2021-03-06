<template>
    <v-container class="text-xs-center">

        <!-- User Details Card -->
        <v-flex sm8 offset-sm2>
            <v-card class="white--text" color="secondary">
                <v-layout>
                    <v-flex xs5>
                        <div style="height: 100%; display: flex; justify-content: center; align-items: center">
                            <v-img height="125px" contain :src="user.avatar"></v-img>
                        </div>
                    </v-flex>
                    <v-flex xs7>
                        <v-card-title primary-title>
                            <div>
                                <div class="headline">{{user.userName}}</div>
                                <div>Joined: {{ unixTsToDateString(user.joinDate) }}</div>
                                <div class="hidden-xs-only font-weight-thin">{{ user.favorites.length }} Favorites</div>
                                <div class="hidden-xs-only font-weight-thin">{{ userPosts.length }} Posts Added</div>
                            </div>
                        </v-card-title>
                    </v-flex>
                </v-layout>
            </v-card>
        </v-flex>

        <!-- Posts Favorited by User -->
        <v-container v-if="!userFavorites.length">
            <v-layout row wrap>
                <v-flex xs12>
                    <h2>You have no favorites currently. Go and add some!</h2>
                </v-flex>
            </v-layout>
        </v-container>
        <v-container class="mt-3" v-else>
            <v-flex xs12 text-center>
                <h2 class="font-weight-light mb-2">
                    Favorited
                    <span class="font-weight-regular"> ({{ userFavorites.length }})</span>
                </h2>
            </v-flex>
            <v-layout row wrap>
                <v-flex xs12 sm6 v-for="favorite in userFavorites" :key="favorite._id">
                    <v-card class="mt-3 ml-1 mr-2" hover>
                        <v-responsive @click="goToPost(favorite._id)">
                            <v-img height="30vh" :src="favorite.imageUrl"></v-img>
                        </v-responsive>
                        <v-card-text><h4>{{ favorite.title }}</h4></v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>

        <!-- Posts Created by User -->
        <v-container v-if="!userPosts.length">
            <v-layout row wrap>
                <v-flex xs12>
                    <h2>You have no posts currently. Go and add some!</h2>
                </v-flex>
            </v-layout>
        </v-container>

        <v-container class="mt-3" v-else>
            <v-flex xs12 text-center>
                <h2 class="font-weight-light mb-2">
                    Your Posts
                    <span class="font-weight-regular">({{ userPosts.length }})</span>
                </h2>
            </v-flex>
            <v-layout row wrap>
                <v-flex xs12 sm6 v-for="post in userPosts" :key="post._id">
                    <v-card class="mt-3 ml-1 mr-2" hover>
                        <v-container style="display: flex; justify-content: center; align-items: center">
                            <v-btn @click="loadPost(post)" color="info" floating fab small dark class="mr-2">
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                            <v-btn @click="handleDeleteUserPost(post)" color="error" floating fab small dark>
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </v-container>
                        <v-responsive @click="goToPost(post._id)">
                            <v-img height="30vh" :src="post.imageUrl"></v-img>
                        </v-responsive>
                        <v-card-text><h4>{{ post.title }}</h4></v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>

        <!-- Edit Post Dialog -->
        <v-dialog xs12 sm6 offset-sm3 persistent v-model="editPostDialog">
            <v-card>
                <v-card-title class="headline" style="background: #303030">Update Post</v-card-title>
               
                <v-form style="background: #212121; margin: 0;" v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleUpdateUserPost">
                    <div style="padding: 12px">
                        <v-text-field :rules="titleRules" v-model="title" label="Post Title" type="text" required></v-text-field>
                        <v-text-field :rules="imageRules" v-model="imageUrl" label="Image URL" type="text" required></v-text-field>
                        <img :src="imageUrl" height="300">
                        <v-select v-model="categories" :rules="categoriesRules" :items="['Art', 'Education', 'Food', 'Furniture', 'Travel', 'Photography', 'Technology']" multiple label="Categories"></v-select>
                        <v-textarea v-model="description" :rules="descriptionRules"  label="Description" type="text" required></v-textarea>

                        <v-divider></v-divider>
                        <v-spacer></v-spacer>
                        <div class="mt-2" style="text-align: right">
                            <v-btn color="success" :disabled="!isFormValid" type="submit" class="mr-2">Update</v-btn>
                            <v-btn color="error" @click="editPostDialog = false">Cancel</v-btn>
                        </div>
                    </div>
                </v-form>
              
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>
    import "../../../server/common/extensions.js";
    import { mapGetters } from "vuex";

    export default {
        name: "Profile",
        data() {
            return {
                editPostDialog: false,
                isFormValid: true,
                title: "",
                imageUrl: "",
                categories: [],
                description: "",
                titleRules: [
                    title => !!title || "Title is required",
                    title => title.length < 20 || "Title must have less than 20 characters"
                ],
                imageRules: [
                    image => !!image || "Image is required"
                ],
                categoriesRules: [
                    categories => categories.length >= 1 || "At least one category is required"
                ],
                descriptionRules: [
                    description => !!description || "Description is required",
                    description => description.length < 200 || "Description must have less than 200 characters"
                ]
            };
        },
        computed: {
            ...mapGetters(["user", "userFavorites", "userPosts"])
        },
        created() {
            this.handleGetUserPosts();
        },
        methods: {
            unixTsToDateString(unixTs) {
                return unixTs.unixTsToDateString();
            },
            handleGetUserPosts() {
                this.$store.dispatch("getUserPosts", {
                    userId: this.user._id
                });
            },
            handleUpdateUserPost() {
                if (!this.$refs.form.validate()) {
                    return;
                }

                this.$store.dispatch("updateUserPost", {
                    postId: this.postId,
                    userId: this.user._id,
                    title: this.title,
                    imageUrl: this.imageUrl,
                    categories: this.categories,
                    description: this.description
                });
                this.editPostDialog = false;
            },
            handleDeleteUserPost(post) {
                this.loadPost(post, false);
                const deletePost = window.confirm("Are you sure you want to delete this post?");
                if (deletePost) {
                    this.$store.dispatch("deleteUserPost", { postId: this.postId });
                }
            },
            loadPost({ _id, title, imageUrl, categories, description }, editPostDialog = true) {
                this.editPostDialog = editPostDialog;
                this.postId = _id;
                this.title = title;
                this.imageUrl = imageUrl;
                this.categories = categories;
                this.description = description;
            },
            goToPost(id) {
                this.$router.push(`/posts/${id}`);
            }
        }
    };
</script>
