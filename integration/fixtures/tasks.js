const WashDishes = organisation_id => ({
  title: 'Wash dishes',
  frequency: null,
  organisation_id,
});

const CleanToilet = organisation_id => ({
  title: 'Clean toilet',
  frequency: 7,
  organisation_id,
});

const HooverHouse = organisation_id => ({
  title: 'Hoover house',
  frequency: 4,
  organisation_id,
});

const WeeklyRevision = organisation_id => ({
  title: 'Weekly revision',
  frequency: 7,
  organisation_id,
});

const CallAssociates = organisation_id => ({
  title: 'Call associates',
  frequency: null,
  organisation_id,
});

const LeadClientMeeting = organisation_id => ({
  title: 'Lead client meeting',
  frequency: null,
  organisation_id,
});

module.exports = { CallAssociates, CleanToilet, HooverHouse, LeadClientMeeting, WashDishes, WeeklyRevision };
