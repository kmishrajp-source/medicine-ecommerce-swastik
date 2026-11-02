const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'Marketplace', 'HealthMartRFQModal.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add state variables
const stateTarget = `  const [categoryData, setCategoryData] = useState({});
  const [submitting, setSubmitting] = useState(false);`;

const stateRepl = `  const [categoryData, setCategoryData] = useState({});
  const [prescriptionUrl, setPrescriptionUrl] = useState("");
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);`;

// 2. Add handlePrescriptionUpload
const helperTarget = `  const handleCategoryFieldChange = (fieldName, value) => {
    setCategoryData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };`;

const helperRepl = `  const handleCategoryFieldChange = (fieldName, value) => {
    setCategoryData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handlePrescriptionUpload = async (file) => {
    if (!file) return;
    setUploadingPrescription(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setUploadError(data.error || "Failed to upload prescription");
      } else {
        setPrescriptionUrl(data.url);
        setCategoryData(prev => ({ ...prev, prescriptionUrl: data.url, prescriptionFilename: file.name }));
      }
    } catch (err) {
      setUploadError("Error connecting to upload server");
    } finally {
      setUploadingPrescription(false);
    }
  };`;

// 3. Add UI component after Category Specifications
const uiTarget = `              {/* Requirement Title & Details */}`;

const uiRepl = `              {/* Doctor's Prescription Attachment (Prescription Medicines) */}
              {(selectedCategorySlug === "pharmacy-and-medicines" || selectedCategory.serviceType === "pharmacy" || categoryData.prescriptionAvailable?.includes("Yes")) && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <i className="fa-solid fa-file-prescription text-emerald-600"></i> Doctor's Prescription (Optional / Schedule H Rx)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      CDSCO Compliant
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Upload a valid prescription photo or PDF if requesting prescription-grade pharmaceuticals.
                  </p>
                  
                  {prescriptionUrl ? (
                    <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-300 rounded-xl">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
                        <span className="text-xs font-bold text-slate-800 truncate">Prescription Attached</span>
                        <a href={prescriptionUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-indigo-600 underline font-semibold ml-2">
                          View File
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPrescriptionUrl(""); handleCategoryFieldChange("prescriptionUrl", ""); }}
                        className="text-xs text-red-500 hover:text-red-700 p-1"
                        title="Remove prescription"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        disabled={uploadingPrescription}
                        onChange={(e) => handlePrescriptionUpload(e.target.files?.[0])}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer bg-white p-2 border border-slate-200 rounded-xl"
                      />
                      {uploadingPrescription && (
                        <div className="mt-1 text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                          <i className="fa-solid fa-circle-notch fa-spin"></i> Uploading prescription securely...
                        </div>
                      )}
                      {uploadError && (
                        <div className="mt-1 text-xs text-red-600 font-semibold">
                          {uploadError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Requirement Title & Details */}`;

if (!code.includes('handlePrescriptionUpload')) {
  const normCode = code.replace(/\r\n/g, '\n');
  let updated = normCode.replace(stateTarget.replace(/\r\n/g, '\n'), stateRepl);
  updated = updated.replace(helperTarget.replace(/\r\n/g, '\n'), helperRepl);
  updated = updated.replace(uiTarget.replace(/\r\n/g, '\n'), uiRepl);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('HealthMartRFQModal.js patched successfully with prescription upload!');
} else {
  console.log('Already patched.');
}

