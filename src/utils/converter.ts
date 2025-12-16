import { convertXmlToJson as baseConvert, detectFileType as baseDetect } from './xmlToJsonConverter';
import { parseAlteryxWorkflow } from './workflowConverter';

export function detectFileType(content: string): 'yxmd' | 'generic' {
  if (content.includes('AlteryxDocument') || content.includes('yxmdVer')) {
    return 'yxmd';
  }
  return 'generic';
}

export async function convertXmlToJson(
  xmlString: string, 
  options?: { 
    preserveAttributes?: boolean; 
    outputFormat?: string;
    filterParams?: {
      excludeNodes?: string[];
      includeOnlyNodes?: string[];
      removeAttributes?: string[];
    }
  }
): Promise<string> {
  let processedXml = xmlString;
  
  // Apply filtering if parameters provided
  if (options?.filterParams) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(processedXml, 'text/xml');
    
    // Exclude specific nodes
    if (options.filterParams.excludeNodes?.length) {
      options.filterParams.excludeNodes.forEach(nodeName => {
        const nodes = doc.getElementsByTagName(nodeName);
        Array.from(nodes).forEach(node => node.remove());
      });
    }
    
    // Remove specific attributes
    if (options.filterParams.removeAttributes?.length) {
      const allElements = doc.getElementsByTagName('*');
      Array.from(allElements).forEach(element => {
        options.filterParams!.removeAttributes!.forEach(attrName => {
          element.removeAttribute(attrName.replace('@', ''));
        });
      });
    }
    
    processedXml = new XMLSerializer().serializeToString(doc);
  }
  
  return baseConvert(processedXml);
}

export function validateXmlSyntax(xml: string): Array<{line: number, message: string}> {
  const errors: Array<{line: number, message: string}> = [];
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const parserError = doc.querySelector('parsererror');
    
    if (parserError) {
      errors.push({
        line: 1,
        message: parserError.textContent || 'XML parsing error'
      });
    }
  } catch (error) {
    errors.push({
      line: 1,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return errors;
}