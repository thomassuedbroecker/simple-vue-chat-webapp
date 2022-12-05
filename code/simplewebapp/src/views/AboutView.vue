<template>
    <div class="about" v-if="isAuthenticated == true">
      <div>
       <b><h1 style="color:#008000">Happy Banking!</h1></b>
      </div>
      <div style="margin-top:30px" >
       <strong style="color:#008000">We provide an awesome banking experience,<br>
         with a state on the art assistant available 24/7 for you.</strong>
      </div>
      <div style="margin-top:30px" >
        <button @click="count++">
          Count is: {{ count }}
        </button>
      </div>
      <div style="margin-top:30px" v-if="(isAuthenticated == true)" >
        <button @:click="onConnectToServer">Connect to server
        </button>
      </div>
      <div style="margin-top:30px" v-if="isAuthenticated == false" >
        Please logon
      </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
  // Properties returned from data() become reactive state
  // and will be exposed on `this`.
  name: "about",

  data() {
    return {
      count: 0,
      },
      {
        backendApiUrl: this.$store.state.endpoints.api + "/api/v1/getbackend",
        loading: false,
        error: ""
      }
  },

  computed: {
    isAuthenticated() {
      console.log("isAuthenticated: ", this.$store.state.user.isAuthenticated)
      return this.$store.state.user.isAuthenticated;
    }
  },

  // Methods are functions that mutate state and trigger updates.
  // They can be bound as event listeners in templates.
  methods: {
    increment() {
      this.count++
    },

    onConnectToServer() {
      this.loading = true;
      console.log("Data: ", this.$store.state.user.accessToken);
      const axiosService = axios.create({
        timeout: 30000, // because of Code Engine response can be up to 18,29 sec in Postman
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.$store.state.user.accessToken
        }
      });
      let that = this;
      console.log("--> log: api/v1/getbackend URL : " + this.backendApiUrl);
      axiosService
        .get(this.backendApiUrl)
        .then(function(response) {
          console.log("--> log: backend data : " + response.data);
          that.loading = false;
          that.error = "";
        })
        .catch(function(error) {
          console.log("--> log: " + error);
          that.loading = false;
          that.error = error;
        });
    },
  },
}
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}

body {
 background-image: url("../assets/money-2696229_1920.jpg");
 background-color: #cccccc;
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

</style>
