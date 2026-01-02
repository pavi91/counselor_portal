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
    // Personal & Academic
    gender: 'male',
    year: 'first_year',
    distance: '',
    
    // Financial
    incomeRange: 'below_100k',
    isMahapolaRecipient: 'no',
    isSamurdhiRecipient: 'no',
    
    // Family
    siblingsSchool: '0',
    siblingsUni: '0',
    parentDisability: 'no',
    motherAlive: 'yes',
    fatherAlive: 'yes',
    guardianAlive: 'no', // Assuming optional if parents alive
    
    // Extra Curricular
    isCaptain: 'no',
    isMember: 'no',
    hasColours: 'no',
    
    // Hostel
    hostelPref: '',
    prevHostel: 'no'
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // Dynamic Hostel Options Logic
  const getHostelOptions = () => {
    const { gender, year } = formData;
    if (gender === 'male') {
      if (year === 'final_year') return ['A Hostel', 'Patuwathawithana Hostel', 'Hostel Village Complex'];
      if (year === 'first_year') return ['First Lane', 'Rahula Mawatha'];
    } else {
      if (year === 'final_year') return ['Nugasewana -1', 'Nugasewana -2'];
      if (year === 'first_year') return ['B Hostel', 'C Hostel'];
    }
    return ['General Hostel']; // Fallback
  };

  if (loading) return <div className="p-8 text-center">Loading status...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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
          
          {/* Section 1: General Info */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-lg font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Academic Year</label>
                <select name="year" value={formData.year} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                  <option value="first_year">First Year</option>
                  <option value="final_year">Final Year</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Distance from Residence (km)</label>
                <input type="number" name="distance" required min="0" value={formData.distance} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" placeholder="e.g. 150" />
                <p className="text-xs text-slate-500 mt-1">0-29km (0 pts) to 200km+ (50 pts)</p>
              </div>
            </div>
          </div>

          {/* Section 2: Financial */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-lg font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">Financial Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Annual Family Income</label>
                <select name="incomeRange" value={formData.incomeRange} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                  <option value="below_100k">100,000 or below (25 pts)</option>
                  <option value="100k_150k">100,000 - 150,000 (23 pts)</option>
                  <option value="150k_200k">150,000 - 200,000 (20 pts)</option>
                  <option value="200k_250k">200,000 - 250,000 (17 pts)</option>
                  <option value="250k_300k">250,000 - 300,000 (14 pts)</option>
                  <option value="300k_350k">300,000 - 350,000 (11 pts)</option>
                  <option value="350k_400k">350,000 - 400,000 (8 pts)</option>
                  <option value="400k_450k">400,000 - 450,000 (5 pts)</option>
                  <option value="above_450k">450,000 or above (3 pts)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Mahapola/Bursary Recipient?</label>
                    <select name="isMahapolaRecipient" value={formData.isMahapolaRecipient} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
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
            </div>
          </div>

          {/* Section 3: Family & Siblings */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-lg font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">Family Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Siblings in School</label>
                <select name="siblingsSchool" value={formData.siblingsSchool} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                  <option value="0">None</option>
                  <option value="1">1 (3.5 pts)</option>
                  <option value="2">2 or more (7 pts)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Siblings in University</label>
                <select name="siblingsUni" value={formData.siblingsUni} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                  <option value="0">None</option>
                  <option value="1">1 (5 pts)</option>
                  <option value="2">2 or more (10 pts)</option>
                </select>
              </div>
              
              <div className="col-span-2 space-y-3">
                 <p className="text-sm font-medium dark:text-slate-300">Parents Living Status</p>
                 <div className="flex gap-6">
                    <label className="flex items-center gap-2 dark:text-slate-400"><input type="checkbox" checked={formData.motherAlive === 'yes'} onChange={e => setFormData({...formData, motherAlive: e.target.checked ? 'yes' : 'no'})} /> Mother Living</label>
                    <label className="flex items-center gap-2 dark:text-slate-400"><input type="checkbox" checked={formData.fatherAlive === 'yes'} onChange={e => setFormData({...formData, fatherAlive: e.target.checked ? 'yes' : 'no'})} /> Father Living</label>
                 </div>
              </div>

              <div className="col-span-2">
                 <label className="block text-sm font-medium mb-1 dark:text-slate-300">Parent with Disability/Illness? (5 pts)</label>
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2 dark:text-slate-400"><input type="radio" name="parentDisability" value="yes" checked={formData.parentDisability === 'yes'} onChange={handleChange} /> Yes</label>
                    <label className="flex items-center gap-2 dark:text-slate-400"><input type="radio" name="parentDisability" value="no" checked={formData.parentDisability === 'no'} onChange={handleChange} /> No</label>
                 </div>
              </div>
            </div>
          </div>

          {/* Section 4: Extra Curricular */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-lg font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">Extra Curricular Activities</h2>
            <div className="space-y-3">
                <div className="flex justify-between items-center border-b dark:border-slate-700 pb-2">
                    <span className="dark:text-slate-300">University Team Captain (3 pts)</span>
                    <div className="flex gap-4">
                        <label className="dark:text-slate-400"><input type="radio" name="isCaptain" value="yes" checked={formData.isCaptain === 'yes'} onChange={handleChange} /> Yes</label>
                        <label className="dark:text-slate-400"><input type="radio" name="isCaptain" value="no" checked={formData.isCaptain === 'no'} onChange={handleChange} /> No</label>
                    </div>
                </div>
                <div className="flex justify-between items-center border-b dark:border-slate-700 pb-2">
                    <span className="dark:text-slate-300">University Team Member (2 pts)</span>
                    <div className="flex gap-4">
                        <label className="dark:text-slate-400"><input type="radio" name="isMember" value="yes" checked={formData.isMember === 'yes'} onChange={handleChange} /> Yes</label>
                        <label className="dark:text-slate-400"><input type="radio" name="isMember" value="no" checked={formData.isMember === 'no'} onChange={handleChange} /> No</label>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="dark:text-slate-300">University Colours (5 pts)</span>
                    <div className="flex gap-4">
                        <label className="dark:text-slate-400"><input type="radio" name="hasColours" value="yes" checked={formData.hasColours === 'yes'} onChange={handleChange} /> Yes</label>
                        <label className="dark:text-slate-400"><input type="radio" name="hasColours" value="no" checked={formData.hasColours === 'no'} onChange={handleChange} /> No</label>
                    </div>
                </div>
            </div>
          </div>

          {/* Section 5: Preferences */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
            <h2 className="text-lg font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">Hostel Preference</h2>
            <div>
               <label className="block text-sm font-medium mb-1 dark:text-slate-300">Preferred Hostel</label>
               <select name="hostelPref" value={formData.hostelPref} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                  <option value="">-- Select Preference --</option>
                  {getHostelOptions().map(hostel => (
                     <option key={hostel} value={hostel}>{hostel}</option>
                  ))}
               </select>
            </div>
            {formData.year !== 'first_year' && (
                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Received hostel facilities previously?</label>
                    <div className="flex gap-4 mt-2">
                        <label className="dark:text-slate-400"><input type="radio" name="prevHostel" value="yes" checked={formData.prevHostel === 'yes'} onChange={handleChange} /> Yes</label>
                        <label className="dark:text-slate-400"><input type="radio" name="prevHostel" value="no" checked={formData.prevHostel === 'no'} onChange={handleChange} /> No</label>
                    </div>
                </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {submitting ? 'Calculating Score...' : 'Submit Application'}
          </button>
        </form>
      )}
    </div>
  );
};

export default StudentApplication;