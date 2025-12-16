// Test to verify rename attribute is preserved in Select tool conversion

const testXML = `<?xml version="1.0"?>
<AlteryxDocument yxmdVer="2025.1">
  <Nodes>
    <Node ToolID="1">
      <GuiSettings Plugin="AlteryxBasePluginsGui.DbFileInput.DbFileInput">
        <Position x="54" y="54" />
      </GuiSettings>
      <Properties>
        <Configuration>
          <File>empdata.csv</File>
        </Configuration>
        <MetaInfo connection="Output">
          <RecordInfo>
            <Field name="empid" type="V_WString" size="254" />
            <Field name="empname" type="V_WString" size="254" />
            <Field name="salary" type="V_WString" size="254" />
          </RecordInfo>
        </MetaInfo>
      </Properties>
    </Node>
    <Node ToolID="2">
      <GuiSettings Plugin="AlteryxBasePluginsGui.AlteryxSelect.AlteryxSelect">
        <Position x="162" y="54" />
      </GuiSettings>
      <Properties>
        <Configuration>
          <OrderChanged value="False" />
          <CommaDecimal value="False" />
          <SelectFields>
            <SelectField field="empid" selected="True" rename="emp" />
            <SelectField field="empname" selected="True" />
            <SelectField field="salary" selected="True" type="Int16" size="2" />
          </SelectFields>
        </Configuration>
      </Properties>
    </Node>
    <Node ToolID="6">
      <GuiSettings Plugin="AlteryxSpatialPluginsGui.Summarize.Summarize">
        <Position x="498" y="54" />
      </GuiSettings>
      <Properties>
        <Configuration>
          <SummarizeFields>
            <SummarizeField field="emp" action="GroupBy" rename="emp" />
            <SummarizeField field="salary" action="GroupBy" rename="salary" />
          </SummarizeFields>
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
      <Destination ToolID="6" Connection="Input" />
    </Connection>
  </Connections>
  <Properties>
    <Memory default="True" />
    <MetaInfo>
      <Name>test</Name>
    </MetaInfo>
  </Properties>
</AlteryxDocument>`;

// Parse and convert
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(testXML, "text/xml");

// Import the converter
import('./src/utils/xmlToJsonConverter.ts').then(module => {
  const { convertXmlToJson } = module;
  
  try {
    const jsonResult = convertXmlToJson(testXML, "test");
    const result = JSON.parse(jsonResult);
    
    console.log('\n=== CONVERSION TEST RESULTS ===\n');
    
    // Find Select tool (Node 2)
    const selectNode = result.content.Nodes.Node.find(n => n['@ToolID'] === '2');
    
    if (selectNode) {
      console.log('✅ Select Tool Found (ID: 2)');
      
      const selectFields = selectNode.Properties.Configuration.SelectFields.SelectField;
      console.log('\nSelectFields Configuration:');
      console.log(JSON.stringify(selectFields, null, 2));
      
      // Check if rename attribute is preserved
      const empField = selectFields.find(f => f['@field'] === 'empid');
      
      if (empField && empField['@rename'] === 'emp') {
        console.log('\n✅ SUCCESS: @rename attribute preserved!');
        console.log(`   Field "empid" renamed to "${empField['@rename']}"`);
      } else {
        console.log('\n❌ FAILED: @rename attribute missing!');
        console.log('   Expected: @rename = "emp"');
        console.log('   Got:', empField);
      }
      
      // Check MetaInfo output
      const metaInfo = selectNode.Properties.MetaInfo;
      if (metaInfo && metaInfo.RecordInfo && metaInfo.RecordInfo.Field) {
        console.log('\nMetaInfo Output Fields:');
        metaInfo.RecordInfo.Field.forEach(f => {
          console.log(`   - ${f['@name']} (${f['@type']})`);
        });
        
        const hasEmpField = metaInfo.RecordInfo.Field.some(f => f['@name'] === 'emp');
        if (hasEmpField) {
          console.log('\n✅ SUCCESS: Output field "emp" found in MetaInfo!');
        } else {
          console.log('\n❌ FAILED: Output field "emp" not found in MetaInfo!');
        }
      }
    } else {
      console.log('❌ Select Tool not found!');
    }
    
    // Check Summarize tool
    const summarizeNode = result.content.Nodes.Node.find(n => n['@ToolID'] === '6');
    if (summarizeNode) {
      console.log('\n✅ Summarize Tool Found (ID: 6)');
      
      const summarizeFields = summarizeNode.Properties.Configuration.SummarizeFields.SummarizeField;
      console.log('\nSummarizeFields Configuration:');
      console.log(JSON.stringify(summarizeFields, null, 2));
      
      const empSummary = summarizeFields.find(f => f['@field'] === 'emp');
      if (empSummary) {
        console.log('\n✅ SUCCESS: Summarize tool can now find "emp" field!');
      } else {
        console.log('\n❌ FAILED: Summarize tool still cannot find "emp" field!');
      }
    }
    
    console.log('\n=== END TEST ===\n');
    
  } catch (error) {
    console.error('❌ Conversion Error:', error);
  }
});
