// Direct fix for Cloud icons - copy exact working structure
export function createWorkingCloudJSON() {
  return {
    "name": "xmlconverstion",
    "content": {
      "@yxmdVer": "2021.4",
      "@RunE2": "T",
      "Nodes": {
        "Node": [
          {
            "@ToolID": "1",
            "GuiSettings": {
              "@Plugin": "AlteryxBasePluginsGui.UniversalInput.UniversalInput",
              "@X": "210",
              "@Y": "174"
            },
            "Properties": {
              "Configuration": {
                "SampleFileUri": "tfs://trinitetech-alteryx-trial-lhsa/empdata.csv",
                "DatasetId": "560409"
              },
              "Annotation": {
                "@DisplayMode": "0",
                "@AnnotationText": "empdata.csv",
                "@DefaultAnnotationText": "empdata.csv",
                "@FontSize": "-1",
                "@FontName": "Arial",
                "@FontColor": "0"
              }
            },
            "EngineSettings": {
              "@EngineDll": "UniversalInputTool.dll",
              "@EngineDllEntryPoint": "UniversalInputTool"
            }
          },
          {
            "@ToolID": "2", 
            "GuiSettings": {
              "@Plugin": "AlteryxBasePluginsGui.UniversalOutput.UniversalOutput",
              "@X": "342",
              "@Y": "174"
            },
            "Properties": {
              "Configuration": {
                "Path": "tfs://trinitetech-alteryx-trial-lhsa/output.csv",
                "DatasetId": "560410",
                "Format": "csv",
                "Action": "create"
              },
              "Annotation": {
                "@DisplayMode": "0", 
                "@AnnotationText": "output.csv",
                "@DefaultAnnotationText": "output.csv",
                "@FontSize": "-1",
                "@FontName": "Arial",
                "@FontColor": "0"
              }
            },
            "EngineSettings": {
              "@EngineDll": "UniversalOutputTool.dll",
              "@EngineDllEntryPoint": "UniversalOutputTool"
            }
          }
        ]
      },
      "Connections": {
        "Connection": [
          {
            "Origin": {
              "@ToolID": "1",
              "@Connection": "Output"
            },
            "Destination": {
              "@ToolID": "2", 
              "@Connection": "Input"
            }
          }
        ]
      },
      "Properties": {
        "Memory": { "@default": "True" },
        "GlobalRecordLimit": { "@value": "0" },
        "TempFiles": { "@default": "True" },
        "Annotation": { "@on": "True", "@includeToolName": "False" },
        "ConvErrorLimit": { "@value": "10" },
        "ConvErrorLimit_Stop": { "@value": "False" },
        "CancelOnError": { "@value": "False" },
        "DisableBrowse": { "@value": "False" },
        "EnablePerformanceProfiling": { "@value": "False" },
        "RunWithE2": { "@value": "True" },
        "WorkflowMode": { "@value": "standard" },
        "CloudDisableAutorename": { "@value": "True" }
      }
    }
  };
}