// Test the icon fix for Alteryx Cloud
import { convertXmlToJson } from './src/utils/xmlToJsonConverter.js';

// Sample XML with different tool types
const testXml = `<?xml version="1.0"?>
<AlteryxDocument yxmdVer="2023.1">
  <Nodes>
    <Node ToolID="1">
      <GuiSettings Plugin="AlteryxBasePluginsGui.TextInput.TextInput" X="54" Y="162" />
      <Properties>
        <Configuration>
          <File>C:\\Users\\test\\input.csv</File>
        </Configuration>
      </Properties>
    </Node>
    <Node ToolID="2">
      <GuiSettings Plugin="AlteryxBasePluginsGui.AlteryxSelect.AlteryxSelect" X="186" Y="162" />
      <Properties>
        <Configuration>
          <SelectFields>
            <SelectField field="ID" selected="True" />
          </SelectFields>
        </Configuration>
      </Properties>
    </Node>
    <Node ToolID="3">
      <GuiSettings Plugin="AlteryxBasePluginsGui.DbFileOutput.DbFileOutput" X="318" Y="162" />
      <Properties>
        <Configuration>
          <File>C:\\Users\\test\\output.csv</File>
        </Configuration>
      </Properties>
    </Node>
  </Nodes>
  <Connections>
    <Connection>
      <Origin ToolID="1" Connection="Output" />
      <Destination ToolID="2" Connection="Input" />
    </Connection>
    <Connection>
      <Origin ToolID="2" Connection="Output" />
      <Destination ToolID="3" Connection="Input" />
    </Connection>
  </Connections>
</AlteryxDocument>`;

console.log('🧪 Testing Icon Fix...');
try {
  const result = convertXmlToJson(testXml);
  const parsed = JSON.parse(result);
  
  console.log('\n📊 Results:');
  console.log(`Nodes converted: ${parsed.content.Nodes.Node.length}`);
  
  parsed.content.Nodes.Node.forEach((node, i) => {
    console.log(`Node ${i+1}: ${node.GuiSettings['@Plugin']}`);
  });
  
  console.log('\n✅ Test completed! Check console for conversion details.');
} catch (error) {
  console.error('❌ Test failed:', error);
}