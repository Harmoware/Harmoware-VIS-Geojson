import React from 'react';

export default class GeoJsonInput extends React.Component {
    onSelect(e) {
      const { actions, setFileInfo } = this.props;
      const reader = new FileReader();
      const file = e.target.files[0];
      if (!file) {
        return;
      }
      actions.setLoading(true);
      setFileInfo({geoJsonData:null, geoJsonFileName:null,
        populationList:[], selectpopulation:""});
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
        const list = {}
        for (let [key1, value1] of Object.entries(readdata)) {
          if(key1 !== "features") continue;
          for (const elem of value1) {
            for (let [key2, value2] of Object.entries(elem)) {
              if(key2 !== "properties") continue;
              for (let [key3, value3] of Object.entries(value2)) {
                if(key3.match(/(population|households)/))
                list[key3]=key3
              }
            }
          }
        }
        const populationList = Object.keys(list)
        setFileInfo({geoJsonData:readdata, geoJsonFileName:file_name,
          populationList, selectpopulation:""});
      };
    }
    onClick(e) {
      const { setFileInfo } = this.props;
      setFileInfo({geoJsonData:null, geoJsonFileName:null,
        populationList:[], selectpopulation:""});
      document.getElementById("GeoJsonInput").value = '';
    }
    render() {
      const { id } = this.props;
      return (
        <input type="file" accept=".geojson"
        id={id}
        onClick={this.onClick.bind(this)}
        onChange={this.onSelect.bind(this)}
        />
      );
    }
  }
