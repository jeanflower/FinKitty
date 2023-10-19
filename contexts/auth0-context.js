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
      redirect_uri: '',
      /*JAF
        window.location.origin + process.env.NEXT_PUBLIC_REACT_APP_ORIGIN_APPENDAGE,
      */
    },
  };

  componentDidMount() {
    this.initializeAuth0();
  }

  // initialize the auth0 library
  initializeAuth0 = async () => {
    /* istanbul ignore if  */
    if (printDebug()) {
      log(`auth config is ${showObj(this.config)}`);
    }
    const auth0Client = await createAuth0Client(this.config);
    this.setState({ auth0Client });

    // check to see if they have been redirected after login
/*JAF
    if (window.location.search.includes('code=')) {
      return this.handleRedirectCallback();
    }
*/
    const isAuthenticated = await auth0Client.isAuthenticated();
    const user = isAuthenticated ? await auth0Client.getUser() : null;
    this.setState({ isLoading: false, isAuthenticated, user });
  };

  handleRedirectCallback = async () => {
    this.setState({ isLoading: true });

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
