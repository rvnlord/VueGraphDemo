<template>
    <v-card>
        <v-card-title class="headline" style="background: #303030">Add Post</v-card-title>

        <v-form style="background: #212121; margin: 0;" v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleUpdateUserPost">
            <div style="padding: 12px">
                <v-text-field :rules="titleRules" v-model="title" label="Post Title" type="text" required></v-text-field>
                <v-text-field :rules="imageRules" v-model="imageUrl" label="Image URL" type="text" required></v-text-field>
                <img :src="imageUrl" height="300">
                <v-select v-model="categories" :rules="categoriesRules" :items="['Art', 'Education', 'Food', 'Furniture', 'Travel', 'Photography', 'Technology']" multiple label="Categories"></v-select>
                <v-textarea :rules="descriptionRules" v-model="description" label="Description" type="text" required></v-textarea>

                <v-divider></v-divider>
                <v-spacer></v-spacer>
                <div class="mt-2" style="text-align: right">
                    <v-btn color="success" :disabled="!isFormValid" type="submit" class="mr-2">Update</v-btn>
                    <v-btn color="error" @click="editPostDialog = false">Cancel</v-btn>
                </div>
            </div>
        </v-form>

    </v-card>
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