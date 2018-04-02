import styled, { keyframes, css } from 'react-emotion';
import Router from 'next/router';

import * as React from 'react';
import * as Constants from '~/common/constants';
import * as Utilities from '~/common/utilities';

import { LATEST_VERSION } from '~/common/versions';

const STYLES_INPUT_FIELD = css`
  border: 1px solid ${Constants.colors.border};
  border-radius: 3;
  font-size: 14px;
  padding: 2px 10px;
`;

// TODO(jim): Not particularly happy with how this component chunks in while loading.
class AlgoliaSearch extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (this.props.activeVersion && this.props.activeVersion !== nextProps.activeVersion) {
      this.docsearch.algoliaOptions = {
        ...this.docsearch.algoliaOptions,
        facetFilters: [
          `tags:${nextProps.activeVersion === 'latest' ? LATEST_VERSION : nextProps.activeVersion}`,
        ],
      };
    }
  }

  processUrl(url) {
    // Update URLs for new doc URLs
    var routes = url.split('/');
    routes[routes.length - 1] = routes[routes.length - 1].replace('.html', '');
    return routes.join('/');
  }

  componentDidMount() {
    const docsearch = require('docsearch.js');
    const Hotshot = require('hotshot');

    this.docsearch = docsearch({
      appId: 'S6DBW4862L',
      apiKey: 'f469a45764b6fd7b279f2bff604127ac',
      indexName: 'exponent-docs-v3',
      inputSelector: '#algolia-search-box',
      algoliaOptions: {
        facetFilters: [
          `tags:${
            this.props.activeVersion === 'latest' ? LATEST_VERSION : this.props.activeVersion
          }`,
        ],
        hitsPerPage: 10,
      },
      enhancedSearchInput: true,
      handleSelected: (input, event, suggestion) => {
        input.setVal('');
        const url = suggestion.url;
        let route = url.match(/https?:\/\/(.*)(\/versions\/.*)/)[2];

        let asPath = null;
        if (this.props.activeVersion === 'latest') {
          asPath = this.processUrl(Utilities.replaceVersionInUrl(route, 'latest'));
        }
        route = this.processUrl(route);
        if (asPath) {
          Router.push(route, asPath);
        } else {
          Router.push(route);
        }

        document.getElementById('docsearch').blur();
        const searchbox = document.querySelector('input#docsearch');
        const reset = document.querySelector('.searchbox [type="reset"]');
        reset.className = 'searchbox__reset';
        if (searchbox.value.length === 0) {
          reset.className += ' hide';
        }
        this.props.closeSidebar && this.props.closeSidebar();
      },
    });

    // add keyboard shortcut
    this.hotshot = new Hotshot({
      combos: [
        {
          keyCodes: [16, 191], // shift + / (otherwise known as '?')
          callback: () => setTimeout(() => document.getElementById('docsearch').focus(), 16),
        },
      ],
    });
  }

  render() {
    return (
      <div className={this.props.className} style={this.props.style}>
        <input
          className={`${STYLES_INPUT_FIELD}`}
          id="algolia-search-box"
          type="text"
          placeholder="Search..."
          autoComplete="off"
          spellCheck="false"
          dir="auto"
        />
      </div>
    );
  }
}

export default AlgoliaSearch;