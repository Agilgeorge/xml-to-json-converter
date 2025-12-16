// cloudCompatible.ts
export function makeCloudCompatible(jsonString: string): string {
  let result = jsonString;
  
  // Replace Desktop-specific paths with Cloud paths
  result = result.replace(/C:\\[^"']*/g, '');
  result = result.replace(/\\\\[^"']*/g, '');
  
  // Ensure TFS protocol for cloud storage
  result = result.replace(/"Protocol":\s*"file"/g, '"Protocol": "tfs"');
  
  // Remove any null or undefined values
  result = result.replace(/,?\s*"[^"]+":\s*null/g, '');
  result = result.replace(/,?\s*"[^"]+":\s*undefined/g, '');
  
  return result;
}

// iconFixer.ts
export function fixIconPaths(node: any): any {
  if (node.GuiSettings?.["@Plugin"]) {
    const plugin = node.GuiSettings["@Plugin"];
    
    // Ensure correct plugin paths
    const pluginMap: { [key: string]: string } = {
      "DbFileInput": "AlteryxBasePluginsGui.UniversalInput.UniversalInput",
      "DbFileOutput": "AlteryxBasePluginsGui.UniversalOutput.UniversalOutput",
      "AlteryxSelect": "AlteryxBasePluginsGui.AlteryxSelect.AlteryxSelect"
    };
    
    for (const [key, value] of Object.entries(pluginMap)) {
      if (plugin.includes(key)) {
        node.GuiSettings["@Plugin"] = value;
        break;
      }
    }
  }
  
  return node;
}

export function cleanGuiSettings(node: any): any {
  if (node.GuiSettings) {
    // Remove desktop-specific settings
    delete node.GuiSettings.Mode;
    delete node.GuiSettings.Designer;
    
    // Ensure Position exists
    if (!node.GuiSettings.Position) {
      node.GuiSettings.Position = {
        "@x": "0",
        "@y": "0"
      };
    }
  }
  
  return node;
}

export function removeExternalResources(jsonString: string): string {
  let result = jsonString;
  
  // Clean up file paths only
  result = result.replace(/file:\/\/\/[^"']*/g, '');
  
  return result;
}

// File format normalization
interface FileFormatInfo {
  fileName: string;
  extension: string;
  isExcel: boolean;
  isCsv: boolean;
  normalizedName: string;
}

function normalizeInputFileFormat(config: any): FileFormatInfo {
  let fileName = "";
  
  // Extract filename from various config properties
  if (config.File?.["#text"]) {
    fileName = config.File["#text"];
  } else if (config.File) {
    fileName = String(config.File);
  } else if (config.ConnectionName) {
    fileName = config.ConnectionName;
  } else if (config.Path) {
    fileName = config.Path;
  } else if (config.FileName) {
    fileName = config.FileName;
  } else if (config.__originalFileName) {
    fileName = config.__originalFileName;
  }
  
  // Extract just the filename from full path
  if (fileName.includes('\\')) {
    fileName = fileName.split('\\').pop() || fileName;
  }
  if (fileName.includes('/')) {
    fileName = fileName.split('/').pop() || fileName;
  }
  
  // Clean Excel query parts (e.g., "file.xlsx|||Sheet1")
  if (fileName.includes('|||')) {
    fileName = fileName.split('|||')[0];
  }
  
  // Detect file extension
  const extensionMatch = fileName.match(/\.([^.]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';
  
  // Check if Excel format
  const excelExtensions = ['xlsx', 'xls', 'xlsm', 'xlsb', 'xltx', 'xltm'];
  const isExcel = excelExtensions.includes(extension);
  const isCsv = extension === 'csv';
  
  // Create normalized name
  let normalizedName = fileName;
  if (isExcel) {
    // Remove Excel extension and add .csv
    normalizedName = fileName.replace(/\.(xlsx|xls|xlsm|xlsb|xltx|xltm)$/i, '.csv');
    console.log(`📋 Normalized Excel file: ${fileName} → ${normalizedName}`);
  } else if (!isCsv && extension) {
    // For other formats, also normalize to CSV
    normalizedName = fileName.replace(/\.[^.]+$/, '.csv');
    console.log(`📋 Normalized file: ${fileName} → ${normalizedName}`);
  } else if (!extension) {
    // No extension found, add .csv
    normalizedName = `${fileName}.csv`;
    console.log(`📋 Added CSV extension: ${fileName} → ${normalizedName}`);
  }
  // If already CSV, keep as-is
  
  return {
    fileName,
    extension,
    isExcel,
    isCsv,
    normalizedName
  };
}

function createCsvConfiguration(fileInfo: FileFormatInfo): any {
  return {
    "__page": "LIST_CONNECTIONS",
    "DatasetId": "",
    "VendorName": "",
    "HasInferred": false,
    "ConnectionId": "",
    "__tableName": "",
    "__schemaName": "",
    "SampleFileUri": "",
    "ConnectionName": fileInfo.normalizedName,
    "__previousPage": "LIST_CONNECTIONS",
    "__needsDatasetSelection": true,
    "__originalFileName": fileInfo.fileName,
    "__normalizedFileName": fileInfo.normalizedName,
    "__wasExcelFile": fileInfo.isExcel,
    // CSV-specific settings
    "Format": "csv",
    "HasHeader": true,
    "Delimiter": ",",
    "QuoteChar": "\"",
    "EscapeChar": "\"",
    "Encoding": "UTF-8"
  };
}

// Main XML to JSON converter
function xmlToJson(node: Element): any {
  let obj: any = {};

  // Convert attributes
  if (node.attributes.length > 0) {
    for (const attr of Array.from(node.attributes)) {
      let value = attr.value;
      // Clean desktop paths
      if (attr.name === 'source' && value.includes('C:\\')) {
        value = '';
      }
      obj[`@${attr.name}`] = value;
    }
  }

  const children = Array.from(node.children);
  const text = node.textContent?.trim();

  // Handle leaf nodes
  if (children.length === 0) {
    if (text && Object.keys(obj).length > 0) {
      obj["#text"] = text;
      return obj;
    }
    return text || obj || null;
  }

  // Group children by tag name
  const childGroups: { [key: string]: any[] } = {};
  for (const child of children) {
    const key = child.nodeName;
    if (!childGroups[key]) {
      childGroups[key] = [];
    }
    childGroups[key].push(xmlToJson(child));
  }

  // Convert groups to proper structure
  for (const [key, values] of Object.entries(childGroups)) {
    obj[key] = values.length === 1 ? values[0] : values;
  }

  return obj;
}

function detectFileType(content: string): 'xml' | 'json' | 'unknown' {
  const trimmed = content.trim();
  if (trimmed.startsWith('<')) return 'xml';
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  return 'unknown';
}

function convertXmlToJson(xmlString: string, workflowName?: string): string {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Invalid XML: Unable to parse the XML content");
    }

    const json = xmlToJson(xmlDoc.documentElement);
    const cloudJson = convertToCloudFormat(json, workflowName);

    let jsonString = JSON.stringify(cloudJson, null, 2);
    jsonString = makeCloudCompatible(jsonString);
    
    return jsonString;
  } catch (error) {
    console.error("Conversion error:", error);
    throw new Error(`Failed to convert XML to JSON: ${error}`);
  }
}

function convertToCloudFormat(data: any, workflowName?: string): any {
  const workflowContent: any = {};
  
  // Version
  workflowContent["@yxmdVer"] = data["@yxmdVer"] || "2025.1";
  
  // Initialize structure
  workflowContent.Nodes = { Node: [] };
  workflowContent.Connections = { Connection: [] };
  
  // Cloud-compatible Properties
  workflowContent.Properties = {
    Memory: { "@default": "True" },
    GlobalRecordLimit: { "@value": "0" },
    TempFiles: { "@default": "True" },
    Annotation: {
      "@on": "True",
      "@includeToolName": "False"
    },
    ConvErrorLimit: { "@value": "10" },
    ConvErrorLimit_Stop: { "@value": "False" },
    CancelOnError: { "@value": "False" },
    DisableBrowse: { "@value": "False" },
    EnablePerformanceProfiling: { "@value": "False" },
    RunWithE2: { "@value": "True" },
    WorkflowMode: { "@value": "standard" },
    DefaultTZ: { "@value": "Etc/UTC" },
    PredictiveToolsCodePage: { "@value": "1252" },
    DisableAllOutput: { "@value": "False" },
    ShowAllMacroMessages: { "@value": "False" },
    ShowConnectionStatusIsOn: { "@value": "True" },
    ShowConnectionStatusOnlyWhenRunning: { "@value": "True" },
    ZoomLevel: { "@value": "0" },
    LayoutType: "Horizontal",
    IsTemplate: { "@value": "False" },
    CloudDisableAutorename: { "@value": "True" },
    MetaInfo: {
      NameIsFileName: { "@value": "True" },
      Name: workflowName || data.Properties?.MetaInfo?.Name || "cloud_workflow",
      Description: {},
      RootToolName: {},
      ToolVersion: {},
      ToolInDb: { "@value": "False" },
      CategoryName: {},
      SearchTags: {},
      Author: {},
      Company: {},
      Copyright: {},
      DescriptionLink: {
        "@actual": "",
        "@displayed": ""
      },
      Example: {
        Description: {},
        File: {}
      },
      WorkflowId: {
        "@value": data.Properties?.MetaInfo?.WorkflowId?.["@value"] || generateUUID()
      },
      Telemetry: {
        PreviousWorkflowId: {
          "@value": data.Properties?.MetaInfo?.Telemetry?.PreviousWorkflowId?.["@value"] || ""
        },
        OriginWorkflowId: {
          "@value": data.Properties?.MetaInfo?.Telemetry?.OriginWorkflowId?.["@value"] || generateUUID()
        }
      },
      PlatformWorkflowId: {
        "@value": ""
      }
    },
    Events: {
      Enabled: { "@value": "True" }
    }
  };

  // Process Nodes
  let nodes = [];
  if (data.Nodes?.Node) {
    nodes = Array.isArray(data.Nodes.Node) ? data.Nodes.Node : [data.Nodes.Node];
  }
  
  console.log('Processing nodes:', nodes.length);
  
  // First pass: Convert all nodes
  const convertedNodes = nodes
    .map((node: any) => {
      const converted = convertNodeToCloud(node);
      // Also convert child nodes if they exist (for containers)
      if (converted && converted.ChildNodes?.Node) {
        const childNodes = Array.isArray(converted.ChildNodes.Node) 
          ? converted.ChildNodes.Node 
          : [converted.ChildNodes.Node];
        converted.ChildNodes.Node = childNodes
          .map((child: any) => convertNodeToCloud(child))
          .filter((n: any) => n !== null);
      }
      return converted;
    })
    .filter((n: any) => n !== null);
  
  // Second pass: Fix Select Tool fields based on upstream metadata
  convertedNodes.forEach((node: any, index: number) => {
    const plugin = node.GuiSettings?.["@Plugin"] || "";
    if (plugin.includes("AlteryxSelect")) {
      fixSelectToolFields(node, convertedNodes, index);
    }
  });
  
  workflowContent.Nodes.Node = convertedNodes;

  // Process Connections with cycle detection
  let connections = [];
  if (data.Connections?.Connection) {
    connections = Array.isArray(data.Connections.Connection)
      ? data.Connections.Connection
      : [data.Connections.Connection];
  }

  console.log('Original connections:', connections.map((c: any) => `${c.Origin?.["@ToolID"]} -> ${c.Destination?.["@ToolID"]}`));
  
  // Remove cycles
  const validConnections = removeCycles(connections);
  
  console.log('Valid connections after cycle removal:', validConnections.map((c: any) => `${c.Origin?.["@ToolID"]} -> ${c.Destination?.["@ToolID"]}`));

  workflowContent.Connections.Connection = validConnections.map((c: any) => ({
    "@name": c["@name"] || "",
    Origin: {
      "@ToolID": c.Origin?.["@ToolID"] || "",
      "@Connection": c.Origin?.["@Connection"] || "Output"
    },
    Destination: {
      "@ToolID": c.Destination?.["@ToolID"] || "",
      "@Connection": c.Destination?.["@Connection"] || "Input"
    }
  }));

  const finalWorkflowName = workflowName || 
                            data.Properties?.MetaInfo?.Name || 
                            data["@name"] || 
                            "cloud_workflow";

  return {
    name: finalWorkflowName,
    content: workflowContent
  };
}

function fixSelectToolFields(node: any, allNodes: any[], currentIndex: number): void {
  const config = node.Properties?.Configuration;
  if (!config?.SelectFields?.SelectField) return;
  
  const fields = Array.isArray(config.SelectFields.SelectField)
    ? config.SelectFields.SelectField
    : [config.SelectFields.SelectField];
  
  const hasUnknown = fields.some(
    (f: any) => f["@field"] === "*Unknown" || f["@field"] === "*"
  );
  
  if (hasUnknown) {
    // Find previous node with field metadata
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevNode = allNodes[i];
      const prevFields = prevNode?.Properties?.MetaInfo?.RecordInfo?.Field;
      
      if (prevFields && Array.isArray(prevFields) && prevFields.length > 0) {
        config.SelectFields.SelectField = prevFields.map((f: any) => ({
          "@field": f["@name"],
          "@selected": "True"
        }));
        
        // Update MetaInfo
        if (node.Properties.MetaInfo) {
          node.Properties.MetaInfo.RecordInfo = {
            Field: prevFields.map((f: any) => ({
              "@name": f["@name"],
              "@type": f["@type"] || "V_String",
              "@size": f["@size"] || "254"
            }))
          };
        }
        break;
      }
    }
  }
}

function convertNodeToCloud(node: any): any {
  const plugin = node.GuiSettings?.["@Plugin"] || "";
  console.log('Converting node:', node['@ToolID'], 'Plugin:', plugin);
  
  // Skip TextInput tools - not supported in Cloud
  if (plugin.includes("TextInput")) {
    console.warn(`TextInput tool (ID: ${node['@ToolID']}) not supported in Cloud. Skipping.`);
    return null;
  }
  
  // Deep clone to avoid mutations
  let cloudNode = JSON.parse(JSON.stringify(node));
  
  // Apply fixes
  cloudNode = fixIconPaths(cloudNode);
  cloudNode = cleanGuiSettings(cloudNode);
  
  // Check plugin AFTER fixIconPaths
  const updatedPlugin = cloudNode.GuiSettings?.["@Plugin"] || "";
  
  // 🆕 Detect tool types
  const isInputTool = updatedPlugin.includes("UniversalInput") || updatedPlugin.includes("DbFileInput");
  const isOutputTool = updatedPlugin.includes("UniversalOutput") || updatedPlugin.includes("DbFileOutput");
  const isSelectTool = updatedPlugin.includes("AlteryxSelect");
  const isFilterTool = updatedPlugin.includes("Filter");
  const isFormulaTool = updatedPlugin.includes("Formula") && !updatedPlugin.includes("MultiRowFormula") && !updatedPlugin.includes("MultiFieldFormula");
  const isUnionTool = updatedPlugin.includes("Union");
  const isJoinTool = updatedPlugin.includes("Join") && !updatedPlugin.includes("FindReplace") && !updatedPlugin.includes("FuzzyMatch");
  const isSortTool = updatedPlugin.includes("Sort");
  const isSummarizeTool = updatedPlugin.includes("Summarize");
  const isContainerTool = updatedPlugin.includes("ToolContainer");
  
  // Auto-convert desktop tools to universal tools
  if (updatedPlugin === "AlteryxBasePluginsGui.DbFileInput.DbFileInput") {
    cloudNode.GuiSettings["@Plugin"] = "AlteryxBasePluginsGui.UniversalInput.UniversalInput";
    cloudNode.EngineSettings = {
      "@EngineDll": "UniversalInputTool.dll",
      "@EngineDllEntryPoint": "UniversalInputTool"
    };
  }
  if (updatedPlugin === "AlteryxBasePluginsGui.DbFileOutput.DbFileOutput") {
    cloudNode.GuiSettings["@Plugin"] = "AlteryxBasePluginsGui.UniversalOutput.UniversalOutput";
    cloudNode.EngineSettings = {
      "@EngineDll": "UniversalOutputTool.dll",
      "@EngineDllEntryPoint": "UniversalOutputTool"
    };
  }
  
  // Route to specific converter based on tool type
  if (isInputTool) {
    convertInputTool(cloudNode, node);
  } else if (isOutputTool) {
    convertOutputTool(cloudNode, node);
  } else if (isSelectTool) {
    convertSelectTool(cloudNode, node);
  } else if (isFilterTool) {
    convertFilterTool(cloudNode, node);
  } else if (isFormulaTool) {
    convertFormulaTool(cloudNode, node);
  } else if (isUnionTool) {
    convertUnionTool(cloudNode, node);
  } else if (isJoinTool) {
    convertJoinTool(cloudNode, node);
  } else if (isSortTool) {
    convertSortTool(cloudNode, node);
  } else if (isSummarizeTool) {
    convertSummarizeTool(cloudNode, node);
  } else if (isContainerTool) {
    convertContainerTool(cloudNode, node);
  } else {
    // Generic tool conversion
    convertGenericTool(cloudNode, node);
  }
  
  // Ensure all nodes have proper annotation
  ensureAnnotation(cloudNode);
  
  return cloudNode;
}

function convertInputTool(cloudNode: any, originalNode: any): void {
  // Ensure it's using UniversalInput
  cloudNode.GuiSettings["@Plugin"] = "AlteryxBasePluginsGui.UniversalInput.UniversalInput";
  
  cloudNode.EngineSettings = {
    "@EngineDll": "UniversalInputTool.dll",
    "@EngineDllEntryPoint": "UniversalInputTool"
  };
  
  const originalConfig = originalNode.Properties?.Configuration || {};
  
  // Normalize file format to CSV
  const fileInfo = normalizeInputFileFormat(originalConfig);
  
  // Log normalization result
  if (fileInfo.isExcel) {
    console.log(`✅ Excel file normalized: "${fileInfo.fileName}" → "${fileInfo.normalizedName}"`);
  } else if (!fileInfo.isCsv && fileInfo.extension) {
    console.log(`✅ File normalized to CSV: "${fileInfo.fileName}" → "${fileInfo.normalizedName}"`);
  } else {
    console.log(`ℹ️ File already CSV or no extension: "${fileInfo.normalizedName}"`);
  }
  
  // Create CSV-optimized configuration
  cloudNode.Properties = cloudNode.Properties || {};
  cloudNode.Properties.Configuration = createCsvConfiguration(fileInfo);
  
  // Preserve MetaInfo with proper field structure
  if (originalNode.Properties?.MetaInfo?.RecordInfo?.Field) {
    const fields = Array.isArray(originalNode.Properties.MetaInfo.RecordInfo.Field)
      ? originalNode.Properties.MetaInfo.RecordInfo.Field
      : [originalNode.Properties.MetaInfo.RecordInfo.Field];
    
    cloudNode.Properties.MetaInfo = {
      "@connection": "Output",
      "RecordInfo": {
        "Field": fields.map((field: any) => ({
          "@name": field["@name"],
          "@type": field["@type"] || "V_WString",
          "@size": field["@size"] || "254",
          "@trifactaType": "String"
        }))
      }
    };
  }
  
  cloudNode.Properties.Dependencies = { "Implicit": {} };
}

function convertOutputTool(cloudNode: any, originalNode: any): void {
  // Ensure it's using UniversalOutput
  cloudNode.GuiSettings["@Plugin"] = "AlteryxBasePluginsGui.UniversalOutput.UniversalOutput";
  
  cloudNode.EngineSettings = {
    "@EngineDll": "UniversalOutputTool.dll",
    "@EngineDllEntryPoint": "UniversalOutputTool"
  };
  
  const originalConfig = originalNode.Properties?.Configuration || {};
  
  // Normalize output file format to CSV as well
  const fileInfo = normalizeInputFileFormat(originalConfig);
  
  console.log(`📤 Output file normalized: "${fileInfo.fileName}" → "${fileInfo.normalizedName}"`);
  
  cloudNode.Properties = cloudNode.Properties || {};
  cloudNode.Properties.Configuration = {
    "__page": "LIST_CONNECTIONS",
    "DatasetId": "",
    "VendorName": "",
    "HasInferred": false,
    "ConnectionId": "",
    "__tableName": "",
    "__schemaName": "",
    "SampleFileUri": "",
    "ConnectionName": fileInfo.normalizedName,
    "__previousPage": "LIST_CONNECTIONS",
    "FileName": fileInfo.normalizedName,
    "Format": "csv",
    "Action": "create",
    "Header": true,
    "Delim": ",",
    "HasQuotes": true,
    "DatasetOriginator": true,
    "__needsDatasetSelection": true,
    "__originalFileName": fileInfo.fileName,
    "__normalizedFileName": fileInfo.normalizedName,
    "__wasExcelFile": fileInfo.isExcel
  };
  
  cloudNode.Properties.Dependencies = { "Implicit": {} };
}

function convertSelectTool(cloudNode: any, originalNode: any): void {
  cloudNode.EngineSettings = {
    "@EngineDll": "AlteryxBasePluginsEngine.dll",
    "@EngineDllEntryPoint": "AlteryxSelect"
  };
  
  cloudNode.Properties = cloudNode.Properties || {};
  
  // Preserve original configuration structure
  const originalConfig = originalNode.Properties?.Configuration || {};
  cloudNode.Properties.Configuration = JSON.parse(JSON.stringify(originalConfig));
  
  const config = cloudNode.Properties.Configuration;
  config.OrderChanged = config.OrderChanged || { "@value": "False" };
  config.CommaDecimal = config.CommaDecimal || { "@value": "False" };
  
  if (!config.SelectFields?.SelectField) {
    config.SelectFields = {
      SelectField: [{ "@field": "*Unknown", "@selected": "True" }]
    };
  } else {
    const fields = Array.isArray(config.SelectFields.SelectField)
      ? config.SelectFields.SelectField
      : [config.SelectFields.SelectField];
    config.SelectFields.SelectField = fields;
  }
  
  // Preserve original MetaInfo if exists
  if (originalNode.Properties?.MetaInfo) {
    cloudNode.Properties.MetaInfo = JSON.parse(JSON.stringify(originalNode.Properties.MetaInfo));
  } else {
    cloudNode.Properties.MetaInfo = {
      "@connection": "Output",
      "RecordInfo": { "Field": [] }
    };
  }
  
  cloudNode.Properties.Dependencies = { "Implicit": {} };
}

// 🆕 NEW: Filter Tool Converter
function convertFilterTool(cloudNode: any, originalNode: any): void {
  console.log(`🔍 Converting Filter tool (ID: ${cloudNode['@ToolID']})`);
  
  cloudNode.EngineSettings = {
    "@EngineDll": "AlteryxBasePluginsEngine.dll",
    "@EngineDllEntryPoint": "AlteryxFilter"
  };
  
  cloudNode.Properties = cloudNode.Properties || {};
  
  // Preserve original filter configuration
  if (originalNode.Properties?.Configuration) {
    cloudNode.Properties.Configuration = JSON.parse(JSON.stringify(originalNode.Properties.Configuration));
  } else {
    // Default filter configuration if missing
    cloudNode.Properties.Configuration = {
      Expression: {}
    };
  }
  
  // Preserve MetaInfo for both True and False outputs
  if (originalNode.Properties?.MetaInfo) {
    cloudNode.Properties.MetaInfo = JSON.parse(JSON.stringify(originalNode.Properties.MetaInfo));
  } else {
    // Create default MetaInfo for both outputs
    cloudNode.Properties.MetaInfo = [
      {
        "@connection": "True",
        "RecordInfo": { "Field": [] }
      },
      {
        "@connection": "False",
        "RecordInfo": { "Field": [] }
      }
    ];
  }
  
  cloudNode.Properties.Dependencies = { "Implicit": {} };
}

// 🆕 NEW: Formula Tool Converter
function convertFormulaTool(cloudNode: any, originalNode: any): void {
  console.log(`🔢 Converting Formula tool (ID: ${cloudNode['@ToolID']})`);
  
  cloudNode.EngineSettings = {
    "@EngineDll": "AlteryxBasePluginsEngine.dll",
    "@EngineDllEntryPoint": "AlteryxFormula"
  };
  
  cloudNode.Properties = cloudNode.Properties || {};
  
  // Preserve original formula configuration
  if (originalNode.Properties?.Configuration) {
    cloudNode.Properties.Configuration = JSON.parse(JSON.stringify(originalNode.Properties.Configuration));
    
    // Ensure FormulaFields exists
    const config = cloudNode.Properties.Configuration;
    if (!config.FormulaFields) {
      config.FormulaFields = { FormulaField: [] };
    } else if (config.FormulaFields.FormulaField) {
      // Ensure it's an array
      if (!Array.isArray(config.FormulaFields.FormulaField)) {
        config.FormulaFields.FormulaField = [config.FormulaFields.FormulaField];
      }
    }
  } else {
    // Default formula configuration
    cloudNode.Properties.Configuration = {
      FormulaFields: {
        FormulaField: []
      }
    };
  }
  
  // Preserve MetaInfo
  if (originalNode.Properties?.MetaInfo) {
    cloudNode.Properties.MetaInfo = JSON.parse(JSON.stringify(originalNode.Properties.MetaInfo));
  } else {
    cloudNode.Properties.MetaInfo = {
      "@connection": "Output",
      "RecordInfo": { "Field": [] }
    };
  }
  
  cloudNode.Properties.Dependencies = { "Implicit": {} };
}

// 🆕 NEW: Union Tool Converter
function convertUnionTool(cloudNode: any, originalNode: any): void {
  console.log(`🔗 Converting Union tool (ID: ${cloudNode['@ToolID']})`);
  
  cloudNode.EngineSettings = {
    "@EngineDll": "AlteryxBasePluginsEngine.dll",
    "@EngineDllEntryPoint": "AlteryxUnion"
  };
  
  cloudNode.Properties = cloudNode.Properties || {};
  
  // Preserve original union configuration
  if (originalNode.Properties?.Configuration) {
    cloudNode.Properties.Configuration = JSON.parse(JSON.stringify(originalNode.Properties.Configuration));
  } else {
    // Default union configuration
    cloudNode.Properties.Configuration = {
      "@ByName_ErrorMode": "Warning",
      "@ByName_OutputMode": "All",
      "@SetOutputOrder": "false"
    };
  }
  
  // Preserve MetaInfo
  if (originalNode.Properties?.MetaInfo) {
    cloudNode.Properties.MetaInfo = JSON.parse(JSON.stringify(originalNode.Properties.MetaInfo));
  } else {
    cloudNode.Properties.MetaInfo = {
      "@connection": "Output",
      "RecordInfo": { "Field": [] }
    };
  }
  
  cloudNode.Properties.Dependencies = { "Implicit": {} };
}

// 🆕 NEW: Join Tool Converter
function convertJoinTool(cloudNode: any, originalNode: any): void {
  console.log(`🔀 Converting Join tool (ID: ${cloudNode['@ToolID']})`);
  
  cloudNode.EngineSettings = {
    "@EngineDll": "AlteryxBasePluginsEngine.dll",
    "@EngineDllEntryPoint": "AlteryxJoin"
  };
  
  cloudNode.Properties = cloudNode.Properties || {};
  
  // Preserve original join configuration
  if (originalNode.Properties?.Configuration) {
    cloudNode.Properties.Configuration = JSON.parse(JSON.stringify(originalNode.Properties.Configuration));
    
    // Ensure JoinInfo is properly structured
    const config = cloudNode.Properties.Configuration;
    if (config.JoinInfo && !Array.isArray(config.JoinInfo)) {
      config.JoinInfo = [config.JoinInfo];
    }
  } else {
    // Default join configuration
    cloudNode.Properties.Configuration = {
      "@joinByRecordPos": "False",
      "JoinInfo": [],
      "SelectConfiguration": {
        "Configuration": {
          "@outputConnection": "Join",
          "OrderChanged": { "@value": "False" },
          "SelectFields": { "SelectField": [] }
        }
      }
    };
  }
  
  cloudNode.Properties.Dependencies = { "Implicit": {} };
}

// 🆕 NEW: Sort Tool Converter
function convertSortTool(cloudNode: any, originalNode: any): void {
  console.log(`📊 Converting Sort tool (ID: ${cloudNode['@ToolID']})`);
  
  cloudNode.EngineSettings = {
    "@EngineDll": "AlteryxBasePluginsEngine.dll",
    "@EngineDllEntryPoint": "AlteryxSort"
  };
  
  cloudNode.Properties = cloudNode.Properties || {};
  
  // Preserve original sort configuration
  if (originalNode.Properties?.Configuration) {
    cloudNode.Properties.Configuration = JSON.parse(JSON.stringify(originalNode.Properties.Configuration));
  } else {
    cloudNode.Properties.Configuration = {
      SortInfo: {
        Field: []
      }
    };
  }
  
  // Preserve MetaInfo
  if (originalNode.Properties?.MetaInfo) {
    cloudNode.Properties.MetaInfo = JSON.parse(JSON.stringify(originalNode.Properties.MetaInfo));
  } else {
    cloudNode.Properties.MetaInfo = {
      "@connection": "Output",
      "RecordInfo": { "Field": [] }
    };
  }
  
  cloudNode.Properties.Dependencies = { "Implicit": {} };
}

// 🆕 NEW: Summarize Tool Converter
function convertSummarizeTool(cloudNode: any, originalNode: any): void {
  console.log(`📈 Converting Summarize tool (ID: ${cloudNode['@ToolID']})`);
  
  cloudNode.EngineSettings = {
    "@EngineDll": "AlteryxBasePluginsEngine.dll",
    "@EngineDllEntryPoint": "AlteryxSummarize"
  };
  
  cloudNode.Properties = cloudNode.Properties || {};
  
  // Preserve original summarize configuration
  if (originalNode.Properties?.Configuration) {
    cloudNode.Properties.Configuration = JSON.parse(JSON.stringify(originalNode.Properties.Configuration));
  } else {
    cloudNode.Properties.Configuration = {
      SummarizeFields: {
        SummarizeField: []
      }
    };
  }
  
  // Preserve MetaInfo
  if (originalNode.Properties?.MetaInfo) {
    cloudNode.Properties.MetaInfo = JSON.parse(JSON.stringify(originalNode.Properties.MetaInfo));
  } else {
    cloudNode.Properties.MetaInfo = {
      "@connection": "Output",
      "RecordInfo": { "Field": [] }
    };
  }
  
  cloudNode.Properties.Dependencies = { "Implicit": {} };
}

// 🆕 NEW: Container Tool Converter
function convertContainerTool(cloudNode: any, originalNode: any): void {
  console.log(`📦 Converting Container tool (ID: ${cloudNode['@ToolID']})`);
  
  // Containers don't have EngineSettings
  
  cloudNode.Properties = cloudNode.Properties || {};
  
  // Preserve original container configuration
  if (originalNode.Properties?.Configuration) {
    cloudNode.Properties.Configuration = JSON.parse(JSON.stringify(originalNode.Properties.Configuration));
  } else {
    cloudNode.Properties.Configuration = {
      Caption: "Container",
      Style: {
        "@TextColor": "#314c4a",
        "@FillColor": "#ecf2f2",
        "@BorderColor": "#314c4a",
        "@Transparency": "25",
        "@Margin": "25"
      },
      Disabled: { "@value": "False" },
      Folded: { "@value": "False" }
    };
  }
  
  cloudNode.Properties.Dependencies = { "Implicit": {} };
}

function convertGenericTool(cloudNode: any, originalNode: any): void {
  console.log(`⚙️ Converting Generic tool (ID: ${cloudNode['@ToolID']})`);
  
  // Preserve original configuration for generic tools
  if (originalNode.Properties?.Configuration) {
    cloudNode.Properties = cloudNode.Properties || {};
    cloudNode.Properties.Configuration = JSON.parse(JSON.stringify(originalNode.Properties.Configuration));
  }
  
  // Preserve MetaInfo if exists
  if (originalNode.Properties?.MetaInfo) {
    cloudNode.Properties = cloudNode.Properties || {};
    cloudNode.Properties.MetaInfo = JSON.parse(JSON.stringify(originalNode.Properties.MetaInfo));
  }
  
  // Preserve EngineSettings if exists
  if (originalNode.EngineSettings) {
    cloudNode.EngineSettings = JSON.parse(JSON.stringify(originalNode.EngineSettings));
  }
  
  cloudNode.Properties = cloudNode.Properties || {};
  cloudNode.Properties.Dependencies = { "Implicit": {} };
}

function ensureAnnotation(cloudNode: any): void {
  if (!cloudNode.Properties) cloudNode.Properties = {};
  if (!cloudNode.Properties.Annotation) {
    cloudNode.Properties.Annotation = {
      "@DisplayMode": "0",
      "Name": {},
      "DefaultAnnotationText": "",
      "Left": { "@value": "False" }
    };
  }
}

function extractFileName(config: any, defaultName: string = "input"): string {
  // This function is now deprecated in favor of normalizeInputFileFormat
  // Kept for backward compatibility
  const fileInfo = normalizeInputFileFormat(config);
  return fileInfo.normalizedName || defaultName;
}

function removeCycles(connections: any[]): any[] {
  const validConnections: any[] = [];
  const edges = new Set<string>();
  
  // Simple cycle prevention: track all edges
  connections.forEach(conn => {
    const from = conn.Origin?.["@ToolID"];
    const to = conn.Destination?.["@ToolID"];
    
    if (from && to && from !== to) { // Prevent self-loops
      const edge = `${from}->${to}`;
      const reverseEdge = `${to}->${from}`;
      
      // Don't add if reverse connection already exists (prevents simple cycles)
      if (!edges.has(reverseEdge)) {
        edges.add(edge);
        validConnections.push(conn);
      } else {
        console.warn(`Removing potential cycle: ${from} → ${to}`);
      }
    }
  });
  
  return validConnections;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Export all functions
export {
  convertXmlToJson,
  detectFileType,
  xmlToJson,
  normalizeInputFileFormat,
  createCsvConfiguration
};