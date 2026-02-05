// src/pages/StudentApplication.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as applicationApi from '../api/applicationApi';
import * as userApi from '../api/userApi';
import * as hostelApi from '../api/hostelApi';

const StudentApplication = () => {
  const { user } = useAuth(); // Now contains full details from login
  const [application, setApplication] = useState(null);
  const [hostelAllocation, setHostelAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hostelOptions, setHostelOptions] = useState([]);
  const [hostelOptionsLoading, setHostelOptionsLoading] = useState(false);

  console.log('User Profile:', user);

  // Initialize form with User Profile Data
  const [formData, setFormData] = useState({
    // --- 1. Identity & Contact (PRE-FILLED) ---
    indexNumber: user?.indexNumber || '',
    fullName: user?.fullName || '',
    nameWithInitials: user?.nameWithInitials || '',
    permanentAddress: user?.permanentAddress || '',
    residentPhone: user?.residentPhone || '',
    mobilePhone: user?.mobilePhone || '',
    email: user?.email || '',
    gender: user?.gender || 'male',

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
    
    // --- Financial ---
    isMahapolaRecipient: 'no', 
    bursaryAmount: '', 

    // --- 4. Family ---
    motherAlive: 'yes',
    motherName: '', motherAge: '', motherOccupation: '', motherIncome: '',
    fatherAlive: 'yes',
    fatherName: '', fatherAge: '', fatherOccupation: '', fatherIncome: '',
    guardianAlive: 'no',
    guardianName: '', guardianAge: '', guardianOccupation: '', guardianIncome: '',
    
    incomeRange: 'below_100k', 
    isSamurdhiRecipient: 'no', 
    parentDisability: 'no', 

    // --- 5. Siblings ---
    siblingsSchool: '0', 
    siblingsUni: '0',
    sibling1Name: '', sibling1Type: 'School', sibling1Info: '',
    sibling2Name: '', sibling2Type: 'School', sibling2Info: '',
    sibling3Name: '', sibling3Type: 'School', sibling3Info: '',
    siblingDisability: 'no',

    // --- 6. Emergency ---
    emergencyName: '',
    emergencyAddress: '',
    emergencyMobile: '',
    emergencyResidence: '',

    // --- 7. Extra Curricular ---
    isCaptain: 'no', captainTeam: '', captainYear: '',
    isMember: 'no',  memberTeam: '', memberYear: '',
    hasColours: 'no', coloursDetails: '',

    // --- 8. Submission ---
    specialReasons: '',
    hostelPref: '',

    // --- FILES ---
    file_residence: null, file_income: null, file_siblings: null,
    file_siblingMedical: null, file_parentDeath: null, file_parentMedical: null,
    file_samurdhi: null, file_sports: null, file_special: null
  });

  useEffect(() => {
    loadMyApplication();
    loadMyProfile();
  }, []);

  const loadMyProfile = async () => {
    try {
      const profile = await userApi.getMyProfileAPI();
      if (profile) {
        setFormData(prev => ({
          ...prev,
          indexNumber: profile.index_number || profile.indexNumber || prev.indexNumber || '',
          fullName: profile.full_name || profile.fullName || prev.fullName || '',
          nameWithInitials: profile.name_with_initials || profile.nameWithInitials || prev.nameWithInitials || '',
          permanentAddress: profile.permanent_address || profile.permanentAddress || prev.permanentAddress || '',
          residentPhone: profile.resident_phone || profile.residentPhone || prev.residentPhone || '',
          mobilePhone: profile.mobile_phone || profile.mobilePhone || prev.mobilePhone || '',
          email: profile.email || prev.email || '',
          gender: profile.gender || prev.gender || 'male'
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      ...prev,
      indexNumber: user.indexNumber || prev.indexNumber || '',
      fullName: user.fullName || prev.fullName || '',
      nameWithInitials: user.nameWithInitials || prev.nameWithInitials || '',
      permanentAddress: user.permanentAddress || prev.permanentAddress || '',
      residentPhone: user.residentPhone || prev.residentPhone || '',
      mobilePhone: user.mobilePhone || prev.mobilePhone || '',
      email: user.email || prev.email || '',
      gender: user.gender || prev.gender || 'male'
    }));
  }, [user]);

  useEffect(() => {
    const fetchHostels = async () => {
      setHostelOptionsLoading(true);
      try {
        const options = await hostelApi.getHostelsAPI({
          gender: formData.gender,
          year: formData.year
        });
        setHostelOptions(options || []);
      } catch (err) {
        console.error(err);
        setHostelOptions([]);
      } finally {
        setHostelOptionsLoading(false);
      }
    };

    if (!formData.gender || !formData.year) return;
    fetchHostels();
  }, [formData.gender, formData.year]);

  useEffect(() => {
    if (formData.hostelPref && !hostelOptions.includes(formData.hostelPref)) {
      setFormData(prev => ({ ...prev, hostelPref: '' }));
    }
  }, [hostelOptions]);

  const loadMyApplication = async () => {
    try {
      const data = await applicationApi.getMyApplicationAPI(user.id);
      if (data) setApplication(data);
      
      // Load hostel allocation if exists
      try {
        const allocation = await hostelApi.getStudentHostelDetailsAPI(user.id);
        if (allocation) setHostelAllocation(allocation);
      } catch (err) {
        // No allocation found, that's okay
        console.log('No hostel allocation found');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files && files[0] ? files[0] : null }));
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
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val === null || val === undefined) return;
        if (val instanceof File) {
          formPayload.append(key, val);
        } else {
          formPayload.append(key, val);
        }
      });
      await applicationApi.submitApplicationAPI(user.id, formPayload);
      await loadMyApplication();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const FileInput = ({ label, name, required = false }) => (
    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
      <label className="block text-sm font-medium mb-1 dark:text-slate-300">
        📎 {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type="file" name={name} onChange={handleChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200"/>
      {formData[name] && <p className="text-xs text-green-600 mt-1">✓ Selected: {formData[name]?.name || formData[name]}</p>}
    </div>
  );

  const totalSiblings = parseInt(formData.siblingsSchool || 0) + parseInt(formData.siblingsUni || 0);

  if (loading) return <div className="p-8 text-center">Loading status...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Hostel Application Form</h1>

      {application ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm text-center">
            <div className="mb-6">
              <span className={`px-4 py-2 rounded-full uppercase font-bold text-sm ${application.status === 'approved' ? 'bg-green-100 text-green-700' : application.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                Status: {application.status}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">Submitted on {new Date(application.submission_date || application.submissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            {application.status === 'pending' && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-4">
                ℹ️ Your application is under review. You cannot submit a new application while one is pending.
              </p>
            )}
          </div>

          {/* Hostel Allocation Info */}
          {hostelAllocation && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-600 text-white rounded-full">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Room Allocated</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">You have been assigned a hostel room</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Room Number</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{hostelAllocation.roomNumber}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Floor</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{hostelAllocation.floor}</p>
                </div>
                {hostelAllocation.startDate && (
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Start Date</p>
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">{hostelAllocation.startDate}</p>
                  </div>
                )}
                {hostelAllocation.endDate && (
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">End Date</p>
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">{hostelAllocation.endDate}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!hostelAllocation && application.status === 'approved' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⏳ Your application has been approved! Room allocation is pending.
              </p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* --- SECTION 1: IDENTITY (Pre-filled mostly) --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">1. Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Name in Full</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Name with Initials</label>
                    <input type="text" name="nameWithInitials" required value={formData.nameWithInitials} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
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
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Mobile Phone</label>
                    <input type="tel" name="mobilePhone" required value={formData.mobilePhone} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Residence Phone</label>
                    <input type="tel" name="residentPhone" value={formData.residentPhone} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
            </div>
          </div>

          {/* ... (Keep Sections 2 - 8 exactly as they were in the previous step) ... */}
          {/* I will omit repeating Sections 2-8 here to save space, assuming they remain unchanged from the previous file content I generated. 
              The key change is the initial state in useState and the rendering of Section 1 above. */}
          
          {/* Re-inserting Section 2 just to ensure context continuity if you copy-paste the whole block */}
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
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Closest Town</label>
                    <input type="text" name="closestTown" required value={formData.closestTown} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Distance to Town (Km)</label>
                    <input type="number" name="distanceToTown" required min="0" value={formData.distanceToTown} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Distance to University (Km)</label>
                    <input type="number" name="distance" required min="0" value={formData.distance} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Walking distance from bus stop (Km)</label>
                    <input type="number" name="walkingDistance" min="0" step="0.1" value={formData.walkingDistance} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
            </div>
            <FileInput name="file_residence" label="Grama Niladhari Certificate" required />
          </div>

          {/* ... (Include Sections 3, 4, 5, 6, 7, 8 from previous response) ... */}
          {/* For brevity, please refer to the complete file content in the previous step for Sections 3-8 as they don't change logic, only data entry */ }
          
           {/* --- SECTION 3: ACADEMIC --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">3. Academic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Faculty</label>
                    <input type="text" name="faculty" required value={formData.faculty} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Department</label>
                    <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
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
            <div className="mt-4">
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Have you been punished/warned for misconduct?</label>
                <input type="text" name="misconduct" placeholder="If yes, give details. If no, type 'No'" required value={formData.misconduct} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Are you a recipient of a Mahapola/Bursary/Any other student grant?</label>
                <select name="isMahapolaRecipient" value={formData.isMahapolaRecipient} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
            {formData.isMahapolaRecipient === 'yes' && (
                <div className="mt-4 animate-fade-in">
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">If Yes, please state amount (per Month) (Rs.)</label>
                    <input type="number" name="bursaryAmount" value={formData.bursaryAmount} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                </div>
            )}
          </div>

          {/* ... Remaining sections ... */}
           {/* --- SECTION 4: FAMILY & INCOME --- */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">4. Family & Income</h2>
            {/* MOTHER */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300">Mother</h3>
                    <label className="text-sm dark:text-slate-400 flex items-center gap-2">
                        Alive?
                        <select name="motherAlive" value={formData.motherAlive} onChange={handleChange} className="p-1 border rounded text-xs"><option value="yes">Yes</option><option value="no">No</option></select>
                    </label>
                </div>
                {formData.motherAlive === 'yes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="motherName" placeholder="Name" value={formData.motherName} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        <input name="motherAge" placeholder="Age" type="number" value={formData.motherAge} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        <input name="motherOccupation" placeholder="Occupation" value={formData.motherOccupation} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        <input name="motherIncome" placeholder="Monthly Income (Rs.)" type="number" value={formData.motherIncome} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                    </div>
                )}
            </div>
            {/* FATHER */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300">Father</h3>
                    <label className="text-sm dark:text-slate-400 flex items-center gap-2">
                        Alive?
                        <select name="fatherAlive" value={formData.fatherAlive} onChange={handleChange} className="p-1 border rounded text-xs"><option value="yes">Yes</option><option value="no">No</option></select>
                    </label>
                </div>
                {formData.fatherAlive === 'yes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="fatherName" placeholder="Name" value={formData.fatherName} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        <input name="fatherAge" placeholder="Age" type="number" value={formData.fatherAge} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        <input name="fatherOccupation" placeholder="Occupation" value={formData.fatherOccupation} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                        <input name="fatherIncome" placeholder="Monthly Income (Rs.)" type="number" value={formData.fatherIncome} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                    </div>
                )}
            </div>
            {/* GUARDIAN */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Guardian (if applicable)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="guardianName" placeholder="Name" value={formData.guardianName} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                    <input name="guardianAge" placeholder="Age" type="number" value={formData.guardianAge} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                    <input name="guardianOccupation" placeholder="Occupation" value={formData.guardianOccupation} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                    <input name="guardianIncome" placeholder="Monthly Income (Rs.)" type="number" value={formData.guardianIncome} onChange={handleChange} className="p-2 border rounded dark:bg-slate-800 dark:border-slate-600" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Annual Family Income Range</label>
                    <select name="incomeRange" value={formData.incomeRange} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <option value="below_100k">100,000 or below</option>
                        <option value="100k_150k">100,000 - 150,000</option>
                        <option value="150k_200k">150,000 - 200,000</option>
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
            <FileInput name="file_income" label="Salary Statement / Income Cert" required />
            {(formData.motherAlive === 'no' || formData.fatherAlive === 'no') && <FileInput name="file_parentDeath" label="Death Certificate(s)" required />}
            {formData.isSamurdhiRecipient === 'yes' && <FileInput name="file_samurdhi" label="Copy of Samurdhi Card" required />}
          </div>

          {/* --- SECTION 5: SIBLINGS --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">5. Siblings (Students)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Siblings in School</label>
                    <select name="siblingsSchool" value={formData.siblingsSchool} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"><option value="0">None</option><option value="1">1</option><option value="2">2</option><option value="3">3 or more</option></select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Siblings in University</label>
                    <select name="siblingsUni" value={formData.siblingsUni} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"><option value="0">None</option><option value="1">1</option><option value="2">2</option><option value="3">3 or more</option></select>
                 </div>
            </div>
            {totalSiblings > 0 && (
                <div className="space-y-4 mb-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                    <p className="text-sm font-bold text-slate-500 uppercase">Sibling Details</p>
                    {[...Array(Math.min(3, totalSiblings))].map((_, i) => (
                        <div key={i} className="grid grid-cols-3 gap-2">
                             <input name={`sibling${i+1}Name`} placeholder={`Sibling ${i+1} Name`} onChange={handleChange} className="p-2 border rounded text-sm dark:bg-slate-800 dark:border-slate-600" />
                             <select name={`sibling${i+1}Type`} onChange={handleChange} className="p-2 border rounded text-sm dark:bg-slate-800 dark:border-slate-600"><option value="School">School</option><option value="University">University</option></select>
                             <input name={`sibling${i+1}Info`} placeholder="Grade / Year" onChange={handleChange} className="p-2 border rounded text-sm dark:bg-slate-800 dark:border-slate-600" />
                        </div>
                    ))}
                </div>
            )}
            {(totalSiblings > 0) && <FileInput name="file_siblings" label="Student Letters (Principal/Registrar)" required />}
          </div>

          {/* --- SECTION 6: EMERGENCY CONTACT --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">6. Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="emergencyName" placeholder="Name" required value={formData.emergencyName} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600" />
                <input name="emergencyAddress" placeholder="Address" required value={formData.emergencyAddress} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600" />
                <input name="emergencyMobile" placeholder="Mobile No" required value={formData.emergencyMobile} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600" />
                <input name="emergencyResidence" placeholder="Residence No" value={formData.emergencyResidence} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600" />
            </div>
          </div>

          {/* --- SECTION 7: SPORTS --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">7. Sports Activities</h2>
            <div className="space-y-4">
                <div className="p-3 border rounded dark:border-slate-600">
                    <label className="flex items-center gap-2 font-medium dark:text-slate-300 mb-2">
                        <input type="checkbox" checked={formData.isCaptain === 'yes'} onChange={e => setFormData({...formData, isCaptain: e.target.checked ? 'yes' : 'no'})} /> Are you a University Team Captain?
                    </label>
                    {formData.isCaptain === 'yes' && (
                        <div className="grid grid-cols-2 gap-4 pl-6">
                            <input name="captainTeam" placeholder="Team Name" onChange={handleChange} className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-600" />
                            <input name="captainYear" placeholder="Academic Year" onChange={handleChange} className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-600" />
                        </div>
                    )}
                </div>
                <div className="p-3 border rounded dark:border-slate-600">
                    <label className="flex items-center gap-2 font-medium dark:text-slate-300 mb-2">
                        <input type="checkbox" checked={formData.isMember === 'yes'} onChange={e => setFormData({...formData, isMember: e.target.checked ? 'yes' : 'no'})} /> Are you a University Team Member?
                    </label>
                    {formData.isMember === 'yes' && (
                        <div className="grid grid-cols-2 gap-4 pl-6">
                            <input name="memberTeam" placeholder="Team Name" onChange={handleChange} className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-600" />
                            <input name="memberYear" placeholder="Academic Year" onChange={handleChange} className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-600" />
                        </div>
                    )}
                </div>
                <div className="p-3 border rounded dark:border-slate-600">
                     <label className="flex items-center gap-2 font-medium dark:text-slate-300">
                        <input type="checkbox" checked={formData.hasColours === 'yes'} onChange={e => setFormData({...formData, hasColours: e.target.checked ? 'yes' : 'no'})} /> Have you won any University Colors?
                    </label>
                </div>
                {(formData.isCaptain === 'yes' || formData.isMember === 'yes' || formData.hasColours === 'yes') && <FileInput name="file_sports" label="Sports Certificates" required />}
            </div>
          </div>

          {/* --- SECTION 8: SUBMISSION --- */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">8. Final Submission</h2>
            <div className="mb-4">
                 <label className="block text-sm font-medium mb-1 dark:text-slate-300">Special Reasons (Optional)</label>
                 <textarea name="specialReasons" value={formData.specialReasons} onChange={handleChange} rows="3" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"></textarea>
                 {formData.specialReasons && <FileInput name="file_special" label="Supporting Documents" />}
            </div>
            <div className="mb-6">
               <label className="block text-sm font-medium mb-1 dark:text-slate-300">Preferred Hostel</label>
               <select name="hostelPref" value={formData.hostelPref} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                  <option value="">-- Select Preference --</option>
                  {hostelOptionsLoading && <option disabled>Loading hostels...</option>}
                  {!hostelOptionsLoading && hostelOptions.length === 0 && (
                    <option disabled>No hostels available</option>
                  )}
                  {hostelOptions.map(hostel => (
                    <option key={hostel} value={hostel}>{hostel}</option>
                  ))}
               </select>
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StudentApplication;