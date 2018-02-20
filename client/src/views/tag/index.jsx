// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import '../../index.css';
import {
  Dropdown,
  Header,
  Icon,
  Loader,
  Menu,
  Message,
  Pagination
} from 'semantic-ui-react';

import { API_ROOT, IS_ADMIN, THESES_PER_PAGE } from '../../config/';
import Errorhandler from '../../utils/errorHandler';
import Thesis from '../../components/thesis/';
import { WikidataLabel, WikipediaLabel } from '../../components/label/DataLabel';
import SEO from '../../components/seo/';
import TagMenu from '../../components/wikidataTagger/TagMenu';

import type {
  ErrorType, TagType, ThesisType, OccasionType, RouteProps
} from '../../types/';

type State = {
  occasions: { [occasionNum: number]: OccasionType},
  loading: boolean,
  page: number,
  slug: string,
  tagFilter: ?string,
  invertFilter: boolean,
  tag: TagType,
  theses: Array<ThesisType>
};

export default class TagView extends Component<RouteProps, State> {
  handleError: ErrorType => any;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.state = {
      loading: true,
      page: parseInt(this.props.match.params.page, 10) || 1,
      slug: this.props.match.params.tag,
      tag: this.getCachedTag(),
      occasions: {},
      theses: [],
      tagFilter: null,
      invertFilter: false
    }

    this.handleError = Errorhandler.bind(this);
  }

  componentDidMount() {
    this.loadTag();
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    const slug = nextProps.match.params.tag;
    const page = parseInt(nextProps.match.params.page, 10) || 1;

    if (slug !== this.state.slug) {
      this.setState({
        loading: true,
        page: page || 1,
        slug,
        tag: this.getCachedTag(slug),
        theses: [],
        occasions: {}
      }, this.loadTag);
    } else if (page !== this.state.page) {
      this.setState({
        page
      });
    }
  }

  getCachedTag(slugP?: string) {
    const slug = slugP || this.props.match.params.tag;
    return this.props.tags.filter(t => t.slug === slug).shift();
  }

  handlePaginationChange(
    e: SyntheticInputEvent<HTMLInputElement>,
    { activePage }: { activePage: number }
  ) {
    this.props.history.push("/themen/" + this.state.slug + "/" + activePage);
  }

  loadTag(): void {
    fetch(API_ROOT + "/tags/" + this.state.slug)
      .then(response => response.json())
      .then(response => {
        this.handleError(response);
        this.setState({
          tag: response.data,
          theses: response.theses,
          occasions: response.occasions,
          loading: false
        });
      })
      .catch((error: Error) => {
        this.handleError(error);
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          console.log("Error decoding tag data: " + error.message);
          this.setState({
            loading: false,
            theses: [],
            occasions: {}
          });
        }
      }
    );
  }

  render() {
    const theses = this.state.loading === false && this.state.theses
      .filter(thesis => {
        if (this.state.tagFilter != null && this.state.tagFilter.length > 0) {
          return this.state.invertFilter === false
            ? thesis.tags.filter(
              t => t.title === this.state.tagFilter).length > 0
            : thesis.tags.filter(
              t => t.title === this.state.tagFilter).length === 0
        } else {
          return true;
        }
      })
      .sort((t1, t2) => t2.occasion_id - t1.occasion_id);

    const startPos = (this.state.page - 1) * THESES_PER_PAGE;
    const endPos = Math.min(
      startPos + THESES_PER_PAGE,
      theses.length
    );

    const thesesElems = this.state.loading  ? null : theses
      .slice(startPos, endPos)
      .map((thesis, i) =>
        <Thesis
          key={"Thesis-" + thesis.id}
          occasion={this.state.occasions[thesis.occasion_id]}
          linkOccasion={true}
          {...thesis}
        />
      );

    const relatedTags = (this.state.tag && this.state.tag.related_tags) || {};
    const filterOptions = Object.keys(relatedTags)
      .sort((a, b) => relatedTags[b].count - relatedTags[a].count)
      .filter(i => relatedTags[i].count < this.state.theses.length)
      .map(i => ({
        key: i,
        text: relatedTags[i].tag.title + ' (' + relatedTags[i].count + ')',
        value: i
      }));

    const pageTitle = this.state.tag != null && this.state.tag.title != null ?
      this.state.tag.title : null;

    return <div style={{minHeight: 350}} >
      <SEO
        title={'Metawahl: Wahlthema ' + pageTitle}
        canonical={'/themen/' + this.slug + '/'} />

      <Loader active={this.state.tag == null} />

      {this.state.tag != null && this.state.tag.wikidata_id != null &&
        <WikidataLabel {...this.state.tag} style={{marginRight: "-10.5px"}} />
      }

      {this.state.tag != null && this.state.tag.wikipedia_title != null &&
        <WikipediaLabel {...this.state.tag} style={{marginRight: "-10.5px"}} />
      }

      <Header as='h1' disabled={this.state.loading === false && this.state.tag == null}>
        <Icon name='hashtag' />
        { this.state.tag != null &&
          <Header.Content>
              {this.state.tag.title}
              {/* <Loader active={this.state.loading} inline={true} size="small"
                style={{marginLeft: "1em", marginBottom: "0.2em"}} /> */}
              { (this.state.tag.description != null || this.state.tag.aliases != null) &&
                <Header.Subheader>
                  { this.state.tag.description }
                  { this.state.tag.description != null && this.state.tag.aliases != null && <br /> }
                  { this.state.tag.aliases != null &&
                    <span>Auch: {this.state.tag.aliases.map(a => <span key={`alias-${a}`}>{a}, </span>)}</span>
                  }
                </Header.Subheader>
              }
          </Header.Content>
        }
      </Header>

      { filterOptions.length > 0 &&
        <Menu stackable>
          <Menu.Item header content='Filter' />
          <Dropdown className='link item' placeholder='Zeige nur...' selection
            scrolling value={this.state.tagFilter} style={{border: "none"}}
            selectOnBlur={false} closeOnBlur={true}
            options={filterOptions}
            onChange={(e, data) => this.setState({tagFilter: data.value})} />
            { this.state.tagFilter != null &&
              <Menu.Item
                active={this.state.invertFilter}
                onClick={() => this.setState({invertFilter: !this.state.invertFilter})}>
                <Icon name='undo' /> Filter umkehren
              </Menu.Item>
            }
            { this.state.tagFilter != null &&
              <Menu.Item onClick={() => this.setState(
                  {tagFilter: null, invertFilter: false })}>
                <Icon name='close' /> Zurücksetzen
              </Menu.Item>
            }
        </Menu>
      }

      { IS_ADMIN &&
        <TagMenu
          tag={this.state.tag}
          theses={this.state.theses}
          setLoading={(isLoading) => this.setState({loading: isLoading})}
          refresh={() => this.loadTag()}
        />
      }

      { this.state.error != null &&
        <Message negative content={this.state.error} />
      }

      <Loader active={this.state.loading} />

      { theses.length > 0 &&
        <div>
          { theses.length > THESES_PER_PAGE &&
            <h2 style={{float: "right"}}>Seite {this.state.page}</h2>
          }

          { this.state.tagFilter == null &&
            <h2>{theses.length} Thesen zu #{this.state.tag.title}</h2>
          }

          { this.state.tagFilter != null &&
            <h2>{theses.length} These{theses.length !== 1 && 'n'} {' '}
              zu #{this.state.tag.title} und {' '}
              {this.state.invertFilter && <em>nicht </em>}
              #{this.state.tagFilter}
            </h2>
          }

          {thesesElems}

          <Pagination
            activePage={this.state.page}
            onPageChange={this.handlePaginationChange}
            prevItem={null}
            nextItem={null}
            totalPages={Math.ceil(theses.length / THESES_PER_PAGE)}
          />
        </div>
      }
    </div>;
  }
};