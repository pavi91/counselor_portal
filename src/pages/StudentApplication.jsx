// src/pages/StudentApplication.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as applicationApi from '../api/applicationApi';

const StudentApplication = () => {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // --- 1. Identity & Contact ---
    indexNumber: '',
    fullName: '',
    nameWithInitials: '',
    permanentAddress: '',
    residentPhone: '',
    mobilePhone: '',
    email: user?.email || '',
    gender: 'male',

    // --- 2. Residence ---
    district: 'Colombo',
    closestTown: '',
    distanceToTown: '', 
    distance: '',       
    walkingDistance: '', 

    // --- 3. Academic ---
    faculty: '',
    department: '',
    year: 'first_year',
    misconduct: 'no',

    // --- 4. Financial / Bursary ---
    isMahapolaRecipient: 'no', 
    bursaryAmount: '',

    // --- 5. Siblings ---
    siblingsSchool: '0', 
    siblingsUni: '0',
    sibling1Name: '', sibling1School: '', sibling1Grade: '',
    sibling2Name: '', sibling2School: '', sibling2Grade: '',
    siblingDisability: 'no',
    siblingDisabilityDetails: '',

    // --- 6. Family Income & Parents ---
    motherAlive: 'yes',
    fatherAlive: 'yes',
    guardianAlive: 'no',
    parentDisability: 'no', 
    parentDisabilityDetails: '',
    motherOccupation: '', fatherOccupation: '', guardianOccupation: '',
    motherIncome: '', fatherIncome: '', guardianIncome: '',
    incomeRange: 'below_100k', 
    isSamurdhiRecipient: 'no', 

    // --- 7. Hostel History ---
    prevHostel: 'no',
    prevHostelYears: '',

    // --- 8. Emergency Contact ---
    emergencyName: '',
    emergencyAddress: '',
    emergencyMobile: '',
    emergencyResidence: '',

    // --- 9. Extra Curricular ---
    isCaptain: 'no', 
    captainTeam: '',
    isMember: 'no',  
    memberTeam: '',
    hasColours: 'no', 
    coloursDetails: '',

    // --- 10. Other ---
    specialReasons: '',
    hostelPref: '',

    // --- 11. FILES / PROOFS (NEW) ---
    file_residence: null,       // GN Certificate
    file_income: null,          // Salary/GN Income Cert
    file_siblings: null,        // School/Uni Letters
    file_siblingMedical: null,  // Sibling Disability
    file_parentDeath: null,     // Death Cert
    file_parentMedical: null,   // Parent Disability
    file_samurdhi: null,        // Samurdhi Card
    file_sports: null,          // Sports Certs
    file_special: null          // Special Reasons Docs
  });

  useEffect(() => {
    loadMyApplication();
  }, []);

  const loadMyApplication = async () => {
    try {
      const data = await applicationApi.getMyApplicationAPI(user.id);
      setApplication(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      // For mock purposes, we store the file name. 
      // In a real app, you'd store the file object or upload it immediately.
      setFormData(prev => ({ ...prev, [name]: files[0] ? files[0].name : '' }));
    } else {
      setFormData(prev => ({ 
          ...prev, 
          [name]: type === 'checkbox' ? (checked ? 'yes' : 'no') : value 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applicationApi.submitApplicationAPI(user.id, formData);
      await loadMyApplication();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for conditional file inputs
  const FileInput = ({ label, name, required = false }) => (
    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
      <label className="block text-sm font-medium mb-1 dark:text-slate-300">
        📎 {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type="file" 
        name={name} 
        onChange={handleChange} 
        required={required}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200"
      />
      {formData[name] && <p className="text-xs text-green-600 mt-1">Selected: {formData[name]}</p>}
    </div>
  );

  const getHostelOptions = () => {
    const { gender, year } = formData;
    if (gender === 'male') {
      if (year === 'final_year') return ['A Hostel', 'Patuwathawithana Hostel', 'Hostel Village Complex'];
      if (year === 'first_year') return ['First Lane', 'Rahula Mawatha'];
    } else {
      if (year === 'final_year') return ['Nugasewana -1', 'Nugasewana -2'];
      if (year === 'first_year') return ['B Hostel', 'C Hostel'];
    }
    return ['General Hostel']; 
  };

  if (loading) return <div className="p-8 text-center">Loading status...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Hostel Application Form</h1>

      {application ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm text-center">
           <div className="inline-block p-4 rounded-full bg-blue-50 text-blue-600 mb-4">
              <span className="text-4xl font-bold">{application.points}</span>
              <span className="block text-xs uppercase font-bold mt-1">Total Score</span>
           </div>
           <div className="mb-6">
            <span className={`px-4 py-2 rounded-full uppercase font-bold text-sm
              ${application.status === 'approved' ? 'bg-green-100 text-green-700' : 
                application.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                'bg-yellow-100 text-yellow-700'}`}>
              Status: {application.status}
            </span>
          </div>
          <p className="text-slate-500">Submitted on {application.submissionDate}</p>
          {application.status === 'approved' && (
             <p className="mt-4 text-green-600 font-medium">Allocated Hostel: {application.hostelPref}</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* --- SECTION 1: IDENTITY --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">1. Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Name in Full</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Index Number</label>
                    <input type="text" name="indexNumber" required value={formData.indexNumber} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Permanent Address</label>
                    <input type="text" name="permanentAddress" required value={formData.permanentAddress} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Mobile Tel</label>
                    <input type="tel" name="mobilePhone" required value={formData.mobilePhone} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Email</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
            </div>
          </div>

          {/* --- SECTION 2: RESIDENCE --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">2. Residence Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">District</label>
                    <select name="district" value={formData.district} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <option value="Colombo">Colombo</option>
                        <option value="Gampaha">Gampaha</option>
                        <option value="Kandy">Kandy</option>
                        <option value="Galle">Galle</option>
                        <option value="Matara">Matara</option>
                        {/* Add other districts... */}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Distance to University (Km)</label>
                    <input type="number" name="distance" required min="0" value={formData.distance} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
            </div>
            
            {/* PROOF 1: RESIDENCE */}
            <FileInput 
              name="file_residence" 
              label="Grama Niladhari Certificate (Residence Proof)" 
              required 
            />
          </div>

          {/* --- SECTION 3: ACADEMIC --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">3. Academic & Financial</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Faculty</label>
                    <input type="text" name="faculty" required value={formData.faculty} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Year</label>
                    <select name="year" value={formData.year} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <option value="first_year">First Year</option>
                        <option value="second_year">Second Year</option>
                        <option value="third_year">Third Year</option>
                        <option value="final_year">Final Year</option>
                    </select>
                 </div>
            </div>
          </div>

          {/* --- SECTION 4: INCOME & FAMILY --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">4. Family & Income</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Annual Family Income</label>
                    <select name="incomeRange" value={formData.incomeRange} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <option value="below_100k">100,000 or below</option>
                        <option value="100k_150k">100,000 - 150,000</option>
                        <option value="above_450k">450,000 or above</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Samurdhi Recipient?</label>
                    <select name="isSamurdhiRecipient" value={formData.isSamurdhiRecipient} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>
            </div>

            {/* PROOF 6: INCOME */}
            <FileInput 
              name="file_income" 
              label="Salary Statement or GN Income Certificate" 
              required 
            />

            {/* PROOF 7: SAMURDHI */}
            {formData.isSamurdhiRecipient === 'yes' && (
                <FileInput name="file_samurdhi" label="Copy of Samurdhi Card" required />
            )}

            <div className="mt-6 border-t pt-4 dark:border-slate-700">
                 <h4 className="font-semibold text-sm dark:text-slate-300 mb-3">Parental Status</h4>
                 <div className="flex gap-6 mb-2">
                    <label className="block text-sm dark:text-slate-300">Mother Alive?</label>
                    <select name="motherAlive" value={formData.motherAlive} onChange={handleChange} className="p-1 border rounded dark:bg-slate-900 dark:border-slate-600">
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                    
                    <label className="block text-sm dark:text-slate-300">Father Alive?</label>
                    <select name="fatherAlive" value={formData.fatherAlive} onChange={handleChange} className="p-1 border rounded dark:bg-slate-900 dark:border-slate-600">
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                 </div>

                 {/* PROOF 4: DEATH CERT */}
                 {(formData.motherAlive === 'no' || formData.fatherAlive === 'no') && (
                    <FileInput name="file_parentDeath" label="Death Certificate(s)" required />
                 )}

                 <div className="mt-4">
                     <label className="block text-sm font-medium mb-1 dark:text-slate-300">Parent with disability/illness?</label>
                     <select name="parentDisability" value={formData.parentDisability} onChange={handleChange} className="w-full md:w-1/4 p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                     </select>
                     {/* PROOF 5: PARENT MEDICAL */}
                     {formData.parentDisability === 'yes' && (
                        <FileInput name="file_parentMedical" label="Parent Medical Certificates" required />
                     )}
                 </div>
            </div>
          </div>

          {/* --- SECTION 5: SIBLINGS --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">5. Siblings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Siblings in School</label>
                    <select name="siblingsSchool" value={formData.siblingsSchool} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <option value="0">None</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3 or more</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Siblings in University</label>
                    <select name="siblingsUni" value={formData.siblingsUni} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <option value="0">None</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3 or more</option>
                    </select>
                 </div>
            </div>

            {/* PROOF 2: SIBLING STUDY */}
            {(parseInt(formData.siblingsSchool) > 0 || parseInt(formData.siblingsUni) > 0) && (
                <FileInput name="file_siblings" label="School/University Letters (Principal/Registrar)" required />
            )}

            <div className="mt-4">
                 <label className="block text-sm font-medium mb-1 dark:text-slate-300">Sibling with disability?</label>
                 <select name="siblingDisability" value={formData.siblingDisability} onChange={handleChange} className="w-full md:w-1/4 p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                 </select>
                 {/* PROOF 3: SIBLING MEDICAL */}
                 {formData.siblingDisability === 'yes' && (
                    <FileInput name="file_siblingMedical" label="Sibling Medical Certificates" required />
                 )}
            </div>
          </div>

          {/* --- SECTION 6: SPORTS --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">6. Sports & Extra Curricular</h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium dark:text-slate-300">University Captain / Member / Colours?</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <label className="flex items-center gap-2 dark:text-slate-400">
                             <input type="checkbox" checked={formData.isCaptain === 'yes'} onChange={e => setFormData({...formData, isCaptain: e.target.checked ? 'yes' : 'no'})} /> Captain
                        </label>
                        <label className="flex items-center gap-2 dark:text-slate-400">
                             <input type="checkbox" checked={formData.isMember === 'yes'} onChange={e => setFormData({...formData, isMember: e.target.checked ? 'yes' : 'no'})} /> Member
                        </label>
                        <label className="flex items-center gap-2 dark:text-slate-400">
                             <input type="checkbox" checked={formData.hasColours === 'yes'} onChange={e => setFormData({...formData, hasColours: e.target.checked ? 'yes' : 'no'})} /> Colours
                        </label>
                    </div>
                </div>

                {/* PROOF 8: SPORTS */}
                {(formData.isCaptain === 'yes' || formData.isMember === 'yes' || formData.hasColours === 'yes') && (
                    <FileInput name="file_sports" label="Sports Certificates/Letters" required />
                )}
            </div>
          </div>

          {/* --- SECTION 7: SUBMISSION --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">7. Final Submission</h2>
            
            <div className="mb-4">
                 <label className="block text-sm font-medium mb-1 dark:text-slate-300">Special Reasons (Optional)</label>
                 <textarea name="specialReasons" value={formData.specialReasons} onChange={handleChange} rows="3" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"></textarea>
                 
                 {/* PROOF 9: SPECIAL REASONS */}
                 {formData.specialReasons && (
                    <FileInput name="file_special" label="Supporting Documents for Special Reasons" />
                 )}
            </div>

            <div className="mb-6">
               <label className="block text-sm font-medium mb-1 dark:text-slate-300">Preferred Hostel</label>
               <select name="hostelPref" value={formData.hostelPref} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                  <option value="">-- Select Preference --</option>
                  {getHostelOptions().map(hostel => (
                     <option key={hostel} value={hostel}>{hostel}</option>
                  ))}
               </select>
            </div>

            <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition disabled:opacity-50"
            >
                {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StudentApplication;