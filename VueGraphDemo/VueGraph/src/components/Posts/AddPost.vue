<template>
    <v-container text-center text-sm-left :style="{background: this.$vuetify.theme.themes.dark.secondary}" dark>
        <v-layout row wrap>
            <v-flex xs12 sm6 offset-sm3>

                <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleAddPost">

                    <!-- Title -->
                    <v-layout row>
                        <v-flex xs12>
                            <h1 style="color: white">Add Post</h1>
                        </v-flex>
                    </v-layout>

                    <!-- Add Post Form -->

                    <v-layout row>
                        <v-flex xs12>
                            <v-text-field :rules="titleRules" v-model="title" label="Post Title" type="text" required dark></v-text-field>
                        </v-flex>
                    </v-layout>

                    <v-layout row>
                        <v-flex xs12>
                            <v-text-field :rules="imageRules" v-model="imageUrl" label="Image URL" type="text" required dark></v-text-field>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12>
                            <img :src="imageUrl" height="300" />
                        </v-flex>
                    </v-layout>

                    <v-layout row>
                        <v-flex xs12>
                            <v-select dark :rules="categoriesRules" v-model="categories" :items="['Art', 'Education', 'Food', 'Furniture', 'Travel', 'Photography', 'Technology']" multiple label="Categories"></v-select>
                        </v-flex>
                    </v-layout>

                    <v-layout row>
                        <v-flex xs12>
                            <v-textarea :rules="descriptionRules" v-model="description" label="Description" type="text" required dark></v-textarea>
                        </v-flex>
                    </v-layout>

                    <v-layout row>
                        <v-flex xs12>
                            <v-btn :loading="loading" :disabled="!isFormValid || loading" type="submit" color="info">
                                <span slot="loader" class="custom-loader">
                                    <v-icon light>mdi-cached</v-icon>
                                </span>
                                Submit
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-form>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import { mapGetters } from "vuex";

    export default {
        name: "AddPost",
        data() {
            return {
                isFormValid: true,
                title: "",
                imageUrl: "",
                categories: [],
                description: "",
                titleRules: [
                    title => !!title || "Title is required",
                    title => title.length <= 20 || "Title must have less than 20 characters"
                ],
                imageRules: [
                    image => !!image || "Image is required"
                ],
                categoriesRules: [
                    categories => categories.length >= 1 || "At least 1 category is required"
                ],
                descriptionRules: [
                    description => !!description || "Description is required",
                    title => title.length <= 200 || "Title must have less than 200 characters"
                ]
            }
        },
        computed: {
            ...mapGetters(["loading", "user"])
        },
        methods: {
            handleAddPost() {
                if (!this.$refs.form.validate()) {
                    return;
                }
                this.$store.dispatch("addPost", {
                    title: this.title,
                    imageUrl: this.imageUrl,
                    categories: this.categories,
                    description: this.description,
                    creatorId: this.user._id
                });
                this.$router.push("/");
            }
        }
    };
</script>