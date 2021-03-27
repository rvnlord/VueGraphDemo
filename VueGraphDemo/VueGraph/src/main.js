import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import Router from "vue-router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import ApolloClient from "apollo-boost";
import VueApollo from "vue-apollo";
import FormAlert from "./components/Shared/FormAlert";
import "@babel/polyfill";

Vue.component("form-alert", FormAlert);
Vue.use(VueApollo);

export const apolloClient = new ApolloClient({
    uri: "http://localhost:4000/graphql", // uri: "https://vue-graph-demo-rvnlord-gmailcom.vercel.app/graphql", 
    fetchOptions: {
        credentials: "include"
    },
    request: operation => {
        if (!localStorage.token) {
            localStorage.setItem("token", "");
        }
        operation.setContext({
            headers: {
                authorization: localStorage.getItem("token")
            }
        });
    },
    onError: ({ graphQLErrors, networkError }) => {
        if (networkError) {
            console.log("[networkError]", networkError);
        }

        if (graphQLErrors) {
            for (let err of graphQLErrors) {
                console.dir(err);
                if (err.name === "AuthenticationError") {
                    store.commit("setAuthError", err);
                    store.dispatch("signoutUser");
                }
            }
        }
    }
});

const apolloProvider = new VueApollo({ apolloClient });

Vue.config.productionTip = false;

new Vue({
    apolloProvider,
    router,
    store,
    vuetify,
    render: h => h(App),
    created() {
        this.$store.dispatch("getCurrentUser");
    }
}).$mount("#app");

const originalPush = Router.prototype.push;
Router.prototype.push = function(location) {
    return originalPush.call(this, location).catch(err => {
        if (err && err.name === "NavigationDuplicated") {
            return;
        }

        if (err && err.message.startsWith("Redirected when going from ") && err.message.endsWith(" via a navigation guard.")) {
            console.warn("Naviagation prevented by AuthGuard");
            return;
        }

        throw err;
    });
};

Vue.use(router);