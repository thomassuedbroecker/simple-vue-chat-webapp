import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";
import { createStore } from 'vuex';
import Keycloak from 'keycloak-js';

// **********
// Create a new store instance.
// **********
const store = createStore({
    state: {
        endpoints: {
          api: " ", // is set automatically in main.js
          login: " ", // is set automatically in main.js
          cns: " " // is set automatically in main.js
        },
        user: {
          isAuthenticated: false,
          name: "",
          idToken: "",
          accessToken: ""
        }
      },
      mutations: {
        setAPI(state, payload) {
          state.endpoints.api = payload.api;      
        },
        setAPIAndLogin(state, payload) {
          state.endpoints.api = payload.api;
          state.endpoints.login = payload.login;
        },
        logout(state) {
          state.user.isAuthenticated = false;
          state.user.name = "";
          state.user.idToken = "";
          state.user.accessToken = "";
        },
        login(state, payload) {
          state.user.isAuthenticated = true;
          state.user.idToken = payload.idToken;
          state.user.accessToken = payload.accessToken;
        },
        setName(state, payload) {
          state.user.name = payload.name;
        }
      },
      actions: {
      }
})

setURLs( window.VUE_APP_KEYCLOAK, window.VUE_APP_BACKEND);

// ***********
// Keycloak and app creation
// ***********

let initOptions = {
  url: store.state.endpoints.login, 
  realm: window.KEYCLOAK_REALM, 
  clientId: window.KEYCLOAK_CLIENTID,
  onLoad: 'login-required'
}

let keycloak = new Keycloak(initOptions);

keycloak.init({ onLoad: initOptions.onLoad }).then((auth) => {
  if (!auth) {
    window.location.reload();
  }

  new Vue({
    store,
    router,
    render: h => h(App)
  }).$mount('#app')

  let payload = {
    idToken: keycloak.idToken,
    accessToken: keycloak.token
  }

  if ((keycloak.token && keycloak.idToken) != '' && (keycloak.idToken != '')) {
    store.commit("login", payload);
    console.log("--> log: User has logged in: " + keycloak.subject);
    console.log("--> log: TokenParsed: "+ JSON.stringify(keycloak.tokenParsed));
    console.log("--> log: User name: " + keycloak.tokenParsed.preferred_username);
    console.log("--> log: accessToken: " + payload.accessToken);
    console.log("--> log: idToken: " + payload.idToken);
    payload = {
      name: keycloak.tokenParsed.preferred_username
    };
    store.commit("setName", payload);
  }
  else {
    payloadRefreshedTokens = {
      idToken: "",
      accessToken: ""
    }
    store.commit("login", payloadRefreshedTokens);
    store.commit("logout");
  }

 setInterval(() => {
    console.log("--> log: interval ");
    console.log("--> log: isAuthenticated ", store.state.user.isAuthenticated);
    keycloak.updateToken().then((refreshed) => {
      console.log("--> log: isAuthenticated ", store.state.user.isAuthenticated);
      if (store.state.user.isAuthenticated != false ) {
        if (refreshed) {
          console.log("--> log: refreshed ");         
          let payloadRefreshedTokens = {
            idToken: keycloak.idToken,
            accessToken: keycloak.token
          }

          if ((keycloak.token && keycloak.idToken != '') && (keycloak.idToken != '')) {
            store.commit("login", payloadRefreshedTokens);
          }
          else {
            console.log("--> log: token refresh problems");  
            payloadRefreshedTokens = {
              idToken: "",
              accessToken: ""
            }
            store.commit("login", payloadRefreshedTokens);
            store.commit("logout");
          }
        }
      } else {
        console.log("--> log: logout isAuthenticated  =", store.state.user.isAuthenticated);
        
        var logoutOptions = { redirectUri : urls.cns };
        console.log("--> log: logoutOptions  ", logoutOptions  );
            
        keycloak.logout(logoutOptions).then((success) => {
              console.log("--> log: logout success ", success );
        }).catch((error) => {
              console.log("--> log: logout error ", error );
        });
        store.commit("logout");
      }
    }).catch(() => {
      console.log("--> log: catch interval");
    });
  }, 10000)
}).catch(() => {
  console.log("-->log: Failed to authenticate");
});

// ***********
// Functions
// ***********

function setURLs ( keycloakUrl, backendapiUrl){
    console.log("--> Location: ", window.location.hostname)
    let currentHostname = window.location.hostname;
    let urls;
  
    if (currentHostname.indexOf('localhost') > -1) {
          console.log("--> log: option 1");
          urls = {
            api: 'http://localhost:8081',  
            login: 'http://localhost:8080', 
            cns: 'http://localhost:8082' // Verify the shown ports
          }
          store.commit("setAPIAndLogin", urls);
        }
        else {
          console.log("--> log: option 2");
          let cnsRedirectUrl = 'https://' + currentHostname; // logout
          urls = {
              api: backendapiUrl,
              login: keycloakUrl,
              cns: cnsRedirectUrl 
          }
          console.log("--> log: urls ", urls);
          store.commit("setAPIAndLogin", urls);
        }
}
