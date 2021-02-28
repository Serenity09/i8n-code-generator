import { useState } from 'react';
import { Container, Form, Button} from 'react-bootstrap';

import { libraryTemplate, languageTemplate, localizationTemplate } from './WarcraftExportTemplate';

import 'bootstrap/dist/css/bootstrap.min.css';

const detectCSV = require('detect-csv')
const csvToJson = require('csvtojson');


function App() {
  const [inputData, setInputData] = useState("");
  const [inputDataFormat, setInputDataFormat] = useState("CSV");
  const [exportFormat, setExportFormat] = useState("Warcraft III");
  const [exportData, setExportData] = useState("");
  const [isValid, setIsValid] = useState(false);
  
  function hasJsonStructure(str) {
    if (typeof str !== 'string') return false;
    try {
        const result = JSON.parse(str);
        const type = Object.prototype.toString.call(result);
        return type === '[object Object]' 
            || type === '[object Array]';
    } catch (err) {
        return false;
    }
  }
  function onInputDataChange(evt) {
    let newData = evt.target.value;
    setInputData(newData);

    //attempt to auto select format based on entered data
    if (newData) {
      if (hasJsonStructure(newData)) {
        setInputDataFormat("JSON");
        setIsValid(true);
      } else if (detectCSV(newData)) {
        setInputDataFormat("CSV");
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } else {
      setIsValid(false);
    }
  }

  function onInputDataFormatChange(evt) {
    setInputDataFormat(evt.target.value);
  }

  function onExportFormatChange(evt) {
    setExportFormat(evt.target.value);
  }


  async function onInputSubmit(evt) {
    //Prevent default form submit behavior
    evt.preventDefault();
    
    //Convert input data to JSON, which should be easier to work with in a js setting
    let jsonData;
    if (inputDataFormat == "CSV") {
      jsonData = await csvToJson().fromString(inputData);
    }
    else {
      jsonData = inputData;
    }

    //Process
    let templatedExport;
    if (exportFormat == "Warcraft III") {
      templatedExport = exportToWarcraft(jsonData);
    }

    //Update export data
    setExportData(templatedExport);

    //TODO show UI feedback that the export has been completed

    //TODO auto select the exported text for the user

    return false;
  }

  function getLanguagesFromJSON(jsonData) {
    const languages = Object.keys(jsonData[0]).filter(key => key != "Content ID");
    return languages;
  }

  function exportToWarcraft(jsonData) {
    const languages = getLanguagesFromJSON(jsonData);
    const languageData = [];

    languages.forEach((language, iLanguage) => {
      languageData.push(languageTemplate({
        languageIndex: iLanguage + 1, 
        languageCode: language
      }));
    });

    const localizationData = [];
    jsonData.forEach(localization => {
      languages.forEach((language, iLanguage) => {
        if (localization[language]) {
          localizationData.push(localizationTemplate({
            contentID: localization["Content ID"],
            languageIndex: iLanguage + 1,
            localizedValue: localization[language].replaceAll(`"`, "'")
          }));
        }
      });
      
      localizationData.push("");
    });

    return libraryTemplate({
      languageCount: languages.length,
      languageData: languageData.join("\n"),
      localizationData: localizationData.join("\n")
    });
  }
  
  return (
    <Container className="py-4">
      <h1>i8n Code Generator</h1>
      <p>Input your i8n data as CSV or JSON and select a export profile to run.</p>
      
      <Form onSubmit={onInputSubmit}>
        <Form.Group controlId="input-data">
          <Form.Label>Input Data</Form.Label>
          <Form.Control as="textarea" rows={15} value={inputData} onChange={onInputDataChange} />
        </Form.Group>
        <Form.Group controlId="input-format">
          <Form.Label>Input Data Format</Form.Label>
          <Form.Control as="select" value={inputDataFormat} onChange={onInputDataFormatChange}>
            <option>CSV</option>
            <option>JSON</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="export-format">
          <Form.Label>Export Format</Form.Label>
          <Form.Control as="select" value={exportFormat} onChange={onExportFormatChange}>
            <option>Warcraft III</option>
          </Form.Control>
        </Form.Group>
        {/* TODO change disabled behavior to return a toast with validation feedback */}
        <Button variant="primary" type="submit" disabled={!isValid}>
          Export
        </Button>
      </Form>

      <Form className="py-4">
        <Form.Group controlId="export-data">
          <Form.Label>Exported Data</Form.Label>
          <Form.Control as="textarea" rows={2} value={exportData} readOnly={true} />
        </Form.Group>
      </Form>
    </Container>
  );
}

export default App;
