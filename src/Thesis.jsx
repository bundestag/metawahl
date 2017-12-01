import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { Segment, Menu, Dropdown } from 'semantic-ui-react'
import WikidataTagger from './WikidataTagger';

const categoryNames = [
  "Arbeit und Beschäftigung",
  "Ausländerpolitik, Zuwanderung",
  "Außenpolitik und internationale Beziehungen",
  "Außenwirtschaft",
  "Bildung und Erziehung",
  "Bundestag",
  "Energie",
  "Entwicklungspolitik",
  "Europapolitik und Europäische Union",
  "Gesellschaftspolitik, soziale Gruppen",
  "Gesundheit",
  "Innere Sicherheit",
  "Kultur",
  "Landwirtschaft und Ernährung",
  "Medien, Kommunikation und Informationstechnik",
  "Neue Bundesländer",
  "Öffentliche Finanzen, Steuern und Abgaben",
  "Politisches Leben, Parteien",
  "Raumordnung, Bau- und Wohnungswesen",
  "Recht",
  "Soziale Sicherung",
  "Sport, Freizeit und Tourismus",
  "Staat und Verwaltung",
  "Umwelt",
  "Verkehr",
  "Verteidigung",
  "Wirtschaft",
  "Wissenschaft, Forschung und Technologie"
];

export const categoryOptions = categoryNames.map(name => ({key: name, value: name, text: name}));

const Position = (p) => {
  const hasText = p.text && p.text.length > 0;
  return <span
    onClick={hasText ? () => p.toggleOpen(p) : null}
    className={hasText ? "positionWithText" : null}
  >
    {p.party}
    ,&nbsp;
  </span>
}

const Positions = ({positions, value, toggleOpen}) => positions.length === 0 ? null
  : <div className="position_values">
      {value}: {positions.map(p => <Position toggleOpen={toggleOpen} key={p.party} {...p} />)}
    </div>;

export default class Thesis extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      openText: null,
      tags: []
    }
  }

  handleTag({ title, concepturi, label, description}) {
    const currentTags = this.state.tags;
    currentTags.push(<span><a href={concepturi}>{label}</a>{description}</span>);
    this.setState({tags: currentTags});
  }

  toggleOpen(party) {
    this.setState({openText: party});
  }

  render() {
    let proPositions = this.props.positions.filter(p => p.value === 1);
    let neutralPositions = this.props.positions.filter(p => p.value === 0);
    let contraPositions = this.props.positions.filter(p => p.value === -1);

    const positionText = this.state.openText == null || this.props.loaded === false
      ? null : <p>Position der Partei {this.state.openText.party}: {this.state.openText.text}</p>;

    const womID = parseInt(this.props.id.split("-")[1], 10);

    return <div style={{marginBottom: "1em"}}>
      <Segment id={this.props.id} attached='top'>
        {this.props.title && this.props.title.length > 0 &&
          <span>
          <Link to={`/wahlen/${womID}/#${this.props.id}`}><h2>{this.props.title}</h2></Link>
          <h4>{this.props.text}</h4>
          </span>
        }

        {(this.props.title == null || this.props.title.length === 0) &&
          <Link to={`/wahlen/${womID}/#${this.props.id}`}><h2>
            <span style={{marginLeft: 5}}>{this.props.text}</span>
          </h2></Link>
        }
        <div className="positionsOverview">
          <Positions value="Pro" positions={proPositions} toggleOpen={this.toggleOpen}/>
          <Positions value="Neutral" positions={neutralPositions} toggleOpen={this.toggleOpen}/>
          <Positions value="Contra" positions={contraPositions} toggleOpen={this.toggleOpen}/>
        </div>
        {positionText}
      </Segment>
      { this.state.tags.length > 0 &&
        <Segment>{this.state.tags}</Segment>
      }
      <Menu attached='bottom'>
        <Dropdown item placeholder='Kategorien wählen' style={{border: "none"}}
          search multiple selection options={categoryOptions} />
        <Menu.Menu position='right'>
          <WikidataTagger onSelection={this.handleTag} />
        </Menu.Menu>
      </Menu>
    </div>
  }
}
