// Test script for enhanced XML to JSON converter
const fs = require('fs');

// Sample XML with complex structure for testing
const testXml = `<?xml version="1.0" encoding="UTF-8"?>
<workflow xmlns:alteryx="http://www.alteryx.com" version="2.0">
  <metadata>
    <name>Employee Data Processing</name>
    <author>Test User</author>
    <created>2024-01-15T10:30:00Z</created>
  </metadata>
  <nodes>
    <node id="1" type="input" x="100" y="100">
      <properties>
        <file path="employees.csv" format="csv"/>
        <schema>
          <field name="empid" type="string" required="true"/>
          <field name="empname" type="string" required="true"/>
          <field name="salary" type="number" required="false"/>
          <field name="department" type="string" required="false"/>
        </schema>
      </properties>
      <annotations>
        <annotation type="comment">Load employee data from CSV file</annotation>
      </annotations>
    </node>
    <node id="2" type="filter" x="250" y="100">
      <properties>
        <condition>salary > 50000</condition>
      </properties>
    </node>
    <node id="3" type="output" x="400" y="100">
      <properties>
        <file path="filtered_employees.json" format="json"/>
      </properties>
    </node>
  </nodes>
  <connections>
    <connection from="1" to="2" output="data" input="data"/>
    <connection from="2" to="3" output="true" input="data"/>
  </connections>
</workflow>`;

// Expected JSON structure for validation
const expectedStructure = {
  paths: [
    'workflow',
    'workflow@xmlns:alteryx',
    'workflow@version',
    'workflow.metadata',
    'workflow.metadata.name',
    'workflow.metadata.author',
    'workflow.metadata.created',
    'workflow.nodes',
    'workflow.nodes.node',
    'workflow.nodes.node@id',
    'workflow.nodes.node@type',
    'workflow.nodes.node@x',
    'workflow.nodes.node@y'
  ],
  nodeCount: 15,
  attributeCount: 8,
  namespaces: ['xmlns:alteryx']
};

console.log('Enhanced XML to JSON Converter Test');
console.log('===================================');
console.log();

console.log('Test XML Structure:');
console.log('- Root element: workflow');
console.log('- Namespaces: xmlns:alteryx');
console.log('- Complex nested structure with metadata, nodes, and connections');
console.log('- Multiple attributes per element');
console.log('- Mixed content (elements and text)');
console.log();

console.log('Expected Conversion Features:');
console.log('✓ Preserve all XML attributes with @ prefix');
console.log('✓ Maintain exact node hierarchy');
console.log('✓ Handle namespace declarations');
console.log('✓ Generate meaningful output filenames');
console.log('✓ Provide structure validation');
console.log('✓ Create side-by-side comparison');
console.log('✓ Export conversion metadata');
console.log();

console.log('Sample XML Content:');
console.log(testXml);
console.log();

console.log('To test the enhanced converter:');
console.log('1. Copy the XML content above');
console.log('2. Paste it into the converter interface');
console.log('3. Click "Convert to JSON"');
console.log('4. Review the conversion metadata');
console.log('5. Download the comparison HTML file');
console.log('6. Verify all paths and attributes are preserved');
console.log();

console.log('Expected Output Files:');
console.log('- workflow_converted_YYYY-MM-DD-HHMMSS.json');
console.log('- workflow_comparison_YYYY-MM-DD-HHMMSS.html');
console.log('- workflow_metadata_YYYY-MM-DD-HHMMSS.json');

// Save test XML to file for easy testing
fs.writeFileSync('test-workflow.xml', testXml);
console.log();
console.log('✓ Test XML saved to test-workflow.xml');
console.log('✓ Ready for enhanced conversion testing');