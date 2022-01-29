const WashDishes = (organisation_id, frequency = null, preferred_time = 9) => ({
  title: 'Wash dishes',
  frequency,
  organisation_id,
  preferred_time,
});

const CleanToilet = (organisation_id, frequency = null, preferred_time = 9) => ({
  title: 'Clean toilet',
  frequency: frequency || 168,
  organisation_id,
  preferred_time,
});

const HooverHouse = (organisation_id, frequency = null, preferred_time = 9) => ({
  title: 'Hoover house',
  frequency: frequency || 96,
  organisation_id,
  preferred_time,
});

const WeeklyRevision = (organisation_id, frequency = null, preferred_time = 9) => ({
  title: 'Weekly revision',
  frequency: frequency || 168,
  organisation_id,
  preferred_time,
});

const CallAssociates = (organisation_id, frequency = null, preferred_time = 9) => ({
  title: 'Call associates',
  frequency,
  organisation_id,
  preferred_time,
});

const LeadClientMeeting = (organisation_id, frequency = null, preferred_time = 9) => ({
  title: 'Lead client meeting',
  frequency,
  organisation_id,
  preferred_time,
});

module.exports = { CallAssociates, CleanToilet, HooverHouse, LeadClientMeeting, WashDishes, WeeklyRevision };
