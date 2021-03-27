import Vue from "vue";
import Vuex from "vuex";
import router from "./router";

import { apolloClient } from "./main";
import {
     GET_CURRENT_USER, SIGNIN_USER, SIGNUP_USER, GET_POSTS, GET_POST, ADD_POST, INFINITE_SCROLL_POSTS, 
     SEARCH_POSTS, GET_USER_POSTS, UPDATE_USER_POST, DELETE_USER_POST
} from "./queries";

Vue.use(Vuex);

const getFrame = () => new Promise(resolve => window.requestAnimationFrame(resolve));
const delay = (d) => new Promise(resolve => setTimeout(resolve, d));

export default new Vuex.Store({
    state: {
        posts: [],
        searchResults: [],
        userPosts: [],
        post: null,
        user: null,
        loading: false,
        error: null,
        authError: null,
        hasMore: true
    },
    mutations: {
        setPosts: (state, payload) => {
            state.posts = payload;
        },
        setSearchResults: (state, payload) => {
            if (payload !== null) {
                state.searchResults = payload;
            }
        },
        setUserPosts: (state, payload) => {
            state.userPosts = payload;
        },
        setPost: (state, payload) => {
            state.post = payload;
        },
        setHasMore: (state, payload) => {
            state.hasMore = payload;
        },
        setUser: (state, payload) => {
            state.user = payload;
        },
        setLoading: (state, payload) => {
            state.loading = payload;
        },
        setError: async (state, payload) => {
            state.error = payload;
            await getFrame();
            const alert = document.getElementsByClassName("v-alert")[0];
            alert.style.transform = "scale(1)";

            var dismissButton = [].filter.call(
                [].filter.call(alert.childNodes, 
                    n => n.className === "v-alert__wrapper")[0].childNodes, 
                n => n.className.split(" ").some(c => c === "v-alert__dismissible"))[0];
            
            dismissButton.addEventListener("click", async e => {
                alert.style.display = "block";
                await getFrame();
                alert.style.transform = "scale(0)";
                await delay(280);
                alert.style.display = "none";
                e.preventDefault();
            });
        },
        setAuthError: (state, payload) => {
            state.authError = payload;
        },
        clearUser: state => state.user = null,
        clearError: async state => {
            state.error = null;
        },
        clearSearchResults: state => (state.searchResults = [])
    },
    actions: {
        getCurrentUser: ({ commit }) => {
            commit("setLoading", true);
            const token = localStorage.getItem("token");
            apolloClient.query({
                query: GET_CURRENT_USER
            }).then(({ data }) => {
                commit("setLoading", false);
                commit("setUser", data.getCurrentUser);
                console.log(data.getCurrentUser);
            }).catch(err => {
                commit("setLoading", false);
                console.log(err);
            });
        },
        getPosts: ({ commit }) => {
            commit("setLoading", true);
            apolloClient.query({
                query: GET_POSTS
            }).then(({ data }) => {
                commit("setPosts", data.getPosts); // passes data from actions to state via mutation
                commit("setLoading", false);
                console.log(data.getPosts);
            }).catch(err => {
                commit("setLoading", false);
                console.error(err);
            });
        },
        getUserPosts: ({ commit }, payload) => {
            apolloClient.query({
                query: GET_USER_POSTS,
                variables: payload,
                fetchPolicy: "no-cache"
            }).then(({ data }) => {
                commit("setUserPosts", data.getUserPosts);
                // console.log(data.getUserPosts);
            }).catch(err => console.error(err));
        },
        getPost: ({ commit }, payload) => {
            apolloClient.query({
                query: GET_POST,
                variables: payload
            }).then(({ data }) => {
                commit("setPost", data.getPost);
            });
        }, 
        signinUser: async ({ commit }, payload) => {
            commit("clearError");
            commit("setLoading", true);
            apolloClient.mutate({
                mutation: SIGNIN_USER,
                variables: payload
            }).then(({ data }) => {
                commit("setLoading", false);
                localStorage.setItem("token", data.signinUser.token);
                router.go();
            }).catch(err => {
                commit("setLoading", false);
                commit("setError", err);
                console.log(err);
            });
        },
        signoutUser: async ({ commit }) => { // clean user in state, remove token from localStorage, end session
            commit("clearUser");
            localStorage.setItem("token", "");
            await apolloClient.resetStore();
            router.push("/");
        },
        signupUser: async ({ commit }, payload) => {
            commit("clearError");
            commit("setLoading", true);
            apolloClient.mutate({
                mutation: SIGNUP_USER,
                variables: payload
            }).then(({ data }) => {
                commit("setLoading", false);
                localStorage.setItem("token", data.signupUser.token);
                router.go();
            }).catch(err => {
                commit("setLoading", false);
                commit("setError", err);
                console.log(err);
            });
        },
        addPost: ({ commit }, payload) => {
            apolloClient.mutate({
                mutation: ADD_POST,
                variables: payload,
                update: (cache, { data: { addPost } }) => {
                    const data = cache.readQuery({ query: GET_POSTS }); // First read the query you want to update
                    data.getPosts.unshift(addPost); // Create updated data
                    console.log(data);
                    cache.writeQuery({ // Write updated data back to query
                        query: GET_POSTS,
                        data
                    });
                },
                optimisticResponse: { // optimistic response ensures data is added immediately as we specified for the update function
                    __typename: "Mutation",
                    addPost: {
                        __typename: "Post",
                        _id: -1,
                        ...payload
                    }
                },
                refetchQueries: [
                    {
                        query: INFINITE_SCROLL_POSTS,
                        variables: {
                            pageNum: 1,
                            pageSize: 2
                        }
                    },
                    {
                        query: GET_POSTS
                    }
                ]
            }).then(({ data }) => {
                console.log(data.addPost);
            }).catch(ex => {
                console.error(ex);
            });
        },
        searchPosts: ({ commit }, payload) => {
            apolloClient.query({
                query: SEARCH_POSTS,
                variables: payload
            }).then(({ data }) => {
                commit("setSearchResults", data.searchPosts);
                //console.log(data.searchPosts);
            }).catch(err => console.error(err));
        },
        updateUserPost: ({ state, commit }, payload) => {
            apolloClient.mutate({
                mutation: UPDATE_USER_POST,
                variables: payload,
                refetchQueries: [
                    {
                        query: INFINITE_SCROLL_POSTS,
                        variables: {
                            pageNum: 1,
                            pageSize: 2
                        }
                    },
                    {
                        query: GET_POSTS
                    }
                ]
            }).then(({ data }) => {
                const index = state.userPosts.findIndex(post => post._id === data.updateUserPost._id);
                const userPosts = [
                    ...state.userPosts.slice(0, index),
                    data.updateUserPost,
                    ...state.userPosts.slice(index + 1)
                ];
                commit("setUserPosts", userPosts);
            }).catch(err => console.error(err));
        },
        deleteUserPost: ({ state, commit }, payload) => {
            apolloClient.mutate({
                mutation: DELETE_USER_POST,
                variables: payload,
                refetchQueries: [
                    {
                        query: INFINITE_SCROLL_POSTS,
                        variables: {
                            pageNum: 1,
                            pageSize: 2
                        }
                    },
                    {
                        query: GET_POSTS
                    }
                ]
            }).then(({ data }) => {
                const index = state.userPosts.findIndex(post => post._id === data.deleteUserPost._id);
                const userPosts = [
                    ...state.userPosts.slice(0, index),
                    ...state.userPosts.slice(index + 1)
                ];
                commit("setUserPosts", userPosts);
            }).catch(err => console.error(err));
        }
    },
    getters: {
        posts: state => state.posts,
        searchResults: state => state.searchResults,
        userPosts: state => state.userPosts,
        post: state => state.post,
        hasMore: state => state.hasMore,
        loading: state => state.loading,
        user: state => state.user,
        userFavorites: state => state.user && state.user.favorites,
        error: state => state.error,
        authError: state => state.authError
    }
});