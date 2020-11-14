import { useMemo } from 'react';
import { InMemoryCache } from 'apollo-boost';
import { ApolloClient } from '@apollo/client';

let apolloClient;

const createApolloClient = (httpLink) => {
  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
}

const _initializeApollo = (httpLink) => {
  const _apolloClient = apolloClient ?? createApolloClient(httpLink);
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