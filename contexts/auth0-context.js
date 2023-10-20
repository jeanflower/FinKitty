'use client'

/* istanbul ignore file */
import React, { Component, createContext, useContext } from 'react';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import { log, printDebug, showObj } from '../utils/utils';

// create the context
const Auth0Context = createContext();
export const useAuth0 = () => {
  // log(`in useAuth0`);
  return useContext(Auth0Context);
};

// create a provider
export class Auth0Provider extends Component {
  state = {
    auth0Client: null,
    isLoading: true,
    isAuthenticated: false,
    user: null,
  };
  config = {
    domain: process.env.NEXT_PUBLIC_REACT_APP_AUTH0_DOMAIN_NOT_SECRET,
    clientId: process.env.NEXT_PUBLIC_REACT_APP_AUTH0_CLIENT_ID_NOT_SECRET,
    authorizationParams: {
      redirect_uri: process.env.NEXT_PUBLIC_REACT_APP_CLIENT_URL_NOT_SECRET,
    },
  };

  componentDidMount() {
    this.initializeAuth0();
  }

  // initialize the auth0 library
  initializeAuth0 = async () => {
    // console.log(`auth domain = ${process.env.NEXT_PUBLIC_REACT_APP_AUTH0_DOMAIN_NOT_SECRET}`);
    // console.log(`auth clientID = ${process.env.NEXT_PUBLIC_REACT_APP_AUTH0_CLIENT_ID_NOT_SECRET}`);

    /* istanbul ignore if  */
    if (printDebug()) {
      log(`auth config is ${showObj(this.config)}`);
    }
    const auth0Client = await createAuth0Client(this.config);
    // console.log(`Have auth0Client = ${auth0Client}, gp to set state`);
    this.setState({ auth0Client },
      async () => {
      // check to see if they have been redirected after login
      if (window.location.search.includes('code=')) {
        // console.log('redirected with code');
        return this.handleRedirectCallback();
      }
      const isAuthenticated = await auth0Client.isAuthenticated();
      const user = isAuthenticated ? await auth0Client.getUser() : null;
      this.setState({ isLoading: false, isAuthenticated, user });
    });
  };

  handleRedirectCallback = async () => {
    // console.log('in handleRedirectCallback');
    this.setState({ isLoading: true });

    // console.log(`go to auth0Client's handleRedirectCallback, this.state.auth0Client = ${this.state.auth0Client}`);
    await this.state.auth0Client.handleRedirectCallback();
    const user = await this.state.auth0Client.getUser();

    this.setState({ user, isAuthenticated: true, isLoading: false });
/*JAF
    window.history.replaceState({}, document.title, window.location.pathname);
*/
  };

  render() {
    const { auth0Client, isLoading, isAuthenticated, user } = this.state;
    const { children } = this.props;

    const configObject = {
      isLoading,
      isAuthenticated,
      user,
      loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
      loginForTesting: (...p) => {
        /* istanbul ignore if  */
        if (printDebug()) {
          log(`p is ${p}`);
        }
        this.setState({
          user: { sub: 'TestUserID' },
          isAuthenticated: true,
          isLoading: false,
        });
      },
      getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
      getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
      logout: (...p) => auth0Client.logout(...p),
    };

    return (
      <Auth0Context.Provider value={configObject}>
        {children}
      </Auth0Context.Provider>
    );
  }
}
