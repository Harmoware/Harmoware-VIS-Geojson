import React from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import {
  Container, connectToHarmowareVis, HarmoVisLayers, MovesLayer, MovesInput
} from 'harmoware-vis';
import GeoJsonInput from '../components/geojson-input'

const MAPBOX_TOKEN = ''; //Acquire Mapbox accesstoken

const getFillColor = {
  "地区公園（カントリーパーク）":[85,107,47],
  "広域公園":[60,179,113],
  "特殊公園（風致公園、動植物公園、歴史公園、墓園）":[46,139,87],
  "総合公園":[32,178,170],
  "緑道":[124,252,0],
  "緩衝緑地":[0,255,127],
  "街区公園":[0,250,154],
  "近隣公園":[0,100,0],
  "運動公園":[0,128,0],
  "都市林":[34,139,34],
  "都市緑地":[143,188,143],
};

class App extends Container {
  constructor(props){
    super(props);
    this.state = {
      geoJsonData: null,
      geoJsonFileName: null,
      populationList: [],
      selectpopulation: "",
      elevationScale: 1,
      popup: [0, 0, ''],
    };
    this.props.actions.setInitialViewChange(false)
    this.props.actions.setViewport({
      longitude:139.48764008539553,latitude:35.33898340780633,zoom:12.0
    });
  }
  setFileInfo(setState){
    this.setState(setState);
  }
  onHover(el){
    if (el && el.object && el.object.properties) {
      let disptext = '';
      const objctlist = Object.entries(el.object.properties);
      for (let i = 0, lengthi = objctlist.length; i < lengthi; i=(i+1)|0) {
        if(objctlist[i][0].match(/SAFIELD[0-9]{3}/) && objctlist[i][1]){
          const strvalue = objctlist[i][1].toString();
          disptext = disptext + (i > 0 ? '\n' : '');
          disptext = disptext + (`${objctlist[i][0]}: ${strvalue}`);
        }else{
          const { selectpopulation } = this.state;
          if(objctlist[i][0] === selectpopulation && objctlist[i][1]){
            const strvalue = objctlist[i][1].toString();
            disptext = disptext + (i > 0 ? '\n' : '');
            disptext = disptext + (`${objctlist[i][0]}: ${strvalue}`);
          }
        }
      }
      this.setState({ popup: [el.x, el.y, disptext] });
    } else {
      this.setState({ popup: [0, 0, ''] });
    }
  }
  getFillColor(x){
    const color = getFillColor[x.properties.SAFIELD008];
    return color || [255,255,255];
  }
  getElevation(x){
    const {selectpopulation} = this.state;
    if(x.properties[selectpopulation]){
      return Number(x.properties[selectpopulation]);
    }
    return 0;
  }
  getPopulation(e){
    this.setState({ selectpopulation: e.target.value });
  }
  getElevationScale(e){
    this.setState({ elevationScale: +e.target.value });
  }

  render() {
    const { actions, clickedObject, inputFileName, viewport,
      routePaths, movesbase, movedData } = this.props;
    const { movesFileName } = inputFileName;
    const optionVisible = false;
    const { geoJsonData, populationList, selectpopulation, elevationScale } = this.state;
    const name = geoJsonData && geoJsonData.name;
    const onHover = this.onHover.bind(this);
    const getFillColor = this.getFillColor.bind(this);
    const getElevation = this.getElevation.bind(this);
    const getPopulation = this.getPopulation.bind(this);
    const getElevationScale = this.getElevationScale.bind(this);

    return (
      <div>
        <div className="harmovis_controller" style={{width: "260px"}}>
          <ul className="flex_list">
            <li className="flex_row">
              <div className="harmovis_input_button_row">
              <label htmlFor="MovesInput">
              Operation data<MovesInput actions={actions} id="MovesInput" />
              </label>
              <div>{movesFileName}</div>
              </div>
            </li>
            <li className="flex_row">
              <div className="harmovis_input_button_row">
              <label htmlFor="GeoJsonInput">
              GeoJson data<GeoJsonInput actions={actions} id="GeoJsonInput"
              setFileInfo={this.setFileInfo.bind(this)} />
              </label>
              <div>{this.state.geoJsonFileName}</div>
              </div>
            </li>
            <li className="flex_column">
              <div>SelectPopulation</div>
              <div className="form-select" title='SelectPopulation'>
                <select id="SelectPopulation" value={selectpopulation} onChange={getPopulation} >
                <option value="" key={-1} >未選択</option>
                {populationList.map((x,i)=><option value={x} key={i}>{x}</option>)}
                </select>
              </div>
            </li>
            <li className="flex_column">
              <div>ElevationScale</div>
                <input type="range" value={elevationScale}
                min={0} max={10} step={1}
                onChange={getElevationScale}
                id="ElevationScale" className="harmovis_input_range"
                />
            </li>
          </ul>
        </div>
        <div className="harmovis_area">
          <HarmoVisLayers
            viewport={viewport} actions={actions}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            layers={[
              new MovesLayer({ routePaths, movesbase, movedData,
                clickedObject, actions, optionVisible, pickable:false }),
              name === "parkPolygon" ?
                new GeoJsonLayer({
                  id: 'geojson-layer-parkPolygon-' + selectpopulation,
                  data: geoJsonData,
                  pickable: true,
                  pointType: 'circle',
                  extruded: true,
                  getFillColor,
                  getElevation,
                  elevationScale: (elevationScale/10),
                  onHover
                }):null,
            ]}
          />
        </div>
        <svg width={viewport.width} height={viewport.height} className="harmovis_overlay">
          <g fill="white" fontSize="12">
            {this.state.popup[2].length > 0 ?
              this.state.popup[2].split('\n').map((value, index) =>
                <text
                  x={this.state.popup[0] + 10} y={this.state.popup[1] + (index * 12)}
                  key={index.toString()}
                >{value}</text>) : null
            }
          </g>
        </svg>
      </div>
    );
  }
}
export default connectToHarmowareVis(App);
