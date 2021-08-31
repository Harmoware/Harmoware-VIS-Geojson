import React from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import {
  Container, connectToHarmowareVis, HarmoVisLayers, MovesLayer, MovesInput
} from 'harmoware-vis';

const MAPBOX_TOKEN = ''; //Acquire Mapbox accesstoken

class GeoJsonInput extends React.Component {
  onSelect(e) {
    const { actions, setState } = this.props;
    const reader = new FileReader();
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    actions.setLoading(true);
    setState({ geoJsonData: null, geoJsonFileName: null });
    reader.readAsText(file);
    const file_name = file.name;
    reader.onload = () => {
      let readdata = null;
      try {
        readdata = JSON.parse(reader.result.toString());
      } catch (exception) {
        actions.setLoading(false);
        window.alert(exception);
        return;
      }
      setState({
        geoJsonData: readdata,
        geoJsonFileName: file_name
      });
    };
  }
  onClick(e) {
    const { setState } = this.props;
    setState({ geoJsonData: null, geoJsonFileName: null });
  }
  render() {
    const { id } = this.props;

    return (
      <input type="file" accept=".geojson" id={id}
      onClick={this.onClick.bind(this)}
      onChange={this.onSelect.bind(this)}
      />
    );
  }
}

class App extends Container {
  constructor(props){
    super(props);
    this.state = {
      geoJsonData: null,
      geoJsonFileName: null,
    };
    this.props.actions.setViewport({
      longitude:139.480867102275369,latitude:35.304006913365889,zoom:10.0
    });
  }
  updateState({ geoJsonData, geoJsonFileName }){
    this.setState({ geoJsonData, geoJsonFileName });
  }

  render() {
    const { actions, clickedObject, inputFileName, viewport,
      routePaths, movesbase, movedData } = this.props;
    const { movesFileName } = inputFileName;
    const optionVisible = false;

    return (
      <div>
        <div className="harmovis_controller">
          <ul className="flex_list">
            <li className="flex_row">
              <div className="harmovis_input_button_column">
              <label htmlFor="MovesInput">
              Operation data<MovesInput actions={actions} id="MovesInput" />
              </label>
              <div>{movesFileName}</div>
              </div>
            </li>
            <li className="flex_row">
              <div className="harmovis_input_button_column">
              <label htmlFor="GeojsonInput">
              Geojson data<GeoJsonInput setState={this.updateState.bind(this)} actions={actions} id="GeoJsonInput" />
              </label>
              <div>{this.state.geoJsonFileName}</div>
              </div>
            </li>
          </ul>
        </div>
        <div className="harmovis_area">
          <HarmoVisLayers
            viewport={viewport} actions={actions}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            layers={[
              new MovesLayer({ routePaths, movesbase, movedData,
                clickedObject, actions, optionVisible }),
              new GeoJsonLayer({
                data: this.state.geoJsonData,
                pointType: 'circle',
                extruded: true,
                getFillColor: [255,255,255,255]
              })
            ]}
          />
        </div>
      </div>
    );
  }
}
export default connectToHarmowareVis(App);
