<template>
    <v-app style="background: transparent">
        <h1 style="color: white">Home</h1>
        <v-container text-center>
            <v-layout row v-if="loading">
                <v-dialog v-model="loading" persistent fullscreen>
                    <v-container fill-height>
                        <v-layout row justify-center align-center>
                            <v-progress-circular indeterminate :size="70" :width="7" color="text"></v-progress-circular>
                        </v-layout>
                    </v-container>
                </v-dialog>
            </v-layout>
            <v-flex x12 v-if="!loading && posts.length > 0">
                <v-carousel v-bind="{ 'cycle': true }" interval="3000">
                    <v-carousel-item v-for="post in posts" :key="post._id" :src="post.imageUrl" @click.native="goToPost(post._id)">
                        <h1 id="carousel__title">{{ post.title }}</h1>
                    </v-carousel-item>
                </v-carousel>
            </v-flex>
        </v-container>
        <!-- <ApolloQuery :query="getPostsQuery">
            <template slot-scope="{ result: { loading, error, data, networkStatus } }">
                <div v-if="networkStatus" style="color: white">Network Status: {{ networkStatus }}</div>
                <div v-if="loading" style="color: white">Loading...</div>
                <div v-else-if="error" style="color: white">Error! {{ error.message }}</div>
                <ul v-else-if="data" v-for="post in data.getPosts" :key="post._id" style="color: white">
                    <li>{{ post.title }}</li>
                    <li>{{ post.imageUrl }}</li>
                    <li>{{ post.description }}</li>
                    <li>{{ post.likes }}</li>
                </ul>
            </template>
        </ApolloQuery>-->
        <v-btn color="accent" style="width: 150px">Test Button</v-btn>
    </v-app>
</template>

<script>
    import { mapGetters } from "vuex";
			 
    export default {
        name: "home",
        created() {
            this.handleGetCarouselPosts();
        },
        computed: {
            ...mapGetters(["loading", "posts"])
            // -- OR:
            //posts() {
            //    return this.$store.getters.posts;
            //},
            //loading() {
            //    return this.$store.getters.loading;
            //}
        },
        methods: {
            handleGetCarouselPosts() {
                this.$store.dispatch("getPosts");
            },
            goToPost(postId) {
                this.$router.push(`/posts/${postId}`);
            }
        }
    };
</script>

<style scoped>
    #carousel__title {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 5px 5px 0 0;
        padding: 0.5em;
        margin: 0 auto;
        bottom: 50px;
        left: 0;
        right: 0;
    }

    * >>>.v-carousel__controls {
        background: rgba(0, 0, 0, 0.8);
    }
</style>
