const db = require('../config/db');

const findByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT id, user_id, status, points, submission_date, full_name, index_number, email,
            gender, mobile_phone, district, closest_town, distance_to_town, distance,
            faculty, department, year, misconduct, is_mahapola_recipient, bursary_amount,
            income_range, is_samurdhi_recipient, mother_alive, father_alive, siblings_school,
            siblings_uni, is_captain, is_member, member_team, has_colours, hostel_pref,
            emergency_name, emergency_mobile, emergency_address, file_residence, file_income,
            file_siblings, file_samurdhi, file_sports
     FROM applications WHERE user_id = ?`,
    [userId]
  );
  return rows[0] || null;
};

const findAll = async () => {
  const [rows] = await db.query(
    `SELECT a.id, a.user_id, a.status, a.points, a.submission_date, a.full_name, a.index_number, a.email,
            a.gender, a.mobile_phone, a.district, a.closest_town, a.distance_to_town, a.distance,
            a.faculty, a.department, a.year, u.name AS studentName, u.email AS studentEmail
     FROM applications a
     JOIN users u ON u.id = a.user_id
     ORDER BY a.points DESC`
  );
  return rows;
};

const upsert = async (application) => {
  const existing = await findByUserId(application.userId);
  if (existing) {
    await db.query(
      `UPDATE applications SET
        status = ?, points = ?, submission_date = ?, full_name = ?, index_number = ?, permanent_address = ?,
        email = ?, gender = ?, mobile_phone = ?, district = ?, closest_town = ?, distance_to_town = ?, distance = ?,
        faculty = ?, department = ?, year = ?, misconduct = ?, is_mahapola_recipient = ?, bursary_amount = ?,
        income_range = ?, is_samurdhi_recipient = ?, mother_alive = ?, father_alive = ?, siblings_school = ?,
        siblings_uni = ?, is_captain = ?, is_member = ?, member_team = ?, has_colours = ?, hostel_pref = ?,
        emergency_name = ?, emergency_mobile = ?, emergency_address = ?, file_residence = ?, file_income = ?,
        file_siblings = ?, file_samurdhi = ?, file_sports = ?
       WHERE user_id = ?`,
      [
        application.status,
        application.points,
        application.submissionDate,
        application.fullName,
        application.indexNumber,
        application.permanentAddress,
        application.email,
        application.gender,
        application.mobilePhone,
        application.district,
        application.closestTown,
        application.distanceToTown,
        application.distance,
        application.faculty,
        application.department,
        application.year,
        application.misconduct,
        application.isMahapolaRecipient,
        application.bursaryAmount,
        application.incomeRange,
        application.isSamurdhiRecipient,
        application.motherAlive,
        application.fatherAlive,
        application.siblingsSchool,
        application.siblingsUni,
        application.isCaptain,
        application.isMember,
        application.memberTeam,
        application.hasColours,
        application.hostelPref,
        application.emergencyName,
        application.emergencyMobile,
        application.emergencyAddress,
        application.fileResidence,
        application.fileIncome,
        application.fileSiblings,
        application.fileSamurdhi,
        application.fileSports,
        application.userId
      ]
    );
    return existing.id;
  }

  const [result] = await db.query(
    `INSERT INTO applications (
      user_id, status, points, submission_date, full_name, index_number, permanent_address, email, gender,
      mobile_phone, district, closest_town, distance_to_town, distance, faculty, department, year, misconduct,
      is_mahapola_recipient, bursary_amount, income_range, is_samurdhi_recipient, mother_alive, father_alive,
      siblings_school, siblings_uni, is_captain, is_member, member_team, has_colours, hostel_pref,
      emergency_name, emergency_mobile, emergency_address, file_residence, file_income, file_siblings, file_samurdhi, file_sports
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      application.userId,
      application.status,
      application.points,
      application.submissionDate,
      application.fullName,
      application.indexNumber,
      application.permanentAddress,
      application.email,
      application.gender,
      application.mobilePhone,
      application.district,
      application.closestTown,
      application.distanceToTown,
      application.distance,
      application.faculty,
      application.department,
      application.year,
      application.misconduct,
      application.isMahapolaRecipient,
      application.bursaryAmount,
      application.incomeRange,
      application.isSamurdhiRecipient,
      application.motherAlive,
      application.fatherAlive,
      application.siblingsSchool,
      application.siblingsUni,
      application.isCaptain,
      application.isMember,
      application.memberTeam,
      application.hasColours,
      application.hostelPref,
      application.emergencyName,
      application.emergencyMobile,
      application.emergencyAddress,
      application.fileResidence,
      application.fileIncome,
      application.fileSiblings,
      application.fileSamurdhi,
      application.fileSports
    ]
  );
  return result.insertId;
};

const updateStatus = async (id, status) => {
  await db.query(`UPDATE applications SET status = ? WHERE id = ?`, [status, id]);
};

module.exports = {
  findByUserId,
  findAll,
  upsert,
  updateStatus
};
