<template>
    <v-container text-center text-sm-left>    
        <v-layout row wrap>
            <v-flex xs12 sm6 offset-sm3>
                <v-card :style="{background: this.$vuetify.theme.themes.dark.primary, 'box-shadow': '0 0 6px 2px black', 'padding': '12px'}" dark>
                    <v-container>
                        <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleSignInUser">
                            <!-- Title -->
                            <v-layout row>
                                <v-flex xs12>
                                    <h1 style="color: white">Sign In</h1>
                                </v-flex>
                            </v-layout>

                            <!-- Error Alert -->
                            <v-layout v-if="error" row wrap>
                                <v-flex xs12>
                                    <form-alert :message="error.message"></form-alert>
                                </v-flex>
                            </v-layout>

                            <!-- SignIn Form -->
                            <v-layout row>
                                <v-flex xs12>
                                    <v-text-field :rules="userNameRules" v-model="userName" prepend-icon="mdi-face" label="UserName" type="text" required></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout row>
                                <v-flex xs12>
                                    <v-text-field :rules="passwordRules" v-model="password" prepend-icon="mdi-door-closed-lock" label="Password" type="password" required></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout row>
                                <v-flex xs12>
                                    <v-btn :loading="loading" :disabled="!isFormValid || loading" type="submit" color="accent">
                                        <span slot="loader" class="custom-loader">
                                            <v-icon light>mdi-cached</v-icon>
                                        </span>
                                        Sign In
                                    </v-btn>
                                    <h3 class="mt-4">Don't have an account? <router-link to="/signup" style="color: white">Sign Up</router-link></h3>
                                </v-flex>
                            </v-layout>
                        </v-form>
                    </v-container>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import { mapGetters } from "vuex";

    export default {
        name: "Signin",
        data() {
            return {
                isFormValid: true,
                userName: "",
                password: "",
                userNameRules: [
                    userName => !!userName || "User Name is required",
                    userName => userName.length < 10 || "User Name must be less than 10 characters"
                ],
                passwordRules: [
                    password => !!password || "Password is required",
                    password => password.length >= 4 || "Password must be at least 4 characters"
                ]
            };
        },
        computed: {
            ...mapGetters(["loading", "error", "user"])
        },
        watch: {
            user(value) { // if user is set redirect to home page
                if (value) {
                    this.$router.push("/");
                }
            }
        },
        methods: {
            handleSignInUser() {
                if (!this.$refs.form.validate()) {
                    return;
                }
                this.$store.dispatch("signinUser", {
                    userName: this.userName,
                    password: this.password
                });
            }
        }
    };
</script>

<style>
    .custom-loader {
        animation: loader 1s infinite;
        display: flex;
    }

    @-moz-keyframes loader {
        from {
            transform: rotate(0);
        }

        to {
            transform: rotate(360deg);
        }
    }

    @-webkit-keyframes loader {
        from {
            transform: rotate(0);
        }

        to {
            transform: rotate(360deg);
        }
    }

    @-o-keyframes loader {
        from {
            transform: rotate(0);
        }

        to {
            transform: rotate(360deg);
        }
    }

    @keyframes loader {
        from {
            transform: rotate(0);
        }

        to {
            transform: rotate(360deg);
        }
    }
</style>