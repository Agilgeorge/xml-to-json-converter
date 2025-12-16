// Quick fix to force icons in Cloud
export function forceCloudIcons(jsonString) {
  const data = JSON.parse(jsonString);
  
  if (data.content?.Nodes?.Node) {
    data.content.Nodes.Node.forEach((node, index) => {
      const toolId = parseInt(node['@ToolID'] || '0');
      
      // Force first tool to be Input
      if (toolId === 1 || index === 0) {
        node.GuiSettings['@Plugin'] = 'AlteryxBasePluginsGui.UniversalInput.UniversalInput';
        node.EngineSettings = {
          '@EngineDll': 'UniversalInputTool.dll',
          '@EngineDllEntryPoint': 'UniversalInputTool'
        };
        
        if (!node.Properties) node.Properties = {};
        if (!node.Properties.Configuration) node.Properties.Configuration = {};
        
        node.Properties.Configuration.SampleFileUri = 'tfs://default/empdata.csv';
        node.Properties.Configuration.DatasetId = 'ds_empdata';
        
        console.log('✅ Forced Tool 1 to UniversalInput');
      }
      
      // Force last tool to be Output  
      if (index === data.content.Nodes.Node.length - 1 && data.content.Nodes.Node.length > 1) {
        node.GuiSettings['@Plugin'] = 'AlteryxBasePluginsGui.UniversalOutput.UniversalOutput';
        node.EngineSettings = {
          '@EngineDll': 'UniversalOutputTool.dll',
          '@EngineDllEntryPoint': 'UniversalOutputTool'
        };
        
        if (!node.Properties) node.Properties = {};
        if (!node.Properties.Configuration) node.Properties.Configuration = {};
        
        node.Properties.Configuration.Path = 'tfs://default/output.csv';
        node.Properties.Configuration.DatasetId = 'ds_output';
        node.Properties.Configuration.Action = 'create';
        node.Properties.Configuration.Format = 'csv';
        
        console.log('✅ Forced last tool to UniversalOutput');
      }
    });
  }
  
  return JSON.stringify(data, null, 2);
}