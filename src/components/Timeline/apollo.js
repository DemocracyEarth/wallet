import { useMemo } from 'react';
import { InMemoryCache } from 'apollo-boost';
import { ApolloClient } from '@apollo/client';

import { view as routerView } from 'lib/const';

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

const _translate = (res, terms) => {
  let final = res;
  for (const translation of terms) {
    if (final.match(translation.source).length > 0) {
      final = final.replace(`{{${translation.source}}}`, translation.target);
    }
  }
  return final;
}

const _calendar = (props, param) => {
  const now = Math.floor(new Date().getTime() / 1000);
  let { dateBegin, dateEnd } = now.toString();
  if (props.view === routerView.DATE) {
    dateBegin = Math.floor(new Date(param).getTime() / 1000).toString();
    dateEnd = Math.floor((new Date(param).getTime() / 1000) + 86400).toString();
  }

  return {
    now,
    dateBegin,
    dateEnd
  }
}

export const useApollo = _useApollo;
export const initializeApollo = _initializeApollo;
export const translate = _translate;
export const calendar = _calendar;