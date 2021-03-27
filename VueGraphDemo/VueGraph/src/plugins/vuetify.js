import "@mdi/font/css/materialdesignicons.css"
import Vue from "vue";
import "vuetify/dist/vuetify.min.css";
import Vuetify from "vuetify";

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: true,
        themes: {
            light: {
                primary: "#212121",
                secondary: "#303030",
                accent: "#000080",
                error: "#FF4040",
                warning: "#999900",
                info: "#404040",
                success: "#005D00",
                text: "FFFFFF"
            },
            dark: {
                primary: "#212121",
                secondary: "#303030",
                accent: "#000080",
                error: "#FF4040",
                warning: "#999900",
                info: "#404040",
                success: "#005D00",
                text: "FFFFFF"
            }
        }
    },
    icons: {
        iconfont: "mdi"
    }
});