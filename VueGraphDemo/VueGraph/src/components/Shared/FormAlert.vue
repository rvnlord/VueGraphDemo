<template>
    <div>
        <v-alert :value="true" type="error" dismissible>
            <!-- class="transition-swing" transition="scale-transition" -->
            <h3>{{message}}</h3>
        </v-alert>
    </div>
</template>

<script>
    export default {
        props: ["message"]
    };
</script>