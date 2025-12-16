/**
 * Normalizes input file names to CSV format for cloud compatibility
 * Converts .xlsx and .xls extensions to .csv
 * @param filename - Original filename (e.g., "empdata - Copy.xlsx")
 * @returns Normalized filename with .csv extension (e.g., "empdata - Copy.csv")
 */
export function normalizeFileToCSV(filename: string): string {
  // Check if file has Excel extension
  if (/\.(xlsx?|xls)$/i.test(filename)) {
    // Remove Excel extension and add .csv
    return filename.replace(/\.(xlsx?|xls)$/i, '.csv');
  }
  
  // If already CSV or other format, return as-is
  return filename;
}

export function makeCloudCompatible(jsonString: string, datasets?: Array<{id: string, name: string, datasetId: string, path: string}>): string {
  try {
    const data = JSON.parse(jsonString);
    const content = data.content || data;
    
    if (!content.Nodes?.Node || !datasets || datasets.length === 0) {
      return jsonString;
    }
    
    const nodes = Array.isArray(content.Nodes.Node) ? content.Nodes.Node : [content.Nodes.Node];
    let inputDatasetIndex = 0;
    let outputDatasetIndex = 0;
    
    nodes.forEach((node: any) => {
      const plugin = node.GuiSettings?.['@Plugin'] || '';
      
      if (plugin === 'AlteryxBasePluginsGui.UniversalInput.UniversalInput') {
        if (node.Properties?.Configuration && datasets[inputDatasetIndex]) {
          const originalName = datasets[inputDatasetIndex].name;
          const normalizedName = normalizeFileToCSV(originalName);
          const isExcelFile = /\.(xlsx?|xls)$/i.test(originalName);
          
          // Update dataset references
          node.Properties.Configuration.DatasetId = datasets[inputDatasetIndex].datasetId;
          node.Properties.Configuration.SampleFileUri = datasets[inputDatasetIndex].path;
          node.Properties.Configuration.ConnectionName = normalizedName;
          
          // Update format configuration for CSV if original was Excel
          if (isExcelFile) {
            node.Properties.Configuration.Format = 'csv';
            node.Properties.Configuration.Delim = ',';
            node.Properties.Configuration.HasQuotes = 'true';
            node.Properties.Configuration.Header = 'true';
            node.Properties.Configuration.FirstRowData = 'false';
            
            // Remove Excel-specific properties
            delete node.Properties.Configuration.Sheet;
            delete node.Properties.Configuration.Range;
          }
          
          inputDatasetIndex++;
        }
      } else if (plugin === 'AlteryxBasePluginsGui.UniversalOutput.UniversalOutput') {
        if (node.Properties?.Configuration && datasets[outputDatasetIndex]) {
          const normalizedName = normalizeFileToCSV(datasets[outputDatasetIndex].name);
          
          node.Properties.Configuration.DatasetId = datasets[outputDatasetIndex].datasetId;
          node.Properties.Configuration.Path = datasets[outputDatasetIndex].path;
          node.Properties.Configuration.FileName = normalizedName.replace(/\.[^/.]+$/, '');
          outputDatasetIndex++;
        }
      }
    });
    
    return JSON.stringify(data, null, 2);
  } catch (err) {
    console.error('Cloud compatibility conversion failed:', err);
    return jsonString;
  }
}
