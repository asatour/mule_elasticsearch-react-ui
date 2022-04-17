import React, { useState } from "react";
import env from "react-dotenv";
import AppSearchAPIConnector from "@elastic/search-ui-app-search-connector";
import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting,
  WithSearch
} from "@elastic/react-search-ui";
import {
  Layout,
  SingleSelectFacet,
  SingleLinksFacet
} from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";


export const ExternalApiComponent = () => {
  const { apiOrigin = env.REACT_APP_API_ORIGIN, audience } = getConfig();

  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const {
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
  } = useAuth0();

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${apiOrigin}/api/external`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const SORT_OPTIONS = [
    {
      name: "Relevance",
      value: []
    },
    {
      name: "ID",
      value: [
        {
          field: "id",
          direction: "asc"
        }
      ]
    },
    {
      name: "Date / Heure",
      value: [
        {
          field: "date_heure",
          direction: "asc"
        }
      ]
    },
    {
      name: "Concentration moyenne en PM10 en µg/m3",
      value: [
        {
          field: "pm10",
          direction: "asc"
        }
      ]
    },
    {
      name: "Concentration moyenne en PM2,5 en µg/m3",
      value: [
        {
          field: "pm2_5",
          direction: "asc"
        }
      ]
    },
    {
      name: "TEMP Température ambiante en °C",
      value: [
        {
          field: "temp",
          direction: "asc"
        }
      ]
    },
    {
      name: "Humidité relative en %",
      value: [
        {
          field: "humi",
          direction: "asc"
        }
      ]
    }
  ];

  const connector = new AppSearchAPIConnector({
    searchKey: "search-dfxpgocopv5ttmzguabatwga",
    engineName: "ratp-engine-air-quality-station-nation-rer-a",
    endpointBase: env.ENDPOINT_BASE
  });

  const config = {
    alwaysSearchOnInitialLoad: true,
    searchQuery: {
      result_fields: {
        id: { raw: {} },
        date_heure: {
          snippet: {
            size: 100,
            fallback: true
          }
        },
        pm10: { raw: {} },
        pm2_5: { raw: {} },
        temp: { raw: {} },
        humi: { raw: {} }
      },
      disjunctiveFacets: ["pm10", "pm2_5", "temp", "humi"],
      facets: {
        pm10: {
          type: "range",
          ranges: [
            { from: -1, name: "Any" },
            { from: 0, to: 100, name: "Small" },
            { from: 101, to: 200, name: "Medium" },
            { from: 201, name: "Large" }
          ]
        },
        pm2_5: {
          type: "range",
          ranges: [
            { from: -1, name: "Any" },
            { from: 0, to: 100, name: "Small" },
            { from: 101, to: 200, name: "Medium" },
            { from: 201, name: "Large" }
          ]
        },
        temp: { type: "value", size: 30 },
        humi: {
          type: "range",
          ranges: [
            { from: -1, name: "Any" },
            { from: 0, to: 20, name: "Small" },
            { from: 21, to: 30, name: "Medium" },
            { from: 31, to: 50, name: "Large" },
            { from: 51, name: "Very Large" }
          ]
        }
      }
    },
    autocompleteQuery: {
      results: {
        resultsPerPage: 5,

        result_fields: {
          id: { raw: {} },
          date_heure: {
            snippet: {
              size: 100,
              fallback: true
            }
          }
        }
      },
      suggestions: {
        types: {
          documents: {
            fields: ["id", "date_heure"]
          }
        },
        size: 4
      }
    },
    apiConnector: connector
  };
  return (
      <SearchProvider config={config}>
        <WithSearch mapContextToProps={({wasSearched}) => ({wasSearched})}>
          {({wasSearched}) => {
            return (
                <div className="App">
                  <ErrorBoundary>
                    <Layout
                        header={
                          <SearchBox
                              autocompleteMinimumCharacters={3}
                              //searchAsYouType={true}
                              autocompleteResults={{
                                linkTarget: "_blank",
                                sectionTitle: "Results",
                                titleField: "date_heure",
                                urlField: "nps_link",
                                shouldTrackClickThrough: true,
                                clickThroughTags: ["test"]
                              }}
                              autocompleteSuggestions={true}
                              debounceLength={0}
                          />
                        }
                        sideContent={
                          <div>
                            {wasSearched && (
                                <Sorting label={"Sort by"} sortOptions={SORT_OPTIONS}/>
                            )}
                            <Facet
                                field="pm10"
                                label="Concentration moyenne en PM10 en µg/m3"
                                view={SingleLinksFacet}
                            />
                            <Facet
                                field="pm2_5"
                                label="Concentration moyenne en PM2,5 en µg/m3"
                                view={SingleSelectFacet}
                            />
                            <Facet
                                field="temp"
                                label="TEMP Température ambiante en °C"
                                filterType="any"
                                isFilterable={true}
                            />
                            <Facet
                                field="humi"
                                label="Humidité relative en %"
                                view={SingleSelectFacet}
                            />
                          </div>
                        }
                        bodyContent={
                          <Results
                              titleField="date_heure"
                              urlField="nps_link"
                              thumbnailField="image_url"
                              shouldTrackClickThrough={true}
                          />
                        }
                        bodyHeader={
                          <React.Fragment>
                            {wasSearched && <PagingInfo/>}
                            {wasSearched && <ResultsPerPage/>}
                          </React.Fragment>
                        }
                        bodyFooter={<Paging/>}
                    />
                  </ErrorBoundary>
                </div>
            );
          }}
        </WithSearch>
      </SearchProvider>
  );
};

export default withAuthenticationRequired(ExternalApiComponent, {
  onRedirecting: () => <Loading />,
});
