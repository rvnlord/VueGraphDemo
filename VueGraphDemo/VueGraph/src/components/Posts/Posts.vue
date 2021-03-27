<template>
    <v-container fluid grid-list-xl>

        <!-- Post Cards -->
        <v-layout row wrap v-if="posts && posts.length > 0">
            <v-flex xs12 sm6 v-for="post in posts" :key="post._id">
                <v-card hover>
                    <v-responsive @click.native="goToPost(post._id)">
                        <v-img :src="post.imageUrl" height="30vh" lazy></v-img>
                    </v-responsive>

                    <v-card-actions>
                        <v-card-title primary>
                            <div>
                                <div class="headline">{{ post.title }}</div>
                                <span class="grey--text">{{ post.likes }} likes - {{ post.messages.length }} comments</span>
                            </div>
                        </v-card-title>
                        <v-spacer></v-spacer>
                        <v-btn @click="showPostCreator = !showPostCreator" icon>
                            <v-icon>{{ `mdi-chevron-${showPostCreator ? 'up' : 'down'}` }}</v-icon>
                        </v-btn>
                    </v-card-actions>

                    <!-- Post Creator Tile -->
                    <v-slide-y-transition>
                        <v-card-text v-show="showPostCreator" style="background: #383838">
                            <v-list-item>
                                <v-list-item-avatar>
                                    <img :src="post.createdBy.avatar">
                                </v-list-item-avatar>

                                <v-list-item-content>
                                    <v-list-item-title class="text--primary">{{ post.createdBy.userName }}</v-list-item-title>
                                    <v-list-item-subtitle class="font-weight-thin">Added: {{ unixTsToDateString(post.createdDate) }}</v-list-item-subtitle>
                                </v-list-item-content>

                                <v-list-item-action>
                                    <v-btn icon ripple>
                                        <v-icon color="grey lighten-1">mdi-information-outline</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-card-text>
                    </v-slide-y-transition>

                </v-card>
            </v-flex>
        </v-layout>

        <!-- Fetch More Button -->
        <v-layout v-if="hasMore" column>
            <v-flex xs12>
                <v-layout justify-center row>
                    <v-btn color="info" @click="showMorePosts">Fetch More</v-btn>
                </v-layout>
            </v-flex>
        </v-layout>

    </v-container>
</template>

<script>
    import "../../../server/common/extensions";
    import { mapGetters } from "vuex";
    import { apolloClient } from "../../main";
    import { INFINITE_SCROLL_POSTS } from "../../queries";

    const pageSize = 2;

    export default {
        name: "Posts",
        data() {
            return {
                pageNum: 1,
                showPostCreator: false,
                apolloClient: null,
                posts: [],
                hasMore: false
            };
        },
        created() {
            apolloClient.query({
                query: INFINITE_SCROLL_POSTS,
                variables: {
                    pageNum: 1,
                    pageSize
                },
                fetchPolicy: "no-cache"
            }).then(({ data }) => {
                this.posts = data.infiniteScrollPosts.posts;
                this.hasMore = data.infiniteScrollPosts.hasMore;
            }).catch(err => console.error(err));
        },
        methods: {
            showMorePosts() {
                this.pageNum++;
                apolloClient.query({
                    query: INFINITE_SCROLL_POSTS,
                    variables: {
                        pageNum: this.pageNum,
                        pageSize
                    },
                    fetchPolicy: "no-cache"
                }).then(({ data }) => {
                    this.posts = [...this.posts, ...data.infiniteScrollPosts.posts];
                    this.hasMore = data.infiniteScrollPosts.hasMore;
                }).catch(err => console.error(err));
            },
            unixTsToDateString(unixTs) {
                return unixTs.unixTsToDateString();
            },
            goToPost(postId) {
                this.$router.push(`/posts/${postId}`);
            }
        }
    };
</script>