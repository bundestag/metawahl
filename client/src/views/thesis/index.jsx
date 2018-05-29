// @flow

import React from 'react';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import autoBind from 'react-autobind';
import {
  Button, Breadcrumb, Container, Header, Loader, Message, Progress, Segment, Icon
} from 'semantic-ui-react';
import Moment from 'moment';

import { API_ROOT, SITE_ROOT, TERRITORY_NAMES } from '../../config/';
import SEO from '../../components/seo/';
import ThesisComponent from '../../components/thesis/';
import Occasion from '../occasion/';
import Errorhandler from '../../utils/errorHandler';
import { ErrorType, RouteProps, ThesisType, OccasionType } from '../../types/';
import { extractThesisID } from '../../utils/thesis';

type State = {
  isLoading: boolean,
  occasion: OccasionType,
  thesis: ThesisType
}

class Thesis extends React.Component<RouteProps, State> {
  constructor(props) {
    super(props)
    autoBind(this)
    this.territory = props.match.params.territory
    this.occasionNum = parseInt(props.match.params.occasionNum, 10)
    this.thesisNum = parseInt(props.match.params.thesisNum, 10)

    this.state = {
      isLoading: true,
      occasion: this.getCachedOccasion(),
      thesis: null
    }
    this.handleError = Errorhandler.bind(this);
  }

  componentDidMount() {
    if (this.state.occasion == null) {
      this.loadOccasion(() => this.loadThesis())
    } else {
      this.loadThesis()
    }
  }

  getCachedOccasion() {
    return this.props.occasions[this.territory] == null ? null :
      this.props.occasions[this.territory]
      .filter(occ => occ.id === this.occasionNum)
      .shift();
  }

  loadOccasion(cb?: OccasionType => mixed) {
    const endpoint = API_ROOT + "/occasions/" + this.occasionNum;
    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        this.handleError(response);
        this.setState({
          occasion: response.data
        })
        if (cb != null) cb(response.data);
      })
      .catch((error: Error) => {
        this.handleError(error);
        console.log("Error fetching occasion data: " + error.message)
        this.setState({
          occasion: this.getCachedOccasion()
        })
      })
  }

  loadThesis(cb?: ThesisType => mixed) {
    const endpoint = API_ROOT + "/thesis/WOM-"
      + this.occasionNum.toString().padStart(3, '0') + '-'
      + this.thesisNum.toString().padStart(2, '0')

    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        this.handleError(response);
        this.setState({
          isLoading: false,
          thesis: response.data
        })
        if (cb != null) cb(response.data);
      })
      .catch((error: Error) => {
        this.handleError(error);
        console.log("Error fetching occasion data: " + error.message)
        this.setState({
          isLoading: false
        })
      })
  }

  render() {
    return <Container>
      <SEO title={'Metawahl: '
        + (this.state.occasion ? this.state.occasion.title + ' Quiz' : "Quiz")} />

      <Breadcrumb>
        <Breadcrumb.Section href="/wahlen/">Wahlen</Breadcrumb.Section>
        <Breadcrumb.Divider icon='right angle' />
        <Breadcrumb.Section href={`/wahlen/${this.territory}/`}>
          {TERRITORY_NAMES[this.territory]}
        </Breadcrumb.Section>
        <Breadcrumb.Divider icon='right angle' />
        { this.state.occasion == null
          ? <Breadcrumb.Section>Loading...</Breadcrumb.Section>
          : <span>
            <Breadcrumb.Section
              href={`/wahlen/${this.territory}/${this.occasionNum}/`}>
              {Moment(this.state.occasion.date).year()}
            </Breadcrumb.Section>
            <Breadcrumb.Divider icon='right angle' />
            <Breadcrumb.Section active href={`/wahlen/${this.territory}/${this.occasionNum}/${this.thesisNum}`}>
              These #{this.thesisNum}
            </Breadcrumb.Section>
          </span>
        }
      </Breadcrumb>

      { this.state.error != null &&
        <Message negative content={this.state.error} />
      }

      { this.state.isLoading === false && this.state.error == null &&
        <div style={{marginTop: "2rem"}}>
          <ThesisComponent
            occasion={this.state.occasion}
            linkOccasion={true}
            showHints={true}
            {...this.state.thesis}
          />
        </div>
      }

    </Container>
  }
}

export default Thesis;
