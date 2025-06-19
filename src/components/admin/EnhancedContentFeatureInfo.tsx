import React from "react";
import { CheckCircle } from "lucide-react";

const EnhancedContentFeatureInfo = () => (
  <div
    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
    role="region"
    aria-label="Enhanced Content Management Features"
  >
    <h4 className="font-medium text-blue-900 mb-2">
      Enhanced Content Management Features
    </h4>
    <ul className="text-sm text-blue-700 space-y-1">
      <li>
        • <CheckCircle className="w-3 h-3 inline mr-1" aria-hidden="true" />{" "}
        Automatic duplicate detection prevents re-uploads
      </li>
      <li>
        • <CheckCircle className="w-3 h-3 inline mr-1" aria-hidden="true" />{" "}
        Content categorization and tagging system
      </li>
      <li>
        • <CheckCircle className="w-3 h-3 inline mr-1" aria-hidden="true" />{" "}
        Built-in approval workflow - all content needs review
      </li>
      <li>
        • <CheckCircle className="w-3 h-3 inline mr-1" aria-hidden="true" />{" "}
        Media optimization for different screen sizes
      </li>
      <li>
        • <CheckCircle className="w-3 h-3 inline mr-1" aria-hidden="true" />{" "}
        Content scheduling for future publication
      </li>
      <li>
        • <CheckCircle className="w-3 h-3 inline mr-1" aria-hidden="true" />{" "}
        Comprehensive edit and delete controls
      </li>
    </ul>
    <div className="mt-3 text-xs text-blue-700">
      <span aria-live="polite">
        For help, contact admin@yourapp.com or check the admin dashboard guide.
      </span>
    </div>
  </div>
);

export default EnhancedContentFeatureInfo;
