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
    `SELECT a.id,
            a.user_id AS userId,
            a.status,
            a.points,
            a.submission_date AS submissionDate,
            a.full_name AS fullName,
            a.index_number AS indexNumber,
            a.permanent_address AS permanentAddress,
            a.email,
            a.gender,
            a.mobile_phone AS mobilePhone,
            a.district,
            a.closest_town AS closestTown,
            a.distance_to_town AS distanceToTown,
            a.distance,
            a.faculty,
            a.department,
            a.year,
            a.misconduct,
            a.is_mahapola_recipient AS isMahapolaRecipient,
            a.bursary_amount AS bursaryAmount,
            a.income_range AS incomeRange,
            a.is_samurdhi_recipient AS isSamurdhiRecipient,
            a.mother_alive AS motherAlive,
            a.father_alive AS fatherAlive,
            a.siblings_school AS siblingsSchool,
            a.siblings_uni AS siblingsUni,
            a.is_captain AS isCaptain,
            a.is_member AS isMember,
            a.member_team AS memberTeam,
            a.has_colours AS hasColours,
            a.hostel_pref AS hostelPref,
            a.emergency_name AS emergencyName,
            a.emergency_mobile AS emergencyMobile,
            a.emergency_address AS emergencyAddress,
            a.file_residence AS fileResidence,
            a.file_income AS fileIncome,
            a.file_siblings AS fileSiblings,
            a.file_samurdhi AS fileSamurdhi,
            a.file_sports AS fileSports,
            u.name AS studentName,
            u.email AS studentEmail
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

const deleteByUserId = async (userId) => {
  const [result] = await db.query(`DELETE FROM applications WHERE user_id = ?`, [userId]);
  return result.affectedRows || 0;
};

module.exports = {
  findByUserId,
  findAll,
  upsert,
  updateStatus,
  deleteByUserId
};
