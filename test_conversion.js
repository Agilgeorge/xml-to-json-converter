// Simple test to verify cloud conversion
const testJson = {
  "name": "test",
  "content": {
    "Nodes": {
      "Node": [
        {
          "@ToolID": "1",
          "GuiSettings": {
            "@Plugin": "AlteryxBasePluginsGui.DbFileInput.DbFileInput"
          },
          "Properties": {
            "Configuration": {
              "File": "C:\\test\\input.csv"
            }
          }
        },
        {
          "@ToolID": "2", 
          "GuiSettings": {
            "@Plugin": "AlteryxBasePluginsGui.DbFileOutput.DbFileOutput"
          },
          "Properties": {
            "Configuration": {
              "File": "C:\\test\\output.csv"
            }
          }
        }
      ]
    }
  }
};

function makeCloudCompatible(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const content = data.content || data;
    
    if (!content.Nodes?.Node) return jsonString;
    
    const nodes = Array.isArray(content.Nodes.Node) 
      ? content.Nodes.Node 
      : Object.values(content.Nodes.Node);
    
    nodes.forEach((node, index) => {
      if (!node.GuiSettings) return;
      
      const plugin = node.GuiSettings['@Plugin'];
      const config = node.Properties?.Configuration || {};
      
      // FORCE CONVERT DbFile tools
      if (plugin?.includes('DbFileInput')) {
        node.GuiSettings['@Plugin'] = 'AlteryxBasePluginsGui.UniversalInput.UniversalInput';
        
        node.EngineSettings = {
          '@EngineDll': 'UniversalInputTool.dll',
          '@EngineDllEntryPoint': 'UniversalInputTool'
        };
        
        Object.keys(config).forEach(key => delete config[key]);
        Object.assign(config, {
          'DatasetId': '559479',
          'SampleFileUri': 'tfs://trinitetech-alteryx-trial-lhsa/110911/uploads/test.csv'
        });
      }
      
      if (plugin?.includes('DbFileOutput')) {
        node.GuiSettings['@Plugin'] = 'AlteryxBasePluginsGui.UniversalOutput.UniversalOutput';
        
        node.EngineSettings = {
          '@EngineDll': 'UniversalOutputTool.dll',
          '@EngineDllEntryPoint': 'UniversalOutputTool'
        };
        
        Object.keys(config).forEach(key => delete config[key]);
        Object.assign(config, {
          'Path': 'tfs://trinitetech-alteryx-trial-lhsa/110911/test.csv',
          'DatasetId': '559480',
          'Format': 'csv'
        });
      }
    });
    
    return JSON.stringify(data, null, 2);
  } catch (err) {
    return jsonString;
  }
}

// Test conversion
const input = JSON.stringify(testJson, null, 2);
console.log('BEFORE CONVERSION:');
console.log(input);

const output = makeCloudCompatible(input);
console.log('\nAFTER CONVERSION:');
console.log(output);

// Check if conversion worked
const converted = JSON.parse(output);
const hasDbFile = JSON.stringify(converted).includes('DbFile');
console.log('\nCONVERSION SUCCESS:', !hasDbFile);