<template>
    <v-app style="background: #101010">
        <!-- Side NavBar -->
        <v-navigation-drawer color="secondary" app temporary dark fixed v-model="sideNav">
            <v-toolbar color="primary" dark text>
                <v-app-bar-nav-icon @click="toggleSideNav"></v-app-bar-nav-icon>
                <router-link to="/" tag="span" style="cursor: pointer">
                    <h1 class="title">VueShare</h1>
                </router-link>
            </v-toolbar>

            <v-divider></v-divider>

            <!-- Side NavBar Links -->
            <v-list>
                <v-list-item ripple v-for="item in sideNavItems" :key="item.title" :to="item.link">
                    <v-list-item-action>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>{{ item.title }}</v-list-item-content>
                </v-list-item>
                <v-list-item ripple v-if="user" @click="handleSignoutUser">
                    <v-list-item-action>
                        <v-icon>mdi-exit-to-app</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>Sign Out</v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <!-- Horizontal Navbar -->
        <v-app-bar fixed dark color="primary" style="height: 64px">
            <!-- App Title -->
            <v-app-bar-nav-icon @click="toggleSideNav"></v-app-bar-nav-icon>
            <v-toolbar-title class="hidden-xs-only">
                <router-link to="/" tag="span" style="cursor: pointer">VueShare</router-link>
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <!-- Search Input -->
            <v-text-field v-model="searchTerm"
                          @input="handleSearchPosts"
                          flex
                          prepend-icon="mdi-magnify"
                          placeholder="Search posts"
                          color="accent"
                          single-line
                          hide-details>
            </v-text-field>

            <!-- Search Results Card -->
            <v-card dark v-if="searchResults.length" id="search__card">
                <v-list>
                    <v-list-item v-for="result in searchResults" :key="result._id" @click="goToSearchResult(result._id)">
                        <v-list-item-title>
                            {{ result.title }} -
                            <span class="font-weight-thin">{{ formatDescription(result.description) }}</span>
                        </v-list-item-title>

                        <!-- Show Icon if Result Favorited by User -->
                        <v-list-item-action v-if="checkIfUserFavorite(result._id)">
                            <v-icon>mdi-heart</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </v-card>

            <v-spacer></v-spacer>

            <!-- Horizontal Navbar Links -->
            <v-toolbar-items class="hidden-xs-only">
                <v-btn text v-for="item in horizontalNavItems" :key="item.title" :to="item.link">
                    <v-icon class="hidden-sm-only" left>{{ item.icon }}</v-icon>
                    {{ item.title }}
                </v-btn>
                <v-btn text to="/profile" v-if="user">
                    <v-icon class="hidden-sm-only" left>mdi-account-box</v-icon>
                    <v-badge right :color="userFavorites.length ? 'blue darken-4' : 'transparent'" :class="{ 'bounce': badgeAnimated }">
                        <span slot="badge" v-if="userFavorites.length">{{ userFavorites.length }}</span>
                        Profile
                    </v-badge>
                </v-btn>
                <v-btn text v-if="user" @click="handleSignoutUser">
                    <v-icon class="hidden-sm-only" left>mdi-exit-to-app</v-icon>
                    Sign Out
                </v-btn>
            </v-toolbar-items>
        </v-app-bar>

        <!-- App Content -->
        <main dark>
            <v-container style="margin-top: 64px">
                <transition name="fade">
                    <router-view :key="$route.fullPath" />
                </transition>

                <!-- Auth SnackBar -->
                <v-snackbar v-model="authSnackbar" color="success" :timeout="5000" bottom left>
                    <v-icon class="mr-3" color="white">mdi-check-circle</v-icon>
                    <h3>You are now Signed In</h3>
                    <v-btn dark text @click="authSnackbar = false">Close</v-btn>
                </v-snackbar>

                <!-- Auth Error SnackBar -->
                <v-snackbar v-if="authError" v-model="authErrorSnackbar" color="error" :timeout="5000" bottom left>
                    <v-icon class="mr-3" color="white">mdi-cancel</v-icon>
                    <h3>{{ authError.message }}</h3>
                    <v-btn dark text to="/signin">Sign In</v-btn>
                </v-snackbar>

            </v-container>
        </main>
    </v-app>
</template>

<script>
    import { mapGetters } from "vuex";

    export default {
        name: "App",
        data() {
            return {
                sideNav: false,
                authSnackbar: false,
                authErrorSnackbar: false,
                badgeAnimated: false,
                searchTerm: ""
            };
        },
        watch: {
            user(newValue, oldValue) {
                //console.log("new value", newValue);
                //console.log("old value", oldValue);
                if (oldValue === null) {
                    this.authSnackbar = true;
                }
            },
            authError(value) {
                if (value !== null) {
                    this.authErrorSnackbar = true;
                }
            },
            userFavorites(value) {
                if (value) {
                    this.badgeAnimated = true;
                    setTimeout(() => (this.badgeAnimated = false), 1000);
                }
            }
        },
        computed: {
            ...mapGetters(["authError", "user", "userFavorites", "searchResults"]),
            horizontalNavItems() {
                let items = [
                    { icon: "mdi-message-text", title: "Posts", link: "/posts" },
                    { icon: "mdi-lock-open-outline", title: "Sign In", link: "/signin" },
                    { icon: "mdi-pencil", title: "Sign Up", link: "/signup" }
                ];

                if (this.user) {
                    items = [
                        { icon: "mdi-message-text", title: "Posts", link: "/posts" }
                    ];
                }

                return items;
            },
            sideNavItems() {
                let items =  [
                    { icon: "mdi-message-text", title: "Posts", link: "/posts" },
                    { icon: "mdi-lock-open-outline", title: "Sign In", link: "/signin" },
                    { icon: "mdi-pencil", title: "Sign Up", link: "/signup" }
                ];

                if (this.user) {
                    items = [
                        { icon: "mdi-message-text", title: "Posts", link: "/posts" },
                        { icon: "mdi-star", title: "Create Post", link: "/post/add" },
                        { icon: "mdi-account-box", title: "Profile", link: "/profile" }
                    ];
                }

                return items;
            }
        },
        methods: {
            handleSignoutUser() {
                this.$store.dispatch("signoutUser");
            },
            toggleSideNav() {
                this.sideNav = !this.sideNav;
            },
            handleSearchPosts() {
                this.$store.dispatch("searchPosts", {
                    searchTerm: this.searchTerm
                });
            },
            goToSearchResult(resultId) {
                this.searchTerm = ""; // Clear search term
                this.$router.push(`/posts/${resultId}`); // Go to desired result
                this.$store.commit("clearSearchResults"); // Clear search results
            },
            formatDescription(desc) {
                return desc.length > 30 ? `${desc.slice(0, 30)}...` : desc;
            },
            checkIfUserFavorite(resultId) {
                return this.userFavorites && this.userFavorites.some(fave => fave._id === resultId);
            }
        }
    };
</script>

<style>
    .fade-enter-active,
    .fade-leave-active {
        transition-property: opacity;
        transition-duration: 0.25s;
    }

    .fade-enter-active {
        transition-delay: 0.25s;
    }

    .fade-enter,
    .fade-leave-active {
        opacity: 0;
    }

    .v-toolbar__content {
        height: 64px !important;
    }

    div > .v-alert:not(.v-sheet--tile) {
        margin-bottom: 0;
        transition: all .28s cubic-bezier(.4,0,.2,1);
        transform: scale(0);
    }

    .v-menu__content .v-list .v-list-item--active,
    .v-menu__content .v-list .v-list-item--active .v-icon {
        color: inherit !important;
        caret-color: inherit !important;
    }

    .v-input__control,
    .v-input__control .theme--dark.v-label,
    .v-input__control .v-input__slot:before,
    .v-input__control .v-input__slot:after,
    .v-application .primary--text.theme--dark.v-icon {
        color: hsla(0,0%,100%,.7) !important;
        caret-color: hsla(0,0%,100%,.7) !important;
    }

    div .theme--dark.v-list,
    div .theme--dark.v-card {
        background: #303030;
    }

    div .v-dialog > .v-card > .v-card__title {
        padding: 16px 12px 16px;
    }

    .bounce {
        animation: bounce 1s both;
    }

    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0, 0, 0);
        }
        40%, 43% {
            transform: translate3d(0, -20px, 0);
        }
        70% {
            transform: translate3d(0, -10px, 0);
        }
        90% {
            transform: translate3d(0, -4px, 0);
        }
    }

    /* Search Results Card */
    #search__card {
        position: absolute;
        width: 100vw;
        z-index: 8;
        top: 100%;
        left: 0%;
    }

</style>