const fs = require('fs');

// Simple XML to JSON converter for testing
function xmlToJson(xmlString) {
  const parser = new (require('jsdom').JSDOM)().window.DOMParser;
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  function convertNode(node) {
    let obj = {};
    
    // Skip unwanted nodes
    if (node.nodeName === 'dependencies' || node.nodeName === 'EngineSettings') {
      return null;
    }
    
    // Handle attributes with filtering
    if (node.attributes && node.attributes.length > 0) {
      for (const attr of Array.from(node.attributes)) {
        if (attr.name === 'yxmdVer' || 
            attr.name === 'RunE2' || 
            attr.name === 'default' || 
            attr.name === 'value' ||
            attr.name === 'EngineDll' ||
            attr.name === 'EngineDllEntryPoint') {
          continue;
        }
        obj[`@${attr.name}`] = attr.value;
      }
    }
    
    const children = Array.from(node.children || []);
    const text = node.textContent?.trim();
    
    if (children.length === 0) {
      if (text && Object.keys(obj).length > 0) {
        obj["#text"] = text;
        return obj;
      }
      return text || obj || null;
    }
    
    // Process children with filtering
    for (const child of children) {
      const key = child.nodeName;
      
      if (key === 'dependencies' || key === 'EngineSettings') {
        continue;
      }
      
      const value = convertNode(child);
      
      if (value === null) {
        continue;
      }
      
      if (obj[key] === undefined) {
        obj[key] = value;
      } else if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else {
        obj[key] = [obj[key], value];
      }
    }
    
    return obj;
  }
  
  const content = convertNode(xmlDoc.documentElement);
  return {
    name: "workflow3",
    content: content
  };
}

// Test with sample XML
const testXml = `<?xml version="1.0"?>
<AlteryxDocument yxmdVer="2023.1">
  <Nodes>
    <Node ToolID="1">
      <GuiSettings Plugin="AlteryxBasePluginsGui.DbFileInput.DbFileInput">
        <Position x="54" y="162" />
      </GuiSettings>
      <Properties>
        <Configuration>
          <File>input.csv</File>
        </Configuration>
        <Annotation>
          <Name>Input Tool</Name>
        </Annotation>
      </Properties>
      <EngineSettings EngineDll="AlteryxBasePluginsEngine.dll" EngineDllEntryPoint="AlteryxDbFileInput" />
      <dependencies>
        <dependency>some dependency</dependency>
      </dependencies>
    </Node>
    <Node ToolID="2">
      <GuiSettings Plugin="AlteryxBasePluginsGui.AlteryxSelect.AlteryxSelect">
        <Position x="186" y="162" />
      </GuiSettings>
      <Properties>
        <Configuration>
          <SelectFields>
            <SelectField field="ID" selected="True" />
          </SelectFields>
        </Configuration>
      </Properties>
      <EngineSettings EngineDll="AlteryxBasePluginsEngine.dll" EngineDllEntryPoint="AlteryxSelect" />
    </Node>
  </Nodes>
</AlteryxDocument>`;

try {
  const result = xmlToJson(testXml);
  console.log('Converted JSON:');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}