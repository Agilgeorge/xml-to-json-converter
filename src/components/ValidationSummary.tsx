import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Dataset } from './DatasetManager';

interface ValidationSummaryProps {
  workflowName: string;
  datasets: Dataset[];
  xmlInput: string;
}

export function ValidationSummary({ workflowName, datasets, xmlInput }: ValidationSummaryProps) {
  const checks = [
    {
      label: 'Workflow Name',
      valid: workflowName.trim().length > 0,
      message: workflowName.trim() ? `"${workflowName}"` : 'Required'
    },
    {
      label: 'XML Content',
      valid: xmlInput.trim().length > 0,
      message: xmlInput.trim() ? 'Provided' : 'Required'
    },
    {
      label: 'Datasets',
      valid: datasets.length > 0,
      message: datasets.length > 0 ? `${datasets.length} dataset(s)` : 'At least 1 required'
    },
    {
      label: 'Dataset Fields Complete',
      valid: datasets.length > 0 && datasets.every(d => d.name.trim() && d.datasetId.trim() && d.path.trim()),
      message: datasets.length === 0 ? 'No datasets added' : 
               datasets.every(d => d.name.trim() && d.datasetId.trim() && d.path.trim()) ? 
               'All fields complete' : 'Some fields missing'
    }
  ];

  const allValid = checks.every(check => check.valid);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        {allValid ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-400" />
        )}
        Validation Summary
      </h3>
      
      <div className="space-y-3">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-300">{check.label}</span>
            <div className="flex items-center gap-2">
              {check.valid ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${check.valid ? 'text-green-400' : 'text-red-400'}`}>
                {check.message}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {allValid && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
          <p className="text-green-300 text-sm">✓ Ready for conversion</p>
        </div>
      )}
    </div>
  );
}