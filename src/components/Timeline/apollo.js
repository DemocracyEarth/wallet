import { useMemo } from 'react';
import { InMemoryCache, HttpLink } from 'apollo-boost';
import { ApolloClient } from '@apollo/client';
import { config } from 'config'

let apolloClient;

const httpLink = new HttpLink({
  uri: config.graph.moloch,
  credentials: "same-origin",
});

const createApolloClient = () => {
  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
}

const _initializeApollo = () => {
  const _apolloClient = apolloClient ?? createApolloClient();
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

const _useApollo = () => {
  let initialState;
  const store = useMemo(() => _initializeApollo(initialState), [initialState]);
  return store;
}

export const useApollo = _useApollo;
export const initializeApollo = _initializeApollo;