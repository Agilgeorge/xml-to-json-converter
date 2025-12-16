// Manual JSON fixer for DbFile tools
function fixDbFileTools(jsonString) {
  // Replace all DbFile references directly in the string
  let fixed = jsonString
    .replace(/AlteryxBasePluginsGui\.DbFileInput\.DbFileInput/g, 'AlteryxBasePluginsGui.UniversalInput.UniversalInput')
    .replace(/AlteryxBasePluginsGui\.DbFileOutput\.DbFileOutput/g, 'AlteryxBasePluginsGui.UniversalOutput.UniversalOutput');
  
  // Parse and add required EngineSettings
  try {
    const data = JSON.parse(fixed);
    const content = data.content || data;
    
    if (content.Nodes?.Node) {
      const nodes = Array.isArray(content.Nodes.Node) ? content.Nodes.Node : Object.values(content.Nodes.Node);
      
      nodes.forEach((node, index) => {
        const plugin = node.GuiSettings?.['@Plugin'];
        
        if (plugin === 'AlteryxBasePluginsGui.UniversalInput.UniversalInput') {
          node.EngineSettings = {
            '@EngineDll': 'UniversalInputTool.dll',
            '@EngineDllEntryPoint': 'UniversalInputTool'
          };
          
          // Add cloud config
          const config = node.Properties?.Configuration || {};
          Object.assign(config, {
            'DatasetId': '559479',
            'SampleFileUri': 'tfs://trinitetech-alteryx-trial-lhsa/110911/uploads/test.csv',
            '__page': 'LIST_CONNECTIONS'
          });
        }
        
        if (plugin === 'AlteryxBasePluginsGui.UniversalOutput.UniversalOutput') {
          node.EngineSettings = {
            '@EngineDll': 'UniversalOutputTool.dll',
            '@EngineDllEntryPoint': 'UniversalOutputTool'
          };
          
          // Add cloud config
          const config = node.Properties?.Configuration || {};
          Object.assign(config, {
            'Path': 'tfs://trinitetech-alteryx-trial-lhsa/110911/output.csv',
            'DatasetId': '559480',
            'Format': 'csv',
            'Action': 'create',
            'SelectedProtocol': 'tfs'
          });
        }
      });
    }
    
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return fixed;
  }
}

// Export for use
if (typeof module !== 'undefined') {
  module.exports = { fixDbFileTools };
}